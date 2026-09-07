'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  created_at: number;
}

interface UserContextType {
  currentUser: User | null;
  allUsers: User[];
  isLoading: boolean;
  switchUser: (userId: string) => void;
  createNewUser: (name: string, email: string) => Promise<User>;
  registerUser: (name: string, email: string) => Promise<User>;
  loginUser: (email: string) => Promise<User>;
  logout: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  apiFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Load theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('docflow-theme') as 'dark' | 'light' | null;
    const initialTheme = savedTheme || 'dark';
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('docflow-theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  // Fetch users on mount
  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      const users: User[] = data.users || [];
      setAllUsers(users);

      // Only set user if explicitly saved in localStorage and exists in user list
      const savedUserId = localStorage.getItem('docflow-user-id');
      const matched = savedUserId ? users.find((u: User) => u.id === savedUserId) : null;
      setCurrentUser(matched || null);
    } catch (err) {
      console.error('Error in UserProvider:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const switchUser = (userId: string) => {
    const found = allUsers.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem('docflow-user-id', found.id);
    }
  };

  const createNewUser = async (name: string, email: string): Promise<User> => {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to create user');
    }

    const data = await res.json();
    setAllUsers((prev) => [...prev, data.user]);
    setCurrentUser(data.user);
    localStorage.setItem('docflow-user-id', data.user.id);
    return data.user;
  };

  const registerUser = createNewUser;

  const loginUser = async (email: string): Promise<User> => {
    const res = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to log in');
    }

    const data = await res.json();
    setCurrentUser(data.user);
    localStorage.setItem('docflow-user-id', data.user.id);
    return data.user;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('docflow-user-id');
  };

  const apiFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const headers = new Headers(options.headers || {});
      if (currentUser) {
        headers.set('x-user-id', currentUser.id);
      }
      return fetch(url, { ...options, headers });
    },
    [currentUser]
  );

  return (
    <UserContext.Provider
      value={{
        currentUser,
        allUsers,
        isLoading,
        switchUser,
        createNewUser,
        registerUser,
        loginUser,
        logout,
        theme,
        toggleTheme,
        apiFetch,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
