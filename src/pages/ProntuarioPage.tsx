import React, { useState, useEffect } from 'react';
import { formatDateBR } from '../utils/dateUtils';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';

// Importações para a Timeline do @mui/lab
import Timeline from '@mui/lab/Timeline';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import TimelineDot from '@mui/lab/TimelineDot';

import { patientsService } from '../services/rest-client';

// Ícones
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventIcon from '@mui/icons-material/Event';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AddIcon from '@mui/icons-material/Add';
import NoteIcon from '@mui/icons-material/Note';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutline';

// Modal
import { HistoricoFormModal } from '../components/HistoricoFormModal';

// Interfaces (Alinhadas com o Backend)
interface IPaciente {
    id: number;
    nome: string;
    dataNascimento: string;
    nomeResponsavel: string;
    sexo?: 'M' | 'F' | 'Outro';
}

interface IHistoricoEvento {
    id: number;
    data: string; // YYYY-MM-DD
    tipo: 'Consulta' | 'Avaliação' | 'Observação';
    titulo: string;
    descricao?: string;
}

interface IHistoricoEventoForm {
    data: string;
    tipo: 'Consulta' | 'Avaliação' | 'Observação';
    titulo: string;
    descricao?: string;
}

const getTimelineIcon = (tipo: IHistoricoEvento['tipo']) => {
    switch (tipo) {
        case 'Consulta': return <EventIcon />;
        case 'Avaliação': return <AssignmentIcon />;
        case 'Observação': return <NoteIcon />;
        default: return <NoteIcon />;
    }
};

// Mapping helpers for backend EN <-> frontend PT-BR
const tipoToType: Record<string, string> = {
    'Consulta': 'Consultation',
    'Avaliação': 'Evaluation',
    'Observação': 'Observation',
};

const typeToTipo: Record<string, IHistoricoEvento['tipo']> = {
    'Consultation': 'Consulta',
    'Evaluation': 'Avaliação',
    'Observation': 'Observação',
};

// Map backend response to frontend interface
const mapBackendToFrontend = (record: Record<string, unknown>): IHistoricoEvento => ({
    id: record.id as number,
    data: typeof record.date === 'string'
        ? record.date.split('T')[0]
        : new Date(record.date as number).toISOString().split('T')[0],
    tipo: typeToTipo[record.type as string] || 'Observação',
    titulo: record.title as string,
    descricao: record.description as string | undefined,
});

