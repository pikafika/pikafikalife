/**
 * data.js — 한국 음식 탄수화물 데이터베이스
 *
 * 왜 이렇게 구조화했는가:
 * - id: 고유 식별자 (삭제/수정 시 참조)
 * - cat: 카테고리 (필터링용)
 * - emoji: 시각적 인식을 위한 이모지
 * - name: 음식 이름
 * - carbPer: 기준량(baseAmount + baseUnit)당 탄수화물(g)
 * - baseAmount: 기본 1인분 수량
 * - baseUnit: 단위 이름 (공기, 개, g 등)
 * - note: 참고사항 (오류 예방용 정보)
 *
 * 출처: 식품의약품안전처 식품영양성분 DB, 농촌진흥청 국가표준식품성분표 참고
 */
const FOOD_DB = [
  // ──── 밥류 (rice) ────
  {
    id: 'rice_white',
    cat: 'rice',
    emoji: '🍚',
    name: '흰쌀밥 (공기)',
    carbPer: 65,
    baseAmount: 1,
    baseUnit: '공기',
    note: '약 200g 기준'
  },
  {
    id: 'rice_mixed',
    cat: 'rice',
    emoji: '🍱',
    name: '잡곡밥 (공기)',
    carbPer: 60,
    baseAmount: 1,
    baseUnit: '공기',
    note: '약 200g 기준'
  },
  {
    id: 'rice_bibimbap',
    cat: 'rice',
    emoji: '🥗',
    name: '비빔밥',
    carbPer: 85,
    baseAmount: 1,
    baseUnit: '그릇',
    note: '밥+채소+고추장 포함'
  },
  {
    id: 'rice_fried',
    cat: 'rice',
    emoji: '🍳',
    name: '볶음밥',
    carbPer: 70,
    baseAmount: 1,
    baseUnit: '그릇',
    note: '기름진 방식은 GI 낮음'
  },
  {
    id: 'rice_gimbap',
    cat: 'rice',
    emoji: '🍙',
    name: '김밥 (줄)',
    carbPer: 55,
    baseAmount: 1,
    baseUnit: '줄',
    note: '8~9조각 기준'
  },
  {
    id: 'rice_gimbap_piece',
    cat: 'rice',
    emoji: '🍙',
    name: '김밥 (조각)',
    carbPer: 7,
    baseAmount: 1,
    baseUnit: '조각',
    note: '1조각 기준'
  },
  {
    id: 'rice_dosirak',
    cat: 'rice',
    emoji: '🍱',
    name: '도시락 (편의점)',
    carbPer: 75,
    baseAmount: 1,
    baseUnit: '개',
    note: '편의점 일반 도시락 평균'
  },
  {
    id: 'porridge_plain',
    cat: 'rice',
    emoji: '🥣',
    name: '흰죽',
    carbPer: 20,
    baseAmount: 1,
    baseUnit: '그릇',
    note: '200ml 기준'
  },

  // ──── 면류 (noodle) ────
  {
    id: 'noodle_ramyeon',
    cat: 'noodle',
    emoji: '🍜',
    name: '라면',
    carbPer: 75,
    baseAmount: 1,
    baseUnit: '봉지',
    note: '스프 포함'
  },
  {
    id: 'noodle_udon',
    cat: 'noodle',
    emoji: '🍝',
    name: '우동',
    carbPer: 60,
    baseAmount: 1,
    baseUnit: '그릇',
    note: '국물 포함'
  },
  {
    id: 'noodle_jjajang',
    cat: 'noodle',
    emoji: '🍜',
    name: '짜장면',
    carbPer: 90,
    baseAmount: 1,
    baseUnit: '그릇',
    note: '면+소스 포함'
  },
  {
    id: 'noodle_jjampong',
    cat: 'noodle',
    emoji: '🌶️',
    name: '짬뽕',
    carbPer: 75,
    baseAmount: 1,
    baseUnit: '그릇',
    note: '면+국물'
  },
  {
    id: 'noodle_spaghetti',
    cat: 'noodle',
    emoji: '🍝',
    name: '스파게티',
    carbPer: 65,
    baseAmount: 1,
    baseUnit: '그릇',
    note: '토마토소스 기준'
  },
  {
    id: 'noodle_naengmyeon',
    cat: 'noodle',
    emoji: '🍶',
    name: '냉면',
    carbPer: 80,
    baseAmount: 1,
    baseUnit: '그릇',
    note: '물냉면 기준'
  },
  {
    id: 'noodle_somen',
    cat: 'noodle',
    emoji: '🍲',
    name: '소면 (삶은)',
    carbPer: 45,
    baseAmount: 1,
    baseUnit: '인분',
    note: '100g 건면 → 삶으면 약 240g'
  },

  // ──── 분식 (snack) ────
  {
    id: 'snack_tteokbokki',
    cat: 'snack',
    emoji: '🌶️',
    name: '떡볶이',
    carbPer: 50,
    baseAmount: 1,
    baseUnit: '인분',
    note: '200g 기준, 소스 포함'
  },
  {
    id: 'snack_tteok_plain',
    cat: 'snack',
    emoji: '🍡',
    name: '가래떡',
    carbPer: 20,
    baseAmount: 1,
    baseUnit: '개',
    note: '약 50g 1개'
  },
  {
    id: 'snack_hotteok',
    cat: 'snack',
    emoji: '🥞',
    name: '호떡',
    carbPer: 35,
    baseAmount: 1,
    baseUnit: '개',
    note: '설탕 소 포함'
  },
  {
    id: 'snack_mandu',
    cat: 'snack',
    emoji: '🥟',
    name: '만두 (찐)',
    carbPer: 15,
    baseAmount: 1,
    baseUnit: '개',
    note: '돼지고기 만두 기준'
  },
  {
    id: 'snack_sundae',
    cat: 'snack',
    emoji: '🌭',
    name: '순대',
    carbPer: 20,
    baseAmount: 1,
    baseUnit: '인분',
    note: '약 100g 기준'
  },
  {
    id: 'snack_pajeon',
    cat: 'snack',
    emoji: '🥞',
    name: '파전',
    carbPer: 40,
    baseAmount: 1,
    baseUnit: '장',
    note: '중간 크기 1장'
  },
  {
    id: 'snack_odeng',
    cat: 'snack',
    emoji: '🍢',
    name: '어묵 (오뎅)',
    carbPer: 12,
    baseAmount: 1,
    baseUnit: '꼬치',
    note: '한 꼬치 약 50g'
  },
  {
    id: 'snack_twigim',
    cat: 'snack',
    emoji: '🍤',
    name: '튀김 (야채)',
    carbPer: 18,
    baseAmount: 1,
    baseUnit: '개',
    note: '고구마튀김 기준'
  },

  // ──── 빵/과자 (bread) ────
  {
    id: 'bread_toast',
    cat: 'bread',
    emoji: '🍞',
    name: '식빵',
    carbPer: 15,
    baseAmount: 1,
    baseUnit: '장',
    note: '30g 기준 1장'
  },
  {
    id: 'bread_croissant',
    cat: 'bread',
    emoji: '🥐',
    name: '크루아상',
    carbPer: 25,
    baseAmount: 1,
    baseUnit: '개',
    note: '중간 크기'
  },
  {
    id: 'bread_burger',
    cat: 'bread',
    emoji: '🍔',
    name: '햄버거',
    carbPer: 45,
    baseAmount: 1,
    baseUnit: '개',
    note: '일반 버거 기준'
  },
  {
    id: 'bread_hotdog',
    cat: 'bread',
    emoji: '🌭',
    name: '핫도그',
    carbPer: 30,
    baseAmount: 1,
    baseUnit: '개',
    note: '빵+소시지'
  },
  {
    id: 'bread_donut',
    cat: 'bread',
    emoji: '🍩',
    name: '도넛',
    carbPer: 28,
    baseAmount: 1,
    baseUnit: '개',
    note: '설탕 도넛 중간 크기'
  },
  {
    id: 'bread_cake',
    cat: 'bread',
    emoji: '🎂',
    name: '케이크 (조각)',
    carbPer: 42,
    baseAmount: 1,
    baseUnit: '조각',
    note: '생크림 케이크 1/8'
  },
  {
    id: 'bread_cookie',
    cat: 'bread',
    emoji: '🍪',
    name: '쿠키',
    carbPer: 10,
    baseAmount: 1,
    baseUnit: '개',
    note: '초코칩 쿠키 1개 약 15g'
  },
  {
    id: 'bread_cracker',
    cat: 'bread',
    emoji: '🫙',
    name: '크래커',
    carbPer: 8,
    baseAmount: 1,
    baseUnit: '개',
    note: '일반 크래커 1장'
  },
  {
    id: 'bread_chips',
    cat: 'bread',
    emoji: '🥔',
    name: '감자칩',
    carbPer: 25,
    baseAmount: 1,
    baseUnit: '봉지',
    note: '50g 소포장 기준'
  },
  {
    id: 'bread_muffin',
    cat: 'bread',
    emoji: '🧁',
    name: '머핀',
    carbPer: 38,
    baseAmount: 1,
    baseUnit: '개',
    note: '블루베리 머핀 중간'
  },

  // ──── 과일 (fruit) ────
  {
    id: 'fruit_apple',
    cat: 'fruit',
    emoji: '🍎',
    name: '사과',
    carbPer: 20,
    baseAmount: 1,
    baseUnit: '개',
    note: '중간 크기 (200g)'
  },
  {
    id: 'fruit_banana',
    cat: 'fruit',
    emoji: '🍌',
    name: '바나나',
    carbPer: 25,
    baseAmount: 1,
    baseUnit: '개',
    note: '중간 크기 (약 100g 과육)'
  },
  {
    id: 'fruit_orange',
    cat: 'fruit',
    emoji: '🍊',
    name: '귤/오렌지',
    carbPer: 15,
    baseAmount: 1,
    baseUnit: '개',
    note: '중간 크기 귤'
  },
  {
    id: 'fruit_grape',
    cat: 'fruit',
    emoji: '🍇',
    name: '포도',
    carbPer: 20,
    baseAmount: 1,
    baseUnit: '송이',
    note: '중간 크기 1송이'
  },
  {
    id: 'fruit_watermelon',
    cat: 'fruit',
    emoji: '🍉',
    name: '수박',
    carbPer: 12,
    baseAmount: 1,
    baseUnit: '조각',
    note: '중간 조각 약 200g'
  },
  {
    id: 'fruit_strawberry',
    cat: 'fruit',
    emoji: '🍓',
    name: '딸기',
    carbPer: 8,
    baseAmount: 5,
    baseUnit: '개',
    note: '중간 크기 5개'
  },
  {
    id: 'fruit_peach',
    cat: 'fruit',
    emoji: '🍑',
    name: '복숭아',
    carbPer: 18,
    baseAmount: 1,
    baseUnit: '개',
    note: '중간 크기'
  },
  {
    id: 'fruit_mango',
    cat: 'fruit',
    emoji: '🥭',
    name: '망고',
    carbPer: 25,
    baseAmount: 0.5,
    baseUnit: '개',
    note: '1/2개 기준'
  },
  {
    id: 'fruit_melon',
    cat: 'fruit',
    emoji: '🍈',
    name: '멜론',
    carbPer: 15,
    baseAmount: 1,
    baseUnit: '조각',
    note: '중간 조각 약 200g'
  },

  // ──── 음료 (drink) ────
  {
    id: 'drink_juice_orange',
    cat: 'drink',
    emoji: '🥤',
    name: '오렌지주스',
    carbPer: 26,
    baseAmount: 1,
    baseUnit: '컵(250ml)',
    note: '100% 착즙 기준'
  },
  {
    id: 'drink_cola',
    cat: 'drink',
    emoji: '🥤',
    name: '콜라',
    carbPer: 27,
    baseAmount: 1,
    baseUnit: '캔(250ml)',
    note: '일반 콜라 기준'
  },
  {
    id: 'drink_sports',
    cat: 'drink',
    emoji: '💧',
    name: '스포츠 음료',
    carbPer: 15,
    baseAmount: 1,
    baseUnit: '병(500ml)',
    note: '포카리스웨트 류'
  },
  {
    id: 'drink_milk',
    cat: 'drink',
    emoji: '🥛',
    name: '우유',
    carbPer: 12,
    baseAmount: 1,
    baseUnit: '컵(200ml)',
    note: '전지우유 기준'
  },
  {
    id: 'drink_chocolate_milk',
    cat: 'drink',
    emoji: '🍫',
    name: '초코우유',
    carbPer: 22,
    baseAmount: 1,
    baseUnit: '팩(200ml)',
    note: '가당 초코 우유'
  },
  {
    id: 'drink_coffee_latte',
    cat: 'drink',
    emoji: '☕',
    name: '카페라테',
    carbPer: 14,
    baseAmount: 1,
    baseUnit: '잔(355ml)',
    note: '설탕 없는 라테'
  },
  {
    id: 'drink_smoothie',
    cat: 'drink',
    emoji: '🥤',
    name: '스무디',
    carbPer: 40,
    baseAmount: 1,
    baseUnit: '컵(350ml)',
    note: '과일 스무디 평균'
  },

  // ──── 반찬/기타 (side) ────
  {
    id: 'side_potato',
    cat: 'side',
    emoji: '🥔',
    name: '감자 (삶은)',
    carbPer: 17,
    baseAmount: 1,
    baseUnit: '개',
    note: '중간 크기 100g'
  },
  {
    id: 'side_sweet_potato',
    cat: 'side',
    emoji: '🍠',
    name: '고구마 (삶은)',
    carbPer: 25,
    baseAmount: 1,
    baseUnit: '개',
    note: '중간 크기 130g'
  },
  {
    id: 'side_corn',
    cat: 'side',
    emoji: '🌽',
    name: '옥수수',
    carbPer: 25,
    baseAmount: 1,
    baseUnit: '개',
    note: '삶은 옥수수 1개'
  },
  {
    id: 'side_kimchi',
    cat: 'side',
    emoji: '🥬',
    name: '김치',
    carbPer: 2,
    baseAmount: 1,
    baseUnit: '인분',
    note: '약 50g 기준'
  },
  {
    id: 'side_tofu',
    cat: 'side',
    emoji: '⬜',
    name: '두부',
    carbPer: 2,
    baseAmount: 1,
    baseUnit: '모',
    note: '300g 1모'
  },
  {
    id: 'side_egg',
    cat: 'side',
    emoji: '🥚',
    name: '달걀',
    carbPer: 1,
    baseAmount: 1,
    baseUnit: '개',
    note: '탄수화물 거의 없음'
  },
  {
    id: 'side_jjigae',
    cat: 'side',
    emoji: '🍲',
    name: '김치찌개',
    carbPer: 10,
    baseAmount: 1,
    baseUnit: '그릇',
    note: '밥 별도, 찌개만'
  },
  {
    id: 'side_doenjang',
    cat: 'side',
    emoji: '🫕',
    name: '된장찌개',
    carbPer: 8,
    baseAmount: 1,
    baseUnit: '그릇',
    note: '밥 별도'
  },
  {
    id: 'side_chicken',
    cat: 'side',
    emoji: '🍗',
    name: '치킨 (순살)',
    carbPer: 18,
    baseAmount: 1,
    baseUnit: '인분(200g)',
    note: '튀김옷 포함, 소스 별도'
  },
  {
    id: 'side_pizza',
    cat: 'side',
    emoji: '🍕',
    name: '피자',
    carbPer: 30,
    baseAmount: 1,
    baseUnit: '조각',
    note: '중간 크기 조각'
  },

  // ──── 추가 데이터 (추가 요청된 음식들) ────
  { id: 'rice_curry', cat: 'rice', emoji: '🍛', name: '카레라이스', carbPer: 85, baseAmount: 1, baseUnit: '그릇', note: '밥+카레소스' },
  { id: 'rice_omurice', cat: 'rice', emoji: '🍳', name: '오므라이스', carbPer: 90, baseAmount: 1, baseUnit: '그릇', note: '볶음밥+계란+소스' },
  { id: 'rice_gukbap', cat: 'rice', emoji: '🥘', name: '국밥', carbPer: 70, baseAmount: 1, baseUnit: '그릇', note: '밥+국물 기본' },

  { id: 'noodle_kalguksu', cat: 'noodle', emoji: '🍜', name: '칼국수', carbPer: 80, baseAmount: 1, baseUnit: '그릇', note: '밀가루 면+국물' },
  { id: 'noodle_bibim', cat: 'noodle', emoji: '🍝', name: '비빔면', carbPer: 65, baseAmount: 1, baseUnit: '봉지', note: '조리된 상태' },
  { id: 'noodle_rabokki', cat: 'noodle', emoji: '🥘', name: '라볶이', carbPer: 80, baseAmount: 1, baseUnit: '인분', note: '떡+라면+양념' },
  
  { id: 'snack_takoyaki', cat: 'snack', emoji: '🐙', name: '타코야키', carbPer: 25, baseAmount: 6, baseUnit: '알', note: '6알 기준' },
  { id: 'snack_tteok_skewer', cat: 'snack', emoji: '🍢', name: '떡꼬치', carbPer: 35, baseAmount: 1, baseUnit: '개', note: '떡+달콤한 양념' },

  { id: 'bread_macaron', cat: 'bread', emoji: '🍘', name: '마카롱', carbPer: 15, baseAmount: 1, baseUnit: '개', note: '설탕량 주의' },
  { id: 'bread_waffle', cat: 'bread', emoji: '🧇', name: '와플', carbPer: 45, baseAmount: 1, baseUnit: '개', note: '토핑 제외 기본' },

  { id: 'fruit_blueberry', cat: 'fruit', emoji: '🫐', name: '블루베리', carbPer: 14, baseAmount: 100, baseUnit: 'g', note: '약 1종이컵' },
  { id: 'fruit_kiwi', cat: 'fruit', emoji: '🥝', name: '키위', carbPer: 15, baseAmount: 1, baseUnit: '개', note: '중간 크기' },
  { id: 'fruit_pineapple', cat: 'fruit', emoji: '🍍', name: '파인애플', carbPer: 13, baseAmount: 100, baseUnit: 'g', note: '약 1조각' },

  { id: 'drink_americano', cat: 'drink', emoji: '☕', name: '아메리카노', carbPer: 2, baseAmount: 1, baseUnit: '잔(355ml)', note: '시럽 제외, 탄수화물 거의 없음' },
  { id: 'drink_bubbletea', cat: 'drink', emoji: '🧋', name: '버블티', carbPer: 50, baseAmount: 1, baseUnit: '잔(500ml)', note: '타피오카펄+단맛 포함' },
  { id: 'drink_beer', cat: 'drink', emoji: '🍺', name: '맥주', carbPer: 15, baseAmount: 1, baseUnit: '캔(500ml)', note: '알코올 주의, 기본 라거' },

  { id: 'side_samgyeopsal', cat: 'side', emoji: '🥩', name: '삼겹살', carbPer: 1, baseAmount: 1, baseUnit: '인분(200g)', note: '고기 자체엔 탄수 최소화' },
  { id: 'side_bulgogi', cat: 'side', emoji: '🍲', name: '소불고기', carbPer: 15, baseAmount: 1, baseUnit: '인분(200g)', note: '양념 설탕 탓에 탄수 포함' },
  { id: 'side_salad', cat: 'side', emoji: '🥗', name: '채소 샐러드', carbPer: 8, baseAmount: 1, baseUnit: '접시', note: '드레싱 제외 기본 채소' },

  // ──── 대량 추가 데이터 (편의점, 냉동식품 및 기존 카테고리 확장) ────
  
  // [편의점 (cvs)]
  { id: 'cvs_samgak', cat: 'cvs', emoji: '🍙', name: '삼각김밥', carbPer: 35, baseAmount: 1, baseUnit: '개', note: '약 100g' },
  { id: 'cvs_dosirak_jeyuk', cat: 'cvs', emoji: '🍱', name: '제육 도시락', carbPer: 85, baseAmount: 1, baseUnit: '개', note: '밥량 주의' },
  { id: 'cvs_sandwich', cat: 'cvs', emoji: '🥪', name: '샌드위치', carbPer: 30, baseAmount: 1, baseUnit: '개', note: '식빵 2장 분량' },
  { id: 'cvs_hotbar', cat: 'cvs', emoji: '🍢', name: '핫바', carbPer: 12, baseAmount: 1, baseUnit: '개', note: '어육/소시지 베이스' },
  { id: 'cvs_egg', cat: 'cvs', emoji: '🥚', name: '감동란(2개)', carbPer: 1, baseAmount: 1, baseUnit: '팩', note: '탄수화물 거의 없음' },
  { id: 'cvs_cup_ramen', cat: 'cvs', emoji: '🍜', name: '컵라면(소)', carbPer: 40, baseAmount: 1, baseUnit: '개', note: '작은컵 65g 기준' },
  { id: 'cvs_cup_ramen_big', cat: 'cvs', emoji: '🍜', name: '컵라면(대)', carbPer: 70, baseAmount: 1, baseUnit: '개', note: '큰컵 110g 기준' },
  { id: 'cvs_honey_hotteok', cat: 'cvs', emoji: '🥞', name: '꿀호떡(빵)', carbPer: 45, baseAmount: 2, baseUnit: '개', note: '작은 호떡 2개' },
  { id: 'cvs_sausage', cat: 'cvs', emoji: '🌭', name: '후랑크소시지', carbPer: 5, baseAmount: 1, baseUnit: '개', note: '밀가루 함량에 따라 다름' },
  { id: 'cvs_cheese_stick', cat: 'cvs', emoji: '🧀', name: '스트링치즈', carbPer: 1, baseAmount: 1, baseUnit: '개', note: '단백질/지방 위주' },
  { id: 'cvs_protein_bar', cat: 'cvs', emoji: '🍫', name: '프로틴바', carbPer: 15, baseAmount: 1, baseUnit: '개', note: '식이섬유/당알콜 제외 순탄수' },
  { id: 'cvs_cupbap', cat: 'cvs', emoji: '🍲', name: '컵밥', carbPer: 75, baseAmount: 1, baseUnit: '개', note: '건조밥+소스' },
  { id: 'cvs_macaron', cat: 'cvs', emoji: '🍘', name: '편의점 마카롱', carbPer: 25, baseAmount: 1, baseUnit: '팩', note: '보통 3개입' },
  { id: 'cvs_rollcake', cat: 'cvs', emoji: '🍰', name: '모찌롤', carbPer: 30, baseAmount: 1, baseUnit: '팩', note: '크림 롤케이크' },

  // [냉동식품 (frozen)]
  { id: 'frozen_mandu', cat: 'frozen', emoji: '🥟', name: '냉동만두 (교자)', carbPer: 30, baseAmount: 5, baseUnit: '개', note: '중간 크기 5개' },
  { id: 'frozen_hotdog', cat: 'frozen', emoji: '🌭', name: '냉동 핫도그', carbPer: 25, baseAmount: 1, baseUnit: '개', note: '빵 껍질' },
  { id: 'frozen_pizza', cat: 'frozen', emoji: '🍕', name: '냉동 피자(원판)', carbPer: 120, baseAmount: 1, baseUnit: '판', note: '레귤러 사이즈 1판' },
  { id: 'frozen_chicken_breast', cat: 'frozen', emoji: '🍗', name: '냉동 닭가슴살', carbPer: 2, baseAmount: 1, baseUnit: '팩', note: '양념에 따라 차이' },
  { id: 'frozen_hashbrown', cat: 'frozen', emoji: '🥔', name: '해시브라운', carbPer: 15, baseAmount: 1, baseUnit: '개', note: '감자+기름' },
  { id: 'frozen_fried_rice', cat: 'frozen', emoji: '🍳', name: '냉동 볶음밥', carbPer: 65, baseAmount: 1, baseUnit: '팩', note: '1인분 250g' },
  { id: 'frozen_tonkatsu', cat: 'frozen', emoji: '🥩', name: '냉동 돈까스', carbPer: 20, baseAmount: 1, baseUnit: '장', note: '튀김옷 탄수화물' },
  { id: 'frozen_nugget', cat: 'frozen', emoji: '🍗', name: '치킨너겟', carbPer: 12, baseAmount: 5, baseUnit: '개', note: '튀김옷 포함' },
  { id: 'frozen_tteokgalbi', cat: 'frozen', emoji: '🍖', name: '냉동 떡갈비', carbPer: 10, baseAmount: 1, baseUnit: '장', note: '고기+전분+달콤 양념' },
  { id: 'frozen_croquette', cat: 'frozen', emoji: '🧆', name: '감자 고로케', carbPer: 25, baseAmount: 1, baseUnit: '개', note: '감자+튀김옷' },
  { id: 'frozen_french_fries', cat: 'frozen', emoji: '🍟', name: '냉동 감자튀김', carbPer: 35, baseAmount: 100, baseUnit: 'g', note: '기름에 튀긴 후' },

  // [기존 카테고리 확장 - 밥류/면류/분식/빵/과일/음료/반찬]
  { id: 'rice_fried_shrimp', cat: 'rice', emoji: '🍤', name: '새우볶음밥', carbPer: 70, baseAmount: 1, baseUnit: '그릇', note: '중식당 기준' },
  { id: 'rice_yubu', cat: 'rice', emoji: '🍣', name: '유부초밥', carbPer: 40, baseAmount: 4, baseUnit: '개', note: '달콤한 밥+유부' },
  { id: 'rice_juk_jeonbok', cat: 'rice', emoji: '🥣', name: '전복죽', carbPer: 45, baseAmount: 1, baseUnit: '그릇', note: '큰 그릇' },
  
  { id: 'noodle_dangmyeon', cat: 'noodle', emoji: '🍜', name: '당면(삶은)', carbPer: 80, baseAmount: 100, baseUnit: 'g', note: '잡채용, 당질 매우 높음' },
  { id: 'noodle_jjolmyeon', cat: 'noodle', emoji: '🍝', name: '쫄면', carbPer: 85, baseAmount: 1, baseUnit: '그릇', note: '질긴 면+고추장 양념' },
  { id: 'noodle_pasta_cream', cat: 'noodle', emoji: '🍝', name: '크림 파스타', carbPer: 60, baseAmount: 1, baseUnit: '그릇', note: '밀가루+지방' },
  { id: 'noodle_janchi', cat: 'noodle', emoji: '🍜', name: '잔치국수', carbPer: 70, baseAmount: 1, baseUnit: '그릇', note: '소면 양이 많음' },

  { id: 'snack_gimmari', cat: 'snack', emoji: '🌯', name: '김말이 튀김', carbPer: 20, baseAmount: 3, baseUnit: '개', note: '당면+튀김옷' },
  { id: 'snack_squid_twigim', cat: 'snack', emoji: '🦑', name: '오징어 튀김', carbPer: 15, baseAmount: 2, baseUnit: '개', note: '튀김옷 탄수화물' },
  { id: 'snack_bungeoppang', cat: 'snack', emoji: '🐟', name: '붕어빵(팥)', carbPer: 30, baseAmount: 2, baseUnit: '개', note: '밀가루+단팥' },
  { id: 'snack_eggbread', cat: 'snack', emoji: '🥚', name: '계란빵', carbPer: 25, baseAmount: 1, baseUnit: '개', note: '달콤한 팬케이크 반죽' },
  { id: 'snack_churros', cat: 'snack', emoji: '🥖', name: '츄러스', carbPer: 45, baseAmount: 1, baseUnit: '개', note: '놀이공원 긴 것 기준' },

  { id: 'bread_saltbread', cat: 'bread', emoji: '🥐', name: '소금빵', carbPer: 22, baseAmount: 1, baseUnit: '개', note: '버터+밀가루' },
  { id: 'bread_bagel', cat: 'bread', emoji: '🥯', name: '베이글', carbPer: 50, baseAmount: 1, baseUnit: '개', note: '크림치즈 제외' },
  { id: 'bread_brownie', cat: 'bread', emoji: '🥮', name: '브라우니', carbPer: 40, baseAmount: 1, baseUnit: '조각', note: '설탕 매우 많음' },
  { id: 'bread_castella', cat: 'bread', emoji: '🍞', name: '카스텔라', carbPer: 35, baseAmount: 1, baseUnit: '조각', note: '달달한 스펀지빵' },
  { id: 'bread_mocha', cat: 'bread', emoji: '🍞', name: '모카빵', carbPer: 60, baseAmount: 1, baseUnit: '개', note: '크기가 크므로 주의' },

  { id: 'fruit_cherry', cat: 'fruit', emoji: '🍒', name: '체리', carbPer: 15, baseAmount: 10, baseUnit: '알', note: '약 100g' },
  { id: 'fruit_plum', cat: 'fruit', emoji: '🍑', name: '자두', carbPer: 10, baseAmount: 1, baseUnit: '개', note: '중간 크기' },
  { id: 'fruit_fig', cat: 'fruit', emoji: '🪴', name: '무화과', carbPer: 15, baseAmount: 2, baseUnit: '개', note: '달콤함 주의' },
  { id: 'fruit_tomato', cat: 'fruit', emoji: '🍅', name: '토마토(완숙)', carbPer: 5, baseAmount: 1, baseUnit: '개', note: '중간 크기 (채소류지만 과일 대용)' },
  { id: 'fruit_cherry_tomato', cat: 'fruit', emoji: '🍅', name: '방울토마토', carbPer: 4, baseAmount: 10, baseUnit: '알', note: '큰 부담 없음' },
  { id: 'fruit_grapefruit', cat: 'fruit', emoji: '🍊', name: '자몽', carbPer: 20, baseAmount: 1, baseUnit: '개', note: '약 250g' },

  { id: 'drink_milkis', cat: 'drink', emoji: '🥤', name: '밀키스', carbPer: 28, baseAmount: 1, baseUnit: '캔(250ml)', note: '유성 탄산음료' },
  { id: 'drink_zero_cola', cat: 'drink', emoji: '🥤', name: '제로콜라', carbPer: 0, baseAmount: 1, baseUnit: '캔(250ml)', note: '혈당에 영향 없음' },
  { id: 'drink_pocari', cat: 'drink', emoji: '💧', name: '포카리스웨트', carbPer: 30, baseAmount: 1, baseUnit: '병(500ml)', note: '저혈당 응급조치용' },
  { id: 'drink_yakult', cat: 'drink', emoji: '🧃', name: '요구르트(소)', carbPer: 10, baseAmount: 1, baseUnit: '병(65ml)', note: '단맛' },
  { id: 'drink_soymilk', cat: 'drink', emoji: '🥛', name: '두유', carbPer: 15, baseAmount: 1, baseUnit: '팩(190ml)', note: '가당 두유 기준' },
  { id: 'drink_misutgaru', cat: 'drink', emoji: '🥣', name: '미숫가루(마)', carbPer: 45, baseAmount: 1, baseUnit: '잔', note: '곡물+설탕/꿀' },

  { id: 'side_spinach', cat: 'side', emoji: '🥬', name: '시금치나물', carbPer: 3, baseAmount: 1, baseUnit: '접시', note: '탄수화물 낮음' },
  { id: 'side_japchae', cat: 'side', emoji: '🥢', name: '잡채', carbPer: 35, baseAmount: 1, baseUnit: '접시', note: '당면으로 인해 탄수 높음' },
  { id: 'side_seaweed_soup', cat: 'side', emoji: '🍲', name: '미역국', carbPer: 5, baseAmount: 1, baseUnit: '그릇', note: '미역 자체는 낮음' },
  { id: 'side_anchovy', cat: 'side', emoji: '🐟', name: '멸치볶음', carbPer: 10, baseAmount: 1, baseUnit: '소접시', note: '물엿/설탕 양념' },
  { id: 'side_mackerel', cat: 'side', emoji: '🐟', name: '고등어구이', carbPer: 1, baseAmount: 1, baseUnit: '토막', note: '탄수화물 거의 없음' },
  { id: 'side_squid_shred', cat: 'side', emoji: '🦑', name: '진미채볶음', carbPer: 15, baseAmount: 1, baseUnit: '소접시', note: '오징어+물엿 양념' },
  { id: 'side_black_bean', cat: 'side', emoji: '🫘', name: '콩자반', carbPer: 12, baseAmount: 1, baseUnit: '소접시', note: '콩+설탕 양념' },
];

// ── 전체 음식 목록을 윈도우에 노출 ──
// (app.js에서 접근하기 위함)
window.FOOD_DB = FOOD_DB;
