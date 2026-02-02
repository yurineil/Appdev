import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Task, User } from './types';

const USERS_KEY = '@tm_users';
const SESSION_KEY = '@tm_session';
const TASKS_PREFIX = '@tm_tasks_';

export const getUsers = async (): Promise<User[]> => {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  return raw ? (JSON.parse(raw) as User[]) : [];
};

export const setUsers = async (users: User[]): Promise<void> => {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const getSessionUserId = async (): Promise<string | null> =>
  AsyncStorage.getItem(SESSION_KEY);

export const setSessionUserId = async (userId: string): Promise<void> => {
  await AsyncStorage.setItem(SESSION_KEY, userId);
};

export const clearSessionUserId = async (): Promise<void> => {
  await AsyncStorage.removeItem(SESSION_KEY);
};

export const getTasks = async (userId: string): Promise<Task[]> => {
  const raw = await AsyncStorage.getItem(`${TASKS_PREFIX}${userId}`);
  return raw ? (JSON.parse(raw) as Task[]) : [];
};

export const setTasks = async (userId: string, tasks: Task[]): Promise<void> => {
  await AsyncStorage.setItem(`${TASKS_PREFIX}${userId}`, JSON.stringify(tasks));
};
