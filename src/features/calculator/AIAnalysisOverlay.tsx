import React, { useState, useEffect, useRef } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Cancel01Icon, 
  Camera01Icon, 
  CheckmarkBadge01Icon,
  AiChat02Icon,
  ZapIcon,
  PlusSignIcon,
  MinusSignIcon,
  InformationCircleIcon,
  Files01Icon,
  FloppyDiskIcon,
  Note01Icon,
  ArrowRight01Icon,
  ReloadIcon,
  FlashIcon
} from '@hugeicons/core-free-icons';
import { Food } from '../../types';
import { twMerge } from 'tailwind-merge';
import { useCustomFoodStore } from '../../store/useCustomFoodStore';
import { getGeminiService } from '../../services/geminiService';

interface AIAnalysisOverlayProps {
  onClose: () => void;
  onAddFoods: (foods: Food[]) => void;
}

type Step = 'mode_select' | 'capture' | 'processing' | 'review';
type AnalysisMode = 'food' | 'label';

export const AIAnalysisOverlay: React.FC<AIAnalysisOverlayProps> = ({ onClose, onAddFoods }) => {
  const [step, setStep] = useState<Step>('mode_select');
  const [mode, setMode] = useState<AnalysisMode>('food');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [detectedItems, setDetectedItems] = useState<any[]>([]);
  const [labelData, setLabelData] = useState<any>(null);
  const [aiAdvice, setAiAdvice] = useState('');
  const [servingCount, setServingCount] = useState(1);
  const [userContext, setUserContext] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveToMyFoods, setSaveToMyFoods] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addCustomFood } = useCustomFoodStore();

  const totalCarbs = mode === 'food' 
    ? detectedItems.reduce((acc, item) => acc + item.carbs, 0)
    : (labelData?.totalCarbs || 0) * servingCount;

  // 카메라 스트림 시작
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // 비디오 재생 보장
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(e => console.error("Video play failed:", e));
        };
        setCameraActive(true);
        setError(null);
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setError("카메라 권한이 필요합니다. 설정에서 허용해 주세요.");
      setCameraActive(false);
    }
  };

  // 스트림 중지
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  useEffect(() => {
    if (step === 'capture') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [step]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL('image/jpeg');
      setCapturedImage(base64);
      runAIAnalysis(base64);
    }
  };

  // 파일 업로드 폴백
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setCapturedImage(base64);
      runAIAnalysis(base64);
    };
    reader.readAsDataURL(file);
  };

  const runAIAnalysis = async (image: string) => {
    setStep('processing');
    setIsProcessing(true);
    
    try {
      const service = getGeminiService();
      const result = await service.analyzeImage(image, mode, userContext);
      
      if (mode === 'food') {
        setDetectedItems(result.items || []);
        setAiAdvice(result.advice || '');
      } else {
        setLabelData(result);
        setAiAdvice(result.advice || '');
      }
      setStep('review');
    } catch (err: any) {
      setError(err.message || "분석에 실패했습니다.");
      setStep('capture');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateAmount = (id: string, delta: number) => {
    setDetectedItems(prev => prev.map(item => {
      if (item.id === id) {
        const newAmount = Math.max(10, item.amount + delta);
        const ratio = newAmount / item.amount;
        return { ...item, amount: newAmount, carbs: Math.round(item.carbs * ratio) };
      }
      return item;
    }));
  };

  const handleComplete = () => {
    const newFoods: Food[] = mode === 'food' 
      ? detectedItems.map(item => ({
          id: `ai_${Date.now()}_${item.id}`,
          name: item.name,
          emoji: item.icon || '🍴',
          carbPer: item.carbs,
          baseAmount: 1,
          unit: item.unit || '인분',
          cat: 'ai',
          note: `AI 분석 결과 (${item.amount}${item.unit})${userContext ? ` · ${userContext}` : ''}`
        }))
      : [{
          id: `ai_label_${Date.now()}`,
          name: labelData?.productName || '가공식품',
          emoji: '📦',
          carbPer: labelData?.totalCarbs || 0,
          baseAmount: 1,
          unit: labelData?.servingUnit || '인분',
          cat: 'ai',
          note: `영양성분표 분석 결과 (당류 ${labelData?.sugars || 0}g)${userContext ? ` · ${userContext}` : ''}`
        }];

    if (saveToMyFoods) {
      newFoods.forEach(food => {
        addCustomFood({
          name: food.name,
          emoji: food.emoji,
          carbPer: food.carbPer,
          baseAmount: food.baseAmount,
          unit: food.unit,
          cat: 'custom',
          note: food.note
        });
      });
    }

    onAddFoods(newFoods.map(f => ({ ...f, count: mode === 'label' ? servingCount : 1 })));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-white flex flex-col overflow-hidden animate-in fade-in duration-300">
      <canvas ref={canvasRef} className="hidden" />
      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />

      {/* 상단 헤더 */}
      <div className="px-6 pt-12 pb-6 flex items-center justify-between text-text-main bg-white/80 backdrop-blur-md border-b border-slate-50 sticky top-0 z-50">
        <button onClick={onClose} className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center active:scale-90 transition-all">
          <HugeiconsIcon icon={Cancel01Icon} size={20} className="text-text-sub" />
        </button>
        <h2 className="text-[17px] font-black tracking-tight">
          {step === 'mode_select' ? '분석 방식 선택' : mode === 'food' ? '음식 사진 분석' : '영양정보 분석'}
        </h2>
        <div className="w-10"></div>
      </div>

      {step === 'mode_select' && (
        <div className="flex-1 p-8 flex flex-col justify-center gap-6 bg-slate-50 overflow-y-auto">
          <div className="text-center mb-10">
            <h3 className="text-[24px] font-black text-text-main mb-3 leading-tight">어떻게 분석할까요?</h3>
            <p className="text-text-muted font-bold text-[14px]">상황에 맞는 분석 방식을 선택해 주세요</p>
          </div>

          <button 
            onClick={() => { setMode('food'); setStep('capture'); }}
            className="group bg-white p-8 rounded-[40px] shadow-premium border border-slate-100 flex flex-col items-center gap-4 active:scale-95 transition-all hover:border-brand-300"
          >
            <div className="w-20 h-20 rounded-3xl bg-brand-50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <HugeiconsIcon icon={Camera01Icon} size={40} className="text-brand-500" />
            </div>
            <div className="text-center">
              <div className="font-black text-text-main text-[18px] mb-1">실시간 음식 분석</div>
              <div className="text-text-muted text-[13px] font-bold">카메라로 식탁 위의 음식을 바로 분석합니다</div>
            </div>
          </button>

          <button 
            onClick={() => { setMode('label'); setStep('capture'); }}
            className="group bg-white p-8 rounded-[40px] shadow-premium border border-slate-100 flex flex-col items-center gap-4 active:scale-95 transition-all hover:border-brand-300"
          >
            <div className="w-20 h-20 rounded-3xl bg-soft-blue/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <HugeiconsIcon icon={Files01Icon} size={40} className="text-soft-blue" />
            </div>
            <div className="text-center">
              <div className="font-black text-text-main text-[18px] mb-1">영양성분표 OCR</div>
              <div className="text-text-muted text-[13px] font-bold">가공식품의 영양 정보를 텍스트로 읽습니다</div>
            </div>
          </button>
        </div>
      )}

      {step === 'capture' && (
        <div className="flex-1 flex flex-col relative overflow-hidden bg-black">
          {/* 실시간 비디오 영역 */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            {cameraActive ? (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-white/40 flex flex-col items-center gap-4">
                <HugeiconsIcon icon={Camera01Icon} size={48} />
                <p className="text-[13px] font-bold">{error || '카메라를 준비 중입니다...'}</p>
              </div>
            )}
            
            {/* 가이드 오버레이 */}
            <div className={twMerge(
              "absolute border-2 border-white/40 rounded-[40px] pointer-events-none transition-all duration-700",
              mode === 'food' ? "w-72 h-72" : "w-80 h-48"
            )}>
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-brand-500 rounded-tl-3xl -ml-1 -mt-1"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-brand-500 rounded-tr-3xl -mr-1 -mt-1"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-brand-500 rounded-bl-3xl -ml-1 -mb-1"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-brand-500 rounded-br-3xl -mr-1 -mb-1"></div>
            </div>
          </div>

          <div className="mt-auto p-12 flex flex-col items-center gap-8 bg-gradient-to-t from-black/80 to-transparent relative z-10">
            <div className="flex items-center gap-12">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/60 active:scale-90 transition-all"
              >
                <HugeiconsIcon icon={FloppyDiskIcon} size={20} />
              </button>
              
              <button 
                onClick={handleCapture}
                disabled={!cameraActive}
                className="w-20 h-20 bg-white rounded-full flex items-center justify-center active:scale-90 transition-transform shadow-2xl shadow-white/20 disabled:opacity-50"
              >
                <div className="w-16 h-16 border-4 border-slate-900 rounded-full"></div>
              </button>

              <button 
                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/60 active:scale-90 transition-all"
              >
                <HugeiconsIcon icon={FlashIcon} size={20} />
              </button>
            </div>
            <p className="text-white/60 font-bold text-[12px]">화면 중앙에 음식을 맞춰 촬영해 주세요</p>
          </div>
        </div>
      )}

      {step === 'processing' && (
        <div className="flex-1 flex flex-col items-center justify-center bg-white p-12 text-center animate-in fade-in duration-500">
          <div className="relative mb-10">
            <div className="w-24 h-24 bg-brand-50 rounded-full flex items-center justify-center">
              <HugeiconsIcon icon={ZapIcon} size={40} className="text-brand-500 animate-pulse" />
            </div>
            <div className="absolute inset-0 border-4 border-brand-500/20 rounded-full border-t-brand-500 animate-spin"></div>
          </div>
          <h3 className="text-[22px] font-black text-text-main mb-3">AI가 사진을 정밀 분석 중입니다</h3>
          <p className="text-text-muted font-bold text-[14px] leading-relaxed">
            {mode === 'food' ? '재료의 종류와 칼로리를 계산하고 있어요' : '식품 표기 정보를 디지털화하고 있습니다'} <br />
            잠시만 기다려 주세요!
          </p>
        </div>
      )}

      {step === 'review' && (
        <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden animate-in slide-in-from-bottom-10 duration-700">
          <div className="bg-gradient-to-br from-brand-600 via-brand-500 to-brand-400 p-8 pt-10 rounded-b-[48px] shadow-xl text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
             <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2 opacity-80">
                <HugeiconsIcon icon={AiChat02Icon} size={16} />
                <span className="text-[12px] font-black">AI 분석 결과</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-[36px] font-black">{totalCarbs.toFixed(0)}</span>
                <span className="text-[18px] font-black opacity-80">g 탄수화물</span>
              </div>
              {aiAdvice && <p className="text-[12px] font-bold mt-2 opacity-90 leading-relaxed max-w-[90%]">"{aiAdvice}"</p>}
             </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
            {/* 촬영된 이미지 미리보기 */}
            {capturedImage && (
              <div className="bg-white rounded-[32px] p-2 shadow-premium border border-slate-100 overflow-hidden">
                <img src={capturedImage} alt="Captured" className="w-full h-48 object-cover rounded-[28px]" />
              </div>
            )}

            <div className="bg-white rounded-[32px] p-6 shadow-premium space-y-5 border border-slate-100">
              <div className="flex items-center justify-between px-1">
                <h4 className="text-[15px] font-black text-text-main">
                  {mode === 'food' ? '분석된 재료' : '영양 정보'}
                </h4>
                <button onClick={() => setStep('capture')} className="text-[11px] font-bold text-brand-500 bg-brand-50 px-2.5 py-1.5 rounded-xl flex items-center gap-1">
                  <HugeiconsIcon icon={ReloadIcon} size={12} /> 재촬영
                </button>
              </div>

              {mode === 'food' ? (
                <div className="space-y-4">
                  {detectedItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-4">
                        <span className="text-[26px]">{item.icon || '🍴'}</span>
                        <div>
                          <div className="text-[15px] font-black text-text-main">{item.name}</div>
                          <div className="text-[12px] font-bold text-text-muted">{item.amount}{item.unit}</div>
                        </div>
                      </div>
                      <div className="flex items-center bg-slate-50 rounded-2xl p-1 gap-3 border border-slate-100">
                        <button onClick={() => handleUpdateAmount(item.id, -10)} className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-text-sub shadow-sm">
                          <HugeiconsIcon icon={MinusSignIcon} size={12} strokeWidth={3} />
                        </button>
                        <span className="text-[13px] font-black w-8 text-center">{item.amount}</span>
                        <button onClick={() => handleUpdateAmount(item.id, 10)} className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-brand-500 shadow-sm">
                          <HugeiconsIcon icon={PlusSignIcon} size={12} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {detectedItems.length === 0 && <p className="text-center py-4 text-text-muted text-[13px] font-bold">인식된 재료가 없습니다.</p>}
                </div>
              ) : (
                <div className="space-y-6">
                  {labelData && (
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[24px]">📦</div>
                      <div className="flex-1">
                        <div className="text-[15px] font-black text-text-main">{labelData.productName || '가공식품'}</div>
                        <div className="text-[12px] font-bold text-text-muted">당류 {labelData.sugars}g 포함</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[13px] font-black text-text-sub">섭취 수량 선택</span>
                      <span className="text-brand-500 font-black text-[15px]">{servingCount} {labelData?.servingUnit || '개'}</span>
                    </div>
                    <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                      <button 
                        onClick={() => setServingCount(prev => Math.max(0.5, prev - 0.5))}
                        className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm"
                      >
                        <HugeiconsIcon icon={MinusSignIcon} size={16} strokeWidth={3} />
                      </button>
                      <input 
                        type="range" min="0.5" max="5" step="0.5" value={servingCount} 
                        onChange={(e) => setServingCount(parseFloat(e.target.value))}
                        className="flex-1 accent-brand-500"
                      />
                      <button 
                        onClick={() => setServingCount(prev => Math.min(5, prev + 0.5))}
                        className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm"
                      >
                        <HugeiconsIcon icon={PlusSignIcon} size={16} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-[32px] p-6 shadow-premium space-y-4 border border-slate-100">
              <div className="flex items-center gap-2 px-1">
                <HugeiconsIcon icon={Note01Icon} size={18} className="text-brand-500" />
                <h4 className="text-[15px] font-black text-text-main">AI가 더 고려할 점</h4>
              </div>
              <textarea 
                value={userContext}
                onChange={(e) => setUserContext(e.target.value)}
                placeholder={mode === 'food' ? "예: '아주 맵게 먹어요', '소스는 절반만 넣었어요'" : "예: '절반은 남겼어요', '우유와 함께 먹어요'"}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-[14px] font-bold outline-none focus:ring-2 focus:ring-brand-500/20 focus:bg-white transition-all min-h-[100px]"
              />
            </div>

            <button 
              onClick={() => setSaveToMyFoods(!saveToMyFoods)}
              className={twMerge(
                "w-full p-6 rounded-[32px] border-2 transition-all flex items-center justify-between group",
                saveToMyFoods ? "bg-brand-50 border-brand-500" : "bg-white border-slate-100"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={twMerge(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                  saveToMyFoods ? "bg-brand-500 text-white" : "bg-slate-50 text-text-sub"
                )}>
                  <HugeiconsIcon icon={FloppyDiskIcon} size={20} />
                </div>
                <div className="text-left">
                  <div className={twMerge("text-[15px] font-black", saveToMyFoods ? "text-brand-700" : "text-text-main")}>내 음식 목록에 저장</div>
                  <div className="text-[12px] font-bold text-text-muted">나중에 이 음식을 바로 불러올 수 있어요</div>
                </div>
              </div>
              <div className={twMerge(
                "w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all",
                saveToMyFoods ? "bg-brand-500 border-brand-500 scale-110" : "border-slate-200"
              )}>
                {saveToMyFoods && <HugeiconsIcon icon={CheckmarkBadge01Icon} size={14} color="white" strokeWidth={3} />}
              </div>
            </button>
          </div>

          <div className="p-8 bg-white border-t border-slate-100">
            <button 
              onClick={handleComplete}
              className="w-full py-5 bg-brand-500 text-white rounded-[32px] text-[16px] font-black shadow-xl shadow-brand-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              식사 구성에 반영하기
              <HugeiconsIcon icon={ArrowRight01Icon} size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
