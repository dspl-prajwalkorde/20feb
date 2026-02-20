'use client';

import { useState } from 'react';
import { TextField, Button, Stack, Typography, Paper, Container, Box } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const user = await login(email, password);

      if (!user || !user.roles || !Array.isArray(user.roles)) {
        throw new Error('Invalid user data received');
      }

      const roles = user.roles;

      if (roles.includes('ADMIN')) {
        router.push('/dashboard/admin');
      } else if (roles.includes('HR')) {
        router.push('/dashboard/hr');
      } else if (roles.includes('EMPLOYEE')) {
        router.push('/dashboard/employee');
      } else {
        router.push('/unauthorized');
      }

    } catch (err) {
      console.error('Login error:', err.message);
      setError(err.message || 'Login failed. Please try again.');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', background: 'linear-gradient(135deg, #1a1d2e 0%, #2d3142 100%)' }}>
      <Container maxWidth="sm">
        <Paper elevation={24} sx={{ p: 5, borderRadius: 4, background: 'rgba(37, 40, 54, 0.95)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Stack spacing={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 800, background: 'linear-gradient(135deg, #00e5ff 0%, #ff4081 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 1 }}>
                Nexus Pulse
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                Sign in to your account
              </Typography>
            </Box>

            {error && (
              <Paper sx={{ p: 2, background: 'rgba(255, 23, 68, 0.1)', border: '1px solid rgba(255, 23, 68, 0.3)', borderRadius: 2 }}>
                <Typography color="error" variant="body2">
                  {error}
                </Typography>
              </Paper>
            )}

            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  fullWidth
                  variant="outlined"
                />

                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  fullWidth
                  variant="outlined"
                />

                <Button
                  variant="contained"
                  type="submit"
                  disabled={loading}
                  fullWidth
                  sx={{ 
                    mt: 2, 
                    py: 1.5, 
                    background: 'linear-gradient(135deg, #00e5ff 0%, #0091ea 100%)',
                    fontSize: '1rem',
                    fontWeight: 600,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #00b8d4 0%, #0277bd 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 24px rgba(0, 229, 255, 0.3)'
                    },
                    transition: 'all 0.3s'
                  }}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </Stack>
            </form>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
