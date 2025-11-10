import { useState } from 'react';
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
import Tooltip from '@mui/material/Tooltip'; // Importação que faltava

// Importações do FullCalendar
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';

// Tipos do FullCalendar que vamos usar
import { type EventClickArg, type DateSelectArg, type EventDropArg, type EventContentArg } from '@fullcalendar/core';

// Ícones
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutline';
import CancelIcon from '@mui/icons-material/CancelOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

// O nosso componente de Modal
import { AgendamentoFormModal } from '../components/AgendamentoFormModal';

// Tipos e Interfaces
type StatusAgendamento = 'Pendente' | 'Confirmado' | 'Realizado' | 'Cancelado';

interface IPaciente {
    id: number;
    nome: string;
}
interface IProfissional {
    id: number;
    nome: string;
}

const PACIENTES_EXEMPLO: IPaciente[] = [
    { id: 1, nome: 'Ana Clara Sousa' },
    { id: 2, nome: 'Lucas Ferreira Lima' },
    { id: 3, nome: 'Mariana Costa e Silva' },
];
const PROFISSIONAIS_EXEMPLO: IProfissional[] = [
    { id: 1, nome: 'Dr. João da Silva' },
    { id: 2, nome: 'Dra. Maria Oliveira' },
];

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
    Pendente: '#f1dc1eff', // Amarelo (Texto Branco)
    Confirmado: '#1773beff', // Azul (Texto Branco)
    Realizado: '#0aa363ff', // Verde (Texto Branco)
    Cancelado: '#b61313ff', // Vermelho (Texto Branco)
};

const DADOS_INICIAIS: IEvento[] = [
    { id: '1', start: '2025-10-21T10:30:00', status: 'Confirmado', pacienteId: 1, profissionalId: 1 },
    { id: '2', start: '2025-10-22T14:00:00', end: '2025-10-22T15:00:00', status: 'Realizado', pacienteId: 2, profissionalId: 2 },
    { id: '3', start: '2025-10-23', status: 'Cancelado', pacienteId: 3, profissionalId: 1, pendenciaUnimed: true },
    { id: '4', start: '2025-10-23T11:00:00', status: 'Pendente', pacienteId: 1, profissionalId: 2 },
];

