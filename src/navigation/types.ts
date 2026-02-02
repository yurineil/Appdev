import type { Task } from '../types';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type TabsParamList = {
  Tasks: undefined;
  Profile: undefined;
};

export type MainStackParamList = {
  Tabs: undefined;
  TaskForm: { mode: 'create' | 'edit'; task?: Task };
};
