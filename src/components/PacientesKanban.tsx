import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';

// Importa os ícones que vamos usar
import EventIcon from '@mui/icons-material/Event'; // Agendado
import PlayArrowIcon from '@mui/icons-material/PlayArrow'; // Em Atendimento
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'; // Finalizado
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'; // Cancelado/Inativo
import PeopleIcon from '@mui/icons-material/People'; // Ícone para a coluna Todos/Lista Geral

// A interface IPaciente
interface IPaciente {
    id: number;
    nome: string;
    cpf: string;
    dataNascimento: string;
    nomeResponsavel: string;
    telefoneResponsavel: string;
    status: 'Agendado' | 'Em Atendimento' | 'Finalizado' | 'Cancelado';
}

interface PacientesKanbanProps {
    pacientes: IPaciente[];
    onPacienteStatusChange: (pacienteId: number, novoStatus: IPaciente['status']) => void;
}

// --- INÍCIO DA MUDANÇA ---
// 1. Atualiza a definição das colunas para incluir "Todos"
const COLUNAS_KANBAN: { 
    id: IPaciente['status'] | 'Todos'; 
    nome: string; 
    icon: React.ElementType; 
    bgColor: string; 
}[] = [
    { id: 'Todos', nome: 'Lista Geral', icon: PeopleIcon, bgColor: '#e0f2f7' }, // Nova coluna
    { id: 'Agendado', nome: 'Agendado', icon: EventIcon, bgColor: '#e3f2fd' }, 
    { id: 'Em Atendimento', nome: 'Em Atendimento', icon: PlayArrowIcon, bgColor: '#fff3e0' }, 
    { id: 'Finalizado', nome: 'Finalizado', icon: CheckCircleOutlineIcon, bgColor: '#e8f5e9' }, 
    { id: 'Cancelado', nome: 'Cancelado', icon: CancelOutlinedIcon, bgColor: '#ffebee' }, 
];
// --- FIM DA MUDANÇA ---

export const PacientesKanban = ({ pacientes, onPacienteStatusChange }: PacientesKanbanProps) => {

    const handleOnDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;

        // --- INÍCIO DA MUDANÇA ---
        // 2. Impede o drop na coluna "Todos" ou fora de qualquer coluna
        if (!destination || destination.droppableId === 'Todos') { 
            return;
        }
        // --- FIM DA MUDANÇA ---

        // Impede a atualização se soltar na mesma posição
        if (destination.droppableId === source.droppableId && destination.index === source.index) {
            return;
        }

        const pacienteId = Number(draggableId);
        const novoStatus = destination.droppableId as IPaciente['status']; // Garantido que não é 'Todos'

        onPacienteStatusChange(pacienteId, novoStatus);
    };

    // --- INÍCIO DA MUDANÇA ---
    // 3. Atualiza a lógica para preencher a coluna "Todos"
    const pacientesPorColuna = COLUNAS_KANBAN.reduce((acc, coluna) => {
        if (coluna.id === 'Todos') {
            acc[coluna.id] = pacientes; // Coluna 'Todos' recebe a lista completa
        } else {
            // As outras colunas filtram pelo status correspondente
            acc[coluna.id] = pacientes.filter(p => p.status === coluna.id);
        }
        return acc;
    }, {} as Record<IPaciente['status'] | 'Todos', IPaciente[]>);
    // --- FIM DA MUDANÇA ---

    return (
        <DragDropContext onDragEnd={handleOnDragEnd}>
            {/* --- INÍCIO DA MUDANÇA: Layout dos Cartões de Resumo Alinhados --- */}
            {/* 4. Ajusta o layout dos cartões de resumo para alinhamento com as 5 colunas */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'nowrap', mb: 3, overflowX: 'auto', pb:1 }}> 
                {COLUNAS_KANBAN.map((coluna) => {
                    const IconComponent = coluna.icon;
                    const count = pacientesPorColuna[coluna.id]?.length || 0; 
                    return (
                        <Paper 
                            key={coluna.id}
                            elevation={1} 
                            sx={{ 
                                p: 2, 
                                flex: '1 0 18%', // Base ~20% para 5 colunas
                                minWidth: 160, 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                backgroundColor: coluna.bgColor, 
                            }}
                        >
                            <IconComponent sx={{ fontSize: 30, mb: 0.5 }} color="action" />
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{count}</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>{coluna.nome}</Typography>
                        </Paper>
                    );
                })}
            </Box>
            {/* --- FIM DA MUDANÇA --- */}


            {/* Quadro Kanban (Arrastável) */}
            <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2, minHeight: '60vh' }}>
                {COLUNAS_KANBAN.map((coluna) => (
                    // --- INÍCIO DA MUDANÇA: Desabilita o drop na coluna "Todos" ---
                    // 5. Adiciona isDropDisabled={coluna.id === 'Todos'}
                    <Droppable key={coluna.id} droppableId={coluna.id} isDropDisabled={coluna.id === 'Todos'}> 
                    {/* --- FIM DA MUDANÇA --- */}
                        {(provided, snapshot) => {
                            const IconComponent = coluna.icon;
                            const count = pacientesPorColuna[coluna.id]?.length || 0;
                            return (
                                <Paper
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    elevation={2}
                                    sx={{
                                        p: 2,
                                        // --- INÍCIO DA MUDANÇA: Alinha as colunas ---
                                        flex: '1 0 18%', // Mesmo flex-basis dos cartões de cima
                                        minWidth: 280, 
                                        // --- FIM DA MUDANÇA ---
                                        backgroundColor: snapshot.isDraggingOver ? 'grey.200' : coluna.bgColor,
                                        transition: 'background-color 0.2s ease',
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, flexShrink: 0 }}>
                                        <IconComponent sx={{ mr: 1, fontSize: 24 }} color="action" />
                                        <Typography variant="h6" sx={{ textAlign: 'center' }}>
                                            {coluna.nome} ({count})
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flexGrow: 1, overflowY: 'auto' }}>
                                        {pacientesPorColuna[coluna.id]?.map((paciente, index) => (
                                            // --- INÍCIO DA MUDANÇA: Desabilita arrastar da coluna "Todos" ---
                                            // 6. Adiciona isDragDisabled={coluna.id === 'Todos'}
                                            <Draggable 
                                                key={paciente.id} 
                                                draggableId={String(paciente.id)} 
                                                index={index} 
                                                isDragDisabled={coluna.id === 'Todos'} 
                                            >
                                            {/* --- FIM DA MUDANÇA --- */}
                                                {(provided, snapshot) => (
                                                    <Paper
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        elevation={snapshot.isDragging ? 4 : 1}
                                                        sx={{ 
                                                            p: 1.5,
                                                            backgroundColor: 'background.paper'
                                                        }}
                                                    >
                                                        <Typography variant="subtitle2">{paciente.nome}</Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Resp: {paciente.nomeResponsavel}
                                                        </Typography>
                                                    </Paper>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                        {(pacientesPorColuna[coluna.id]?.length || 0) === 0 && (
                                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
                                                Vazio
                                            </Typography>
                                        )}
                                    </Box>
                                </Paper>
                            );
                        }}
                    </Droppable>
                ))}
            </Box>
        </DragDropContext>
    );
};