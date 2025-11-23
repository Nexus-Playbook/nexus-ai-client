'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Task, CreateTaskDto, UpdateTaskDto, TaskStatus, TaskPriority } from '@/types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateTaskDto | UpdateTaskDto) => Promise<void>;
  task?: Task;
  defaultStatus?: TaskStatus;
  projectId: string;
  teamId: string;
}

const statusOptions = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
  { value: 'blocked', label: 'Blocked' },
];

const priorityOptions = [
  { value: '1', label: 'Critical' },
  { value: '2', label: 'High' },
  { value: '3', label: 'Medium' },
  { value: '4', label: 'Low' },
  { value: '5', label: 'Lowest' },
];

export function TaskModal({ isOpen, onClose, onSave, task, defaultStatus, projectId, teamId }: TaskModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: defaultStatus || 'todo' as TaskStatus,
    priority: 3 as TaskPriority, // Default to Medium
    due_date: '',
    assignee_id: '',
    tags: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
        assignee_id: task.assignee_id || '',
        tags: task.tags?.join(', ') || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: defaultStatus || 'todo',
        priority: 3, // Medium
        due_date: '',
        assignee_id: '',
        tags: '',
      });
    }
    setErrors({});
  }, [task, defaultStatus, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setIsLoading(true);
    try {
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      if (task) {
        // Update existing task
        const updateData: UpdateTaskDto = {
          title: formData.title,
          description: formData.description || undefined,
          status: formData.status,
          priority: formData.priority,
          due_date: formData.due_date ? new Date(formData.due_date).toISOString() : undefined,
          tags: tags.length > 0 ? tags : undefined,
        };
        
        // Only add assignee_id if it's valid
        if (formData.assignee_id && formData.assignee_id.trim()) {
          const trimmedId = formData.assignee_id.trim();
          if (/^[a-z0-9]{25}$/i.test(trimmedId)) {
            updateData.assignee_id = trimmedId;
          }
        }
        
        await onSave(updateData);
      } else {
        // Create new task
        const createData: CreateTaskDto = {
          title: formData.title,
          status: formData.status,
          priority: formData.priority,
        };
        
        // Add optional fields only if they have values
        if (formData.description && formData.description.trim()) {
          createData.description = formData.description.trim();
        }
        if (formData.due_date) {
          // Convert date string to ISO DateTime format for backend
          createData.due_date = new Date(formData.due_date).toISOString();
        }
        // Only add assignee_id if it's a valid user ID format (25-char cuid)
        if (formData.assignee_id && formData.assignee_id.trim()) {
          const trimmedId = formData.assignee_id.trim();
          // Validate it's a proper user ID format (25 lowercase alphanumeric)
          if (/^[a-z0-9]{25}$/i.test(trimmedId)) {
            createData.assignee_id = trimmedId;
          } else {
            console.warn('Invalid assignee_id format, skipping:', trimmedId);
          }
        }
        if (tags.length > 0) {
          createData.tags = tags;
        }
        // Only add project_id if it's provided and valid (24-char hex = MongoDB ObjectId)
        if (projectId && /^[a-f\d]{24}$/i.test(projectId)) {
          createData.project_id = projectId;
        }
        
        console.log('Creating task with data:', JSON.stringify(createData, null, 2));
        console.log('Project ID:', projectId, 'Valid MongoDB ObjectId:', /^[a-f\d]{24}$/i.test(projectId));
        
        await onSave(createData);
      }
      
      onClose();
    } catch (error: any) {
      console.error('Failed to save task:', error);
      console.error('Error response:', error?.response?.data);
      const errorMsg = error?.response?.data?.message || error.message;
      setErrors({ submit: `Failed to save task: ${errorMsg}` });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? 'Edit Task' : 'Create Task'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={isLoading}>
            {task ? 'Update' : 'Create'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title *"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          error={errors.title}
          placeholder="Enter task title"
          maxLength={200}
        />

        <Textarea
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter task description"
          rows={4}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
            options={statusOptions}
          />

          <Select
            label="Priority"
            value={formData.priority.toString()}
            onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) as TaskPriority })}
            options={priorityOptions}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Due Date"
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
          />

          <Input
            label="Assigned To (optional)"
            value={formData.assignee_id}
            onChange={(e) => setFormData({ ...formData, assignee_id: e.target.value })}
            placeholder="Leave empty or enter user ID"
          />
        </div>

        <Input
          label="Tags"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          placeholder="frontend, bug, urgent (comma-separated)"
        />

        {errors.submit && (
          <p className="text-sm text-red-600">{errors.submit}</p>
        )}
      </form>
    </Modal>
  );
}

