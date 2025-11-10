import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Avatar from '@mui/material/Avatar';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

// Ícones
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import FlagIcon from '@mui/icons-material/Flag';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AccountCircleIcon from '@mui/icons-material/AccountCircle'; // Para avatar padrão

// Importa o modal e o novo contexto de notificações
import { TarefaFormModal } from '../components/TarefaFormModal';
import { useNotifications } from '../contexts/NotificationContext'; // Importado

// Interface (ATUALIZADA)
interface ITarefa {
    id: number;
    titulo: string;
    descricao?: string;
    concluida: boolean;
    prioridade: 'Baixa' | 'Média' | 'Alta';
    prazo?: string | null;
    atribuidoAId: number | null;
}

// Simulação de utilizadores (deve corresponder ao modal)
const USUARIOS_EXEMPLO = [
  { id: 1, nome: 'Administrador Clínica', avatar: 'A' },
  { id: 2, nome: 'Recepcionista', avatar: 'R' },
  { id: 3, nome: 'Dr. João', avatar: 'J' },
];

const DADOS_INICIAIS: ITarefa[] = [
    { id: 1, titulo: 'Confirmar agendamento de Ana Clara', descricao: 'Ligar para (85) 99999-1111', concluida: false, prioridade: 'Alta', prazo: '2025-11-05T09:00', atribuidoAId: 2 },
    { id: 2, titulo: 'Enviar laudo para Lucas Ferreira', concluida: false, prioridade: 'Média', prazo: '2025-11-10T14:00', atribuidoAId: 3 },
    { id: 3, titulo: 'Ligar para o convênio Unimed', descricao: 'Verificar cobertura do paciente X.', concluida: true, prioridade: 'Baixa', prazo: null, atribuidoAId: 1 },
];

