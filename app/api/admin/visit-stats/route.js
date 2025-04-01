import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Używamy klucza serwisowego, który ma pełne uprawnienia
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  // Pobierz łączną liczbę wizyt
  const { count: totalVisits, error: totalError } = await supabase
    .from("visits")
    .select("*", { count: "exact", head: true });

  if (totalError) {
    return NextResponse.json({ error: totalError.message }, { status: 500 });
  }

  // Pobierz wizyty według kraju za pomocą funkcji RPC
  const { data: visitsByCountry, error: countryError } = await supabase.rpc("get_visits_by_country");
  if (countryError) {
    return NextResponse.json({ error: countryError.message }, { status: 500 });
  }

  // Pobierz wizyty według przeglądarki za pomocą funkcji RPC
  const { data: visitsByBrowser, error: browserError } = await supabase.rpc("get_visits_by_browser");
  if (browserError) {
    return NextResponse.json({ error: browserError.message }, { status: 500 });
  }

  return NextResponse.json({
    stats: {
      totalVisits,
      visitsByCountry,
      visitsByBrowser,
    },
  });
}
