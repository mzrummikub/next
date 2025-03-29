'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function AuthCallback() {
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser()

      if (error || !data?.user) {
        setMessage('Nie udało się zalogować użytkownika.')
      } else {
        setMessage('Zalogowano! Przekierowanie...')
        setTimeout(() => router.push('/panel'), 2000)
      }

      setLoading(false)
    }

    checkUser()
  }, [router])

  return (
    <div className="max-w-md mx-auto mt-20 p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Logowanie...</h1>
      {loading ? <p>Trwa logowanie...</p> : <p>{message}</p>}
    </div>
  )
}
