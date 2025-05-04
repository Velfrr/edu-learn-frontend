import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { getCurrentUser, signIn, signOut } from '../api/auth';
import { User } from '../types/user';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const refreshUser = async () => {
    try {
      const { user, error } = await getCurrentUser();
      if (error) throw error;

      if (user && user.isBanned) {
        await signOut();
        throw new Error(t('actions.accountBannedDescription'));
      }

      setUser(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      setUser(null);

      if (error instanceof Error && error.message.includes('banned')) {
        toast({
          title: t('actions.accountBanned'),
          description: t('actions.accountBannedDescription'),
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { user, error } = await signIn(email, password);
      if (error) throw error;

      if (user.isBanned) {
        await signOut();
        throw new Error(t('actions.accountBannedDescription'));
      }

      setUser(user);
      toast({
        title: t('actions.loginSuccess'),
        description: t('actions.welcomeBack', {
          name: user?.fullName || 'User',
        }),
      });
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: t('actions.loginFailed'),
        description: t('actions.invalidCredentials'),
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await signOut();
      setUser(null);
      toast({
        title: t('actions.loggedOut'),
        description: t('actions.loggedOutDescription'),
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: t('actions.loginFailed'),
        description:
          (error as Error).message || t('actions.invalidCredentials'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user && !user.isBanned,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
