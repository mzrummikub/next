'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function EmailVerifyPage() {
  const [status, setStatus] = useState('loading') // możliwe: loading | success | error
  const router = useRouter()

  useEffect(() => {
    const verifyUser = async () => {
      const hashParams = window.location.hash.substring(1)
      const params = new URLSearchParams(hashParams)
      const access_token = params.get('access_token')
      const refresh_token = params.get('refresh_token')

      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        })

        if (error) {
          console.error('Błąd aktywacji:', error)
          setStatus('error')
          return
        }

        // Sukces – zweryfikowano konto!
        setStatus('success')

        // Przekierowanie (opcjonalne) np. po 3 sekundach
        setTimeout(() => {
          router.push('/panel') // tutaj np. twój panel użytkownika
        }, 3000)
      } else {
        setStatus('error')
      }
    }

    verifyUser()
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      {status === 'loading' && (
        <p className="text-lg text-gray-600">Weryfikacja konta w toku...</p>
      )}

      {status === 'success' && (
        <>
          <h1 className="text-2xl font-semibold text-green-600">
            ✅ Konto zostało zweryfikowane!
          </h1>
          <p className="mt-2 text-gray-700">
            Za chwilę zostaniesz przekierowany do panelu.
          </p>
        </>
      )}

      {status === 'error' && (
        <>
          <h1 className="text-2xl font-semibold text-red-600">
            ❌ Nie udało się zweryfikować konta.
          </h1>
          <p className="mt-2 text-gray-700">
            Link jest nieprawidłowy lub wygasł. Spróbuj zalogować się ręcznie.
          </p>
          <a href="/login" className="mt-4 text-blue-600 underline">
            Przejdź do logowania
          </a>
        </>
      )}
    </div>
  )
}
