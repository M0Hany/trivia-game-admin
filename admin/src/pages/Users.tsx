import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  IconButton,
  Chip,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

// Mock data for demonstration
const mockUsers = [
  { id: '1', email: 'user1@example.com', displayName: 'User One', isGuest: false, isVIP: true, createdAt: '2023-01-15', lastLogin: '2023-06-10' },
  { id: '2', email: 'user2@example.com', displayName: 'User Two', isGuest: false, isVIP: false, createdAt: '2023-02-20', lastLogin: '2023-06-08' },
  { id: '3', email: 'guest1', displayName: 'Guest User', isGuest: true, isVIP: false, createdAt: '2023-03-05', lastLogin: '2023-06-09' },
  { id: '4', email: 'user3@example.com', displayName: 'User Three', isGuest: false, isVIP: true, createdAt: '2023-04-12', lastLogin: '2023-06-07' },
  { id: '5', email: 'guest2', displayName: 'Another Guest', isGuest: true, isVIP: false, createdAt: '2023-05-18', lastLogin: '2023-06-06' },
];

const Users: React.FC = () => {
  const [users, setUsers] = useState(mockUsers);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const filteredUsers = users.filter(user =>
    user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditUser = (userId: string) => {
    console.log('Edit user:', userId);
    // Implement edit functionality
  };

  const handleDeleteUser = (userId: string) => {
    console.log('Delete user:', userId);
    // Implement delete functionality
  };

  const handleToggleVIP = (userId: string) => {
    setUsers(users.map(user =>
      user.id === userId ? { ...user, isVIP: !user.isVIP } : user
    ));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>User Management</Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <TextField
          placeholder="Search users..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300 }}
        />
        <Button variant="contained" color="primary">
          Add New User
        </Button>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell>User ID</TableCell>
                <TableCell>Display Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Account Type</TableCell>
                <TableCell>VIP Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow hover key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.displayName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.isGuest ? "Guest" : "Registered"}
                        color={user.isGuest ? "default" : "primary"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.isVIP ? "VIP" : "Standard"}
                        color={user.isVIP ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{user.createdAt}</TableCell>
                    <TableCell>{user.lastLogin}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleEditUser(user.id)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleToggleVIP(user.id)}
                        color={user.isVIP ? "success" : "default"}
                      >
                        {user.isVIP ? <CheckCircleIcon /> : <BlockIcon />}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteUser(user.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default Users; 