export const TarefasPage = () => {
    const { addNotification } = useNotifications(); // Hook de notificações
    const [tarefas, setTarefas] = useState<ITarefa[]>(DADOS_INICIAIS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tarefaParaEditar, setTarefaParaEditar] = useState<ITarefa | null>(null);

    // Estados dos Filtros
    const [filtroStatus, setFiltroStatus] = useState<'Pendentes' | 'Concluidas' | 'Todas'>('Pendentes');
    const [filtroAtribuido, setFiltroAtribuido] = useState<number | 'Todos'>('Todos');

    const handleAbrirModalParaAdicionar = () => { setTarefaParaEditar(null); setIsModalOpen(true); };
    const handleAbrirModalParaEditar = (tarefa: ITarefa) => { setTarefaParaEditar(tarefa); setIsModalOpen(true); };
    const handleFecharModal = () => setIsModalOpen(false);

    // handleSalvarTarefa (ATUALIZADO)
    const handleSalvarTarefa = (dados: Omit<ITarefa, 'id' | 'concluida'> & { id?: number }) => {
        if (dados.id) {
            setTarefas(atuais => atuais.map(t => t.id === dados.id ? { ...t, ...dados } as ITarefa : t));
        } else {
            const novaTarefa: ITarefa = {
                id: Date.now(),
                titulo: dados.titulo,
                descricao: dados.descricao,
                concluida: false,
                prioridade: dados.prioridade,
                prazo: dados.prazo,
                atribuidoAId: dados.atribuidoAId,
            };
            setTarefas(atuais => [novaTarefa, ...atuais]);
            // GERA A NOTIFICAÇÃO
            addNotification(`Nova tarefa: "${novaTarefa.titulo}"`);
        }
        handleFecharModal();
    };


    const handleApagar = (id: number) => {
        if (window.confirm('Tem a certeza que deseja excluir esta tarefa?')) {
            setTarefas(atuais => atuais.filter(t => t.id !== id));
        }
    };

    const handleToggleConcluida = (id: number) => {
        setTarefas(atuais => 
            atuais.map(tarefa => 
                tarefa.id === id ? { ...tarefa, concluida: !tarefa.concluida } : tarefa
            )
        );
    };

    // Lógica de Filtros e Ordenação (ATUALIZADA)
    const tarefasFiltradasOrdenadas = useMemo(() => {
        return tarefas
            .filter(t => {
                const statusOk = filtroStatus === 'Todas' ? true :
                                 filtroStatus === 'Pendentes' ? !t.concluida : t.concluida;
                const atribuidoOk = filtroAtribuido === 'Todos' ? true : t.atribuidoAId === filtroAtribuido;
                return statusOk && atribuidoOk;
            })
            .sort((a, b) => {
                // 1. Concluídas vão para o final
                if (a.concluida !== b.concluida) {
                    return a.concluida ? 1 : -1;
                }
                // 2. Ordena por prioridade (Alta primeiro)
                const prioridades = { 'Alta': 3, 'Média': 2, 'Baixa': 1 };
                return prioridades[b.prioridade] - prioridades[a.prioridade];
            });
    }, [tarefas, filtroStatus, filtroAtribuido]);

    // Funções auxiliares de estilo
    const getCorPrioridade = (prioridade: ITarefa['prioridade']) => {
        if (prioridade === 'Alta') return 'error.main';
        if (prioridade === 'Média') return 'warning.main';
        return 'success.main';
    };

    const formatarPrazo = (prazo: string | null | undefined) => {
        if (!prazo) return null;
        try {
            return new Date(prazo).toLocaleDateString('pt-BR', {
                day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });
        } catch (e) { 
            console.error("Erro ao formatar prazo:", e);
            return "Data inválida";
        }
    };

    // Função para buscar o avatar do utilizador
    const getAvatarUsuario = (id: number | null) => {
        if (id === null) return <AccountCircleIcon sx={{ fontSize: 16, opacity: 0.5, mr: 0.5 }} />;
        const user = USUARIOS_EXEMPLO.find(u => u.id === id);
        return <Avatar sx={{ width: 16, height: 16, fontSize: '0.7rem', mr: 0.5 }}>{user ? user.avatar : '?'}</Avatar>;
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Gestão de Tarefas
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleAbrirModalParaAdicionar}>
                    Adicionar Tarefa
                </Button>
            </Box>

            {/* Barra de Filtros (ADICIONADA) */}
            <Paper elevation={1} sx={{ p: 2, mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <ToggleButtonGroup
                    value={filtroStatus}
                    exclusive
                    onChange={(_e, newStatus) => { if (newStatus) setFiltroStatus(newStatus); }}
                    size="small"
                    aria-label="Filtro de status"
                >
                    <ToggleButton value="Pendentes">Pendentes</ToggleButton>
                    <ToggleButton value="Concluidas">Concluídas</ToggleButton>
                    <ToggleButton value="Todas">Todas</ToggleButton>
                </ToggleButtonGroup>
                
                <Autocomplete
                    options={[{ id: 'Todos' as const, nome: 'Todos os Utilizadores' }, ...USUARIOS_EXEMPLO]}
                    getOptionLabel={(option) => option.nome}
                    // --- INÍCIO DA CORREÇÃO ---
                    value={
                        filtroAtribuido === 'Todos' 
                            ? { id: 'Todos', nome: 'Todos os Utilizadores' } 
                            : USUARIOS_EXEMPLO.find(u => u.id === filtroAtribuido) || null
                    }
                    onChange={(_e, newValue) => {
                        // O tipo já é inferido corretamente
                        setFiltroAtribuido(newValue ? newValue.id : 'Todos');
                    }}
                    // --- FIM DA CORREÇÃO (removido 'as any') ---
                    renderInput={(params) => (
                        <TextField {...params} label="Atribuído a" size="small" sx={{ minWidth: 220 }} />
                    )}
                    sx={{ ml: 'auto' }}
                />
            </Paper>

            {/* LISTA DE TAREFAS (ATUALIZADA) */}
            <Paper elevation={2}>
                <List>
                    {tarefasFiltradasOrdenadas.map((tarefa, index) => (
                        <Box key={tarefa.id}>
                            <ListItem
                                secondaryAction={
                                    <>
                                        <Tooltip title="Editar">
                                            <IconButton edge="end" color="primary" onClick={() => handleAbrirModalParaEditar(tarefa)}>
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Excluir">
                                            <IconButton edge="end" color="error" onClick={() => handleApagar(tarefa.id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </>
                                }
                                sx={{ py: 1.5 }} 
                            >
                                <ListItemIcon>
                                    <Checkbox
                                        edge="start"
                                        checked={tarefa.concluida}
                                        onClick={() => handleToggleConcluida(tarefa.id)}
                                        tabIndex={-1}
                                        disableRipple
                                    />
                                </ListItemIcon>
                                
                                <Box sx={{ flexGrow: 1, mr: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                        <Tooltip title={`Prioridade: ${tarefa.prioridade}`}>
                                            <FlagIcon sx={{ color: getCorPrioridade(tarefa.prioridade), fontSize: 18 }} />
                                        </Tooltip>
                                        <Typography 
                                            variant="body1"
                                            sx={{
                                                fontWeight: 'bold',
                                                textDecoration: tarefa.concluida ? 'line-through' : 'none',
                                                color: tarefa.concluida ? 'text.secondary' : 'text.primary',
                                            }}
                                        >
                                            {tarefa.titulo}
                                        </Typography>
                                    </Box>

                                    {tarefa.descricao && (
                                        <Typography variant="body2" color="text.secondary" sx={{ ml: 3.5, mb: 0.5, whiteSpace: 'pre-wrap' }}>
                                            {tarefa.descricao}
                                        </Typography>
                                    )}

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 3.5, flexWrap: 'wrap' }}>
                                        {tarefa.prazo && (
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <AccessTimeIcon sx={{ color: 'text.secondary', fontSize: 16, mr: 0.5 }} />
                                                <Typography variant="caption" color="text.secondary">
                                                    {formatarPrazo(tarefa.prazo)}
                                                </Typography>
                                            </Box>
                                        )}
                                        {tarefa.atribuidoAId && (
                                             <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                {getAvatarUsuario(tarefa.atribuidoAId)}
                                                <Typography variant="caption" color="text.secondary">
                                                    {USUARIOS_EXEMPLO.find(u => u.id === tarefa.atribuidoAId)?.nome}
                                                </Typography>
                                             </Box>
                                        )}
                                    </Box>
                                </Box>
                            </ListItem>
                            {index < tarefasFiltradasOrdenadas.length - 1 && <Divider />}
                        </Box>
                    ))}
                    {tarefasFiltradasOrdenadas.length === 0 && (
                        <ListItem>
                            <ListItemText primary="Nenhuma tarefa encontrada para estes filtros." sx={{ textAlign: 'center', py: 3 }} />
                        </ListItem>
                    )}
                </List>
            </Paper>

            <TarefaFormModal
                open={isModalOpen}
                onClose={handleFecharModal}
                onSave={handleSalvarTarefa}
                tarefaParaEditar={tarefaParaEditar}
            />
        </Box>
    );
};