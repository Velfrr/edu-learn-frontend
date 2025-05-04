import { User } from '../types/user';
import { UserRole } from '../enums/roles';

export const getAllUsers = async (): Promise<{
  users: User[];
  error: Error | null;
}> => {
  try {
    const res = await fetch('/api/users?excludeRole=ADMIN');
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch users');

    const users: User[] = data.map((user: any) => ({
      id: user.id,
      email: user.email || '',
      fullName: user.full_name,
      role: user.role as UserRole,
      createdAt: user.created_at,
      lastActive: user.last_active || undefined,
      isBanned: user.is_banned || false,
    }));

    return { users, error: null };
  } catch (error) {
    return { users: [], error: error as Error };
  }
};

export const getUsersByRole = async (
  role: UserRole,
): Promise<{ users: User[]; error: Error | null }> => {
  try {
    const res = await fetch(`/api/users?role=${role}`);
    const data = await res.json();
    if (!res.ok)
      throw new Error(data.message || 'Failed to fetch users by role');

    const users: User[] = data.map((user: any) => ({
      id: user.id,
      email: user.email || '',
      fullName: user.full_name,
      role: user.role as UserRole,
      createdAt: user.created_at,
      lastActive: user.last_active || undefined,
      isBanned: user.is_banned || false,
    }));

    return { users, error: null };
  } catch (error) {
    return { users: [], error: error as Error };
  }
};

export const deleteUser = async (
  userId: string,
): Promise<{ error: Error | null }> => {
  try {
    const res = await fetch(`/api/admin/delete-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to delete user');

    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
};

export const updateUserActivity = async (
  userId: string,
): Promise<{ error: Error | null }> => {
  try {
    const res = await fetch(`/api/users/${userId}/activity`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ last_active: new Date().toISOString() }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Failed to update user activity');
    }

    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
};

export const toggleUserBanStatus = async (
  userId: string,
  isBanned: boolean,
): Promise<{ error: Error | null }> => {
  try {
    const res = await fetch(`/api/users/${userId}/ban`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ is_banned: isBanned }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Failed to update ban status');
    }

    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
};
