/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from 'react';

export interface INotification {
    id: number;
    text: string;
    read: boolean;
}

interface INotificationContext {
    notificacoes: INotification[];
    unreadCount: number;
    addNotification: (text: string) => void;
    markAllAsRead: () => void;
    clearAll: () => void;
    markAsRead: (id: number) => void;
}

const NotificationContext = createContext<INotificationContext | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    // Começa com os dados de exemplo que estavam antes no Layout
    const [notificacoes, setNotificacoes] = useState<INotification[]>([
        { id: 1, text: 'Agendamento de Ana Clara foi confirmado.', read: false },
        { id: 2, text: 'O paciente Lucas Ferreira foi cadastrado.', read: true },
    ]);

    const addNotification = (text: string) => {
        const nova: INotification = {
            id: Date.now(),
            text: text,
            read: false,
        };
        setNotificacoes(atuais => [nova, ...atuais]);
    };

    const markAsRead = (id: number) => {
        setNotificacoes(atuais => 
            atuais.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    const markAllAsRead = () => setNotificacoes(atuais => atuais.map(n => ({ ...n, read: true })));
    const clearAll = () => setNotificacoes([]);
    const unreadCount = notificacoes.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{ notificacoes, unreadCount, addNotification, markAllAsRead, clearAll, markAsRead }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications deve ser usado dentro de um NotificationProvider');
    }
    return context;
};