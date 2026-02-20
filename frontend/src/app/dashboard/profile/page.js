'use client';

import { useState } from 'react';
import { Box, Typography, Paper, TextField, Button, Stack } from '@mui/material';
import { useAuth } from '@/app/context/AuthContext';
import api from '@/app/lib/api';

export default function ProfilePage() {
  const { user, logout, setUser } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [loading, setLoading] = useState(false);

  const handleUpdateName = async () => {
    if (!fullName.trim()) {
      alert('Name cannot be empty');
      return;
    }

    setLoading(true);
    try {
      await api.put('/api/user/profile', { full_name: fullName });
      const updatedUser = { ...user, full_name: fullName };
      setUser(updatedUser);
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      alert('Name updated successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update name');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" mb={3}>
        My Profile
      </Typography>

      <Paper sx={{ p: 4 }}>
        <Stack spacing={3}>
          <Box>
            <TextField
              label="Email"
              fullWidth
              value={user?.email || ''}
              disabled
              helperText="Email cannot be changed"
            />
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" mb={1}>
              Role
            </Typography>
            <Typography variant="body1">{user?.roles?.join(', ')}</Typography>
          </Box>

          <Box>
            <TextField
              label="Full Name"
              fullWidth
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </Box>

          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              onClick={handleUpdateName}
              disabled={loading || fullName === user?.full_name}
            >
              Update Name
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={logout}
            >
              Logout
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
