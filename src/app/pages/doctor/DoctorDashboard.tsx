import { useCallback, useEffect, useState } from 'react';
import { Users, FileText, Calendar, Clock, Eye, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import DashboardLayout, { LoadingState } from '../../components/DashboardLayout';
import { getDoctorDashboard, getAllPatients } from '../../../services/doctorService';
import { getAppointments, updateAppointment, AppointmentStatus } from '../../../services/appointmentService';
import { formatAppointmentDate, isTodayOrLater } from '../../utils/dates';

type DoctorView = 'dashboard' | 'patients' | 'appointments';

const STATUS_BADGE: Record<string, string> = {
  scheduled: 'bg-primary',
  completed: 'bg-success',
  cancelled: 'bg-secondary',
  'no-show': 'bg-warning text-dark',
};

const DoctorDashboard = ({ view = 'dashboard' }: { view?: DoctorView }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [dashboard, patientsList, appointmentList] = await Promise.all([
        getDoctorDashboard(),
        getAllPatients(),
        getAppointments(),
      ]);
      setDashboardData(dashboard);
      setPatients(patientsList);
      setAppointments(appointmentList);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    setUpdatingId(id);
    try {
      await updateAppointment(id, { status });
      toast.success(`Appointment marked as ${status}`);
      await fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update appointment');
    } finally {
      setUpdatingId(null);
    }
  };

  const upcomingCount = appointments.filter(
    (a) => a.status === 'scheduled' && isTodayOrLater(a.appointmentDate)
  ).length;

  const stats = [
    { icon: Users, label: 'Total Patients', value: dashboardData?.stats?.totalPatients ?? 0, color: '#667eea', bg: '#f0f1ff' },
    { icon: Calendar, label: 'Appointments Today', value: dashboardData?.stats?.todayAppointments ?? 0, color: '#10b981', bg: '#d1fae5' },
    { icon: Clock, label: 'Upcoming Appointments', value: upcomingCount, color: '#ef4444', bg: '#fee2e2' },
    { icon: FileText, label: 'Reports on File', value: dashboardData?.stats?.totalReports ?? 0, color: '#f59e0b', bg: '#fef3c7' },
  ];

  const query = search.trim().toLowerCase();
  const filteredPatients = query
    ? patients.filter((p) => [p.name, p.email, p.phone].some((field) => field?.toLowerCase().includes(query)))
    : patients;
  const visiblePatients = view === 'patients' ? filteredPatients : patients.slice(0, 5);

  const patientsCard = (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
          <h5 className="mb-0" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {view === 'patients' ? `All Patients (${patients.length})` : 'Recent Patients'}
          </h5>
          {view === 'patients' ? (
            <div className="input-group" style={{ maxWidth: '280px' }}>
              <span className="input-group-text bg-white"><Search size={16} /></span>
              <input
                type="search"
                className="form-control"
                placeholder="Search by name, email, phone"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search patients"
              />
            </div>
          ) : (
            <button className="btn btn-sm btn-outline-primary" onClick={() => navigate('/doctor/patients')}>
              View All
            </button>
          )}
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="bg-light">
              <tr>
                <th className="border-0">Patient ID</th>
                <th className="border-0">Name</th>
                <th className="border-0 d-none d-md-table-cell">Email</th>
                <th className="border-0 d-none d-lg-table-cell">Phone</th>
                <th className="border-0">Action</th>
              </tr>
            </thead>
            <tbody>
              {visiblePatients.length > 0 ? (
                visiblePatients.map((patient) => (
                  <tr key={patient._id}>
                    <td className="small">{patient._id.slice(-6).toUpperCase()}</td>
                    <td>{patient.name}</td>
                    <td className="d-none d-md-table-cell small">{patient.email}</td>
                    <td className="d-none d-lg-table-cell small">{patient.phone || 'N/A'}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-light"
                        onClick={() => navigate(`/doctor/patient/${patient._id}`)}
                        aria-label={`View ${patient.name}`}
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-4">No patients found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const appointmentsCard = (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        <h5 className="mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>My Appointments</h5>
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="bg-light">
              <tr>
                <th className="border-0">Date</th>
                <th className="border-0">Time</th>
                <th className="border-0">Patient</th>
                <th className="border-0 d-none d-md-table-cell">Reason</th>
                <th className="border-0">Status</th>
                <th className="border-0">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length > 0 ? (
                appointments.map((a) => (
                  <tr key={a._id}>
                    <td>{formatAppointmentDate(a.appointmentDate)}</td>
                    <td>{a.appointmentTime}</td>
                    <td>{a.patientId?.name || 'Unknown'}</td>
                    <td className="d-none d-md-table-cell small">{a.reason}</td>
                    <td>
                      <span className={`badge text-capitalize ${STATUS_BADGE[a.status] || 'bg-secondary'}`}>{a.status}</span>
                    </td>
                    <td>
                      {a.status === 'scheduled' ? (
                        <div className="d-flex flex-wrap gap-1">
                          <button className="btn btn-sm btn-success" disabled={updatingId === a._id}
                            onClick={() => handleStatusChange(a._id, 'completed')}>Complete</button>
                          <button className="btn btn-sm btn-outline-warning" disabled={updatingId === a._id}
                            onClick={() => handleStatusChange(a._id, 'no-show')}>No-show</button>
                          <button className="btn btn-sm btn-outline-secondary" disabled={updatingId === a._id}
                            onClick={() => handleStatusChange(a._id, 'cancelled')}>Cancel</button>
                        </div>
                      ) : (
                        <span className="text-muted small">—</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">No appointments yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const upcomingAppointments = dashboardData?.recentAppointments || [];

  const renderContent = () => {
    if (view === 'patients') return patientsCard;
    if (view === 'appointments') return appointmentsCard;

    return (
      <>
        <div className="row g-4 mb-4">
          {stats.map((stat, idx) => (
            <div key={stat.label} className="col-6 col-lg-3">
              <motion.div
                className="card border-0 shadow-sm h-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="card-body">
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center mb-3"
                    style={{ width: '50px', height: '50px', backgroundColor: stat.bg }}
                  >
                    <stat.icon size={24} style={{ color: stat.color }} />
                  </div>
                  <h3 className="mb-1">{stat.value}</h3>
                  <p className="text-muted small mb-0">{stat.label}</p>
                </div>
              </motion.div>
            </div>
          ))}
        </div>

        <div className="row g-4">
          <div className="col-lg-8">{patientsCard}</div>

          <div className="col-lg-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="mb-0" style={{ fontFamily: 'Poppins, sans-serif' }}>Upcoming</h5>
                  <button className="btn btn-sm btn-outline-primary" onClick={() => navigate('/doctor/appointments')}>
                    Manage
                  </button>
                </div>

                <div className="d-flex flex-column gap-3">
                  {upcomingAppointments.length > 0 ? (
                    upcomingAppointments.map((appointment: any) => (
                      <div key={appointment._id} className="p-3 rounded-3 border" style={{ background: '#f8f9fa' }}>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div
                            className="rounded-2 px-2 py-1 text-white small"
                            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                          >
                            {formatAppointmentDate(appointment.appointmentDate, { month: 'short', day: 'numeric' })} · {appointment.appointmentTime}
                          </div>
                        </div>
                        <h6 className="mb-1">{appointment.patientId?.name || 'Unknown Patient'}</h6>
                        <p className="text-muted small mb-0">{appointment.reason}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted py-4">
                      <Calendar size={48} className="mb-2 opacity-50" />
                      <p className="mb-0">No upcoming appointments</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const titles: Record<DoctorView, string> = {
    dashboard: 'Doctor Dashboard',
    patients: 'Patients',
    appointments: 'Appointments',
  };

  return (
    <DashboardLayout title={titles[view]} subtitle="Welcome back! Here's your overview.">
      {loading ? <LoadingState label="Loading dashboard..." /> : renderContent()}
    </DashboardLayout>
  );
};

export default DoctorDashboard;
