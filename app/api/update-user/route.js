import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // UWAGA: używamy service role tylko po stronie serwera!
);

export async function POST(req) {
  const body = await req.json();
  const { email, login, password, userId } = body;

  if (!email || !login || !password || !userId) {
    return NextResponse.json({ error: "Brak wymaganych danych." }, { status: 400 });
  }

  // Pobierz aktualnego użytkownika
  const { data: authUser, error: getUserError } = await supabase.auth.admin.getUserById(userId);
  if (getUserError || !authUser) {
    return NextResponse.json({ error: "Nie znaleziono użytkownika." }, { status: 404 });
  }

  // Reautentykacja - zaloguj tymczasowo użytkownika, by sprawdzić hasło
  const tempClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const { error: reauthError } = await tempClient.auth.signInWithPassword({
    email: authUser.user.email,
    password,
  });
  if (reauthError) {
    return NextResponse.json({ error: "Nieprawidłowe hasło." }, { status: 401 });
  }

  // Aktualizacja emaila (jeśli się zmienił)
  if (email !== authUser.user.email) {
    const { error: emailUpdateError } = await supabase.auth.admin.updateUserById(userId, {
      email,
    });
    if (emailUpdateError) {
      return NextResponse.json({ error: "Nie udało się zaktualizować emaila." }, { status: 500 });
    }
  }

  // Aktualizacja display_name
  const { error: metaUpdateError } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: {
      display_name: login,
    },
  });
  if (metaUpdateError) {
    return NextResponse.json({ error: "Nie udało się zaktualizować display_name." }, { status: 500 });
  }

  // Aktualizacja danych w tabeli users
  const { error: userUpdateError } = await supabase
    .from("users")
    .update({ email, login })
    .eq("id", userId);
  if (userUpdateError) {
    return NextResponse.json({ error: "Błąd aktualizacji danych w tabeli users." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
