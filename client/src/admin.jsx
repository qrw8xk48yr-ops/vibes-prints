import React, { useEffect, useState } from "react";

export default function Admin() {
  const [offers, setOffers] = useState([]);
  const [sales, setSales] = useState([]);
  const [counteroffers, setCounteroffers] = useState([]);
  const [tab, setTab] = useState("offers");

  useEffect(() => {
    Promise.all([
      fetch("/offers.json").then((r) => r.json()).catch(() => []),
      fetch("/sales.json").then((r) => r.json()).catch(() => []),
      fetch("/counteroffers.json").then((r) => r.json()).catch(() => []),
    ]).then(([o, s, c]) => {
      setOffers(o);
      setSales(s);
      setCounteroffers(c);
    });
  }, []);

  const renderTable = (data, type) => {
    if (!data.length)
      return <p className="text-center py-10 text-gray-500">No {type} yet.</p>;

    const columns = {
      offers: ["Poster", "Offer ($)", "Name", "Email", "Note", "Time"],
      counteroffers: ["Poster", "Counter ($)", "Message", "Time"],
      sales: ["Poster", "Price ($)", "Time"],
    };

    const keys = {
      offers: ["title", "offer", "name", "email", "note", "timestamp"],
      counteroffers: ["title", "amount", "message", "timestamp"],
      sales: ["title", "price", "timestamp"],
    };

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border-collapse">
          <thead className="bg-gray-200 text-left">
            <tr>
              {columns[type].map((c) => (
                <th key={c} className="p-3 border-b">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="odd:bg-gray-50 even:bg-white">
                {keys[type].map((k) => (
                  <td key={k} className="p-3 border-b">
                    {k === "timestamp"
                      ? new Date(row[k]).toLocaleString()
                      : row[k] || "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 text-black p-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="flex justify-center space-x-4 mb-8">
        {["offers", "counteroffers", "sales"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded ${
              tab === t
                ? "bg-purple-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Tables */}
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6">
        {tab === "offers" && renderTable(offers, "offers")}
        {tab === "counteroffers" && renderTable(counteroffers, "counteroffers")}
        {tab === "sales" && renderTable(sales, "sales")}
      </div>
    </div>
  );
}
