import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { PlayIcon, Book02Icon, StarIcon } from '@hugeicons/core-free-icons';

export interface InsightStory {
  id: number;
  title: string;
  label: string;
  color: string;
  icon: React.ReactNode;
  content: {
    subtitle: string;
    description: string;
    tips: string[];
    deepDive?: {
      title: string;
      body: string;
    };
  };
}

export const INSIGHTS_DATA: InsightStory[] = [
  { 
    id: 1, 
    title: '식단 꿀팁', 
    label: '마라탕 건강하게 즐기기', 
    color: 'bg-warm-100 text-warm-600', 
    icon: '🔥',
    content: {
      subtitle: '혈당 스파이크 방지 가이드',
      description: '마라탕은 재료 선택이 핵심이에요. 당면보다는 채소와 단백질 위주로 담아보세요!',
      tips: ['옥수수면/분모자 대신 푸주와 건두부 담기', '사골 육수보다는 투명한 육수 선택하기', '함께 먹는 공기밥은 평소보다 반으로 줄이기'],
      deepDive: {
        title: '마라탕, 왜 혈당이 급격히 오를까요?',
        body: `마라탕의 주재료인 옥수수면, 분모자, 당면은 탄수화물 함량이 매우 높고 흡수가 빠릅니다. 또한 국물에 포함된 나트륨은 혈당 조절에 부정적인 영향을 줄 수 있습니다.\n\n해결책은 '거꾸로 식사법'입니다. 먼저 청경채, 숙주, 버섯 등 식이섬유가 풍부한 채소를 먼저 충분히 드신 후, 소고기나 양고기 같은 단백질을 섭취하세요. 탄수화물인 면이나 밥은 마지막에 아주 조금만 곁들이는 것이 혈당 스파이크를 막는 가장 좋은 방법입니다.`
      }
    }
  },
  { 
    id: 2, 
    title: '전문가 조언', 
    label: '운동 전 혈당 관리법', 
    color: 'bg-brand-100 text-brand-600', 
    icon: <HugeiconsIcon icon={PlayIcon} size={14} />,
    content: {
      subtitle: '안전한 운동 시간대 추천',
      description: '운동 전 혈당이 100-150 사이에 있을 때가 가장 안전하고 효율적입니다.',
      tips: ['식후 1-2시간 뒤에 운동 시작하기', '저혈당 대비용 사탕이나 포도당 캔디 지참', '수분 섭취는 평소보다 1.5배 더 자주 하기'],
      deepDive: {
        title: '운동과 인슐린의 관계',
        body: `운동을 하면 근육이 혈액 속의 당을 에너지로 활발하게 사용하게 됩니다. 이때 평소와 같은 양의 인슐린이 작용하고 있다면 저혈당의 위험이 높아질 수 있습니다.\n\n격렬한 유산소 운동(달리기, 수영 등) 전에는 인슐린 용량을 미세하게 조절하거나 소량의 탄수화물을 미리 섭취하는 것이 권장됩니다. 운동 중 30분마다 혈당을 체크하는 습관을 들이는 것이 가장 안전합니다.`
      }
    }
  },
  { 
    id: 3, 
    title: '환우 이야기', 
    label: '나의 1형 당뇨 적응기', 
    color: 'bg-soft-purple text-brand-800', 
    icon: <HugeiconsIcon icon={StarIcon} size={14} />,
    content: {
      subtitle: '동기 부여 인터뷰',
      description: '처음엔 막막했지만, 기록을 놀이처럼 생각하니 마음이 편해졌어요.',
      tips: ['기록을 숙제가 아닌 일기로 생각하기', '스스로에게 매일 작은 보상 해주기', '가족과 결과를 공유하며 응원 받기'],
      deepDive: {
        title: '심리적 번아웃 극복하기',
        body: `평생 혈당을 관리해야 한다는 압박감은 때때로 번아웃을 부릅니다. 이럴 때는 완벽함보다는 '지속 가능성'에 집중하세요.\n\n하루 정도는 목표 수치에서 조금 벗어나더라도 자책하지 마세요. 대신 내가 왜 좋아하는 음식을 먹었는지, 그때 기분은 어땠는지 기록하며 자신을 이해하는 시간을 가져보세요. 안티그래비티는 당신의 완벽한 수치가 아니라, 당신의 꾸준한 여정을 응원합니다.`
      }
    }
  },
  { 
    id: 4, 
    title: '레시피', 
    label: '저당 치즈 케이크 만들기', 
    color: 'bg-soft-green text-green-700', 
    icon: <HugeiconsIcon icon={Book02Icon} size={14} />,
    content: {
      subtitle: '홈베이킹 저당 버전',
      description: '설탕 대신 스테비아를 사용해 칼로리와 당을 획기적으로 낮춘 레시피입니다.',
      tips: ['설탕 대신 에리스리톨/스테비아 사용', '통밀가루나 아몬드 가루로 탄수화물 대체', '필라델피아 크림치즈의 라이트 버전 활용'],
      deepDive: {
        title: '대체 감미료, 조심할 점은?',
        body: `에리스리톨이나 알룰로스 같은 대체 감미료는 혈당을 거의 올리지 않으면서도 단맛을 줍니다. 하지만 너무 많이 섭취할 경우 복부 팽만감이나 설사를 유발할 수 있습니다.\n\n또한 '무설탕' 제품이라고 해서 탄수화물이 아예 없는 것은 아니니 베이킹에 사용하는 가루(아몬드 가루 등)의 탄수화물 함량도 반드시 계산하여 인슐린을 조절해야 합니다.`
      }
    }
  },
];
