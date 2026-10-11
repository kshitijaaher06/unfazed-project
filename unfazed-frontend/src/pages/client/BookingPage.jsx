import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axiosInstance';

// Public booking page: /book/:slug  (slots shown in the CLIENT'S local timezone)
export default function BookingPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [duration, setDuration] = useState(null);
  const [picked, setPicked] = useState(null);
  const [form, setForm] = useState({ name: '', email: '' });
  const [msg, setMsg] = useState({ text: '', ok: false });
  const myTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const load = (d) => api.get(`/scheduling/${slug}/slots`, { params: d ? { duration: d } : {} })
    .then(({ data }) => { setData(data); setDuration(data.duration); })
    .catch(() => setMsg({ text: 'Therapist not found', ok: false }));
  useEffect(() => { load(); }, [slug]);

  const book = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/scheduling/${slug}/book`, { ...form, start: picked, duration });
      setMsg({ text: 'Booking confirmed! See you then.', ok: true });
      setPicked(null); load(duration);              // slot disappears instantly for everyone
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Booking failed', ok: false });
      setPicked(null); load(duration);
    }
  };

  if (!data) return <p className="text-center mt-24">{msg.text || 'Loading...'}</p>;

  const byDay = {};
  data.slots.forEach((iso) => {
    const key = new Date(iso).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
    (byDay[key] = byDay[key] || []).push(iso);
  });

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <Link to={`/${slug}`} className="text-blue-600 text-sm">&larr; Back to profile</Link>
      <h1 className="text-2xl font-bold">Book a session with {data.therapist}</h1>
      <p className="text-sm text-slate-500">Times shown in your timezone: {myTz}</p>

      {msg.text && <div className={`p-3 rounded ${msg.ok ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-900'}`}>{msg.text}</div>}

      <div className="flex gap-2">
        {data.durations.map((d) => (
          <button key={d} onClick={() => load(d)}
            className={`px-3 py-1 rounded-full border ${d === duration ? 'bg-blue-600 text-white' : 'bg-white'}`}>{d} min</button>
        ))}
      </div>

      {Object.keys(byDay).length === 0 && <p>No open slots right now.</p>}
      <div className="grid sm:grid-cols-2 gap-3">
        {Object.entries(byDay).map(([day, list]) => (
          <div key={day} className="bg-white p-3 rounded-xl shadow">
            <h3 className="font-semibold mb-2">{day}</h3>
            <div className="flex flex-wrap gap-2">
              {list.map((iso) => (
                <button key={iso} onClick={() => setPicked(iso)}
                  className={`px-2 py-1 rounded border text-sm ${picked === iso ? 'bg-blue-600 text-white' : 'bg-blue-50'}`}>
                  {new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {picked && (
        <form onSubmit={book} className="bg-white p-4 rounded-xl shadow space-y-3">
          <p>Selected: <b>{new Date(picked).toLocaleString()}</b> ({duration} min)</p>
          <input className="w-full border p-2 rounded" placeholder="Your name" required onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="w-full border p-2 rounded" type="email" placeholder="Your email" required onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Confirm booking</button>
        </form>
      )}
    </div>
  );
}
