import { createContext } from 'react';

// Exporta o contexto para que outros ficheiros o possam usar
export const ColorModeContext = createContext({ toggleColorMode: () => {} });