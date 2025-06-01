import { useQuery } from '@tanstack/react-query';
import { fetchCurrentUser, User } from '../api/authApi';

export const useCurrentUser = () => {
  return useQuery<User>({
    queryKey: ['currentUser'],
    queryFn: fetchCurrentUser,
    retry: false, // אפשר לשנות לפי הצורך
    staleTime: 1000 * 60 * 5, // 5 דקות, לדוגמה
  });
};
