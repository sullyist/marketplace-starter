// pages/post-ad.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

export default function PostAd() {
  const router = useRouter();
  const { data: session } = useSession();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);
  const [makeModel, setMakeModel] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return alert('Please upload an image');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('image', image);
    formData.append('email', session.user.email);
    formData.append('makeModel', makeModel);

    const res = await fetch('/api/ads/create', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();

    if (res.ok) {
      router.push('/dashboard');
    } else {
      alert(data.error || 'Failed to post ad');
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Post New Ad</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Ad Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
          <label className="block text-sm font-medium">Make & Model</label>
          <select
            value={makeModel}
            onChange={(e) => setMakeModel(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          >
            <option value="">Select a bike</option>
            <option value="Honda CBR500R">Honda CBR500R</option>
            <option value="Yamaha MT-07">Yamaha MT-07</option>
            <option value="Kawasaki Ninja 400">Kawasaki Ninja 400</option>
            <option value="Suzuki GSX-R600">Suzuki GSX-R600</option>
            <option value="BMW S1000RR">BMW S1000RR</option>
            <option value="Other">Other</option>
          </select>
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
