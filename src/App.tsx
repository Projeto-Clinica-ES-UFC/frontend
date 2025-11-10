import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { PacientesPage } from './pages/PacientesPage';
import { ProntuarioPage } from './pages/ProntuarioPage';
import { AgendamentosPage } from './pages/AgendamentosPage';
import { AgendaProfissionalPage } from './pages/AgendaProfissionalPage';
import { FinanceiroPage } from './pages/FinanceiroPage';
import { RelatoriosPage } from './pages/RelatoriosPage';
import { TarefasPage } from './pages/TarefasPage';
import { MeuPerfilPage } from './pages/MeuPerfilPage';
import { AnamnesePage } from './pages/AnamnesePage';
import { ConfiguracoesPage } from './pages/ConfiguracoesPage';
// 1. Importações dos novos componentes de Layout e da Página Inicial
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';

// 2. Componente de Rota Protegida (versão final e simplificada)
//    Sua única responsabilidade é verificar a autenticação e renderizar o Layout
//    ou redirecionar para o login.
const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  // Enquanto o AuthContext verifica se existe uma sessão, mostramos um aviso.
  if (loading) {
    // Pode ser substituído por um componente de Spinner/Loading mais elaborado no futuro.
    return <div>Carregando sessão...</div>; 
  }

  // Se o usuário estiver autenticado, renderiza o componente de Layout.
  // O <Layout /> contém a <Outlet />, que irá renderizar a página da rota atual (ex: HomePage).
  // Se não estiver autenticado, redireciona para a página de login.
  return isAuthenticated ? <Layout /> : <Navigate to="/login" replace />;
};


// 3. O Roteador Principal da Aplicação (versão final e limpa)
function App() {
  return (
    <Routes>
      {/* Rota Pública: /login 
        - Acessível por todos.
        - O componente Login será renderizado aqui.
      */}
      <Route path="/login" element={<Login />} />
      
      {/* Grupo de Rotas Protegidas:
        - Todas as rotas declaradas aqui dentro usarão o `ProtectedRoute` como "casca".
        - O `ProtectedRoute` irá garantir que apenas usuários logados possam acessá-las.
      */}
      <Route element={<ProtectedRoute />}>
        
        {/* A rota "index" é a página padrão quando o usuário acessa "/" */}
        <Route index path="/" element={<HomePage />} />
        
        <Route path="/pacientes" element={<PacientesPage />} />

        <Route path="/pacientes/:pacienteId/prontuario" element={<ProntuarioPage />} />

        <Route path="/pacientes/:pacienteId/anamnese" element={<AnamnesePage />} />

        <Route path="/agendamentos" element={<AgendamentosPage />} />

        <Route path="/agenda-profissional" element={<AgendaProfissionalPage />} />

        <Route path="/financeiro" element={<FinanceiroPage />} />

        <Route path="/tarefas" element={<TarefasPage />} />

        <Route path="/relatorios" element={<RelatoriosPage />} />

        <Route path="/configuracoes" element={<ConfiguracoesPage />} />

        <Route path="/meu-perfil" element={<MeuPerfilPage />} />

      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;