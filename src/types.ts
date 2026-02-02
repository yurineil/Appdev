export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
};

export type Task = {
  id: string;
  title: string;
  notes?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};
