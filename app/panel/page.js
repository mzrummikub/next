"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function PanelPage() {
  const [session, setSession] = useState(null);
  const [userData, setUserData] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editBasic, setEditBasic] = useState(false);
  const [editedLogin, setEditedLogin] = useState("");
  const [adminEditRows, setAdminEditRows] = useState({});
  const [updateMessage, setUpdateMessage] = useState("");
  const router = useRouter();

  // Pobieramy sesję i dane użytkownika
  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();
      if (!currentSession) {
        router.push("/login");
      } else {
        setSession(currentSession);
        fetchUserData(currentSession.user.id);
      }
    };
    getSession();
  }, [router]);

  // Pobieramy dane aktualnego użytkownika z tabeli "users"
  const fetchUserData = async (userId) => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();
    if (error) {
      console.error("Błąd pobierania danych użytkownika:", error);
    } else {
      setUserData(data);
      setEditedLogin(data.login);
      // Jeśli użytkownik to admin, pobierz wszystkich użytkowników
      if (data.ranga === "admin") {
        fetchAllUsers();
      }
    }
    setLoading(false);
  };

  // Pobieramy wszystkie rekordy z tabeli "users" (dla admina)
  const fetchAllUsers = async () => {
    const { data, error } = await supabase.from("users").select("*");
    if (error) {
      console.error("Błąd pobierania wszystkich użytkowników:", error);
    } else {
      setAllUsers(data);
    }
  };

  // Aktualizacja podstawowych danych użytkownika (pole login)
  const handleBasicUpdate = async (e) => {
    e.preventDefault();
    if (!editedLogin) return;
    const { data, error } = await supabase
      .from("users")
      .update({ login: editedLogin })
      .eq("id", session.user.id);
    if (error) {
      setUpdateMessage(error.message);
    } else {
      setUpdateMessage("Dane zaktualizowane!");
      setEditBasic(false);
      fetchUserData(session.user.id);
    }
  };

  // Aktualizacja danych w wierszu tabeli (dla admina)
  const handleAdminRowEdit = async (userId) => {
    const newLogin = adminEditRows[userId]?.editedLogin;
    if (!newLogin) return;
    const { data, error } = await supabase
      .from("users")
      .update({ login: newLogin })
      .eq("id", userId);
    if (error) {
      setUpdateMessage(error.message);
    } else {
      setUpdateMessage("Dane użytkownika zaktualizowane!");
      setAdminEditRows((prev) => ({ ...prev, [userId]: { editing: false, editedLogin: newLogin } }));
      fetchAllUsers();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <p>Ładowanie...</p>
      </div>
    );
  }

  return (
    <div className="p-4 text-sm">
      {/* Panel standardowy */}
      <div className="max-w-4xl mx-auto p-6 rounded-lg shadow-md mb-8">
        <h1 className="text-2xl font-bold mb-4">Panel użytkownika</h1>
        {userData ? (
          <div className="space-y-2">
            <p>
              <span className="font-semibold">Email:</span> {userData.email}
            </p>
            <p>
              <span className="font-semibold">Login:</span>{" "}
              {editBasic ? (
                <form onSubmit={handleBasicUpdate} className="inline">
                  <input
                    type="text"
                    value={editedLogin}
                    onChange={(e) => setEditedLogin(e.target.value)}
                    className="border p-1 rounded w-40 text-sm"
                  />
                  <button type="submit" className="ml-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                    Zapisz
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditBasic(false);
                      setEditedLogin(userData.login);
                    }}
                    className="ml-2 bg-red-500 text-white px-2 py-1 rounded text-xs"
                  >
                    Anuluj
                  </button>
                </form>
              ) : (
                <>
                  {userData.login}{" "}
                  <button
                    onClick={() => setEditBasic(true)}
                    className="bg-blue-500 text-white px-2 py-1 rounded text-xs ml-2"
                  >
                    Edytuj
                  </button>
                </>
              )}
            </p>
            <p>
              <span className="font-semibold">Ranga:</span> {userData.ranga}
            </p>
            <p>
              <span className="font-semibold">Data utworzenia:</span>{" "}
              {new Date(userData.created_at).toLocaleString()}
            </p>
            <p>
              <span className="font-semibold">Ostatnie logowanie:</span>{" "}
              {userData.last_login ? new Date(userData.last_login).toLocaleString() : "Brak"}
            </p>
          </div>
        ) : (
          <p>Brak danych użytkownika.</p>
        )}
      </div>

      {/* Panel admina */}
      {userData && userData.ranga === "admin" && (
        <div className="max-w-4xl mx-auto p-6 rounded-lg shadow-md">
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
                            className="border p-1 rounded w-32 text-sm"
                          />
                        ) : (
                          user.login
                        )}
                      </td>
                      <td className="border p-2">{user.ranga}</td>
                      <td className="border p-2">{new Date(user.created_at).toLocaleString()}</td>
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
