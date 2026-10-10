import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axiosInstance';

export default function PortalNotes() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    api.get(`/portal/${token}/notes`).then(({ data }) => setData(data)).catch(() => setError('Invalid or expired link'));
  }, [token]);
  if (error) return <p className="text-center mt-24 text-xl">{error}</p>;
  if (!data) return <p className="text-center mt-24">Loading...</p>;
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Hello {data.client.name}, notes shared with you</h1>
      {data.notes.length === 0 && <p>No shared notes yet.</p>}
      {data.notes.map((n) => (
        <div key={n.id} className="bg-white p-4 rounded-xl shadow mb-3">
          <div dangerouslySetInnerHTML={{ __html: n.content }} />
          <p className="text-xs text-slate-400 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
