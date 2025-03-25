'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuth = async () => {
      const { error } = await supabase.auth.exchangeCodeForSession()
      if (error) {
        console.error('Błąd logowania:', error.message)
        router.push('/app/callback') // lub pokaż błąd użytkownikowi
      } else {
        router.push('/') // lub np. '/dashboard'
      }
    }

    handleAuth()
  }, [router])

  return <div>Trwa potwierdzanie konta...</div>
}
