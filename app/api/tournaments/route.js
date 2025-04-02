import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Używamy klucza serwisowego, aby mieć pełne uprawnienia do operacji INSERT
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request) {
  try {
    const body = await request.json();
    const { nazwa, ranga, miasto, wojewodztwo, data_turnieju, limit_miejsc } = body;
    
    // Sprawdzamy, czy limit_miejsc został przesłany i jest liczbą
    if (typeof limit_miejsc !== "number") {
      return NextResponse.json(
        { error: "Parametr limit_miejsc musi być liczbą" },
        { status: 400 }
      );
    }
    
    // Wstaw rekord do tabeli "turnieje"
    const { data, error } = await supabase
      .from("turnieje")
      .insert([
        {
          nazwa,
          ranga,
          miasto,
          wojewodztwo,
          limit_miejsc,
          data_turnieju: data_turnieju || null,
        },
      ]);
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
