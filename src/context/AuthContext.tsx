import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { clearSessionUserId, getSessionUserId, getUsers, setSessionUserId, setUsers } from '../storage';
import type { User } from '../types';
import { createId } from '../utils/id';

type AuthContextValue = {
  user: User | null;
  initializing: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Pick<User, 'name'>) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const sessionId = await getSessionUserId();
        if (!sessionId) {
          return;
        }
        const users = await getUsers();
        const existing = users.find((stored) => stored.id === sessionId);
        if (existing) {
          setUser(existing);
        } else {
          await clearSessionUserId();
        }
      } finally {
        setInitializing(false);
      }
    };

    bootstrap();
  }, []);

  const signIn = async (email: string, password: string) => {
    const users = await getUsers();
    if (users.length === 0) {
      throw new Error('No account found. Please register first.');
    }
    const normalizedEmail = email.trim().toLowerCase();
    const matched = users.find(
      (stored) => stored.email.toLowerCase() === normalizedEmail && stored.password === password
    );
    if (!matched) {
      throw new Error('Invalid email or password.');
    }
    await setSessionUserId(matched.id);
    setUser(matched);
  };

  const signUp = async (name: string, email: string, password: string) => {
    const users = await getUsers();
    const normalizedEmail = email.trim().toLowerCase();
    const exists = users.some((stored) => stored.email.toLowerCase() === normalizedEmail);
    if (exists) {
      throw new Error('This email is already registered.');
    }

    const nextUser: User = {
      id: createId(),
      name: name.trim(),
      email: normalizedEmail,
      password,
      createdAt: new Date().toISOString(),
    };

    const updatedUsers = [...users, nextUser];
    await setUsers(updatedUsers);
    await setSessionUserId(nextUser.id);
    setUser(nextUser);
  };

  const signOut = async () => {
    await clearSessionUserId();
    setUser(null);
  };

  const updateProfile = async (updates: Pick<User, 'name'>) => {
    if (!user) {
      return;
    }
    const users = await getUsers();
    const updatedUsers = users.map((stored) =>
      stored.id === user.id ? { ...stored, ...updates } : stored
    );
    const updatedUser = updatedUsers.find((stored) => stored.id === user.id) ?? user;
    await setUsers(updatedUsers);
    setUser(updatedUser);
  };

  const value = useMemo<AuthContextValue>(
    () => ({ user, initializing, signIn, signUp, signOut, updateProfile }),
    [user, initializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.');
  }
  return context;
};
