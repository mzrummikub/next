'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function VerifyPage() {
  const [status, setStatus] = useState('loading');
  const router = useRouter();

  useEffect(() => {
    const verifyUser = async () => {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);

      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');

      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({ access_token, refresh_token });

        if (error) {
          console.error('Błąd Supabase (setSession):', error);
          setStatus('error');
          return;
        }

        setStatus('success');
        setTimeout(() => router.push('/panel'), 3000);
      } else {
        console.error('Brak access_token lub refresh_token w URL:', hash);
        setStatus('error');
      }
    };

    verifyUser();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {status === 'loading' && <p>Trwa weryfikacja...</p>}
      {status === 'success' && (
        <p>Konto zweryfikowane! Zaraz nastąpi przekierowanie...</p>
      )}
      {status === 'error' && (
        <>
          <p>❌ Błąd podczas weryfikacji konta.</p>
          <a href="/login" className="underline text-blue-600">
            Zaloguj się ręcznie
          </a>
        </>
      )}
    </div>
  );
}
