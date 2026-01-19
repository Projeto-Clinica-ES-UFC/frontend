/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, type ReactNode } from 'react';
import { authClient } from '../lib/auth-client';

// Interface do Usuário
// Adapting to Better Auth user schema + existing fields
export interface IUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
  role?: string; // Custom field
  // Backward compatibility fields (optional)
  photoURL?: string;
  perfil?: string;
}

interface IAuthContext {
  isAuthenticated: boolean;
  user: IUser | null;
  loading: boolean;
  login: (email: string, pass: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (newUserData: Partial<IUser>) => void; // Deprecated, triggers refresh
  refreshSession: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<IAuthContext>({} as IAuthContext);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { data: session, isPending, isRefetching, refetch } = authClient.useSession();

  // --- DEBUGGING ---
  console.log("AuthContext: isPending=", isPending, "isRefetching=", isRefetching, "session=", session);

  // Derived user object
  const user: IUser | null = session?.user ? {
    ...session.user,
    // Add backward compatibility mappings if needed
    photoURL: session.user.image || undefined,
    perfil: (session.user as any).role || 'Profissional',
    role: (session.user as any).role || 'Profissional'
  } : null;

  console.log("AuthContext: derived user=", user);

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
  };

  const logout = async () => {
    await authClient.signOut();
  };

  const refreshSession = async () => {
    await refetch();
  };

  const updateUser = (_newUserData: Partial<IUser>) => {
    // Trigger a session refresh to get the latest data from the server
    refetch();
  };

  const isAuthenticated = !!user;

  // If initial load, we might want to show nothing or a spinner, but isPending handles that usually
  // The original code returned children only if !isPending for the intial check?
  // Let's keep the behavior if possible, but useSession isPending might be true on re-fetches too.
  // Actually original code: !isPending && children.

  // Combine loading states
  const isLoading = isPending || isRefetching;

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading: isLoading, login, logout, updateUser, refreshSession }}>
      {isLoading ? null : children}
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
