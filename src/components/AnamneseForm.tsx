import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

// Interfaces para os dados da anamnese
export interface IAnamneseData {
    queixaPrincipal: string;
    hda: string;
    hmp: string; // Histórico Médico Pregresso (incluindo doenças anteriores e vacinação)
    gestacaoParto: string;
    desenvolvimentoPsicomotor: string;
    historicoFamiliar: string;
    medicacoesAlergias: string;

    // Campos da imagem
    dataNascimento?: string; // Para o cabeçalho
    sexo?: 'M' | 'F' | 'Outro'; // Para o cabeçalho
    telefone?: string;
    profissao?: string;
    endereco?: string;
    cidade?: string;
    diagnosticoClinico?: string;
    dataAvaliacao?: string;
    responsavel?: string;
    pa?: string; // Pressão Arterial
    fc?: string; // Frequência Cardíaca

    // Doenças Associadas
    doencasMetabolicas: boolean;
    doencasCardiacas: boolean;
    doencasRespiratorias: boolean;
    doencasVasculares: boolean;
    doencasNeurologicas: boolean;
    doencasEndocrinas: boolean;
    doencasDermatologicas: boolean;
    doencasGastrointestinais: boolean;
    doencasVisuais: boolean;
    doencasAssociadasOutras: string;

    // Antecedentes Familiares
    afDiabetes: boolean;
    afHipertensao: boolean;
    afCardiopatia: boolean;
    afNeoplasias: boolean;
    afDoencasHereditarias: boolean;
    afOutras: string;

    // Antecedentes Pessoais
    apCondicoesCrescimento: string; // DNPM Anormal, Convulsões, Epilepsia, Focos Neurais
    apHabitosVidaAlimentacao: string;
    apSono: string;
    apTabagismo: 'Sim' | 'Não' | '';
    apTabagismoFrequencia: string;
    apEtilismo: 'Sim' | 'Não' | '';
    apEtilismoFrequencia: string;
    apUsoMedicacao: 'Sim' | 'Não' | '';
    apQualMedicacao: string;
}

interface AnamneseFormProps {
    pacienteNome: string;
    pacienteDataNascimento?: string;
    pacienteSexo?: 'M' | 'F' | 'Outro';
    pacienteTelefone?: string;
    pacienteProfissao?: string;
    pacienteEndereco?: string;
    pacienteCidade?: string;
    pacienteResponsavel?: string;
    mainColor: string; // Cor principal para os cabeçalhos das secções
    initialData?: IAnamneseData | null; // Dados iniciais para preencher o formulário
    onDataChange: (data: IAnamneseData) => void; // Para passar os dados para a página pai
}

