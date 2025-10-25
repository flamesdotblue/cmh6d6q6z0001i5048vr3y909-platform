import { useMemo, useState } from 'react';
import { Search, Filter, MapPin, Users, Send, MessageCircle, Download } from 'lucide-react';

function AIChatBox({ events, onResult }) {
  const [q, setQ] = useState('');
  const ask = () => {
    const query = q.toLowerCase();
    const tokens = query.split(/\s+/).filter(Boolean);
    const scored = events.map(e => {
      const text = `${e.title} ${e.description} ${e.city} ${e.reason} ${e.branches.join(' ')}`.toLowerCase();
      const score = tokens.reduce((s, t) => s + (text.includes(t) ? 1 : 0), 0);
      return { e, score };
    }).sort((a,b) => b.score - a.score);
    const result = scored.filter(s => s.score > 0).map(s => s.e).slice(0, 5);
    onResult(result);
  };
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-3">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-4 w-4 text-white/60" />
        <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key==='Enter' && ask()} placeholder="AI helper: try 'hackathon CSE in Delhi free'" className="flex-1 bg-transparent text-sm outline-none" />
        <button onClick={ask} className="text-xs rounded-md border border-white/20 px-3 py-1 hover:bg-white/10">Search</button>
      </div>
      <p className="mt-2 text-[11px] text-white/50">Smart search parses keywords like city, branch, free/paid, team size, etc.</p>
    </div>
  );
}

