import { UserRole } from "../types/Authentication";

export const isUserRole = (userRole: string): boolean => {
  const role = userRole as UserRole;
  return (role === 'member' || role === 'anonymous');
};
