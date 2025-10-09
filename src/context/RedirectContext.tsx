import React, { createContext, useContext, useState } from 'react';

type RedirectContextType = {
  redirectTo: string | null;
  redirectParams: any;
  setRedirect: (to: string, params?: any) => void;
  clearRedirect: () => void;
};

const RedirectContext = createContext<RedirectContextType>({
  redirectTo: null,
  redirectParams: null,
  setRedirect: () => { },
  clearRedirect: () => { },
});

export const RedirectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const [redirectParams, setRedirectParams] = useState<any>(null);

  const setRedirect = (to: string, params?: any) => {
    setRedirectTo(to);
    setRedirectParams(params || {});
  };

  const clearRedirect = () => {
    setRedirectTo(null);
    setRedirectParams(null);
  };

  return (
    <RedirectContext.Provider
      value={{ redirectTo, redirectParams, setRedirect, clearRedirect }}
    >
      {children}
    </RedirectContext.Provider>
  );
};

export const useRedirect = () => useContext(RedirectContext);