export default function DiscoverAndGroups({ users, currentUser, events, groups, applications, onAddGroup, onApply, onExportApplications }) {
  const [filters, setFilters] = useState({ branch: '', city: '', fee: 'any', teamSize: '' });
  const [aiPicks, setAiPicks] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [applyMsg, setApplyMsg] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');

  const students = useMemo(() => users.filter(u => u.role === 'student'), [users]);

  const filteredEvents = useMemo(() => {
    let list = [...events];
    if (filters.branch) list = list.filter(e => e.branches.includes(filters.branch) || e.branches.includes('Open'));
    if (filters.city) list = list.filter(e => e.city.toLowerCase().includes(filters.city.toLowerCase()));
    if (filters.teamSize) list = list.filter(e => e.teamMax >= Number(filters.teamSize));
    if (filters.fee === 'free') list = list.filter(e => Number(e.fee) === 0);
    if (filters.fee === 'paid') list = list.filter(e => Number(e.fee) > 0);
    if (aiPicks.length) list = aiPicks; // AI overrides
    return list;
  }, [events, filters, aiPicks]);

  const toggleMember = (email) => {
    setSelectedMembers(prev => prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]);
  };

  const createGroup = () => {
    if (!currentUser) return alert('Login required');
    if (!groupName) return alert('Group name required');
    const uniqueMembers = Array.from(new Set([currentUser.email, ...selectedMembers]));
    const group = onAddGroup({ name: groupName, ownerEmail: currentUser.email, memberEmails: uniqueMembers });
    alert('Group created: ' + group.name);
    setGroupName('');
    setSelectedMembers([]);
  };

  const apply = () => {
    if (!currentUser) return alert('Login required');
    if (!selectedEventId) return alert('Select an event');
    const myGroups = groups.filter(g => g.memberEmails.includes(currentUser.email));
    const group = myGroups[0] || onAddGroup({ name: `${currentUser.name || 'My'} Team`, ownerEmail: currentUser.email, memberEmails: [currentUser.email] });
    const app = onApply({ eventId: selectedEventId, groupId: group.id, message: applyMsg });
    alert('Applied successfully');
    setApplyMsg('');
    setSelectedEventId('');
  };

  const exportEventList = () => {
    const rows = filteredEvents.map(e => ({ id: e.id, title: e.title, branches: e.branches.join('|'), fee: e.fee, city: e.city, team: `${e.teamMin}-${e.teamMax}`, contact: e.contact }));
    if (rows.length === 0) return alert('No events to export');
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(',')].concat(rows.map(r => headers.map(h => JSON.stringify(r[h]).replace(/,/g, ';')).join(','))).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'events-filtered.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section id="discover" className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Discover & Groups</h2>
        <div className="flex items-center gap-2">
          <button onClick={onExportApplications} className="text-xs rounded-md border border-white/20 px-3 py-1 hover:bg-white/10"><Download className="h-3.5 w-3.5 inline" /> Applications</button>
          <button onClick={exportEventList} className="text-xs rounded-md border border-white/20 px-3 py-1 hover:bg-white/10">Export events</button>
        </div>
      </div>

      <AIChatBox events={events} onResult={setAiPicks} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <div className="inline-flex items-center gap-2 rounded-md border border-white/20 px-3 py-2">
              <Filter className="h-4 w-4 text-white/60" /> Branch
              <select value={filters.branch} onChange={e => setFilters({ ...filters, branch: e.target.value })} className="bg-transparent">
                <option value="">Any</option>
                {['CSE','ECE','EEE','ME','CE','IT','AIML','Civil','Open'].map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="inline-flex items-center gap-2 rounded-md border border-white/20 px-3 py-2">
              <MapPin className="h-4 w-4 text-white/60" /> City
              <input value={filters.city} onChange={e => setFilters({ ...filters, city: e.target.value })} placeholder="Nearby city" className="bg-transparent outline-none" />
            </div>
            <div className="inline-flex items-center gap-2 rounded-md border border-white/20 px-3 py-2">
              <Users className="h-4 w-4 text-white/60" /> Team size
              <input type="number" min={1} value={filters.teamSize} onChange={e => setFilters({ ...filters, teamSize: e.target.value })} className="bg-transparent w-16" />
            </div>
            <div className="inline-flex items-center gap-2 rounded-md border border-white/20 px-3 py-2">
              <Search className="h-4 w-4 text-white/60" /> Fee
              <select value={filters.fee} onChange={e => setFilters({ ...filters, fee: e.target.value })} className="bg-transparent">
                <option value="any">Any</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            {aiPicks.length > 0 && (
              <button onClick={() => setAiPicks([])} className="ml-auto text-xs rounded-md border border-white/20 px-3 py-2 hover:bg-white/10">Clear AI filter</button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEvents.map(evt => (
              <div key={evt.id} className="rounded-xl border border-white/10 bg-black/30 p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-medium text-lg">{evt.title}</h3>
                    <p className="text-sm text-white/70">{evt.description}</p>
                  </div>
                  <div className="text-right text-xs text-white/60">
                    <div>{evt.branches.join(', ')}</div>
                    <div>{evt.teamMin}-{evt.teamMax} members</div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-white/70">
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {evt.city || '—'}</span>
                  <span>Fee: {Number(evt.fee) === 0 ? 'Free' : `₹${evt.fee}`}</span>
                  <span>Prize: {evt.prize || '—'}</span>
                  <span>Contact: {evt.contact || '—'}</span>
                  {evt.deadline && <span>Deadline: {evt.deadline}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setSelectedEventId(evt.id)} className={`text-xs rounded-md px-3 py-2 border ${selectedEventId === evt.id ? 'bg-white text-black border-white' : 'border-white/20 hover:bg-white/10'}`}>Select to apply</button>
                </div>
              </div>
            ))}
            {filteredEvents.length === 0 && (
              <div className="col-span-full text-center text-white/60 text-sm">No events match your filters.</div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-black/30 p-4">
            <h3 className="font-medium mb-2">Create Group</h3>
            <input value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="Group name" className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 mb-3" />
            <div className="max-h-40 overflow-auto space-y-1">
              {users.filter(u => u.role === 'student' && u.email !== (currentUser?.email || '')).map(u => (
                <label key={u.email} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={selectedMembers.includes(u.email)} onChange={() => toggleMember(u.email)} />
                  <span>{u.name || u.email}</span>
                  <span className="text-white/50">· {u.branch || '—'} {u.year || ''}</span>
                </label>
              ))}
              {students.length === 0 && <div className="text-xs text-white/60">No other students yet.</div>}
            </div>
            <button onClick={createGroup} className="mt-3 w-full text-sm rounded-md bg-white text-black px-3 py-2 hover:bg-zinc-200">Save Group</button>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/30 p-4">
            <h3 className="font-medium mb-2">Apply to Selected Event</h3>
            <textarea value={applyMsg} onChange={e => setApplyMsg(e.target.value)} placeholder="Message to the conductor (optional)" rows={3} className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 mb-3" />
            <button onClick={apply} className="w-full text-sm rounded-md border border-white/20 px-3 py-2 hover:bg-white/10 inline-flex items-center justify-center gap-2"><Send className="h-4 w-4" /> Apply</button>
            <p className="mt-2 text-[11px] text-white/50">The conductor can contact you using the number provided in the event.</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/30 p-4">
        <h3 className="font-medium mb-2">My Applications</h3>
        <div className="space-y-2">
          {applications.filter(a => {
            if (!currentUser) return false;
            const g = groups.find(g => g.id === a.groupId);
            return g && g.memberEmails.includes(currentUser.email);
          }).map(a => {
            const evt = events.find(e => e.id === a.eventId);
            const g = groups.find(g => g.id === a.groupId);
            return (
              <div key={a.id} className="text-sm flex items-center justify-between rounded-md border border-white/10 p-3">
                <div>
                  <div className="font-medium">{evt?.title || 'Event removed'}</div>
                  <div className="text-white/60 text-xs">Group: {g?.name || '—'} · {new Date(a.createdAt).toLocaleString()}</div>
                </div>
                <div className="text-xs text-white/60 max-w-sm truncate">{a.message || '—'}</div>
              </div>
            );
          })}
          {(!currentUser || applications.filter(a => {
            if (!currentUser) return false;
            const g = groups.find(g => g.id === a.groupId);
            return g && g.memberEmails.includes(currentUser.email);
          }).length === 0) && (
            <div className="text-sm text-white/60">No applications yet.</div>
          )}
        </div>
      </div>
    </section>
  );
}
