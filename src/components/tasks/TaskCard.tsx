'use client';

import { Task } from '@/types';
import { Card } from '@/components/ui/Card';
import { cn, formatDate, getPriorityColor, getPriorityLabel, isOverdue, getRelativeTime } from '@/lib/utils';
import { Calendar, AlertCircle, User, FolderOpen, Clock } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  isDragging?: boolean;
  projectName?: string; // Optional: Project name lookup
}

const getLabelColor = (label: string): string => {
  const lower = label.toLowerCase();
  if (lower.includes('bug') || lower.includes('urgent') || lower.includes('critical')) return 'bg-red-100 text-red-700';
  if (lower.includes('feature') || lower.includes('enhancement')) return 'bg-blue-100 text-blue-700';
  if (lower.includes('frontend') || lower.includes('ui')) return 'bg-purple-100 text-purple-700';
  if (lower.includes('backend') || lower.includes('api')) return 'bg-green-100 text-green-700';
  if (lower.includes('test') || lower.includes('qa')) return 'bg-yellow-100 text-yellow-700';
  return 'bg-gray-100 text-gray-700';
};

export function TaskCard({ task, onClick, isDragging, projectName }: TaskCardProps) {
  const overdue = isOverdue(task.due_date);

  return (
    <Card
      onClick={onClick}
      hover
      className={cn(
        'p-4 cursor-pointer',
        isDragging && 'opacity-50 rotate-3 scale-105'
      )}
    >
      <div className="space-y-3">
        {/* Title and Priority */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-gray-900 line-clamp-2 flex-1">
            {task.title.length > 50 ? `${task.title.substring(0, 50)}...` : task.title}
          </h4>
          <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap shrink-0', getPriorityColor(task.priority))}>
            {getPriorityLabel(task.priority)}
          </span>
        </div>

        {/* Description (first 2-3 lines as per spec) */}
        {task.description && (
          <p className="text-sm text-gray-600 line-clamp-3">{task.description}</p>
        )}

        {/* Project Chip (if project_id exists) */}
        {task.project_id && (
          <div className="flex items-center gap-1 text-xs">
            <FolderOpen className="w-3 h-3 text-indigo-600" />
            <span className="text-indigo-600 font-medium truncate">
              {projectName || `Project: ${task.project_id.substring(0, 8)}...`}
            </span>
          </div>
        )}

        {/* Labels (colored chips as per spec) */}
        {task.labels && task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.labels.slice(0, 5).map((label) => (
              <span key={label} className={cn('px-2 py-0.5 text-xs font-medium rounded', getLabelColor(label))}>
                {label}
              </span>
            ))}
            {task.labels.length > 5 && (
              <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">+{task.labels.length - 5}</span>
            )}
          </div>
        )}

        {/* Footer: Due Date, Assignee, Created Date */}
        <div className="space-y-2 text-xs text-gray-500">
          <div className="flex items-center justify-between">
            {/* Due Date */}
            {task.due_date && (
              <div className={cn('flex items-center gap-1', overdue && 'text-red-600 font-semibold')}>
                <Calendar className="w-3 h-3" />
                <span>Due: {formatDate(task.due_date)}</span>
                {overdue && <AlertCircle className="w-3 h-3" />}
              </div>
            )}
            
            {/* Assignee (Avatar + Name) */}
            {task.assignee_id && (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span className="truncate max-w-[100px]" title={`Assigned to: ${task.assignee_id}`}>
                  {task.assignee_id.substring(0, 8)}...
                </span>
              </div>
            )}
          </div>

          {/* Created Date Footer (as per spec) */}
          <div className="flex items-center gap-1 text-gray-400">
            <Clock className="w-3 h-3" />
            <span>Created {getRelativeTime(task.created_at)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

