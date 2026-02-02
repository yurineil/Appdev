export const isValidEmail = (email: string): boolean => {
  const normalized = email.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
};

export const hasMinLength = (value: string, min: number): boolean =>
  value.trim().length >= min;
