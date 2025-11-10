import { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';

// Importações da biblioteca de gráficos (recharts)
// Adicionamos os componentes para o Gráfico de Pizza
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Ícones
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import GetAppIcon from '@mui/icons-material/GetApp';
import PrintIcon from '@mui/icons-material/Print';

// Dados de exemplo para os gráficos
const dadosGraficoFinanceiro = [
    { name: 'Financeiro', Faturamento: 150.00, Despesas: 0 },
];

const dadosGraficoAtendimentos = [
    { name: 'Dr. João', Atendimentos: 5 },
    { name: 'Dra. Maria', Atendimentos: 8 },
];

const dadosGraficoPizza = [
    { name: 'Fisioterapia', value: 5 },
    { name: 'Psicologia', value: 8 },
];
const CORES_PIZZA = ['#0077b6', '#2a9d8f'];


export const RelatoriosPage = () => {
    const [periodo, setPeriodo] = useState('Mensal');

    return (
        <Box>
            {/* CABEÇALHO DA PÁGINA */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Relatórios e Indicadores
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField select size="small" value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
                        <MenuItem value="Diário">Diário</MenuItem>
                        <MenuItem value="Semanal">Semanal</MenuItem>
                        <MenuItem value="Mensal">Mensal</MenuItem>
                    </TextField>
                    <Button variant="outlined" size="small" startIcon={<GetAppIcon />}>Exportar</Button>
                    <Button variant="outlined" size="small" startIcon={<PrintIcon />}>Imprimir</Button>
                </Box>
            </Box>

            {/* SELETOR DE MÊS/PERÍODO */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
                <IconButton><NavigateBeforeIcon /></IconButton>
                <Typography variant="h6">Outubro de 2025</Typography>
                <IconButton><NavigateNextIcon /></IconButton>
            </Box>

            {/* GRELHA PRINCIPAL COM BOX */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>

                {/* Cartões de Resumo (sem alteração) */}
                <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: 'calc(33.33% - 16px)' } }}>
                    <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">Faturamento no Período</Typography>
                        <Typography variant="h5" color="green">R$ 150,00</Typography>
                    </Paper>
                </Box>
                <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: 'calc(33.33% - 16px)' } }}>
                    <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">Despesas no Período</Typography>
                        <Typography variant="h5" color="red">R$ 0,00</Typography>
                    </Paper>
                </Box>
                <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: 'calc(33.33% - 16px)' } }}>
                    <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">Atendimentos no Período</Typography>
                        <Typography variant="h5">13</Typography>
                    </Paper>
                </Box>

                {/* --- INÍCIO DA CORREÇÃO DOS GRÁFICOS --- */}

                {/* Gráfico de Desempenho Financeiro */}
                <Box sx={{ width: '100%', flexBasis: { xs: '100%', lg: 'calc(50% - 12px)' }, flexGrow: 1 }}>
                    <Paper elevation={2} sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>Desempenho Financeiro</Typography>
                        {/* O ResponsiveContainer precisa de uma altura definida no pai para funcionar */}
                        <Box sx={{ height: 300 }}> 
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dadosGraficoFinanceiro}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                                    <Legend />
                                    <Bar dataKey="Faturamento" fill="#2a9d8f" />
                                    <Bar dataKey="Despesas" fill="#e76f51" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Box>

                {/* Gráfico de Atendimentos por Profissional */}
                <Box sx={{ width: '100%', flexBasis: { xs: '100%', lg: 'calc(50% - 12px)' }, flexGrow: 1 }}>
                    <Paper elevation={2} sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>Atendimentos por Profissional</Typography>
                        <Box sx={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dadosGraficoAtendimentos}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="Atendimentos" fill="#0077b6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Box>

                {/* NOVO GRÁFICO DE PIZZA */}
                <Box sx={{ width: '100%', flexBasis: '100%', flexGrow: 1 }}>
                    <Paper elevation={2} sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>Distribuição por Especialidade</Typography>
                        <Box sx={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={dadosGraficoPizza} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                        {dadosGraficoPizza.map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={CORES_PIZZA[index % CORES_PIZZA.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Box>

            </Box>
        </Box>
    );
};