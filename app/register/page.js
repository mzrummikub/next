const handleRegister = async (e) => {
  e.preventDefault()
  setMessage('')

  if (password !== confirmPassword) {
    setMessage('Hasła się nie zgadzają.')
    return
  }

  const verificationToken = uuidv4()

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError || !authData?.user) {
    console.error('❌ Błąd rejestracji:', authError)
    setMessage(`Błąd rejestracji: ${authError?.message}`)
    return
  }

  const userId = authData.user.id
  console.log('✅ userId:', userId)
  console.log('✅ verificationToken:', verificationToken)

  const { error: insertError } = await supabase.from('user').insert({
    id: userId,
    email,
    username,
    verification_token: verificationToken,
    verified: false,
  })

  if (insertError) {
    console.error('❌ Błąd insert:', insertError)
    setMessage(`Błąd zapisu danych: ${insertError.message}`)
    return
  }

  const verificationLink = `https://mzrummikub.vercel.app/api/verify?token=${verificationToken}`

  const response = await fetch('/api/send-verification-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, username, link: verificationLink }),
  })

  if (!response.ok) {
    const errorDetails = await response.json()
    console.error('❌ Błąd wysyłania maila:', errorDetails)
    setMessage(`Konto utworzone, ale błąd maila: ${errorDetails.error}`)
    return
  }

  setMessage('Konto utworzone! Sprawdź maila i kliknij link weryfikacyjny.')
  setTimeout(() => router.push('/login'), 5000)
}
