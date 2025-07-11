interface AppConfig {
    VITE_API_URL: string;
}

export const loadConfig = async (): Promise<AppConfig> => {
    const res = await fetch('/config.json');
    return res.json();
};