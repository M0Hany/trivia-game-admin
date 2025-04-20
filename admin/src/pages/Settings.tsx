import React from 'react';
import { Box, Typography, Paper, Switch, FormControlLabel, TextField, Button } from '@mui/material';

const Settings: React.FC = () => {
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Settings</Typography>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>Game Settings</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Enable sound effects"
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Show timer"
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Allow spectators"
              />
            </Box>
          </Box>
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>Time Limits</Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                label="Answer time (seconds)"
                type="number"
                defaultValue={30}
              />
              <TextField
                label="Voting time (seconds)"
                type="number"
                defaultValue={20}
              />
            </Box>
          </Box>
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>Scoring</Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                label="Points per correct answer"
                type="number"
                defaultValue={10}
              />
              <TextField
                label="Bonus points for speed"
                type="number"
                defaultValue={5}
              />
            </Box>
          </Box>
          <Box>
            <Button variant="contained" color="primary">
              Save Settings
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Settings; 