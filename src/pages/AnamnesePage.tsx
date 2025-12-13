import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import Collapse from '@mui/material/Collapse';
import CircularProgress from '@mui/material/CircularProgress';

import { patientsService } from '../services/rest-client';

// Ícones
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import PrintIcon from '@mui/icons-material/Print';

// Importa o formulário e o tipo
import { AnamneseForm, type IAnamneseData } from '../components/AnamneseForm';

// Interface do Paciente (vinda da API)
interface IPaciente {
    id: number;
    nome: string;
    dataNascimento: string;
    sexo?: 'M' | 'F' | 'Outro'; // Campo opcional, pode não vir do backend
    telefoneResponsavel: string; // Backend manda telefoneResponsavel, mapear se necessário
    profissao?: string;
    endereco?: string;
    cidade?: string;
    nomeResponsavel: string;
}

export const AnamnesePage = () => {
    const { pacienteId } = useParams<{ pacienteId: string }>();
    const navigate = useNavigate();
    
    const [paciente, setPaciente] = useState<IPaciente | null>(null);
    const [anamneseData, setAnamneseData] = useState<IAnamneseData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showSuccess, setShowSuccess] = useState(false);

    // Cor dinâmica baseada no sexo (se disponível) ou padrão
    const mainColor = paciente?.sexo === 'F' ? '#F48FB1' : '#2196F3';

    // Carregar Dados
    useEffect(() => {
        if (!pacienteId) return;

        const carregarDados = async () => {
            setLoading(true);
            try {
                // 1. Busca Paciente
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const dadosPaciente: any = await patientsService.getById(pacienteId);
                if (dadosPaciente) {
                    setPaciente({
                        id: dadosPaciente.id,
                        nome: dadosPaciente.name || dadosPaciente.nome,
                        dataNascimento: dadosPaciente.birthDate || dadosPaciente.dataNascimento,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        sexo: (dadosPaciente.gender || dadosPaciente.sexo) as any,
                        telefoneResponsavel: dadosPaciente.phone || dadosPaciente.telefoneResponsavel,
                        nomeResponsavel: dadosPaciente.guardianName || dadosPaciente.nomeResponsavel,
                        // Extra fields that might come in English or Portuguese
                        profissao: dadosPaciente.occupation || dadosPaciente.profissao,
                        endereco: dadosPaciente.address || dadosPaciente.endereco,
                        cidade: dadosPaciente.city || dadosPaciente.cidade,
                    });
                }

                // 2. Busca Anamnese (Se existir)
                try {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const dadosAnamnese: any = await patientsService.getAnamnesis(pacienteId);
                    setAnamneseData(dadosAnamnese); // Preenche o form
                } catch {
                    // Se der 404 ou erro, assume vazia
                    setAnamneseData(null);
                }

            } catch (error) {
                console.error("Erro ao carregar dados:", error);
            } finally {
                setLoading(false);
            }
        };

        carregarDados();
    }, [pacienteId]);

    // Atualiza estado local quando o usuário digita no form
    const handleAnamneseDataChange = useCallback((data: IAnamneseData) => {
        setAnamneseData(data);
    }, []);

    // Salvar no Backend
    const handleSave = async () => {
        if (!anamneseData || !pacienteId) return;

        try {
            await patientsService.saveAnamnesis(pacienteId, anamneseData);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 4000);
        } catch (error) {
            console.error("Erro ao salvar:", error);
            alert("Erro de conexão ao salvar.");
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!paciente) {
        return <Typography variant="h6" sx={{ mt: 4, textAlign: 'center' }}>Paciente não encontrado.</Typography>;
    }

    return (
        <Box>
            {/* Header (Não impresso) */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }} className="no-print">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton onClick={() => navigate(`/pacientes/${pacienteId}/prontuario`)} sx={{ mr: 1 }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h4" component="h1">
                        Anamnese: {paciente.nome}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}>
                        Imprimir Ficha
                    </Button>
                    <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>
                        Salvar Anamnese
                    </Button>
                </Box>
            </Box>

            <Collapse in={showSuccess} sx={{ mb: 2, maxWidth: '900px', mx: 'auto' }} className="no-print">
                <Alert severity="success" onClose={() => setShowSuccess(false)}>
                    Anamnese salva com sucesso!
                </Alert>
            </Collapse>

            {/* Área de Impressão */}
            <Paper 
                elevation={3} 
                sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: '900px', mx: 'auto' }}
                id="anamnese-para-imprimir"
            >
                <AnamneseForm
                    pacienteNome={paciente.nome}
                    pacienteDataNascimento={paciente.dataNascimento} // Backend deve mandar formato ISO ou string
                    pacienteSexo={paciente.sexo}
                    pacienteTelefone={paciente.telefoneResponsavel}
                    pacienteProfissao={paciente.profissao}
                    pacienteEndereco={paciente.endereco}
                    pacienteCidade={paciente.cidade}
                    pacienteResponsavel={paciente.nomeResponsavel}
                    mainColor={mainColor}
                    initialData={anamneseData}
                    onDataChange={handleAnamneseDataChange}
                />
            </Paper>
        </Box>
    );
};