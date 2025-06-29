// pages/post-ad.js
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function PostAd() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setUploading(true);
    let imageUrl = '';

    // 1. Upload image to Cloudinary
    if (image) {
      const formData = new FormData();
      formData.append('image', image);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Image upload failed');
        setUploading(false);
        return;
      }

      imageUrl = data.imageUrl;
    }

    // 2. Post ad with imageUrl
    const res = await fetch('/api/ads/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, price, imageUrl }),
    });

    const data = await res.json();
    setUploading(false);

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
          <label className="block text-sm font-medium">Upload Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="w-full"
            required
          />
        </div>
        <button
          type="submit"
          disabled={uploading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {uploading ? 'Posting...' : 'Post Ad'}
        </button>
      </form>
    </div>
  );
}
