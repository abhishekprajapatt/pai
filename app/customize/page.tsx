'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CustomizePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/customize/skills');
  }, [router]);

  return <div className="min-h-screen bg-[#09090b]" />;
}
