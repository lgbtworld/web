import React from 'react';

export type SSRDataPayload = {
  pathname?: string;
  profileByUsername?: Record<string, any>;
  postById?: Record<string, any>;
  nearby?: {
    users: any[];
    nextCursor: string | number | null;
  };
  authUser?: any | null;
  authToken?: string | null;
  initialSync?: any | null;
};

const SSRDataContext = React.createContext<SSRDataPayload | null>(null);

export function SSRDataProvider({
  value,
  children,
}: {
  value: SSRDataPayload;
  children: React.ReactNode;
}) {
  return <SSRDataContext.Provider value={value}>{children}</SSRDataContext.Provider>;
}

export function useSSRData() {
  return React.useContext(SSRDataContext);
}
