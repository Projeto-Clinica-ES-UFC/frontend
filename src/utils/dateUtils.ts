/**
 * Formats a date string or Date object to Brazilian format (dd/MM/yyyy)
 * @param date - The date to format
 * @returns Formatted date string or empty string if invalid
 */
export const formatDateBR = (date?: string | Date | null): string => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    // Use UTC to avoid timezone shifts for date-only strings (e.g. YYYY-MM-DD from backend)
    // If the input is ISO with time, this might need adjustment, but for display consistency:
    if (typeof date === 'string' && date.length === 10) {
        // It's likely YYYY-MM-DD, treat as UTC
        return d.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    }

    return d.toLocaleDateString('pt-BR');
};

/**
 * Formats a date string or Date object to Brazilian format with time (dd/MM/yyyy HH:mm)
 * @param date - The date to format
 * @returns Formatted date time string or empty string if invalid
 */
export const formatDateTimeBR = (date?: string | Date | null): string => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    return d.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
};
