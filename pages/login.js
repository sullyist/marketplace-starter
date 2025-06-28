import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signIn('credentials', {
      email: form.email,
      password: form.password,
      callbackUrl: '/',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-10">
      <input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="block mb-2 p-2 border w-full"
      />
      <input
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        className="block mb-2 p-2 border w-full"
      />
      <button type="submit" className="bg-blue-600 text-white p-2 w-full">
        Sign in
      </button>
    </form>
  );
}
