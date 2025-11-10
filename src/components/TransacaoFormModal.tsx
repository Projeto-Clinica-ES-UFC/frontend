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
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import InputAdornment from '@mui/material/InputAdornment';

// A "forma" de uma transação
interface ITransacao {
    id: number;
    descricao: string;
    data: string;
    tipo: 'Entrada' | 'Saída';
    valor: number;
    categoria: string;
}

// Propriedades do Modal
interface TransacaoFormModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (transacao: Omit<ITransacao, 'id'> & { id?: number }) => void;
    transacaoParaEditar?: ITransacao | null;
}

// Listas de categorias (podem ser movidas para a Configuração no futuro)
const CATEGORIAS_ENTRADA = ['Receita de Sessão', 'Pagamento de Convênio', 'Outras Entradas'];
const CATEGORIAS_SAIDA = ['Despesa Fixa (Aluguel, Luz)', 'Material de Escritório', 'Salários', 'Impostos', 'Outras Saídas'];

export const TransacaoFormModal = ({ open, onClose, onSave, transacaoParaEditar }: TransacaoFormModalProps) => {
    // Estados para o formulário
    const [descricao, setDescricao] = useState('');
    const [data, setData] = useState(new Date().toLocaleDateString('sv-SE')); // AAAA-MM-DD
    const [tipo, setTipo] = useState<'Entrada' | 'Saída'>('Entrada');
    const [valor, setValor] = useState(0);
    const [categoria, setCategoria] = useState('');

    useEffect(() => {
        if (transacaoParaEditar) {
            setDescricao(transacaoParaEditar.descricao);
            setData(transacaoParaEditar.data);
            setTipo(transacaoParaEditar.tipo);
            setValor(transacaoParaEditar.valor);
            setCategoria(transacaoParaEditar.categoria);
        } else {
            // Reset para valores padrão ao adicionar
            setDescricao('');
            setData(new Date().toLocaleDateString('sv-SE'));
            setTipo('Entrada');
            setValor(0);
            setCategoria('');
        }
    }, [transacaoParaEditar, open]);

    useEffect(() => {
    setCategoria('');
}, [tipo]);

    const handleSave = () => {
        const transacaoData = {
            id: transacaoParaEditar?.id,
            descricao,
            data,
            tipo,
            valor: Number(valor) || 0,
            categoria,
        };
        onSave(transacaoData);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{transacaoParaEditar ? 'Editar Transação' : 'Adicionar Nova Transação'}</DialogTitle>
            <DialogContent>
                <Box component="form" noValidate autoComplete="off" sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        autoFocus
                        id="descricao"
                        label="Descrição"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        required
                    />
                    <TextField
                        id="data"
                        label="Data"
                        type="date"
                        fullWidth
                        variant="outlined"
                        value={data}
                        onChange={(e) => setData(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        required
                    />
                    <FormControl fullWidth required>
                        <InputLabel id="tipo-label">Tipo</InputLabel>
                        <Select
                            labelId="tipo-label"
                            id="tipo"
                            value={tipo}
                            label="Tipo"
                            onChange={(e) => setTipo(e.target.value as 'Entrada' | 'Saída')}
                        >
                            <MenuItem value="Entrada">Entrada</MenuItem>
                            <MenuItem value="Saída">Saída</MenuItem>
                        </Select>
                    </FormControl>
                    {/* --- INÍCIO DA ADIÇÃO DO CAMPO CATEGORIA --- */}
                    <FormControl fullWidth required disabled={!tipo}>
                        <InputLabel id="categoria-label">Categoria</InputLabel>
                        <Select
                            labelId="categoria-label"
                            id="categoria"
                            value={categoria}
                            label="Categoria"
                            onChange={(e) => setCategoria(e.target.value)}
                        >
                            {/* Mostra opções diferentes com base no Tipo selecionado */}
                            {tipo === 'Entrada' ? (
                                CATEGORIAS_ENTRADA.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)
                            ) : (
                                CATEGORIAS_SAIDA.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)
                            )}
                        </Select>
                    </FormControl>
                    {/* --- FIM DA ADIÇÃO --- */}
                    <TextField
                        id="valor"
                        label="Valor"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={valor}
                        onChange={(e) => setValor(Number(e.target.value))}
                        InputProps={{
                            startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                        }}
                        required
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