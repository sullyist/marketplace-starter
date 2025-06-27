// pages/register.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { hash } from 'bcrypt';

export default function Register() {
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      alert('Account created');
      router.push('/login');
    } else {
      alert('Registration failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <input name="name" placeholder="Name" onChange={e => setForm({ ...form, name: e.target.value })} required />
      <input name="email" placeholder="Email" onChange={e => setForm({ ...form, email: e.target.value })} required />
      <input name="password" placeholder="Password" type="password" onChange={e => setForm({ ...form, password: e.target.value })} required />
      <button type="submit">Register</button>
    </form>
  );
}
