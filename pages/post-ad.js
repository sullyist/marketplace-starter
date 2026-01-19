import { useState } from "react";

// pages/post-ad.js
// Form for creating a motorcycle listing

const BIKE_TYPES = [
  "CRUISER",
  "SPORT",
  "ADVENTURE",
  "NAKED",
  "TOURER",
  "DIRT",
  "SCOOTER",
  "CAFE_RACER",
];

export default function PostAd() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [engineSize, setEngineSize] = useState("");
  const [bikeType, setBikeType] = useState("");
  const [location, setLocation] = useState("");
  const [year, setYear] = useState("");
  const [mileage, setMileage] = useState("");
  const [description, setDescription] = useState("");
  const [imageIds, setImageIds] = useState(""); // comma-separated

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const onSubmit = async (ev) => {
    ev.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      const payload = {
        title,
        price: Number(price),
        engineSize: Number(engineSize),
        bikeType,
        location,
        year: year ? Number(year) : null,
        mileage: mileage ? Number(mileage) : null,
        description,
        imageIds: imageIds
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text());

      setMessage("Listing created ✔");
      setTitle("");
      setPrice("");
      setEngineSize("");
      setBikeType("");
      setLocation("");
      setYear("");
      setMileage("");
      setDescription("");
      setImageIds("");
    } catch (err) {
      setMessage(err.message || "Failed to create listing");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow">
        <h1 className="mb-6 text-2xl font-semibold">Post a Motorcycle Ad</h1>
        {message && <div className="mb-4 text-sm">{message}</div>}

        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded border px-3 py-2"
            required
          />

          <input
            type="number"
            placeholder="Price (€)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded border px-3 py-2"
            required
          />

          <input
            type="number"
            placeholder="Engine Size (cc)"
            value={engineSize}
            onChange={(e) => setEngineSize(e.target.value)}
            className="w-full rounded border px-3 py-2"
            required
          />

          <select
            value={bikeType}
            onChange={(e) => setBikeType(e.target.value)}
            className="w-full rounded border px-3 py-2"
            required
          >
            <option value="" disabled>
              Select type
            </option>
            {BIKE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.replace("_", " ")}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded border px-3 py-2"
            required
          />

          <input
            type="number"
            placeholder="Year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full rounded border px-3 py-2"
          />

          <input
            type="number"
            placeholder="Mileage (km)"
            value={mileage}
            onChange={(e) => setMileage(e.target.value)}
            className="w-full rounded border px-3 py-2"
          />

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded border px-3 py-2"
          />

          <input
            type="text"
            placeholder="Image IDs (comma-separated)"
            value={imageIds}
            onChange={(e) => setImageIds(e.target.value)}
            className="w-full rounded border px-3 py-2"
          />

          <button
            type="submit"
            disabled={submitting}
            className="rounded bg-black px-5 py-2 text-white hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Create Listing"}
          </button>
        </form>
      </div>
    </div>
  );
}
