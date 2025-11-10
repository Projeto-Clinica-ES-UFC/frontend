import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Popover from '@mui/material/Popover';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';

// Importações do FullCalendar
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br'; // Importação do Locale
import { type EventClickArg, type DateSelectArg, type EventDropArg } from '@fullcalendar/core';

// Ícones para Ações Rápidas
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutline';
import CancelIcon from '@mui/icons-material/CancelOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';

// Importa o Modal
import { AgendamentoFormModal } from '../components/AgendamentoFormModal';
// Importa o hook de autenticação
import { useAuth } from '../contexts/AuthContext';

// --- Interfaces e Dados Simulados ---

type StatusAgendamento = 'Pendente' | 'Confirmado' | 'Realizado' | 'Cancelado';

// Tipos base para dados partilhados
interface IPacienteBase {
    id: number;
    nome: string;
}
interface IProfissionalBase {
    id: number;
    nome: string;
}

// Tipos para esta página (filtros)
interface IEspecialidade {
    id: number | 'Todas';
    nome: string;
}
interface IProfissional extends IProfissionalBase {
    id: number; // Sobrescreve para ser apenas number
    especialidade: string;
}

interface IEvento {
    id: string;
    title?: string;
    start: string;
    end?: string;
    status: StatusAgendamento;
    pacienteId: number | null;
    profissionalId: number | null;
    pendenciaUnimed?: boolean;
}

const CORES_STATUS: Record<StatusAgendamento, string> = {
    Pendente: '#f4a261', Confirmado: '#0077b6', Realizado: '#2a9d8f', Cancelado: '#e76f51',
};

// Dados simulados (fonte única de verdade)
const PACIENTES_EXEMPLO: IPacienteBase[] = [
    { id: 1, nome: 'Ana Clara Sousa' }, { id: 2, nome: 'Lucas Ferreira Lima' }, { id: 3, nome: 'Mariana Costa e Silva' },
];
const ESPECIALIDADES_EXEMPLO: IEspecialidade[] = [
    { id: 1, nome: 'Fisioterapia' }, { id: 2, nome: 'Psicologia' }, { id: 3, nome: 'Terapia Ocupacional' },
];
const PROFISSIONAIS_EXEMPLO: IProfissional[] = [
    { id: 1, nome: 'Dr. João da Silva', especialidade: 'Fisioterapia' },
    { id: 2, nome: 'Dra. Maria Oliveira', especialidade: 'Psicologia' },
];
const AGENDAMENTOS_EXEMPLO: IEvento[] = [
    { id: '1', start: '2025-10-21T10:30:00', status: 'Confirmado', pacienteId: 1, profissionalId: 1 },
    { id: '2', start: '2025-10-22T14:00:00', end: '2025-10-22T15:00:00', status: 'Realizado', pacienteId: 2, profissionalId: 2 },
    { id: '3', start: '2025-10-23', status: 'Pendente', pacienteId: 3, profissionalId: 1, pendenciaUnimed: true },
    { id: '4', start: '2025-10-23T11:00:00', status: 'Cancelado', pacienteId: 1, profissionalId: 2 },
];
// --- Fim dos Dados Simulados ---

