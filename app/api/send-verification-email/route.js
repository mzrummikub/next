import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req) {
  const { email, username, link } = await req.json()

  try {
    const { error } = await resend.emails.send({
      from: 'noreply@mzrummikub.vercel.app',
      to: email,
      subject: 'Potwierdzenie konta Rummikub',
      html: `
        <h2>Witaj, ${username}!</h2>
        <p>Dziękujemy za rejestrację. Kliknij poniższy link, aby potwierdzić konto:</p>
        <p><a href="${link}">${link}</a></p>
      `,
    })

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
