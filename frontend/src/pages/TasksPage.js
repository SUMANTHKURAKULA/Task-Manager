import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { tasksAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { Card, Spinner, Badge, EmptyState, PageHeader, Alert, Avatar } from '../components/UI';
import { formatDate, statusConfig, priorityConfig } from '../utils/helpers';

const STATUSES = ['all', 'pending', 'in-progress', 'completed'];

export default function TasksPage() {
  const { isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const { data } = await tasksAPI.getAll(params);
      setTasks(data.data);
    } catch {
      setError('Failed to load tasks');
    } finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { setLoading(true); load(); }, [load]);

  const handleStatusChange = async (taskId, status) => {
    try {
      const { data } = await tasksAPI.update(taskId, { status });
      setTasks(t => t.map(tk => tk._id === taskId ? { ...tk, status: data.data.status } : tk));
    } catch { setError('Failed to update status'); }
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <PageHeader title="Tasks" subtitle={`${tasks.length} task${tasks.length !== 1 ? 's' : ''}`} />

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
        {STATUSES.map(s => {
          const sc = s !== 'all' ? statusConfig[s] : null;
          return (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: '7px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, border: 'none',
              cursor: 'pointer', transition: 'all 0.15s',
              background: filter === s ? (sc?.bg || 'var(--accent-glow)') : 'var(--bg-card)',
              color: filter === s ? (sc?.color || 'var(--accent-light)') : 'var(--text-secondary)',
              borderWidth: 1, borderStyle: 'solid',
              borderColor: filter === s ? (sc?.color ? `${sc.color}40` : 'var(--border-active)') : 'var(--border)',
            }}>
              {s === 'all' ? 'All Tasks' : statusConfig[s]?.label}
            </button>
          );
        })}
      </div>

      <Alert message={error} />

      {tasks.length === 0 ? (
        <EmptyState icon="◎" title="No tasks found"
          message={filter !== 'all' ? `No ${filter} tasks.` : 'No tasks assigned yet.'} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {tasks.map(task => {
            const sc = statusConfig[task.status] || {};
            const pc = priorityConfig[task.priority] || {};
            return (
              <Card key={task._id} style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
                  <Avatar name={task.assignedTo?.name || '?'} size={38} />
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{task.title}</div>
                    {task.description && (
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8,
                        overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {task.description}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                      <span>Project: <Link to={`/projects/${task.project?._id}`} style={{ color: 'var(--accent)', fontWeight: 600 }}>{task.project?.name}</Link></span>
                      <span>Assigned: <strong style={{ color: 'var(--text-secondary)' }}>{task.assignedTo?.name}</strong></span>
                      <span style={{ color: task.isOverdue ? 'var(--danger)' : undefined }}>
                        Due: {formatDate(task.dueDate)}{task.isOverdue ? ' ⚠ Overdue' : ''}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <Badge color={pc.color} bg={pc.bg}>{pc.label}</Badge>
                    {!isAdmin ? (
                      <select value={task.status} onChange={e => handleStatusChange(task._id, e.target.value)}
                        style={{
                          background: sc.bg, color: sc.color, border: `1px solid ${sc.color}40`,
                          borderRadius: 8, padding: '5px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        }}>
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    ) : (
                      <Badge color={sc.color} bg={sc.bg}>{sc.label}</Badge>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
