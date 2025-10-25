import { useEffect, useMemo, useState } from 'react';
import Hero3D from './components/Hero3D';
import AuthPanel from './components/AuthPanel';
import EventComposer from './components/EventComposer';
import DiscoverAndGroups from './components/DiscoverAndGroups';

function loadLS(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

function saveLS(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export default function App() {
  const [users, setUsers] = useState(() => loadLS('users', []));
  const [events, setEvents] = useState(() => loadLS('events', []));
  const [groups, setGroups] = useState(() => loadLS('groups', []));
  const [applications, setApplications] = useState(() => loadLS('applications', []));
  const [currentUserEmail, setCurrentUserEmail] = useState(() => loadLS('currentUserEmail', null));

  const currentUser = useMemo(() => users.find(u => u.email === currentUserEmail) || null, [users, currentUserEmail]);

  useEffect(() => { saveLS('users', users); }, [users]);
  useEffect(() => { saveLS('events', events); }, [events]);
  useEffect(() => { saveLS('groups', groups); }, [groups]);
  useEffect(() => { saveLS('applications', applications); }, [applications]);
  useEffect(() => { saveLS('currentUserEmail', currentUserEmail); }, [currentUserEmail]);

  const upsertUser = (user) => {
    setUsers(prev => {
      const exists = prev.some(u => u.email === user.email);
      if (exists) return prev.map(u => u.email === user.email ? { ...u, ...user } : u);
      return [...prev, user];
    });
    setCurrentUserEmail(user.email);
  };

  const logout = () => setCurrentUserEmail(null);

  const addEvent = (evt) => {
    setEvents(prev => [{ id: crypto.randomUUID(), createdAt: Date.now(), ...evt }, ...prev]);
  };

  const addGroup = (group) => {
    const g = { id: crypto.randomUUID(), createdAt: Date.now(), ...group };
    setGroups(prev => [g, ...prev]);
    return g;
  };

  const applyToEvent = ({ eventId, groupId, message }) => {
    const app = { id: crypto.randomUUID(), createdAt: Date.now(), eventId, groupId, message };
    setApplications(prev => [app, ...prev]);
    return app;
  };

  const exportCSV = (rows, filename) => {
    if (!rows || rows.length === 0) return alert('No data to export');
    const headers = Object.keys(rows[0]);
    const escape = (val) => {
      if (val == null) return '';
      const s = String(val);
      if (s.includes(',') || s.includes('\n') || s.includes('"')) return '"' + s.replace(/"/g, '""') + '"';
      return s;
    };
    const csv = [headers.join(',')].concat(rows.map(r => headers.map(h => escape(r[h])).join(','))).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Hero3D />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AuthPanel
            currentUser={currentUser}
            onUpsertUser={upsertUser}
            onLogout={logout}
            users={users}
            onExportUsers={() => exportCSV(users, 'users.csv')}
          />
          <EventComposer
            currentUser={currentUser}
            onAddEvent={addEvent}
            onExportEvents={() => exportCSV(events, 'events.csv')}
          />
        </section>

        <DiscoverAndGroups
          users={users}
          currentUser={currentUser}
          events={events}
          groups={groups}
          applications={applications}
          onAddGroup={addGroup}
          onApply={applyToEvent}
          onExportApplications={() => exportCSV(applications, 'applications.csv')}
        />
      </main>

      <footer className="border-t border-white/10 py-8 text-center text-sm text-white/60">
        Built for students and conductors. Minimal, modern, and fast.
      </footer>
    </div>
  );
}
