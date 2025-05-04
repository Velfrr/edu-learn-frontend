import axios from 'axios';
import { UserRole } from '../enums/roles';
import { User } from '../types/user';

export const signUp = async (
  email: string,
  password: string,
  fullName: string,
  role: UserRole,
): Promise<{ user: User | null; error: Error | null }> => {
  try {
    const { data } = await axios.post('/api/auth/signup', {
      email,
      password,
      fullName,
      role,
    });

    if (data?.user) {
      return {
        user: {
          id: data.user.id,
          email,
          fullName,
          role,
          createdAt: new Date().toISOString(),
        },
        error: null,
      };
    }

    return { user: null, error: new Error('Failed to create user') };
  } catch (error) {
    console.error('Signup error:', error);
    return { user: null, error: error as Error };
  }
};

export const signIn = async (
  email: string,
  password: string,
): Promise<{ user: User | null; error: Error | null }> => {
  try {
    const { data } = await axios.post('/api/auth/signin', {
      email,
      password,
    });

    if (data?.user) {
      try {
        const { data: profileData } = await axios.get(
          `/api/profiles/${data.user.id}`,
        );

        if (!profileData) {
          const userData = data.user.user_metadata || {};
          const defaultRole = userData.role || UserRole.STUDENT;
          const defaultName = userData.full_name || email.split('@')[0];

          await axios.post('/api/profiles', {
            id: data.user.id,
            full_name: defaultName,
            role: defaultRole,
            created_at: new Date().toISOString(),
          });

          await axios.patch(`/api/profiles/${data.user.id}`, {
            last_active: new Date().toISOString(),
          });

          return {
            user: {
              id: data.user.id,
              email: data.user.email || '',
              fullName: defaultName,
              isBanned: false,
              role: defaultRole as UserRole,
              createdAt: new Date().toISOString(),
              lastActive: new Date().toISOString(),
            },
            error: null,
          };
        }

        await axios.patch(`/api/profiles/${data.user.id}`, {
          last_active: new Date().toISOString(),
        });

        return {
          user: {
            id: data.user.id,
            email: data.user.email || '',
            fullName: profileData.full_name,
            role: profileData.role as UserRole,
            isBanned: profileData.is_banned || false,
            createdAt: profileData.created_at,
            lastActive: new Date().toISOString(),
          },
          error: null,
        };
      } catch (profileError) {
        console.error('Profile error:', profileError);
        return {
          user: {
            id: data.user.id,
            email: data.user.email || '',
            fullName: data.user.user_metadata?.full_name || email.split('@')[0],
            isBanned: false,
            role:
              (data.user.user_metadata?.role as UserRole) || UserRole.STUDENT,
            createdAt: new Date().toISOString(),
          },
          error: null,
        };
      }
    }

    return { user: null, error: new Error('Failed to sign in') };
  } catch (error) {
    console.error('Sign in error:', error);
    return { user: null, error: error as Error };
  }
};

export const signOut = async (): Promise<{ error: Error | null }> => {
  try {
    await axios.post('/api/auth/signout');
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
};

export const getCurrentUser = async (): Promise<{
  user: User | null;
  error: Error | null;
}> => {
  try {
    const { data: sessionData } = await axios.get('/api/auth/session');

    if (!sessionData?.session) {
      return { user: null, error: null };
    }

    const { data: authData } = await axios.get('/api/auth/user');

    if (!authData?.user) {
      return { user: null, error: null };
    }

    const { data: profileData } = await axios.get(
      `/api/profiles/${authData.user.id}`,
    );

    if (!profileData) {
      const userData = authData.user.user_metadata || {};
      const defaultRole = userData.role || UserRole.STUDENT;
      const defaultName =
        userData.full_name || authData.user.email?.split('@')[0] || 'User';

      await axios.post('/api/profiles', {
        id: authData.user.id,
        full_name: defaultName,
        role: defaultRole,
        created_at: new Date().toISOString(),
        last_active: new Date().toISOString(),
      });

      return {
        user: {
          id: authData.user.id,
          email: authData.user.email || '',
          fullName: defaultName,
          role: defaultRole as UserRole,
          createdAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
        },
        error: null,
      };
    }

    return {
      user: {
        id: authData.user.id,
        email: authData.user.email || '',
        fullName: profileData.full_name,
        role: profileData.role as UserRole,
        createdAt: profileData.created_at,
        lastActive: profileData.last_active,
      },
      error: null,
    };
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return { user: null, error: error as Error };
  }
};
