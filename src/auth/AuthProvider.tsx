import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { login as loginApi } from './authApi';
import {Storage} from "@capacitor/core";

const log = getLogger('AuthProvider');

type LoginFn = (username?: string, password?: string) => void;
type LogoutFn = () => void;

export interface AuthState {
  authenticationError: Error | null;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  login?: LoginFn;
  logout?: LogoutFn;
  pendingAuthentication?: boolean;
  username?: string;
  password?: string;
  tokenFound:boolean;
  storage: typeof Storage;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isAuthenticating: false,
  authenticationError: null,
  pendingAuthentication: false,
  tokenFound:false,
  username: '',
  storage: Storage,
};

export const AuthContext = React.createContext<AuthState>(initialState);

interface AuthProviderProps {
  children: PropTypes.ReactNodeLike,
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);
  const { isAuthenticated, tokenFound, isAuthenticating, authenticationError, pendingAuthentication,username,password } = state;
  const storage = Storage;
  const login = useCallback<LoginFn>(loginCallback, []);
  const logout = useCallback<LogoutFn>(logoutCallback, []);
  useEffect(authenticationEffect, [pendingAuthentication]);
  useEffect(checkStorage, []);
  const value = { username, isAuthenticated, tokenFound, login,logout, isAuthenticating, authenticationError, storage,password };
  log('render');

  function checkStorage() {
  storage.get({ key: 'token' }).then(async res=>{
    console.log(res)
    if(res.value){
      setState({
        ...state,
        pendingAuthentication: false,
        username,
        password,
        isAuthenticated: true,
        isAuthenticating: false,
        tokenFound:true
      });
    }
  });}

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );

  async function logoutCallback(): Promise<void> {
    await storage.clear();
    setState({
      ...state,
      isAuthenticated: false,
      isAuthenticating: false,
      authenticationError: null,
      pendingAuthentication: false,
      username: '',
      password: '',
      tokenFound: false
    });
  }

  async function loginCallback(username?: string, password?: string): Promise<void> {
    log('login');
    if(!tokenFound){
          setState({
            ...state,
            pendingAuthentication: true,
            username,
            password
          });
        }
    }

  function authenticationEffect() {
    let canceled = false;
    authenticate();
    return () => {
      canceled = true;
    }

    async function authenticate() {
      if (!pendingAuthentication) {
        log('authenticate, !pendingAuthentication, return');
        return;
      }
      try {
        log('authenticate...');
        setState({
          ...state,
          isAuthenticating: true,
        });
        if (canceled) {
          return;
        }
        const { username, password } = state;
        const { token } = await loginApi(username, password);
        await storage.set({
          key: 'token',
          value: token,
        });
        log('authenticate succeeded');
        setState({
          ...state,
          pendingAuthentication: false,
          isAuthenticated: true,
          isAuthenticating: false,
          tokenFound:true
        });
      } catch (error) {
        if (canceled) {
          return;
        }
        log('authenticate failed');
        setState({
          ...state,
          authenticationError: error,
          pendingAuthentication: false,
          isAuthenticating: false,
          tokenFound:false
        });
      }
    }
  }
};
