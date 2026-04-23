import { User } from 'firebase/auth';

/**
 * 관리자 권한 여부를 확인하는 유틸리티
 * 현재는 특정 displayName ('PIKA_제이든')을 기준으로 확인합니다.
 * 보안 강화를 위해 추후 특정 UID 리스트로 변경하는 것을 권장합니다.
 */
export const isAdmin = (user: User | null): boolean => {
  if (!user) return false;

  // 관리자 권한을 가진 계정 리스트 (보안상 UID를 사용하는 것이 가장 좋습니다)
  const adminNames = ['PIKA_제이든'];
  const adminUids = [
    'Ih6vjqgj0RfLHjpaRjLmidpaQoC2' // 사용자님이 확인하신 관리자 UID
  ];

  return adminNames.includes(user.displayName || '') || adminUids.includes(user.uid);
};
