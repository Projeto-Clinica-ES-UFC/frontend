import { useState, useEffect } from 'react';
import { formatDateBR } from '../utils/dateUtils';
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
import { useNavigate } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ptBR } from 'date-fns/locale';

import { patientsService } from '../services/rest-client';

// Ícones
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import DescriptionIcon from '@mui/icons-material/Description';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';

import { PacienteFormModal } from './PacienteFormModal';

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
    const [pacientes, setPacientes] = useState<IPaciente[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pacienteParaEditar, setPacienteParaEditar] = useState<IPaciente | null>(null);

    // Filtros
    const [filtroDataInicio, setFiltroDataInicio] = useState<Date | null>(null);
    const [filtroDataFim, setFiltroDataFim] = useState<Date | null>(null);
    const [busca, setBusca] = useState('');

    const carregarPacientes = async () => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const response: any = await patientsService.getAll();
            const lista = response.data || response;

            if (Array.isArray(lista)) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const mappedPacientes: IPaciente[] = lista.map((p: any) => ({
                    id: p.id,
                    nome: p.name,
                    cpf: p.cpf,
                    dataNascimento: p.dateOfBirth,
                    nomeResponsavel: p.responsibleName,
                    telefoneResponsavel: p.responsiblePhone,
                    status: 'Agendado'
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

    const handleSalvarPaciente = async (pacienteData: Omit<IPaciente, 'id' | 'status'> & { id?: number }) => {
        try {
            if (pacienteData.id) {
                const payload = {
                    name: pacienteData.nome,
                    cpf: pacienteData.cpf,
                    dateOfBirth: pacienteData.dataNascimento,
                    responsibleName: pacienteData.nomeResponsavel,
                    responsiblePhone: pacienteData.telefoneResponsavel,
                };
                await patientsService.update(pacienteData.id, payload);
            } else {
                const payload = {
                    name: pacienteData.nome,
                    cpf: pacienteData.cpf,
                    dateOfBirth: pacienteData.dataNascimento,
                    responsibleName: pacienteData.nomeResponsavel,
                    responsiblePhone: pacienteData.telefoneResponsavel,
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

    const handleApagar = async (idDoPaciente: number) => {
        try {
            await patientsService.delete(idDoPaciente);
            setPacientes(atuais => atuais.filter(p => p.id !== idDoPaciente));
        } catch (error) {
            console.error(error);
            alert("Erro ao excluir paciente.");
        }
    };

    // Lógica de Filtragem
    const pacientesFiltrados = pacientes.filter(paciente => {
        if (!paciente.dataNascimento) return false;

        // Zeroing time for date comparison
        const dataPaciente = new Date(paciente.dataNascimento + 'T00:00:00');
        dataPaciente.setHours(0, 0, 0, 0);

        let inicioOk = true;
        if (filtroDataInicio) {
            const inicio = new Date(filtroDataInicio);
            inicio.setHours(0, 0, 0, 0);
            inicioOk = dataPaciente >= inicio;
        }

        let fimOk = true;
        if (filtroDataFim) {
            const fim = new Date(filtroDataFim);
            fim.setHours(23, 59, 59, 999);
            fimOk = dataPaciente <= fim;
        }

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

                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                    <Typography variant="body2" sx={{ ml: { sm: 1 } }}>Nasc:</Typography>

                    <DatePicker
                        label="De"
                        value={filtroDataInicio}
                        onChange={(newValue) => setFiltroDataInicio(newValue)}
                        format="dd/MM/yyyy"
                        slotProps={{ textField: { size: 'small', sx: { width: 160 } } }}
                    />

                    <DatePicker
                        label="Até"
                        value={filtroDataFim}
                        onChange={(newValue) => setFiltroDataFim(newValue)}
                        format="dd/MM/yyyy"
                        slotProps={{ textField: { size: 'small', sx: { width: 160 } } }}
                    />
                </LocalizationProvider>

                <Button
                    size="small" startIcon={<ClearIcon />}
                    onClick={() => { setFiltroDataInicio(null); setFiltroDataFim(null); setBusca(''); }}
                    sx={{ ml: 'auto' }}
                >
                    Limpar
                </Button>
            </Paper>

            <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
                <Table size="small">
                    <TableHead sx={{ bgcolor: 'grey.100' }}>
                        <TableRow>
                            <TableCell><strong>Nome</strong></TableCell>
                            <TableCell><strong>CPF</strong></TableCell>
                            <TableCell><strong>Data Nasc.</strong></TableCell>
                            <TableCell><strong>Responsável</strong></TableCell>
                            <TableCell><strong>Telefone</strong></TableCell>
                            <TableCell align="right"><strong>Ações</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {pacientesFiltrados.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                    <Typography variant="body2" color="text.secondary">Nenhum paciente encontrado</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            pacientesFiltrados.map((paciente) => (
                                <TableRow key={paciente.id} hover>
                                    <TableCell sx={{ py: 1.5 }}>{paciente.nome}</TableCell>
                                    <TableCell sx={{ py: 1.5 }}>{paciente.cpf}</TableCell>
                                    <TableCell sx={{ py: 1.5 }}>{formatDateBR(paciente.dataNascimento)}</TableCell>
                                    <TableCell sx={{ py: 1.5 }}>{paciente.nomeResponsavel}</TableCell>
                                    <TableCell sx={{ py: 1.5 }}>{paciente.telefoneResponsavel}</TableCell>
                                    <TableCell align="right" sx={{ py: 1.5 }}>
                                        <Tooltip title="Ver Prontuário">
                                            <IconButton size="small" color="info" onClick={() => navigate(`/pacientes/${paciente.id}/prontuario`)}>
                                                <DescriptionIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Editar">
                                            <IconButton size="small" onClick={() => handleAbrirModalParaEditar(paciente)}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Excluir">
                                            <IconButton size="small" color="error" onClick={() => handleApagar(paciente.id)}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <PacienteFormModal
                open={isModalOpen}
                onClose={handleFecharModal}
                onSave={handleSalvarPaciente}
                pacienteParaEditar={pacienteParaEditar}
            />
        </Box>
    );
};