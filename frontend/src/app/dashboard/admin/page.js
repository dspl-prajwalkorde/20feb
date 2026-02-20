'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid, Paper, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import api from '@/app/lib/api';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ employees: 0, pendingLeaves: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [employeesRes, leavesRes] = await Promise.all([
          api.get('/api/leaves/employees'),
          api.get('/api/leaves/pending')
        ]);
        setStats({
          employees: employeesRes.data?.total || employeesRes.data?.items?.length || 0,
          pendingLeaves: leavesRes.data?.total || leavesRes.data?.items?.length || 0
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  return (
    <Box>
      <Typography variant="h4" mb={4} sx={{ fontWeight: 700, background: 'linear-gradient(135deg, #00e5ff 0%, #ff4081 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Admin Dashboard
      </Typography>
      
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <Card 
            sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)', cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.02)' } }}
            onClick={() => router.push('/dashboard/admin/employees')}
          >
            <CardContent>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>Total Employees</Typography>
              <Typography variant="h2" sx={{ fontWeight: 700, mt: 1 }}>{stats.employees}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', boxShadow: '0 8px 32px rgba(240, 147, 251, 0.3)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>Pending Leave Requests</Typography>
              <Typography variant="h2" sx={{ fontWeight: 700, mt: 1 }}>{stats.pendingLeaves}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.05) 0%, rgba(255, 64, 129, 0.05) 100%)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <Typography variant="h6" mb={2} sx={{ fontWeight: 600 }}>Quick Actions</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="contained" onClick={() => router.push('/dashboard/hr')} sx={{ background: 'linear-gradient(135deg, #00e5ff 0%, #0091ea 100%)' }}>
            Manage Leave Requests
          </Button>
          <Button variant="contained" onClick={() => router.push('/dashboard/employee')} sx={{ background: 'linear-gradient(135deg, #ff4081 0%, #f50057 100%)' }}>
            View Employee Portal
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
