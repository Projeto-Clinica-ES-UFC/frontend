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

// Interfaces para Paciente e Profissional
interface IPaciente { id: number; nome: string; }
interface IProfissional { id: number; nome: string; }

// A "forma" de um evento, que vamos receber da página principal
interface IEvento {
    id: string;
    title?: string;
    start: string;
    end?: string; // O '?' torna o campo opcional
    status: string;
    pacienteId: number | null;
    profissionalId: number | null;
    pendenciaUnimed?: boolean;
}

// As propriedades que este nosso componente de Modal vai aceitar
interface AgendamentoFormModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (evento: Omit<IEvento, 'id'> & { id?: string }) => void;
    eventoParaEditar?: IEvento | null;
    dataSelecionada?: string; // Para quando clicamos numa data vazia
    pacientes: IPaciente[];
    profissionais: IProfissional[];
}

export const AgendamentoFormModal = ({ open, onClose, onSave, eventoParaEditar, dataSelecionada, pacientes, profissionais }: AgendamentoFormModalProps) => {
    // Estados para guardar os dados do formulário
    const [start, setStart] = useState('');
    const [end, setEnd] = useState(''); // Estado para a data de fim
    const [status, setStatus] = useState('Pendente'); // Estado para o status
    const [pendenciaUnimed, setPendenciaUnimed] = useState(false); // Estado para a pendência Unimed
    const [pacienteId, setPacienteId] = useState<number | ''>('');
    const [profissionalId, setProfissionalId] = useState<number | ''>(''); 

    // Este useEffect corre sempre que o modal abre ou o evento a editar muda
    useEffect(() => {
      if (eventoParaEditar) {
          setStart(eventoParaEditar.start.substring(0, 16));
          setEnd(eventoParaEditar.end ? eventoParaEditar.end.substring(0, 16) : '');
          setStatus(eventoParaEditar.status);
          setPacienteId(eventoParaEditar.pacienteId || ''); 
          setProfissionalId(eventoParaEditar.profissionalId || ''); 
          setPendenciaUnimed(eventoParaEditar.pendenciaUnimed || false);

      } else {
          // setTitle('');
          setStart(dataSelecionada || '');
          setEnd('');
          setStatus('Pendente');
          setPacienteId('');
          setProfissionalId(''); 
          setPendenciaUnimed(false);
      }
  }, [eventoParaEditar, dataSelecionada, open]);

    const handleSave = () => {
      const eventoData = {
          id: eventoParaEditar?.id,
          // title, // Removido
          start,
          end,
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

                {/* --- INÍCIO DA MUDANÇA NO FORMULÁRIO --- */}
                {/* Campo Autocomplete para Paciente */}
                <Autocomplete
                    id="paciente-autocomplete"
                    options={pacientes} // A lista completa de pacientes
                    getOptionLabel={(option) => option.nome} // O que mostrar na lista
                    value={pacientes.find(p => p.id === pacienteId) || null} // Encontra o objeto paciente selecionado
                    onChange={(_event, newValue) => {
                        setPacienteId(newValue ? newValue.id : ''); // Guarda o ID do paciente selecionado
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
                    options={profissionais} // A lista completa de profissionais
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
                {/* --- FIM DA MUDANÇA NO FORMULÁRIO --- */}

                <TextField
                    id="start"
                    label="Data e Hora de Início"
                    type="datetime-local"
                    fullWidth
                    variant="outlined"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                />

                {/* Campo para a Data de Fim */}
                <TextField
                    id="end"
                    label="Data e Hora de Fim (opcional)"
                        type="datetime-local"
                        fullWidth
                        variant="outlined"
                        value={end}
                        onChange={(e) => setEnd(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />

                    {/* Campo de Seleção para o Status */}
                    <FormControl fullWidth>
                        <TextField
                            id="status"
                            select // Isto transforma o TextField num menu de seleção
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

                    {/* --- INÍCIO DA ADIÇÃO DA CHECKBOX --- */}
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={pendenciaUnimed}
                                onChange={(e) => setPendenciaUnimed(e.target.checked)}
                                name="pendenciaUnimed"
                                color="warning" // Cor amarela para combinar com o ícone
                            />
                        }
                        label="Pendência Unimed"
                    />
                    {/* --- FIM DA ADIÇÃO DA CHECKBOX --- */}

                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSave} variant="contained">Salvar</Button>
            </DialogActions>
        </Dialog>
    );
};