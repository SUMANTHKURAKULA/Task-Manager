import React, { useState, useEffect } from 'react';
import { usersAPI } from '../api/services';
import { Card, Button, Spinner, PageHeader, Alert, Badge, Avatar, EmptyState } from '../components/UI';
import { formatDate } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

export default function UsersPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    usersAPI.getAll()
      .then(r => setUsers(r.data.data))
      .catch(() => setError('Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  const toggleRole = async (id, current) => {
    const newRole = current === 'admin' ? 'member' : 'admin';
    setUpdating(id);
    try {
      await usersAPI.updateRole(id, newRole);
      setUsers(u => u.map(user => user._id === id ? { ...user, role: newRole } : user));
    } catch { setError('Failed to update role'); }
    finally { setUpdating(null); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await usersAPI.delete(id);
      setUsers(u => u.filter(user => user._id !== id));
    } catch (err) { setError(err.response?.data?.message || 'Failed to delete user'); }
  };

  if (loading) return <Spinner />;

  const admins = users.filter(u => u.role === 'admin');
  const members = users.filter(u => u.role === 'member');

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <PageHeader title="Team Members" subtitle={`${users.length} total · ${admins.length} admins · ${members.length} members`} />

      <Alert message={error} />

      {users.length === 0 ? (
        <EmptyState icon="◐" title="No team members" message="Users will appear here after signup." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {users.map(user => (
            <Card key={user._id} style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <Avatar name={user.name} size={44} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{user.name}</span>
                    {user._id === me._id && (
                      <Badge color="var(--accent)" bg="var(--accent-glow)">You</Badge>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {user.email} · Joined {formatDate(user.createdAt)}
                  </div>
                </div>
                <Badge
                  color={user.role === 'admin' ? 'var(--warning)' : 'var(--info)'}
                  bg={user.role === 'admin' ? 'var(--warning-bg)' : 'var(--info-bg)'}>
                  {user.role}
                </Badge>
                {user._id !== me._id && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button size="sm" variant="secondary"
                      loading={updating === user._id}
                      onClick={() => toggleRole(user._id, user.role)}>
                      Make {user.role === 'admin' ? 'Member' : 'Admin'}
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(user._id)}>
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
