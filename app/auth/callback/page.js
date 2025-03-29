'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function AuthCallback() {
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Najpierw sprawdźmy, czy Supabase widzi usera
    const checkIfConfirmed = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()

      // Jesli user jest zalogowany, to supabase go zna
      if (user && !error) {
        setMessage('Konto już jest zalogowane! Przenoszę do panelu...')
        setTimeout(() => router.push('/panel'), 2000)
        setLoading(false)
        return
      }

      // Jeśli brak usera lub error => to normalne w trybie verify token
      // bo Supabase potwierdza email, ale nie loguje. Pokaz info:
      setMessage('Konto zostało potwierdzone, teraz możesz się zalogować.')
      setLoading(false)
    }

    checkIfConfirmed()
  }, [router])

  return (
    <div className="max-w-md mx-auto mt-20 p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Potwierdzenie konta</h1>
      {loading ? <p>Trwa sprawdzanie...</p> : <p>{message}</p>}
      {!loading && (
        <button
          onClick={() => router.push('/login')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Przejdź do logowania
        </button>
      )}
    </div>
  )
}
