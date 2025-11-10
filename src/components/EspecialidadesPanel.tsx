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
import { EspecialidadeFormModal } from './EspecialidadeFormModal';

// Interface para definir a "forma" de uma especialidade
interface IEspecialidade {
    id: number;
    nome: string;
}

// Dados de exemplo iniciais
const DADOS_INICIAIS: IEspecialidade[] = [
    { id: 1, nome: 'Fisioterapia' },
    { id: 2, nome: 'Psicologia' },
    { id: 3, nome: 'Terapia Ocupacional' },
];

export const EspecialidadesPanel = () => {
    const [especialidades, setEspecialidades] = useState<IEspecialidade[]>(DADOS_INICIAIS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [especialidadeParaEditar, setEspecialidadeParaEditar] = useState<IEspecialidade | null>(null);

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

    const handleSalvarEspecialidade = (dados: Omit<IEspecialidade, 'id'> & { id?: number }) => {
        if (dados.id) {
            // Lógica de Edição
            setEspecialidades(atuais => atuais.map(e => e.id === dados.id ? { ...e, ...dados } as IEspecialidade : e));
        } else {
            // Lógica de Adição
            const novoId = especialidades.length > 0 ? Math.max(...especialidades.map(e => e.id)) + 1 : 1;
            setEspecialidades(atuais => [...atuais, { ...dados, id: novoId }]);
        }
        handleFecharModal();
    };

    const handleApagar = (id: number) => {
        if (window.confirm('Tem a certeza que deseja excluir esta especialidade?')) {
            setEspecialidades(atuais => atuais.filter(e => e.id !== id));
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
                            {especialidades.map((especialidade) => (
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