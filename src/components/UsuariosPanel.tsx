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
import Chip from '@mui/material/Chip';

// Ícones
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutline';

// Importamos o nosso novo componente de Modal
import { UsuarioFormModal } from './UsuarioFormModal';

// Interface para definir a "forma" de um usuário do sistema
interface IUsuario {
    id: number;
    nome: string;
    email: string;
    perfil: 'Administrador' | 'Recepcionista' | 'Profissional';
}

// Dados de exemplo iniciais
const DADOS_INICIAIS: IUsuario[] = [
    { id: 1, nome: 'Vitória Sousa', email: 'vitoria.sousa@email.com', perfil: 'Administrador' },
    { id: 2, nome: 'Carlos Andrade', email: 'carlos.andrade@email.com', perfil: 'Recepcionista' },
];

export const UsuariosPanel = () => {
    const [usuarios, setUsuarios] = useState<IUsuario[]>(DADOS_INICIAIS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [usuarioParaEditar, setUsuarioParaEditar] = useState<IUsuario | null>(null);

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

    const handleSalvarUsuario = (dados: Omit<IUsuario, 'id'> & { id?: number }) => {
        if (dados.id) {
            // Lógica de Edição
            setUsuarios(atuais => atuais.map(u => u.id === dados.id ? { ...u, ...dados } as IUsuario : u));
        } else {
            // Lógica de Adição
            const novoId = usuarios.length > 0 ? Math.max(...usuarios.map(u => u.id)) + 1 : 1;
            setUsuarios(atuais => [...atuais, { ...dados, id: novoId }]);
        }
        handleFecharModal();
    };

    const handleApagar = (id: number) => {
        if (window.confirm('Tem a certeza que deseja excluir este usuário?')) {
            setUsuarios(atuais => atuais.filter(u => u.id !== id));
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
                            {usuarios.map((usuario) => (
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