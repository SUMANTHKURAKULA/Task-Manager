import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsAPI, tasksAPI, usersAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import {
  Card, Button, Modal, Input, Textarea, Select,
  Spinner, PageHeader, Alert, Badge, Avatar, EmptyState
} from '../components/UI';
import { formatDate, statusConfig, priorityConfig } from '../utils/helpers';

function TaskModal({ isOpen, onClose, onSave, members, projectId, editTask }) {
  const defaults = { title: '', description: '', assignedTo: '', status: 'pending', priority: 'medium', dueDate: '' };
  const [form, setForm] = useState(defaults);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editTask) {
      setForm({
        title: editTask.title || '',
        description: editTask.description || '',
        assignedTo: editTask.assignedTo?._id || '',
        status: editTask.status || 'pending',
        priority: editTask.priority || 'medium',
        dueDate: editTask.dueDate ? editTask.dueDate.split('T')[0] : '',
      });
    } else { setForm(defaults); }
  }, [editTask, isOpen]);

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.title.trim() || !form.assignedTo || !form.dueDate) {
      setError('Title, assignee, and due date are required'); return;
    }
    setLoading(true); setError('');
    try {
      await onSave({ ...form, project: projectId }, editTask?._id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task');
    } finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editTask ? 'Edit Task' : 'New Task'}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Alert message={error} />
        <Input label="Task Title *" placeholder="e.g. Design landing page"
          value={form.title} onChange={e => upd('title', e.target.value)} />
        <Textarea label="Description" placeholder="Task details..."
          value={form.description} onChange={e => upd('description', e.target.value)} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Select label="Assigned To *" value={form.assignedTo} onChange={e => upd('assignedTo', e.target.value)}>
            <option value="">Select member</option>
            {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
          </Select>
          <Input label="Due Date *" type="date" value={form.dueDate} onChange={e => upd('dueDate', e.target.value)} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Select label="Status" value={form.status} onChange={e => upd('status', e.target.value)}>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </Select>
          <Select label="Priority" value={form.priority} onChange={e => upd('priority', e.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Select>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button loading={loading} onClick={handleSave}>{editTask ? 'Update Task' : 'Create Task'}</Button>
        </div>
      </div>
    </Modal>
  );
}

function TaskRow({ task, isAdmin, onEdit, onDelete, onStatusChange }) {
  const sc = statusConfig[task.status] || {};
  const pc = priorityConfig[task.priority] || {};

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr auto auto auto auto',
      alignItems: 'center', gap: 12, padding: '12px 16px',
      borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border)',
    }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{task.title}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Due {formatDate(task.dueDate)}
          {task.isOverdue && <span style={{ color: 'var(--danger)', marginLeft: 6 }}>• Overdue</span>}
        </div>
      </div>
      <Avatar name={task.assignedTo?.name || '?'} size={30} />
      <Badge color={pc.color} bg={pc.bg}>{pc.label}</Badge>
      {!isAdmin ? (
        <select value={task.status} onChange={e => onStatusChange(task._id, e.target.value)}
          style={{
            background: sc.bg, color: sc.color, border: `1px solid ${sc.color}40`,
            borderRadius: 8, padding: '4px 8px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      ) : (
        <Badge color={sc.color} bg={sc.bg}>{sc.label}</Badge>
      )}
      {isAdmin && (
        <div style={{ display: 'flex', gap: 6 }}>
          <Button size="sm" variant="ghost" onClick={() => onEdit(task)}>Edit</Button>
          <Button size="sm" variant="danger" onClick={() => onDelete(task._id)}>Del</Button>
        </div>
      )}
    </div>
  );
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTask, setShowTask] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [pRes, tRes] = await Promise.all([
        projectsAPI.getOne(id),
        tasksAPI.getAll({ projectId: id })
      ]);
      setProject(pRes.data.data);
      setTasks(tRes.data.data);
    } catch (err) {
      setError('Failed to load project');
    } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleSaveTask = async (form, taskId) => {
    if (taskId) {
      const { data } = await tasksAPI.update(taskId, form);
      setTasks(t => t.map(tk => tk._id === taskId ? { ...data.data, isOverdue: data.data.status !== 'completed' && new Date(data.data.dueDate) < new Date() } : tk));
    } else {
      const { data } = await tasksAPI.create(form);
      setTasks(t => [data.data, ...t]);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    await tasksAPI.delete(taskId);
    setTasks(t => t.filter(tk => tk._id !== taskId));
  };

  const handleStatusChange = async (taskId, status) => {
    const { data } = await tasksAPI.update(taskId, { status });
    setTasks(t => t.map(tk => tk._id === taskId ? { ...tk, status: data.data.status } : tk));
  };

  if (loading) return <Spinner />;
  if (!project) return <div style={{ padding: 40, color: 'var(--danger)' }}>{error || 'Project not found'}</div>;

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div style={{ marginBottom: 8 }}>
        <button onClick={() => navigate('/projects')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14 }}>
          ← Back to Projects
        </button>
      </div>

      <PageHeader
        title={project.name}
        subtitle={project.description || 'No description'}
        action={isAdmin && <Button onClick={() => { setEditTask(null); setShowTask(true); }}>+ Add Task</Button>}
      />

      {/* Members row */}
      <Card style={{ marginBottom: 20, padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Members</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {project.members?.length > 0 ? project.members.map(m => (
              <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: 6,
                background: 'var(--bg-secondary)', borderRadius: 20, padding: '4px 10px 4px 4px',
                border: '1px solid var(--border)' }}>
                <Avatar name={m.name} size={24} />
                <span style={{ fontSize: 13, fontWeight: 500 }}>{m.name}</span>
              </div>
            )) : <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>No members added</span>}
          </div>
        </div>
      </Card>

      {/* Tasks */}
      <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20, marginBottom: 14 }}>
        Tasks ({tasks.length})
      </h2>

      {tasks.length === 0 ? (
        <EmptyState icon="◎" title="No tasks yet"
          message={isAdmin ? 'Add tasks to this project.' : 'No tasks assigned in this project.'}
          action={isAdmin && <Button onClick={() => setShowTask(true)}>+ Add Task</Button>}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tasks.map(task => (
            <TaskRow key={task._id} task={task} isAdmin={isAdmin}
              onEdit={t => { setEditTask(t); setShowTask(true); }}
              onDelete={handleDeleteTask}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      <TaskModal isOpen={showTask} onClose={() => { setShowTask(false); setEditTask(null); }}
        onSave={handleSaveTask} members={project.members || []} projectId={id} editTask={editTask} />
    </div>
  );
}
