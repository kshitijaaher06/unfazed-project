import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axiosInstance';

export default function Clients() {
  const nav = useNavigate();
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [tag, setTag] = useState('');
  const [sort, setSort] = useState('created');
  const [order, setOrder] = useState('desc');
  const [nc, setNc] = useState({ name: '', email: '' });
  const [msg, setMsg] = useState({ text: '', upgrade: false });

  const load = () => api.get('/clients', { params: { q, status, tag, sort, order } }).then(({ data }) => setRows(data));
  useEffect(() => { load(); }, [q, status, tag, sort, order]);

  const toggleSort = (col) => {
    if (sort === col) setOrder(order === 'asc' ? 'desc' : 'asc');
    else { setSort(col); setOrder('asc'); }
  };
  const arrow = (c) => (sort === c ? (order === 'asc' ? ' (asc)' : ' (desc)') : '');

  const addClient = async (e) => {
    e.preventDefault(); setMsg({ text: '' });
    try { await api.post('/clients', nc); setNc({ name: '', email: '' }); load(); setMsg({ text: 'Client added' }); }
    catch (x) { setMsg({ text: x.response?.data?.message || 'Failed', upgrade: !!x.response?.data?.upgrade }); }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <Link to="/dashboard" className="text-blue-600 text-sm">&larr; Dashboard</Link>
      <h1 className="text-2xl font-bold">Clients</h1>
      {msg.text && <div className={`p-3 rounded ${msg.upgrade ? 'bg-amber-100 text-amber-900' : 'bg-green-100 text-green-800'}`}>{msg.text}</div>}

      <form onSubmit={addClient} className="bg-white p-3 rounded-xl shadow flex gap-2">
        <input className="border p-2 rounded flex-1" placeholder="New client name" required value={nc.name} onChange={(e) => setNc({ ...nc, name: e.target.value })} />
        <input className="border p-2 rounded flex-1" placeholder="Email" value={nc.email} onChange={(e) => setNc({ ...nc, email: e.target.value })} />
        <button className="bg-blue-600 text-white px-4 rounded">Add</button>
      </form>

      <div className="flex gap-2 flex-wrap">
        <input className="border p-2 rounded" placeholder="Search name..." value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="border p-2 rounded" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All status</option><option value="active">Active</option><option value="inactive">Inactive</option>
        </select>
        <input className="border p-2 rounded" placeholder="Filter by tag" value={tag} onChange={(e) => setTag(e.target.value)} />
      </div>

      <table className="w-full bg-white rounded-xl shadow text-sm">
        <thead className="text-left border-b">
          <tr>
            <th className="p-3 cursor-pointer" onClick={() => toggleSort('name')}>Name{arrow('name')}</th>
            <th className="p-3 cursor-pointer" onClick={() => toggleSort('last_session')}>Last session{arrow('last_session')}</th>
            <th className="p-3 cursor-pointer" onClick={() => toggleSort('status')}>Status{arrow('status')}</th>
            <th className="p-3">Tags</th>
            <th className="p-3">Intake</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c._id} className="border-b hover:bg-slate-50 cursor-pointer" onClick={() => nav(`/clients/${c._id}`)}>
              <td className="p-3 font-medium">{c.name}</td>
              <td className="p-3">{c.last_session ? new Date(c.last_session).toLocaleDateString() : '-'}</td>
              <td className="p-3">{c.status}</td>
              <td className="p-3">{(c.tags || []).join(', ')}</td>
              <td className="p-3">{c.intake_completed ? 'Done' : 'Pending'}</td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td className="p-3 text-slate-500" colSpan="5">No clients found.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
