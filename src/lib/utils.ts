import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function isOverdue(dueDate?: string): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}

export function getPriorityColor(priority: number): string {
  switch (priority) {
    case 1: // Critical
      return 'bg-red-100 text-red-800';
    case 2: // High
      return 'bg-orange-100 text-orange-800';
    case 3: // Medium
      return 'bg-yellow-100 text-yellow-800';
    case 4: // Low
      return 'bg-blue-100 text-blue-800';
    case 5: // Lowest
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getPriorityLabel(priority: number): string {
  switch (priority) {
    case 1: return 'Critical';
    case 2: return 'High';
    case 3: return 'Medium';
    case 4: return 'Low';
    case 5: return 'Lowest';
    default: return 'Unknown';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'todo':
      return 'bg-gray-100 text-gray-800';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800';
    case 'done':
      return 'bg-green-100 text-green-800';
    case 'blocked':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