export const ProntuarioPage = () => {
    const { pacienteId } = useParams<{ pacienteId: string }>();
    const navigate = useNavigate();

    // Estados
    const [paciente, setPaciente] = useState<IPaciente | null>(null);
    const [historico, setHistorico] = useState<IHistoricoEvento[]>([]);
    const [loading, setLoading] = useState(true);
    const [isHistoricoModalOpen, setIsHistoricoModalOpen] = useState(false);

    // Filtros
    const [filtroDataInicio, setFiltroDataInicio] = useState('');
    const [filtroDataFim, setFiltroDataFim] = useState('');

    // 1. Carregar Dados Iniciais
    useEffect(() => {
        if (!pacienteId) return;

        const carregarProntuario = async () => {
            setLoading(true);
            try {
                // Busca dados do Paciente
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const resPac: any = await patientsService.getById(pacienteId);
                if (resPac) {
                    setPaciente({
                        id: resPac.id,
                        nome: resPac.name || resPac.nome,
                        dataNascimento: resPac.dateOfBirth || resPac.birthDate || resPac.dataNascimento,
                        nomeResponsavel: resPac.responsibleName || resPac.guardianName || resPac.nomeResponsavel,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        sexo: (resPac.gender || resPac.sexo) as any
                    });
                } else {
                    setPaciente(null);
                }

                // Busca Histórico (Timeline)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const response: any = await patientsService.getHistory(pacienteId);
                const dadosHist = Array.isArray(response) ? response : (response?.data || []);
                if (Array.isArray(dadosHist)) {
                    // Map backend fields to frontend and sort by date
                    const mapped = dadosHist.map(mapBackendToFrontend);
                    setHistorico(mapped.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()));
                } else {
                    setHistorico([]);
                }

            } catch (error) {
                console.error("Erro ao carregar prontuário:", error);
            } finally {
                setLoading(false);
            }
        };

        carregarProntuario();
    }, [pacienteId]);

    // 2. Salvar Novo Registro (POST)
    const handleSalvarHistorico = async (eventoData: IHistoricoEventoForm, targetPacienteId: number) => {
        if (!paciente || paciente.id !== targetPacienteId) return;

        try {
            // Map frontend PT-BR fields to backend EN fields
            const payload = {
                date: eventoData.data + 'T00:00:00.000Z', // Convert YYYY-MM-DD to ISO datetime
                type: tipoToType[eventoData.tipo] || 'Observation',
                title: eventoData.titulo,
                description: eventoData.descricao,
            };

            await patientsService.createHistory(targetPacienteId, payload);

            // Reload the list
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const response: any = await patientsService.getHistory(targetPacienteId);
            const dadosHist = Array.isArray(response) ? response : (response?.data || []);
            if (Array.isArray(dadosHist)) {
                const mapped = dadosHist.map(mapBackendToFrontend);
                setHistorico(mapped.sort((a: IHistoricoEvento, b: IHistoricoEvento) => new Date(b.data).getTime() - new Date(a.data).getTime()));
            }
            setIsHistoricoModalOpen(false);

        } catch (error) {
            console.error("Erro ao salvar:", error);
            alert("Erro ao salvar registro no histórico.");
        }
    };

    // 3. Editar Registro (placeholder - opens modal for edit)
    const handleEditarHistorico = (_evento: IHistoricoEvento) => {
        // TODO: Implement edit modal - for now just alert
        alert("Funcionalidade de edição será implementada em breve.");
    };

    // 4. Apagar Registro (DELETE)
    const handleApagarHistorico = async (eventoId: number) => {
        if (!paciente) return;
        if (!window.confirm("Deseja realmente apagar este registro?")) return;

        try {
            await patientsService.deleteHistory(paciente.id, eventoId);
            // Reload the list
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const response: any = await patientsService.getHistory(paciente.id);
            const dadosHist = Array.isArray(response) ? response : (response?.data || []);
            if (Array.isArray(dadosHist)) {
                const mapped = dadosHist.map(mapBackendToFrontend);
                setHistorico(mapped.sort((a: IHistoricoEvento, b: IHistoricoEvento) => new Date(b.data).getTime() - new Date(a.data).getTime()));
            }
        } catch (error) {
            console.error("Erro ao apagar:", error);
            alert("Erro ao apagar registro.");
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!paciente) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                <IconButton onClick={() => navigate('/pacientes')} sx={{ mr: 1 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography>Paciente não encontrado.</Typography>
            </Box>
        );
    }

    // Filtragem Local
    const historicoFiltrado = historico.filter(evento => {
        if (!filtroDataInicio && !filtroDataFim) return true;
        const dataEvento = new Date(evento.data + 'T00:00:00');
        const inicioOk = !filtroDataInicio || dataEvento >= new Date(filtroDataInicio + 'T00:00:00');
        const fimOk = !filtroDataFim || dataEvento <= new Date(filtroDataFim + 'T00:00:00');
        return inicioOk && fimOk;
    });

    return (
        <React.Fragment>
            <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <IconButton component={RouterLink} to="/pacientes" sx={{ mr: 1 }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h4" component="h1">
                        Prontuário de {paciente.nome}
                    </Typography>
                </Box>

                <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>Informações do Paciente</Typography>
                    <Typography><strong>Data de Nascimento:</strong> {formatDateBR(paciente.dataNascimento)}</Typography>
                    <Typography><strong>Responsável:</strong> {paciente.nomeResponsavel}</Typography>
                </Paper>

                <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
                    Histórico / Linha do Tempo
                </Typography>

                <Paper elevation={1} sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <TextField
                            size="small" label="De" type="date" InputLabelProps={{ shrink: true }}
                            sx={{ width: { xs: 'calc(50% - 16px)', sm: 150 } }}
                            value={filtroDataInicio} onChange={(e) => setFiltroDataInicio(e.target.value)}
                        />
                        <TextField
                            size="small" label="Até" type="date" InputLabelProps={{ shrink: true }}
                            sx={{ width: { xs: 'calc(50% - 16px)', sm: 150 } }}
                            value={filtroDataFim} onChange={(e) => setFiltroDataFim(e.target.value)}
                        />
                    </Box>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsHistoricoModalOpen(true)}>
                        Adicionar Registro
                    </Button>
                </Paper>

                {historicoFiltrado.length > 0 ? (
                    <Timeline position="alternate" sx={{ [`& .${timelineItemClasses.root}:before`]: { flex: 0, padding: 0 } }}>
                        {historicoFiltrado.map((evento, index) => (
                            <TimelineItem key={evento.id}>
                                <TimelineOppositeContent sx={{ m: 'auto 0' }} align="right" variant="body2" color="text.secondary">
                                    {formatDateBR(evento.data)}
                                </TimelineOppositeContent>
                                <TimelineSeparator>
                                    {index > 0 && <TimelineConnector />}
                                    <TimelineDot color="primary">
                                        {getTimelineIcon(evento.tipo)}
                                    </TimelineDot>
                                    {index < historicoFiltrado.length - 1 && <TimelineConnector />}
                                </TimelineSeparator>
                                <TimelineContent sx={{ py: '12px', px: 2 }}>
                                    <Paper elevation={3} sx={{ p: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <Box>
                                                <Typography variant="h6" component="span">
                                                    {evento.titulo}
                                                </Typography>
                                                <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 1 }}>
                                                    ({evento.tipo})
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <IconButton size="small" onClick={() => handleEditarHistorico(evento)} title="Editar">
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" onClick={() => handleApagarHistorico(evento.id)} title="Apagar" color="error">
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </Box>
                                        {evento.descricao && <Typography sx={{ whiteSpace: 'pre-wrap' }}>{evento.descricao}</Typography>}
                                    </Paper>
                                </TimelineContent>
                            </TimelineItem>
                        ))}
                    </Timeline>
                ) : (
                    <Typography sx={{ textAlign: 'center', color: 'text.secondary', py: 4 }}>
                        Nenhum registro encontrado para o período selecionado.
                    </Typography>
                )}

                {paciente && (
                    <HistoricoFormModal
                        open={isHistoricoModalOpen}
                        onClose={() => setIsHistoricoModalOpen(false)}
                        onSave={handleSalvarHistorico}
                        pacienteId={paciente.id}
                    />
                )}

            </Box>
        </React.Fragment>
    );
};