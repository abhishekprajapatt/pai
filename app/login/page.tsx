'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useFirebaseAuth } from '@/context/AuthContext';
import Auth from '@/components/auth/Auth';
import { Spinner } from '@/components/ui/spinner';

export default function AuthPage() {
  const { isAuthenticated, loading } = useFirebaseAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    document.title = 'Sign in - Prajapatt AI';
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <Spinner className="w-6 h-6" />
      </div>
    );
  }

  return <Auth />;
}
