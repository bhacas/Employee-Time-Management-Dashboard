import React, {createContext, useContext, useEffect, useState} from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'employee' | 'manager';
  managerId?: string;
  teamMembers?: User[]; // Only for managers
}
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isManager: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  getTeamMembers: () => User[];
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const API_URL = import.meta.env.VITE_API_URL;

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  const [user, setUser] = useState<User | null>(null);
  // Check for existing user session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);
  // Mock login function - in a real app, this would call an API
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(API_URL + '/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      const token = data.token;

      localStorage.setItem('token', token);

      const userResponse = await fetch(API_URL + '/api/logged', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!userResponse.ok) {
        return false;
      }

      const userData = await userResponse.json();

      const loginUser: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        managerId: userData.managerId,
        teamMembers: userData.teamMembers
      };

      localStorage.setItem('user', JSON.stringify(loginUser));
      setUser(loginUser);

      return true;
    } catch (error) {
      return false;
    }
  };
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };
  const getTeamMembers = () => {
    if (!user || user.role !== 'manager' || !user.teamMembers) {
      return [];
    }
    return user.teamMembers;
  };
  return <AuthContext.Provider value={{
    user,
    isAuthenticated: !!user,
    isManager: user?.role === 'manager',
    login,
    logout,
    getTeamMembers
  }}>
      {children}
    </AuthContext.Provider>;
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};