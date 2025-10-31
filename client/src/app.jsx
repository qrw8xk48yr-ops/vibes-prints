// client/src/app.jsx
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

  // Offer modal state
  const [showOffer, setShowOffer] = useState(false);
  const [offerPoster, setOfferPoster] = useState(null);
  const [offerForm, setOfferForm] = useState({
    name: "",
    email: "",
    amount: "",
    note: "",
  });

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
    try {
      await fetch("/api/logSale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: poster.title,
          price: poster.price,
          note: "PayPal",
        }),
      });
    } catch {}
  };

  const handleRestock = (id) =>
    setInventory((prev) => ({ ...prev, [id]: "available" }));

  const openOffer = (poster) => {
    setOfferPoster(poster);
    setShowOffer(true);
  };

  const closeOffer = () => {
    setShowOffer(false);
    setOfferPoster(null);
    setOfferForm({ name: "", email: "", amount: "", note: "" });
  };

  const submitOffer = async (e) => {
    e.preventDefault(); // ✅ stops page refresh
    if (!offerPoster) return;

    const offer = parseFloat(offerForm.amount);
    if (Number.isNaN(offer) || offer <= 0) {
      alert("Enter a valid offer amount.");
      return;
    }

    try {
      const res = await fetch("/api/logOffer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: offerPoster.title,
          offer,
          name: offerForm.name,
          email: offerForm.email,
          note: offerForm.note,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        alert(`Offer of $${offer.toFixed(2)} submitted for ${offerPoster.title}`);
        closeOffer();
      } else {
        alert("Server error. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error submitting offer.");
    }
  };

  return (
    <div className="page">
      <header className="header">
        <div className="brand">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/8/80/Tie-dye_3.jpg"
            alt="swirl"
            className="brand-img"
          />
          <h1>Vibes & Prints</h1>
        </div>
        <p className="tagline">Where the art keeps on jamming 🎸</p>
      </header>

      <div className="grid">
        {posters.map((p) => {
          const sold = inventory[p.id] === "sold";
          return (
            <div key={p.id} className={`card ${sold ? "sold" : ""}`}>
              <img src={p.image} alt={p.title} className="card-img" />
              <h2 className="card-title">{p.title}</h2>
              <p className="card-price">${p.price}</p>

              {sold ? (
                <div>
                  <p className="sold-text">Sold Out 🎟️</p>
                  {adminMode && (
                    <button className="btn green" onClick={() => handleRestock(p.id)}>
                      Restock
                    </button>
                  )}
                </div>
              ) : (
                <div className="row">
                  <button className="btn" onClick={() => handleBuy(p)}>
                    Buy Now
                  </button>
                  <button className="btn outline" onClick={() => openOffer(p)}>
                    Make an Offer
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Admin toggle */}
      <div className="admin">
        <label className="admin-label">
          <input
            type="checkbox"
            checked={adminMode}
            onChange={(e) => setAdminMode(e.target.checked)}
          />
          <span>Admin Mode</span>
        </label>
      </div>

      {/* Offer Modal */}
      {showOffer && (
        <div className="modal-backdrop" onClick={closeOffer}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()} // ✅ keeps clicks inside modal from closing it
          >
            <h3>Make an Offer</h3>
            <p className="muted">{offerPoster?.title}</p>

            <form onSubmit={submitOffer} className="form">
              <label>
                Your Name (optional)
                <input
                  type="text"
                  value={offerForm.name}
                  onChange={(e) =>
                    setOfferForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </label>

              <label>
                Email (optional)
                <input
                  type="email"
                  value={offerForm.email}
                  onChange={(e) =>
                    setOfferForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </label>

              <label>
                Offer Amount (USD) *
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g., 40"
                  value={offerForm.amount}
                  onChange={(e) =>
                    setOfferForm((f) => ({ ...f, amount: e.target.value }))
                  }
                  required
                />
              </label>

              <label>
                Note (optional)
                <textarea
                  rows="3"
                  value={offerForm.note}
                  onChange={(e) =>
                    setOfferForm((f) => ({ ...f, note: e.target.value }))
                  }
                />
              </label>

              <div className="row end">
                <button
                  type="button"
                  className="btn outline"
                  onClick={closeOffer}
                >
                  Cancel
                </button>
                <button type="submit" className="btn">
                  Submit Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
