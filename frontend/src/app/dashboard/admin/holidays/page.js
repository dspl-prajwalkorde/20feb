'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '@/app/lib/api';

export default function HolidaysPage() {
  const [holidays, setHolidays] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newHoliday, setNewHoliday] = useState({ name: '', date: '', location: 'Pune' });

  const fetchHolidays = async () => {
    try {
      const res = await api.get('/api/admin/holidays');
      setHolidays(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handleAddHoliday = async () => {
    if (!newHoliday.name || !newHoliday.date) {
      alert('Name and date are required');
      return;
    }

    try {
      await api.post('/api/admin/holidays', newHoliday);
      alert('Holiday created successfully');
      setOpenDialog(false);
      setNewHoliday({ name: '', date: '', location: 'Pune' });
      fetchHolidays();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create holiday');
    }
  };

  const handleDeleteHoliday = async (id) => {
    if (!confirm('Are you sure you want to delete this holiday?')) return;

    try {
      await api.delete(`/api/admin/holidays/${id}`);
      alert('Holiday deleted successfully');
      fetchHolidays();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete holiday');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Manage Holidays</Typography>
        <Button variant="contained" onClick={() => setOpenDialog(true)}>
          Add Holiday
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Holiday Name</strong></TableCell>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell><strong>Location</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {holidays.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">No holidays found</TableCell>
              </TableRow>
            ) : (
              holidays.map((holiday) => (
                <TableRow key={holiday.id}>
                  <TableCell>{holiday.name}</TableCell>
                  <TableCell>{new Date(holiday.date).toLocaleDateString()}</TableCell>
                  <TableCell>{holiday.location}</TableCell>
                  <TableCell>
                    <IconButton color="error" onClick={() => handleDeleteHoliday(holiday.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New Holiday</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 400 }}>
            <TextField
              label="Holiday Name"
              fullWidth
              value={newHoliday.name}
              onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
              placeholder="e.g., Diwali, Christmas"
            />
            <TextField
              label="Date"
              type="date"
              fullWidth
              value={newHoliday.date}
              onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              select
              label="Location"
              fullWidth
              value={newHoliday.location}
              onChange={(e) => setNewHoliday({ ...newHoliday, location: e.target.value })}
            >
              <MenuItem value="Pune">Pune</MenuItem>
              <MenuItem value="Ahmedabad">Ahmedabad</MenuItem>
              <MenuItem value="All">All Locations</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddHoliday} variant="contained">
            Add Holiday
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
