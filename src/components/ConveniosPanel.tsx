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
import { ConvenioFormModal } from './ConvenioFormModal';

// Interface para definir a "forma" de um convênio
interface IConvenio {
    id: number;
    nome: string;
    desconto: number; // Em percentagem
}

export const ConveniosPanel = () => {
    // Começa vazio para evitar erro de map undefined
    const [convenios, setConvenios] = useState<IConvenio[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [convenioParaEditar, setConvenioParaEditar] = useState<IConvenio | null>(null);

    // Função BLINDADA para buscar os dados
    const carregarConvenios = () => {
        // Tenta pegar o token salvo (pode ser 'token', 'authToken' ou 'user')
        // Ajuste 'token' se o seu sistema usar outro nome
        const token = localStorage.getItem('token'); 

        fetch('http://localhost:3000/agreements', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Aqui vai o crachá!
                'Authorization': `Bearer ${token}` 
            }
        })
            .then(res => {
                if (res.status === 401) {
                    throw new Error('Não autorizado. Faça login novamente.');
                }
                if (!res.ok) {
                    throw new Error('O Backend retornou erro: ' + res.status);
                }
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setConvenios(data);
                } else {
                    setConvenios([]);
                }
            })
            .catch(err => {
                console.error("Erro ao carregar:", err);
                setConvenios([]);
            });
    };

    // Busca os dados assim que a tela abre
    useEffect(() => {
        carregarConvenios();
    }, []);

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

    // Função de Salvar (Criação ou Edição)
    const handleSalvarConvenio = (dados: Omit<IConvenio, 'id'> & { id?: number }) => {
        const token = localStorage.getItem('token'); // Pega o token
        const payload = {
            nome: dados.nome,
            desconto: Number(dados.desconto)
        };

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Crachá
        };

        if (dados.id) {
            // --- EDIÇÃO (PUT) ---
            fetch(`http://localhost:3000/agreements/${dados.id}`, {
                method: 'PUT',
                headers: headers, // Usa os headers com token
                body: JSON.stringify(payload)
            })
            .then(res => {
                if (res.ok) {
                    carregarConvenios(); 
                    handleFecharModal();
                } else {
                    alert("Erro ao atualizar (Verifique se está logado).");
                }
            })
            .catch(err => console.error("Erro na edição:", err));

        } else {
            // --- CRIAÇÃO (POST) ---
            fetch('http://localhost:3000/agreements', {
                method: 'POST',
                headers: headers, // Usa os headers com token
                body: JSON.stringify(payload)
            })
            .then(res => {
                if (res.ok) {
                    carregarConvenios();
                    handleFecharModal();
                } else {
                    alert("Erro ao criar (Verifique se está logado).");
                }
            })
            .catch(err => console.error("Erro na criação:", err));
        }
    };

    // Função de Apagar (DELETE)
    const handleApagar = (id: number) => {
        if (window.confirm('Tem a certeza que deseja excluir este convênio?')) {
            const token = localStorage.getItem('token'); // Pega o token
            
            fetch(`http://localhost:3000/agreements/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}` // Crachá
                }
            })
            .then(res => {
                if (res.ok) {
                    setConvenios(atuais => atuais.filter(c => c.id !== id));
                } else {
                    alert("Erro ao excluir. Verifique permissões.");
                }
            })
            .catch(err => console.error("Erro de conexão:", err));
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
                            {/* PROTEÇÃO EXTRA: O '?' garante que map só roda se convenios existir */}
                            {convenios?.map((convenio) => (
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
                            {/* Mensagem amigável se a lista estiver vazia */}
                            {(!convenios || convenios.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={3} align="center">
                                        Nenhum convênio cadastrado (ou erro de conexão).
                                    </TableCell>
                                </TableRow>
                            )}
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