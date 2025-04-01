"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function PanelPageContent() {
  // Stany dla sesji i danych użytkownika
  const [session, setSession] = useState(null);
  const [userRecordChecked, setUserRecordChecked] = useState(false);
  const [userData, setUserData] = useState(null);
  const [updateMessage, setUpdateMessage] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newLogin, setNewLogin] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Stany dla panelu administratora - Users
  const [allUsers, setAllUsers] = useState([]);
  const [adminEditRows, setAdminEditRows] = useState({});
  const [sortColumn, setSortColumn] = useState("login");
  const [sortOrder, setSortOrder] = useState("asc");
  const [adminMenuOption, setAdminMenuOption] = useState("users");

  // Stany dla panelu administratora - Gracz
  const [gracze, setGracze] = useState([]);
  const [editGraczRows, setEditGraczRows] = useState({});
  const [graczSortColumn, setGraczSortColumn] = useState("nazwisko");
  const [graczSortOrder, setGraczSortOrder] = useState("asc");
  const [isEditingGracze, setIsEditingGracze] = useState(false);
  const [editedGracze, setEditedGracze] = useState([]);
  const [newGraczMessage, setNewGraczMessage] = useState("");
  const wojewodztwa = [
    "Dolnośląskie",
    "Kujawsko-pomorskie",
    "Lubelskie",
    "Lubuskie",
    "Łódzkie",
    "Małopolskie",
    "Mazowieckie",
    "Opolskie",
    "Podkarpackie",
    "Podlaskie",
    "Pomorskie",
    "Śląskie",
    "Świętokrzyskie",
    "Warmińsko-mazurskie",
    "Zachodniopomorskie"
  ];

  const router = useRouter();
  const searchParams = useSearchParams();

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
        setNewEmail(data.email);
        setNewLogin(data.login);
      }
    };
    fetchUserData();
  }, [session, userRecordChecked]);

  // Dla admina: pobierz dane wszystkich użytkowników
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

  // Dla admina: pobierz dane z tabeli "gracz"
  useEffect(() => {
    const fetchGracze = async () => {
      if (!userData || userData.ranga !== "admin") return;
      const { data, error } = await supabase.from("gracz").select("*");
      if (error) {
        console.error("Błąd pobierania graczy:", error);
      } else {
        setGracze(data);
      }
    };
    fetchGracze();
  }, [userData]);

  // Sortowanie tabeli Users
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  const sortedUsers = [...allUsers].sort((a, b) => {
    const valA = a[sortColumn] ? a[sortColumn].toString().toLowerCase() : "";
    const valB = b[sortColumn] ? b[sortColumn].toString().toLowerCase() : "";
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Sortowanie tabeli Gracz
  const handleGraczSort = (column) => {
    if (graczSortColumn === column) {
      setGraczSortOrder(graczSortOrder === "asc" ? "desc" : "asc");
    } else {
      setGraczSortColumn(column);
      setGraczSortOrder("asc");
    }
  };

  const sortedGracze = [...gracze].sort((a, b) => {
    const valA = a[graczSortColumn] ? a[graczSortColumn].toString().toLowerCase() : "";
    const valB = b[graczSortColumn] ? b[graczSortColumn].toString().toLowerCase() : "";
    return graczSortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
  });

  // Funkcja aktualizująca dane użytkownika (panel użytkownika)
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setUpdateMessage("");
    if (newEmail !== userData.email) {
      const res = await fetch(`/api/check-email?email=${encodeURIComponent(newEmail)}`);
      const result = await res.json();
      if (result.exists) {
        setUpdateMessage("Podany email jest już w użyciu!");
        return;
      }
    }
    if (newLogin !== userData.login) {
      const res2 = await fetch(`/api/check-login?login=${encodeURIComponent(newLogin)}`);
      const result2 = await res2.json();
      if (result2.exists) {
        setUpdateMessage("Podany login jest już zajęty!");
        return;
      }
    }
    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email: userData.email,
      password: confirmPassword,
    });
    if (reauthError) {
      setUpdateMessage("Potwierdzenie hasłem nie powiodło się: " + reauthError.message);
      return;
    }
    if (newEmail !== userData.email) {
      const { error: updateAuthError } = await supabase.auth.updateUser({
        email: newEmail,
      });
      if (updateAuthError) {
        setUpdateMessage("Błąd aktualizacji email w auth: " + updateAuthError.message);
        return;
      }
    }
    if (newLogin !== userData.login) {
      const { error: updateMetaError } = await supabase.auth.updateUser({
        data: { display_name: newLogin },
      });
      if (updateMetaError) {
        setUpdateMessage("Błąd aktualizacji display_name: " + updateMetaError.message);
        return;
      }
    }
    const { error } = await supabase
      .from("users")
      .update({ email: newEmail, login: newLogin })
      .eq("id", session.user.id);
    if (error) {
      setUpdateMessage("Błąd aktualizacji danych: " + error.message);
    } else {
      setUpdateMessage("Dane zaktualizowane!");
      setEditMode(false);
      setConfirmPassword("");
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();
      setUserData(data);
    }
  };

  // Admin update for Users table row
  const handleAdminRowEdit = async (userId) => {
    const newEmailValue = adminEditRows[userId]?.editedEmail;
    const newLoginValue = adminEditRows[userId]?.editedLogin;
    if (!newEmailValue || !newLoginValue) return;
    const { error } = await supabase
      .from("users")
      .update({ email: newEmailValue, login: newLoginValue })
      .eq("id", userId);
    if (error) {
      setUpdateMessage(error.message);
    } else {
      setUpdateMessage("Dane użytkownika zaktualizowane!");
      setAdminEditRows((prev) => ({
        ...prev,
        [userId]: { editing: false, editedEmail: newEmailValue, editedLogin: newLoginValue },
      }));
      const { data } = await supabase.from("users").select("*");
      setAllUsers(data);
    }
  };

  // Admin update for Gracz table row
  const handleGraczSave = async (graczId) => {
    const edited = editGraczRows[graczId];
    if (!edited) return;
    const { error } = await supabase.from("gracz").update(edited).eq("id", graczId);
    if (error) {
      setUpdateMessage("Błąd aktualizacji gracza: " + error.message);
    } else {
      setUpdateMessage("Gracz zaktualizowany!");
      setEditGraczRows((prev) => ({ ...prev, [graczId]: { ...prev[graczId], editing: false } }));
      const { data } = await supabase.from("gracz").select("*");
      setGracze(data);
    }
  };

  // Admin add new Gracz record
  const handleAddGracz = async (e) => {
    e.preventDefault();
    setNewGraczMessage("");
    if (!newGraczImie || !newGraczNazwisko) {
      setNewGraczMessage("Imię i nazwisko są obowiązkowe!");
      return;
    }
    const emailToUse = newGraczEmail ? newGraczEmail : "unknown@example.com";
    const { error } = await supabase.from("gracz").insert({
      email: emailToUse,
      imie: newGraczImie,
      nazwisko: newGraczNazwisko,
    });
    if (error) {
      setNewGraczMessage("Błąd dodawania rekordu: " + error.message);
    } else {
      setNewGraczMessage("Rekord został dodany!");
      setNewGraczEmail("");
      setNewGraczImie("");
      setNewGraczNazwisko("");
      const { data } = await supabase.from("gracz").select("*");
      setGracze(data);
    }
  };

  // Admin Gracz - toggle edit mode for entire table
  const handleToggleGraczEdit = () => {
    setIsEditingGracze(!isEditingGracze);
    if (!isEditingGracze) {
      // Initialize editedGracze with a copy of current gracze data
      setEditedGracze(gracze.map((gracz) => ({ ...gracz })));
    }
  };

  // Admin Gracz - save all edited rows
  const handleSaveGraczeEdits = async () => {
    for (let edited of editedGracze) {
      const { error } = await supabase.from("gracz").update(edited).eq("id", edited.id);
      if (error) {
        setUpdateMessage("Błąd przy aktualizacji rekordu o ID " + edited.id + ": " + error.message);
        return;
      }
    }
    const { data, error } = await supabase.from("gracz").select("*");
    if (!error) {
      setGracze(data);
    } else {
      setUpdateMessage("Błąd przy odświeżaniu danych: " + error.message);
    }
    setIsEditingGracze(false);
  };

  if (!session || !userRecordChecked || !userData) {
    return (
      <div className="flex items-center justify-center bg-gray-100 min-h-screen">
        <p>Ładowanie...</p>
      </div>
    );
  }

  return (
    <div className="p-4 text-sm bg-gray-100 min-h-screen">
      {/* Panel użytkownika */}
      <div className="w-[800px] mx-auto p-6 rounded-lg shadow-md mb-8 bg-white">
        <h1 className="text-2xl font-bold mb-4">Panel użytkownika</h1>
        {editMode ? (
          <form onSubmit={handleUpdateUser} className="space-y-2">
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

      {/* Panel administratora */}
      {userData.ranga === "admin" && (
        <div className="w-[800px] mx-auto p-6 rounded-lg shadow-md mb-8 bg-white">
          <h2 className="text-xl font-bold mb-4">Panel administratora</h2>
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setAdminMenuOption("users")}
              className={`px-4 py-2 rounded ${adminMenuOption === "users" ? "bg-blue-600 text-white" : "bg-gray-200 text-black"}`}
            >
              Users
            </button>
            <button
              onClick={() => setAdminMenuOption("gracz")}
              className={`px-4 py-2 rounded ${adminMenuOption === "gracz" ? "bg-blue-600 text-white" : "bg-gray-200 text-black"}`}
            >
              Gracz
            </button>
          </div>

          {adminMenuOption === "users" && (
            <div>
              <h3 className="font-bold mb-2">Lista wszystkich użytkowników</h3>
              {allUsers.length === 0 ? (
                <p>Brak danych do wyświetlenia.</p>
              ) : (
                <table className="w-full table-auto border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-2 cursor-pointer" onClick={() => handleSort("id")}>
                        ID {sortColumn === "id" && (sortOrder === "asc" ? "▲" : "▼")}
                      </th>
                      <th className="border p-2 cursor-pointer" onClick={() => handleSort("email")}>
                        Email {sortColumn === "email" && (sortOrder === "asc" ? "▲" : "▼")}
                      </th>
                      <th className="border p-2 cursor-pointer" onClick={() => handleSort("login")}>
                        Login {sortColumn === "login" && (sortOrder === "asc" ? "▲" : "▼")}
                      </th>
                      <th className="border p-2 cursor-pointer" onClick={() => handleSort("ranga")}>
                        Ranga {sortColumn === "ranga" && (sortOrder === "asc" ? "▲" : "▼")}
                      </th>
                      <th className="border p-2">Akcje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedUsers.map((user) => {
                      const isEditing = adminEditRows[user.id]?.editing;
                      return (
                        <tr key={user.id}>
                          <td className="border p-2">{user.id}</td>
                          <td className="border p-2">
                            {isEditing ? (
                              <input
                                type="text"
                                value={adminEditRows[user.id]?.editedEmail || user.email}
                                onChange={(e) =>
                                  setAdminEditRows((prev) => ({
                                    ...prev,
                                    [user.id]: {
                                      ...prev[user.id],
                                      editing: true,
                                      editedEmail: e.target.value,
                                      editedLogin: prev[user.id]?.editedLogin || user.login,
                                    },
                                  }))
                                }
                                className="border p-1 rounded w-32 text-sm"
                              />
                            ) : (
                              user.email
                            )}
                          </td>
                          <td className="border p-2">
                            {isEditing ? (
                              <input
                                type="text"
                                value={adminEditRows[user.id]?.editedLogin || user.login}
                                onChange={(e) =>
                                  setAdminEditRows((prev) => ({
                                    ...prev,
                                    [user.id]: {
                                      ...prev[user.id],
                                      editing: true,
                                      editedLogin: e.target.value,
                                      editedEmail: prev[user.id]?.editedEmail || user.email,
                                    },
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
                                      [user.id]: { editing: false, editedEmail: user.email, editedLogin: user.login },
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
                                    [user.id]: { editing: true, editedEmail: user.email, editedLogin: user.login },
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

          {adminMenuOption === "gracz" && (
            <div>
              <h3 className="font-bold my-4">Tabela Gracz</h3>
              <button
                className="mb-4 bg-blue-500 text-white px-4 py-2 rounded"
                onClick={handleToggleGraczEdit}
              >
                {isEditingGracze ? "Zakończ edycję" : "Edytuj"}
              </button>
              {isEditingGracze && (
                <button
                  className="mb-4 ml-4 bg-green-500 text-white px-4 py-2 rounded"
                  onClick={handleSaveGraczeEdits}
                >
                  Zapisz zmiany
                </button>
              )}
              <table className="w-full table-auto border-collapse text-xs">
                <thead>
                  <tr>
                    {[
                      "id",
                      "uid",
                      "email",
                      "imie",
                      "nazwisko",
                      "miasto",
                      "wojewodztwo",
                      "rok_urodzenia",
                      "ranking",
                    ].map((col) => (
                      <th
                        key={col}
                        className="border p-1 cursor-pointer"
                        onClick={() => handleGraczSort(col)}
                      >
                        {col} {graczSortColumn === col && (graczSortOrder === "asc" ? "▲" : "▼")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(isEditingGracze ? editedGracze : sortedGracze).map((gracz, index) => (
                    <tr key={gracz.id}>
                      {[
                        "id",
                        "uid",
                        "email",
                        "imie",
                        "nazwisko",
                        "miasto",
                        "wojewodztwo",
                        "rok_urodzenia",
                        "ranking",
                      ].map((field) => (
                        <td key={field} className="border p-1">
                          {isEditingGracze ? (
                            field === "wojewodztwo" ? (
                              <select
                                value={editedGracze[index][field] || ""}
                                onChange={(e) => {
                                  const newValue = e.target.value;
                                  setEditedGracze((prev) => {
                                    const updated = [...prev];
                                    updated[index] = { ...updated[index], [field]: newValue };
                                    return updated;
                                  });
                                }}
                                className="border px-1 rounded w-full"
                              >
                                <option value="">(pusty)</option>
                                {wojewodztwa.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="text"
                                value={editedGracze[index][field] || ""}
                                onChange={(e) => {
                                  const newValue = e.target.value;
                                  setEditedGracze((prev) => {
                                    const updated = [...prev];
                                    updated[index] = { ...updated[index], [field]: newValue };
                                    return updated;
                                  });
                                }}
                                className="border px-1 rounded w-full"
                              />
                            )
                          ) : (
                            gracz[field] || ""
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {updateMessage && (
        <div className="w-[800px] mx-auto mt-4">
          <p className="text-center text-green-600">{updateMessage}</p>
        </div>
      )}
    </div>
  );
}
