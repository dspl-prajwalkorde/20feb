'use client';

import { Button, Typography, Stack } from '@mui/material';

export default function Home() {
  return (
    <Stack spacing={2} alignItems="center" mt={10}>
      <Typography variant="h4">
        Leave Management System
      </Typography>

      <Button variant="contained">
        Login
      </Button>
    </Stack>
  );
}
