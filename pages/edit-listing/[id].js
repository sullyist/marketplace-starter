import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

const BIKE_TYPES = [
  'Sport', 'Cruiser', 'Adventure', 'Touring', 'Standard', 'Dual-Sport',
  'Naked', 'Scooter', 'Cafe Racer', 'Bobber', 'Chopper', 'Streetfighter',
  'Supermoto', 'Electric', 'Sport Touring', 'Sport Tourer', 'Enduro', 'Dirt Bike', 'Classic', 'Moped',
];

export default function EditListing() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();

  const [title, setTitle] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [mileage, setMileage] = useState('');
  const [mileageUnit, setMileageUnit] = useState('km');
  const [condition, setCondition] = useState('');
  const [price, setPrice] = useState('');
  const [engineSize, setEngineSize] = useState('');
  const [power, setPower] = useState('');
  const [bikeType, setBikeType] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!id) return;
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setTitle(data.title || '');
        setMake(data.make || '');
        setModel(data.model || '');
        setYear(data.year || '');
        setMileage(data.mileage || '');
        setMileageUnit(data.mileageUnit || 'km');
        setCondition(data.condition || '');
        setPrice(data.price || '');
        setEngineSize(data.engineSize || '');
        setPower(data.power || '');
        setBikeType(data.bikeType || '');
        setLocation(data.location || '');
        setDescription(data.description || '');
        setImageUrl(data.imageUrl || '');
        setLoading(false);
      })
      .catch(() => {
        setMessage('Failed to load listing.');
        setLoading(false);
      });
  }, [id]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage('Image size must be less than 5MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setMessage('Please upload an image file');
      return;
    }

    setUploading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload image');
      setImageUrl(data.url);
      setMessage('Image uploaded successfully!');
    } catch (err) {
      setMessage(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, make, model, year, mileage, mileageUnit, condition, price, engineSize, power, bikeType, location, description, imageUrl }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update listing');

      setMessage('Listing updated successfully! Redirecting...');
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err) {
      setMessage(err.message || 'Failed to update listing');
      setSubmitting(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You must be logged in to edit a listing.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading listing...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-3xl font-bold">Edit Listing</h1>

        {message && (
          <div className={`mb-4 p-3 rounded ${message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Make *</label>
              <input type="text" value={make} onChange={e => setMake(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Model *</label>
              <input type="text" value={model} onChange={e => setModel(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Year *</label>
              <input type="number" value={year} onChange={e => setYear(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required min="1900" max="2030" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mileage *</label>
              <div className="flex gap-2">
                <input type="number" value={mileage} onChange={e => setMileage(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required min="0" />
                <select value={mileageUnit} onChange={e => setMileageUnit(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="km">km</option>
                  <option value="miles">miles</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Condition *</label>
              <select value={condition} onChange={e => setCondition(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                <option value="">Select condition</option>
                <option value="New">New</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price (€) *</label>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required min="0" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Engine Size (cc) *</label>
              <input type="number" value={engineSize} onChange={e => setEngineSize(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required min="0" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Power (BHP/kW)</label>
            <input type="text" value={power} onChange={e => setPower(e.target.value)}
              placeholder="e.g., 100 BHP or 75 kW"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Bike Type *</label>
            <select value={bikeType} onChange={e => setBikeType(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required>
              <option value="">Select type</option>
              {BIKE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Location *</label>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 h-32 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Image</label>
            {imageUrl && (
              <div className="mb-4">
                <img src={imageUrl} alt="Preview" className="w-full h-48 object-cover rounded-lg border border-gray-300" />
                <button type="button" onClick={() => setImageUrl('')} className="mt-2 text-sm text-red-600 hover:text-red-800">
                  Remove image
                </button>
              </div>
            )}
            <div className="mb-3">
              <label className="block">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 cursor-pointer transition">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                  <div className="text-gray-600">
                    {uploading ? <span>Uploading...</span> : (
                      <>
                        <span className="text-blue-600 font-medium">Click to upload</span> or drag and drop
                        <p className="text-xs mt-1">PNG, JPG, GIF up to 5MB</p>
                      </>
                    )}
                  </div>
                </div>
              </label>
            </div>
            <div className="text-center text-gray-500 text-sm mb-2">OR</div>
            <input type="url" placeholder="Enter image URL" value={imageUrl} onChange={e => setImageUrl(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => router.push('/dashboard')}
              className="flex-1 rounded-lg border border-gray-300 px-6 py-3 text-gray-700 font-semibold hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition">
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
