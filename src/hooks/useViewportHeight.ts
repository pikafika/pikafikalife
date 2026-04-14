import { useState, useEffect } from 'react';

/**
 * 모바일 브라우저의 Visual Viewport 변화를 감지하여 하단 오프셋을 계산하는 훅
 * 특히 아이폰 크롬/사파리의 바텀 바 유무에 따라 변하는 높이를 추적합니다.
 */
export const useViewportHeight = () => {
  const [bottomOffset, setBottomOffset] = useState(0);

  useEffect(() => {
    if (!window.visualViewport) return;

    const handleViewportChange = () => {
      // 전체 내부 높이와 현재 눈에 보이는 높이의 차이를 계산
      const viewport = window.visualViewport;
      if (!viewport) return;

      // 브라우저 바텀 바 등이 올라오면 그만큼의 차이를 오프셋으로 설정
      // window.innerHeight 대신 document.documentElement.clientHeight 를 사용하여 
      // 더 정확한 레이아웃 기준점을 잡습니다.
      const offset = window.innerHeight - viewport.height;
      
      // 키보드가 올라온 경우와 바텀 바가 올라온 경우를 구분하기 위해 일정 수치 이상일 때만 적용하거나
      // 혹은 단순히 보이는 영역에 맞게 조정 (0보다 작아지지 않게 처리)
      setBottomOffset(Math.max(0, offset));
      
      // CSS 변수로도 제공하여 전역 스타일에서 활용 가능하게 함
      document.documentElement.style.setProperty('--viewport-bottom-offset', `${Math.max(0, offset)}px`);
    };

    window.visualViewport.addEventListener('resize', handleViewportChange);
    window.visualViewport.addEventListener('scroll', handleViewportChange);

    // 초기 실행
    handleViewportChange();

    return () => {
      window.visualViewport?.removeEventListener('resize', handleViewportChange);
      window.visualViewport?.removeEventListener('scroll', handleViewportChange);
    };
  }, []);

  return bottomOffset;
};
