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
import AttachFileIcon from '@mui/icons-material/AttachFile';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import ArticleIcon from '@mui/icons-material/Article';

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
    tipo: 'Consulta' | 'Avaliação' | 'Anexo' | 'Observação';
    titulo: string;
    descricao?: string;
    anexoUrl?: string; // URL retornada do backend se houver upload
    anexoNome?: string;
}

interface IHistoricoEventoForm {
    data: string;
    tipo: 'Consulta' | 'Avaliação' | 'Anexo' | 'Observação';
    titulo: string;
    descricao?: string;
    anexo?: File | null;
}

const getTimelineIcon = (tipo: IHistoricoEvento['tipo']) => {
    switch (tipo) {
        case 'Consulta': return <EventIcon />;
        case 'Avaliação': return <AssignmentIcon />;
        case 'Anexo': return <AttachFileIcon />;
        default: return <Typography variant="caption">●</Typography>;
    }
};

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
                        dataNascimento: resPac.birthDate || resPac.dataNascimento,
                        nomeResponsavel: resPac.guardianName || resPac.nomeResponsavel,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        sexo: (resPac.gender || resPac.sexo) as any
                    });
                } else {
                    setPaciente(null);
                }

                // Busca Histórico (Timeline)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const dadosHist: any = await patientsService.getHistory(pacienteId);
                if (Array.isArray(dadosHist)) {
                    // Ordena por data (mais recente primeiro)
                    setHistorico(dadosHist.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()));
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
            // Nota: Se fosse enviar arquivo real, usaríamos FormData. 
            // Aqui enviamos JSON com os metadados do evento.
            const payload = {
                data: eventoData.data,
                tipo: eventoData.tipo,
                titulo: eventoData.titulo,
                descricao: eventoData.descricao,
                // anexoNome: eventoData.anexo?.name // Opcional, se o backend suportar salvar nome sem arquivo
            };

            await patientsService.createHistory(targetPacienteId, payload);

            // Recarrega a lista para mostrar o novo item
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const dadosHist: any = await patientsService.getHistory(targetPacienteId);
            if (Array.isArray(dadosHist)) {
                setHistorico(dadosHist.sort((a: IHistoricoEvento, b: IHistoricoEvento) => new Date(b.data).getTime() - new Date(a.data).getTime()));
            }
            setIsHistoricoModalOpen(false);

        } catch (error) {
            console.error("Erro ao salvar:", error);
            alert("Erro ao salvar registro no histórico.");
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
                    <Typography><strong>Data Nasc.:</strong> {formatDateBR(paciente.dataNascimento)}</Typography>
                    <Typography><strong>Responsável:</strong> {paciente.nomeResponsavel}</Typography>

                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ArticleIcon />}
                        component={RouterLink}
                        to={`/pacientes/${paciente.id}/anamnese`}
                        sx={{ mt: 2 }}
                    >
                        Ver / Editar Anamnese
                    </Button>
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
                        <Button
                            size="small" startIcon={<ClearIcon />}
                            onClick={() => { setFiltroDataInicio(''); setFiltroDataFim(''); }}
                            disabled={!filtroDataInicio && !filtroDataFim}
                        >
                            Limpar
                        </Button>
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
                                    <TimelineDot color={evento.tipo === 'Anexo' ? 'secondary' : 'primary'}>
                                        {getTimelineIcon(evento.tipo)}
                                    </TimelineDot>
                                    {index < historicoFiltrado.length - 1 && <TimelineConnector />}
                                </TimelineSeparator>
                                <TimelineContent sx={{ py: '12px', px: 2 }}>
                                    <Paper elevation={3} sx={{ p: 2 }}>
                                        <Typography variant="h6" component="span">
                                            {evento.titulo}
                                        </Typography>
                                        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 1 }}>
                                            ({evento.tipo})
                                        </Typography>
                                        {evento.descricao && <Typography sx={{ whiteSpace: 'pre-wrap' }}>{evento.descricao}</Typography>}
                                        {evento.anexoUrl && (
                                            <Button
                                                size="small" startIcon={<AttachFileIcon />}
                                                href={evento.anexoUrl} target="_blank"
                                                download={evento.anexoNome || evento.titulo}
                                            >
                                                Ver Anexo {evento.anexoNome && `(${evento.anexoNome})`}
                                            </Button>
                                        )}
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