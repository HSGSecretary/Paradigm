'use client';

import { useState, useEffect, useCallback } from 'react';
import { PROJECT_PHASES, INVOICE_PHASES, type Project, type ProjectPhase, type InvoicePhase } from '@/lib/constants';
import type { Role } from '@/lib/auth';
import ProjectRow from './ProjectRow';
import AddProjectModal from './AddProjectModal';

interface Props { role: Role; }

export default function DashboardClient({ role }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');
  const isAdmin = role === 'admin';

  const fetchProjects = useCallback(async () => {
    const res = await fetch('/api/projects');
    if (res.ok) setProjects(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  async function handleLogout() {
    await fetch('/api/auth', { method: 'DELETE' });
    window.location.href = '/login';
  }

  async function handleAdd(data: { location_name: string; address: string; notes: string }) {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const newProject = await res.json();
      setProjects(prev => [newProject, ...prev]);
    }
    setShowAddModal(false);
  }

  async function handleUpdate(id: number, updates: Partial<Project>) {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const updated = await res.json();
      setProjects(prev => prev.map(p => p.id === id ? updated : p));
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this project? This cannot be undone.')) return;
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    if (res.ok) setProjects(prev => prev.filter(p => p.id !== id));
  }

  const filtered = projects
    .filter(p =>
    p.location_name.toLowerCase().includes(search.toLowerCase()) ||
    p.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-steel-700 bg-steel-900 sticky top-0 z-30">
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-amber-500 rounded rotate-12 flex-shrink-0" />
            <span className="text-lg font-semibold tracking-tight">
              Paradigm <span className="text-amber-500">OH</span>
            </span>
            <span className="hidden sm:inline text-steel-600 text-sm ml-2">/ Project Dashboard</span>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-xs font-mono px-2 py-1 rounded ${
              isAdmin ? 'bg-amber-500/20 text-amber-400' : 'bg-steel-700 text-steel-400'
            }`}>
              {isAdmin ? 'ADMIN' : 'VIEWER'}
            </span>
            <button onClick={handleLogout} className="btn-secondary text-xs">
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="max-w-screen-2xl mx-auto px-6 py-5 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-48">
          <input
            type="search"
            placeholder="Search by location or address…"
            className="input-field"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 ml-auto">
          <span className="text-steel-400 text-sm">
            {filtered.length} {filtered.length === 1 ? 'project' : 'projects'}
          </span>
          {isAdmin && (
            <button onClick={() => setShowAddModal(true)} className="btn-primary">
              + Add Project
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="max-w-screen-2xl mx-auto px-6 pb-16">
        {loading ? (
          <div className="text-center py-24 text-steel-500">Loading projects…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-steel-500 text-sm">
              {projects.length === 0
                ? isAdmin
                  ? 'No projects yet. Add one to get started.'
                  : 'No projects have been added yet.'
                : 'No projects match your search.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Column headers */}
            <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-steel-500 uppercase tracking-widest">
              <div className="col-span-2">Location</div>
              <div className="col-span-2">Address</div>
              <div className="col-span-3">Project Status</div>
              <div className="col-span-3">Invoice Status</div>
              <div className="col-span-2">Notes</div>
            </div>

            {filtered.map((project, i) => {
              const prevComplete = i > 0 && filtered[i - 1].is_complete;
              const showDivider = project.is_complete && !prevComplete && filtered.some(p => !p.is_complete);
              return (
                <div key={project.id}>
                  {showDivider && (
                    <div className="flex items-center gap-3 py-2">
                      <div className="flex-1 h-px bg-steel-700" />
                      <span className="text-xs text-steel-600 uppercase tracking-widest font-medium">Completed</span>
                      <div className="flex-1 h-px bg-steel-700" />
                    </div>
                  )}
                  <ProjectRow
                    project={project}
                    isAdmin={isAdmin}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddProjectModal
          onSubmit={handleAdd}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
