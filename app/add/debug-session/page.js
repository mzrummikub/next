// ✅ app/test/page.js
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function TestPermissionPage() {
  const [info, setInfo] = useState({
    userId: null,
    email: null,
    login: null,
    canInsert: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (!user || userError) {
          setInfo({ ...info, error: "Nie jesteś zalogowany", loading: false });
          return;
        }

        const { data: userInfo, error: infoError } = await supabase
          .from("users")
          .select("login")
          .eq("id", user.id)
          .maybeSingle();

        if (infoError) {
          setInfo({ ...info, error: "Brak dostępu do tabeli users (RLS)", loading: false });
          return;
        }

        const canInsert = userInfo?.login === "westtpl";

        setInfo({
          userId: user.id,
          email: user.email,
          login: userInfo?.login || null,
          canInsert,
          error: null,
          loading: false,
        });
      } catch (err) {
        setInfo({ ...info, error: err.message, loading: false });
      }
    };

    checkPermission();
  }, []);

  if (info.loading) return <p className="p-4">🔄 Sprawdzanie uprawnień...</p>;

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">🔐 Test uprawnień do zakładania turnieju</h2>

      <p><strong>🆔 ID użytkownika:</strong> {info.userId || "-"}</p>
      <p><strong>📧 Email:</strong> {info.email || "-"}</p>
      <p><strong>🔑 Login z tabeli users:</strong> {info.login || "brak"}</p>

      {info.canInsert ? (
        <p className="text-green-600 font-bold mt-4">✅ MASZ prawo do tworzenia turnieju (login = "westtpl")</p>
      ) : (
        <p className="text-red-600 font-bold mt-4">⛔ NIE masz uprawnień do tworzenia turnieju</p>
      )}

      {info.error && (
        <p className="text-red-500 mt-4"><strong>Błąd:</strong> {info.error}</p>
      )}
    </div>
  );
}
