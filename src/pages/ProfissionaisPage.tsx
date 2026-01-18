import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ProfissionaisPanel } from '../components/ProfissionaisPanel';

export const ProfissionaisPage = () => {
    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
                Profissionais
            </Typography>
            <ProfissionaisPanel />
        </Box>
    );
};
