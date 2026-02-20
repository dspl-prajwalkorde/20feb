'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
} from '@mui/material';

export default function DashboardLayout({ children }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!user) return;

    try {
      const roles = user.roles || [];

      if (pathname.startsWith('/dashboard/hr') && !roles.includes('HR') && !roles.includes('ADMIN')) {
        router.replace('/unauthorized');
      }

      if (pathname.startsWith('/dashboard/admin') && !roles.includes('ADMIN')) {
        router.replace('/unauthorized');
      }

      if (pathname.startsWith('/dashboard/employee') && !roles.includes('EMPLOYEE') && !roles.includes('ADMIN')) {
        router.replace('/unauthorized');
      }
    } catch (error) {
      console.error('Route protection error:', error);
      router.replace('/unauthorized');
    }
  }, [pathname, user, router]);

  const handleNavigate = (path) => {
    router.push(path);
  };

  const renderNavButtons = () => {
    if (!user) return null;

    const roles = user.roles || [];

    if (roles.includes('ADMIN')) {
      return (
        <>
          <Button color="inherit" onClick={() => handleNavigate('/dashboard/admin')} sx={{ mx: 1 }}>
            Admin
          </Button>
          <Button color="inherit" onClick={() => handleNavigate('/dashboard/hr')} sx={{ mx: 1 }}>
            HR
          </Button>
          <Button color="inherit" onClick={() => handleNavigate('/dashboard/employee')} sx={{ mx: 1 }}>
            Employee
          </Button>
        </>
      );
    }

    if (roles.includes('HR')) {
      return (
        <Button color="inherit" onClick={() => handleNavigate('/dashboard/hr')} sx={{ mx: 1 }}>
          HR Dashboard
        </Button>
      );
    }

    if (roles.includes('EMPLOYEE')) {
      return (
        <Button color="inherit" onClick={() => handleNavigate('/dashboard/employee')} sx={{ mx: 1 }}>
          My Leaves
        </Button>
      );
    }

    return null;
  };

  if (!user) return null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', letterSpacing: 1 }}>
            Nexus Pulse
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {renderNavButtons()}
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 3 }}>
              <Avatar 
                sx={{ 
                  width: 36, 
                  height: 36, 
                  background: 'linear-gradient(135deg, #00e5ff 0%, #ff4081 100%)',
                  cursor: 'pointer',
                  '&:hover': { opacity: 0.8 }
                }}
                onClick={() => handleNavigate('/dashboard/profile')}
              >
                {user?.full_name?.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ cursor: 'pointer' }} onClick={() => handleNavigate('/dashboard/profile')}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {user?.full_name}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  {user?.roles?.[0]}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: 'background.default', mt: 8 }}>
        {children}
      </Box>
    </Box>
  );
}
