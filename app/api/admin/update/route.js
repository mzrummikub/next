import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { table, data, idField } = await req.json();

    if (!table || !data || !idField || !data[idField]) {
      return NextResponse.json({ error: "Brak wymaganych danych." }, { status: 400 });
    }

    const idValue = data[idField];
    const updated = { ...data };
    delete updated[idField];

    const { error } = await supabase
      .from(table)
      .update(updated)
      .eq(idField, idValue);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Błąd serwera." }, { status: 500 });
  }
}
