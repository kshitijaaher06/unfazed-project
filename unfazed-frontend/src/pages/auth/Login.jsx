import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const nav = useNavigate();
  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.therapist);
      nav('/dashboard');
    } catch (err) { setError(err.response?.data?.message || 'Login failed'); }
  };
  return (
    <div className="max-w-sm mx-auto mt-24 bg-white p-8 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-6">Therapist Login</h1>
      <form onSubmit={submit} className="space-y-4">
        <input className="w-full border p-2 rounded" placeholder="Email" type="email"
          onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input className="w-full border p-2 rounded" placeholder="Password" type="password"
          onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="w-full bg-blue-600 text-white p-2 rounded">Login</button>
      </form>
      <p className="mt-4 text-sm">New here? <Link className="text-blue-600" to="/register">Register</Link></p>
    </div>
  );
}
