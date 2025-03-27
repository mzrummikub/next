'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function EmailVerifyPage() {
  const [status, setStatus] = useState('loading') // loading | success | error
  const router = useRouter()

  useEffect(() => {
    const verifyEmail = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error || !data?.session) {
        setStatus('error')
        return
      }

      // Użytkownik zalogowany – potwierdzona weryfikacja
      setStatus('success')

      // Możesz np. przekierować po 3 sek do panelu:
      setTimeout(() => {
        router.push('/panel')
      }, 3000)
    }

    verifyEmail()
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      {status === 'loading' && (
        <p className="text-lg text-gray-600">Sprawdzanie weryfikacji konta...</p>
      )}

      {status === 'success' && (
        <>
          <h1 className="text-2xl font-semibold text-green-600">✅ Konto zostało pomyślnie zweryfikowane!</h1>
          <p className="mt-2 text-gray-700">Za chwilę zostaniesz przekierowany do panelu...</p>
        </>
      )}

      {status === 'error' && (
        <>
          <h1 className="text-2xl font-semibold text-red-600">❌ Nie udało się zweryfikować konta.</h1>
          <p className="mt-2 text-gray-700">Spróbuj ponownie kliknąć link lub zaloguj się ręcznie.</p>
          <a href="/login" className="mt-4 text-blue-600 underline">Przejdź do logowania</a>
        </>
      )}
    </div>
  )
}
