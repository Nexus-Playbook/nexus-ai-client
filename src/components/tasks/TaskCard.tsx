'use client';

import { Task } from '@/types';
import { Card } from '@/components/ui/Card';
import { cn, formatDate, getPriorityColor, getPriorityLabel, isOverdue } from '@/lib/utils';
import { Calendar, AlertCircle, User } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  isDragging?: boolean;
}

export function TaskCard({ task, onClick, isDragging }: TaskCardProps) {
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
          <h4 className="font-medium text-gray-900 line-clamp-2">{task.title}</h4>
          <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap', getPriorityColor(task.priority))}>
            {getPriorityLabel(task.priority)}
          </span>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          {task.due_date && (
            <div className={cn('flex items-center gap-1', overdue && 'text-red-600 font-medium')}>
              <Calendar className="w-3 h-3" />
              <span>{formatDate(task.due_date)}</span>
              {overdue && <AlertCircle className="w-3 h-3" />}
            </div>
          )}
          
          {task.assignee_id && (
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span className="truncate max-w-[100px]">{task.assignee_id}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

