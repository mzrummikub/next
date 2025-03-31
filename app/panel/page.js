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
  const [updateMessage, setUpdateMessage] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newLogin, setNewLogin] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [adminEditRows, setAdminEditRows] = useState({});
  const router = useRouter();

  // Pobierz sesję
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

  // Sprawdź lub wstaw rekord w tabeli "users"
  useEffect(() => {
    const checkOrInsertUserRecord = async () => {
      if (!session || userRecordChecked) return;
      const userId = session.user.id;
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();
      if (error || !data) {
        // Ustaw domyślny login na podstawie display_name lub części emaila
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

  // Pobierz dane użytkownika
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
        setNewEmail(data.email);
        setNewLogin(data.login);
      }
    };
    fetchUserData();
  }, [session, userRecordChecked]);

  // Pobierz dane wszystkich użytkowników dla admina
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

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdateMessage("");
  
    const res = await fetch("/api/update-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: newEmail,
        login: newLogin,
        password: confirmPassword,
        userId: session.user.id,
      }),
    });
  
    const result = await res.json();
  
    if (!res.ok) {
      setUpdateMessage("Błąd: " + (result.error || "Nie udało się zaktualizować danych."));
      return;
    }
  
    setUpdateMessage("Dane zostały zaktualizowane!");
    setEditMode(false);
    setConfirmPassword("");
  
    // Odśwież dane
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", session.user.id)
      .single();
    setUserData(data);
  };
  
  

  // Funkcja aktualizująca dane w wierszu tabeli dla admina (bez potwierdzania hasłem)
  const handleAdminRowEdit = async (userId) => {
    const newLoginValue = adminEditRows[userId]?.editedLogin;
    if (!newLoginValue) return;
    const { error } = await supabase
      .from("users")
      .update({ login: newLoginValue })
      .eq("id", userId);
    if (error) {
      setUpdateMessage(error.message);
    } else {
      setUpdateMessage("Dane użytkownika zaktualizowane!");
      setAdminEditRows((prev) => ({
        ...prev,
        [userId]: { editing: false, editedLogin: newLoginValue },
      }));
      const { data } = await supabase.from("users").select("*");
      setAllUsers(data);
    }
  };

  if (!session || !userRecordChecked || !userData) {
    return (
      <div className="flex items-center justify-center">
        <p>Ładowanie...</p>
      </div>
    );
  }

  return (
    <div className="p-4 text-sm">
      {/* Panel użytkownika */}
      <div className="max-w-4xl mx-auto p-6 rounded-lg shadow-md mb-8">
        <h1 className="text-2xl font-bold mb-4">Panel użytkownika</h1>
        {editMode ? (
          <form onSubmit={handleUpdate} className="space-y-2">
            <div>
              <strong>Email:</strong>{" "}
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="border p-1 rounded w-60"
                required
              />
            </div>
            <div>
              <strong>Login:</strong>{" "}
              <input
                type="text"
                value={newLogin}
                onChange={(e) => setNewLogin(e.target.value)}
                className="border p-1 rounded w-60"
                required
              />
            </div>
            <div>
              <strong>Potwierdź hasło:</strong>{" "}
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border p-1 rounded w-60"
                required
              />
            </div>
            <button type="submit" className="bg-green-500 text-white px-2 py-1 rounded text-xs">
              Zapisz zmiany
            </button>
            <button
              type="button"
              onClick={() => {
                setEditMode(false);
                setNewEmail(userData.email);
                setNewLogin(userData.login);
                setConfirmPassword("");
              }}
              className="bg-red-500 text-white px-2 py-1 rounded text-xs ml-2"
            >
              Anuluj
            </button>
          </form>
        ) : (
          <div className="space-y-2">
            <p>
              <strong>Email:</strong> {userData.email}
            </p>
            <p>
              <strong>Login:</strong> {userData.login}
            </p>
            <p>
              <strong>Ranga:</strong> {userData.ranga}
            </p>
            
            <button
              onClick={() => setEditMode(true)}
              className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
            >
              Aktualizuj dane
            </button>
          </div>
        )}
      </div>

      {/* Panel administratora: tabela wszystkich użytkowników */}
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
