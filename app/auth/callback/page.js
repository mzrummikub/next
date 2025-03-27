'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const confirmUser = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Błąd sesji:', error)
        return
      }

      if (data?.session) {
        // Zalogowany po potwierdzeniu
        router.push('/panel')
      } else {
        // Jeśli nie ma sesji – przekieruj do logowania
        router.push('/login')
      }
    }

    confirmUser()
  }, [router])

  return <div>Trwa potwierdzanie konta...</div>
}
