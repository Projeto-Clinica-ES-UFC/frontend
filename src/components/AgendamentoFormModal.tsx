import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Autocomplete from '@mui/material/Autocomplete';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { ptBR } from 'date-fns/locale';

// Interfaces para Paciente e Profissional
interface IPaciente { id: number; nome: string; }
interface IProfissional { id: number; nome: string; }

// A "forma" de um evento
interface IEvento {
    id: string;
    title?: string;
    start: string;
    end?: string;
    status: string;
    pacienteId: number | null;
    profissionalId: number | null;
    pendenciaUnimed?: boolean;
}

// Props do Modal
interface AgendamentoFormModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (evento: Omit<IEvento, 'id'> & { id?: string }) => void;
    eventoParaEditar?: IEvento | null;
    dataSelecionada?: string;
    pacientes: IPaciente[];
    profissionais: IProfissional[];
}

export const AgendamentoFormModal = ({ open, onClose, onSave, eventoParaEditar, dataSelecionada, pacientes, profissionais }: AgendamentoFormModalProps) => {
    // Estados
    const [start, setStart] = useState<Date | null>(null);
    const [end, setEnd] = useState<Date | null>(null);
    const [status, setStatus] = useState('Pendente');
    const [pendenciaUnimed, setPendenciaUnimed] = useState(false);
    const [pacienteId, setPacienteId] = useState<number | ''>('');
    const [profissionalId, setProfissionalId] = useState<number | ''>('');

    // Inicialização
    useEffect(() => {
        if (eventoParaEditar) {
            setStart(new Date(eventoParaEditar.start));
            setEnd(eventoParaEditar.end ? new Date(eventoParaEditar.end) : null);
            setStatus(eventoParaEditar.status);
            setPacienteId(eventoParaEditar.pacienteId || '');
            setProfissionalId(eventoParaEditar.profissionalId || '');
            setPendenciaUnimed(eventoParaEditar.pendenciaUnimed || false);

        } else {
            setStart(dataSelecionada ? new Date(dataSelecionada) : new Date());
            setEnd(null);
            setStatus('Pendente');
            setPacienteId('');
            setProfissionalId('');
            setPendenciaUnimed(false);
        }
    }, [eventoParaEditar, dataSelecionada, open]);

    const handleSave = () => {
        if (!start) {
            alert("Data de início é obrigatória!");
            return;
        }

        const eventoData = {
            id: eventoParaEditar?.id,
            start: start.toISOString(),
            end: end ? end.toISOString() : undefined,
            status,
            pacienteId: Number(pacienteId) || null,
            profissionalId: Number(profissionalId) || null,
            pendenciaUnimed,
        };
        onSave(eventoData);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{eventoParaEditar ? 'Editar Agendamento' : 'Novo Agendamento'}</DialogTitle>
            <DialogContent>
                <Box component="form" noValidate autoComplete="off" sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>

                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>

                        {/* Campo Autocomplete para Paciente */}
                        <Autocomplete
                            id="paciente-autocomplete"
                            options={pacientes}
                            getOptionLabel={(option) => option.nome}
                            value={pacientes.find(p => p.id === pacienteId) || null}
                            onChange={(_event, newValue) => {
                                setPacienteId(newValue ? newValue.id : '');
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Paciente"
                                    variant="outlined"
                                    required
                                />
                            )}
                        />

                        {/* Campo Autocomplete para Profissional */}
                        <Autocomplete
                            id="profissional-autocomplete"
                            options={profissionais}
                            getOptionLabel={(option) => option.nome}
                            value={profissionais.find(p => p.id === profissionalId) || null}
                            onChange={(_event, newValue) => {
                                setProfissionalId(newValue ? newValue.id : '');
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Profissional"
                                    variant="outlined"
                                    required
                                />
                            )}
                        />

                        {/* DateTimePickers Substituindo TextFields nativos */}
                        <DateTimePicker
                            label="Data e Hora de Início"
                            value={start}
                            onChange={(newValue) => setStart(newValue)}
                            viewRenderers={{
                                hours: null,
                                minutes: null,
                                seconds: null,
                            }}
                            ampm={false} // Force 24h
                            format="dd/MM/yyyy HH:mm" // Brazilian format
                            slotProps={{ textField: { fullWidth: true, required: true } }}
                        />

                        <DateTimePicker
                            label="Data e Hora de Fim (opcional)"
                            value={end}
                            onChange={(newValue) => setEnd(newValue)}
                            ampm={false}
                            format="dd/MM/yyyy HH:mm"
                            slotProps={{ textField: { fullWidth: true } }}
                        />

                    </LocalizationProvider>

                    {/* Campo de Seleção para o Status */}
                    <FormControl fullWidth>
                        <TextField
                            id="status"
                            select
                            label="Status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <MenuItem value="Pendente">Pendente</MenuItem>
                            <MenuItem value="Confirmado">Confirmado</MenuItem>
                            <MenuItem value="Realizado">Realizado</MenuItem>
                            <MenuItem value="Cancelado">Cancelado</MenuItem>
                        </TextField>
                    </FormControl>

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={pendenciaUnimed}
                                onChange={(e) => setPendenciaUnimed(e.target.checked)}
                                name="pendenciaUnimed"
                                color="warning"
                            />
                        }
                        label="Pendência Unimed"
                    />

                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSave} variant="contained">Salvar</Button>
            </DialogActions>
        </Dialog>
    );
};