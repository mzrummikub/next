"use client";

import { useState, useEffect } from "react";

export default function AdminPanel() {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [tableData, setTableData] = useState([]);
  const [editingRow, setEditingRow] = useState(null);
  const [editData, setEditData] = useState({});
  const [errorMessage, setErrorMessage] = useState("");

  const fetchTables = async () => {
    try {
      const res = await fetch("/api/admin/tables");
      const json = await res.json();
      if (json.error) {
        setErrorMessage(json.error);
      } else {
        setTables(json.tables);
        if (json.tables.length > 0) {
          setSelectedTable(json.tables[0]);
        }
      }
    } catch (err) {
      setErrorMessage("Błąd pobierania tabel: " + err.message);
    }
  };

  const fetchTableData = async (table) => {
    try {
      const res = await fetch(`/api/admin/explore?table=${encodeURIComponent(table)}`);
      const json = await res.json();
      if (json.error) {
        setErrorMessage(json.error);
      } else {
        setTableData(json.data || []);
      }
    } catch (err) {
      setErrorMessage("Błąd pobierania danych: " + err.message);
    }
  };

  const handleEditClick = (row) => {
    setEditingRow(row);
    setEditData({ ...row });
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch("/api/admin/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table: selectedTable,
          data: editData,
          idField: Object.keys(editingRow)[0],
        }),
      });

      const json = await res.json();
      if (json.error) {
        setErrorMessage(json.error);
      } else {
        setEditingRow(null);
        fetchTableData(selectedTable);
      }
    } catch (err) {
      setErrorMessage("Błąd połączenia: " + err.message);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      fetchTableData(selectedTable);
    }
  }, [selectedTable]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Przegląd wszystkich tabel</h1>

      {errorMessage && (
        <div className="mb-4 p-3 border-red-300 text-red-700 rounded">
          {errorMessage}
        </div>
      )}

      <div className="mb-4 flex items-center gap-4">
        <label className="text-lg font-medium">Tabela:</label>
        <select
          value={selectedTable}
          onChange={(e) => setSelectedTable(e.target.value)}
          className="border p-2 rounded"
        >
          {tables.map((table) => (
            <option key={table} value={table}>
              {table}
            </option>
          ))}
        </select>
      </div>

      {tableData.length > 0 ? (
        <div className="overflow-auto border rounded shadow">
          <table className="min-w-full text-sm text-left">
            <thead className="">
              <tr>
                {Object.keys(tableData[0]).map((key) => (
                  <th key={key} className="px-4 py-2 font-semibold border-b">
                    {key}
                  </th>
                ))}
                <th className="px-4 py-2 font-semibold border-b">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, idx) => (
                <tr key={idx} className="hover:bg-green">
                  {Object.entries(row).map(([key, value]) => (
                    <td key={key} className="px-4 py-2 border-b">
                      {editingRow === row ? (
                        <input
                          className="w-full px-2 py-1 border rounded"
                          value={editData[key] ?? ""}
                          onChange={(e) =>
                            setEditData({ ...editData, [key]: e.target.value })
                          }
                        />
                      ) : (
                        String(value)
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-2 border-b">
                    {editingRow === row ? (
                      <div className="flex gap-2">
                        <button onClick={handleUpdate} className="text-green-600 font-semibold">
                          Zapisz
                        </button>
                        <button onClick={() => setEditingRow(null)} className="text-gray-500">
                          Anuluj
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEditClick(row)}
                        className="text-blue-600"
                      >
                        Edytuj
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600">Brak danych do wyświetlenia.</p>
      )}
    </div>
  );
}
