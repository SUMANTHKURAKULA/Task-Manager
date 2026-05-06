import { format, isAfter, parseISO } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '—';
  try {
    return format(typeof date === 'string' ? parseISO(date) : date, 'MMM d, yyyy');
  } catch { return '—'; }
};

export const isOverdue = (dueDate, status) => {
  if (status === 'completed') return false;
  try {
    const d = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
    return isAfter(new Date(), d);
  } catch { return false; }
};

export const statusConfig = {
  'pending':     { label: 'Pending',     color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
  'in-progress': { label: 'In Progress', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
  'completed':   { label: 'Completed',   color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
};

export const priorityConfig = {
  'low':    { label: 'Low',    color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
  'medium': { label: 'Medium', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
  'high':   { label: 'High',   color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
};

export const getInitials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

export const getAvatarColor = (name = '') => {
  const colors = ['#4f8ef7', '#a78bfa', '#34d399', '#fb923c', '#f472b6', '#38bdf8'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};
