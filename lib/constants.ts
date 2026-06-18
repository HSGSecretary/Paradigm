export const PROJECT_PHASES = [
  'Pending',
  'Proposal Approval',
  'Design',
  'Design Approval',
  'Pending Deposit',
  'Manufacturing',
  'Shipping',
  'Pending Installation',
  'Install Complete',
] as const;

export const INVOICE_PHASES = [
  'No Invoice Issued',
  'Pending Deposit',
  'Deposit Received',
  'Pending Final Balance',
  'Paid in Full',
] as const;

export type ProjectPhase = typeof PROJECT_PHASES[number];
export type InvoicePhase = typeof INVOICE_PHASES[number];

export interface ProjectComment {
  id: string;
  role: 'admin' | 'viewer';
  text: string;
  created_at: string;
  edited_at?: string;
}

export interface Project {
  id: number;
  location_name: string;
  address: string;
  project_status: ProjectPhase;
  project_phase_dates?: string; // JSON: { [phase]: date }
  invoice_status: InvoicePhase;
  invoice_phase_dates?: string; // JSON: { [phase]: date }
  invoice_number?: string;
  notes?: string;
  order_description?: string;
  hsg_reference?: string;
  is_complete: boolean;
  photos?: string; // JSON array of URLs
  comments?: string; // JSON array of ProjectComment
  admin_notify?: boolean; // unseen change for the admin (raised by viewer activity)
  viewer_notify?: boolean; // unseen change for the viewer (raised by admin activity)
  created_at: string;
  updated_at: string;
}
