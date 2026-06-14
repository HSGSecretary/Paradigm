'use client';

import { useState, useRef } from 'react';
import { PROJECT_PHASES, INVOICE_PHASES, type Project, type ProjectPhase, type InvoicePhase } from '@/lib/constants';

interface Props {
  project: Project;
  isAdmin: boolean;
  onUpdate: (id: number, updates: Partial<Project>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

function projectPhaseColor(phase: ProjectPhase): string {
  const index = PROJECT_PHASES.indexOf(phase);
  if (index <= 0) return 'bg-steel-700 text-steel-300';
  if (index <= 2) return 'bg-blue-900 text-blue-300';
  if (index <= 4) return 'bg-purple-900 text-purple-300';
  if (index <= 6) return 'bg-orange-900 text-orange-300';
  return 'bg-green-900 text-green-300';
}

function invoicePhaseColor(phase: InvoicePhase): string {
  const index = INVOICE_PHASES.indexOf(phase);
  if (index === 0) return 'bg-steel-700 text-steel-400';
  if (index === 1) return 'bg-yellow-900 text-yellow-300';
  if (index === 2) return 'bg-blue-900 text-blue-300';
  if (index === 3) return 'bg-orange-900 text-orange-300';
  return 'bg-green-900 text-green-300';
}

function PhaseSelector<T extends string>({
  phases,
  current,
  phaseDates,
  colorFn,
  isAdmin,
  onSelect,
  extraContent,
}: {
  phases: readonly T[];
  current: T;
  phaseDates: Record<string, string>;
  colorFn: (p: T) => string;
  isAdmin: boolean;
  onSelect: (phase: T, dates: Record<string, string>) => void;
  extraContent?: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<T | null>(null);
  const [editingDate, setEditingDate] = useState('');
  const currentIndex = phases.indexOf(current);

  function handlePhaseClick(phase: T) {
    if (!isAdmin) return;
    // If clicking already-selected phase, deselect
    if (selectedPhase === phase) {
      setSelectedPhase(null);
      setEditingDate('');
      return;
    }
    setSelectedPhase(phase);
    setEditingDate(phaseDates[phase] || '');
  }

  function savePhase() {
    if (!selectedPhase) return;
    const newDates = { ...phaseDates, [selectedPhase]: editingDate };
    onSelect(selectedPhase, newDates);
    setSelectedPhase(null);
    setEditingDate('');
    setExpanded(false);
  }

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className={`phase-badge ${colorFn(current)} cursor-pointer hover:opacity-80 transition-opacity`}
      >
        <span>{current}</span>
        <svg className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="mt-2 bg-steel-900 border border-steel-600 rounded-lg overflow-hidden shadow-xl z-10 relative">
          {phases.map((phase, i) => {
            const isActive = phase === current;
            const isPast = i < currentIndex;
            const phaseDate = phaseDates[phase];
            const isSelected = selectedPhase === phase;
            return (
              <div key={phase}>
                <button
                  onClick={() => handlePhaseClick(phase)}
                  disabled={!isAdmin}
                  className={`w-full text-left px-3 py-2 text-xs flex items-start gap-2 transition-colors
                    ${isSelected ? 'bg-steel-600'
                      : isActive ? 'bg-amber-500/20 text-amber-400 font-semibold'
                      : isPast ? 'text-steel-500 bg-steel-800/50'
                      : 'text-steel-300 hover:bg-steel-700'}
                    ${!isAdmin ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-0.5 ${isActive ? 'bg-amber-500' : isPast ? 'bg-steel-600' : 'bg-steel-500'}`} />
                  <div className="flex-1">
                    <span className={isPast && !isSelected ? 'line-through opacity-60' : ''}>{phase}</span>
                    {phaseDate && !isSelected && (
                      <p className="text-xs font-mono mt-0.5 text-steel-400" style={{textDecoration:'none'}}>{phaseDate}</p>
                    )}
                  </div>
                  {isActive && !isSelected && <span className="ml-auto text-amber-500 flex-shrink-0">✓</span>}
                </button>

                {/* Inline date editor for selected phase */}
                {isSelected && isAdmin && (
                  <div className="px-3 pb-3 pt-1 bg-steel-800 border-t border-steel-600">
                    <label className="block text-xs text-steel-400 mb-1">Set date for this phase</label>
                    <input
                      type="date"
                      className="input-field text-xs py-1 mb-2"
                      value={editingDate}
                      onChange={e => setEditingDate(e.target.value)}
                      onClick={e => e.stopPropagation()}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); savePhase(); }}
                        className="btn-primary text-xs py-1 px-3 flex-1"
                      >
                        Set as current phase
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); 
                          // Save date only without changing current phase
                          const newDates = { ...phaseDates, [phase]: editingDate };
                          onSelect(current, newDates);
                          setSelectedPhase(null);
                          setEditingDate('');
                        }}
                        className="btn-secondary text-xs py-1 px-2"
                      >
                        Date only
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {isAdmin && extraContent && (
            <div className="border-t border-steel-700 p-3 space-y-2">
              {extraContent}
            </div>
          )}

          {!isAdmin && (
            <div className="border-t border-steel-700 px-3 py-2 text-xs text-steel-500">
              Contact your account manager to update status.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProjectRow({ project, isAdmin, onUpdate, onDelete }: Props) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [editingDetails, setEditingDetails] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [locationName, setLocationName] = useState(project.location_name);
  const [address, setAddress] = useState(project.address);
  const [notes, setNotes] = useState(project.notes || '');
  const [orderDescription, setOrderDescription] = useState(project.order_description || '');
  const [hsgReference, setHsgReference] = useState(project.hsg_reference || '');
  const [invoiceNumber, setInvoiceNumber] = useState(project.invoice_number || '');

  const projectPhaseDates: Record<string, string> = project.project_phase_dates ? JSON.parse(project.project_phase_dates) : {};
  const invoicePhaseDates: Record<string, string> = project.invoice_phase_dates ? JSON.parse(project.invoice_phase_dates) : {};
  const photos: string[] = project.photos ? JSON.parse(project.photos) : [];

  async function saveDetails() {
    setSaving(true);
    await onUpdate(project.id, {
      location_name: locationName,
      address,
      notes,
      order_description: orderDescription,
      hsg_reference: hsgReference,
    });
    setSaving(false);
    setEditingDetails(false);
  }

  function cancelEdit() {
    setLocationName(project.location_name);
    setAddress(project.address);
    setNotes(project.notes || '');
    setOrderDescription(project.order_description || '');
    setHsgReference(project.hsg_reference || '');
    setEditingDetails(false);
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      const form = new FormData();
      form.append('file', file);
      form.append('projectId', String(project.id));
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      if (res.ok) {
        const { url } = await res.json();
        newUrls.push(url);
      }
    }
    const updated = [...photos, ...newUrls];
    await onUpdate(project.id, { photos: JSON.stringify(updated) });
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function removePhoto(url: string) {
    const updated = photos.filter(p => p !== url);
    await onUpdate(project.id, { photos: JSON.stringify(updated) });
  }

  async function toggleComplete() {
    await onUpdate(project.id, { is_complete: !project.is_complete });
  }

  const hasDetails = !!(project.order_description || project.hsg_reference || photos.length > 0);

  return (
    <div className={`card transition-all duration-200 ${project.is_complete ? 'opacity-50' : ''} ${detailOpen ? 'border-steel-500' : 'hover:border-steel-600'}`}>
      <div className="grid grid-cols-12 gap-4 items-start px-4 py-3">

        {/* Location Name */}
        <div className="col-span-2">
          <button onClick={() => setDetailOpen(!detailOpen)} className="text-left group w-full">
            <p className={`font-medium text-sm transition-colors flex items-center gap-1.5 ${project.is_complete ? 'text-steel-500 line-through' : 'text-amber-400 hover:text-amber-300'}`}>
              <svg className={`w-3 h-3 flex-shrink-0 transition-transform text-steel-500 group-hover:text-amber-400 ${detailOpen ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="truncate">{project.location_name}</span>
            </p>
            {hasDetails && !detailOpen && (
              <p className="text-xs text-steel-600 mt-0.5 pl-4">details on file</p>
            )}
          </button>
          {project.is_complete && <span className="text-xs text-green-600 font-mono ml-4">COMPLETE</span>}
        </div>

        {/* Address */}
        <div className="col-span-2">
          <p className="text-steel-400 text-sm">{project.address}</p>
        </div>

        {/* Project Status */}
        <div className="col-span-3">
          <PhaseSelector
            phases={PROJECT_PHASES}
            current={project.project_status as ProjectPhase}
            phaseDates={projectPhaseDates}
            colorFn={projectPhaseColor}
            isAdmin={isAdmin}
            onSelect={(phase, dates) => onUpdate(project.id, {
              project_status: phase,
              project_phase_dates: JSON.stringify(dates),
            })}
          />
          <p className="text-xs text-steel-500 mt-1 font-mono">
            {projectPhaseDates[project.project_status] || <span className="text-steel-700 italic">No date set</span>}
          </p>
        </div>

        {/* Invoice Status */}
        <div className="col-span-3">
          <PhaseSelector
            phases={INVOICE_PHASES}
            current={project.invoice_status as InvoicePhase}
            phaseDates={invoicePhaseDates}
            colorFn={invoicePhaseColor}
            isAdmin={isAdmin}
            onSelect={(phase, dates) => onUpdate(project.id, {
              invoice_status: phase,
              invoice_phase_dates: JSON.stringify(dates),
              invoice_number: invoiceNumber,
            })}
            extraContent={
              isAdmin ? (
                <div>
                  <label className="block text-xs text-steel-500 mb-1">Invoice #</label>
                  <input
                    type="text"
                    className="input-field text-xs py-1"
                    placeholder="INV-0001"
                    value={invoiceNumber}
                    onChange={e => setInvoiceNumber(e.target.value)}
                    onClick={e => e.stopPropagation()}
                  />
                </div>
              ) : undefined
            }
          />
          <p className="text-xs text-steel-500 mt-1 font-mono">
            {invoicePhaseDates[project.invoice_status] || <span className="text-steel-700 italic">No date set</span>}
          </p>
          {project.invoice_number && (
            <p className="text-xs text-steel-500 mt-0.5 font-mono">#{project.invoice_number}</p>
          )}
        </div>

        {/* Notes + actions */}
        <div className="col-span-2">
          <p className="text-steel-400 text-xs leading-relaxed">
            {project.notes || <span className="text-steel-600 italic">—</span>}
          </p>
          {isAdmin && (
            <div className="flex flex-wrap gap-2 mt-2">
              <button onClick={() => { setDetailOpen(true); setEditingDetails(true); }} className="btn-secondary text-xs py-1 px-2">Edit</button>
              <button
                onClick={toggleComplete}
                className={`text-xs py-1 px-2 rounded font-medium transition-colors ${project.is_complete ? 'bg-green-900 text-green-300 hover:bg-green-800' : 'bg-steel-700 hover:bg-steel-600 text-steel-300'}`}
              >
                {project.is_complete ? '✓ Done' : 'Complete'}
              </button>
              <button onClick={() => onDelete(project.id)} className="btn-danger">Del</button>
            </div>
          )}
        </div>
      </div>

      {/* Expandable detail panel */}
      {detailOpen && (
        <div className="border-t border-steel-700 px-6 py-5 bg-steel-900/60">
          {editingDetails && isAdmin ? (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-amber-500 uppercase tracking-widest">Edit Project Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-steel-500 uppercase tracking-widest mb-1.5">Location Name</label>
                  <input className="input-field" value={locationName} onChange={e => setLocationName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-steel-500 uppercase tracking-widest mb-1.5">Address</label>
                  <input className="input-field" value={address} onChange={e => setAddress(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-steel-500 uppercase tracking-widest mb-1.5">Order Description</label>
                  <textarea className="input-field resize-none" rows={3} value={orderDescription} onChange={e => setOrderDescription(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-steel-500 uppercase tracking-widest mb-1.5">HSG Reference</label>
                  <input className="input-field" placeholder="HSG-XXXXX" value={hsgReference} onChange={e => setHsgReference(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-steel-500 uppercase tracking-widest mb-1.5">Notes</label>
                <textarea className="input-field resize-none" rows={2} value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={saveDetails} disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save Changes'}</button>
                <button onClick={cancelEdit} className="btn-secondary">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-amber-500 uppercase tracking-widest">Project Details</h3>
                {isAdmin && <button onClick={() => setEditingDetails(true)} className="btn-secondary text-xs py-1 px-3">Edit details</button>}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-4">
                <div>
                  <p className="text-xs font-medium text-steel-500 uppercase tracking-widest mb-1">Address</p>
                  <p className="text-sm text-steel-200">{project.address || <span className="text-steel-600 italic">—</span>}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-steel-500 uppercase tracking-widest mb-1">Order Description</p>
                  <p className="text-sm text-steel-200 whitespace-pre-wrap">{project.order_description || <span className="text-steel-600 italic">—</span>}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-steel-500 uppercase tracking-widest mb-1">HSG Reference</p>
                  <p className="text-sm text-steel-200 font-mono">{project.hsg_reference || <span className="text-steel-600 italic normal-case font-sans">—</span>}</p>
                </div>
              </div>
              {project.notes && (
                <div className="pt-1 border-t border-steel-700/50">
                  <p className="text-xs font-medium text-steel-500 uppercase tracking-widest mb-1">Notes</p>
                  <p className="text-sm text-steel-300 leading-relaxed">{project.notes}</p>
                </div>
              )}
              <div className="pt-1 border-t border-steel-700/50">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium text-steel-500 uppercase tracking-widest">Completion Photos</p>
                  {isAdmin && (
                    <label className="btn-secondary text-xs py-1 px-3 cursor-pointer">
                      {uploading ? 'Uploading…' : '+ Add Photos'}
                      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
                    </label>
                  )}
                </div>
                {photos.length === 0 ? (
                  <p className="text-xs text-steel-600 italic">No photos uploaded yet.</p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                    {photos.map((url, i) => (
                      <div key={url} className="relative group aspect-square">
                        <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover rounded border border-steel-600" />
                        <a href={url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors rounded flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-medium">View</span>
                        </a>
                        {isAdmin && (
                          <button onClick={() => removePhoto(url)} className="absolute top-1 right-1 w-5 h-5 bg-red-900 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">×</button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
