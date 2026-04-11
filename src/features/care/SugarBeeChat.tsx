import React, { useState, useEffect, useRef } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Cancel01Icon, 
  SentIcon, 
  CustomerService01Icon,
  SparklesIcon,
  Message01Icon
} from '@hugeicons/core-free-icons';
import { twMerge } from 'tailwind-merge';

interface Message {
  id: string;
  text: string;
  sender: 'bee' | 'user';
  timestamp: number;
}

export const SugarBeeChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: '안녕! 나는 당비야. 🥗 오늘 식사나 혈당에 대해 궁금한 게 있어?', sender: 'bee', timestamp: Date.now() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');

    // Simulate Bee response
    setTimeout(() => {
      const beeMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: getBeeResponse(userMsg.text),
        sender: 'bee',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, beeMsg]);
    }, 1000);
  };

  const getBeeResponse = (text: string) => {
    if (text.includes('배고파')) return '배가 고프구나! 저당 간식이나 견과류를 조금 챙겨 먹는 건 어떨까? 혈당도 체크해보자! 🥜';
    if (text.includes('고마워')) return '나야말로 사용자님과 대화해서 기분 좋아! 오늘도 화이팅이야! 🌻';
    if (text.includes('피곤해')) return '오늘 하루가 조금 힘들었나봐. 가벼운 스트레칭을 하거나 따뜻한 차 한 잔 어때? 🍵';
    return '응응, 듣고 있어! 사용자님의 건강을 내가 항상 응원하고 있는 거 알지? 궁금한 건 언제든 물어봐! ✨';
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-[110px] right-6 w-16 h-16 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full shadow-lg shadow-brand-500/40 flex items-center justify-center z-[60] active:scale-95 transition-all animate-bounce-slow border-4 border-white"
        >
          <HugeiconsIcon icon={CustomerService01Icon} size={32} color="white" strokeWidth={2.5} />
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-warm-500 rounded-full border-2 border-white flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
          </div>
        </button>
      )}

      {/* Chat Windows */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-white animate-in zoom-in-95 fade-in duration-300">
          {/* Header */}
          <div className="p-6 pt-12 bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-between text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-[28px]">
                🐝
              </div>
              <div>
                <h3 className="text-[18px] font-black">당신을 위한 당비(Sugar-Bee)</h3>
                <div className="flex items-center gap-1.5 text-[11px] font-black opacity-80 uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  오늘의 건강 파트너
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="bg-white/10 p-3 rounded-2xl hover:bg-white/20 active:scale-90 transition-all relative z-10">
              <HugeiconsIcon icon={Cancel01Icon} size={24} strokeWidth={2.5} />
            </button>
          </div>

          {/* Messages */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 bg-soft-blue/20"
          >
            {messages.map((msg) => (
              <div key={msg.id} className={twMerge(
                "flex flex-col animate-in slide-in-from-bottom-2 duration-300",
                msg.sender === 'user' ? "items-end" : "items-start"
              )}>
                <div className={twMerge(
                  "max-w-[85%] px-5 py-4 text-[15px] font-bold leading-relaxed shadow-soft",
                  msg.sender === 'user' 
                    ? "bg-brand-500 text-white rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-lg" 
                    : "bg-white text-text-main rounded-tl-3xl rounded-tr-3xl rounded-br-3xl rounded-bl-lg border border-slate-50"
                )}>
                  {msg.text}
                </div>
                <span className="text-[11px] text-text-muted mt-2 px-1 font-bold">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-6 pb-10 bg-white border-t border-slate-50 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
            <div className="flex gap-3">
              <div className="flex-1 bg-slate-50/80 rounded-3xl flex items-center px-5 border border-slate-100 focus-within:ring-4 focus-within:ring-brand-50 focus-within:bg-white transition-all group">
                <input 
                  type="text" 
                  placeholder="당비와 대화하기..."
                  className="flex-1 bg-transparent py-4 text-[15px] font-bold outline-none"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <HugeiconsIcon icon={Message01Icon} size={22} className="text-slate-300 group-focus-within:text-brand-400" />
              </div>
              <button 
                onClick={handleSend}
                className="w-14 h-14 bg-brand-500 rounded-3xl flex items-center justify-center shadow-lg shadow-brand-500/30 active:scale-90 transition-all text-white disabled:bg-slate-200 disabled:shadow-none"
                disabled={!inputValue.trim()}
              >
                <HugeiconsIcon icon={SentIcon} size={24} strokeWidth={2.5} />
              </button>
            </div>
            
            {/* Quick Actions */}
            <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar pb-1">
              {['배고파', '오늘 어때?', '힘들어', '고마워'].map(tag => (
                <button 
                  key={tag}
                  onClick={() => setInputValue(tag)}
                  className="whitespace-nowrap bg-brand-50 text-brand-600 text-[12px] font-black px-4 py-2 rounded-xl hover:bg-brand-100 transition-colors border border-brand-100/50"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
