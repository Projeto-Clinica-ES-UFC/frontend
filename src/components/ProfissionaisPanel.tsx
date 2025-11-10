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

// Ícones
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutline';

// Importamos o nosso novo componente de Modal
import { ProfissionalFormModal } from './ProfissionalFormModal';

// Interface para definir a "forma" de um profissional
interface IProfissional {
    id: number;
    nome: string;
    email: string;
    especialidade: string;
}

// Dados de exemplo iniciais
const DADOS_INICIAIS: IProfissional[] = [
    { id: 1, nome: 'Dr. João da Silva', email: 'joao.silva@clinica.com', especialidade: 'Fisioterapeuta' },
    { id: 2, nome: 'Dra. Maria Oliveira', email: 'maria.oliveira@clinica.com', especialidade: 'Psicóloga' },
];

export const ProfissionaisPanel = () => {
    const [profissionais, setProfissionais] = useState<IProfissional[]>(DADOS_INICIAIS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [profissionalParaEditar, setProfissionalParaEditar] = useState<IProfissional | null>(null);

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

    const handleSalvarProfissional = (dados: Omit<IProfissional, 'id'> & { id?: number }) => {
        if (dados.id) {
            // Lógica de Edição
            setProfissionais(atuais => atuais.map(p => p.id === dados.id ? { ...p, ...dados } as IProfissional : p));
        } else {
            // Lógica de Adição
            const novoId = profissionais.length > 0 ? Math.max(...profissionais.map(p => p.id)) + 1 : 1;
            setProfissionais(atuais => [...atuais, { ...dados, id: novoId }]);
        }
        handleFecharModal();
    };

    const handleApagar = (id: number) => {
        if (window.confirm('Tem a certeza que deseja excluir este profissional?')) {
            setProfissionais(atuais => atuais.filter(p => p.id !== id));
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
                    onClick={handleAbrirModalParaAdicionar} // <-- Lógica adicionada
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
                            {profissionais.map((profissional) => (
                                <TableRow key={profissional.id} hover>
                                    <TableCell>{profissional.nome}</TableCell>
                                    <TableCell>{profissional.email}</TableCell>
                                    <TableCell>{profissional.especialidade}</TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Editar">
                                            <IconButton size="small" color="primary" onClick={() => handleAbrirModalParaEditar(profissional)}> {/* <-- Lógica adicionada */}
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
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* O Nosso Modal a ser renderizado */}
            <ProfissionalFormModal
                open={isModalOpen}
                onClose={handleFecharModal}
                onSave={handleSalvarProfissional}
                profissionalParaEditar={profissionalParaEditar}
            />
        </Box>
    );
};