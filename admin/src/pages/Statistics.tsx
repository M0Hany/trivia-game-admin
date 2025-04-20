import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Statistics: React.FC = () => {
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Statistics</Typography>
      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' } }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Game Statistics</Typography>
          <Typography variant="body1">Total Games Played: 0</Typography>
          <Typography variant="body1">Games Won: 0</Typography>
          <Typography variant="body1">Average Score: 0</Typography>
          <Typography variant="body1">Highest Score: 0</Typography>
        </Paper>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Performance</Typography>
          <Typography variant="body1">Correct Answers: 0</Typography>
          <Typography variant="body1">Total Answers: 0</Typography>
          <Typography variant="body1">Accuracy: 0%</Typography>
          <Typography variant="body1">Average Response Time: 0s</Typography>
        </Paper>
        <Paper sx={{ p: 3, gridColumn: '1 / -1' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Recent Activity</Typography>
          <Typography variant="body1" color="text.secondary">
            No recent games played
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default Statistics; 