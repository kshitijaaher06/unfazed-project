import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../api/axiosInstance';

export default function ClientProfile() {
  const { id } = useParams();
  const [d, setD] = useState(null);
  const [tags, setTags] = useState('');
  const [msg, setMsg] = useState({ text: '', upgrade: false });

  const load = () => api.get(`/clients/${id}`).then(({ data }) => { setD(data); setTags((data.client.tags || []).join(', ')); });
  useEffect(() => { load(); }, [id]);

  const patch = async (body) => {
    setMsg({ text: '' });
    try { await api.patch(`/clients/${id}`, body); setMsg({ text: 'Saved' }); load(); }
    catch (x) { setMsg({ text: x.response?.data?.message || 'Failed', upgrade: !!x.response?.data?.upgrade }); }
  };

  if (!d) return <p className="text-center mt-24">Loading...</p>;
  const { client, sessions, notes, payments } = d;
  const origin = window.location.origin;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <Link to="/clients" className="text-blue-600 text-sm">&larr; Clients</Link>
      <h1 className="text-2xl font-bold">{client.name}</h1>
      {msg.text && <div className={`p-3 rounded ${msg.upgrade ? 'bg-amber-100 text-amber-900' : 'bg-green-100 text-green-800'}`}>{msg.text}</div>}

      <div className="bg-white p-4 rounded-xl shadow space-y-2 text-sm">
        <p>Email: {client.email || '-'}</p>
        <p>Status: <b>{client.status}</b>{' '}
          <button className="text-blue-600 underline" onClick={() => patch({ status: client.status === 'active' ? 'inactive' : 'active' })}>
            Mark {client.status === 'active' ? 'inactive' : 'active'}
          </button>
        </p>
        <div className="flex gap-2 items-center">
          <input className="border p-1 rounded flex-1" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags (comma separated)" />
          <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={() => patch({ tags: tags.split(',').map((t) => t.trim()).filter(Boolean) })}>Save tags</button>
        </div>
        <p>Intake form link: <code>{origin}/intake/{client.access_token}</code></p>
        <p>Shared-notes portal link: <code>{origin}/portal/{client.access_token}</code></p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow text-sm">
        <h2 className="font-semibold mb-2">Intake and consent</h2>
        <p>Intake: <b>{client.intake_completed ? 'Completed' : 'Pending'}</b></p>
        {client.intake_completed && (
          <div className="mt-2 space-y-1">
            <p>Age: {client.intake.age || '-'} | Gender: {client.intake.gender || '-'} | Occupation: {client.intake.occupation || '-'}</p>
            <p>Emergency contact: {client.intake.emergency_contact || '-'}</p>
            <p>Presenting concern: {client.intake.presenting_concern}</p>
            <p>History: {client.intake.history || '-'}</p>
          </div>
        )}
        <h3 className="font-medium mt-3">Consent record (audit trail)</h3>
        {client.consents.length === 0 && <p className="text-slate-500">No consent recorded yet.</p>}
        {client.consents.map((c) => (
          <p key={c._id}>Consent {c.version} accepted at {new Date(c.accepted_at).toLocaleString()} (IP {c.ip})</p>
        ))}
      </div>

      <div className="bg-white p-4 rounded-xl shadow text-sm">
        <h2 className="font-semibold mb-2">Session history</h2>
        {sessions.length === 0 && <p className="text-slate-500">No sessions yet.</p>}
        {sessions.map((s) => <p key={s._id}>{new Date(s.start).toLocaleString()} - {s.status}</p>)}
      </div>

      <div className="bg-white p-4 rounded-xl shadow text-sm">
        <h2 className="font-semibold mb-2">Payment history</h2>
        {payments.length === 0 && <p className="text-slate-500">No payments yet (payments arrive with Module 4).</p>}
      </div>

      <div className="bg-white p-4 rounded-xl shadow text-sm">
        <h2 className="font-semibold mb-2">Notes</h2>
        {notes.length === 0 && <p className="text-slate-500">No notes yet.</p>}
        {notes.map((n) => (
          <div key={n._id} className="border-b py-2">
            <span className={`text-xs px-2 py-1 rounded ${n.type === 'private' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{n.type}</span>
            <div dangerouslySetInnerHTML={{ __html: n.content }} />
          </div>
        ))}
      </div>
    </div>
  );
}
