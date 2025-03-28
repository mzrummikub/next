'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function CallbackPage() {
  const [message, setMessage] = useState('Trwa weryfikacja...');
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setMessage('Twoje konto zostało aktywowane!');
        setTimeout(() => router.push('/'), 3000);
      } else {
        setMessage('Coś poszło nie tak. Spróbuj ponownie.');
      }
    });
  }, [router]);

  return (
    <div className="max-w-md mx-auto p-6 mt-10 rounded shadow text-center">
      <p>{message}</p>
    </div>
  );
}
