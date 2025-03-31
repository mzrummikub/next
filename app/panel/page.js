"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function PanelPage() {
  const [session, setSession] = useState(null);
  const [userRecordChecked, setUserRecordChecked] = useState(false);
  const [userData, setUserData] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [adminEditRows, setAdminEditRows] = useState({});
  const [updateMessage, setUpdateMessage] = useState("");
  const router = useRouter();

  // Pobierz aktywną sesję
  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();
      if (!currentSession) {
        router.push("/login");
      } else {
        setSession(currentSession);
      }
    };
    getSession();
  }, [router]);

  // Sprawdź lub wstaw rekord w tabeli "users" po pełnym uwierzytelnieniu
  useEffect(() => {
    const checkOrInsertUserRecord = async () => {
      if (!session || userRecordChecked) return;
      const userId = session.user.id;
      // Sprawdzenie czy rekord już istnieje
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();
      if (error || !data) {
        // Ustaw domyślny login na podstawie user_metadata.display_name lub części emaila
        const defaultLogin =
          session.user.user_metadata.display_name ||
          session.user.email.split("@")[0];
        const { error: insertError } = await supabase.from("users").insert({
          id: userId,
          email: session.user.email,
          login: defaultLogin,
        });
        if (insertError) {
          console.error("Błąd przy wstawianiu rekordu do users:", insertError.message);
        }
      }
      setUserRecordChecked(true);
    };
    checkOrInsertUserRecord();
  }, [session, userRecordChecked]);

  // Pobierz dane użytkownika z tabeli "users"
  useEffect(() => {
    const fetchUserData = async () => {
      if (!session) return;
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();
      if (error) {
        console.error("Błąd pobierania danych użytkownika:", error);
      } else {
        setUserData(data);
      }
    };
    fetchUserData();
  }, [session, userRecordChecked]);

  // Jeśli użytkownik ma rolę "admin", pobierz wszystkie rekordy z tabeli "users"
  useEffect(() => {
    const fetchAllUsers = async () => {
      if (!userData || userData.ranga !== "admin") return;
      const { data, error } = await supabase.from("users").select("*");
      if (error) {
        console.error("Błąd pobierania wszystkich użytkowników:", error);
      } else {
        setAllUsers(data);
      }
    };
    fetchAllUsers();
  }, [userData]);

  // Aktualizacja danych dla zwykłego użytkownika (edytowanie własnego loginu)
  const handleBasicUpdate = async (e) => {
    e.preventDefault();
    if (!userData) return;
    const { error } = await supabase
      .from("users")
      .update({ login: userData.login })
      .eq("id", session.user.id);
    if (error) {
      setUpdateMessage(error.message);
    } else {
      setUpdateMessage("Dane zaktualizowane!");
      // Odśwież dane użytkownika
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();
      setUserData(data);
    }
  };

  // Aktualizacja danych w tabeli dla admina (edycja loginu w wierszu)
  const handleAdminRowEdit = async (userId) => {
    const newLogin = adminEditRows[userId]?.editedLogin;
    if (!newLogin) return;
    const { error } = await supabase
      .from("users")
      .update({ login: newLogin })
      .eq("id", userId);
    if (error) {
      setUpdateMessage(error.message);
    } else {
      setUpdateMessage("Dane użytkownika zaktualizowane!");
      setAdminEditRows((prev) => ({
        ...prev,
        [userId]: { editing: false, editedLogin: newLogin },
      }));
      // Odśwież całą listę użytkowników
      const { data } = await supabase.from("users").select("*");
      setAllUsers(data);
    }
  };

  if (!session || !userRecordChecked || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p>Ładowanie...</p>
      </div>
    );
  }

  return (
    <div className="p-4 text-sm">
      {/* Panel dla użytkownika */}
      <div className="max-w-4xl mx-auto p-6 rounded-lg shadow-md mb-8">
        <h1 className="text-2xl font-bold mb-4">Panel użytkownika</h1>
        <div className="space-y-2">
          <p>
            <strong>Email:</strong> {userData.email}
          </p>
          <p>
            <strong>Login:</strong>{" "}
            <input
              type="text"
              value={userData.login}
              onChange={(e) =>
                setUserData({ ...userData, login: e.target.value })
              }
              className="border p-1 rounded"
            />
          </p>
          <p>
            <strong>Ranga:</strong> {userData.ranga}
          </p>
          <p>
            <strong>Data utworzenia:</strong>{" "}
            {new Date(userData.created_at).toLocaleString()}
          </p>
          <p>
            <strong>Ostatnie logowanie:</strong>{" "}
            {userData.last_login
              ? new Date(userData.last_login).toLocaleString()
              : "Brak"}
          </p>
          <button
            onClick={handleBasicUpdate}
            className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
          >
            Zapisz zmiany
          </button>
        </div>
      </div>

      {/* Panel administratora: wyświetla tabelę wszystkich użytkowników */}
      {userData.ranga === "admin" && (
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Lista wszystkich użytkowników</h2>
          {allUsers.length === 0 ? (
            <p>Brak danych do wyświetlenia.</p>
          ) : (
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr>
                  <th className="border p-2">ID</th>
                  <th className="border p-2">Email</th>
                  <th className="border p-2">Login</th>
                  <th className="border p-2">Ranga</th>
                  <th className="border p-2">Data utworzenia</th>
                  <th className="border p-2">Ostatnie logowanie</th>
                  <th className="border p-2">Akcje</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((user) => {
                  const isEditing = adminEditRows[user.id]?.editing;
                  return (
                    <tr key={user.id}>
                      <td className="border p-2">{user.id}</td>
                      <td className="border p-2">{user.email}</td>
                      <td className="border p-2">
                        {isEditing ? (
                          <input
                            type="text"
                            value={adminEditRows[user.id]?.editedLogin || user.login}
                            onChange={(e) =>
                              setAdminEditRows((prev) => ({
                                ...prev,
                                [user.id]: { editing: true, editedLogin: e.target.value },
                              }))
                            }
                            className="border p-1 rounded w-32"
                          />
                        ) : (
                          user.login
                        )}
                      </td>
                      <td className="border p-2">{user.ranga}</td>
                      <td className="border p-2">
                        {new Date(user.created_at).toLocaleString()}
                      </td>
                      <td className="border p-2">
                        {user.last_login ? new Date(user.last_login).toLocaleString() : "Brak"}
                      </td>
                      <td className="border p-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => handleAdminRowEdit(user.id)}
                              className="bg-green-500 text-white px-2 py-1 rounded text-xs mr-2"
                            >
                              Zapisz
                            </button>
                            <button
                              onClick={() =>
                                setAdminEditRows((prev) => ({
                                  ...prev,
                                  [user.id]: { editing: false, editedLogin: user.login },
                                }))
                              }
                              className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                            >
                              Anuluj
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() =>
                              setAdminEditRows((prev) => ({
                                ...prev,
                                [user.id]: { editing: true, editedLogin: user.login },
                              }))
                            }
                            className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                          >
                            Edytuj
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {updateMessage && (
        <div className="max-w-4xl mx-auto mt-4">
          <p className="text-center text-green-600">{updateMessage}</p>
        </div>
      )}
    </div>
  );
}
