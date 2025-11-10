import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import AddIcon from '@mui/icons-material/Add';
import TablePagination from '@mui/material/TablePagination';
import Autocomplete from '@mui/material/Autocomplete';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider'; 
import GetAppIcon from '@mui/icons-material/GetApp';

// --- INÍCIO DAS NOVAS IMPORTAÇÕES (RECHARTS) ---
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { CSVLink } from 'react-csv';

// --- FIM DAS NOVAS IMPORTAÇÕES ---

import { TransacaoFormModal } from '../components/TransacaoFormModal';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

// Interface
interface ITransacao {
    id: number;
    descricao: string;
    data: string;
    tipo: 'Entrada' | 'Saída';
    valor: number;
    categoria: string;
}

// Constantes de Categoria
const CATEGORIAS_ENTRADA = ['Receita de Sessão', 'Pagamento de Convênio', 'Outras Entradas'];
const CATEGORIAS_SAIDA = ['Despesa Fixa (Aluguel, Luz)', 'Material de Escritório', 'Salários', 'Impostos', 'Outras Saídas'];
const TODAS_CATEGORIAS = [...new Set([...CATEGORIAS_ENTRADA, ...CATEGORIAS_SAIDA])];

// Dados de Exemplo
const DADOS_INICIAIS: ITransacao[] = [
    { id: 1, descricao: 'Sessão João Silva', data: '2025-10-03', tipo: 'Entrada', valor: 150.00, categoria: 'Receita de Sessão' },
    { id: 2, descricao: 'Aluguel do Consultório', data: '2025-10-01', tipo: 'Saída', valor: 1200.00, categoria: 'Despesa Fixa (Aluguel, Luz)' },
    { id: 3, descricao: 'Consulta Maria Oliveira', data: '2025-09-28', tipo: 'Entrada', valor: 180.50, categoria: 'Receita de Sessão' },
    { id: 4, descricao: 'Material de escritório', data: '2025-09-27', tipo: 'Saída', valor: 80.00, categoria: 'Material de Escritório' },
    { id: 5, descricao: 'Sessão Pedro Alves', data: '2025-09-27', tipo: 'Entrada', valor: 150.00, categoria: 'Receita de Sessão' },
    { id: 6, descricao: 'Pagamento de Software', data: '2025-09-25', tipo: 'Saída', valor: 99.90, categoria: 'Outras Saídas' },
];

// Função de formatação
const formatarValor = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// Função para formatar data para o CSV
const formatarDataCSV = (data: string) => {
    // Adiciona T00:00:00 para evitar problemas de fuso horário
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', {timeZone: 'UTC'});
}

