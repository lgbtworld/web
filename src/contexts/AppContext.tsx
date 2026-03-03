import React, { createContext, useContext, useState, useEffect } from "react";
import { Actions } from "../services/actions";
import { api } from "../services/api";
import i18n from "../i18n";


export interface LocalizedString {
  [langCode: string]: string;
}

export interface AttributeItem {
  id: string;
  name: LocalizedString;
  display_order: number;
}

export interface GroupedAttribute {
  category: string;
  attributes: AttributeItem[];
}

interface InitialData {
  vapid_public_key: string;
  preferences: any;
  event_kinds: any[];
  report_kinds: any[];
  countries: Record<string, any>;
  languages: Record<string, any>;
  status: string;
}

interface AppContextType {
  data: InitialData | null;
  refresh: () => Promise<void>;
  loading: boolean;
  defaultLanguage: string;
  setDefaultLanguage: (lang: string) => void;
}

const AppContext = createContext<AppContextType>({
  data: null,
  refresh: async () => { },
  loading: true,
  defaultLanguage: "en",
  setDefaultLanguage: () => { }
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<InitialData | null>(null);
  const [loading, setLoading] = useState(true);
  const storedLang = typeof window !== 'undefined' ? localStorage.getItem('lang') : null;
  const [defaultLanguage, setDefaultLanguage] = useState<string>(storedLang || i18n.language || "en");


  const refresh = async () => {
    setLoading(true);
    try {
      const res = await api.call<InitialData>(Actions.SYSTEM_INITIAL_SYNC,{
        method: "POST",
      });
      setData(res || null);
    } catch (err) {
      console.error("Initial sync failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setDefaultLanguage(lng);
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  return (
    <AppContext.Provider value={{
      data,
      refresh,
      loading,
      defaultLanguage,
      setDefaultLanguage,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);