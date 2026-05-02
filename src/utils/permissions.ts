import { User } from 'firebase/auth';

export const isAdmin = (user: User | null): boolean => {
  if (!user) return false;

  const adminNames = ['PIKA_제이든'];
  const adminUids = ['Ih6vjqgj0RfLHjpaRjLmidpaQoC2'];

  return adminNames.includes(user.displayName || '') || adminUids.includes(user.uid);
};
