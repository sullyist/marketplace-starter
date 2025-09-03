// pages/post-ad.js
type="number"
value={engineSize}
onChange={(e) => setEngineSize(e.target.value)}
className="w-full border px-3 py-2 rounded"
required
/>
</div>
<div>
<label className="block text-sm font-medium">Bike Type</label>
<select
value={bikeType}
onChange={(e) => setBikeType(e.target.value)}
className="w-full border px-3 py-2 rounded"
required
>
<option value="">Select type</option>
<option value="Sport">Sport</option>
<option value="Cruiser">Cruiser</option>
<option value="Touring">Touring</option>
<option value="Adventure">Adventure</option>
<option value="Naked">Naked</option>
<option value="Scooter">Scooter</option>
<option value="Off-road">Off-road</option>
<option value="Other">Other</option>
</select>
</div>
<div>
<label className="block text-sm font-medium">Location</label>
<input
type="text"
value={location}
onChange={(e) => setLocation(e.target.value)}
className="w-full border px-3 py-2 rounded"
required
/>
</div>
<div>
<label className="block text-sm font-medium">Description</label>
<textarea
value={description}
onChange={(e) => setDescription(e.target.value)}
className="w-full border px-3 py-2 rounded"
required
/>
</div>
<div>
<label className="block text-sm font-medium">Price (€)</label>
<input
type="number"
step="0.01"
value={price}
onChange={(e) => setPrice(e.target.value)}
className="w-full border px-3 py-2 rounded"
required
/>
</div>
<div>
<label className="block text-sm font-medium">Image</label>
<input
type="file"
accept="image/*"
onChange={(e) => setImage(e.target.files[0])}
className="w-full border px-3 py-2 rounded"
required
/>
</div>
<button
type="submit"
className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
>
Post Ad
</button>
</form>
</div>
);
}