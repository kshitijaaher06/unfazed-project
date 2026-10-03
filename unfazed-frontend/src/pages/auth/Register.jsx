import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const nav = useNavigate();
  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/register', form);
      login(data.token, data.therapist);
      nav('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed');
    }
  };
  return (
    <div className="max-w-sm mx-auto mt-24 bg-white p-8 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-6">Create your account</h1>
      <form onSubmit={submit} className="space-y-4">
        <input className="w-full border p-2 rounded" placeholder="Full name (e.g. Dr Mehta)"
          onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="w-full border p-2 rounded" placeholder="Email" type="email"
          onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input className="w-full border p-2 rounded" placeholder="Password (min 6)" type="password"
          onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="w-full bg-blue-600 text-white p-2 rounded">Register</button>
      </form>
      <p className="mt-4 text-sm">Already have an account? <Link className="text-blue-600" to="/login">Login</Link></p>
    </div>
  );
}
