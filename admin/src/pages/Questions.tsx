import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
  Chip,
  Breadcrumbs,
  Link,
  Tooltip,
  Divider,
  LinearProgress,
  Checkbox
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  Flag as FlagIcon,
  FileUpload as FileUploadIcon,
  FileDownload as FileDownloadIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { 
  getQuestions, 
  getQuestionById, 
  createQuestion, 
  updateQuestion, 
  deleteQuestion, 
  getPacks,
  getCategories
} from '../services/firebase';
import { useLocation, useNavigate } from 'react-router-dom';

interface Question {
  id: string;
  text: string;
  correctAnswer: string;
  packId: string;
  isFlagged: boolean;
  timesUsed: number;
  successRate: number;
  createdAt: Date;
  defaultAnswers?: string[];
  imageURL?: string;
}

interface CreateQuestionData extends Omit<Question, 'id' | 'timesUsed' | 'successRate' | 'createdAt'> {
  imageURL?: string;
}

interface UpdateQuestionData extends Partial<CreateQuestionData> {}

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

const Questions: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const packId = queryParams.get('packId');
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    correctAnswer: '',
    packId: packId || '',
    isFlagged: false,
    defaultAnswers: [] as string[],
    imageURL: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);
  const [selectedPackForBulk, setSelectedPackForBulk] = useState('');

  // Define loadData function at component level
  const loadData = async () => {
    try {
      setLoading(true);
      const [questionsData, packsData] = await Promise.all([
        getQuestions(),
        getPacks()
      ]);
      
      // Filter questions by packId if provided
      const filteredQuestions = packId 
        ? (questionsData as Question[]).filter((q: Question) => q.packId === packId)
        : questionsData as Question[];
      
      setQuestions(filteredQuestions);
      setPacks(packsData as Pack[]);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load questions and packs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenDialog = (question?: Question) => {
    if (question) {
      setEditingQuestion(question);
      setNewQuestion({
        text: question.text,
        correctAnswer: question.correctAnswer,
        packId: question.packId,
        isFlagged: question.isFlagged,
        defaultAnswers: question.defaultAnswers || [],
        imageURL: question.imageURL || ''
      });
    } else {
      setEditingQuestion(null);
      setNewQuestion({
        text: '',
        correctAnswer: '',
        packId: packId || '',
        isFlagged: false,
        defaultAnswers: [],
        imageURL: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingQuestion(null);
  };

  const handleSaveQuestion = async () => {
    try {
      if (editingQuestion) {
        // Update existing question
        const updateData: UpdateQuestionData = {
          text: newQuestion.text,
          correctAnswer: newQuestion.correctAnswer,
          packId: newQuestion.packId,
          isFlagged: newQuestion.isFlagged,
          defaultAnswers: newQuestion.defaultAnswers,
          imageURL: newQuestion.imageURL
        };
        
        await updateQuestion(editingQuestion.id, updateData);

        setQuestions(questions.map(q =>
          q.id === editingQuestion.id
            ? { ...q, ...updateData }
            : q
        ));

        setSnackbar({
          open: true,
          message: 'Question updated successfully',
          severity: 'success'
        });
      } else {
        // Add new question
        const createData: CreateQuestionData = {
          text: newQuestion.text,
          correctAnswer: newQuestion.correctAnswer,
          packId: newQuestion.packId,
          isFlagged: newQuestion.isFlagged,
          defaultAnswers: newQuestion.defaultAnswers,
          imageURL: newQuestion.imageURL
        };

        const newId = await createQuestion(createData);

        // Create a complete question object for local state
        const newQuestionObj: Question = {
          id: newId,
          text: newQuestion.text,
          correctAnswer: newQuestion.correctAnswer,
          packId: newQuestion.packId,
          isFlagged: newQuestion.isFlagged,
          timesUsed: 0,
          successRate: 0,
          createdAt: new Date(),
          defaultAnswers: newQuestion.defaultAnswers,
          imageURL: newQuestion.imageURL
        };

        setQuestions([...questions, newQuestionObj]);

        setSnackbar({
          open: true,
          message: 'Question created successfully',
          severity: 'success'
        });
      }
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving question:', err);
      setSnackbar({
        open: true,
        message: 'Failed to save question',
        severity: 'error'
      });
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      await deleteQuestion(questionId);
      setQuestions(questions.filter(q => q.id !== questionId));
      setSnackbar({
        open: true,
        message: 'Question deleted successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error deleting question:', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete question',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleBackToPacks = () => {
    navigate('/packs');
  };

  const handleAddDefaultAnswer = () => {
    setNewQuestion(prev => ({
      ...prev,
      defaultAnswers: [...(prev.defaultAnswers || []), '']
    }));
  };

  const handleRemoveDefaultAnswer = (index: number) => {
    setNewQuestion(prev => ({
      ...prev,
      defaultAnswers: prev.defaultAnswers?.filter((_, i) => i !== index) || []
    }));
  };

  const handleDefaultAnswerChange = (index: number, value: string) => {
    setNewQuestion(prev => ({
      ...prev,
      defaultAnswers: prev.defaultAnswers?.map((answer, i) => 
        i === index ? value : answer
      ) || []
    }));
  };

  const filteredQuestions = questions.filter(question =>
    question.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.correctAnswer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPackName = (packId: string) => {
    const pack = packs.find(p => p.id === packId);
    return pack ? pack.name : 'Unknown Pack';
  };

  // Export questions to CSV
  const handleExportQuestions = () => {
    // Create CSV content with UTF-8 BOM
    const BOM = '\uFEFF';
    const headers = ['text', 'correctAnswer', 'packId', 'defaultAnswers'];
    const csvContent = BOM + [
      headers.join(','),
      ...questions.map(q => {
        const defaultAnswers = q.defaultAnswers ? `"${q.defaultAnswers.join('|')}"` : '';
        return [
          `"${q.text.replace(/"/g, '""')}"`,
          `"${q.correctAnswer.replace(/"/g, '""')}"`,
          q.packId,
          defaultAnswers
        ].join(',');
      })
    ].join('\n');

    // Create and download file with UTF-8 encoding
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `questions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up the URL object
  };

  // Handle file selection for import
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setImportFile(file);
    } else {
      setSnackbar({
        open: true,
        message: 'Please select a valid CSV file',
        severity: 'error'
      });
    }
  };

  // Open import dialog
  const handleOpenImportDialog = () => {
    setImportDialogOpen(true);
  };

  // Close import dialog
  const handleCloseImportDialog = () => {
    setImportDialogOpen(false);
    setImportFile(null);
    setImportProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Process CSV import
  const handleImportQuestions = async () => {
    if (!importFile) return;

    setImporting(true);
    setImportProgress(0);

    try {
      const text = await importFile.text();
      const rows = text.split('\n').map(row => row.trim()).filter(row => row);
      
      // Skip header row
      const dataRows = rows.slice(1);
      const totalRows = dataRows.length;
      let processedRows = 0;
      let successCount = 0;
      let errorCount = 0;

      for (const row of dataRows) {
        try {
          // Parse CSV row (handling quoted values)
          const values: string[] = [];
          let currentValue = '';
          let insideQuotes = false;
          
          for (let i = 0; i < row.length; i++) {
            const char = row[i];
            
            if (char === '"') {
              if (insideQuotes && i + 1 < row.length && row[i + 1] === '"') {
                // Double quotes inside quoted string
                currentValue += '"';
                i++; // Skip the next quote
              } else {
                // Toggle quote state
                insideQuotes = !insideQuotes;
              }
            } else if (char === ',' && !insideQuotes) {
              // End of field
              values.push(currentValue);
              currentValue = '';
            } else {
              currentValue += char;
            }
          }
          
          // Add the last value
          values.push(currentValue);
          
          // Extract values
          const [text, correctAnswer, packId, defaultAnswersStr, imageURL] = values;
          
          // Parse default answers (pipe-separated)
          const defaultAnswers = defaultAnswersStr 
            ? defaultAnswersStr.replace(/^"|"$/g, '').split('|').filter(Boolean)
            : [];
          
          // Create question with proper type
          const createData: CreateQuestionData = {
            text,
            correctAnswer,
            packId,
            isFlagged: false,
            defaultAnswers,
            imageURL: imageURL || ''
          };
          
          await createQuestion(createData);
          successCount++;
        } catch (err) {
          console.error('Error importing row:', err);
          errorCount++;
        }
        
        processedRows++;
        setImportProgress(Math.round((processedRows / totalRows) * 100));
      }
      
      // Refresh questions list
      await loadData();
      
      setSnackbar({
        open: true,
        message: `Import complete: ${successCount} questions imported, ${errorCount} failed`,
        severity: successCount > 0 ? 'success' : 'error'
      });
      
      handleCloseImportDialog();
    } catch (err) {
      console.error('Error importing questions:', err);
      setSnackbar({
        open: true,
        message: 'Failed to import questions',
        severity: 'error'
      });
    } finally {
      setImporting(false);
    }
  };

  // Add bulk selection handlers
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedQuestions(filteredQuestions.map(q => q.id));
    } else {
      setSelectedQuestions([]);
    }
  };

  const handleSelectQuestion = (questionId: string) => {
    setSelectedQuestions(prev => {
      if (prev.includes(questionId)) {
        return prev.filter(id => id !== questionId);
      } else {
        return [...prev, questionId];
      }
    });
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedQuestions.map(id => deleteQuestion(id)));
      setSnackbar({
        open: true,
        message: `Successfully deleted ${selectedQuestions.length} questions`,
        severity: 'success'
      });
      setSelectedQuestions([]);
      loadData();
    } catch (err) {
      console.error('Error deleting questions:', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete questions',
        severity: 'error'
      });
    }
  };

  const handleBulkChangePackOpen = () => {
    setSelectedPackForBulk('');
    setBulkActionDialogOpen(true);
  };

  const handleBulkChangePack = async () => {
    if (!selectedPackForBulk) return;

    try {
      await Promise.all(selectedQuestions.map(id => 
        updateQuestion(id, { packId: selectedPackForBulk })
      ));
      setSnackbar({
        open: true,
        message: `Successfully updated ${selectedQuestions.length} questions`,
        severity: 'success'
      });
      setBulkActionDialogOpen(false);
      setSelectedQuestions([]);
      loadData();
    } catch (err) {
      console.error('Error updating questions:', err);
      setSnackbar({
        open: true,
        message: 'Failed to update questions',
        severity: 'error'
      });
    }
  };

  // Add image URL validation
  const validateImageURL = (url: string) => {
    if (!url) return true; // Empty URL is valid
    try {
      new URL(url);
      return url.match(/\.(jpg|jpeg|png|webp|avif|gif)$/) !== null;
    } catch {
      return false;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
            <Link 
              component="button" 
              variant="body1" 
              onClick={handleBackToPacks}
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <ArrowBackIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Question Packs
            </Link>
            <Typography color="text.primary">
              {packId ? getPackName(packId) : 'All Questions'}
            </Typography>
          </Breadcrumbs>
          <Typography variant="h4">
            {packId ? `Questions in ${getPackName(packId)}` : 'All Questions'}
          </Typography>
        </Box>
        <Box>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportQuestions}
            sx={{ mr: 1 }}
          >
            Export CSV
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileUploadIcon />}
            onClick={handleOpenImportDialog}
            sx={{ mr: 1 }}
          >
            Import CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Question
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          sx={{ flexGrow: 1 }}
          placeholder="Search questions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            ),
          }}
        />
        {selectedQuestions.length > 0 && (
          <>
            <Button
              variant="outlined"
              color="error"
              onClick={handleBulkDelete}
            >
              Delete Selected ({selectedQuestions.length})
            </Button>
            <Button
              variant="outlined"
              onClick={handleBulkChangePackOpen}
            >
              Change Pack ({selectedQuestions.length})
            </Button>
          </>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedQuestions.length > 0 && selectedQuestions.length < filteredQuestions.length}
                  checked={selectedQuestions.length === filteredQuestions.length && filteredQuestions.length > 0}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>Question</TableCell>
              <TableCell>Correct Answer</TableCell>
              <TableCell>Pack</TableCell>
              <TableCell>Times Used</TableCell>
              <TableCell>Success Rate</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((question) => (
                <TableRow key={question.id}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedQuestions.includes(question.id)}
                      onChange={() => handleSelectQuestion(question.id)}
                    />
                  </TableCell>
                  <TableCell>{question.text}</TableCell>
                  <TableCell>{question.correctAnswer}</TableCell>
                  <TableCell>{getPackName(question.packId)}</TableCell>
                  <TableCell>{question.timesUsed}</TableCell>
                  <TableCell>{question.successRate ? `${(question.successRate * 100).toFixed(1)}%` : 'N/A'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={question.isFlagged ? "Flagged" : "Active"} 
                      color={question.isFlagged ? "error" : "success"} 
                      size="small"
                      icon={question.isFlagged ? <FlagIcon /> : undefined}
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Edit">
                      <IconButton 
                        size="small" 
                        onClick={() => handleOpenDialog(question)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteQuestion(question.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No questions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Question Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingQuestion ? 'Edit Question' : 'Add New Question'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Question Text"
              value={newQuestion.text}
              onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
              multiline
              rows={3}
              required
            />
            
            {/* Add Image URL field */}
            <TextField
              fullWidth
              label="Image URL (optional)"
              value={newQuestion.imageURL}
              onChange={(e) => setNewQuestion({ ...newQuestion, imageURL: e.target.value })}
              helperText={
                newQuestion.imageURL && !validateImageURL(newQuestion.imageURL)
                  ? "Please enter a valid image URL (.jpg, .png, .webp, .gif)"
                  : "Add an image URL to enhance your question"
              }
              error={newQuestion.imageURL !== '' && !validateImageURL(newQuestion.imageURL)}
            />
            
            {/* Image Preview */}
            {newQuestion.imageURL && validateImageURL(newQuestion.imageURL) && (
              <Box sx={{ 
                width: '100%', 
                maxHeight: '200px', 
                overflow: 'hidden',
                borderRadius: 1,
                border: '1px solid #ddd'
              }}>
                <img 
                  src={newQuestion.imageURL} 
                  alt="Question preview" 
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'contain'
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    setNewQuestion({ ...newQuestion, imageURL: '' });
                    setSnackbar({
                      open: true,
                      message: 'Failed to load image. Please check the URL.',
                      severity: 'error'
                    });
                  }}
                />
              </Box>
            )}

            <TextField
              fullWidth
              label="Correct Answer"
              value={newQuestion.correctAnswer}
              onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
              required
            />
            <FormControl fullWidth>
              <InputLabel>Pack</InputLabel>
              <Select
                value={newQuestion.packId}
                label="Pack"
                onChange={(e) => setNewQuestion({ ...newQuestion, packId: e.target.value })}
              >
                {packs.map(pack => (
                  <MenuItem key={pack.id} value={pack.id}>
                    {pack.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Default Answers
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Add default answers that will be used when there aren't enough player answers
              </Typography>
              {newQuestion.defaultAnswers?.map((answer, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    label={`Default Answer ${index + 1}`}
                    value={answer}
                    onChange={(e) => handleDefaultAnswerChange(index, e.target.value)}
                  />
                  <IconButton 
                    onClick={() => handleRemoveDefaultAnswer(index)}
                    color="error"
                    sx={{ mt: 1 }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddDefaultAnswer}
                sx={{ mt: 1 }}
              >
                Add Default Answer
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveQuestion} variant="contained" color="primary">
            {editingQuestion ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onClose={handleCloseImportDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Import Questions from CSV</DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
            Upload a CSV file with the following format:
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, mb: 2, fontFamily: 'monospace' }}>
            text,correctAnswer,packId,defaultAnswers
            "What is the capital of France?","Paris","geography","London|Berlin|Madrid"
            "What is 2+2?","4","math","3|5|6"
          </Paper>
          <Typography variant="body2" paragraph>
            Notes:
          </Typography>
          <ul>
            <li>Text and correctAnswer fields should be enclosed in quotes</li>
            <li>DefaultAnswers should be pipe-separated (|) and enclosed in quotes</li>
            <li>packId must match an existing pack ID</li>
          </ul>
          <Box sx={{ mt: 2 }}>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              ref={fileInputRef}
              style={{ display: 'none' }}
              id="csv-file-input"
            />
            <label htmlFor="csv-file-input">
              <Button
                variant="outlined"
                component="span"
                startIcon={<FileUploadIcon />}
                fullWidth
              >
                Select CSV File
              </Button>
            </label>
            {importFile && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Selected file: {importFile.name}
              </Typography>
            )}
            {importing && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Importing: {importProgress}%
                </Typography>
                <LinearProgress variant="determinate" value={importProgress} />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImportDialog}>Cancel</Button>
          <Button 
            onClick={handleImportQuestions} 
            variant="contained" 
            disabled={!importFile || importing}
          >
            Import
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Change Pack Dialog */}
      <Dialog open={bulkActionDialogOpen} onClose={() => setBulkActionDialogOpen(false)}>
        <DialogTitle>Change Pack for Selected Questions</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Select Pack</InputLabel>
              <Select
                value={selectedPackForBulk}
                label="Select Pack"
                onChange={(e) => setSelectedPackForBulk(e.target.value)}
              >
                {packs.map(pack => (
                  <MenuItem key={pack.id} value={pack.id}>
                    {pack.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkActionDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleBulkChangePack}
            variant="contained" 
            disabled={!selectedPackForBulk}
          >
            Update Questions
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Questions; 