import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AppConfig {
    VITE_API_URL: string;
}

interface ConfigContextValue {
    config: AppConfig | null;
    loading: boolean;
}

const ConfigContext = createContext<ConfigContextValue | undefined>(undefined);

export const ConfigProvider = ({ children }: { children: ReactNode }) => {
    const [config, setConfig] = useState<AppConfig | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/config.json')
            .then((res) => {
                if (!res.ok) throw new Error('Błąd ładowania config.json');
                return res.json();
            })
            .then((data: AppConfig) => setConfig(data))
            .catch((err) => {
                console.error(err);
                setConfig(null);
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <ConfigContext.Provider value={{ config, loading }}>
            {children}
        </ConfigContext.Provider>
    );
};

export const useConfig = (): ConfigContextValue => {
    const ctx = useContext(ConfigContext);
    if (!ctx) {
        throw new Error('useConfig musi być użyty wewnątrz <ConfigProvider>');
    }
    return ctx;
};
