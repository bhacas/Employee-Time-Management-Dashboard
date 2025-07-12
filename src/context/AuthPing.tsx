import { useEffect } from "react";
import { useAuth } from "./AuthContext.tsx";
import {useConfig} from "./ConfigContext.tsx";

export default function AuthPing() {
    const { logout } = useAuth();
    const { config } = useConfig();


    useEffect(() => {
        const intervalId = setInterval(async () => {
            try {
                const res = await fetch(`${config?.VITE_API_URL}/api/logged`, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (res.status === 401) {
                    logout();
                }
            } catch (err) {
                console.error("Błąd sprawdzania sesji:", err);
            }
        }, 60000); // co 60 sekund

        return () => clearInterval(intervalId);
    }, [logout]);

    return null;
}