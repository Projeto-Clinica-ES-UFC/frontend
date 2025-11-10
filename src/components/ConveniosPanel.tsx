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
import { ConvenioFormModal } from './ConvenioFormModal';

// Interface para definir a "forma" de um convênio
interface IConvenio {
    id: number;
    nome: string;
    desconto: number; // Em percentagem
}

// Dados de exemplo iniciais
const DADOS_INICIAIS: IConvenio[] = [
    { id: 1, nome: 'Unimed', desconto: 10 },
    { id: 2, nome: 'Bradesco Saúde', desconto: 15 },
    { id: 3, nome: 'Amil', desconto: 12 },
];

export const ConveniosPanel = () => {
    const [convenios, setConvenios] = useState<IConvenio[]>(DADOS_INICIAIS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [convenioParaEditar, setConvenioParaEditar] = useState<IConvenio | null>(null);

    const handleAbrirModalParaAdicionar = () => {
        setConvenioParaEditar(null);
        setIsModalOpen(true);
    };

    const handleAbrirModalParaEditar = (convenio: IConvenio) => {
        setConvenioParaEditar(convenio);
        setIsModalOpen(true);
    };

    const handleFecharModal = () => {
        setIsModalOpen(false);
    };

    const handleSalvarConvenio = (dados: Omit<IConvenio, 'id'> & { id?: number }) => {
        if (dados.id) {
            // Lógica de Edição
            setConvenios(atuais => atuais.map(c => c.id === dados.id ? { ...c, ...dados } as IConvenio : c));
        } else {
            // Lógica de Adição
            const novoId = convenios.length > 0 ? Math.max(...convenios.map(c => c.id)) + 1 : 1;
            setConvenios(atuais => [...atuais, { ...dados, id: novoId }]);
        }
        handleFecharModal();
    };

    const handleApagar = (id: number) => {
        if (window.confirm('Tem a certeza que deseja excluir este convênio?')) {
            setConvenios(atuais => atuais.filter(c => c.id !== id));
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h2">
                    Convênios Atendidos
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAbrirModalParaAdicionar}
                >
                    Adicionar Convênio
                </Button>
            </Box>

            <Paper elevation={2} sx={{ width: '100%', overflow: 'hidden' }}>
                <TableContainer>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Nome do Convênio</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Desconto (%)</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }} align="right">Ações</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {convenios.map((convenio) => (
                                <TableRow key={convenio.id} hover>
                                    <TableCell>{convenio.nome}</TableCell>
                                    <TableCell>{convenio.desconto}%</TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Editar">
                                            <IconButton size="small" color="primary" onClick={() => handleAbrirModalParaEditar(convenio)}>
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Excluir">
                                            <IconButton size="small" color="error" onClick={() => handleApagar(convenio.id)}>
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

            <ConvenioFormModal
                open={isModalOpen}
                onClose={handleFecharModal}
                onSave={handleSalvarConvenio}
                convenioParaEditar={convenioParaEditar}
            />
        </Box>
    );
};