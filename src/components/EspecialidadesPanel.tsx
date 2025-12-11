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

// Importamos o nosso componente de Modal
import { EspecialidadeFormModal } from './EspecialidadeFormModal';

// Interface para definir a "forma" de uma especialidade
interface IEspecialidade {
    id: number;
    nome: string;
}

export const EspecialidadesPanel = () => {
    // 1. Estado inicial vazio
    const [especialidades, setEspecialidades] = useState<IEspecialidade[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [especialidadeParaEditar, setEspecialidadeParaEditar] = useState<IEspecialidade | null>(null);

    // 2. Helper para pegar o Token (Crachá)
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    // 3. Função de Carregar (GET)
    const carregarEspecialidades = () => {
        fetch('http://localhost:3000/specialties', {
            method: 'GET',
            headers: getAuthHeaders()
        })
            .then(res => {
                if (res.status === 401) throw new Error('401 Unauthorized');
                if (!res.ok) throw new Error('Erro na API');
                return res.json();
            })
            .then(data => {
                // Blindagem: só salva se for array
                if (Array.isArray(data)) {
                    setEspecialidades(data);
                } else {
                    console.error("Backend não retornou lista:", data);
                    setEspecialidades([]);
                }
            })
            .catch(err => {
                console.error("Erro ao carregar especialidades:", err);
                setEspecialidades([]);
            });
    };

    // Carrega ao abrir a tela
    useEffect(() => {
        carregarEspecialidades();
    }, []);

    const handleAbrirModalParaAdicionar = () => {
        setEspecialidadeParaEditar(null);
        setIsModalOpen(true);
    };

    const handleAbrirModalParaEditar = (especialidade: IEspecialidade) => {
        setEspecialidadeParaEditar(especialidade);
        setIsModalOpen(true);
    };

    const handleFecharModal = () => {
        setIsModalOpen(false);
    };

    // 4. Função Salvar (POST / PUT)
    const handleSalvarEspecialidade = (dados: Omit<IEspecialidade, 'id'> & { id?: number }) => {
        const payload = { nome: dados.nome };
        const headers = getAuthHeaders();

        if (dados.id) {
            // EDIÇÃO
            fetch(`http://localhost:3000/specialties/${dados.id}`, {
                method: 'PUT', // ou PATCH, dependendo do backend (o padrão REST é PUT para atualizar tudo)
                headers,
                body: JSON.stringify(payload)
            })
            .then(res => {
                if (res.ok) {
                    carregarEspecialidades();
                    handleFecharModal();
                } else {
                    alert("Erro ao editar especialidade.");
                }
            })
            .catch(err => console.error(err));

        } else {
            // CRIAÇÃO
            fetch('http://localhost:3000/specialties', {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
            })
            .then(res => {
                if (res.ok) {
                    carregarEspecialidades();
                    handleFecharModal();
                } else {
                    alert("Erro ao criar especialidade.");
                }
            })
            .catch(err => console.error(err));
        }
    };

    // 5. Função Apagar (DELETE)
    const handleApagar = (id: number) => {
        if (window.confirm('Tem a certeza que deseja excluir esta especialidade?')) {
            fetch(`http://localhost:3000/specialties/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            })
            .then(res => {
                if (res.ok) {
                    // Remove da tela sem precisar recarregar tudo
                    setEspecialidades(atuais => atuais.filter(e => e.id !== id));
                } else {
                    alert("Erro ao excluir especialidade.");
                }
            })
            .catch(err => console.error(err));
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h2">
                    Especialidades Oferecidas
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAbrirModalParaAdicionar}
                >
                    Adicionar Especialidade
                </Button>
            </Box>

            <Paper elevation={2} sx={{ width: '100%', overflow: 'hidden' }}>
                <TableContainer>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Nome da Especialidade</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }} align="right">Ações</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {/* Uso do ? para evitar erro se especialidades for undefined */}
                            {especialidades?.map((especialidade) => (
                                <TableRow key={especialidade.id} hover>
                                    <TableCell>{especialidade.nome}</TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Editar">
                                            <IconButton size="small" color="primary" onClick={() => handleAbrirModalParaEditar(especialidade)}>
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Excluir">
                                            <IconButton size="small" color="error" onClick={() => handleApagar(especialidade.id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!especialidades || especialidades.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={2} align="center">
                                        Nenhuma especialidade encontrada.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <EspecialidadeFormModal
                open={isModalOpen}
                onClose={handleFecharModal}
                onSave={handleSalvarEspecialidade}
                especialidadeParaEditar={especialidadeParaEditar}
            />
        </Box>
    );
};