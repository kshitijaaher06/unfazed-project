import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosInstance';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const ALL_DURATIONS = [30, 45, 60, 90];

export default function Schedule() {
  const [rows, setRows] = useState(DAYS.map((_, day) => ({ day, on: false, start: '10:00', end: '14:00' })));
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [buffer, setBuffer] = useState(15);
  const [durations, setDurations] = useState([30, 45, 60, 90]);
  const [sessions, setSessions] = useState([]);
  const [msg, setMsg] = useState('');

  const loadSessions = () => api.get('/scheduling/sessions').then(({ data }) => setSessions(data));
  useEffect(() => {
    api.get('/scheduling/availability').then(({ data }) => {
      setTimezone(data.timezone); setBuffer(data.buffer_min); setDurations(data.durations);
      setRows(DAYS.map((_, day) => {
        const w = data.weekly.find((x) => x.day === day);
        return { day, on: !!w, start: w?.start || '10:00', end: w?.end || '14:00' };
      }));
    });
    loadSessions();
  }, []);

  const upd = (i, patch) => setRows(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const toggleDur = (d) => setDurations(durations.includes(d) ? durations.filter((x) => x !== d) : [...durations, d].sort((a, b) => a - b));

  const save = async () => {
    const weekly = rows.filter((r) => r.on).map(({ day, start, end }) => ({ day, start, end }));
    await api.put('/scheduling/availability', { timezone, weekly, overrides: [], blocked: [], buffer_min: Number(buffer), durations });
    setMsg('Availability saved');
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Link to="/dashboard" className="text-blue-600 text-sm">&larr; Dashboard</Link>
      <h1 className="text-2xl font-bold">Schedule</h1>

      <div className="bg-white p-4 rounded-xl shadow space-y-3">
        <h2 className="font-semibold">Weekly availability</h2>
        {rows.map((r, i) => (
          <div key={r.day} className="flex items-center gap-3">
            <label className="w-16"><input type="checkbox" checked={r.on} onChange={(e) => upd(i, { on: e.target.checked })} /> {DAYS[r.day]}</label>
            <input type="time" className="border p-1 rounded" value={r.start} disabled={!r.on} onChange={(e) => upd(i, { start: e.target.value })} />
            <span>to</span>
            <input type="time" className="border p-1 rounded" value={r.end} disabled={!r.on} onChange={(e) => upd(i, { end: e.target.value })} />
          </div>
        ))}
        <div className="flex gap-4 items-center flex-wrap">
          <label>Buffer (min) <input type="number" className="border p-1 rounded w-20" value={buffer} onChange={(e) => setBuffer(e.target.value)} /></label>
          <label>Timezone <input className="border p-1 rounded" value={timezone} onChange={(e) => setTimezone(e.target.value)} /></label>
        </div>
        <div className="flex gap-3">
          Session durations:
          {ALL_DURATIONS.map((d) => (
            <label key={d}><input type="checkbox" checked={durations.includes(d)} onChange={() => toggleDur(d)} /> {d}</label>
          ))}
        </div>
        <button onClick={save} className="bg-blue-600 text-white px-4 py-2 rounded">Save availability</button>
        {msg && <span className="ml-3 text-green-600 text-sm">{msg}</span>}
      </div>

      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="font-semibold mb-2">Upcoming sessions</h2>
        {sessions.length === 0 && <p className="text-sm text-slate-500">No bookings yet.</p>}
        {sessions.map((s) => (
          <div key={s._id} className="border-b py-2 text-sm">
            {new Date(s.start).toLocaleString()} - <b>{s.client_id?.name}</b> ({s.client_id?.email})
          </div>
        ))}
        <button onClick={loadSessions} className="mt-2 text-blue-600 text-sm">Refresh</button>
      </div>
    </div>
  );
}
