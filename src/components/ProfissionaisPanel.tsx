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

import { professionalsService } from '../services/rest-client';

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

    // 3. Buscar Profissionais (GET)
    const carregarProfissionais = async () => {
        try {
            const data = await professionalsService.getAll();
            // Blindagem contra tela branca
            if (Array.isArray(data)) {
                setProfissionais(data);
            } else {
                setProfissionais([]);
            }
        } catch (err) {
            console.error("Erro ao carregar profissionais:", err);
            setProfissionais([]);
        }
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
    const handleSalvarProfissional = async (dados: Omit<IProfissional, 'id'> & { id?: number }) => {
        const payload = {
            nome: dados.nome,
            email: dados.email,
            especialidade: dados.especialidade
        };

        try {
            if (dados.id) {
                // Edição
                await professionalsService.update(dados.id, payload);
            } else {
                // Criação
                await professionalsService.create(payload);
            }
            carregarProfissionais();
            handleFecharModal();
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar profissional.");
        }
    };

    // 5. Apagar (DELETE)
    const handleApagar = async (id: number) => {
        if (window.confirm('Tem a certeza que deseja excluir este profissional?')) {
            try {
                await professionalsService.delete(id);
                setProfissionais(atuais => atuais.filter(p => p.id !== id));
            } catch (error) {
                console.error(error);
                alert("Erro ao excluir profissional.");
            }
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