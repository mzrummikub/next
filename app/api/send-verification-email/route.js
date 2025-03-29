import nodemailer from 'nodemailer'
import { NextResponse } from 'next/server'

export async function POST(req) {
  const { email, username, link } = await req.json()

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false, 
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  try {
    await transporter.sendMail({
      from: `"Rummikub" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Potwierdzenie konta Rummikub',
      html: `
        <h2>Witaj, ${username}!</h2>
        <p>Dziękujemy za rejestrację. Aby potwierdzić swoje konto, kliknij poniższy link:</p>
        <p><a href="${link}">${link}</a></p>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Błąd wysyłki maila:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
