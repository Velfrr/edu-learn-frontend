import { UserRole } from '../enums/roles';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: string;
  lastActive?: string;
  isBanned?: boolean;
}

export interface AuthUser extends User {
  isLoggedIn: boolean;
}
