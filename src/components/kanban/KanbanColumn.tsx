'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task, TaskStatus } from '@/types';
import { SortableTaskCard } from './SortableTaskCard';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
}

const columnConfig = {
  todo: { title: 'To Do', color: 'bg-gray-100 border-gray-300' },
  in_progress: { title: 'In Progress', color: 'bg-blue-100 border-blue-300' },
  done: { title: 'Done', color: 'bg-green-100 border-green-300' },
  blocked: { title: 'Blocked', color: 'bg-red-100 border-red-300' },
};

export function KanbanColumn({ status, tasks, onTaskClick, onAddTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  const config = columnConfig[status];
  const taskIds = tasks.map(task => task.id);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col bg-gray-50 rounded-lg border-2 border-dashed transition-colors',
        isOver ? 'border-primary-500 bg-primary-50' : config.color,
        'min-w-[320px] max-w-[320px]'
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">{config.title}</h3>
          <span className="px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-700 rounded-full">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(status)}
          className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
          title="Add task"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Tasks */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto min-h-[200px] max-h-[calc(100vh-300px)]">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
            />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-32 text-sm text-gray-400">
            No tasks
          </div>
        )}
      </div>
    </div>
  );
}

