import { useMemo, useState } from 'react';
import { UserPlus, LogIn, LogOut, Upload, Mail } from 'lucide-react';

const years = ['1st', '2nd', '3rd', '4th', '5th'];
const branches = ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'AIML', 'Civil', 'Other'];

export default function AuthPanel({ currentUser, onUpsertUser, onLogout, users, onExportUsers }) {
  const [mode, setMode] = useState('signup');
  const [role, setRole] = useState('student');
  const [form, setForm] = useState({
    name: '',
    email: '',
    branch: '',
    year: '',
    institution: '',
    city: '',
    contact: '',
    password: ''
  });

  const students = useMemo(() => users.filter(u => u.role === 'student'), [users]);

  const onChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.email) return alert('Email is required');
    if (mode === 'signup') {
      onUpsertUser({ ...form, role });
      alert('Signed up successfully. You are now logged in.');
    } else {
      const found = users.find(u => u.email === form.email && (form.password ? u.password === form.password : true));
      if (found) {
        onUpsertUser(found);
        alert('Logged in successfully.');
      } else {
        alert('No user found with this email. Please sign up.');
      }
    }
  };

  const exportMyDetails = () => {
    if (!currentUser) return;
    const headers = Object.keys(currentUser);
    const csv = [headers.join(',') + '\n' + headers.map(h => JSON.stringify(currentUser[h] ?? '').replace(/,/g, ';')).join(',')];
    const blob = new Blob(csv, { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-details.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="auth" className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Account</h2>
        {currentUser ? (
          <div className="flex items-center gap-2 text-sm text-white/70">
            <span className="hidden sm:inline">Signed in as</span>
            <span className="font-medium">{currentUser.name || currentUser.email}</span>
          </div>
        ) : null}
      </div>

      {!currentUser ? (
        <form onSubmit={submit} className="space-y-4">
          <div className="flex items-center gap-2 text-xs text-white/70">
            <button type="button" onClick={() => setRole('student')} className={`px-3 py-1 rounded-md border ${role === 'student' ? 'bg-white text-black border-white' : 'border-white/20'}`}>Student</button>
            <button type="button" onClick={() => setRole('conductor')} className={`px-3 py-1 rounded-md border ${role === 'conductor' ? 'bg-white text-black border-white' : 'border-white/20'}`}>Conductor</button>
            <div className="ml-auto flex items-center gap-2">
              <button type="button" onClick={() => setMode('signup')} className={`px-3 py-1 rounded-md border ${mode === 'signup' ? 'bg-white text-black border-white' : 'border-white/20'}`}><UserPlus className="h-3.5 w-3.5 inline" /> Sign Up</button>
              <button type="button" onClick={() => setMode('login')} className={`px-3 py-1 rounded-md border ${mode === 'login' ? 'bg-white text-black border-white' : 'border-white/20'}`}><LogIn className="h-3.5 w-3.5 inline" /> Login</button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input name="name" value={form.name} onChange={onChange} placeholder="Full name" className="bg-black/40 border border-white/10 rounded-md px-3 py-2" />
            <input name="email" value={form.email} onChange={onChange} placeholder="Email" type="email" className="bg-black/40 border border-white/10 rounded-md px-3 py-2" />
            <select name="branch" value={form.branch} onChange={onChange} className="bg-black/40 border border-white/10 rounded-md px-3 py-2">
              <option value="">Select branch</option>
              {branches.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <select name="year" value={form.year} onChange={onChange} className="bg-black/40 border border-white/10 rounded-md px-3 py-2">
              <option value="">Year</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <input name="institution" value={form.institution} onChange={onChange} placeholder="Institution / College" className="bg-black/40 border border-white/10 rounded-md px-3 py-2" />
            <input name="city" value={form.city} onChange={onChange} placeholder="City" className="bg-black/40 border border-white/10 rounded-md px-3 py-2" />
            <input name="contact" value={form.contact} onChange={onChange} placeholder="Contact number" className="bg-black/40 border border-white/10 rounded-md px-3 py-2" />
            <input name="password" value={form.password} onChange={onChange} placeholder="Password" type="password" className="bg-black/40 border border-white/10 rounded-md px-3 py-2" />
          </div>

          <button className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-white text-black px-4 py-2 text-sm font-medium hover:bg-zinc-200 transition">
            {mode === 'signup' ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />} {mode === 'signup' ? 'Create account' : 'Login'}
          </button>

          <div className="flex items-center gap-2 text-xs text-white/60">
            <Mail className="h-3.5 w-3.5" />
            Your details can be exported as CSV and emailed via your mail app.
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="rounded-md border border-white/10 bg-black/30 p-3 text-sm">
            <div><span className="text-white/60">Role:</span> {currentUser.role}</div>
            <div><span className="text-white/60">Email:</span> {currentUser.email}</div>
            <div><span className="text-white/60">Branch/Year:</span> {currentUser.branch || '—'} / {currentUser.year || '—'}</div>
            <div><span className="text-white/60">Institution:</span> {currentUser.institution || '—'}</div>
            <div><span className="text-white/60">City:</span> {currentUser.city || '—'}</div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={exportMyDetails} className="inline-flex items-center gap-2 rounded-md border border-white/20 px-3 py-2 text-sm hover:bg-white/10"><Upload className="h-4 w-4" /> Export my details (CSV)</button>
            <button onClick={onExportUsers} className="inline-flex items-center gap-2 rounded-md border border-white/20 px-3 py-2 text-sm hover:bg-white/10">Export all users</button>
            <button onClick={onLogout} className="ml-auto inline-flex items-center gap-2 rounded-md bg-white text-black px-3 py-2 text-sm hover:bg-zinc-200"><LogOut className="h-4 w-4" /> Logout</button>
          </div>
        </div>
      )}

      {students.length > 0 && (
        <div className="mt-6 text-xs text-white/60">
          {students.length} students already joined. Create a group and invite them.
        </div>
      )}
    </div>
  );
}
