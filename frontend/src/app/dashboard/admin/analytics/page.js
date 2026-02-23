'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Card, CardContent } from '@mui/material';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import api from '@/app/lib/api';

export default function AnalyticsPage() {
  const [trends, setTrends] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [peakPeriods, setPeakPeriods] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [trendsRes, typesRes, peaksRes, summaryRes] = await Promise.all([
        api.get('/api/analytics?endpoint=leave-trends'),
        api.get('/api/analytics?endpoint=leave-types-stats'),
        api.get('/api/analytics?endpoint=peak-periods'),
        api.get('/api/analytics?endpoint=summary')
      ]);
      
      setTrends(trendsRes.data);
      setLeaveTypes(typesRes.data);
      setPeakPeriods(peaksRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  if (loading) return <Typography>Loading analytics...</Typography>;

  return (
    <Box>
      <Typography variant="h4" mb={4} sx={{ fontWeight: 700, background: 'linear-gradient(135deg, #00e5ff 0%, #ff4081 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Leave Analytics Dashboard
      </Typography>
      
      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Total Employees</Typography>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>{summary.total_employees || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Total Leaves</Typography>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>{summary.total_leaves || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Approved</Typography>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>{summary.approved_leaves || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Approval Rate</Typography>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>{summary.approval_rate || 0}%</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Monthly Trends */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <Typography variant="h6" mb={2} sx={{ fontWeight: 600 }}>Monthly Leave Trends</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends.map(t => ({ ...t, month: monthNames[t.month - 1] || t.month }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip contentStyle={{ backgroundColor: '#1a1d2e', border: '1px solid rgba(255,255,255,0.1)' }} />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#00e5ff" strokeWidth={2} name="Leave Count" />
                <Line type="monotone" dataKey="total_days" stroke="#ff4081" strokeWidth={2} name="Total Days" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Leave Types */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <Typography variant="h6" mb={2} sx={{ fontWeight: 600 }}>Most Used Leave Types</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie 
                  data={leaveTypes} 
                  dataKey="count" 
                  nameKey="leave_type" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={100} 
                  label={(entry) => `${entry.leave_type}: ${entry.count}`}
                  labelLine={false}
                >
                  {leaveTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1a1d2e', border: '1px solid rgba(255,255,255,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Peak Periods */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <Typography variant="h6" mb={2} sx={{ fontWeight: 600 }}>Top 10 Peak Leave Periods</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={peakPeriods}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip contentStyle={{ backgroundColor: '#1a1d2e', border: '1px solid rgba(255,255,255,0.1)' }} />
                <Legend />
                <Bar dataKey="count" fill="#00e5ff" name="Employees on Leave" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