export const AgendamentosPage = () => {
    const [agendamentos, setAgendamentos] = useState<IEvento[]>(DADOS_INICIAIS);
    const [filtroStatus, setFiltroStatus] = useState<StatusAgendamento | 'Todos'>('Todos');
    const [filtroPacienteId, setFiltroPacienteId] = useState<number | 'Todos'>('Todos');
    const [filtroProfissionalId, setFiltroProfissionalId] = useState<number | 'Todos'>('Todos');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [eventoParaEditar, setEventoParaEditar] = useState<IEvento | null>(null);
    const [dataSelecionada, setDataSelecionada] = useState('');
    const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLElement | null>(null);
    const [eventoSelecionadoPopover, setEventoSelecionadoPopover] = useState<IEvento | null>(null);

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
    
    const handleFecharModal = () => {
        setIsModalOpen(false);
    };

    const handleSalvarAgendamento = (dadosDoEvento: { id?: string, title?: string, start: string, end?: string, status: string, pacienteId?: number | null, profissionalId?: number | null | null, pendenciaUnimed?: boolean }) => {
        if (dadosDoEvento.id) {
            setAgendamentos(agendamentosAtuais =>
                agendamentosAtuais.map(ag =>
                    ag.id === dadosDoEvento.id ? { ...ag, ...dadosDoEvento } as IEvento : ag
                )
            );
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
            setAgendamentos(agendamentosAtuais => [...agendamentosAtuais, novoAgendamento]);
        }
        handleFecharModal();
    };

    const handleEventDrop = (dropInfo: EventDropArg) => {
        setAgendamentos(agendamentosAtuais => 
            agendamentosAtuais.map(ag => 
                ag.id === dropInfo.event.id 
                    ? { 
                        ...ag, 
                        start: dropInfo.event.startStr, 
                        end: dropInfo.event.endStr || undefined
                      } 
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
            setAgendamentos(agendamentosAtuais => agendamentosAtuais.map(ag => 
                ag.id === eventoSelecionadoPopover.id ? { ...ag, status: novoStatus } : ag
            ));
        }
        handleClosePopover();
    };

    const handleApagarDoPopover = () => {
        if (eventoSelecionadoPopover) {
            if (window.confirm('Tem a certeza que deseja excluir este agendamento?')) {
                setAgendamentos(agendamentosAtuais => agendamentosAtuais.filter(ag => ag.id !== eventoSelecionadoPopover!.id));
            }
        }
        handleClosePopover();
    };

    const agendamentosFiltrados = agendamentos.filter(ag => 
        (filtroStatus === 'Todos' || ag.status === filtroStatus) &&
        (filtroPacienteId === 'Todos' || ag.pacienteId === filtroPacienteId) &&
        (filtroProfissionalId === 'Todos' || ag.profissionalId === filtroProfissionalId)
    ).map(ag => {
        let displayTitle = ag.title;
        if (!displayTitle) {
            const paciente = PACIENTES_EXEMPLO.find(p => p.id === ag.pacienteId);
            const profissional = PROFISSIONAIS_EXEMPLO.find(p => p.id === ag.profissionalId);
            displayTitle = `${paciente?.nome || '?'} c/ ${profissional?.nome || '?'}`;
        }
        return {
            ...ag,
            title: displayTitle,
            backgroundColor: CORES_STATUS[ag.status], // Cor baseada no status
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


    // --- INÍCIO DA ADIÇÃO DOS ESTILOS CSS ---
    const estilosCalendario = `
        /* Força os eventos a ocupar a altura disponível e ajusta o conteúdo */
        .fc-daygrid-event-harness, /* Container principal na vista mensal */
        .fc-timegrid-event-harness > .fc-timegrid-event { /* Container principal nas vistas semana/dia */
            height: auto !important;
            min-height: 35px !important;
            display: flex !important;
            margin: 1px 0 !important;
        }

        .fc-daygrid-event, .fc-timegrid-event {
            width: 100% !important;
            padding: 0 !important;
            border: none !important;
            display: flex !important; /* Importante para o conteúdo interno */
        }
        
        /* Garante que o nosso Box interno ocupe todo o espaço do evento */
        .fc-event-main, .fc-event-main-frame {
            height: 100%;
            width: 100%;
            display: block !important;
        }
        .fc-event-main-frame > .MuiBox-root { 
            height: 100%;
            width: 100%; /* Garante que o Box ocupe toda a largura */
            box-sizing: border-box; 
        }

        /* Cores de fundo e texto por status */
        .fc-event-pendente { background-color: ${CORES_STATUS.Pendente} !important; color: #fff !important; }
        .fc-event-confirmado { background-color: ${CORES_STATUS.Confirmado} !important; color: #fff !important; }
        .fc-event-realizado { background-color: ${CORES_STATUS.Realizado} !important; color: #fff !important; }
        .fc-event-cancelado { background-color: ${CORES_STATUS.Cancelado} !important; color: #fff !important; }
        
        /* Ajusta a cor do ícone de pendência */
        .fc-event-pendente .MuiSvgIcon-root { color: #333 !important; }
        .fc-event-confirmado .MuiSvgIcon-root,
        .fc-event-realizado .MuiSvgIcon-root,
        .fc-event-cancelado .MuiSvgIcon-root { color: #fff !important; }
    `;
    // --- FIM DA ADIÇÃO ---

    // Função para customizar o conteúdo do evento no calendário (SIMPLIFICADA)
    const renderEventContent = (eventInfo: EventContentArg) => {
      const paciente = PACIENTES_EXEMPLO.find(p => p.id === Number(eventInfo.event.extendedProps.pacienteId));
      const nomePaciente = paciente ? paciente.nome : 'Paciente?';
      const pendencia = eventInfo.event.extendedProps.pendenciaUnimed;

      return (
        // Removemos os estilos de cor/fundo/altura daqui
        <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.75rem', p: '2px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <b>{eventInfo.timeText}</b>
              {pendencia && (
                  <Tooltip title="Pendência Unimed">
                      {/* O CSS irá definir a cor do ícone */}
                      <WarningAmberIcon sx={{ fontSize: '1rem', marginLeft: '4px' }}/> 
                  </Tooltip>
              )}
          </Box>
          <span>{nomePaciente}</span>
        </Box>
      );
    };

    return (
        // Adicionamos React.Fragment e a tag <style>
        <>
          <style>{estilosCalendario}</style>
          <Box>
              {/* CABEÇALHO DA PÁGINA */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h4" component="h1">
                      Painel de Agendamentos
                  </Typography>
                  <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => {
                          setDataSelecionada('');
                          setEventoParaEditar(null);
                          setIsModalOpen(true);
                      }}
                  >
                      Novo Agendamento
                  </Button>
              </Box>

              {/* CONTENTOR PRINCIPAL COM DUAS COLUNAS */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>

                  {/* COLUNA ESQUERDA: O CALENDÁRIO */}
                  <Box sx={{ flexGrow: 1 }}>
                      <Paper elevation={3} sx={{ p: 2 }}>
                          <FullCalendar
                              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                              initialView="dayGridMonth"
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
                                  backgroundColor: ag.backgroundColor, // Passa a cor
                                  borderColor: ag.borderColor,     // Passa a cor
                                  extendedProps: {
                                    status: ag.status,
                                    pacienteId: ag.pacienteId,
                                    profissionalId: ag.profissionalId,
                                    pendenciaUnimed: ag.pendenciaUnimed,
                                  } 
                              }))}
                              eventContent={renderEventContent} // Renderiza o conteúdo interno
                              eventClassNames={(arg) => { // Adiciona a classe CSS para o container
                                  const statusClass = `fc-event-${arg.event.extendedProps.status?.toLowerCase() || 'default'}`;
                                  return [statusClass];
                              }}
                              locale={ptBrLocale}
                              editable={true}
                              selectable={true}
                              select={handleDateSelect}
                              eventClick={handleEventClick}
                              eventDrop={handleEventDrop}
                              dayMaxEvents={true}
                              height="75vh"
                              eventTimeFormat={{
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: false
                              }}
                          />
                      </Paper>
                  </Box>

                  {/* COLUNA DIREITA: FILTROS E RESUMO */}
                  <Box sx={{ width: { xs: '100%', md: '280px' }, flexShrink: 0 }}>
                      
                      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
                          <Typography variant="h6" gutterBottom>Filtrar por</Typography>
                          <Autocomplete
                              id="filtro-paciente-autocomplete"
                              options={[{ id: 'Todos' as const, nome: 'Todos os Pacientes' }, ...PACIENTES_EXEMPLO]} 
                              getOptionLabel={(option) => option.nome}
                              value={
                                  filtroPacienteId === 'Todos' 
                                      ? { id: 'Todos', nome: 'Todos os Pacientes' } 
                                      : PACIENTES_EXEMPLO.find(p => p.id === filtroPacienteId) || null
                              }
                              onChange={(_event, newValue) => {
                                  setFiltroPacienteId(newValue ? (newValue.id as number | 'Todos') : 'Todos'); 
                              }}
                              renderInput={(params) => (
                                  <TextField {...params} label="Paciente" variant="outlined" size="small" />
                              )}
                              sx={{ mb: 2 }}
                          />
                          <Autocomplete
                              id="filtro-profissional-autocomplete"
                              options={[{ id: 'Todos' as const, nome: 'Todos os Profissionais' }, ...PROFISSIONAIS_EXEMPLO]} 
                              getOptionLabel={(option) => option.nome}
                              value={
                                  filtroProfissionalId === 'Todos'
                                      ? { id: 'Todos', nome: 'Todos os Profissionais' }
                                      : PROFISSIONAIS_EXEMPLO.find(p => p.id === filtroProfissionalId) || null
                              }
                              onChange={(_event, newValue) => {
                                  setFiltroProfissionalId(newValue ? (newValue.id as number | 'Todos') : 'Todos'); 
                              }}
                              renderInput={(params) => (
                                  <TextField {...params} label="Profissional" variant="outlined" size="small" />
                              )}
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

              {/* O MODAL */}
              <AgendamentoFormModal
                  open={isModalOpen}
                  onClose={handleFecharModal}
                  onSave={handleSalvarAgendamento}
                  eventoParaEditar={eventoParaEditar}
                  dataSelecionada={dataSelecionada}
                  pacientes={PACIENTES_EXEMPLO}
                  profissionais={PROFISSIONAIS_EXEMPLO}
              />

              {/* O POPOVER */}
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
        </> // <-- FECHA O FRAGMENTO ADICIONADO
    );
};