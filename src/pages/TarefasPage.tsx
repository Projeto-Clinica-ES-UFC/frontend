import { useState, useMemo, useEffect } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Avatar from '@mui/material/Avatar';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import CircularProgress from '@mui/material/CircularProgress';
import ListItemText from '@mui/material/ListItemText';

// Ícones
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import FlagIcon from '@mui/icons-material/Flag';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

// Componentes e Contextos
import { TarefaFormModal, type IUsuarioListagem } from '../components/TarefaFormModal';
import { useNotifications } from '../contexts/NotificationContext';

// Interfaces
interface ITarefa {
    id: number;
    titulo: string;
    descricao?: string;
    concluida: boolean;
    prioridade: 'Baixa' | 'Média' | 'Alta';
    prazo?: string | null;
    atribuidoAId: number | null;
}

export const TarefasPage = () => {
    const { addNotification } = useNotifications();
    
    // Estados de Dados
    const [tarefas, setTarefas] = useState<ITarefa[]>([]);
    const [usuarios, setUsuarios] = useState<IUsuarioListagem[]>([]); // Lista real de usuários
    const [loading, setLoading] = useState(true);

    // Estados de UI
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tarefaParaEditar, setTarefaParaEditar] = useState<ITarefa | null>(null);

    // Filtros
    const [filtroStatus, setFiltroStatus] = useState<'Pendentes' | 'Concluidas' | 'Todas'>('Pendentes');
    const [filtroAtribuido, setFiltroAtribuido] = useState<number | 'Todos'>('Todos');

    // Helper de Auth
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    // 1. Carregar Dados (Tarefas + Usuários)
    useEffect(() => {
        const carregarDados = async () => {
            try {
                const headers = getAuthHeaders();
                const [resTarefas, resUsuarios] = await Promise.all([
                    fetch('http://localhost:3000/tasks', { headers }),
                    fetch('http://localhost:3000/users', { headers })
                ]);

                if (resTarefas.ok) {
                    const data = await resTarefas.json();
                    if (Array.isArray(data)) setTarefas(data);
                }
                if (resUsuarios.ok) {
                    const data = await resUsuarios.json();
                    if (Array.isArray(data)) setUsuarios(data);
                }

            } catch (error) {
                console.error("Erro ao carregar tarefas:", error);
            } finally {
                setLoading(false);
            }
        };
        carregarDados();
    }, []);

    // Handlers de Modal
    const handleAbrirModalParaAdicionar = () => { setTarefaParaEditar(null); setIsModalOpen(true); };
    const handleAbrirModalParaEditar = (tarefa: ITarefa) => { setTarefaParaEditar(tarefa); setIsModalOpen(true); };
    const handleFecharModal = () => setIsModalOpen(false);

    // 2. Salvar (POST / PUT)
    const handleSalvarTarefa = (dados: Omit<ITarefa, 'id' | 'concluida'> & { id?: number }) => {
        const headers = getAuthHeaders();
        const payload = {
            titulo: dados.titulo,
            descricao: dados.descricao,
            prioridade: dados.prioridade,
            prazo: dados.prazo,
            atribuidoAId: dados.atribuidoAId,
            concluida: tarefaParaEditar?.concluida || false
        };

        if (dados.id) {
            // Edição
            fetch(`http://localhost:3000/tasks/${dados.id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(payload)
            }).then(res => {
                if(res.ok) {
                    // Atualiza localmente ou recarrega
                    setTarefas(prev => prev.map(t => t.id === dados.id ? { ...t, ...dados } as ITarefa : t));
                    addNotification(`Tarefa atualizada: "${dados.titulo}"`);
                }
            });
        } else {
            // Criação
            fetch('http://localhost:3000/tasks', {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
            }).then(async res => {
                if(res.ok) {
                    const novaTarefa = await res.json();
                    setTarefas(prev => [novaTarefa, ...prev]);
                    addNotification(`Nova tarefa criada: "${dados.titulo}"`);
                }
            });
        }
        handleFecharModal();
    };

    // 3. Apagar (DELETE)
    const handleApagar = (id: number) => {
        if (window.confirm('Excluir tarefa?')) {
            fetch(`http://localhost:3000/tasks/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            }).then(res => {
                if(res.ok) {
                    setTarefas(prev => prev.filter(t => t.id !== id));
                }
            });
        }
    };

    // 4. Mudar Status (PATCH)
    const handleToggleConcluida = (id: number) => {
        const tarefa = tarefas.find(t => t.id === id);
        if(!tarefa) return;

        // Atualização Otimista
        setTarefas(prev => prev.map(t => t.id === id ? { ...t, concluida: !t.concluida } : t));

        fetch(`http://localhost:3000/tasks/${id}`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify({ concluida: !tarefa.concluida })
        }).catch(err => {
            console.error(err);
            // Reverte em caso de erro (opcional)
            setTarefas(prev => prev.map(t => t.id === id ? { ...t, concluida: tarefa.concluida } : t));
        });
    };

    // Filtros e Ordenação
    const tarefasFiltradasOrdenadas = useMemo(() => {
        return tarefas
            .filter(t => {
                const statusOk = filtroStatus === 'Todas' ? true :
                                 filtroStatus === 'Pendentes' ? !t.concluida : t.concluida;
                const atribuidoOk = filtroAtribuido === 'Todos' ? true : t.atribuidoAId === filtroAtribuido;
                return statusOk && atribuidoOk;
            })
            .sort((a, b) => {
                if (a.concluida !== b.concluida) return a.concluida ? 1 : -1;
                const prioridades = { 'Alta': 3, 'Média': 2, 'Baixa': 1 };
                return prioridades[b.prioridade] - prioridades[a.prioridade];
            });
    }, [tarefas, filtroStatus, filtroAtribuido]);

    // Helpers Visuais
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
        } catch { return "Data inválida"; }
    };

    const getAvatarUsuario = (id: number | null) => {
        if (id === null) return <AccountCircleIcon sx={{ fontSize: 16, opacity: 0.5, mr: 0.5 }} />;
        const user = usuarios.find(u => u.id === id);
        return <Avatar sx={{ width: 16, height: 16, fontSize: '0.7rem', mr: 0.5 }}>{user ? user.nome.charAt(0) : '?'}</Avatar>;
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">Gestão de Tarefas</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleAbrirModalParaAdicionar}>
                    Adicionar Tarefa
                </Button>
            </Box>

            {/* Barra de Filtros */}
            <Paper elevation={1} sx={{ p: 2, mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <ToggleButtonGroup
                    value={filtroStatus}
                    exclusive
                    onChange={(_e, newStatus) => { if (newStatus) setFiltroStatus(newStatus); }}
                    size="small"
                >
                    <ToggleButton value="Pendentes">Pendentes</ToggleButton>
                    <ToggleButton value="Concluidas">Concluídas</ToggleButton>
                    <ToggleButton value="Todas">Todas</ToggleButton>
                </ToggleButtonGroup>
                
                <Autocomplete
                    options={[{ id: 'Todos' as const, nome: 'Todos os Usuários' }, ...usuarios]}
                    getOptionLabel={(option) => option.nome}
                    value={filtroAtribuido === 'Todos' ? { id: 'Todos', nome: 'Todos os Usuários' } : usuarios.find(u => u.id === filtroAtribuido) || null}
                    onChange={(_e, newValue) => setFiltroAtribuido(newValue ? newValue.id : 'Todos')}
                    renderInput={(params) => <TextField {...params} label="Atribuído a" size="small" sx={{ minWidth: 220 }} />}
                    sx={{ ml: 'auto' }}
                />
            </Paper>

            {loading ? <Box sx={{display: 'flex', justifyContent: 'center'}}><CircularProgress /></Box> : (
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
                                                        {usuarios.find(u => u.id === tarefa.atribuidoAId)?.nome}
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
                                <ListItemText primary="Nenhuma tarefa encontrada." sx={{ textAlign: 'center', py: 3 }} />
                            </ListItem>
                        )}
                    </List>
                </Paper>
            )}

            {/* O MODAL AGORA RECEBE A LISTA DE USUÁRIOS CORRETAMENTE */}
            <TarefaFormModal
                open={isModalOpen}
                onClose={handleFecharModal}
                onSave={handleSalvarTarefa}
                tarefaParaEditar={tarefaParaEditar}
                usuarios={usuarios} 
            />
        </Box>
    );
};