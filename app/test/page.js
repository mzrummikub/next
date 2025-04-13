// ✅ app/test/page.js
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function TestPage() {
  const [status, setStatus] = useState({
    session: null,
    user: null,
    ranga: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          setStatus({ session: null, user: null, ranga: null, loading: false, error: "Brak aktywnej sesji" });
          return;
        }

        const user = session.user;

        const { data: userInfo, error: dbError } = await supabase
          .from("users")
          .select("ranga")
          .eq("id", user.id)
          .maybeSingle();

        if (dbError) {
          setStatus({ session, user, ranga: null, loading: false, error: dbError.message });
          return;
        }

        setStatus({ session, user, ranga: userInfo?.ranga || null, loading: false, error: null });
      } catch (err) {
        setStatus({ session: null, user: null, ranga: null, loading: false, error: err.message });
      }
    };

    fetchData();
  }, []);

  if (status.loading) return <div className="p-4">🔄 Ładowanie danych użytkownika...</div>;

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">🧪 Test dostępu admina</h2>

      <p><strong>📡 Sesja:</strong> {status.session ? "✅ aktywna" : "❌ brak"}</p>
      <p><strong>👤 Użytkownik:</strong> {status.user?.email || "-"}</p>
      <p><strong>🆔 ID:</strong> {status.user?.id || "-"}</p>
      <p><strong>🧩 Ranga z tabeli users:</strong> {status.ranga || "❌ brak"}</p>

      {status.ranga === "admin" ? (
        <p className="mt-4 text-green-600 font-bold">✅ Użytkownik jest administratorem</p>
      ) : (
        <p className="mt-4 text-red-600 font-bold">⛔ Brak uprawnień administratora</p>
      )}

      {status.error && (
        <div className="mt-4 text-red-500">
          <strong>Błąd:</strong> {status.error}
        </div>
      )}
    </div>
  );
}
