import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import Popover from '@mui/material/Popover';
import List from '@mui/material/List';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';

// FullCalendar
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { type EventClickArg, type DateSelectArg, type EventDropArg, type EventContentArg } from '@fullcalendar/core';

import { appointmentsService, patientsService, professionalsService } from '../services/rest-client';

// Ícones
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutline';
import CancelIcon from '@mui/icons-material/CancelOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

// Modal
import { AgendamentoFormModal } from '../components/AgendamentoFormModal';

// Tipos
type StatusAgendamento = 'Pendente' | 'Confirmado' | 'Realizado' | 'Cancelado';

interface IPaciente { id: number; nome: string; }
interface IProfissional { id: number; nome: string; }

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
    Pendente: '#f1dc1eff',
    Confirmado: '#1773beff',
    Realizado: '#0aa363ff',
    Cancelado: '#b61313ff',
};

export const AgendamentosPage = () => {
    // Estados de Dados (Vindos do Backend)
    const [agendamentos, setAgendamentos] = useState<IEvento[]>([]);
    const [listaPacientes, setListaPacientes] = useState<IPaciente[]>([]);
    const [listaProfissionais, setListaProfissionais] = useState<IProfissional[]>([]);

    // Estados de UI
    const [filtroStatus, setFiltroStatus] = useState<StatusAgendamento | 'Todos'>('Todos');
    const [filtroPacienteId, setFiltroPacienteId] = useState<number | 'Todos'>('Todos');
    const [filtroProfissionalId, setFiltroProfissionalId] = useState<number | 'Todos'>('Todos');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [eventoParaEditar, setEventoParaEditar] = useState<IEvento | null>(null);
    const [dataSelecionada, setDataSelecionada] = useState('');
    const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLElement | null>(null);
    const [eventoSelecionadoPopover, setEventoSelecionadoPopover] = useState<IEvento | null>(null);

    // --- Carregamento Inicial (Agendamentos + Pacientes + Profissionais) ---
    const carregarTudo = async () => {
        try {
            const [dataAgendamentos, dataPacientes, dataProfissionais] = await Promise.all([
                appointmentsService.getAll(),
                patientsService.getAll(),
                professionalsService.getAll()
            ]);

            if (Array.isArray(dataAgendamentos)) setAgendamentos(dataAgendamentos);

            // Map patients (name -> nome)
            if (Array.isArray(dataPacientes)) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const mappedPacientes = dataPacientes.map((p: any) => ({
                    id: p.id,
                    nome: p.name || p.nome
                }));
                setListaPacientes(mappedPacientes);
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const profList = (dataProfissionais as any).data || dataProfissionais;
            if (Array.isArray(profList)) {
                // Map professionals (name -> nome)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const mappedProfissionais = profList.map((p: any) => ({
                    id: p.id,
                    nome: p.name || p.nome
                }));
                setListaProfissionais(mappedProfissionais);
            }

        } catch (error) {
            console.error("Erro ao carregar dados:", error);
        }
    };

    useEffect(() => {
        carregarTudo();
    }, []);

    // --- Handlers do FullCalendar ---

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

    const handleEventDrop = async (dropInfo: EventDropArg) => {
        const agendamentoId = dropInfo.event.id;
        const novasDatas = {
            start: dropInfo.event.startStr,
            end: dropInfo.event.endStr || undefined
        };

        setAgendamentos(prev => prev.map(ag =>
            ag.id === agendamentoId ? { ...ag, ...novasDatas } : ag
        ));

        try {
            await appointmentsService.patch(agendamentoId, novasDatas);
        } catch (err) {
            console.error("Erro ao mover evento:", err);
            alert("Erro ao mover agendamento. Recarregando...");
            carregarTudo();
        }
    };

    // --- Handlers de CRUD ---

    // CORREÇÃO AQUI: Tipagem explícita em vez de 'any'
    const handleSalvarAgendamento = async (dados: {
        id?: string;
        title?: string;
        start: string;
        end?: string;
        status: string;
        pacienteId?: number | null;
        profissionalId?: number | null;
        pendenciaUnimed?: boolean;
    }) => {
        const payload = {
            ...dados,
            pacienteId: Number(dados.pacienteId),
            profissionalId: Number(dados.profissionalId),
            pendenciaUnimed: Boolean(dados.pendenciaUnimed)
        };

        try {
            if (dados.id) {
                // Edição
                await appointmentsService.update(dados.id, payload);
                carregarTudo();
                setIsModalOpen(false);
            } else {
                // Criação
                await appointmentsService.create(payload);
                carregarTudo();
                setIsModalOpen(false);
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar.");
        }
    };

    const handleChangeStatusDoPopover = async (novoStatus: StatusAgendamento) => {
        if (!eventoSelecionadoPopover) return;

        try {
            await appointmentsService.patch(eventoSelecionadoPopover.id, { status: novoStatus });
            setAgendamentos(prev => prev.map(ag =>
                ag.id === eventoSelecionadoPopover.id ? { ...ag, status: novoStatus } : ag
            ));
        } catch (error) {
            console.error(error);
        }
        handleClosePopover();
    };

    const handleApagarDoPopover = async () => {
        if (eventoSelecionadoPopover && window.confirm('Excluir agendamento?')) {
            try {
                await appointmentsService.delete(eventoSelecionadoPopover.id);
                setAgendamentos(prev => prev.filter(ag => ag.id !== eventoSelecionadoPopover!.id));
            } catch (error) {
                console.error(error);
            }
        }
        handleClosePopover();
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

    const handleFecharModal = () => {
        setIsModalOpen(false);
    };

    // --- Lógica de Renderização ---

    const agendamentosFiltrados = agendamentos.filter(ag =>
        (filtroStatus === 'Todos' || ag.status === filtroStatus) &&
        (filtroPacienteId === 'Todos' || ag.pacienteId === filtroPacienteId) &&
        (filtroProfissionalId === 'Todos' || ag.profissionalId === filtroProfissionalId)
    ).map(ag => {
        let displayTitle = ag.title;
        if (!displayTitle) {
            const paciente = listaPacientes.find(p => p.id === ag.pacienteId);
            const profissional = listaProfissionais.find(p => p.id === ag.profissionalId);
            displayTitle = `${paciente?.nome || 'Desconhecido'} c/ ${profissional?.nome || '?'}`;
        }
        return {
            ...ag,
            title: displayTitle,
            backgroundColor: CORES_STATUS[ag.status],
            borderColor: CORES_STATUS[ag.status],
        }
    });

    const hoje = new Date().toLocaleDateString('sv-SE');
    const agendamentosDeHoje = agendamentos.filter(ag => ag.start.startsWith(hoje));
    const totalHoje = agendamentosDeHoje.length;
    const confirmadosHoje = agendamentosDeHoje.filter(ag => ag.status === 'Confirmado').length;
    const pendentesHoje = agendamentosDeHoje.filter(ag => ag.status === 'Pendente').length;
    const realizadosHoje = agendamentosDeHoje.filter(ag => ag.status === 'Realizado').length;
    const canceladosHoje = agendamentosDeHoje.filter(ag => ag.status === 'Cancelado').length;

    const estilosCalendario = `
        .fc-daygrid-event-harness, .fc-timegrid-event-harness > .fc-timegrid-event {
            height: auto !important; min-height: 35px !important; display: flex !important; margin: 1px 0 !important;
        }
        .fc-daygrid-event, .fc-timegrid-event { width: 100% !important; padding: 0 !important; border: none !important; display: flex !important; }
        .fc-event-main, .fc-event-main-frame { height: 100%; width: 100%; display: block !important; }
        .fc-event-main-frame > .MuiBox-root { height: 100%; width: 100%; box-sizing: border-box; }
        .fc-event-pendente { background-color: ${CORES_STATUS.Pendente} !important; color: #fff !important; }
        .fc-event-confirmado { background-color: ${CORES_STATUS.Confirmado} !important; color: #fff !important; }
        .fc-event-realizado { background-color: ${CORES_STATUS.Realizado} !important; color: #fff !important; }
        .fc-event-cancelado { background-color: ${CORES_STATUS.Cancelado} !important; color: #fff !important; }
        .fc-event-pendente .MuiSvgIcon-root { color: #333 !important; }
        .fc-event-confirmado .MuiSvgIcon-root, .fc-event-realizado .MuiSvgIcon-root, .fc-event-cancelado .MuiSvgIcon-root { color: #fff !important; }
    `;

    const renderEventContent = (eventInfo: EventContentArg) => {
        const paciente = listaPacientes.find(p => p.id === Number(eventInfo.event.extendedProps.pacienteId));
        const nomePaciente = paciente ? paciente.nome : 'Paciente?';
        const pendencia = eventInfo.event.extendedProps.pendenciaUnimed;

        return (
            <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.75rem', p: '2px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <b>{eventInfo.timeText}</b>
                    {pendencia && <Tooltip title="Pendência Unimed"><WarningAmberIcon sx={{ fontSize: '1rem', marginLeft: '4px' }} /></Tooltip>}
                </Box>
                <span>{nomePaciente}</span>
            </Box>
        );
    };

    return (
        <>
            <style>{estilosCalendario}</style>
            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" component="h1">Painel de Agendamentos</Typography>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setDataSelecionada(''); setEventoParaEditar(null); setIsModalOpen(true); }}>
                        Novo Agendamento
                    </Button>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                    <Box sx={{ flexGrow: 1 }}>
                        <Paper elevation={3} sx={{ p: 2 }}>
                            <FullCalendar
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                initialView="dayGridMonth"
                                headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
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
                                eventContent={renderEventContent}
                                locale={ptBrLocale}
                                editable={true}
                                selectable={true}
                                select={handleDateSelect}
                                eventClick={handleEventClick}
                                eventDrop={handleEventDrop}
                                dayMaxEvents={true}
                                height="75vh"
                                eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
                            />
                        </Paper>
                    </Box>

                    <Box sx={{ width: { xs: '100%', md: '280px' }, flexShrink: 0 }}>
                        <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>Filtrar por</Typography>
                            <Autocomplete
                                id="filtro-paciente"
                                options={[{ id: 'Todos' as const, nome: 'Todos os Pacientes' }, ...listaPacientes]}
                                getOptionLabel={(option) => option.nome}
                                value={filtroPacienteId === 'Todos' ? { id: 'Todos', nome: 'Todos os Pacientes' } : listaPacientes.find(p => p.id === filtroPacienteId) || null}
                                onChange={(_event, newValue) => setFiltroPacienteId(newValue ? (newValue.id as number | 'Todos') : 'Todos')}
                                renderInput={(params) => <TextField {...params} label="Paciente" variant="outlined" size="small" />}
                                sx={{ mb: 2 }}
                            />
                            <Autocomplete
                                id="filtro-profissional"
                                options={[{ id: 'Todos' as const, nome: 'Todos os Profissionais' }, ...listaProfissionais]}
                                getOptionLabel={(option) => option.nome}
                                value={filtroProfissionalId === 'Todos' ? { id: 'Todos', nome: 'Todos os Profissionais' } : listaProfissionais.find(p => p.id === filtroProfissionalId) || null}
                                onChange={(_event, newValue) => setFiltroProfissionalId(newValue ? (newValue.id as number | 'Todos') : 'Todos')}
                                renderInput={(params) => <TextField {...params} label="Profissional" variant="outlined" size="small" />}
                            />
                        </Paper>

                        <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>Filtros de Status</Typography>
                            <Button fullWidth variant={filtroStatus === 'Todos' ? 'contained' : 'outlined'} onClick={() => setFiltroStatus('Todos')} sx={{ mb: 1 }}>Mostrar Todos</Button>
                            <Button fullWidth variant={filtroStatus === 'Pendente' ? 'contained' : 'outlined'} onClick={() => setFiltroStatus('Pendente')} sx={{ mb: 1 }}>Pendente</Button>
                            <Button fullWidth variant={filtroStatus === 'Confirmado' ? 'contained' : 'outlined'} onClick={() => setFiltroStatus('Confirmado')} sx={{ mb: 1 }}>Confirmado</Button>
                            <Button fullWidth variant={filtroStatus === 'Realizado' ? 'contained' : 'outlined'} onClick={() => setFiltroStatus('Realizado')} sx={{ mb: 1 }}>Realizado</Button>
                            <Button fullWidth variant={filtroStatus === 'Cancelado' ? 'contained' : 'outlined'} onClick={() => setFiltroStatus('Cancelado')}>Cancelado</Button>
                        </Paper>

                        <Paper elevation={3} sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>Resumo de Hoje</Typography>
                            <Typography>Total: {totalHoje}</Typography>
                            <Typography sx={{ color: CORES_STATUS.Confirmado }}>Confirmados: {confirmadosHoje}</Typography>
                            <Typography sx={{ color: CORES_STATUS.Pendente }}>Pendentes: {pendentesHoje}</Typography>
                            <Typography sx={{ color: CORES_STATUS.Realizado }}>Realizados: {realizadosHoje}</Typography>
                            <Typography sx={{ color: CORES_STATUS.Cancelado }}>Cancelados: {canceladosHoje}</Typography>
                        </Paper>
                    </Box>
                </Box>

                <AgendamentoFormModal
                    open={isModalOpen}
                    onClose={handleFecharModal}
                    onSave={handleSalvarAgendamento}
                    eventoParaEditar={eventoParaEditar}
                    dataSelecionada={dataSelecionada}
                    pacientes={listaPacientes}
                    profissionais={listaProfissionais}
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
                                <ListItemIcon><CheckCircleIcon fontSize="small" color="success" /></ListItemIcon>
                                <ListItemText primary="Confirmar" />
                            </ListItemButton>
                        )}
                        {eventoSelecionadoPopover?.status !== 'Cancelado' && (
                            <ListItemButton onClick={() => handleChangeStatusDoPopover('Cancelado')}>
                                <ListItemIcon><CancelIcon fontSize="small" color="warning" /></ListItemIcon>
                                <ListItemText primary="Cancelar" />
                            </ListItemButton>
                        )}
                        <Divider />
                        <ListItemButton onClick={handleApagarDoPopover}>
                            <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
                            <ListItemText primary="Excluir" />
                        </ListItemButton>
                    </List>
                </Popover>
            </Box>
        </>
    );
};