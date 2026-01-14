import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ptBR } from 'date-fns/locale';

// Interface IPaciente atualizada para incluir status
interface IPaciente {
    id: number;
    nome: string;
    cpf: string;
    dataNascimento: string;
    nomeResponsavel: string;
    telefoneResponsavel: string;
    status: 'Agendado' | 'Em Atendimento' | 'Finalizado' | 'Cancelado';
}

// Interface das Props atualizada para incluir onDelete
interface PacienteFormModalProps {
    open: boolean;
    onClose: () => void;
    // Ajustado onSave para não esperar status (será definido no Panel)
    onSave: (paciente: Omit<IPaciente, 'id' | 'status'> & { id?: number }) => void;
    pacienteParaEditar?: IPaciente | null;
    onDelete?: (id: number) => void;
}

export const PacienteFormModal = ({ open, onClose, onSave, pacienteParaEditar, onDelete }: PacienteFormModalProps) => {
    const [nome, setNome] = useState('');
    const [cpf, setCpf] = useState('');
    const [dataNascimento, setDataNascimento] = useState<Date | null>(null);
    const [nomeResponsavel, setNomeResponsavel] = useState('');
    const [telefoneResponsavel, setTelefoneResponsavel] = useState('');

    const formatarCPF = (valor: string) => {
        const apenasNumeros = valor.replace(/\D/g, '');
        return apenasNumeros
            .slice(0, 11)
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2');
    };

    useEffect(() => {
        if (pacienteParaEditar) {
            setNome(pacienteParaEditar.nome);
            setCpf(pacienteParaEditar.cpf);
            // Parse local date (midnight)
            setDataNascimento(new Date(pacienteParaEditar.dataNascimento + 'T00:00:00'));
            setNomeResponsavel(pacienteParaEditar.nomeResponsavel);
            setTelefoneResponsavel(pacienteParaEditar.telefoneResponsavel);
        } else {
            setNome('');
            setCpf('');
            setDataNascimento(null);
            setNomeResponsavel('');
            setTelefoneResponsavel('');
        }
    }, [pacienteParaEditar, open]);

    const handleSave = () => {
        if (!dataNascimento) {
            alert("Data de Nascimento é obrigatória");
            return;
        }

        // Format to YYYY-MM-DD
        const dataStr = dataNascimento.toISOString().split('T')[0];

        const pacienteData = {
            id: pacienteParaEditar?.id,
            nome,
            cpf,
            dataNascimento: dataStr,
            nomeResponsavel,
            telefoneResponsavel,
        };
        onSave(pacienteData);
    };

    // Função para chamar o onDelete
    const handleDelete = () => {
        if (pacienteParaEditar && onDelete) {
            if (window.confirm('Tem a certeza que deseja excluir este paciente permanentemente?')) {
                onDelete(pacienteParaEditar.id);
                onClose(); // Fecha o modal após excluir
            }
        }
    };


    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{pacienteParaEditar ? 'Editar Paciente' : 'Adicionar Novo Paciente'}</DialogTitle>
            <DialogContent>
                <Box component="form" noValidate autoComplete="off" sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        autoFocus
                        id="nome"
                        label="Nome Completo (Paciente)"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                    />
                    <TextField
                        id="cpf"
                        label="CPF (Paciente)"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={cpf}
                        onChange={(e) => setCpf(formatarCPF(e.target.value))}
                        inputProps={{ maxLength: 14 }}
                    />

                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                        <DatePicker
                            label="Data de Nascimento (Paciente)"
                            value={dataNascimento}
                            onChange={(newValue) => setDataNascimento(newValue)}
                            format="dd/MM/yyyy"
                            slotProps={{ textField: { fullWidth: true } }}
                        />
                    </LocalizationProvider>

                    <TextField
                        id="nomeResponsavel"
                        label="Nome do Responsável"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={nomeResponsavel}
                        onChange={(e) => setNomeResponsavel(e.target.value)}
                        required
                    />
                    <TextField
                        id="telefoneResponsavel"
                        label="Telefone do Responsável"
                        type="tel"
                        fullWidth
                        variant="outlined"
                        value={telefoneResponsavel}
                        onChange={(e) => setTelefoneResponsavel(e.target.value)}
                        placeholder="(XX) XXXXX-XXXX"
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
                {/* Botão Excluir (aparece só na edição) */}
                {pacienteParaEditar && onDelete ? (
                    <Button onClick={handleDelete} color="error" >
                        Excluir Paciente
                    </Button>
                ) : <Box />} {/* Espaçador para manter alinhamento */}

                <Box>
                    <Button onClick={onClose} sx={{ mr: 1 }}>Cancelar</Button>
                    <Button onClick={handleSave} variant="contained">Salvar</Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
};