export const FinanceiroPage = () => {
    // Estados
    const [transacoes, setTransacoes] = useState<ITransacao[]>(DADOS_INICIAIS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [transacaoParaEditar, setTransacaoParaEditar] = useState<ITransacao | null>(null);
    const [filtroDataInicio, setFiltroDataInicio] = useState('');
    const [filtroDataFim, setFiltroDataFim] = useState('');
    const [filtroTipo, setFiltroTipo] = useState<'Todos' | 'Entrada' | 'Saída'>('Todos');
    const [filtroCategoria, setFiltroCategoria] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    // Lógica de filtro
    const transacoesFiltradas = useMemo(() => {
        return transacoes.filter(t => {
            const dataTransacao = new Date(t.data + 'T00:00:00');
            const inicioOk = !filtroDataInicio || dataTransacao >= new Date(filtroDataInicio + 'T00:00:00');
            const fimOk = !filtroDataFim || dataTransacao <= new Date(filtroDataFim + 'T00:00:00');
            const tipoOk = filtroTipo === 'Todos' || t.tipo === filtroTipo;
            const categoriaOk = !filtroCategoria || t.categoria === filtroCategoria;
            return inicioOk && fimOk && tipoOk && categoriaOk;
        }).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    }, [transacoes, filtroDataInicio, filtroDataFim, filtroTipo, filtroCategoria]);

    // Cálculos de resumo
    const entradas = transacoesFiltradas.filter(t => t.tipo === 'Entrada').reduce((acc, t) => acc + t.valor, 0);
    const saidas = transacoesFiltradas.filter(t => t.tipo === 'Saída').reduce((acc, t) => acc + t.valor, 0);
    const saldo = entradas - saidas;

    // Dados para o gráfico
    const dadosGrafico = [
        {
            name: 'Período Filtrado',
            Entradas: entradas,
            Saídas: saidas,
        }
    ];

    // --- INÍCIO DA MUDANÇA: Definições para o CSV ---
    // Cabeçalhos do ficheiro CSV
    const csvHeaders = [
        { label: "Data", key: "data" },
        { label: "Descrição", key: "descricao" },
        { label: "Tipo", key: "tipo" },
        { label: "Categoria", key: "categoria" },
        { label: "Valor (R$)", key: "valor" }
    ];

    // Prepara os dados para o CSV (usa a lista FILTRADA)
    const csvData = transacoesFiltradas.map(t => ({
        data: formatarDataCSV(t.data), // Formata a data
        descricao: t.descricao,
        tipo: t.tipo,
        categoria: t.categoria,
        valor: t.valor.toFixed(2) // Garante 2 casas decimais
    }));

    // Define o nome do ficheiro
    const csvFilename = `financeiro_clinica_ame_${new Date().toLocaleDateString('sv-SE')}.csv`;
    // --- FIM DA MUDANÇA ---

    // Handlers para o Modal
    const handleAbrirModalParaAdicionar = () => {
        setTransacaoParaEditar(null);
        setIsModalOpen(true);
    };

    const handleAbrirModalParaEditar = (transacao: ITransacao) => {
        setTransacaoParaEditar(transacao);
        setIsModalOpen(true);
    };

    const handleFecharModal = () => {
        setIsModalOpen(false);
    };

    const handleSalvarTransacao = (transacaoData: Omit<ITransacao, 'id'> & { id?: number }) => {
        if (transacaoData.id) {
            setTransacoes(atuais => atuais.map(t => t.id === transacaoData.id ? { ...t, ...transacaoData } as ITransacao : t));
        } else {
            const novoId = transacoes.length > 0 ? Math.max(...transacoes.map(t => t.id)) + 1 : 1;
            setTransacoes(atuais => [...atuais, { ...transacaoData, id: novoId }]);
        }
        handleFecharModal();
    };

    const handleApagar = (id: number) => {
        if (window.confirm('Tem a certeza que deseja excluir esta transação?')) {
            setTransacoes(atuais => atuais.filter(t => t.id !== id));
        }
    };

    // Handlers para a Paginação
    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Controle Financeiro
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleAbrirModalParaAdicionar}>
                    Nova Transação
                </Button>
            </Box>

            <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Filtrar Período</Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    <TextField 
                        size="small" 
                        label="Data de Início" 
                        type="date" 
                        InputLabelProps={{ shrink: true }}
                        value={filtroDataInicio}
                        onChange={(e) => setFiltroDataInicio(e.target.value)}
                    />
                    <TextField 
                        size="small" 
                        label="Data de Fim" 
                        type="date" 
                        InputLabelProps={{ shrink: true }}
                        value={filtroDataFim}
                        onChange={(e) => setFiltroDataFim(e.target.value)}
                    />
                </Box>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                    <FormControl size="small" sx={{ minWidth: 180, flexGrow: 1 }}>
                        <InputLabel id="filtro-tipo-label">Filtrar por Tipo</InputLabel>
                        <Select
                            labelId="filtro-tipo-label"
                            value={filtroTipo}
                            label="Filtrar por Tipo"
                            onChange={(e) => setFiltroTipo(e.target.value as 'Todos' | 'Entrada' | 'Saída')}
                        >
                            <MenuItem value="Todos">Todos os Tipos</MenuItem>
                            <MenuItem value="Entrada">Apenas Entradas</MenuItem>
                            <MenuItem value="Saída">Apenas Saídas</MenuItem>
                        </Select>
                    </FormControl>
                    <Autocomplete
                        options={TODAS_CATEGORIAS}
                        value={filtroCategoria}
                        onChange={(_event, newValue) => {
                            setFiltroCategoria(newValue);
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Filtrar por Categoria"
                                size="small"
                                variant="outlined"
                            />
                        )}
                        sx={{ minWidth: 200, flexGrow: 1 }}
                    />
                    {/* --- INÍCIO DA ADIÇÃO: Botão Exportar --- */}
                    {/* O CSVLink envolve o botão. marginLeft: 'auto' empurra-o para a direita */}
                    <CSVLink
                        data={csvData}
                        headers={csvHeaders}
                        filename={csvFilename}
                        style={{ textDecoration: 'none', marginLeft: 'auto' }}
                        target="_blank" // Abre o download
                    >
                        <Button 
                            variant="outlined" 
                            size="small" 
                            startIcon={<GetAppIcon />}
                            // Desabilita o botão se não houver dados filtrados para exportar
                            disabled={transacoesFiltradas.length === 0} 
                        >
                            Exportar para CSV
                        </Button>
                    </CSVLink>
                    {/* --- FIM DA ADIÇÃO --- */}
                </Box>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-around' }}>
                    <Box textAlign="center">
                        <Typography variant="body2" color="text.secondary">Entradas no Período</Typography>
                        <Typography variant="h5" color="green">{formatarValor(entradas)}</Typography>
                    </Box>
                    <Box textAlign="center">
                        <Typography variant="body2" color="text.secondary">Saídas no Período</Typography>
                        <Typography variant="h5" color="red">{formatarValor(saidas)}</Typography>
                    </Box>
                    <Box textAlign="center">
                        <Typography variant="body2" color="text.secondary">Saldo do Período</Typography>
                        <Typography variant="h5" color={saldo >= 0 ? 'blue' : 'red'}>{formatarValor(saldo)}</Typography>
                    </Box>
                </Box>

                {/* --- INÍCIO DA CORREÇÃO: Gráfico Visual --- */}
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" gutterBottom>Resumo Visual do Período</Typography>
                {/* O Box com altura definida é essencial para o ResponsiveContainer funcionar */}
                <Box sx={{ height: 300, width: '100%' }}> 
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={dadosGrafico}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis 
                                tickFormatter={(value) => `R$${value/1000}k`} 
                                domain={[0, 'dataMax + 100']}
                            />
                            <RechartsTooltip formatter={(value: number) => formatarValor(value)} />
                            <Legend />
                            <Bar dataKey="Entradas" fill="#2a9d8f" />
                            <Bar dataKey="Saídas" fill="#e76f51" />
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
                {/* --- FIM DA CORREÇÃO --- */}
            </Paper>

            <Typography variant="h5" component="h2" gutterBottom>
                Histórico de Transações
            </Typography>
            <Paper elevation={2} sx={{ width: '100%', overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Descrição</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Data</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Tipo</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Categoria</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Valor</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }} align="right">Ações</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(rowsPerPage > 0
                                ? transacoesFiltradas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                : transacoesFiltradas
                            ).map((transacao) => (
                                <TableRow key={transacao.id} hover>
                                    <TableCell>{transacao.descricao}</TableCell>
                                    <TableCell>{new Date(transacao.data + 'T00:00:00').toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={transacao.tipo} 
                                            color={transacao.tipo === 'Entrada' ? 'success' : 'error'} 
                                            size="small" 
                                        />
                                    </TableCell>
                                    <TableCell>{transacao.categoria}</TableCell>
                                    <TableCell sx={{ color: transacao.tipo === 'Entrada' ? 'green' : 'red' }}>
                                        {transacao.tipo === 'Entrada' ? '+' : '-'} {formatarValor(transacao.valor)}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Editar">
                                            <IconButton size="small" color="primary" onClick={() => handleAbrirModalParaEditar(transacao)}>
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Excluir">
                                            <IconButton size="small" color="error" onClick={() => handleApagar(transacao.id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={transacoesFiltradas.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Linhas por página:"
                    labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
                />
            </Paper>

            <TransacaoFormModal
                open={isModalOpen}
                onClose={handleFecharModal}
                onSave={handleSalvarTransacao}
                transacaoParaEditar={transacaoParaEditar}
            />
        </Box>
    );
};