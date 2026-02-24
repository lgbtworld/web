'use client';

import React from 'react';
import { Provider as JotaiProvider } from 'jotai';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { ToolbarContext } from './contexts/ToolbarContext';
import { SettingsContext } from './contexts/SettingsContext';
import { SocketProvider } from './contexts/SocketContext';
import { PushNotificationSetupContext } from './contexts/PushNotificationSetupContext';
import { SharedHistoryContext } from './contexts/SharedHistoryContext';
import { SSRDataProvider, SSRDataPayload } from './contexts/SSRDataContext';
import { globalState } from './state/nearby';
import './i18n';

type RootAppProps = {
  initialPath: string;
  ssrData?: SSRDataPayload;
  initialTheme?: 'light' | 'dark';
  pageContent?: React.ReactNode;
};

export default function RootApp({ initialPath, ssrData, initialTheme = 'dark', pageContent }: RootAppProps) {
  const initialAtomValues = React.useMemo(() => {
    const nearbyUsers = ssrData?.nearby?.users || [];
    const nextCursor = ssrData?.nearby?.nextCursor ?? null;
    return [[
      globalState,
      {
        notificationNextCursor: null,
        notificationPrevCursor: null,
        notifications: [],
        nearByCursor: nextCursor,
        nearbyUsers,
        posts: [],
        postsCursor: null,
        vibesCursor: null,
        vibes: [],
      },
    ]] as const;
  }, [ssrData?.nearby?.nextCursor, ssrData?.nearby?.users]);

  const routerContent = (
    <JotaiProvider initialValues={initialAtomValues}>
      <SSRDataProvider value={ssrData || { pathname: initialPath }}>
        <SocketProvider>
          <SettingsContext>
            <SharedHistoryContext>
              <ToolbarContext>
                <ThemeProvider initialTheme={initialTheme}>
                  <AppProvider>
                    <AuthProvider>
                      <PushNotificationSetupContext />
                      <App pageContent={pageContent} />
                    </AuthProvider>
                  </AppProvider>
                </ThemeProvider>
              </ToolbarContext>
            </SharedHistoryContext>
          </SettingsContext>
        </SocketProvider>
      </SSRDataProvider>
    </JotaiProvider>
  );

  return routerContent;
}
