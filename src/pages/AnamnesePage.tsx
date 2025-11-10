import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import Collapse from '@mui/material/Collapse';

// Ícones
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import PrintIcon from '@mui/icons-material/Print';

// Importa o formulário e o tipo
import { AnamneseForm, type IAnamneseData } from '../components/AnamneseForm';

// --- Simulação de Dados (Simplificada, pois os dados estão no AnamneseForm) ---
interface IPaciente {
    id: number;
    nome: string;
    dataNascimento: string;
    sexo: 'M' | 'F' | 'Outro';
    telefone: string;
    profissao: string;
    endereco: string;
    cidade: string;
    nomeResponsavel: string;
}

// Simulação de dados de anamnese
const DADOS_ANAMNESE_MOCK: { [pacienteId: number]: IAnamneseData } = {
    1: { 
        queixaPrincipal: "Atraso no desenvolvimento da fala.",
        hda: "Desde os 2 anos, os pais notaram...",
        hmp: "Nascimento a termo...",
        gestacaoParto: "Gestação a termo, parto normal...",
        desenvolvimentoPsicomotor: "Sentou aos 6m, andou aos 14m...",
        historicoFamiliar: "Pai com TDAH.",
        medicacoesAlergias: "Nenhuma.",
        diagnosticoClinico: "Investigação para TEA",
        dataAvaliacao: "2023-10-26",
        pa: "100/60 mmHg",
        fc: "80 bpm",
        doencasMetabolicas: false, doencasCardiacas: false, doencasRespiratorias: false,
        doencasVasculares: false, doencasNeurologicas: false, doencasEndocrinas: false,
        doencasDermatologicas: false, doencasGastrointestinais: false, doencasVisuais: false,
        doencasAssociadasOutras: "Sem outras.",
        afDiabetes: false, afHipertensao: false, afCardiopatia: false, afNeoplasias: false,
        afDoencasHereditarias: false, afOutras: "Pai com TDAH.",
        apCondicoesCrescimento: "Sentou aos 6m, andou aos 14m.",
        apHabitosVidaAlimentacao: "Dieta variada.",
        apSono: "Dorme bem.",
        apTabagismo: 'Não', apTabagismoFrequencia: '', apEtilismo: 'Não', apEtilismoFrequencia: '',
        apUsoMedicacao: 'Não', apQualMedicacao: '',
    },
};

const getPacienteById = (id: number): IPaciente | null => {
    const pacientesSimulados: IPaciente[] = [
        { id: 1, nome: 'Ana Clara Sousa', dataNascimento: '2018-05-15', sexo: 'F', telefone: '(85) 99999-1111', profissao: 'Estudante', endereco: 'Rua A, 123', cidade: 'Fortaleza', nomeResponsavel: 'Maria Sousa' },
        { id: 2, nome: 'Lucas Ferreira Lima', dataNascimento: '2019-11-22', sexo: 'M', telefone: '(85) 98888-2222', profissao: 'Estudante', endereco: 'Av. B, 456', cidade: 'Caucaia', nomeResponsavel: 'Pedro Lima' },
        { id: 3, nome: 'Mariana Costa e Silva', dataNascimento: '2017-03-01', sexo: 'F', telefone: '(85) 97777-3333', profissao: 'Estudante', endereco: 'Trav. C, 789', cidade: 'Eusébio', nomeResponsavel: 'Joana Silva' },
    ];
    return pacientesSimulados.find(p => p.id === id) || null;
}
// --- Fim da Simulação ---


export const AnamnesePage = () => {
    const { pacienteId } = useParams<{ pacienteId: string }>();
    const navigate = useNavigate();
    const [paciente, setPaciente] = useState<IPaciente | null>(null);
    const [anamneseData, setAnamneseData] = useState<IAnamneseData | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const mainColor = paciente?.sexo === 'F' ? '#F48FB1' : '#2196F3';

    useEffect(() => {
        const idNum = Number(pacienteId);
        if (idNum) {
            const pacienteEncontrado = getPacienteById(idNum);
            setPaciente(pacienteEncontrado);
            if (DADOS_ANAMNESE_MOCK[idNum]) {
                setAnamneseData(DADOS_ANAMNESE_MOCK[idNum]);
            } else {
                setAnamneseData(null);
            }
        }
    }, [pacienteId]);

    const handleAnamneseDataChange = useCallback((data: IAnamneseData) => {
        setAnamneseData(data);
    }, []);

    const handleSave = () => {
        if (!anamneseData) return;
        console.log("Salvando Anamnese (simulado):", { pacienteId: paciente?.id, ...anamneseData });
        if (paciente?.id) {
            DADOS_ANAMNESE_MOCK[paciente.id] = anamneseData;
        }
        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
        }, 4000);
    };

    const handlePrint = () => {
        window.print();
    };

    if (!paciente) {
        return ( <Typography>Paciente não encontrado.</Typography> );
    }

    return (
        <Box>
            {/* Esta secção inteira (cabeçalho, botões, etc.) NÃO será impressa */}
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

            {/* Esta é a única secção que SERÁ impressa */}
            <Paper 
                elevation={3} 
                sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: '900px', mx: 'auto' }}
                id="anamnese-para-imprimir" // ID para o CSS de impressão
            >
                <AnamneseForm
                    pacienteNome={paciente.nome}
                    pacienteDataNascimento={paciente.dataNascimento}
                    pacienteSexo={paciente.sexo}
                    pacienteTelefone={paciente.telefone}
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