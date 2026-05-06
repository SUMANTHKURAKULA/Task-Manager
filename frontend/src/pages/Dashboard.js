import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { tasksAPI } from '../api/services';
import { Card, Spinner, Badge, PageHeader, Avatar } from '../components/UI';
import { formatDate, statusConfig } from '../utils/helpers';

const StatCard = ({ icon, label, value, color, bg }) => (
  <Card style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
    <div style={{
      width: 52, height: 52, borderRadius: 14,
      background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 22,
    }}>{icon}</div>
    <div>
      <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-heading)', color }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</div>
    </div>
  </Card>
);

const COLORS = ['#fbbf24', '#3b82f6', '#10b981', '#ef4444'];

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tasksAPI.getStats()
      .then(r => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const { stats, recentTasks, tasksByStatus } = data || {};

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0]} ✦`}
        subtitle={isAdmin ? 'Here\'s your team overview' : 'Here\'s your task overview'}
      />

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard icon="◎" label="Total Tasks"   value={stats?.total || 0}     color="var(--text-primary)"  bg="var(--bg-secondary)" />
        <StatCard icon="✓" label="Completed"     value={stats?.completed || 0} color="var(--success)"       bg="var(--success-bg)" />
        <StatCard icon="◷" label="In Progress"   value={stats?.inProgress || 0} color="var(--info)"         bg="var(--info-bg)" />
        <StatCard icon="⚠" label="Overdue"       value={stats?.overdue || 0}   color="var(--danger)"        bg="var(--danger-bg)" />
      </div>

      {/* Chart + Recent Tasks */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 20 }}>

        {/* Pie Chart */}
        <Card>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 17, marginBottom: 20 }}>
            Task Status
          </h3>
          {stats?.total > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={tasksByStatus?.filter(d => d.value > 0)} cx="50%" cy="50%"
                    innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                    {tasksByStatus?.map((entry, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10 }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                {tasksByStatus?.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i] }} />
                      <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                    </div>
                    <span style={{ fontWeight: 700 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 14 }}>
              No tasks yet
            </div>
          )}
        </Card>

        {/* Recent Tasks */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 17 }}>Recent Tasks</h3>
            <Link to="/tasks" style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>View all →</Link>
          </div>
          {recentTasks?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentTasks.map(task => {
                const sc = statusConfig[task.status] || {};
                return (
                  <div key={task._id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px', borderRadius: 10, background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                  }}>
                    <Avatar name={task.assignedTo?.name || '?'} size={34} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {task.title}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                        {task.project?.name} · Due {formatDate(task.dueDate)}
                      </div>
                    </div>
                    <Badge color={sc.color} bg={sc.bg}>{sc.label}</Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 14 }}>
              No tasks yet. {isAdmin ? 'Create a project to get started.' : 'No tasks assigned to you.'}
            </div>
          )}
        </Card>

      </div>
    </div>
  );
}
