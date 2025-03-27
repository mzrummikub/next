'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function EmailVerifyPage() {
  const [status, setStatus] = useState('loading')
  const router = useRouter()

  useEffect(() => {
    const verifyFromUrl = async () => {
      // Pobierz dane z hash z URL
      const hash = window.location.hash.substr(1)
      const params = new URLSearchParams(hash)
      const access_token = params.get('access_token')
      const refresh_token = params.get('refresh_token')

      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        })

        if (error) {
          setStatus('error')
          return
        }

        setStatus('success')
        setTimeout(() => {
          router.push('/panel')
        }, 3000)
      } else {
        setStatus('error')
      }
    }

    verifyFromUrl()
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
          <h1 className="text-2xl font-semibold text-red-600">❌ Nie udało się potwierdzić konta</h1>
          <p className="mt-2 text-gray-700">Spróbuj zalogować się ręcznie lub użyj poprawnego linku.</p>
          <a href="/login" className="mt-4 text-blue-600 underline">Przejdź do logowania</a>
        </>
      )}
    </div>
  )
}
