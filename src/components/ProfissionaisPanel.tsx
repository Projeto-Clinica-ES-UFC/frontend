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

// Ícones
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutline';

// Importamos o componente de Modal
import { ProfissionalFormModal } from './ProfissionalFormModal';

// Interface
interface IProfissional {
    id: number;
    nome: string;
    email: string;
    especialidade: string;
}

export const ProfissionaisPanel = () => {
    // 1. Estado inicial vazio
    const [profissionais, setProfissionais] = useState<IProfissional[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [profissionalParaEditar, setProfissionalParaEditar] = useState<IProfissional | null>(null);

    // 2. Helper de Autenticação
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    // 3. Buscar Profissionais (GET)
    const carregarProfissionais = () => {
        fetch('http://localhost:3000/professionals', {
            method: 'GET',
            headers: getAuthHeaders()
        })
        .then(res => {
            if (res.status === 401) throw new Error('Não autorizado');
            if (!res.ok) throw new Error('Erro na API');
            return res.json();
        })
        .then(data => {
            // Blindagem contra tela branca
            if (Array.isArray(data)) {
                setProfissionais(data);
            } else {
                setProfissionais([]);
            }
        })
        .catch(err => {
            console.error("Erro ao carregar profissionais:", err);
            setProfissionais([]);
        });
    };

    // Carrega ao abrir
    useEffect(() => {
        carregarProfissionais();
    }, []);

    const handleAbrirModalParaAdicionar = () => {
        setProfissionalParaEditar(null);
        setIsModalOpen(true);
    };

    const handleAbrirModalParaEditar = (profissional: IProfissional) => {
        setProfissionalParaEditar(profissional);
        setIsModalOpen(true);
    };

    const handleFecharModal = () => {
        setIsModalOpen(false);
    };

    // 4. Salvar (POST / PUT)
    const handleSalvarProfissional = (dados: Omit<IProfissional, 'id'> & { id?: number }) => {
        const payload = {
            nome: dados.nome,
            email: dados.email,
            especialidade: dados.especialidade
        };
        const headers = getAuthHeaders();

        if (dados.id) {
            // Edição
            fetch(`http://localhost:3000/professionals/${dados.id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(payload)
            }).then(res => {
                if (res.ok) {
                    carregarProfissionais();
                    handleFecharModal();
                } else alert("Erro ao editar profissional.");
            });
        } else {
            // Criação
            fetch('http://localhost:3000/professionals', {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
            }).then(res => {
                if (res.ok) {
                    carregarProfissionais();
                    handleFecharModal();
                } else alert("Erro ao criar profissional.");
            });
        }
    };

    // 5. Apagar (DELETE)
    const handleApagar = (id: number) => {
        if (window.confirm('Tem a certeza que deseja excluir este profissional?')) {
            fetch(`http://localhost:3000/professionals/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            }).then(res => {
                if (res.ok) {
                    setProfissionais(atuais => atuais.filter(p => p.id !== id));
                } else alert("Erro ao excluir profissional.");
            });
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h2">
                    Profissionais Cadastrados
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAbrirModalParaAdicionar}
                >
                    Adicionar Profissional
                </Button>
            </Box>

            <Paper elevation={2} sx={{ width: '100%', overflow: 'hidden' }}>
                <TableContainer>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Nome</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Especialidade</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }} align="right">Ações</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {/* Map seguro com ? */}
                            {profissionais?.map((profissional) => (
                                <TableRow key={profissional.id} hover>
                                    <TableCell>{profissional.nome}</TableCell>
                                    <TableCell>{profissional.email}</TableCell>
                                    <TableCell>{profissional.especialidade}</TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Editar">
                                            <IconButton size="small" color="primary" onClick={() => handleAbrirModalParaEditar(profissional)}>
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Excluir">
                                            <IconButton size="small" color="error" onClick={() => handleApagar(profissional.id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!profissionais || profissionais.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        Nenhum profissional encontrado.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <ProfissionalFormModal
                open={isModalOpen}
                onClose={handleFecharModal}
                onSave={handleSalvarProfissional}
                profissionalParaEditar={profissionalParaEditar}
            />
        </Box>
    );
};