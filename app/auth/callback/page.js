'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/profile');
      } else {
        router.push('/login');
      }
    });
  }, [router]);

  return (
    <div className="max-w-md mx-auto p-6 mt-10 rounded shadow text-center">
      <p>Trwa przekierowanie...</p>
    </div>
  );
}
