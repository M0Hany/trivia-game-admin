import React from 'react';
import { Box, Typography, Paper, Button, Divider } from '@mui/material';
import { People, QuestionAnswer, EmojiEvents, Settings, Help } from '@mui/icons-material';

const AdminDashboard: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Admin Dashboard</Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <Paper sx={{ p: 2, minWidth: 200, flex: '1 1 200px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <People sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Users</Typography>
          </Box>
          <Typography variant="h4">0</Typography>
        </Paper>

        <Paper sx={{ p: 2, minWidth: 200, flex: '1 1 200px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <QuestionAnswer sx={{ mr: 1, color: 'secondary.main' }} />
            <Typography variant="h6">Questions</Typography>
          </Box>
          <Typography variant="h4">0</Typography>
        </Paper>

        <Paper sx={{ p: 2, minWidth: 200, flex: '1 1 200px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <EmojiEvents sx={{ mr: 1, color: 'success.main' }} />
            <Typography variant="h6">Games</Typography>
          </Box>
          <Typography variant="h4">0</Typography>
        </Paper>

        <Paper sx={{ p: 2, minWidth: 200, flex: '1 1 200px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Settings sx={{ mr: 1, color: 'warning.main' }} />
            <Typography variant="h6">Settings</Typography>
          </Box>
          <Typography variant="h4">-</Typography>
        </Paper>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <Paper sx={{ p: 3, flex: '1 1 400px' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Recent Activity</Typography>
          <Typography variant="body1" color="text.secondary">
            No recent activity to display
          </Typography>
        </Paper>

        <Paper sx={{ p: 3, flex: '1 1 400px' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>System Status</Typography>
          <Typography variant="body1" color="success.main">
            All systems operational
          </Typography>
        </Paper>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Quick Actions</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Button variant="contained" startIcon={<People />}>Manage Users</Button>
          <Button variant="contained" startIcon={<QuestionAnswer />}>Manage Questions</Button>
          <Button variant="contained" startIcon={<EmojiEvents />}>View Games</Button>
          <Button variant="contained" startIcon={<Settings />}>Settings</Button>
          <Button variant="contained" startIcon={<Help />}>Help</Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminDashboard; 