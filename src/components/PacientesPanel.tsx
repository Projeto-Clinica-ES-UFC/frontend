import { useState } from 'react';
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
import TextField from '@mui/material/TextField'; // Importação adicionada

// Ícones
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import DescriptionIcon from '@mui/icons-material/Description';
import ClearIcon from '@mui/icons-material/Clear'; // Importação adicionada

// Importamos os modais e o novo painel Kanban
import { PacienteFormModal } from './PacienteFormModal';
import { PacientesKanban } from './PacientesKanban'; 

// Interface atualizada com Status
interface IPaciente {
    id: number;
    nome: string;
    cpf: string;
    dataNascimento: string;
    nomeResponsavel: string;
    telefoneResponsavel: string;
    status: 'Agendado' | 'Em Atendimento' | 'Finalizado' | 'Cancelado'; // Ajustado status para coincidir com PacientesKanban
}

// Dados de exemplo atualizados com Status
const DADOS_INICIAIS: IPaciente[] = [
    { id: 1, nome: 'Ana Clara Sousa', cpf: '123.456.789-00', dataNascimento: '2018-08-15', nomeResponsavel: 'João Sousa', telefoneResponsavel: '(85) 99111-1111', status: 'Em Atendimento' },
    { id: 2, nome: 'Lucas Ferreira Lima', cpf: '987.654.321-11', dataNascimento: '2019-03-22', nomeResponsavel: 'Ricardo Sousa', telefoneResponsavel: '(85) 99999-9999', status: 'Agendado' },
    { id: 3, nome: 'Mariana Costa e Silva', cpf: '111.222.333-44', dataNascimento: '2020-11-05', nomeResponsavel: 'Beatriz Costa', telefoneResponsavel: '(85) 98765-4321', status: 'Finalizado' },
    // Se quiser adicionar um paciente cancelado, use 'Cancelado'
    // { id: 4, nome: 'Paciente Cancelado', cpf: '222.333.444-55', dataNascimento: '2017-01-01', nomeResponsavel: 'Carlos Silva', telefoneResponsavel: '(85) 98888-8888', status: 'Cancelado' },
];

