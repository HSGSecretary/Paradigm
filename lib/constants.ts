export const PROJECT_PHASES = [
  'Pending',
  'Proposal Approval',
  'Design',
  'Design Approval',
  'Pending Deposit',
  'Manufacturing',
  'Shipping',
  'Pending Installation',
  'Final Balance',
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

export interface Project {
  id: number;
  location_name: string;
  address: string;
  project_status: ProjectPhase;
  project_status_date?: string;
  invoice_status: InvoicePhase;
  invoice_status_date?: string;
  invoice_number?: string;
  notes?: string;
  order_description?: string;
  hsg_reference?: string;
  is_complete: boolean;
  photos?: string; // JSON array of URLs
  created_at: string;
  updated_at: string;
}
