import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../api/axiosInstance';

// Client-facing intake + consent: /intake/:token
export default function Intake() {
  const { token } = useParams();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [info, setInfo] = useState(null);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/portal/${token}/intake`).then(({ data }) => setInfo(data)).catch(() => setError('Invalid or expired link'));
  }, [token]);

  const onSubmit = async (v) => {
    try {
      await api.post(`/portal/${token}/intake`, { ...v, age: v.age ? Number(v.age) : undefined, consent: v.consent === true });
      setDone(true);
    } catch (e) { setError(e.response?.data?.message || 'Could not submit'); }
  };

  if (error && !info) return <p className="text-center mt-24 text-xl">{error}</p>;
  if (!info) return <p className="text-center mt-24">Loading...</p>;
  if (done) return <p className="text-center mt-24 text-xl">Thank you, {info.name}. Your intake and consent have been recorded.</p>;

  const input = 'w-full border p-2 rounded';
  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-1">Intake form</h1>
      <p className="mb-4 text-sm text-slate-500">Hello {info.name}. Please fill this before your first session.{info.intake_completed && ' (You have already submitted once; submitting again updates it.)'}</p>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-xl shadow space-y-4">
        <input className={input} type="number" placeholder="Age" {...register('age')} />
        <select className={input} {...register('gender')}>
          <option value="">Gender</option><option>Female</option><option>Male</option><option>Non-binary</option><option>Prefer not to say</option>
        </select>
        <input className={input} placeholder="Occupation" {...register('occupation')} />
        <input className={input} placeholder="Emergency contact (name and phone)" {...register('emergency_contact')} />
        <textarea className={input} rows="3" placeholder="What brings you to therapy? (required)" {...register('presenting_concern', { required: 'This field is required' })} />
        {errors.presenting_concern && <p className="text-red-600 text-sm">{errors.presenting_concern.message}</p>}
        <textarea className={input} rows="3" placeholder="Relevant history (past therapy, medication, etc.)" {...register('history')} />
        <label className="flex gap-2 text-sm">
          <input type="checkbox" {...register('consent', { required: 'Consent is required' })} />
          I consent to receive therapy and to my information being stored securely for this purpose.
        </label>
        {errors.consent && <p className="text-red-600 text-sm">{errors.consent.message}</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Submit</button>
      </form>
    </div>
  );
}