export const AnamneseForm = ({ 
    pacienteNome, 
    pacienteDataNascimento,
    pacienteSexo,
    pacienteTelefone,
    pacienteProfissao,
    pacienteEndereco,
    pacienteCidade,
    pacienteResponsavel,
    mainColor, 
    initialData, 
    onDataChange 
}: AnamneseFormProps) => {

    // --- Estados do Formulário (Todos os campos detalhados) ---
    const [formData, setFormData] = useState<IAnamneseData>(() => initialData || {
        queixaPrincipal: '', hda: '', hmp: '', gestacaoParto: '', desenvolvimentoPsicomotor: '',
        historicoFamiliar: '', medicacoesAlergias: '',
        doencasMetabolicas: false, doencasCardiacas: false, doencasRespiratorias: false,
        doencasVasculares: false, doencasNeurologicas: false, doencasEndocrinas: false,
        doencasDermatologicas: false, doencasGastrointestinais: false, doencasVisuais: false,
        doencasAssociadasOutras: '',
        afDiabetes: false, afHipertensao: false, afCardiopatia: false, afNeoplasias: false,
        afDoencasHereditarias: false, afOutras: '',
        apCondicoesCrescimento: '', apHabitosVidaAlimentacao: '', apSono: '',
        apTabagismo: '', apTabagismoFrequencia: '', apEtilismo: '', apEtilismoFrequencia: '',
        apUsoMedicacao: '', apQualMedicacao: '',
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    // Função genérica para atualizar os campos do formulário
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value, type, checked } = e.target as HTMLInputElement;
        let newValue: string | boolean = value;

        if (type === 'checkbox') {
            newValue = checked;
        }

        const updatedData = { ...formData, [id]: newValue };
        setFormData(updatedData);
        onDataChange(updatedData); // Notifica a página pai sobre a mudança
    };

    // Função para atualizar radio buttons
    const handleRadioChange = (name: keyof IAnamneseData, value: string) => {
        const updatedData = { ...formData, [name]: value };
        setFormData(updatedData);
        onDataChange(updatedData);
    };

    // Componente auxiliar para a linha verde do título das seções
    const SectionHeader = ({ title }: { title: string }) => (
        <Box sx={{ bgcolor: mainColor, color: 'white', p: 1, borderRadius: '4px', mb: 2 }}>
            <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                {title}
            </Typography>
        </Box>
    );

    return (
        <Box component="form" noValidate autoComplete="off" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            {/* Cabeçalho da Ficha - Identificação do Fisioterapeuta e Título */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {/* A imagem do logo do Dr. Rodrigo Barreto aqui */}
                    {/* <img src="/caminho/para/logo.png" alt="Dr. Rodrigo Barreto" style={{ height: 60, marginRight: 10 }} /> */}
                    <Box>
                        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                            Dr. Rodrigo Barreto
                        </Typography>
                        <Typography variant="body2">
                            Fisioterapia CREFITO 0000
                        </Typography>
                    </Box>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: mainColor }}>
                    FICHA DE AVALIAÇÃO
                </Typography>
            </Box>
            <Divider />

            {/* Secção: Identificação Pessoal */}
            <SectionHeader title="Identificação Pessoal" />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                <TextField label="Nome" fullWidth variant="outlined" id="nome" value={pacienteNome} disabled />
                <TextField label="Data de Nascimento" fullWidth variant="outlined" id="dataNascimento" value={pacienteDataNascimento || ''} disabled />
                <FormControl component="fieldset" margin="none">
                    <FormLabel component="legend" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>Sexo:</FormLabel>
                    <RadioGroup row id="sexo" value={pacienteSexo || ''}>
                        <FormControlLabel value="M" control={<Radio size="small" />} label="M" disabled />
                        <FormControlLabel value="F" control={<Radio size="small" />} label="F" disabled />
                    </RadioGroup>
                </FormControl>
                <TextField label="Telefone" fullWidth variant="outlined" id="telefone" value={pacienteTelefone || ''} disabled />
                <TextField label="Profissão" fullWidth variant="outlined" id="profissao" value={pacienteProfissao || ''} disabled />
                <TextField label="Endereço" fullWidth variant="outlined" id="endereco" value={pacienteEndereco || ''} disabled />
                <TextField label="Cidade" fullWidth variant="outlined" id="cidade" value={pacienteCidade || ''} disabled />
                <TextField label="Diagnóstico Clínico" fullWidth variant="outlined" id="diagnosticoClinico" value={formData.diagnosticoClinico} onChange={handleChange} />
                <TextField label="Data da Avaliação" fullWidth variant="outlined" type="date" id="dataAvaliacao" value={formData.dataAvaliacao || ''} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                <TextField label="Responsável" fullWidth variant="outlined" id="responsavel" value={pacienteResponsavel || ''} disabled />
                <TextField label="P.A." fullWidth variant="outlined" id="pa" value={formData.pa} onChange={handleChange} />
                <TextField label="F.C." fullWidth variant="outlined" id="fc" value={formData.fc} onChange={handleChange} />
            </Box>

            {/* Secção: Anamnese e História Clínica */}
            <SectionHeader title="Anamnese e História Clínica" />
            <TextField
                label="Queixa Principal (QP)"
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                id="queixaPrincipal"
                value={formData.queixaPrincipal}
                onChange={handleChange}
            />
            <TextField
                label="História da Doença Atual (HDA)"
                fullWidth
                multiline
                rows={5}
                variant="outlined"
                id="hda"
                value={formData.hda}
                onChange={handleChange}
            />
            <TextField
                label="História Patológica Pregressa (HPP)"
                fullWidth
                multiline
                rows={5}
                variant="outlined"
                id="hmp"
                value={formData.hmp}
                onChange={handleChange}
            />

            {/* Secção: Doenças Associadas */}
            <SectionHeader title="Doenças Associadas" />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 1 }}>
                <FormControlLabel control={<Checkbox id="doencasMetabolicas" checked={formData.doencasMetabolicas} onChange={handleChange} />} label="Metabólicas" />
                <FormControlLabel control={<Checkbox id="doencasCardiacas" checked={formData.doencasCardiacas} onChange={handleChange} />} label="Cardíacas" />
                <FormControlLabel control={<Checkbox id="doencasRespiratorias" checked={formData.doencasRespiratorias} onChange={handleChange} />} label="Respiratórias" />
                <FormControlLabel control={<Checkbox id="doencasVasculares" checked={formData.doencasVasculares} onChange={handleChange} />} label="Vasculares" />
                <FormControlLabel control={<Checkbox id="doencasNeurologicas" checked={formData.doencasNeurologicas} onChange={handleChange} />} label="Neurológicas" />
                <FormControlLabel control={<Checkbox id="doencasEndocrinas" checked={formData.doencasEndocrinas} onChange={handleChange} />} label="Endócrinas" />
                <FormControlLabel control={<Checkbox id="doencasDermatologicas" checked={formData.doencasDermatologicas} onChange={handleChange} />} label="Dermatológicas" />
                <FormControlLabel control={<Checkbox id="doencasGastrointestinais" checked={formData.doencasGastrointestinais} onChange={handleChange} />} label="Gastrointestinais" />
                <FormControlLabel control={<Checkbox id="doencasVisuais" checked={formData.doencasVisuais} onChange={handleChange} />} label="Visuais" />
            </Box>
            <TextField label="Especificar outras doenças associadas" fullWidth variant="outlined" id="doencasAssociadasOutras" value={formData.doencasAssociadasOutras} onChange={handleChange} />

            {/* Secção: Antecedentes Familiares */}
            <SectionHeader title="Antecedentes Familiares" />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 1 }}>
                <FormControlLabel control={<Checkbox id="afDiabetes" checked={formData.afDiabetes} onChange={handleChange} />} label="Diabetes" />
                <FormControlLabel control={<Checkbox id="afHipertensao" checked={formData.afHipertensao} onChange={handleChange} />} label="Hipertensão" />
                <FormControlLabel control={<Checkbox id="afCardiopatia" checked={formData.afCardiopatia} onChange={handleChange} />} label="Cardiopatia" />
                <FormControlLabel control={<Checkbox id="afNeoplasias" checked={formData.afNeoplasias} onChange={handleChange} />} label="Neoplasias" />
                <FormControlLabel control={<Checkbox id="afDoencasHereditarias" checked={formData.afDoencasHereditarias} onChange={handleChange} />} label="Doenças Hereditárias" />
            </Box>
            <TextField label="Especificar outros antecedentes familiares" fullWidth variant="outlined" id="afOutras" value={formData.afOutras} onChange={handleChange} />

            {/* Secção: Antecedentes Pessoais */}
            <SectionHeader title="Antecedentes Pessoais" />
            <TextField
                label="Condições de Crescimento (DNPM Anormal, Convulsões, Epilepsia, Focos Neurais)"
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                id="apCondicoesCrescimento"
                value={formData.apCondicoesCrescimento}
                onChange={handleChange}
            />
            <TextField
                label="Hábitos de Vida e Alimentação"
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                id="apHabitosVidaAlimentacao"
                value={formData.apHabitosVidaAlimentacao}
                onChange={handleChange}
            />
            <TextField
                label="Sono (Padrão, Dificuldades)"
                fullWidth
                multiline
                rows={2}
                variant="outlined"
                id="apSono"
                value={formData.apSono}
                onChange={handleChange}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                <FormControl component="fieldset">
                    <FormLabel component="legend">Tabagismo:</FormLabel>
                    <RadioGroup row id="apTabagismo" value={formData.apTabagismo} onChange={(e) => handleRadioChange('apTabagismo', e.target.value)}>
                        <FormControlLabel value="Sim" control={<Radio size="small" />} label="Sim" />
                        <FormControlLabel value="Não" control={<Radio size="small" />} label="Não" />
                    </RadioGroup>
                </FormControl>
                {formData.apTabagismo === 'Sim' && (
                    <TextField label="Frequência" fullWidth variant="outlined" id="apTabagismoFrequencia" value={formData.apTabagismoFrequencia} onChange={handleChange} />
                )}
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                <FormControl component="fieldset">
                    <FormLabel component="legend">Etilismo:</FormLabel>
                    <RadioGroup row id="apEtilismo" value={formData.apEtilismo} onChange={(e) => handleRadioChange('apEtilismo', e.target.value)}>
                        <FormControlLabel value="Sim" control={<Radio size="small" />} label="Sim" />
                        <FormControlLabel value="Não" control={<Radio size="small" />} label="Não" />
                    </RadioGroup>
                </FormControl>
                {formData.apEtilismo === 'Sim' && (
                    <TextField label="Frequência" fullWidth variant="outlined" id="apEtilismoFrequencia" value={formData.apEtilismoFrequencia} onChange={handleChange} />
                )}
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                <FormControl component="fieldset">
                    <FormLabel component="legend">Uso de Medicação:</FormLabel>
                    <RadioGroup row id="apUsoMedicacao" value={formData.apUsoMedicacao} onChange={(e) => handleRadioChange('apUsoMedicacao', e.target.value)}>
                        <FormControlLabel value="Sim" control={<Radio size="small" />} label="Sim" />
                        <FormControlLabel value="Não" control={<Radio size="small" />} label="Não" />
                    </RadioGroup>
                </FormControl>
                {formData.apUsoMedicacao === 'Sim' && (
                    <TextField label="Qual" fullWidth variant="outlined" id="apQualMedicacao" value={formData.apQualMedicacao} onChange={handleChange} />
                )}
            </Box>

        </Box>
    );
};