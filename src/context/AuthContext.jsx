import { createContext, useCallback, useEffect, useState } from 'react';
import { postRequest } from '../utils/services,js';

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [registerError, setRegisterError] = useState(null);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const [registerInfo, setRegisterInfo] = useState({
    name: '',
    email: '',
    password: '',
  });

  console.log('User:', user);

  useEffect(() => {
    const user = localStorage.getItem('User');
    if (user) {
      setUser(JSON.parse(user));
    }
  }, []);

  const updateRegisterInfo = useCallback((info) => {
    setRegisterInfo(info);
  }, []);

  const registerUser = useCallback(
    async (e) => {
      e.preventDefault();
      setIsRegisterLoading(true);
      setRegisterError(null);

      const response = await postRequest(`users/register`, registerInfo);

      setIsRegisterLoading(false);

      if (response.error) {
        return setRegisterError(response.message);
      }

      localStorage.setItem('User', JSON.stringify(response));
      setUser(response);
    },
    [registerInfo],
  );

  const logoutUser = useCallback(() => {
    localStorage.removeItem('User');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        registerInfo,
        updateRegisterInfo,
        registerUser,
        registerError,
        isRegisterLoading,
        logoutUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