export const AgendaProfissionalPage = () => {
    const { user } = useAuth(); // Hook de autenticação

    // --- Lógica de Filtro Padrão Inteligente ---
    const profissionalLogado = PROFISSIONAIS_EXEMPLO.find(p => p.id === user?.profissionalId);
    const especialidadeDoProfissionalLogado = profissionalLogado 
        ? ESPECIALIDADES_EXEMPLO.find(e => e.nome === profissionalLogado.especialidade)
        : null;

    // Estados de Filtro (iniciam com os dados do utilizador)
    const [especialidadeFiltro, setEspecialidadeFiltro] = useState<IEspecialidade | null>(especialidadeDoProfissionalLogado || null);
    const [profissionalFiltro, setProfissionalFiltro] = useState<IProfissionalBase | null>(profissionalLogado || null);
    
    const [agendamentos, setAgendamentos] = useState<IEvento[]>(AGENDAMENTOS_EXEMPLO);
    
    // Estados para Interatividade
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [eventoParaEditar, setEventoParaEditar] = useState<IEvento | null>(null);
    const [dataSelecionada, setDataSelecionada] = useState('');
    const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLElement | null>(null);
    const [eventoSelecionadoPopover, setEventoSelecionadoPopover] = useState<IEvento | null>(null);
    
    // Lógica de filtragem
    const profissionaisFiltradosPorEspecialidade = useMemo(() => {
        if (!especialidadeFiltro) return PROFISSIONAIS_EXEMPLO;
        return PROFISSIONAIS_EXEMPLO.filter(p => p.especialidade === especialidadeFiltro.nome);
    }, [especialidadeFiltro]);

    const agendamentosFiltrados = useMemo(() => {
        const agsFiltrados = agendamentos.filter(ag => {
            const profissional = PROFISSIONAIS_EXEMPLO.find(p => p.id === ag.profissionalId);
            if (!profissional) return false;
            const especialidadeOk = !especialidadeFiltro || profissional.especialidade === especialidadeFiltro.nome;
            const profissionalOk = !profissionalFiltro || ag.profissionalId === profissionalFiltro.id;
            return especialidadeOk && profissionalOk;
        });

        return agsFiltrados.map(ag => {
            let displayTitle = ag.title;
            if (!displayTitle) {
                const paciente = PACIENTES_EXEMPLO.find(p => p.id === ag.pacienteId);
                displayTitle = `${paciente?.nome || 'Paciente?'}`;
            }
            return {
                ...ag,
                title: displayTitle,
                backgroundColor: CORES_STATUS[ag.status],
                borderColor: CORES_STATUS[ag.status],
            }
        });
    }, [agendamentos, especialidadeFiltro, profissionalFiltro]);
    
    
    // Handlers de Interatividade
    
    const handleDateSelect = (selectInfo: DateSelectArg) => {
        setDataSelecionada(selectInfo.startStr + 'T09:00');
        setEventoParaEditar(null);
        setIsModalOpen(true);
    };

    const handleEventClick = (clickInfo: EventClickArg) => {
        const eventoId = clickInfo.event.id;
        const evento = agendamentos.find(ag => ag.id === eventoId);
        if (evento) {
            setEventoSelecionadoPopover(evento);
            setPopoverAnchorEl(clickInfo.el);
        }
    };
    
    const handleFecharModal = () => setIsModalOpen(false);

    // Tipo de dados corrigido (sem 'any')
    const handleSalvarAgendamento = (dadosDoEvento: {
        id?: string;
        start: string;
        end?: string;
        status: string;
        pacienteId: number | null;
        profissionalId: number | null;
        pendenciaUnimed?: boolean;
    }) => {
        if (dadosDoEvento.id) {
            setAgendamentos(atuais => atuais.map(ag => ag.id === dadosDoEvento.id ? { ...ag, ...dadosDoEvento } as IEvento : ag));
        } else {
            const novoId = String(Date.now());
            const novoAgendamento: IEvento = {
                id: novoId,
                start: dadosDoEvento.start,
                end: dadosDoEvento.end,
                status: dadosDoEvento.status as StatusAgendamento,
                pacienteId: dadosDoEvento.pacienteId || null,
                profissionalId: dadosDoEvento.profissionalId || null,
                pendenciaUnimed: dadosDoEvento.pendenciaUnimed || false,
            };
            setAgendamentos(atuais => [...atuais, novoAgendamento]);
        }
        handleFecharModal();
    };

    const handleEventDrop = (dropInfo: EventDropArg) => {
        setAgendamentos(atuais => 
            atuais.map(ag => 
                ag.id === dropInfo.event.id 
                    ? { ...ag, start: dropInfo.event.startStr, end: dropInfo.event.endStr || undefined } 
                    : ag
            )
        );
    };

    const handleClosePopover = () => {
        setPopoverAnchorEl(null);
        setEventoSelecionadoPopover(null);
    };

    const handleEditarDoPopover = () => {
        if (eventoSelecionadoPopover) {
            setEventoParaEditar(eventoSelecionadoPopover);
            setIsModalOpen(true);
        }
        handleClosePopover();
    };

    const handleChangeStatusDoPopover = (novoStatus: StatusAgendamento) => {
        if (eventoSelecionadoPopover) {
            setAgendamentos(atuais => atuais.map(ag => 
                ag.id === eventoSelecionadoPopover.id ? { ...ag, status: novoStatus } : ag
            ));
        }
        handleClosePopover();
    };

    const handleApagarDoPopover = () => {
        if (eventoSelecionadoPopover) {
            if (window.confirm('Tem a certeza?')) {
                setAgendamentos(atuais => atuais.filter(ag => ag.id !== eventoSelecionadoPopover!.id));
            }
        }
        handleClosePopover();
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" sx={{ mb: { xs: 2, md: 0 } }}>
                    Agenda por Profissional
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Autocomplete
                        id="filtro-especialidade"
                        options={ESPECIALIDADES_EXEMPLO.filter(e => e.id !== 'Todas')} // Filtra 'Todas'
                        getOptionLabel={(option) => option.nome}
                        value={especialidadeFiltro}
                        onChange={(_event, newValue) => {
                            setEspecialidadeFiltro(newValue);
                            setProfissionalFiltro(null);
                        }}
                        renderInput={(params) => <TextField {...params} label="Filtrar por Especialidade" size="small" sx={{ minWidth: 220 }} />}
                    />
                    <Autocomplete
                        id="filtro-profissional"
                        options={profissionaisFiltradosPorEspecialidade}
                        getOptionLabel={(option) => option.nome}
                        value={profissionalFiltro}
                        onChange={(_event, newValue) => {
                            setProfissionalFiltro(newValue);
                        }}
                        renderInput={(params) => <TextField {...params} label="Filtrar por Profissional" size="small" sx={{ minWidth: 220 }} />}
                        disabled={!especialidadeFiltro}
                    />
                </Box>
            </Box>

            <Paper elevation={3} sx={{ p: 2 }}>
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    events={agendamentosFiltrados.map(ag => ({
                        id: ag.id,
                        title: ag.title,
                        start: ag.start,
                        end: ag.end,
                        backgroundColor: ag.backgroundColor,
                        borderColor: ag.borderColor,
                        extendedProps: {
                          status: ag.status,
                          pacienteId: ag.pacienteId,
                          profissionalId: ag.profissionalId,
                          pendenciaUnimed: ag.pendenciaUnimed,
                        } 
                    }))}
                    locale={ptBrLocale}
                    nowIndicator={true}
                    height="75vh"
                    editable={true}
                    selectable={true}
                    select={handleDateSelect}
                    eventClick={handleEventClick}
                    eventDrop={handleEventDrop}
                />
            </Paper>

            <AgendamentoFormModal
                open={isModalOpen}
                onClose={handleFecharModal}
                onSave={handleSalvarAgendamento}
                eventoParaEditar={eventoParaEditar}
                dataSelecionada={dataSelecionada}
                pacientes={PACIENTES_EXEMPLO}
                profissionais={PROFISSIONAIS_EXEMPLO}
            />

            <Popover
                open={Boolean(popoverAnchorEl)}
                anchorEl={popoverAnchorEl}
                onClose={handleClosePopover}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            >
                <List dense>
                    <ListItemButton onClick={handleEditarDoPopover}>
                        <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                        <ListItemText primary="Editar" />
                    </ListItemButton>
                    {eventoSelecionadoPopover?.status !== 'Confirmado' && (
                        <ListItemButton onClick={() => handleChangeStatusDoPopover('Confirmado')}>
                            <ListItemIcon><CheckCircleIcon fontSize="small" color="success"/></ListItemIcon>
                            <ListItemText primary="Confirmar" />
                        </ListItemButton>
                    )}
                    {eventoSelecionadoPopover?.status !== 'Cancelado' && (
                        <ListItemButton onClick={() => handleChangeStatusDoPopover('Cancelado')}>
                            <ListItemIcon><CancelIcon fontSize="small" color="warning"/></ListItemIcon>
                            <ListItemText primary="Cancelar" />
                        </ListItemButton>
                    )}
                    <Divider />
                    <ListItemButton onClick={handleApagarDoPopover}>
                        <ListItemIcon><DeleteIcon fontSize="small" color="error"/></ListItemIcon>
                        <ListItemText primary="Excluir" />
                    </ListItemButton>
                </List>
            </Popover>
        </Box>
    );
};