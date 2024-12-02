// src/components/LoadingState.tsx
import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material'; 

const LoadingState: React.FC = () => (
  <Box 
    sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      p: 3 
    }}
  >
    <CircularProgress />
    <Typography sx={{ mt: 2 }}>Loading...</Typography>
  </Box>
);

export default LoadingState;
