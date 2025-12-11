/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// Interface do Usuário
interface IUser {
  id: number;
  name: string;
  email: string;
  photoURL?: string;
  perfil?: string; 
}

interface IAuthContext {
  isAuthenticated: boolean;
  user: IUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  updateUser: (newUserData: Partial<IUser>) => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<IAuthContext>({} as IAuthContext);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Ao iniciar, verifica se tem usuário e token salvos
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  // --- FUNÇÃO DE LOGIN ---
  const login = async (email: string, pass: string) => {
    
    // --- 🚨 BACKDOOR DE EMERGÊNCIA (APAGUE ISSO QUANDO O SISTEMA ESTIVER RODANDO) ---
    // Isso permite você entrar mesmo se o backend estiver vazio ou com erro.
    if (email === 'admin@clinica.com' && pass === 'admin') {
        const fakeAdmin = {
            id: 999,
            name: 'Admin Temporário',
            email: 'admin@clinica.com',
            perfil: 'Administrador'
        };
        localStorage.setItem('token', 'token-de-emergencia-bypass');
        localStorage.setItem('user', JSON.stringify(fakeAdmin));
        setUser(fakeAdmin);
        setIsAuthenticated(true);
        alert("⚠️ ATENÇÃO: Você entrou com Login de Emergência (Offline). Algumas funções que dependem do banco podem não funcionar.");
        return; // Para aqui e não chama o backend
    }
    // -------------------------------------------------------------------------------

    try {
      const response = await fetch('http://localhost:3000/api/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          password: pass 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao fazer login');
      }

      // Tenta achar o token e o usuário na resposta
      const token = data.token || data.accessToken || (data.session ? data.session.token : null);
      const userData = data.user || (data.session ? data.session.user : null);

      if (token && userData) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        throw new Error("Login realizado, mas token não encontrado na resposta.");
      }

    } catch (error) {
      console.error("Erro no login:", error);
      throw error; 
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  const updateUser = (newUserData: Partial<IUser>) => {
    setUser(currentUser => {
      const updatedUser = { ...currentUser!, ...newUserData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout, updateUser }}>
      {!loading && children}
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