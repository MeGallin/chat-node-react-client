import { createContext, useCallback, useEffect, useState } from 'react';
import { postRequest } from '../utils/services.js';

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
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);

  const [loginInfo, setLoginInfo] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    const user = localStorage.getItem('User');
    if (user) {
      setUser(JSON.parse(user));
    }
  }, []);

  const updateRegisterInfo = useCallback((info) => {
    setRegisterInfo(info);
  }, []);

  const updateLoginInfo = useCallback((info) => {
    setLoginInfo((prev) => ({ ...prev, ...info }));
  }, []);

  const registerUser = useCallback(
    async (e) => {
      e.preventDefault();
      setIsRegisterLoading(true);
      setRegisterError(null);

      const response = await postRequest(`/api/users/register`, registerInfo);
      setIsRegisterLoading(false);

      if (response.error) {
        return setRegisterError(response.message);
      }

      localStorage.setItem('User', JSON.stringify(response));
      setUser(response);
    },
    [registerInfo],
  );

  // LOG_IN_USER
  const loginUser = useCallback(
    async (e) => {
      e.preventDefault();
      setIsLoginLoading(true);
      setLoginError(null);

      const response = await postRequest(`/api/users/login`, loginInfo);
      setIsLoginLoading(false);

      if (response.error) {
        return setLoginError(response.message);
      }

      localStorage.setItem('User', JSON.stringify(response));
      setUser(response);
    },
    [loginInfo],
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
        logoutUser,
        loginUser,
        updateLoginInfo,
        loginError,
        isLoginLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
