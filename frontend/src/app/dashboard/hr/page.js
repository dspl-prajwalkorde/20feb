'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button, Stack, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab, Pagination, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import api from '@/app/lib/api';
import { useAuth } from '@/app/context/AuthContext';

export default function HRDashboard() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [allLeaves, setAllLeaves] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedLeaveType, setSelectedLeaveType] = useState(null);
  const [adjustment, setAdjustment] = useState('');
  const [newEmployee, setNewEmployee] = useState({ email: '', full_name: '', password: '' });
  
  // Pagination states
  const [pendingPage, setPendingPage] = useState(1);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [allLeavesPage, setAllLeavesPage] = useState(1);
  const [allLeavesTotal, setAllLeavesTotal] = useState(0);
  const [employeesPage, setEmployeesPage] = useState(1);
  const [employeesTotal, setEmployeesTotal] = useState(0);
  const perPage = 10;
  
  // All leaves filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPendingLeaves = async (page = 1) => {
    try {
      const res = await api.get(`/api/leaves/pending?page=${page}&per_page=${perPage}`);
      setLeaves(res.data?.items || []);
      setPendingTotal(res.data?.total || 0);
      setPendingPage(page);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEmployees = async (page = 1) => {
    try {
      const res = await api.get(`/api/leaves/employees?page=${page}&per_page=${perPage}`);
      setEmployees(res.data?.items || []);
      setEmployeesTotal(res.data?.total || 0);
      setEmployeesPage(page);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllLeaves = async (page = 1) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        status: statusFilter,
        sort: sortBy
      });
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      const res = await api.get(`/api/leaves/all?${params.toString()}`);
      setAllLeaves(res.data?.items || []);
      setAllLeavesTotal(res.data?.total || 0);
      setAllLeavesPage(page);
    } catch (err) {
      console.error(err);
    }
  };

  const approveLeave = async (id) => {
    try {
      await api.post(`/api/leaves/${id}/approve`);
      alert('Leave approved successfully!');
      fetchPendingLeaves(pendingPage);
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.message || 'Failed to approve leave');
    }
  };

  const rejectLeave = async (id) => {
    setSelectedLeaveId(id);
    setRejectionReason('');
    setOpenRejectDialog(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    
    try {
      await api.post(`/api/leaves/${selectedLeaveId}/reject`, {
        rejection_reason: rejectionReason
      });
      alert('Leave rejected successfully!');
      setOpenRejectDialog(false);
      setRejectionReason('');
      fetchPendingLeaves(pendingPage);
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.message || 'Failed to reject leave');
    }
  };

  const handleOpenDialog = (employee, leaveBalance) => {
    setSelectedEmployee(employee);
    setSelectedLeaveType(leaveBalance);
    setAdjustment('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEmployee(null);
    setSelectedLeaveType(null);
    setAdjustment('');
  };

  const handleAdjustQuota = async () => {
    try {
      const adjustmentValue = parseInt(adjustment);
      if (isNaN(adjustmentValue)) {
        alert('Please enter a valid number');
        return;
      }

      await api.post('/api/leaves/adjust-quota', {
        user_id: selectedEmployee.user_id,
        leave_type_id: selectedLeaveType.leave_type_id,
        adjustment: adjustmentValue,
      });

      alert('Quota adjusted successfully');
      handleCloseDialog();
      fetchEmployees(employeesPage);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to adjust quota');
    }
  };

  const handleAddEmployee = async () => {
    try {
      if (!newEmployee.email || !newEmployee.full_name || !newEmployee.password) {
        alert('All fields are required');
        return;
      }

      await api.post('/api/hr/employees', newEmployee);
      alert('Employee added successfully');
      setOpenAddDialog(false);
      setNewEmployee({ email: '', full_name: '', password: '' });
      fetchEmployees(employeesPage);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add employee');
    }
  };

  useEffect(() => {
    fetchPendingLeaves();
    fetchEmployees();
    fetchAllLeaves();
  }, []);
  
  useEffect(() => {
    if (tabValue === 2) {
      const timer = setTimeout(() => {
        setAllLeavesPage(1);
        fetchAllLeaves(1);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [statusFilter, sortBy, searchQuery]);

  return (
    <Box>
      <Typography variant="h4" mb={3}>
        HR Dashboard
      </Typography>

      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab label="Pending Requests" />
        <Tab label="Manage Employee Quotas" />
        <Tab label="All Leave History" />
      </Tabs>

      {tabValue === 0 && (
        <Box>
          <Typography variant="h5" mb={3}>
            Pending Leave Requests
          </Typography>

          {leaves.length === 0 ? (
            <Typography>No pending requests</Typography>
          ) : (
            <>
              {leaves.map((leave) => (
                <Paper key={leave.leave_id} sx={{ p: 2, mb: 2 }}>
                  <Typography><strong>Employee Name:</strong> {leave.employee_name}</Typography>
                  <Typography><strong>Leave Type:</strong> {leave.leave_type}</Typography>
                  <Typography><strong>From:</strong> {leave.start_date}</Typography>
                  <Typography><strong>To:</strong> {leave.end_date}</Typography>
                  <Typography><strong>Total Days:</strong> {leave.total_days}</Typography>
                  <Typography><strong>Reason:</strong> {leave.reason}</Typography>

                  <Stack direction="row" spacing={2} mt={2}>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => approveLeave(leave.leave_id)}
                    >
                      Approve
                    </Button>

                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => rejectLeave(leave.leave_id)}
                    >
                      Reject
                    </Button>
                  </Stack>
                </Paper>
              ))}
              {pendingTotal > perPage && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination 
                    count={Math.ceil(pendingTotal / perPage)} 
                    page={pendingPage} 
                    onChange={(e, page) => fetchPendingLeaves(page)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </Box>
      )}

      {tabValue === 1 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">Employee Leave Quotas</Typography>
            <Button variant="contained" onClick={() => setOpenAddDialog(true)}>
              Add New Employee
            </Button>
          </Box>

          {employees.length === 0 ? (
            <Typography>No employees found</Typography>
          ) : (
            <>
              {employees.map((employee) => (
                <Paper key={employee.user_id} sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" mb={2}>
                    {employee.full_name} ({employee.email})
                  </Typography>

                  {employee.leave_balances.map((balance) => (
                    <Paper key={balance.leave_type_id} sx={{ p: 2, mb: 2, background: 'rgba(0, 229, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography><strong>{balance.leave_type}</strong></Typography>
                          <Typography>Total Quota: {balance.total_quota} days</Typography>
                          <Typography>Used: {balance.used_days} days</Typography>
                          <Typography>Remaining: {balance.remaining_days} days</Typography>
                        </Box>
                        {(user?.roles?.includes('ADMIN') || user?.roles?.includes('HR')) && (
                          <Button
                            variant="outlined"
                            onClick={() => handleOpenDialog(employee, balance)}
                          >
                            Adjust Quota
                          </Button>
                        )}
                      </Stack>
                    </Paper>
                  ))}
                </Paper>
              ))}
              {employeesTotal > perPage && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination 
                    count={Math.ceil(employeesTotal / perPage)} 
                    page={employeesPage} 
                    onChange={(e, page) => fetchEmployees(page)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </Box>
      )}

      {tabValue === 2 && (
        <Box>
          <Typography variant="h5" mb={3}>
            All Leave History
          </Typography>
          
          <Stack direction="row" spacing={2} mb={3}>
            <TextField
              label="Search Employee"
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter employee name..."
              sx={{ minWidth: 250 }}
            />
            
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="date_desc">Date (Newest First)</MenuItem>
                <MenuItem value="date_asc">Date (Oldest First)</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          {allLeaves.length === 0 ? (
            <Typography>No leave records found</Typography>
          ) : (
            <>
              {allLeaves.map((leave) => (
                <Paper key={leave.leave_id} sx={{ p: 3, mb: 2, background: 'rgba(0, 229, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <Stack spacing={1}>
                    <Typography variant="h6">{leave.employee_name} ({leave.employee_email})</Typography>
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
              {allLeavesTotal > perPage && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination 
                    count={Math.ceil(allLeavesTotal / perPage)} 
                    page={allLeavesPage} 
                    onChange={(e, page) => fetchAllLeaves(page)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </Box>
      )}

      <Dialog open={openRejectDialog} onClose={() => setOpenRejectDialog(false)}>
        <DialogTitle>Reject Leave Request</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, minWidth: 400 }}>
            <TextField
              label="Rejection Reason"
              multiline
              rows={4}
              fullWidth
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please provide a reason for rejection..."
              helperText="This reason will be visible to the employee"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRejectDialog(false)}>Cancel</Button>
          <Button onClick={handleRejectConfirm} variant="contained" color="error">
            Reject Leave
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Adjust Leave Quota</DialogTitle>
        <DialogContent>
          {selectedEmployee && selectedLeaveType && (
            <Box sx={{ pt: 2 }}>
              <Typography mb={2}>
                <strong>Employee:</strong> {selectedEmployee.full_name}
              </Typography>
              <Typography mb={2}>
                <strong>Leave Type:</strong> {selectedLeaveType.leave_type}
              </Typography>
              <Typography mb={2}>
                <strong>Current Quota:</strong> {selectedLeaveType.total_quota} days
              </Typography>
              <TextField
                label="Adjustment (use + or - for add/deduct)"
                type="number"
                fullWidth
                value={adjustment}
                onChange={(e) => setAdjustment(e.target.value)}
                placeholder="e.g., +5 or -3"
                helperText="Enter positive number to add, negative to deduct"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleAdjustQuota} variant="contained">
            Adjust
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
        <DialogTitle>Add New Employee</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 400 }}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={newEmployee.email}
              onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
            />
            <TextField
              label="Full Name"
              fullWidth
              value={newEmployee.full_name}
              onChange={(e) => setNewEmployee({ ...newEmployee, full_name: e.target.value })}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              value={newEmployee.password}
              onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button onClick={handleAddEmployee} variant="contained">
            Add Employee
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}