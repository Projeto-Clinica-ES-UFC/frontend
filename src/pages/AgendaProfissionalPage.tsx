import { useState, useMemo, useEffect } from 'react';
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

// FullCalendar
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { type EventClickArg, type DateSelectArg, type EventDropArg } from '@fullcalendar/core';

import { appointmentsService, patientsService, professionalsService, specialtiesService } from '../services/rest-client';

// Ícones
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutline';
import CancelIcon from '@mui/icons-material/CancelOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';

// Componentes e Contextos
import { AgendamentoFormModal } from '../components/AgendamentoFormModal';
import { useAuth } from '../contexts/AuthContext';

// Interfaces (Alinhadas com o Backend)
type StatusAgendamento = 'Pendente' | 'Confirmado' | 'Realizado' | 'Cancelado';

interface IPaciente { id: number; nome: string; }
interface IEspecialidade { id: number; nome: string; }
interface IProfissional { id: number; nome: string; especialidade: string; }

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

export const AgendaProfissionalPage = () => {
    const { user } = useAuth();

    // Estados de Dados (Backend)
    const [agendamentos, setAgendamentos] = useState<IEvento[]>([]);
    const [listaPacientes, setListaPacientes] = useState<IPaciente[]>([]);
    const [listaProfissionais, setListaProfissionais] = useState<IProfissional[]>([]);
    const [listaEspecialidades, setListaEspecialidades] = useState<IEspecialidade[]>([]);

    // Estados de Filtro
    const [especialidadeFiltro, setEspecialidadeFiltro] = useState<IEspecialidade | null>(null);
    const [profissionalFiltro, setProfissionalFiltro] = useState<IProfissional | null>(null);
    
    // Estados de UI
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [eventoParaEditar, setEventoParaEditar] = useState<IEvento | null>(null);
    const [dataSelecionada, setDataSelecionada] = useState('');
    const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLElement | null>(null);
    const [eventoSelecionadoPopover, setEventoSelecionadoPopover] = useState<IEvento | null>(null);

    // Carregamento de Dados
    const carregarTudo = async () => {
        try {
            const [dataAg, dataPac, dataProf, dataEsp] = await Promise.all([
                appointmentsService.getAll(),
                patientsService.getAll(),
                professionalsService.getAll(),
                specialtiesService.getAll()
            ]);

            if (Array.isArray(dataAg)) setAgendamentos(dataAg);
            if (Array.isArray(dataPac)) setListaPacientes(dataPac);
            if (Array.isArray(dataProf)) setListaProfissionais(dataProf);
            if (Array.isArray(dataEsp)) setListaEspecialidades(dataEsp);

        } catch (error) {
            console.error("Erro ao carregar dados:", error);
        }
    };

    useEffect(() => {
        carregarTudo();
    }, []);

    // Configura filtros iniciais baseados no usuário logado
    useEffect(() => {
        if (listaProfissionais.length > 0 && user?.email) {
            const profLogado = listaProfissionais.find(p => p.nome === user.name); 
            
            if (profLogado) {
                setProfissionalFiltro(profLogado);
                const esp = listaEspecialidades.find(e => e.nome === profLogado.especialidade);
                if (esp) setEspecialidadeFiltro(esp);
            }
        }
    }, [listaProfissionais, user, listaEspecialidades]);

    // Filtragem Dinâmica
    const profissionaisFiltrados = useMemo(() => {
        if (!especialidadeFiltro) return listaProfissionais;
        return listaProfissionais.filter(p => p.especialidade === especialidadeFiltro.nome);
    }, [especialidadeFiltro, listaProfissionais]);

    const eventosFiltrados = useMemo(() => {
        const filtrados = agendamentos.filter(ag => {
            const prof = listaProfissionais.find(p => p.id === ag.profissionalId);
            if (!prof) return false;

            const especialidadeOk = !especialidadeFiltro || prof.especialidade === especialidadeFiltro.nome;
            const profissionalOk = !profissionalFiltro || ag.profissionalId === profissionalFiltro.id;
            
            return especialidadeOk && profissionalOk;
        });

        return filtrados.map(ag => {
            const paciente = listaPacientes.find(p => p.id === ag.pacienteId);
            const tituloDisplay = ag.title || paciente?.nome || 'Paciente Desconhecido';
            
            return {
                ...ag,
                title: tituloDisplay,
                backgroundColor: CORES_STATUS[ag.status],
                borderColor: CORES_STATUS[ag.status],
                extendedProps: {
                    status: ag.status,
                    pacienteId: ag.pacienteId,
                    profissionalId: ag.profissionalId,
                    pendenciaUnimed: ag.pendenciaUnimed
                }
            };
        });
    }, [agendamentos, especialidadeFiltro, profissionalFiltro, listaProfissionais, listaPacientes]);

    // Handlers
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

    // CORREÇÃO AQUI: Tipagem explícita para evitar 'any'
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
                await appointmentsService.update(dados.id, payload);
            } else {
                await appointmentsService.create(payload);
            }
            carregarTudo();
            setIsModalOpen(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleEventDrop = async (dropInfo: EventDropArg) => {
        const novasDatas = {
            start: dropInfo.event.startStr,
            end: dropInfo.event.endStr || undefined
        };
        // Atualização Otimista
        setAgendamentos(prev => prev.map(ag => ag.id === dropInfo.event.id ? { ...ag, ...novasDatas } : ag));
        
        try {
            await appointmentsService.patch(dropInfo.event.id, novasDatas);
        } catch {
            carregarTudo();
        }
    };

    // Popover Actions
    const handleClosePopover = () => { setPopoverAnchorEl(null); setEventoSelecionadoPopover(null); };
    
    const handleChangeStatus = async (novoStatus: StatusAgendamento) => {
        if (!eventoSelecionadoPopover) return;
        try {
            await appointmentsService.patch(eventoSelecionadoPopover.id, { status: novoStatus });
            setAgendamentos(prev => prev.map(ag => ag.id === eventoSelecionadoPopover.id ? { ...ag, status: novoStatus } : ag));
            handleClosePopover();
        } catch (error) {
            console.error(error);
        }
    };

    const handleApagar = async () => {
        if (!eventoSelecionadoPopover) return;
        if(confirm('Excluir?')) {
            try {
                await appointmentsService.delete(eventoSelecionadoPopover.id);
                setAgendamentos(prev => prev.filter(ag => ag.id !== eventoSelecionadoPopover!.id));
                handleClosePopover();
            } catch (error) {
                 console.error(error);
            }
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">Agenda por Profissional</Typography>
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Autocomplete
                        options={listaEspecialidades}
                        getOptionLabel={(option) => option.nome}
                        value={especialidadeFiltro}
                        onChange={(_, newValue) => { setEspecialidadeFiltro(newValue); setProfissionalFiltro(null); }}
                        renderInput={(params) => <TextField {...params} label="Filtrar por Especialidade" size="small" sx={{ minWidth: 220 }} />}
                    />
                    <Autocomplete
                        options={profissionaisFiltrados}
                        getOptionLabel={(option) => option.nome}
                        value={profissionalFiltro}
                        onChange={(_, newValue) => setProfissionalFiltro(newValue)}
                        renderInput={(params) => <TextField {...params} label="Filtrar por Profissional" size="small" sx={{ minWidth: 220 }} />}
                        disabled={!especialidadeFiltro && profissionaisFiltrados.length === listaProfissionais.length} 
                    />
                </Box>
            </Box>

            <Paper elevation={3} sx={{ p: 2 }}>
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
                    events={eventosFiltrados}
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
                onClose={() => setIsModalOpen(false)}
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
                    <ListItemButton onClick={() => { setEventoParaEditar(eventoSelecionadoPopover); setIsModalOpen(true); handleClosePopover(); }}>
                        <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                        <ListItemText primary="Editar" />
                    </ListItemButton>
                    <ListItemButton onClick={() => handleChangeStatus('Confirmado')}>
                        <ListItemIcon><CheckCircleIcon fontSize="small" color="success"/></ListItemIcon>
                        <ListItemText primary="Confirmar" />
                    </ListItemButton>
                    <ListItemButton onClick={() => handleChangeStatus('Cancelado')}>
                        <ListItemIcon><CancelIcon fontSize="small" color="warning"/></ListItemIcon>
                        <ListItemText primary="Cancelar" />
                    </ListItemButton>
                    <Divider />
                    <ListItemButton onClick={handleApagar}>
                        <ListItemIcon><DeleteIcon fontSize="small" color="error"/></ListItemIcon>
                        <ListItemText primary="Excluir" />
                    </ListItemButton>
                </List>
            </Popover>
        </Box>
    );
};