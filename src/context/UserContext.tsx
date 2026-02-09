'use client';

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

interface UserContextType {
  userId: string;
  setUserId: (id: string) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userId, setUserIdState] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedId = localStorage.getItem('x-user-id');

    if (storedId) {
      setUserIdState(storedId);
    } else {
      const newId = `user-${Math.floor(Math.random() * 10000)}`;
      localStorage.setItem('x-user-id', newId);
      setUserIdState(newId);
    }
    setIsLoading(false);
  }, []);

  const setUserId = (id: string) => {
    localStorage.setItem('x-user-id', id);
    setUserIdState(id);
    window.location.reload();
  };

  return (
    <UserContext.Provider value={{ userId, setUserId, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

// Custom Hook for easy access
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
