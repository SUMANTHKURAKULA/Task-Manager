import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsAPI, usersAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import {
  Card, Button, Modal, Input, Textarea, Select,
  Spinner, EmptyState, PageHeader, Alert, Badge, Avatar
} from '../components/UI';

function ProjectCard({ project, onDelete, onClick, isAdmin }) {
  const pct = project.taskCount > 0 ? Math.round((project.completedCount / project.taskCount) * 100) : 0;
  const statusColors = { active: '#34d399', completed: '#60a5fa', archived: '#94a3b8' };

  return (
    <Card hover onClick={onClick} style={{ cursor: 'pointer' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <Badge color={statusColors[project.status]}>{project.status}</Badge>
        {isAdmin && (
          <button onClick={e => { e.stopPropagation(); onDelete(project._id); }}
            style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 16, opacity: 0.7 }}
            title="Delete project">✕</button>
        )}
      </div>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, marginBottom: 6 }}>{project.name}</h3>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, minHeight: 36,
        overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
        {project.description || 'No description provided.'}
      </p>

      {/* Progress Bar */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6, color: 'var(--text-secondary)' }}>
          <span>{project.taskCount} tasks</span>
          <span style={{ fontWeight: 600 }}>{pct}%</span>
        </div>
        <div style={{ height: 4, borderRadius: 2, background: 'var(--border)' }}>
          <div style={{ height: '100%', borderRadius: 2, background: 'var(--accent)', width: `${pct}%`, transition: 'width 0.4s' }} />
        </div>
      </div>

      {/* Members */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {project.members?.slice(0, 5).map(m => (
          <div key={m._id} title={m.name} style={{ marginLeft: -4 }}>
            <Avatar name={m.name} size={28} />
          </div>
        ))}
        {project.members?.length > 5 && (
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>+{project.members.length - 5}</span>
        )}
        {project.members?.length === 0 && (
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No members</span>
        )}
      </div>
    </Card>
  );
}

function ProjectModal({ isOpen, onClose, onSave, users }) {
  const [form, setForm] = useState({ name: '', description: '', members: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const reset = () => { setForm({ name: '', description: '', members: [] }); setError(''); };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Project name is required'); return; }
    setLoading(true); setError('');
    try {
      await onSave(form);
      reset(); onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally { setLoading(false); }
  };

  const toggleMember = (id) => {
    setForm(f => ({
      ...f, members: f.members.includes(id) ? f.members.filter(m => m !== id) : [...f.members, id]
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={() => { reset(); onClose(); }} title="New Project">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Alert message={error} />
        <Input label="Project Name *" placeholder="e.g. Marketing Campaign"
          value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <Textarea label="Description" placeholder="What's this project about?"
          value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />

        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
            Add Members
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 180, overflowY: 'auto' }}>
            {users.map(u => (
              <label key={u._id} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                borderRadius: 8, cursor: 'pointer', transition: 'background 0.1s',
                background: form.members.includes(u._id) ? 'var(--accent-glow)' : 'var(--bg-secondary)',
                border: `1px solid ${form.members.includes(u._id) ? 'var(--border-active)' : 'transparent'}`,
              }}>
                <input type="checkbox" checked={form.members.includes(u._id)}
                  onChange={() => toggleMember(u._id)} style={{ accentColor: 'var(--accent)' }} />
                <Avatar name={u.name} size={28} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{u.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.role}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
          <Button variant="ghost" onClick={() => { reset(); onClose(); }}>Cancel</Button>
          <Button loading={loading} onClick={handleSave}>Create Project</Button>
        </div>
      </div>
    </Modal>
  );
}

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [pRes, uRes] = await Promise.all([
        projectsAPI.getAll(),
        isAdmin ? usersAPI.getAll() : Promise.resolve({ data: { data: [] } })
      ]);
      setProjects(pRes.data.data);
      setUsers(uRes.data.data);
    } catch (err) {
      setError('Failed to load projects');
    } finally { setLoading(false); }
  }, [isAdmin]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (form) => {
    const { data } = await projectsAPI.create(form);
    setProjects(p => [data.data, ...p]);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project and all its tasks?')) return;
    await projectsAPI.delete(id);
    setProjects(p => p.filter(proj => proj._id !== id));
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <PageHeader
        title="Projects"
        subtitle={`${projects.length} active project${projects.length !== 1 ? 's' : ''}`}
        action={isAdmin && <Button onClick={() => setShowCreate(true)}>+ New Project</Button>}
      />

      <Alert message={error} />

      {projects.length === 0 ? (
        <EmptyState icon="◈" title="No projects yet"
          message={isAdmin ? 'Create your first project to get started.' : 'You haven\'t been added to any projects yet.'}
          action={isAdmin && <Button onClick={() => setShowCreate(true)}>+ New Project</Button>}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {projects.map(p => (
            <ProjectCard key={p._id} project={p} onDelete={handleDelete} isAdmin={isAdmin}
              onClick={() => navigate(`/projects/${p._id}`)} />
          ))}
        </div>
      )}

      <ProjectModal isOpen={showCreate} onClose={() => setShowCreate(false)} onSave={handleCreate} users={users} />
    </div>
  );
}
