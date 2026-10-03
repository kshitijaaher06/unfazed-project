import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axiosInstance';

// Public branded page: /:slug  (hero, about, specializations, service cards)
export default function ClientPortal() {
  const { slug } = useParams();
  const [t, setT] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/therapists/${slug}`)
      .then(({ data }) => {
        setT(data);
        // basic Open Graph tags for shareability
        document.title = `${data.name} | Unfazed`;
        const og = (p, c) => {
          let el = document.querySelector(`meta[property="${p}"]`);
          if (!el) { el = document.createElement('meta'); el.setAttribute('property', p); document.head.appendChild(el); }
          el.setAttribute('content', c);
        };
        og('og:title', `${data.name} - Therapist`);
        og('og:description', data.bio || 'Book a session');
        og('og:url', window.location.href);
      })
      .catch(() => setError('Therapist not found'));
  }, [slug]);

  if (error) return <p className="text-center mt-24 text-xl">{error}</p>;
  if (!t) return <p className="text-center mt-24">Loading...</p>;

  const services = ['Individual Session', 'Couples Session', 'Free 15-min Intro Call'];
  return (
    <div>
      <section className="bg-blue-600 text-white text-center py-20">
        <h1 className="text-4xl font-bold">{t.name}</h1>
        <p className="mt-2 opacity-90">unfazed.in/{t.slug}</p>
        <button className="mt-6 bg-white text-blue-600 px-6 py-2 rounded-full font-semibold">Book a session</button>
      </section>
      <div className="max-w-3xl mx-auto p-6 space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-2">About</h2>
          <p>{t.bio || 'No bio added yet.'}</p>
          <p className="mt-2 text-sm text-slate-500">Languages: {t.languages?.join(', ') || '-'}</p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-2">Specializations</h2>
          <div className="flex flex-wrap gap-2">
            {t.specializations?.map((s) => <span key={s} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">{s}</span>)}
          </div>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-2">Services</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {services.map((s) => <div key={s} className="bg-white p-4 rounded-lg shadow text-center">{s}</div>)}
          </div>
        </section>
      </div>
    </div>
  );
}
