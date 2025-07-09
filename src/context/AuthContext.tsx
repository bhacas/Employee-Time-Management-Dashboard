import React, { useEffect, useState, createContext, useContext } from 'react';
interface User {
  id: string;
  name: string;
  email: string;
  role: 'employee' | 'manager';
  managerId?: string;
  teamMembers?: string[]; // Only for managers
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
// Sample team data for demonstration
const sampleUsers: User[] = [{
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'manager',
  teamMembers: ['2', '3', '4']
}, {
  id: '2',
  name: 'Jane Smith',
  email: 'jane@example.com',
  role: 'employee',
  managerId: '1'
}, {
  id: '3',
  name: 'Bob Johnson',
  email: 'bob@example.com',
  role: 'employee',
  managerId: '1'
}, {
  id: '4',
  name: 'Alice Williams',
  email: 'alice@example.com',
  role: 'employee',
  managerId: '1'
}, {
  id: '5',
  name: 'Regular User',
  email: 'user@example.com',
  role: 'employee',
  managerId: '1'
}];
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
    // Simple validation
    if (!email || !password) {
      return false;
    }
    // In a real app, this would be an API call
    // For demo, check if it's one of our sample users
    const foundUser = sampleUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    // If no matching user, create a regular employee
    const loginUser = foundUser || {
      id: '999',
      name: email.split('@')[0],
      email,
      role: 'employee' as const
    };
    // Store user in local storage
    localStorage.setItem('user', JSON.stringify(loginUser));
    setUser(loginUser);
    return true;
  };
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };
  const getTeamMembers = () => {
    if (!user || user.role !== 'manager' || !user.teamMembers) {
      return [];
    }
    return sampleUsers.filter(u => user.teamMembers?.includes(u.id));
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