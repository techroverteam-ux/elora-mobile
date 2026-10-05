// Elora shared UI — design tokens.
// One place for radii, spacing, ink colours and the store-lifecycle status
// palette so every screen (Stores, Recce, Installation, Users, Clients…)
// shows the same colour for the same thing.

export const radius = { sm: 8, md: 12, lg: 16, xl: 20, pill: 999 };
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 };

// Text colour to use ON the brand yellow (white on #F6B21C fails contrast).
export const INK = '#1E293B';

export const tone = {
  neutral: '#64748B',
  info: '#3B82F6',
  indigo: '#6366F1',
  violet: '#8B5CF6',
  warning: '#F59E0B',
  teal: '#14B8A6',
  success: '#10B981',
  danger: '#EF4444',
};

export type StatusMeta = { label: string; color: string };

// Store lifecycle — colours match the previous StoresScreen getStatusColor()
// so nothing changes meaning for existing users.
export const STORE_STATUS: Record<string, StatusMeta> = {
  UPLOADED: { label: 'Uploaded', color: tone.neutral },
  RECCE_ASSIGNED: { label: 'Recce assigned', color: tone.info },
  RECCE_SUBMITTED: { label: 'Recce submitted', color: tone.warning },
  RECCE_APPROVED: { label: 'Recce approved', color: tone.violet },
  RECCE_REJECTED: { label: 'Recce rejected', color: tone.danger },
  INSTALLATION_ASSIGNED: { label: 'Install assigned', color: tone.indigo },
  INSTALLATION_SUBMITTED: { label: 'Install submitted', color: tone.teal },
  INSTALLATION_APPROVED: { label: 'Install approved', color: tone.success },
  COMPLETED: { label: 'Completed', color: tone.success },
};

export function statusMeta(status?: string): StatusMeta {
  if (!status) return { label: '—', color: tone.neutral };
  if (STORE_STATUS[status]) return STORE_STATUS[status];
  const s = status.toUpperCase();
  let color = tone.neutral;
  if (s.includes('REJECT')) color = tone.danger;
  else if (s.includes('COMPLETE') || s.includes('APPROVED') || s === 'ACTIVE') color = tone.success;
  else if (s.includes('SUBMIT') || s.includes('PENDING')) color = tone.warning;
  else if (s.includes('ASSIGN')) color = tone.info;
  const label = status.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase());
  return { label, color };
}

/** Hex colour + alpha (0–1) → 8-digit hex. */
export function alpha(hex: string, a: number) {
  const h = hex.replace('#', '');
  if (h.length !== 6) return hex;
  const v = Math.round(Math.max(0, Math.min(1, a)) * 255).toString(16).padStart(2, '0');
  return `#${h}${v}`;
}
