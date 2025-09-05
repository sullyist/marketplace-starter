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

// pages/api/listings.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { title, price, engineSize, bikeType, location, year, mileage, description, imageIds } = req.body;

  try {
    const listing = await prisma.listing.create({
      data: {
        title,
        price: Number(price),
        engineSize: Number(engineSize),
        bikeType,
        location,
        year: year ? Number(year) : null,
        mileage: mileage ? Number(mileage) : null,
        description,
        imageIds: Array.isArray(imageIds) ? imageIds : [],
      },
    });
    res.status(201).json({ id: listing.id });
  } catch (e) {
    console.error(e);
    res.status(400).send("Failed to create listing");
  }
}


// ==============================
// File: pages/api/listings.js
// ==============================
// API route for creating a motorcycle listing
// - Validates payload
// - Creates the record via Prisma
// - Returns { id }

import { PrismaClient } from "@prisma/client";

// Prevent hot-reload connection leaks in dev
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Optional: lightweight validation without external deps
function toInt(v) {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

const BIKE_TYPES = new Set([
  "CRUISER",
  "SPORT",
  "ADVENTURE",
  "NAKED",
  "TOURER",
  "DIRT",
  "SCOOTER",
  "CAFE_RACER",
]);

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const {
      title,
      price,
      engineSize,
      bikeType,
      location,
      year,
      mileage,
      description,
      imageIds,
    } = req.body || {};

    // Basic validation
    const errors = {};
    if (!title || !String(title).trim()) errors.title = "Title is required";

    const priceNum = toInt(price);
    if (!priceNum || priceNum <= 0) errors.price = "Price must be > 0";

    const engineNum = toInt(engineSize);
    if (!engineNum || engineNum <= 0) errors.engineSize = "Engine size must be > 0";

    if (!bikeType || !BIKE_TYPES.has(bikeType)) errors.bikeType = "Invalid bike type";

    if (!location || !String(location).trim()) errors.location = "Location is required";

    const yearNum = toInt(year);
    if (yearNum && (yearNum < 1950 || yearNum > new Date().getFullYear() + 1)) {
      errors.year = "Year looks invalid";
    }

    const mileageNum = toInt(mileage);
    if (mileageNum !== null && mileageNum < 0) errors.mileage = "Mileage must be ≥ 0";

    if (Object.keys(errors).length) {
      return res.status(400).json({ error: "Validation failed", details: errors });
    }

    const data = {
      title: String(title).trim(),
      description: description ? String(description).trim() : null,
      price: priceNum,
      engineSize: engineNum,
      bikeType,
      location: String(location).trim(),
      year: yearNum,
      mileage: mileageNum,
      imageIds: Array.isArray(imageIds)
        ? imageIds.filter(Boolean).map(String)
        : typeof imageIds === "string" && imageIds.trim()
        ? imageIds.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
    };

    const created = await prisma.listing.create({ data });
    return res.status(201).json({ id: created.id });
  } catch (err) {
    console.error("/api/listings error:", err);
    // Surface Prisma unique/index errors nicely when possible
    const msg = err?.message || "Failed to create listing";
    return res.status(500).json({ error: msg });
  }
}
