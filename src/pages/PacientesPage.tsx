import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// Importa o nosso painel de pacientes completo e blindado
import { PacientesPanel } from '../components/PacientesPanel'; 

export const PacientesPage = () => {
    return (
        <Box>
            {/* Título da Página */}
            <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
                Gestão de Pacientes
            </Typography>

            {/* Renderizamos apenas o Painel.
               Ele já contém: Busca, Filtros, Botão Adicionar, Tabela e Kanban.
            */}
            <PacientesPanel /> 
        </Box>
    );
};