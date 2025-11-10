import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';

// Importações para a Timeline do @mui/lab
import Timeline from '@mui/lab/Timeline';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import TimelineDot from '@mui/lab/TimelineDot';

// Ícones
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventIcon from '@mui/icons-material/Event';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear'; 
import ArticleIcon from '@mui/icons-material/Article'; // Ícone para Anamnese

// Importa o modal (este é o único necessário relacionado ao modal)
import { HistoricoFormModal } from '../components/HistoricoFormModal';


// --- Simulação de Dados ---
interface IPaciente {
    id: number;
    nome: string;
    dataNascimento: string;
    nomeResponsavel: string;
    sexo: 'M' | 'F' | 'Outro';
}

interface IHistoricoEvento {
    id: number;
    data: string; // Formato AAAA-MM-DD
    tipo: 'Consulta' | 'Avaliação' | 'Anexo' | 'Observação';
    titulo: string;
    descricao?: string;
    anexoUrl?: string;
    anexoNome?: string;
}

interface IHistoricoEventoForm {
    data: string;
    tipo: 'Consulta' | 'Avaliação' | 'Anexo' | 'Observação';
    titulo: string;
    descricao?: string;
    anexo?: File | null;
}

const getPacienteById = (id: number): IPaciente | null => {
    const pacientesSimulados: IPaciente[] = [
        { id: 1, nome: 'Ana Clara Sousa', dataNascimento: '2018-08-15', nomeResponsavel: 'João Sousa', sexo: 'F' },
        { id: 2, nome: 'Lucas Ferreira Lima', dataNascimento: '2019-03-22', nomeResponsavel: 'Ricardo Lima', sexo: 'M' },
        { id: 3, nome: 'Mariana Costa e Silva', dataNascimento: '2017-03-01', nomeResponsavel: 'Joana Silva', sexo: 'F' },
    ];
    return pacientesSimulados.find(p => p.id === id) || null;
}

const getHistoricoByPacienteId = (id: number): IHistoricoEvento[] => {
    if (id === 1) {
        return ([
            { id: 1, data: '2025-10-21', tipo: 'Consulta', titulo: 'Consulta de Rotina', descricao: 'Paciente apresentou boa evolução.' },
            { id: 2, data: '2025-09-15', tipo: 'Avaliação', titulo: 'Avaliação Inicial', descricao: 'Realizada avaliação motora e cognitiva.' },
            { id: 3, data: '2025-09-15', tipo: 'Anexo', titulo: 'Exame_RaioX.pdf', anexoUrl: '#', anexoNome: 'Exame_RaioX.pdf' },
            { id: 4, data: '2025-08-01', tipo: 'Observação', titulo: 'Observação da Terapeuta', descricao: 'Necessário ajuste no exercício X.' },
        ] as IHistoricoEvento[]).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    }
    return [];
}

const getTimelineIcon = (tipo: IHistoricoEvento['tipo']) => {
    switch (tipo) {
        case 'Consulta': return <EventIcon />;
        case 'Avaliação': return <AssignmentIcon />;
        case 'Anexo': return <AttachFileIcon />;
        default: return <Typography variant="caption">●</Typography>;
    }
};
// --- Fim da Simulação ---


