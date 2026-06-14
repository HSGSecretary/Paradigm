'use client';

import { useState } from 'react';

interface Props {
  onSubmit: (data: { location_name: string; address: string; notes: string }) => void;
  onClose: () => void;
}

export default function AddProjectModal({ onSubmit, onClose }: Props) {
  const [locationName, setLocationName] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!locationName.trim() || !address.trim()) return;
    onSubmit({ location_name: locationName.trim(), address: address.trim(), notes: notes.trim() });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="card w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Add New Project</h2>
          <button onClick={onClose} className="text-steel-500 hover:text-steel-300 text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-steel-400 uppercase tracking-widest mb-2">
              Location Name *
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Dallas — Mockingbird Lane"
              value={locationName}
              onChange={e => setLocationName(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-steel-400 uppercase tracking-widest mb-2">
              Address *
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="1234 Main St, Dallas, TX 75201"
              value={address}
              onChange={e => setAddress(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-steel-400 uppercase tracking-widest mb-2">
              Notes
            </label>
            <textarea
              className="input-field resize-none"
              rows={3}
              placeholder="Any initial notes…"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">
              Add Project
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
