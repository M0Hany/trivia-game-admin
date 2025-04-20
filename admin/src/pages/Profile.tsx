import React from 'react';
import { Box, Typography, Paper, Avatar, TextField, Button } from '@mui/material';

const Profile: React.FC = () => {
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Profile</Typography>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <Avatar
            sx={{ width: 100, height: 100 }}
            alt="Profile Picture"
          />
          <Box sx={{ width: '100%' }}>
            <TextField
              fullWidth
              label="Display Name"
              defaultValue="Player Name"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              defaultValue="player@example.com"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Bio"
              multiline
              rows={4}
              defaultValue="Tell us about yourself..."
              sx={{ mb: 2 }}
            />
            <Button variant="contained" color="primary">
              Save Profile
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Profile; 