import React, { useState, useEffect } from "react";
import "./app.css";

export default function App() {
  const posters = [
    { id: 1, title: "Goose – Red Rocks 2025", price: 45,
      image: "https://upload.wikimedia.org/wikipedia/en/7/7d/Red_Rocks_Amphitheatre.jpg" },
    { id: 2, title: "Phish – MSG 2024", price: 50,
      image: "https://upload.wikimedia.org/wikipedia/commons/4/4f/Madison_Square_Garden_%28MSG%29_-_Full_Exterior_-_August_2021.jpg" },
    { id: 3, title: "Dead & Company – The Sphere", price: 55,
      image: "https://upload.wikimedia.org/wikipedia/commons/f/fb/Sphere_exterior_2023.jpg" }
  ];

  const [inventory, setInventory] = useState({});
  const [adminMode, setAdminMode] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("inventory") || "{}");
    setInventory(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("inventory", JSON.stringify(inventory));
  }, [inventory]);

  const handleBuy = async (poster) => {
    const link = `https://paypal.me/mbotaish/${poster.price}?note=${encodeURIComponent(
      poster.title + " Poster"
    )}`;
    window.open(link, "_blank");
    setInventory((prev) => ({ ...prev, [poster.id]: "sold" }));
    await fetch("/api/logSale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: poster.title, price: poster.price })
    });
  };

  const handleRestock = (id) =>
    setInventory((prev) => ({ ...prev, [id]: "available" }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 text-white p-10 text-center">
      <header className="mb-10">
        <div className="flex justify-center items-center mb-4">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/8/80/Tie-dye_3.jpg"
            alt="swirl"
            className="w-16 h-16 rounded-full border-4 border-white mr-3"
          />
          <h1 className="text-4xl font-bold drop-shadow-lg">Vibes & Prints</h1>
        </div>
        <p className="italic text-lg">Where the art keeps on jamming 🎸</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {posters.map((p) => {
          const sold = inventory[p.id] === "sold";
          return (
            <div
              key={p.id}
              className={`bg-white/10 backdrop-blur-lg rounded-xl p-4 ${
                sold ? "opacity-50" : ""
              }`}
            >
              <img
                src={p.image}
                alt={p.title}
                className="w-full h-64 object-cover rounded-xl mb-4"
              />
              <h2 className="text-xl font-semibold mb-2">{p.title}</h2>
              <p className="text-lg mb-4">${p.price}</p>
              {sold ? (
                <div>
                  <p className="font-bold text-red-300 mb-2">Sold Out 🎟️</p>
                  {adminMode && (
                    <button
                      onClick={() => handleRestock(p.id)}
                      className="bg-green-500 px-3 py-1 rounded text-white"
                    >
                      Restock
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => handleBuy(p)}
                  className="bg-white/30 px-4 py-2 rounded hover:bg-white/40 transition"
                >
                  Buy Now
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="fixed bottom-4 left-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={adminMode}
            onChange={(e) => setAdminMode(e.target.checked)}
          />
          <span className="text-sm">Admin Mode</span>
        </label>
      </div>
    </div>
  );
}
