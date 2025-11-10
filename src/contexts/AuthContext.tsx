/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// --- APLICAÇÃO 100% FRONTEND ---
// Não precisamos mais do Axios ou do JWT-decode aqui.

// Interface para os dados do nosso utilizador de teste
interface IUser {
  id: number;
  name: string;
  email: string;
  photoURL?: string;
  profissionalId?: number | null;
}

// Interface para o valor que o nosso Contexto vai providenciar
interface IAuthContext {
  isAuthenticated: boolean;
  user: IUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  updateUser: (newUserData: Partial<IUser>) => void;
}

// Interface para as props do nosso Provider
interface AuthProviderProps {
  children: ReactNode;
}

// --- Dados do nosso utilizador de teste ---
const FAKE_USER: IUser = {
  id: 1,
  name: 'Administrador Clinica',
  email: 'admin@clinica.com',
};
const FAKE_USER_PASSWORD = 'admin';

const AuthContext = createContext<IAuthContext>({} as IAuthContext);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Simula a verificação de uma sessão existente ao carregar a aplicação
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  // Substitua a sua função login (linhas 65-85) por esta:
  const login = async (email: string, pass: string) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (email.toLowerCase() === FAKE_USER.email && pass === FAKE_USER_PASSWORD) {
          setUser(FAKE_USER);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(FAKE_USER)); // Guarda o objeto inteiro
          resolve();
        } else {
          reject(new Error('Credenciais inválidas')); 
        }
      }, 1000);
    });
  };

  // Substitua a sua função logout (linhas 87-92) por esta:
  const logout = () => {
    localStorage.removeItem('user'); // Remove o objeto do utilizador
    setIsAuthenticated(false);
    setUser(null);
  };

  // Adicione esta nova função updateUser abaixo do logout:
  const updateUser = (newUserData: Partial<IUser>) => {
    setUser(currentUser => {
      const updatedUser = { ...currentUser!, ...newUserData };
      localStorage.setItem('user', JSON.stringify(updatedUser)); // Atualiza no localStorage
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