export const ProntuarioPage = () => {
    const { pacienteId } = useParams<{ pacienteId: string }>();
    const navigate = useNavigate();
    
    const [paciente, setPaciente] = useState<IPaciente | null>(null); 
    const [historico, setHistorico] = useState<IHistoricoEvento[]>([]);
    const [loading, setLoading] = useState(true);
    const [isHistoricoModalOpen, setIsHistoricoModalOpen] = useState(false);
    const [filtroDataInicio, setFiltroDataInicio] = useState(''); 
    const [filtroDataFim, setFiltroDataFim] = useState(''); 

    useEffect(() => {
        setLoading(true);
        const idNum = Number(pacienteId);
        if (!isNaN(idNum)) {
            setTimeout(() => {
                setPaciente(getPacienteById(idNum));
                setHistorico(getHistoricoByPacienteId(idNum));
                setLoading(false);
            }, 500);
        } else {
            setPaciente(null);
            setHistorico([]);
            setLoading(false);
        }
    }, [pacienteId]);

    const handleSalvarHistorico = (eventoData: IHistoricoEventoForm, targetPacienteId: number) => {
        if (paciente && paciente.id === targetPacienteId) { 
            const novoEvento: IHistoricoEvento = {
                id: Date.now(),
                data: eventoData.data,
                tipo: eventoData.tipo,
                titulo: eventoData.titulo,
                descricao: eventoData.descricao,
                anexoUrl: eventoData.anexo ? URL.createObjectURL(eventoData.anexo) : undefined, 
                anexoNome: eventoData.anexo ? eventoData.anexo.name : undefined,
            };
            setHistorico(historicoAtual => 
                [novoEvento, ...historicoAtual].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
            ); 
        }
        setIsHistoricoModalOpen(false);
    };

    if (loading) {
        return <Typography>Carregando prontuário...</Typography>;
    }

    if (!paciente) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                 <IconButton onClick={() => navigate('/pacientes')} sx={{ mr: 1 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography>Paciente não encontrado.</Typography>
            </Box>
        );
    }

    const historicoFiltrado = historico.filter(evento => {
        if (!filtroDataInicio && !filtroDataFim) {
            return true;
        }
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
                    <Typography variant="h6">Informações do Paciente</Typography>
                    <Typography><strong>Data Nasc.:</strong> {new Date(paciente.dataNascimento).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</Typography>
                    <Typography><strong>Responsável:</strong> {paciente.nomeResponsavel}</Typography>
                    {/* --- INÍCIO DA ADIÇÃO DO BOTÃO --- */}
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
                    {/* --- FIM DA ADIÇÃO --- */}
                </Paper>

                <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
                    Histórico / Linha do Tempo
                </Typography>

                <Paper elevation={1} sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <TextField 
                            size="small" 
                            label="Data Início" 
                            type="date" 
                            InputLabelProps={{ shrink: true }} 
                            sx={{ width: { xs: 'calc(50% - 16px)', sm: 150} }}
                            value={filtroDataInicio} 
                            onChange={(e) => setFiltroDataInicio(e.target.value)} 
                        />
                        <TextField 
                            size="small" 
                            label="Data Fim" 
                            type="date" 
                            InputLabelProps={{ shrink: true }} 
                            sx={{ width: { xs: 'calc(50% - 16px)', sm: 150} }}
                            value={filtroDataFim} 
                            onChange={(e) => setFiltroDataFim(e.target.value)} 
                        />
                        <Button 
                            size="small" 
                            startIcon={<ClearIcon />}
                            onClick={() => { 
                                setFiltroDataInicio('');
                                setFiltroDataFim('');
                            }}
                            disabled={!filtroDataInicio && !filtroDataFim}
                        >
                            Limpar Filtros
                        </Button>
                    </Box>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsHistoricoModalOpen(true)}>Adicionar Registro</Button>
                </Paper>

                {historicoFiltrado.length > 0 ? ( 
                    <Timeline 
                        position="alternate" 
                        sx={{ [`& .${timelineItemClasses.root}:before`]: { flex: 0, padding: 0 } }}
                    >
                        {historicoFiltrado.map((evento, index) => ( 
                            <TimelineItem key={evento.id}>
                                <TimelineOppositeContent sx={{ m: 'auto 0' }} align="right" variant="body2" color="text.secondary">
                                    {new Date(evento.data + 'T00:00:00').toLocaleDateString('pt-BR', {timeZone: 'UTC'})}
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
                                                size="small" 
                                                startIcon={<AttachFileIcon />} 
                                                href={evento.anexoUrl} 
                                                target="_blank"
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
                    <Typography sx={{ textAlign: 'center', color: 'text.secondary' }}>Nenhum registro encontrado para o período selecionado.</Typography>
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