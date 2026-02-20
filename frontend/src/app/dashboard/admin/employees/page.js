'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, Select, MenuItem, FormControl, InputLabel, Alert, Switch } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import api from '@/app/lib/api';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [actionType, setActionType] = useState('add');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/api/admin/users');
      console.log('Fetched employees:', res.data.items);
      setEmployees(res.data.items || []);
    } catch (err) {
      setError('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleOpenDialog = (user, type, role = '') => {
    setSelectedUser(user);
    setActionType(type);
    setSelectedRole(role);
    setOpenDialog(true);
    setError('');
    setSuccess('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setSelectedRole('');
  };

  const handleAddRole = async () => {
    try {
      await api.post(`/api/admin/users/${selectedUser.id}/roles`, {
        role_name: selectedRole
      });
      setSuccess(`${selectedRole} role added successfully`);
      fetchEmployees();
      handleCloseDialog();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add role');
    }
  };

  const handleRemoveRole = async () => {
    try {
      await api.delete(`/api/admin/users/${selectedUser.id}/roles?role_name=${selectedRole}`);
      setSuccess(`${selectedRole} role removed successfully`);
      fetchEmployees();
      handleCloseDialog();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove role');
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    if (!userId) {
      setError('Invalid user ID');
      return;
    }
    console.log('Changing status for user:', userId, 'to:', newStatus);
    try {
      await api.patch(`/api/admin/users/${userId}/status`, {
        is_active: newStatus
      });
      setSuccess(`User status updated to ${newStatus ? 'Active' : 'Inactive'}`);
      fetchEmployees();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const getRoleColor = (role) => {
    const colors = { ADMIN: 'error', HR: 'warning', EMPLOYEE: 'primary' };
    return colors[role] || 'default';
  };

  const availableRoles = ['ADMIN', 'HR', 'EMPLOYEE'];

  return (
    <Box>
      <Typography variant="h4" mb={4} sx={{ fontWeight: 700, background: 'linear-gradient(135deg, #00e5ff 0%, #ff4081 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Manage Employees
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <TableContainer component={Paper} sx={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Roles</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map((emp) => (
              <TableRow key={emp.id}>
                <TableCell>{emp.full_name}</TableCell>
                <TableCell>{emp.email}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {emp.roles.map((role) => (
                      <Chip 
                        key={role} 
                        label={role} 
                        color={getRoleColor(role)} 
                        size="small"
                        onDelete={() => handleOpenDialog(emp, 'remove', role)}
                        deleteIcon={<DeleteIcon />}
                      />
                    ))}
                    <IconButton size="small" color="primary" onClick={() => handleOpenDialog(emp, 'add')}>
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ opacity: 0.7 }}>Inactive</Typography>
                    <Switch 
                      checked={emp.is_active} 
                      onChange={(e) => handleStatusChange(emp.id, e.target.checked)}
                      color="success"
                    />
                    <Typography variant="body2" sx={{ opacity: 0.7 }}>Active</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {actionType === 'add' ? 'Add Role' : 'Remove Role'}
        </DialogTitle>
        <DialogContent sx={{ minWidth: 300, pt: 2 }}>
          {actionType === 'add' ? (
            <FormControl fullWidth>
              <InputLabel>Select Role</InputLabel>
              <Select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} label="Select Role">
                {availableRoles.filter(role => !selectedUser?.roles.includes(role)).map(role => (
                  <MenuItem key={role} value={role}>{role}</MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Typography>
              Are you sure you want to remove the <strong>{selectedRole}</strong> role from <strong>{selectedUser?.full_name}</strong>?
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={actionType === 'add' ? handleAddRole : handleRemoveRole} 
            variant="contained" 
            disabled={actionType === 'add' && !selectedRole}
          >
            {actionType === 'add' ? 'Add' : 'Remove'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
