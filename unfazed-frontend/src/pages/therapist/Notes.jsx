import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import api from '../../api/axiosInstance';

export default function Notes() {
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState('');
  const [notes, setNotes] = useState([]);
  const [type, setType] = useState('private');
  const [format, setFormat] = useState('freeform');
  const [msg, setMsg] = useState({ text: '', upgrade: false });
  const [newClient, setNewClient] = useState({ name: '', email: '' });
  const editor = useEditor({ extensions: [StarterKit], content: '' });

  const err = (e) => setMsg({ text: e.response?.data?.message || 'Something went wrong', upgrade: !!e.response?.data?.upgrade });
  const loadClients = () => api.get('/clients').then(({ data }) => { setClients(data); if (!clientId && data[0]) setClientId(data[0]._id); });
  const loadNotes = (id) => api.get('/notes', { params: { client_id: id } }).then(({ data }) => setNotes(data));

  useEffect(() => { loadClients(); }, []);
  useEffect(() => { if (clientId) loadNotes(clientId); }, [clientId]);

  const addClient = async (e) => {
    e.preventDefault(); setMsg({ text: '' });
    try { await api.post('/clients', newClient); setNewClient({ name: '', email: '' }); loadClients(); setMsg({ text: 'Client added' }); }
    catch (x) { err(x); }
  };
  const saveNote = async () => {
    setMsg({ text: '' });
    try {
      await api.post('/notes', { client_id: clientId, type, format, content: editor.getHTML() });
      editor.commands.clearContent(); loadNotes(clientId); setMsg({ text: 'Note saved' });
    } catch (x) { err(x); }
  };
  const client = clients.find((c) => c._id === clientId);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Link to="/dashboard" className="text-blue-600 text-sm">&larr; Dashboard</Link>
      <h1 className="text-2xl font-bold">Clients and Notes</h1>

      {msg.text && (
        <div className={`p-3 rounded ${msg.upgrade ? 'bg-amber-100 text-amber-900' : 'bg-green-100 text-green-800'}`}>
          {msg.text} {msg.upgrade && <b>- Upgrade to Pro to unlock this.</b>}
        </div>
      )}

      <form onSubmit={addClient} className="bg-white p-4 rounded-xl shadow flex gap-2">
        <input className="border p-2 rounded flex-1" placeholder="Client name" value={newClient.name}
          onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} required />
        <input className="border p-2 rounded flex-1" placeholder="Email" value={newClient.email}
          onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} />
        <button className="bg-blue-600 text-white px-4 rounded">Add</button>
      </form>

      <div className="bg-white p-4 rounded-xl shadow space-y-3">
        <select className="border p-2 rounded" value={clientId} onChange={(e) => setClientId(e.target.value)}>
          {clients.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        {client && <p className="text-sm text-slate-500">Client portal link: <code>{window.location.origin}/portal/{client.access_token}</code></p>}
        <div className="flex gap-2">
          <select className="border p-2 rounded" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="private">Private (only me)</option>
            <option value="shared">Shared (client can see)</option>
          </select>
          <select className="border p-2 rounded" value={format} onChange={(e) => setFormat(e.target.value)}>
            <option value="freeform">Freeform</option>
            <option value="soap">SOAP template (Pro)</option>
          </select>
        </div>
        <div className="border rounded p-2 min-h-[120px]"><EditorContent editor={editor} /></div>
        <button onClick={saveNote} className="bg-blue-600 text-white px-4 py-2 rounded">Save note</button>
      </div>

      <div className="space-y-3">
        {notes.map((n) => (
          <div key={n._id} className="bg-white p-4 rounded-xl shadow">
            <span className={`text-xs px-2 py-1 rounded ${n.type === 'private' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{n.type}</span>
            <div className="mt-2" dangerouslySetInnerHTML={{ __html: n.content }} />
          </div>
        ))}
      </div>
    </div>
  );
}
