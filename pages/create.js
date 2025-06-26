// pages/create.js

import { useState } from 'react';
import { useRouter } from 'next/router';

export default function CreateProduct() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    imageUrl: '',
    userId: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, price: parseFloat(form.price) })
    });
    if (res.ok) {
      alert('Product created!');
      router.push('/');
    } else {
      alert('Error creating product');
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>Create New Product</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: 500 }}>
        <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} required />
        <input name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} required />
        <input name="imageUrl" placeholder="Image URL" value={form.imageUrl} onChange={handleChange} required />
        <input name="userId" placeholder="User ID" value={form.userId} onChange={handleChange} required />
        <button type="submit" style={{ marginTop: '1rem' }}>Create Product</button>
      </form>
    </div>
  );
}

