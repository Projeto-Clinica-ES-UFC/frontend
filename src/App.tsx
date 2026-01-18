import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { PacientesPage } from './pages/PacientesPage';
import { ProntuarioPage } from './pages/ProntuarioPage';
import { AgendamentosPage } from './pages/AgendamentosPage';

// Financeiro e Relatórios removidos

import { MeuPerfilPage } from './pages/MeuPerfilPage';
import { ConfiguracoesPage } from './pages/ConfiguracoesPage';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';

// Componente de Rota Protegida
const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Carregando sessão...</div>;
  }

  return isAuthenticated ? <Layout /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Routes>
      {/* Rota Pública */}
      <Route path="/login" element={<Login />} />

      {/* Rotas Protegidas */}
      <Route element={<ProtectedRoute />}>

        <Route index path="/" element={<HomePage />} />

        <Route path="/pacientes" element={<PacientesPage />} />

        <Route path="/pacientes/:pacienteId/prontuario" element={<ProntuarioPage />} />

        <Route path="/agendamentos" element={<AgendamentosPage />} />



        {/* Financeiro removido */}



        {/* Relatórios removido */}

        <Route path="/configuracoes" element={<ConfiguracoesPage />} />

        <Route path="/meu-perfil" element={<MeuPerfilPage />} />

      </Route>

      {/* Rota de Catch-all (qualquer endereço errado volta para a Home) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;