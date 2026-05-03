import { User } from 'firebase/auth';

export const isAdmin = (user: User | null): boolean => {
  if (!user) return false;
  const adminUids = ['Ih6vjqgj0RfLHjpaRjLmidpaQoC2'];
  return adminUids.includes(user.uid);
};
