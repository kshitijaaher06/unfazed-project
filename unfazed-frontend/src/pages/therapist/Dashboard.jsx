import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', bio: '', specializations: '', languages: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get(`/therapists/${user.slug}`).then(({ data }) =>
      setForm({
        name: data.name, bio: data.bio,
        specializations: data.specializations.join(', '), languages: data.languages.join(', ')
      }));
  }, [user.slug]);

  const split = (s) => s.split(',').map((x) => x.trim()).filter(Boolean);
  const save = async (e) => {
    e.preventDefault();
    await api.put('/therapists/me', { ...form, specializations: split(form.specializations), languages: split(form.languages) });
    setMsg('Profile saved!');
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button onClick={() => { logout(); nav('/login'); }} className="text-sm text-red-600">Logout</button>
      </div>
      <p className="mb-4">Your public link: <Link className="text-blue-600 underline" to={`/${user.slug}`}>unfazed.in/{user.slug}</Link></p>
      <Link to="/notes" className="inline-block mb-4 text-blue-600 underline">Clients and Notes</Link>
      <form onSubmit={save} className="bg-white p-6 rounded-xl shadow space-y-4">
        <input className="w-full border p-2 rounded" placeholder="Name" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <textarea className="w-full border p-2 rounded" rows="4" placeholder="Bio" value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        <input className="w-full border p-2 rounded" placeholder="Specializations (comma separated)" value={form.specializations}
          onChange={(e) => setForm({ ...form, specializations: e.target.value })} />
        <input className="w-full border p-2 rounded" placeholder="Languages (comma separated)" value={form.languages}
          onChange={(e) => setForm({ ...form, languages: e.target.value })} />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Save profile</button>
        {msg && <p className="text-green-600 text-sm">{msg}</p>}
      </form>
    </div>
  );
}
