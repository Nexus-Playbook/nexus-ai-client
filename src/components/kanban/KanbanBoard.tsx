'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Task, TaskStatus, CreateTaskDto, UpdateTaskDto } from '@/types';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from '../tasks/TaskCard';
import { TaskModal } from '../tasks/TaskModal';
import { apiClient } from '@/lib/api-client';
import { Button } from '../ui/Button';
import { RefreshCw, Plus } from 'lucide-react';

interface KanbanBoardProps {
  teamId: string;
  projectId: string;
}

export function KanbanBoard({ teamId, projectId }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('todo');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getTasks(projectId);
      
      // Backend returns kanban format: { todo: [], in_progress: [], done: [], blocked: [] }
      // Convert to flat task array
      const allTasks = [
        ...(data.todo || []),
        ...(data.in_progress || []),
        ...(data.done || []),
        ...(data.blocked || [])
      ];
      
      setTasks(allTasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [teamId, projectId]);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      setActiveTask(null);
      return;
    }

    const task = tasks.find(t => t.id === active.id);
    const newStatus = over.id as TaskStatus;

    if (task && task.status !== newStatus) {
      // Optimistic update
      setTasks(tasks.map(t => 
        t.id === task.id ? { ...t, status: newStatus } : t
      ));

      try {
        await apiClient.updateTask(task.id, { status: newStatus });
      } catch (error) {
        console.error('Failed to update task:', error);
        // Revert on error
        setTasks(tasks);
      }
    }

    setActiveTask(null);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleAddTask = (status: TaskStatus) => {
    setSelectedTask(null);
    setDefaultStatus(status);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (data: CreateTaskDto | UpdateTaskDto) => {
    try {
      if (selectedTask) {
        // Update existing task
        await apiClient.updateTask(selectedTask.id, data as UpdateTaskDto);
      } else {
        // Create new task
        await apiClient.createTask(data as CreateTaskDto);
      }
      await loadTasks();
    } catch (error) {
      console.error('Failed to save task:', error);
      throw error;
    }
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Board</h1>
          <p className="text-sm text-gray-600 mt-1">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={loadTasks}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => handleAddTask('todo')}>
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          <KanbanColumn
            status="todo"
            tasks={getTasksByStatus('todo')}
            onTaskClick={handleTaskClick}
            onAddTask={handleAddTask}
          />
          <KanbanColumn
            status="in_progress"
            tasks={getTasksByStatus('in_progress')}
            onTaskClick={handleTaskClick}
            onAddTask={handleAddTask}
          />
          <KanbanColumn
            status="done"
            tasks={getTasksByStatus('done')}
            onTaskClick={handleTaskClick}
            onAddTask={handleAddTask}
          />
          <KanbanColumn
            status="blocked"
            tasks={getTasksByStatus('blocked')}
            onTaskClick={handleTaskClick}
            onAddTask={handleAddTask}
          />
        </div>

        <DragOverlay>
          {activeTask && <TaskCard task={activeTask} isDragging />}
        </DragOverlay>
      </DndContext>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
        }}
        onSave={handleSaveTask}
        task={selectedTask || undefined}
        defaultStatus={defaultStatus}
        projectId={projectId}
        teamId={teamId}
      />
    </div>
  );
}

