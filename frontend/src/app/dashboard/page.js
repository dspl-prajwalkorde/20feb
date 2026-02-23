'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      if (user.roles.includes('ADMIN')) {
        router.push('/dashboard/admin');
      } else if (user.roles.includes('HR')) {
        router.push('/dashboard/hr');
      } else {
        router.push('/dashboard/employee');
      }
    }
  }, [user, router]);

  return null;
}
