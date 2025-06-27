// pages/login.js
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await signIn('credentials', {
      redirect: false,
      email: form.email,
      password: form.password,
    });

    if (res.ok) router.push('/');
    else alert('Login failed');
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <input name="email" placeholder="Email" onChange={e => setForm({ ...form, email: e.target.value })} required />
      <input name="password" placeholder="Password" type="password" onChange={e => setForm({ ...form, password: e.target.value })} required />
      <button type="submit">Login</button>
    </form>
  );
}
