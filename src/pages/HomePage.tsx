import { useState, useEffect, useMemo } from 'react';
import { formatDateBR } from '../utils/dateUtils';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';

import { appointmentsService, patientsService, externalService } from '../services/rest-client';

// Ícones
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAddAlt1';
import EventIcon from '@mui/icons-material/Event';

// Interfaces (Simplificadas para o Dashboard)
interface Verse {
    text: string;
    reference: string;
}

interface IEvento {
    id: string;
    start: string;
    status: string;
    pacienteId: number | null;
}

interface IPaciente {
    id: number;
    nome: string;
}

const VERSICULO_PADRAO: Verse = {
    text: "O Senhor é o meu pastor; de nada terei falta.",
    reference: "Salmos 23:1"
};

export const HomePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Estados de Dados
    const [verse, setVerse] = useState<Verse>({ text: 'Carregando versículo...', reference: '' });
    const [agendamentos, setAgendamentos] = useState<IEvento[]>([]);
    const [pacientes, setPacientes] = useState<IPaciente[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    // 1. Carregar Versículo (API Externa)
    useEffect(() => {
        const fetchRandomVerse = async () => {
            try {
                const data = await externalService.getRandomBibleVerse();
                if (data && data.text && data.reference) {
                    setVerse({ text: data.text.trim(), reference: data.reference });
                } else {
                    setVerse(VERSICULO_PADRAO);
                }
            } catch (error) {
                console.error("Erro versículo:", error);
                setVerse(VERSICULO_PADRAO);
            }
        };
        fetchRandomVerse();
    }, []);

    // 2. Carregar Dados do Dashboard (Backend Próprio)
    useEffect(() => {
        const carregarDashboard = async () => {
            try {
                const [dataAg, dataPacResponse] = await Promise.all([
                    appointmentsService.getAll(),
                    patientsService.getAll()
                ]);

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const dataPac = (dataPacResponse as any).data || dataPacResponse;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const listAg = (dataAg as any).data || dataAg;

                if (Array.isArray(listAg)) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const mappedAg = listAg.map((a: any) => ({
                        id: String(a.id),
                        start: a.start,
                        status: a.status,
                        pacienteId: a.patientId ?? a.pacienteId
                    }));
                    setAgendamentos(mappedAg);
                }

                if (Array.isArray(dataPac)) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const mappedPac = dataPac.map((p: any) => ({
                        id: p.id,
                        nome: p.name || p.nome
                    }));
                    setPacientes(mappedPac);
                }

            } catch (error) {
                console.error("Erro ao carregar dashboard:", error);
            } finally {
                setLoadingData(false);
            }
        };

        carregarDashboard();
    }, []);

    // 3. Cálculos do Dashboard (Memorizados para performance)
    const dashboardStats = useMemo(() => {
        const hojeStr = new Date().toLocaleDateString('sv-SE'); // YYYY-MM-DD
        const agora = new Date();

        // Filtra agendamentos de hoje
        const agendamentosHoje = agendamentos.filter(ag => ag.start.startsWith(hojeStr));

        // Estatísticas de Hoje
        const stats = {
            confirmados: agendamentosHoje.filter(ag => ag.status === 'Confirmado').length,
            pendentes: agendamentosHoje.filter(ag => ag.status === 'Pendente').length,
            realizados: agendamentosHoje.filter(ag => ag.status === 'Realizado').length
        };

        // Próximos Agendamentos (Futuros, ordenados)
        const proximos = agendamentos
            .filter(ag => new Date(ag.start) > agora && ag.status !== 'Cancelado')
            .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
            .slice(0, 3) // Pega apenas os 3 próximos
            .map(ag => {
                const paciente = pacientes.find(p => p.id === ag.pacienteId);
                return {
                    id: ag.id,
                    hora: new Date(ag.start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                    data: formatDateBR(ag.start),
                    pacienteNome: paciente?.nome || 'Paciente Desconhecido',
                    status: ag.status
                };
            });

        return { stats, proximos };
    }, [agendamentos, pacientes]);

    return (
        <Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" sx={{ mb: { xs: 2, md: 0 } }}>
                    Bem-vindo, {user?.name || 'Usuário'}!
                </Typography>

                {/* Campo de Busca Visual (Futuramente pode redirecionar para Configurações > Pacientes) */}
                <TextField
                    size="small"
                    placeholder="Pesquisar..."
                    variant="outlined"
                    InputProps={{ startAdornment: (<InputAdornment position="start"> <SearchIcon /> </InputAdornment>) }}
                    sx={{ width: { xs: '100%', md: '300px' } }}
                />
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>

                {/* Versículo */}
                <Box sx={{ flexBasis: '100%' }}>
                    <Paper elevation={2} sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                        <Typography variant="body1" sx={{ fontStyle: 'italic', fontSize: '1.1rem' }}>
                            "{verse.text}"
                        </Typography>
                        <Typography variant="body2" sx={{ textAlign: 'right', fontWeight: 'bold', mt: 1 }}>
                            - {verse.reference}
                        </Typography>
                    </Paper>
                </Box>

                {/* Ações Rápidas */}
                <Box sx={{ flexBasis: { xs: '100%', sm: 'calc(50% - 12px)' }, flexGrow: 1 }}>
                    <Paper elevation={2} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Typography variant="h6" gutterBottom> Ações Rápidas </Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
                            <Button
                                variant="contained"
                                startIcon={<EventIcon />}
                                onClick={() => navigate('/agendamentos')}
                            >
                                Novo Agendamento
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<PersonAddIcon />}
                                onClick={() => navigate('/configuracoes')} // Pacientes fica em Configurações
                            >
                                Adicionar Paciente
                            </Button>
                        </Box>
                    </Paper>
                </Box>

                {/* Resumo de Hoje */}
                <Box sx={{ flexBasis: { xs: '100%', sm: 'calc(50% - 12px)' }, flexGrow: 1 }}>
                    <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                        <Typography variant="h6" gutterBottom> Resumo de Hoje </Typography>
                        {loadingData ? <CircularProgress size={20} /> : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Typography variant="body1" sx={{ color: 'success.main' }}>
                                    <strong>{dashboardStats.stats.confirmados}</strong> Agendamentos Confirmados
                                </Typography>
                                <Typography variant="body1" sx={{ color: 'warning.main' }}>
                                    <strong>{dashboardStats.stats.pendentes}</strong> Pendências de Confirmação
                                </Typography>
                                <Typography variant="body1" sx={{ color: 'info.main' }}>
                                    <strong>{dashboardStats.stats.realizados}</strong> Atendimentos Realizados
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Box>



                {/* Próximos Agendamentos (Dinâmico) */}
                <Box sx={{ flexBasis: { xs: '100%', md: 'calc(50% - 12px)' }, flexGrow: 1 }}>
                    <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                        <Typography variant="h6" gutterBottom> Próximos Agendamentos </Typography>
                        {loadingData ? <CircularProgress size={20} /> : (
                            <List dense>
                                {dashboardStats.proximos.length > 0 ? (
                                    dashboardStats.proximos.map(prox => (
                                        <div key={prox.id}>
                                            <ListItem>
                                                <ListItemText
                                                    primary={`${prox.data} às ${prox.hora} - ${prox.pacienteNome}`}
                                                    secondary={`Status: ${prox.status}`}
                                                />
                                            </ListItem>
                                            <Divider component="li" />
                                        </div>
                                    ))
                                ) : (
                                    <ListItem>
                                        <ListItemText
                                            primary="Nenhum agendamento futuro encontrado."
                                            sx={{ color: 'text.secondary', fontStyle: 'italic' }}
                                        />
                                    </ListItem>
                                )}
                            </List>
                        )}
                    </Paper>
                </Box>
            </Box>
        </Box>
    );
};