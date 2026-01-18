import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';
import { UsuariosPanel } from '../components/UsuariosPanel';
import { PacientesPanel } from '../components/PacientesPanel';
import { useAuth } from '../contexts/AuthContext';

// Ícones para as abas
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';


// Importa o nosso novo painel de gestão de profissionais
import { ProfissionaisPanel } from '../components/ProfissionaisPanel';

// Componente auxiliar para renderizar o conteúdo de cada aba
const TabPanel = (props: { children?: React.ReactNode; index: number; value: number }) => {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`config-tabpanel-${index}`}
            aria-labelledby={`config-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export const ConfiguracoesPage = () => {
    const [abaAtiva, setAbaAtiva] = useState(0); // A primeira aba (índice 0) começa ativa
    const { user } = useAuth();

    // Check if user is Administrador
    const isAdmin = user?.perfil === 'Administrador';

    // A variável 'event' foi renomeada para '_event' para corrigir o aviso de não utilizada
    const handleChangeAba = (_event: React.SyntheticEvent, novaAba: number) => {
        setAbaAtiva(novaAba);
    };

    return (
        <Box>
            <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
                Configurações do Sistema
            </Typography>

            <Paper elevation={2}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={abaAtiva}
                        onChange={handleChangeAba}
                        aria-label="abas de configuração"
                        variant="scrollable"
                        scrollButtons="auto"
                    >
                        <Tab icon={<PeopleIcon />} iconPosition="start" label="Pacientes" />
                        <Tab icon={<WorkIcon />} iconPosition="start" label="Profissionais" />
                        {isAdmin && <Tab icon={<AccountCircleIcon />} iconPosition="start" label="Usuários" />}

                    </Tabs>
                </Box>

                {/* CONTEÚDO DE CADA ABA */}
                <TabPanel value={abaAtiva} index={0}>
                    <PacientesPanel />
                </TabPanel>
                <TabPanel value={abaAtiva} index={1}>
                    {/* O nosso novo componente de gestão de profissionais é renderizado aqui */}
                    <ProfissionaisPanel />
                </TabPanel>
                {isAdmin && (
                    <TabPanel value={abaAtiva} index={2}>
                        <UsuariosPanel />
                    </TabPanel>
                )}


            </Paper>
        </Box>
    );
};