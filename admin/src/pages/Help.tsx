import React from 'react';
import { Box, Typography, Paper, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const Help: React.FC = () => {
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Help & Support</Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Frequently Asked Questions</Typography>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>How do I create a new game?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              To create a new game, click on the "New Game" button in the dashboard.
              You'll be prompted to select a game type and configure the settings.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>How do I manage players?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              You can manage players through the Players section. Here you can add,
              remove, or modify player information and permissions.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>How do I customize game settings?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Game settings can be customized in the Settings page. You can adjust
              various parameters like time limits, scoring rules, and game modes.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Paper>
    </Box>
  );
};

export default Help; 