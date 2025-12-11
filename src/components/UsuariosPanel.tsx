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
import Chip from '@mui/material/Chip';

// Ícones
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutline';

// Importamos o componente de Modal
import { UsuarioFormModal } from './UsuarioFormModal';

// Interface
interface IUsuario {
    id: number;
    nome: string;
    email: string;
    perfil: 'Administrador' | 'Recepcionista' | 'Profissional';
    password?: string; // Opcional, usado apenas no envio
}

export const UsuariosPanel = () => {
    // 1. Estado inicial vazio
    const [usuarios, setUsuarios] = useState<IUsuario[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [usuarioParaEditar, setUsuarioParaEditar] = useState<IUsuario | null>(null);

    // 2. Helper de Autenticação
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    // 3. Buscar Usuários (GET)
    const carregarUsuarios = () => {
        fetch('http://localhost:3000/users', {
            method: 'GET',
            headers: getAuthHeaders()
        })
        .then(res => {
            if (res.status === 401) throw new Error('Não autorizado');
            if (!res.ok) throw new Error('Erro na API');
            return res.json();
        })
        .then(data => {
            if (Array.isArray(data)) {
                setUsuarios(data);
            } else {
                setUsuarios([]);
            }
        })
        .catch(err => {
            console.error("Erro ao carregar usuários:", err);
            // Em caso de erro, zera a lista para não travar
            setUsuarios([]);
        });
    };

    useEffect(() => {
        carregarUsuarios();
    }, []);

    const handleAbrirModalParaAdicionar = () => {
        setUsuarioParaEditar(null);
        setIsModalOpen(true);
    };

    const handleAbrirModalParaEditar = (usuario: IUsuario) => {
        setUsuarioParaEditar(usuario);
        setIsModalOpen(true);
    };

    const handleFecharModal = () => {
        setIsModalOpen(false);
    };

    // 4. Salvar (Lógica Mista: Sign-Up vs Update)
    const handleSalvarUsuario = (dados: Omit<IUsuario, 'id'> & { id?: number, password?: string }) => {
        const headers = getAuthHeaders();

        if (dados.id) {
            // --- EDIÇÃO (PUT /users/:id) ---
            const payload = {
                name: dados.nome, // Backend geralmente espera 'name'
                email: dados.email,
                role: dados.perfil, // Backend pode esperar 'role'
                // Se tiver senha nova, envia. Se não, ignora.
                ...(dados.password && { password: dados.password })
            };

            fetch(`http://localhost:3000/users/${dados.id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(payload)
            }).then(res => {
                if (res.ok) {
                    carregarUsuarios();
                    handleFecharModal();
                } else alert("Erro ao editar usuário.");
            });

        } else {
            // --- CRIAÇÃO (POST /api/auth/sign-up) ---
            // Usamos a rota de Auth para criar contas novas com senha
            const payload = {
                name: dados.nome,
                email: dados.email,
                password: dados.password,
                passwordConfirmation: dados.password, // Better-Auth exige confirmação
                role: dados.perfil
            };

            fetch('http://localhost:3000/api/auth/sign-up', {
                method: 'POST',
                headers, // Envia token se necessário (se o middleware pedir)
                body: JSON.stringify(payload)
            }).then(async res => {
                if (res.ok) {
                    alert("Usuário criado com sucesso!");
                    carregarUsuarios();
                    handleFecharModal();
                } else {
                    const erro = await res.json();
                    alert("Erro ao criar: " + JSON.stringify(erro));
                }
            });
        }
    };

    // 5. Apagar (DELETE)
    const handleApagar = (id: number) => {
        if (window.confirm('Tem a certeza que deseja excluir este usuário?')) {
            fetch(`http://localhost:3000/users/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            }).then(res => {
                if (res.ok) {
                    setUsuarios(atuais => atuais.filter(u => u.id !== id));
                } else alert("Erro ao excluir usuário.");
            });
        }
    };

    const getCorDoPerfil = (perfil: IUsuario['perfil']) => {
        if (perfil === 'Administrador') return 'error';
        if (perfil === 'Recepcionista') return 'primary';
        return 'default';
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h2">
                    Usuários do Sistema
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAbrirModalParaAdicionar}
                >
                    Adicionar Usuário
                </Button>
            </Box>

            <Paper elevation={2} sx={{ width: '100%', overflow: 'hidden' }}>
                <TableContainer>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Nome</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Email de Acesso</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Perfil</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }} align="right">Ações</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {usuarios?.map((usuario) => (
                                <TableRow key={usuario.id} hover>
                                    <TableCell>{usuario.nome}</TableCell>
                                    <TableCell>{usuario.email}</TableCell>
                                    <TableCell>
                                        <Chip label={usuario.perfil} color={getCorDoPerfil(usuario.perfil)} size="small" />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Editar">
                                            <IconButton size="small" color="primary" onClick={() => handleAbrirModalParaEditar(usuario)}>
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Excluir">
                                            <IconButton size="small" color="error" onClick={() => handleApagar(usuario.id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!usuarios || usuarios.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        Nenhum usuário encontrado.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <UsuarioFormModal
                open={isModalOpen}
                onClose={handleFecharModal}
                onSave={handleSalvarUsuario}
                usuarioParaEditar={usuarioParaEditar}
            />
        </Box>
    );
};