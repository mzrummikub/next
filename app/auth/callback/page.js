'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function AuthCallback() {
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      // 1. Obsłuż token z URL (hash po kliknięciu w link z maila)
      const { data, error } = await supabase.auth.getSessionFromUrl({
        storeSession: true,
      })

      if (error) {
        setMessage('Błąd logowania: ' + error.message)
        setLoading(false)
        return
      }

      // 2. Sprawdź, czy użytkownik jest teraz zalogowany
      const { data: userData } = await supabase.auth.getUser()
      if (userData?.user) {
        setMessage('Zalogowano! Przekierowanie...')
        setTimeout(() => router.push('/panel'), 2000)
      } else {
        setMessage('Nie udało się zalogować użytkownika.')
      }

      setLoading(false)
    }

    handleCallback()
  }, [router])

  return (
    <div className="max-w-md mx-auto mt-20 p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Logowanie...</h1>
      {loading ? <p>Trwa logowanie...</p> : <p>{message}</p>}
    </div>
  )
}
