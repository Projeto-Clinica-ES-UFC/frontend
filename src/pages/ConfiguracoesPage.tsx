import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';
import { UsuariosPanel } from '../components/UsuariosPanel';
import { useAuth } from '../contexts/AuthContext';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';

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
    const [abaAtiva, setAbaAtiva] = useState(0);
    const { user } = useAuth();

    // Check if user is Administrador
    const isAdmin = user?.perfil === 'Administrador';

    const handleChangeAba = (_event: React.SyntheticEvent, novaAba: number) => {
        setAbaAtiva(novaAba);
    };

    if (!isAdmin) {
        return (
            <Box>
                <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
                    Configurações do Sistema
                </Typography>
                <Paper elevation={2} sx={{ p: 3 }}>
                    <Typography variant="body1">
                        Seu perfil não possui configurações adicionais disponíveis.
                    </Typography>
                </Paper>
            </Box>
        );
    }

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
                        <Tab icon={<AccountCircleIcon />} iconPosition="start" label="Usuários" />
                    </Tabs>
                </Box>

                {/* CONTEÚDO DE CADA ABA */}
                <TabPanel value={abaAtiva} index={0}>
                    <UsuariosPanel />
                </TabPanel>

            </Paper>
        </Box>
    );
};