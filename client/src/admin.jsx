import React, { useEffect, useState } from "react";

export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState("");

  if (!loggedIn) {
    const tryLogin = () => {
      if (password === "M@keM@ney2025!!!") {
        setLoggedIn(true);
      } else {
        alert("Wrong password!");
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded shadow-md w-80 text-center">
          <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border rounded p-2 w-full mb-4"
          />
          <button
            onClick={tryLogin}
            className="bg-purple-600 text-white px-4 py-2 rounded w-full hover:bg-purple-700"
          >
            Login
          </button>
        </div>
      </div>
    );
  }
  const [offers, setOffers] = useState([]);
  const [sales, setSales] = useState([]);
  const [counteroffers, setCounteroffers] = useState([]);
  const [tab, setTab] = useState("offers");
  const [replyingTo, setReplyingTo] = useState(null);
  const [counterAmount, setCounterAmount] = useState("");
  const [counterMessage, setCounterMessage] = useState("");

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

  const sendCounteroffer = async (offer) => {
    if (!counterAmount) {
      alert("Please enter a counteroffer amount.");
      return;
    }

    await fetch("/api/logCounteroffer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: offer.title,
        amount: counterAmount,
        message: counterMessage,
        timestamp: new Date().toISOString(),
      }),
    });

    alert(`Counteroffer of $${counterAmount} sent for ${offer.title}!`);
    setCounterAmount("");
    setCounterMessage("");
    setReplyingTo(null);
  };

  const renderTable = (data, type) => {
    if (!data.length)
      return <p className="text-center py-10 text-gray-500">No {type} yet.</p>;

    if (type === "offers") {
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border-collapse">
            <thead className="bg-gray-200 text-left">
              <tr>
                <th className="p-3 border-b">Poster</th>
                <th className="p-3 border-b">Offer ($)</th>
                <th className="p-3 border-b">Name</th>
                <th className="p-3 border-b">Email</th>
                <th className="p-3 border-b">Note</th>
                <th className="p-3 border-b">Time</th>
                <th className="p-3 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="odd:bg-gray-50 even:bg-white">
                  <td className="p-3 border-b">{row.title}</td>
                  <td className="p-3 border-b">${row.offer}</td>
                  <td className="p-3 border-b">{row.name || "—"}</td>
                  <td className="p-3 border-b">{row.email || "—"}</td>
                  <td className="p-3 border-b">{row.note || "—"}</td>
                  <td className="p-3 border-b">
                    {new Date(row.timestamp).toLocaleString()}
                  </td>
                  <td className="p-3 border-b text-center">
                    <button
                      onClick={() => setReplyingTo(row)}
                      className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
                    >
                      Counteroffer ↩️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {replyingTo && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-96 shadow-lg relative">
                <button
                  onClick={() => setReplyingTo(null)}
                  className="absolute top-2 right-3 text-gray-500 hover:text-black text-lg"
                >
                  ✕
                </button>
                <h3 className="text-xl font-bold mb-2">
                  Counteroffer for {replyingTo.title}
                </h3>
                <input
                  type="number"
                  placeholder="Counteroffer amount ($)"
                  value={counterAmount}
                  onChange={(e) => setCounterAmount(e.target.value)}
                  className="border p-2 rounded w-full mb-3"
                />
                <textarea
                  placeholder="Optional message"
                  value={counterMessage}
                  onChange={(e) => setCounterMessage(e.target.value)}
                  className="border p-2 rounded w-full mb-3"
                  rows={3}
                />
                <button
                  onClick={() => sendCounteroffer(replyingTo)}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full"
                >
                  Submit Counteroffer ✅
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Counteroffers or sales view
    const columns = {
      counteroffers: ["Poster", "Counter ($)", "Message", "Time"],
      sales: ["Poster", "Price ($)", "Time"],
    };
    const keys = {
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

      {/* Back to Store Button */}
      <div className="text-center mt-8">
        <a
          href="/"
          className="inline-block bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
        >
          ← Back to Store
        </a>
      </div>
    </div>
  );
}
