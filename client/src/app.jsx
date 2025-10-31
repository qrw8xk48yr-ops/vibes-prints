import React, { useState, useEffect } from "react";
import "./app.css";

export default function App() {
  const posters = [
    {
      id: 1,
      title: "Goose – Red Rocks 2025",
      price: 45,
      image:
        "https://images.squarespace-cdn.com/content/v1/5456f6b8e4b06ba4b522aa78/1696285839481-76N759TRMN9PXEKTMCN1/REG_Foil_UNCUT.jpg?format=2500w",
    },
    {
      id: 2,
      title: "Phish – MSG 2024",
      price: 50,
      image:
        "https://upload.wikimedia.org/wikipedia/commons/4/4f/Madison_Square_Garden_%28MSG%29_-_Full_Exterior_-_August_2021.jpg",
    },
    {
      id: 3,
      title: "Dead & Company – The Sphere",
      price: 55,
      image:
        "https://upload.wikimedia.org/wikipedia/commons/f/fb/Sphere_exterior_2023.jpg",
    },
  ];

  const [inventory, setInventory] = useState({});
  const [adminMode, setAdminMode] = useState(false);

  // Offer modal states
  const [showOffer, setShowOffer] = useState(false);
  const [offerPoster, setOfferPoster] = useState(null);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerName, setOfferName] = useState("");
  const [offerEmail, setOfferEmail] = useState("");
  const [offerNote, setOfferNote] = useState("");

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
      body: JSON.stringify({ title: poster.title, price: poster.price }),
    });
  };

  const handleRestock = (id) =>
    setInventory((prev) => ({ ...prev, [id]: "available" }));

  const openOfferModal = (poster) => {
    setOfferPoster(poster);
    setShowOffer(true);
  };

  const closeOfferModal = () => {
    setShowOffer(false);
    setOfferPoster(null);
    setOfferAmount("");
    setOfferName("");
    setOfferEmail("");
    setOfferNote("");
  };

  const submitOffer = async (e) => {
    e.preventDefault();
    if (!offerAmount || isNaN(offerAmount) || offerAmount <= 0) {
      alert("Please enter a valid offer amount.");
      return;
    }

    await fetch("/api/logOffer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: offerPoster.title,
        offer: offerAmount,
        name: offerName,
        email: offerEmail,
        note: offerNote,
        timestamp: new Date().toISOString(),
      }),
    });

    alert(`Offer of $${offerAmount} submitted for ${offerPoster.title}!`);
    closeOfferModal();
  };

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

      {/* Posters grid */}
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
                <div className="space-y-2">
                  <button
                    onClick={() => handleBuy(p)}
                    className="bg-white/30 px-4 py-2 rounded hover:bg-white/40 transition w-full"
                  >
                    Buy Now
                  </button>
                  <button
                    onClick={() => openOfferModal(p)}
                    className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300 transition w-full"
                  >
                    Make an Offer 💬
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Admin toggle */}
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

      {/* Offer Modal (popup) */}
      {showOffer && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
          <div className="bg-white text-black rounded-xl p-6 w-96 shadow-lg relative">
            <button
              onClick={closeOfferModal}
              className="absolute top-2 right-3 text-gray-600 text-lg hover:text-black"
            >
              ✕
            </button>
            <h3 className="text-2xl font-bold mb-2 text-center">Make an Offer</h3>
            <p className="text-sm mb-4 text-center">{offerPoster?.title}</p>

            <form onSubmit={submitOffer} className="space-y-3">
              <input
                type="text"
                placeholder="Your Name (optional)"
                value={offerName}
                onChange={(e) => setOfferName(e.target.value)}
                className="w-full border p-2 rounded"
              />
              <input
                type="email"
                placeholder="Your Email (optional)"
                value={offerEmail}
                onChange={(e) => setOfferEmail(e.target.value)}
                className="w-full border p-2 rounded"
              />
              <input
                type="number"
                placeholder="Offer Amount (USD)"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                required
                className="w-full border p-2 rounded"
              />
              <textarea
                placeholder="Add a note (optional)"
                value={offerNote}
                onChange={(e) => setOfferNote(e.target.value)}
                className="w-full border p-2 rounded"
              />

              <div className="flex justify-end space-x-3 mt-4">
                <button
                  type="button"
                  onClick={closeOfferModal}
                  className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                >
                  Submit Offer ✅
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
