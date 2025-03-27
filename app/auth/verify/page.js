'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function VerifyEmailPage() {
  const [status, setStatus] = useState('loading');
  const router = useRouter();

  useEffect(() => {
    const verifyUser = async () => {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');

      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (error) {
          setStatus('error');
          return;
        }

        setStatus('success');

        setTimeout(() => {
          router.push('/panel');
        }, 3000);
      } else {
        setStatus('error');
      }
    };

    verifyUser();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen text-center">
      {status === 'loading' && <p>Trwa weryfikacja konta...</p>}
      {status === 'success' && (
        <>
          <p className="text-green-600">✅ Konto zweryfikowane!</p>
          <p>Za chwilę zostaniesz przekierowany do panelu.</p>
        </>
      )}
      {status === 'error' && (
        <>
          <p className="text-red-600">❌ Błąd weryfikacji konta.</p>
          <a className="underline" href="/login">Zaloguj się ręcznie</a>
        </>
      )}
    </div>
  );
}
