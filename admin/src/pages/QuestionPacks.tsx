import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  TextField,
  Typography,
  Alert,
  FormControlLabel,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { getPacks, createPack, updatePack, deletePack } from '../services/firebase';

interface Pack {
  id: string;
  name: string;
  description: string;
  isPremium: boolean;
  price: number;
  questionsCount: number;
  imageURL: string;
  isActive: boolean;
}

const QuestionPacks = () => {
  const navigate = useNavigate();
  const [packs, setPacks] = useState<Pack[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageURL: '',
    price: 0,
    isPremium: false,
    isActive: true,
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [newPack, setNewPack] = useState({
    id: '',
    name: '',
    description: '',
    imageURL: '',
    isPremium: false,
    price: 0,
    isActive: true
  });
  const [editingPack, setEditingPack] = useState<Pack | null>(null);

  useEffect(() => {
    fetchPacks();
  }, []);

  const fetchPacks = async () => {
    const packsData = await getPacks();
    setPacks(packsData as Pack[]);
  };

  const handleOpenDialog = (pack?: Pack) => {
    if (pack) {
      setEditingPack(pack);
      setNewPack({
        id: pack.id || '',
        name: pack.name,
        description: pack.description,
        imageURL: pack.imageURL,
        isPremium: pack.isPremium,
        price: pack.price,
        isActive: pack.isActive
      });
    } else {
      setEditingPack(null);
      setNewPack({
        id: '',
        name: '',
        description: '',
        imageURL: '',
        isPremium: false,
        price: 0,
        isActive: true
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedPack(null);
    setFormData({
      name: '',
      description: '',
      imageURL: '',
      price: 0,
      isPremium: false,
      isActive: true,
    });
    setOpenDialog(false);
  };

  const handleSavePack = async () => {
    try {
      if (editingPack) {
        await updatePack(editingPack.id, {
          name: newPack.name,
          description: newPack.description,
          imageURL: newPack.imageURL,
          isPremium: newPack.isPremium,
          price: newPack.price,
          isActive: newPack.isActive
        });
        setPacks(packs.map(p => 
          p.id === editingPack.id ? { ...p, ...newPack } : p
        ));
      } else {
        const packId = await createPack({
          id: newPack.id,
          name: newPack.name,
          description: newPack.description,
          imageURL: newPack.imageURL,
          isPremium: newPack.isPremium,
          price: newPack.price,
          isActive: newPack.isActive
        });
        setPacks([...packs, { 
          ...newPack, 
          id: packId,
          questionsCount: 0
        }]);
      }
      setSnackbar({
        open: true,
        message: `Pack ${editingPack ? 'updated' : 'created'} successfully`,
        severity: 'success'
      });
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving pack:', err);
      setSnackbar({
        open: true,
        message: `Failed to ${editingPack ? 'update' : 'create'} pack`,
        severity: 'error'
      });
    }
  };

  const handleDelete = async (id: string) => {
    await deletePack(id);
    fetchPacks();
    setSnackbar({ open: true, message: 'Pack deleted successfully!', severity: 'success' });
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Question Packs</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Pack
        </Button>
      </Box>

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: 3
      }}>
        {packs.map((pack) => (
          <Card key={pack.id}>
            <CardContent>
              <Typography variant="h6" component="div">
                {pack.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {pack.description}
              </Typography>
              <Chip
                label={`${pack.questionsCount} questions`}
                size="small"
                sx={{ mt: 1 }}
              />
            </CardContent>
            <CardActions>
              <Button
                size="small"
                onClick={() => navigate(`/admin/questions?packId=${pack.id}`)}
              >
                Questions
              </Button>
              <IconButton
                size="small"
                onClick={() => handleOpenDialog(pack)}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => handleDelete(pack.id)}
              >
                <DeleteIcon />
              </IconButton>
            </CardActions>
          </Card>
        ))}
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {selectedPack ? 'Edit Pack' : 'Add Pack'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Pack ID"
              value={newPack.id}
              onChange={(e) => setNewPack({ ...newPack, id: e.target.value })}
              required
              disabled={!!editingPack}
              helperText="Only letters, numbers, hyphens, and underscores allowed"
            />
            <TextField
              fullWidth
              label="Name"
              value={newPack.name}
              onChange={(e) => setNewPack({ ...newPack, name: e.target.value })}
              required
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={newPack.description}
              onChange={(e) => setNewPack({ ...newPack, description: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Image URL"
              fullWidth
              value={newPack.imageURL}
              onChange={(e) => setNewPack({ ...newPack, imageURL: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Price"
              type="number"
              fullWidth
              value={newPack.price}
              onChange={(e) => setNewPack({ ...newPack, price: Number(e.target.value) })}
            />
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setNewPack({ ...newPack, isPremium: !newPack.isPremium })}
              >
                {newPack.isPremium ? 'Premium Pack' : 'Free Pack'}
              </Button>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setNewPack({ ...newPack, isActive: !newPack.isActive })}
              >
                {newPack.isActive ? 'Active' : 'Inactive'}
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSavePack} variant="contained">
            {selectedPack ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default QuestionPacks; 