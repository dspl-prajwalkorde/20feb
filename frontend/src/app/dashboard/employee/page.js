'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Stack,
  Paper,
  Tabs,
  Tab,
  Pagination,
} from '@mui/material';
import api from '@/app/lib/api';

export default function EmployeeDashboard() {
  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [leaves, setLeaves] = useState([]);
  const [balance, setBalance] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(1);
  const [totalLeaves, setTotalLeaves] = useState(0);
  const perPage = 10;

  const fetchLeaves = async (pageNum = 1) => {
    try {
      setError('');
      const [leaveRes, balanceRes, typesRes] = await Promise.all([
        api.get(`/api/leaves/my?page=${pageNum}&per_page=${perPage}`),
        api.get("/api/leaves/mybalance"),
        api.get("/api/leaves/types")
      ]);
      
      const leavesData = leaveRes.data?.items || leaveRes.data;
      if (!Array.isArray(leavesData)) {
        throw new Error('Invalid leaves data received');
      }
      setLeaves(leavesData);
      setTotalLeaves(leaveRes.data?.total || 0);
      setPage(pageNum);

      if (!balanceRes.data || !Array.isArray(balanceRes.data)) {
        throw new Error('Invalid balance data received');
      }
      setBalance(balanceRes.data);

      if (!typesRes.data || !Array.isArray(typesRes.data)) {
        throw new Error('Invalid leave types data received');
      }
      setLeaveTypes(typesRes.data);

    } catch (err) {
      console.error("Failed to fetch data:", err.message);
      setError('Failed to load leave data. Please try again.');
      setLeaves([]);
      setBalance([]);
      setLeaveTypes([]);
    }
  };

  const handleSubmit = async () => {
    if (!leaveType || !startDate || !endDate || !reason.trim()) {
      setError('Please fill all required fields including reason');
      setSuccess('');
      return;
    }

    // Validate dates are not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start < today) {
      setError('Start date cannot be in the past');
      setSuccess('');
      return;
    }

    if (end < today) {
      setError('End date cannot be in the past');
      setSuccess('');
      return;
    }

    try {
      setError('');
      setSuccess('');
      setLoading(true);

      await api.post('/api/leaves/apply', {
        leave_type_id: leaveType,
        start_date: startDate,
        end_date: endDate,
        reason: reason,
      });

      setSuccess('Leave application submitted successfully!');
      await fetchLeaves();

      // reset form
      setLeaveType('');
      setStartDate('');
      setEndDate('');
      setReason('');
    } catch (err) {
      console.error('Failed to apply leave:', err.message);
      setError(err.response?.data?.message || 'Failed to apply leave. Please try again.');
      setSuccess('');
    } finally {
      setLoading(false);
    }

  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  return (
    <Box>
      <Typography variant="h5" mb={3} sx={{ fontWeight: 600 }}>
        Employee Dashboard
      </Typography>

      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab label="Apply Leave" />
        <Tab label="Leave History" />
        <Tab label="Leave Balance" />
      </Tabs>

      {tabValue === 0 && (
        <Box>
          <Typography variant="h6" mb={2}>
            Apply for Leave
          </Typography>

          {error && (
            <Paper sx={{ p: 2, mb: 3, background: 'rgba(255, 23, 68, 0.1)', border: '1px solid rgba(255, 23, 68, 0.3)', borderRadius: 2 }}>
              <Typography color="error">{error}</Typography>
            </Paper>
          )}

          {success && (
            <Paper sx={{ p: 2, mb: 3, background: 'rgba(0, 230, 118, 0.1)', border: '1px solid rgba(0, 230, 118, 0.3)', borderRadius: 2 }}>
              <Typography sx={{ color: '#00e676' }}>{success}</Typography>
            </Paper>
          )}

          <Paper sx={{ p: 3, maxWidth: 500 }}>
            <Stack spacing={2}>
              <TextField
                select
                label="Leave Type"
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                fullWidth
              >
                {leaveTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                type="date"
                label="Start Date"
                InputLabelProps={{ shrink: true }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                inputProps={{
                  min: new Date().toISOString().split('T')[0]
                }}
                fullWidth
              />

              <TextField
                type="date"
                label="End Date"
                InputLabelProps={{ shrink: true }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                inputProps={{
                  min: new Date().toISOString().split('T')[0]
                }}
                fullWidth
              />

              <TextField
                label="Reason"
                multiline
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                fullWidth
                helperText="Please provide a reason for your leave request"
              />

              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
              >
                Apply Leave
              </Button>
            </Stack>
          </Paper>
        </Box>
      )}

      {tabValue === 1 && (
        <Box>
          <Typography variant="h6" mb={2}>
            My Leave History
          </Typography>

          <Paper sx={{ p: 2 }}>
            {leaves.length === 0 ? (
              <Typography>No leave applications yet.</Typography>
            ) : (
              <>
                {leaves.map((leave) => (
                  <Paper
                    key={leave.leave_id}
                    sx={{ p: 2, mb: 2, background: 'rgba(0, 229, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.05)' }}
                  >
                    <Stack spacing={1}>
                      <Typography><strong>Leave Type:</strong> {leave.leave_type}</Typography>
                      <Typography><strong>Duration:</strong> {leave.start_date} to {leave.end_date} ({leave.total_days} days)</Typography>
                      <Typography><strong>Status:</strong> <span style={{ color: leave.status === 'APPROVED' ? '#00e676' : leave.status === 'REJECTED' ? '#ff1744' : '#ffa726' }}>{leave.status}</span></Typography>
                      <Typography><strong>Applied On:</strong> {leave.applied_at ? new Date(leave.applied_at).toLocaleDateString() : 'N/A'}</Typography>
                      {leave.reason && <Typography><strong>Reason:</strong> {leave.reason}</Typography>}
                      {leave.rejection_reason && <Typography color="error"><strong>Rejection Reason:</strong> {leave.rejection_reason}</Typography>}
                      {leave.processed_at && <Typography><strong>Processed On:</strong> {new Date(leave.processed_at).toLocaleDateString()}</Typography>}
                    </Stack>
                  </Paper>
                ))}
                {totalLeaves > perPage && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination 
                      count={Math.ceil(totalLeaves / perPage)} 
                      page={page} 
                      onChange={(e, pageNum) => fetchLeaves(pageNum)}
                      color="primary"
                    />
                  </Box>
                )}
              </>
            )}
          </Paper>
        </Box>
      )}

      {tabValue === 2 && (
        <Box>
          <Typography variant="h6" mb={2}>
            Leave Balance
          </Typography>

          <Paper sx={{ p: 3, maxWidth: 500 }}>
            {balance.length === 0 ? (
              <Typography>No balance data available</Typography>
            ) : (
              <Stack spacing={2}>
                {balance.map((item) => (
                  <Paper key={item.leave_type} sx={{ p: 2, background: 'rgba(0, 229, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <Typography variant="h6" mb={1}>{item.leave_type}</Typography>
                    <Typography>Total Quota: {item.total_quota} days</Typography>
                    <Typography>Used: {item.used_days} days</Typography>
                    <Typography>Remaining: <strong style={{ color: '#00e676' }}>{item.remaining_days} days</strong></Typography>
                  </Paper>
                ))}
              </Stack>
            )}
          </Paper>
        </Box>
      )}
    </Box>
  );
}