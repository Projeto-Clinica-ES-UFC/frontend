import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useNavigate } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment'; // Novo

import { patientsService } from '../services/rest-client';

// Ícones
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import DescriptionIcon from '@mui/icons-material/Description';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search'; // Novo

// Importamos os modais e o novo painel Kanban
import { PacienteFormModal } from './PacienteFormModal';
import { PacientesKanban } from './PacientesKanban'; 

// Interface
interface IPaciente {
    id: number;
    nome: string;
    cpf: string;
    dataNascimento: string;
    nomeResponsavel: string;
    telefoneResponsavel: string;
    status: 'Agendado' | 'Em Atendimento' | 'Finalizado' | 'Cancelado'; 
}

export const PacientesPanel = () => {
    const navigate = useNavigate();
    // 1. Começa vazio (sem mocks)
    const [pacientes, setPacientes] = useState<IPaciente[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pacienteParaEditar, setPacienteParaEditar] = useState<IPaciente | null>(null);
    const [viewMode, setViewMode] = useState<'lista' | 'kanban'>('lista'); 
    
    // Filtros
    const [filtroDataInicio, setFiltroDataInicio] = useState(''); 
    const [filtroDataFim, setFiltroDataFim] = useState('');
    const [busca, setBusca] = useState(''); // Novo filtro de busca textual

    // 3. Buscar Pacientes (GET)
    const carregarPacientes = async () => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const response: any = await patientsService.getAll();
            const lista = response.data || response; // Handle { data: [...] } or [...]

            if (Array.isArray(lista)) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const mappedPacientes: IPaciente[] = lista.map((p: any) => ({
                    id: p.id,
                    nome: p.name,
                    cpf: p.cpf,
                    dataNascimento: p.dateOfBirth,
                    nomeResponsavel: p.responsibleName,
                    telefoneResponsavel: p.responsiblePhone,
                    status: 'Agendado' // Backend does not store status on patient
                }));
                setPacientes(mappedPacientes);
            } else {
                setPacientes([]);
            }
        } catch (err) {
            console.error("Erro ao carregar pacientes:", err);
            setPacientes([]);
        }
    };

    // Carrega ao abrir
    useEffect(() => {
        carregarPacientes();
    }, []);

    const handleAbrirModalParaAdicionar = () => {
        setPacienteParaEditar(null);
        setIsModalOpen(true);
    };

    const handleAbrirModalParaEditar = (paciente: IPaciente) => {
        setPacienteParaEditar(paciente);
        setIsModalOpen(true);
    };

    const handleFecharModal = () => {
        setIsModalOpen(false);
    };

    // 4. Salvar (POST / PUT)
    const handleSalvarPaciente = async (pacienteData: Omit<IPaciente, 'id' | 'status'> & { id?: number }) => { 
        try {
            if (pacienteData.id) {
                // Edição
                const payload = {
                    name: pacienteData.nome,
                    cpf: pacienteData.cpf,
                    dateOfBirth: pacienteData.dataNascimento,
                    responsibleName: pacienteData.nomeResponsavel,
                    responsiblePhone: pacienteData.telefoneResponsavel,
                };
                await patientsService.update(pacienteData.id, payload);
            } else {
                // Criação
                const payload = {
                    name: pacienteData.nome,
                    cpf: pacienteData.cpf,
                    dateOfBirth: pacienteData.dataNascimento,
                    responsibleName: pacienteData.nomeResponsavel,
                    responsiblePhone: pacienteData.telefoneResponsavel,
                    // Status is not part of Patient model
                };
                await patientsService.create(payload);
            }
            carregarPacientes();
            handleFecharModal();
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar paciente.");
        }
    };

    // 5. Apagar (DELETE)
    const handleApagar = async (idDoPaciente: number) => {
        try {
            await patientsService.delete(idDoPaciente);
            setPacientes(atuais => atuais.filter(p => p.id !== idDoPaciente));
        } catch (error) {
            console.error(error);
             alert("Erro ao excluir paciente.");
        }
    };

    // 6. Mudar Status via Kanban (PATCH)
    const handlePacienteStatusChange = async (pacienteId: number, novoStatus: IPaciente['status']) => {
        // Atualização Otimista na tela
        setPacientes(atuais => 
            atuais.map(p => p.id === pacienteId ? { ...p, status: novoStatus } : p)
        );

        // Envia para o servidor
        // NOTE: Backend Patient model does not have status. Status is on Appointment.
        // For now, we only update local state.
        /*
        try {
            await patientsService.patch(pacienteId, { status: novoStatus });
        } catch (err) {
            console.error("Erro ao salvar status:", err);
            carregarPacientes(); // Reverte se der erro
        }
        */
    };

    const handleChangeView = (_event: React.MouseEvent<HTMLElement>, newView: 'lista' | 'kanban' | null) => {
        if (newView !== null) setViewMode(newView);
    };

    // Lógica de Filtragem (Mantive a sua de data e adicionei a de Busca)
    const pacientesFiltrados = pacientes.filter(paciente => {
        const dataPaciente = new Date(paciente.dataNascimento + 'T00:00:00'); 
        
        // Filtro Data
        const inicioOk = !filtroDataInicio || dataPaciente >= new Date(filtroDataInicio + 'T00:00:00');
        const fimOk = !filtroDataFim || dataPaciente <= new Date(filtroDataFim + 'T00:00:00');
        
        // Filtro Busca (Nome ou CPF)
        const termo = busca.toLowerCase();
        const buscaOk = !busca || 
            paciente.nome.toLowerCase().includes(termo) || 
            paciente.cpf.includes(termo);

        return inicioOk && fimOk && buscaOk;
    });

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h2">
                    Pacientes Cadastrados
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleAbrirModalParaAdicionar}>
                    Adicionar Paciente
                </Button>
            </Box>

            {/* Barra de Filtros Melhorada */}
            <Paper elevation={1} sx={{ p: 2, mb: 2, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                {/* Campo de Busca Novo */}
                <TextField
                    size="small"
                    placeholder="Buscar Nome ou CPF..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>
                    }}
                    sx={{ width: { xs: '100%', sm: 250 } }}
                />

                <Typography variant="body2" sx={{ ml: { sm: 1 } }}>Nasc:</Typography>
                <TextField 
                    size="small" type="date" value={filtroDataInicio} 
                    onChange={(e) => setFiltroDataInicio(e.target.value)} 
                />
                <TextField 
                    size="small" type="date" value={filtroDataFim} 
                    onChange={(e) => setFiltroDataFim(e.target.value)} 
                />
                
                <Button 
                    size="small" startIcon={<ClearIcon />}
                    onClick={() => { setFiltroDataInicio(''); setFiltroDataFim(''); setBusca(''); }}
                    sx={{ ml: 'auto' }}
                >
                    Limpar
                </Button>

                <ToggleButtonGroup
                    value={viewMode} exclusive onChange={handleChangeView}
                    size="small" sx={{ ml: 1 }}
                >
                    <ToggleButton value="lista"><Tooltip title="Lista"><ViewListIcon /></Tooltip></ToggleButton>
                    <ToggleButton value="kanban"><Tooltip title="Kanban"><ViewKanbanIcon /></Tooltip></ToggleButton>
                </ToggleButtonGroup>
            </Paper>

            {/* Visualização em Lista */}
            {viewMode === 'lista' && (
                <Paper elevation={3} sx={{ width: '100%', overflow: 'hidden' }}> 
                    <TableContainer>
                        <Table> 
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Nome Completo</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>CPF</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Data Nasc.</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Responsável</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Telefone</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }} align="right">Ações</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {pacientesFiltrados.map((paciente) => (
                                    <TableRow key={paciente.id} hover>
                                        <TableCell sx={{ py: 1.5 }}>{paciente.nome}</TableCell>
                                        <TableCell sx={{ py: 1.5 }}>{paciente.cpf}</TableCell>
                                        <TableCell sx={{ py: 1.5 }}>{new Date(paciente.dataNascimento + 'T00:00:00').toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</TableCell>
                                        <TableCell sx={{ py: 1.5 }}>{paciente.nomeResponsavel}</TableCell>
                                        <TableCell sx={{ py: 1.5 }}>{paciente.telefoneResponsavel}</TableCell>
                                        <TableCell align="right" sx={{ py: 1.5 }}>
                                            <Tooltip title="Ver Prontuário">
                                                <IconButton size="small" color="info" onClick={() => navigate(`/pacientes/${paciente.id}/prontuario`)}>
                                                    <DescriptionIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Editar">
                                                <IconButton size="small" color="primary" onClick={() => handleAbrirModalParaEditar(paciente)}>
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Excluir">
                                                <IconButton size="small" color="error" onClick={() => handleApagar(paciente.id)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {pacientesFiltrados.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            Nenhum paciente encontrado.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            {/* Visualização em Kanban */}
            {viewMode === 'kanban' && (
                <PacientesKanban 
                    pacientes={pacientesFiltrados}
                    onPacienteStatusChange={handlePacienteStatusChange} 
                />
            )}

            <PacienteFormModal
                open={isModalOpen}
                onClose={handleFecharModal}
                onSave={handleSalvarPaciente}
                pacienteParaEditar={pacienteParaEditar as never}
                onDelete={handleApagar}
            />
        </Box>
    );
};