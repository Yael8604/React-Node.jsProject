import axios from 'axios';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
}

export const fetchCurrentUser = async (): Promise<User> => {
  const response = await axios.get(`${process.env.REACT_APP_API_URL}auth/me`, {
  withCredentials: true
  });
  return response.data;
};


