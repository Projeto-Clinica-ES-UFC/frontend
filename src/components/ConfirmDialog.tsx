import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onClose: () => void;
    confirmText?: string;
    cancelText?: string;
    isAlert?: boolean;
}

export const ConfirmDialog = ({
    open,
    title,
    message,
    onConfirm,
    onClose,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    isAlert = false
}: ConfirmDialogProps) => {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>{message}</DialogContentText>
            </DialogContent>
            <DialogActions>
                {!isAlert && <Button onClick={onClose} color="inherit">{cancelText}</Button>}
                <Button onClick={onConfirm} color="primary" autoFocus>
                    {isAlert ? 'OK' : confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
