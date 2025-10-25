import { useEffect, useState } from 'react';
import { PlusCircle, Phone, Calendar, Coins, Gift, Users } from 'lucide-react';

const allBranches = ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'AIML', 'Civil', 'Open'];

export default function EventComposer({ currentUser, onAddEvent, onExportEvents }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    branches: ['Open'],
    teamMin: 1,
    teamMax: 1,
    fee: 0,
    prize: '',
    reason: '',
    contact: '',
    city: '',
    deadline: ''
  });

  useEffect(() => {
    if (currentUser && currentUser.role === 'conductor') {
      setForm(f => ({ ...f, contact: currentUser.contact || '', city: currentUser.city || '' }));
    }
  }, [currentUser]);

  const toggleBranch = (b) => {
    setForm(prev => {
      const set = new Set(prev.branches);
      if (set.has(b)) set.delete(b); else set.add(b);
      return { ...prev, branches: Array.from(set) };
    });
  };

  const submit = (e) => {
    e.preventDefault();
    if (!currentUser || currentUser.role !== 'conductor') return alert('Only conductors can create events');
    if (!form.title) return alert('Title is required');
    onAddEvent({ ...form, ownerEmail: currentUser.email });
    alert('Event published');
    setForm({ title: '', description: '', branches: ['Open'], teamMin: 1, teamMax: 1, fee: 0, prize: '', reason: '', contact: currentUser.contact || '', city: currentUser.city || '', deadline: '' });
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Create a Contest</h2>
        <button onClick={onExportEvents} className="text-xs rounded-md border border-white/20 px-3 py-1 hover:bg-white/10">Export events</button>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Title" className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2" />
        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={3} className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {allBranches.map(b => (
            <button type="button" key={b} onClick={() => toggleBranch(b)} className={`text-xs px-3 py-2 rounded-md border ${form.branches.includes(b) ? 'bg-white text-black border-white' : 'border-white/20 hover:bg-white/10'}`}>{b}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <label className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-md px-3 py-2">
            <Users className="h-4 w-4 text-white/60" />
            <input type="number" min={1} value={form.teamMin} onChange={e => setForm({ ...form, teamMin: Number(e.target.value) })} className="bg-transparent w-full" placeholder="Team min" />
          </label>
          <label className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-md px-3 py-2">
            <Users className="h-4 w-4 text-white/60" />
            <input type="number" min={1} value={form.teamMax} onChange={e => setForm({ ...form, teamMax: Number(e.target.value) })} className="bg-transparent w-full" placeholder="Team max" />
          </label>
          <label className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-md px-3 py-2">
            <Coins className="h-4 w-4 text-white/60" />
            <input type="number" min={0} value={form.fee} onChange={e => setForm({ ...form, fee: Number(e.target.value) })} className="bg-transparent w-full" placeholder="Entry fee" />
          </label>
          <label className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-md px-3 py-2">
            <Gift className="h-4 w-4 text-white/60" />
            <input value={form.prize} onChange={e => setForm({ ...form, prize: e.target.value })} className="bg-transparent w-full" placeholder="Cash prize" />
          </label>
        </div>
        <input value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Reason / theme" className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-md px-3 py-2">
            <Phone className="h-4 w-4 text-white/60" />
            <input value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} className="bg-transparent w-full" placeholder="Contact number" />
          </label>
          <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="City" className="bg-black/40 border border-white/10 rounded-md px-3 py-2" />
          <label className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-md px-3 py-2">
            <Calendar className="h-4 w-4 text-white/60" />
            <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className="bg-transparent w-full" placeholder="Deadline" />
          </label>
        </div>
        <button className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-white text-black px-4 py-2 text-sm font-medium hover:bg-zinc-200 transition">
          <PlusCircle className="h-4 w-4" /> Publish Event
        </button>
        {!currentUser || currentUser.role !== 'conductor' ? (
          <p className="text-xs text-white/60">Login as a Conductor to create events.</p>
        ) : null}
      </form>
    </div>
  );
}
