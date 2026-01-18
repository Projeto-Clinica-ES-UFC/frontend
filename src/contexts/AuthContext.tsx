/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authClient } from '../lib/auth-client';

// Interface do Usuário
// Adapting to Better Auth user schema + existing fields
interface IUser {
  id: string; // Changed from number to string to match Better Auth
  name: string;
  email: string;
  photoURL?: string;
  perfil?: string;
  image?: string;
  emailVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface IAuthContext {
  isAuthenticated: boolean;
  user: IUser | null;
  loading: boolean;
  login: (email: string, pass: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (newUserData: Partial<IUser>) => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<IAuthContext>({} as IAuthContext);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { data: session, isPending } = authClient.useSession();
  const [user, setUser] = useState<IUser | null>(null);

  // Sync state with session
  useEffect(() => {
    if (session?.user) {
      const u = session.user;
      setUser({
        ...u,
        id: u.id,
        name: u.name,
        email: u.email,
        // Map better-auth 'image' to 'photoURL' for compatibility
        photoURL: u.image || undefined,
        // Role from custom field (defaults to Profissional if not set)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        perfil: (u as any).role || 'Profissional'
      } as IUser);
    } else {
      setUser(null);
    }
  }, [session]);

  // --- FUNÇÃO DE LOGIN ---
  const login = async (email: string, pass: string, rememberMe?: boolean) => {
    const { error } = await authClient.signIn.email({
      email,
      password: pass,
      rememberMe,
    });

    if (error) {
      console.error("Erro no login:", error);
      throw new Error(error.message || "Falha ao realizar login");
    }
    // Session state is updated automatically by useSession hook
  };

  const logout = async () => {
    await authClient.signOut();
    // Session state is updated automatically by useSession hook
  };

  const updateUser = (newUserData: Partial<IUser>) => {
    // Note: This only updates local state. 
    // To persist changes, you should likely call an API endpoint.
    setUser(currentUser => {
      if (!currentUser) return null;
      return { ...currentUser, ...newUserData };
    });
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading: isPending, login, logout, updateUser }}>
      {!isPending && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
