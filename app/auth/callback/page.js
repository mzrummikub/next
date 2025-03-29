'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function AuthCallback() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      // Odczytaj parametry z URL: token, type, (opcjonalnie email)
      const params = new URLSearchParams(window.location.search)
      const token = params.get('token')
      const type = params.get('type')
      const email = params.get('email') // czasem email jest przekazywany

      if (!token || !type) {
        setMessage('Brak wymaganych parametrów w URL.')
        setLoading(false)
        return
      }

      // Używamy verifyOtp aby potwierdzić konto i utworzyć sesję
      const { data, error } = await supabase.auth.verifyOtp({
        token,
        type, // powinno być 'signup'
        email, // przekazujemy, jeśli dostępne
      })

      if (error) {
        // Jeśli wystąpił błąd, wyświetlamy komunikat
        setMessage(`Błąd weryfikacji: ${error.message}`)
        setLoading(false)
        return
      }

      if (data?.session) {
        setMessage('Konto potwierdzone! Logowanie...')
        setTimeout(() => router.push('/panel'), 2000)
      } else {
        // Jeśli sesja nie została utworzona – konto potwierdzone, ale użytkownik musi się zalogować ręcznie
        setMessage('Konto potwierdzone, proszę się zalogować.')
      }
      setLoading(false)
    }

    handleCallback()
  }, [router])

  return (
    <div className="max-w-md mx-auto mt-20 p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Potwierdzanie konta...</h1>
      {loading ? <p>Trwa weryfikacja...</p> : <p>{message}</p>}
      {!loading && !message.includes('Logowanie') && (
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
