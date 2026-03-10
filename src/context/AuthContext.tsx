
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  phone: string;
}

interface SessionData {
  success: boolean;
  token: string;
  data: {
    user: User;
  }
}

interface AuthContextType {
  user: SessionData | null;
  setUser: (user: SessionData | null) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  initialData = null,
}: {
  children: ReactNode;
  initialData?: SessionData | null;
}) {
  const pathname = usePathname();
  const [user, setUser] = useState<SessionData | null>(initialData);
  const [loading, setLoading] = useState(!initialData);

  useEffect(() => {
    if (initialData) {
      setUser(initialData);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const loadSession = async () => {
      try {
        const response = await fetch('/api/session', { cache: 'no-store' });
        const payload = await response.json();
        if (isMounted) {
          setUser(payload.user || null);
        }
      } catch {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadSession();

    return () => {
      isMounted = false;
    };
  }, [initialData, pathname]);
  
  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
