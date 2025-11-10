// Mantém o useState se precisar de algo específico da página
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

// Ícone para a pesquisa
import SearchIcon from '@mui/icons-material/Search';

// Importa o nosso painel de pacientes completo e reutilizável
import { PacientesPanel } from '../components/PacientesPanel'; 

export const PacientesPage = () => {

    return (
        <Box>
            {/* CABEÇALHO DA PÁGINA (mantém a sua estrutura) */}
            <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
                Gestão de Pacientes
            </Typography>

            {/* BARRA DE FERRAMENTAS COM PESQUISA (mantém a sua estrutura) */}
            {/* Poderíamos ligar esta pesquisa ao PacientesPanel, mas vamos simplificar por agora */}
            <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Pesquisar por nome ou CPF do paciente..."
                    variant="outlined"
                    // value={searchTerm} // Desativado por enquanto
                    // onChange={(e) => setSearchTerm(e.target.value)} // Desativado por enquanto
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />
            </Paper>

            {/* ÁREA DE CONTEÚDO PRINCIPAL - AGORA RENDERIZA O PAINEL */}
            {/* O PacientesPanel agora contém:
                - Botão Adicionar Paciente
                - Seletor de vista (Lista / Kanban)
                - Tabela de Pacientes (com Editar/Excluir) OU Quadro Kanban (com Drag-and-Drop)
                - Lógica de estado e Modal para Adicionar/Editar 
            */}
            <PacientesPanel /> 
        </Box>
    );
};