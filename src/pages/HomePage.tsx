import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';

// Ícones
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAddAlt1';
import EventIcon from '@mui/icons-material/Event';

interface Verse {
    text: string;
    reference: string;
}

// Versículo padrão para ser usado em caso de falha da API
const VERSICULO_PADRAO: Verse = {
    text: "O Senhor é o meu pastor; de nada terei falta.",
    reference: "Salmos 23:1"
};

export const HomePage = () => {
    const { user } = useAuth();
    const [verse, setVerse] = useState<Verse>({ text: 'Carregando versículo...', reference: '' });

    useEffect(() => {
        const fetchRandomVerse = async () => {
            try {
                const apiUrl = `https://bible-api.com/data/almeida/random`;
                const response = await fetch(apiUrl);
                const data = await response.json();

                // --- INÍCIO DA CORREÇÃO: Verificação de Segurança ---
                // Verificamos se a resposta da API tem os campos que esperamos
                if (data && data.text && data.reference) {
                    // Se sim, atualizamos o estado com o versículo recebido
                    setVerse({ text: data.text.trim(), reference: data.reference });
                } else {
                    // Se não, registamos o erro e usamos o versículo padrão
                    console.error("Resposta da API inválida:", data);
                    setVerse(VERSICULO_PADRAO);
                }
                // --- FIM DA CORREÇÃO ---

            } catch (error) {
                console.error("Erro ao buscar o versículo:", error);
                // Se a chamada à API falhar, usamos o versículo padrão
                setVerse(VERSICULO_PADRAO);
            }
        };

        fetchRandomVerse();
    }, []);

    return (
        <Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" sx={{ mb: { xs: 2, md: 0 } }}>
                    Bem-vindo, {user?.name || 'Usuário'}!
                </Typography>
                <TextField
                    size="small"
                    placeholder="Pesquisar paciente ou profissional..."
                    variant="outlined"
                    InputProps={{ startAdornment: ( <InputAdornment position="start"> <SearchIcon /> </InputAdornment> ) }}
                    sx={{ width: { xs: '100%', md: '300px' } }}
                />
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                <Box sx={{ flexBasis: '100%' }}>
                    <Paper elevation={2} sx={{ p: 2 }}>
                        <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                            "{verse.text}"
                        </Typography>
                        <Typography variant="body2" sx={{ textAlign: 'right', fontWeight: 'bold', mt: 1 }}>
                            - {verse.reference}
                        </Typography>
                    </Paper>
                </Box>
                
                <Box sx={{ flexBasis: { xs: '100%', sm: 'calc(50% - 12px)' }, flexGrow: 1 }}>
                    <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                        <Typography variant="h6" gutterBottom> Ações Rápidas </Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Button variant="contained" startIcon={<EventIcon />}>Novo Agendamento</Button>
                            <Button variant="outlined" startIcon={<PersonAddIcon />}>Adicionar Paciente</Button>
                        </Box>
                    </Paper>
                </Box>
                <Box sx={{ flexBasis: { xs: '100%', sm: 'calc(50% - 12px)' }, flexGrow: 1 }}>
                    <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                        <Typography variant="h6" gutterBottom> Resumo de Hoje </Typography>
                        <Box>
                            <Typography variant="body2"><strong>0</strong> Agendamentos Confirmados</Typography>
                            <Typography variant="body2"><strong>0</strong> Pendências de Confirmação</Typography>
                            <Typography variant="body2"><strong>0</strong> Atendimentos Realizados</Typography>
                        </Box>
                    </Paper>
                </Box>
                <Box sx={{ flexBasis: { xs: '100%', md: 'calc(50% - 12px)' }, flexGrow: 1 }}>
                    <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                        <Typography variant="h6" gutterBottom> Metas do Mês </Typography>
                        <List dense>
                            <ListItem><ListItemText primary="- Atingir 80 atendimentos" /></ListItem>
                            <ListItem><ListItemText primary="- Reduzir faltas em 10%" /></ListItem>
                        </List>
                    </Paper>
                </Box>
                <Box sx={{ flexBasis: { xs: '100%', md: 'calc(50% - 12px)' }, flexGrow: 1 }}>
                    <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                        <Typography variant="h6" gutterBottom> Próximos Agendamentos </Typography>
                        <List dense>
                            <ListItem><ListItemText primary="14:00 - Ana Clara Sousa" secondary="Sessão de Fisioterapia" /></ListItem>
                            <Divider component="li" />
                            <ListItem><ListItemText primary="15:00 - Lucas Ferreira Lima" secondary="Consulta de Avaliação" /></ListItem>
                            <Divider component="li" />
                            <ListItem><ListItemText primary="Nenhum outro agendamento para hoje." sx={{ color: 'text.secondary', textAlign: 'center', mt: 1 }} /></ListItem>
                        </List>
                    </Paper>
                </Box>
            </Box>
        </Box>
    );
};