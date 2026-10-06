import { useState } from 'react';
import { Bell, Calendar, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import DashboardLayout, { LoadingState } from '../../components/DashboardLayout';
import { useNotifications, NotificationType } from '../../hooks/useNotifications';

const TYPE_STYLE: Record<NotificationType, { icon: typeof Calendar; color: string }> = {
  appointment: { icon: Calendar, color: '#667eea' },
  report: { icon: FileText, color: '#10b981' },
};

const FILTERS: { id: 'all' | NotificationType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'appointment', label: 'Appointments' },
  { id: 'report', label: 'Reports' },
];

const Notifications = () => {
  const { notifications, loading } = useNotifications();
  const [filter, setFilter] = useState<'all' | NotificationType>('all');

  const visible = filter === 'all' ? notifications : notifications.filter((n) => n.type === filter);

  return (
    <DashboardLayout title="Notifications" subtitle="Upcoming appointments and recently added reports">
      <div className="row g-4">
        <div className="col-lg-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-2 d-flex flex-column gap-1">
              {FILTERS.map((f) => {
                const count = f.id === 'all' ? notifications.length : notifications.filter((n) => n.type === f.id).length;
                return (
                  <button
                    key={f.id}
                    className={`btn text-start d-flex justify-content-between ${filter === f.id ? 'btn-primary' : 'btn-light'}`}
                    onClick={() => setFilter(f.id)}
                  >
                    {f.label}
                    <span className="badge bg-secondary">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="col-lg-9">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              {loading ? (
                <LoadingState label="Loading notifications..." />
              ) : visible.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <Bell size={48} className="mb-3 opacity-50" />
                  <p className="mb-0">No notifications right now.</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {visible.map((notif, idx) => {
                    const { icon: Icon, color } = TYPE_STYLE[notif.type];
                    return (
                      <motion.div
                        key={notif.id}
                        className="d-flex gap-3 p-3 rounded-3 border"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(idx, 10) * 0.03 }}
                      >
                        <div
                          className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{ width: '45px', height: '45px', background: `${color}20` }}
                        >
                          <Icon size={20} style={{ color }} />
                        </div>
                        <div>
                          <h6 className="mb-1">{notif.title}</h6>
                          <p className="text-muted small mb-0">{notif.message}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