export const PacientesPanel = () => {
    const navigate = useNavigate();
    const [pacientes, setPacientes] = useState<IPaciente[]>(DADOS_INICIAIS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pacienteParaEditar, setPacienteParaEditar] = useState<IPaciente | null>(null);
    const [viewMode, setViewMode] = useState<'lista' | 'kanban'>('lista'); 
    
    // Estados para filtros de data
    const [filtroDataInicio, setFiltroDataInicio] = useState(''); 
    const [filtroDataFim, setFiltroDataFim] = useState('');       

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

    // Ajustado para receber dados sem status
    const handleSalvarPaciente = (pacienteData: Omit<IPaciente, 'id' | 'status'> & { id?: number }) => { 
        if (pacienteData.id) {
            // Edição: Mantém o status existente ou o atualiza se vier (não vem mais do modal)
            setPacientes(atuais => atuais.map(p => 
                p.id === pacienteData.id ? { ...p, ...pacienteData } : p
            ));
        } else {
            const novoId = pacientes.length > 0 ? Math.max(...pacientes.map(p => p.id)) + 1 : 1;
            const novoPacienteCompleto: IPaciente = {
                id: novoId,
                nome: pacienteData.nome,
                cpf: pacienteData.cpf,
                dataNascimento: pacienteData.dataNascimento,
                nomeResponsavel: pacienteData.nomeResponsavel,
                telefoneResponsavel: pacienteData.telefoneResponsavel,
                status: 'Agendado', // Status inicial padrão
            };
            setPacientes(atuais => [...atuais, novoPacienteCompleto]);
        }
        handleFecharModal();
    };


    const handleApagar = (idDoPaciente: number) => {
        if (window.confirm('Tem a certeza que deseja excluir este paciente?')) {
            setPacientes(atuais => atuais.filter(p => p.id !== idDoPaciente));
        }
    };

    const handlePacienteStatusChange = (pacienteId: number, novoStatus: IPaciente['status']) => {
      setPacientes(atuais => 
          atuais.map(p => 
              p.id === pacienteId ? { ...p, status: novoStatus } : p
          )
      );
    };

    const handleChangeView = (_event: React.MouseEvent<HTMLElement>, newView: 'lista' | 'kanban' | null) => {
        if (newView !== null) {
            setViewMode(newView);
        }
    };

    // Lógica de Filtragem por Data
    const pacientesFiltradosPorData = pacientes.filter(paciente => {
        const dataPaciente = new Date(paciente.dataNascimento + 'T00:00:00'); 
        if (!filtroDataInicio && !filtroDataFim) return true;
        const inicioOk = !filtroDataInicio || dataPaciente >= new Date(filtroDataInicio + 'T00:00:00');
        const fimOk = !filtroDataFim || dataPaciente <= new Date(filtroDataFim + 'T00:00:00');
        return inicioOk && fimOk;
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

            {/* Barra de Filtros e Seletor de Vista */}
            <Paper elevation={1} sx={{ p: 2, mb: 2, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                <Typography variant="body2" sx={{ mr: 1, flexShrink: 0 }}>Filtrar Data Nasc.:</Typography>
                <TextField 
                    size="small" 
                    label="De" 
                    type="date" 
                    InputLabelProps={{ shrink: true }} 
                    sx={{ width: { xs: 'calc(50% - 70px)', sm: 150} }}
                    value={filtroDataInicio} 
                    onChange={(e) => setFiltroDataInicio(e.target.value)} 
                />
                <TextField 
                    size="small" 
                    label="Até" 
                    type="date" 
                    InputLabelProps={{ shrink: true }} 
                    sx={{ width: { xs: 'calc(50% - 70px)', sm: 150} }}
                    value={filtroDataFim} 
                    onChange={(e) => setFiltroDataFim(e.target.value)} 
                />
                <Button 
                    size="small" 
                    startIcon={<ClearIcon />}
                    onClick={() => { setFiltroDataInicio(''); setFiltroDataFim(''); }}
                    disabled={!filtroDataInicio && !filtroDataFim}
                    sx={{ ml: { xs: 0, sm: 'auto' } }} 
                >
                    Limpar Datas
                </Button>
                <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={handleChangeView}
                    aria-label="Modo de visualização"
                    size="small"
                    sx={{ ml: { xs: 'auto', sm: 1 } }} 
                >
                    <ToggleButton value="lista" aria-label="lista">
                        <Tooltip title="Visualizar em Lista"><ViewListIcon /></Tooltip>
                    </ToggleButton>
                    <ToggleButton value="kanban" aria-label="kanban">
                        <Tooltip title="Visualizar em Kanban"><ViewKanbanIcon /></Tooltip>
                    </ToggleButton>
                </ToggleButtonGroup>
            </Paper>


            {/* Renderização Condicional: Tabela ou Kanban */}
            {viewMode === 'lista' && (
                <Paper elevation={3} sx={{ width: '100%', overflow: 'hidden' }}> 
                    <TableContainer>
                        <Table> 
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold', borderBottom: '2px solid rgba(224, 224, 224, 1)' }}>Nome Completo</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', borderBottom: '2px solid rgba(224, 224, 224, 1)' }}>CPF</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', borderBottom: '2px solid rgba(224, 224, 224, 1)' }}>Data Nasc.</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', borderBottom: '2px solid rgba(224, 224, 224, 1)' }}>Responsável</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', borderBottom: '2px solid rgba(224, 224, 224, 1)' }}>Telefone</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', borderBottom: '2px solid rgba(224, 224, 224, 1)' }} align="right">Ações</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {pacientesFiltradosPorData.map((paciente) => (
                                    <TableRow 
                                        key={paciente.id} 
                                        hover 
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell sx={{ py: 1.5 }}>{paciente.nome}</TableCell>
                                        <TableCell sx={{ py: 1.5 }}>{paciente.cpf}</TableCell>
                                        <TableCell sx={{ py: 1.5 }}>{new Date(paciente.dataNascimento + 'T00:00:00').toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</TableCell>
                                        <TableCell sx={{ py: 1.5 }}>{paciente.nomeResponsavel}</TableCell>
                                        <TableCell sx={{ py: 1.5 }}>{paciente.telefoneResponsavel}</TableCell>
                                        <TableCell align="right" sx={{ py: 1.5 }}>
                                            <Tooltip title="Ver Prontuário">
                                                <IconButton 
                                                    size="small" 
                                                    color="info"
                                                    onClick={() => navigate(`/pacientes/${paciente.id}/prontuario`)}
                                                >
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
                                {pacientesFiltradosPorData.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            Nenhum paciente encontrado{ (filtroDataInicio || filtroDataFim) ? ' para o período selecionado' : ''}.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            {viewMode === 'kanban' && (
                <PacientesKanban 
                    pacientes={pacientesFiltradosPorData}
                    onPacienteStatusChange={handlePacienteStatusChange} 
                />
            )}

            <PacienteFormModal
                open={isModalOpen}
                onClose={handleFecharModal}
                onSave={handleSalvarPaciente}
                pacienteParaEditar={pacienteParaEditar as never}
                onDelete={handleApagar} // Passa a função de apagar para o modal
            />
        </Box>
    );
};