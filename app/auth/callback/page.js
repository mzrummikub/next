'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function AuthCallback() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [user, setUser] = useState(null)

  useEffect(() => {
    async function handleVerification() {
      // Pobieramy parametry z URL
      const params = new URLSearchParams(window.location.search)
      const token = params.get('token')
      const type = params.get('type')

      if (!token || !type) {
        setMessage('❌ Brakuje parametrów w URL (token lub type).')
        setLoading(false)
        return
      }

      // Próba potwierdzenia tokenu
      const { data, error } = await supabase.auth.verifyOtp({ token, type })

      if (error) {
        setMessage(`❌ Błąd potwierdzania tokenu: ${error.message}`)
        setLoading(false)
        return
      }

      if (data.session) {
        setMessage('✅ Konto potwierdzone, sesja utworzona. Przekierowanie do panelu...')
        setUser(data.user)
        // Automatyczne przekierowanie do panelu po 3 sekundach
        setTimeout(() => router.push('/panel'), 3000)
      } else {
        setMessage('✅ Konto potwierdzone, ale sesja nie została utworzona. Zaloguj się ręcznie.')
      }

      setLoading(false)
    }

    handleVerification()
  }, [router])

  return (
    <div className="max-w-xl mx-auto mt-20 p-6 border rounded shadow">
      <h1 className="text-2xl font-bold mb-4">🔍 Weryfikacja konta</h1>
      {loading ? (
        <p className="text-gray-600">⏳ Trwa potwierdzanie konta...</p>
      ) : (
        <>
          <p className="text-gray-800">{message}</p>
          {user && (
            <div className="mt-4 text-sm text-left">
              <p><strong>📧 Email:</strong> {user.email}</p>
              <p><strong>🆔 User ID:</strong> {user.id}</p>
              <p><strong>📅 Email potwierdzono:</strong> {user.email_confirmed_at || '❌ Brak'}</p>
            </div>
          )}
          {!user && (
            <button
              onClick={() => router.push('/login')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Przejdź do logowania
            </button>
          )}
        </>
      )}
    </div>
  )
}
