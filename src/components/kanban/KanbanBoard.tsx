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
import { useRealtimeSync, TaskEvent, TaskEventType } from '@/hooks/useRealtimeSync';

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
      // Backend /tasks/kanban returns: { todo: [], in_progress: [], done: [], blocked: [] }
      const data = await apiClient.getTasks(projectId);
      
      // Convert kanban format to flat task array
      const allTasks = [
        ...(data.todo || []),
        ...(data.in_progress || []),
        ...(data.done || []),
        ...(data.blocked || [])
      ];
      
      setTasks(allTasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Dedicated sync method for reconnect fallback (separate from loadTasks for SoC)
   * Enables future delta sync optimization (?since=lastSyncTimestamp)
   */
  const syncAfterReconnect = async () => {
    try {
      console.log('🔄 Syncing tasks after WebSocket reconnect...');
      // For MVP: Full refetch (optimize later with ?since=timestamp)
      const data = await apiClient.getTasks(projectId);
      const allTasks = [
        ...(data.todo || []),
        ...(data.in_progress || []),
        ...(data.done || []),
        ...(data.blocked || [])
      ];
      setTasks(allTasks);
      console.log('✅ Sync complete');
    } catch (error) {
      console.error('❌ Reconnect sync failed:', error);
    }
  };

  /**
   * Handle realtime task events from WebSocket
   */
  const handleTaskEvent = (event: TaskEvent) => {
    switch (event.eventType) {
      case TaskEventType.TASK_CREATED:
        if (event.payload.task) {
          setTasks(prev => [...prev, event.payload.task as unknown as Task]);
        }
        break;

      case TaskEventType.TASK_UPDATED:
        setTasks(prev =>
          prev.map(t =>
            t.id === event.payload.taskId
              ? { ...t, ...(event.payload.changes || {}), ...(event.payload.task || {}) }
              : t
          )
        );
        break;

      case TaskEventType.TASK_DELETED:
        setTasks(prev => prev.filter(t => t.id !== event.payload.taskId));
        break;

      case TaskEventType.TASK_RESTORED:
        if (event.payload.task) {
          setTasks(prev => [...prev, event.payload.task as unknown as Task]);
        }
        break;

      default:
        console.warn('Unknown event type:', event.eventType);
    }
  };

  // Realtime WebSocket connection
  const { isConnected } = useRealtimeSync({
    teamId,
    onTaskEvent: handleTaskEvent,
    onReconnect: syncAfterReconnect,
  });

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      // Capture original state for revert
      const previousTasks = tasks;
      
      // Optimistic update
      setTasks(tasks.map(t => 
        t.id === task.id ? { ...t, status: newStatus } : t
      ));

      try {
        await apiClient.updateTask(task.id, { status: newStatus });
        // Note: Don't refetch - rely on WebSocket event for sync
      } catch (error) {
        console.error('Failed to update task:', error);
        // Revert to captured state
        setTasks(previousTasks);
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
        // Note: Don't refetch - rely on WebSocket event for sync
      } else {
        // Create new task
        await apiClient.createTask(data as CreateTaskDto);
        // Note: Don't refetch - rely on WebSocket event for sync
      }
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
            {' • '}
            <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
              {isConnected ? '🟢 Live' : '🔴 Offline'}
            </span>
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
      />
    </div>
  );
}

