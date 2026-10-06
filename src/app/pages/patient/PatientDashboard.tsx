import { useCallback, useEffect, useState } from 'react';
import { Heart, FileText, Calendar, Activity, MessageSquare, Download, Thermometer, Clock } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import DashboardLayout, { LoadingState } from '../../components/DashboardLayout';
import { getPatientDashboard, getPatientReports } from '../../../services/patientService';
import { getAppointments } from '../../../services/appointmentService';
import { downloadReport } from '../../../services/reportService';
import BookAppointmentDialog from './BookAppointmentDialog';
import ChatAssistant from './ChatAssistant';
import { formatAppointmentDate, formatTimestamp } from '../../utils/dates';

type PatientView = 'dashboard' | 'reports' | 'appointments' | 'chatbot';

const STATUS_BADGE: Record<string, string> = {
  scheduled: 'bg-primary',
  completed: 'bg-success',
  cancelled: 'bg-secondary',
  'no-show': 'bg-warning text-dark',
};

const PatientDashboard = ({ view = 'dashboard' }: { view?: PatientView }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const chatOpen = view === 'chatbot';

  const fetchData = useCallback(async () => {
    try {
      const [dashboard, reportsData, appointmentsData] = await Promise.all([
        getPatientDashboard(),
        getPatientReports(),
        getAppointments(),
      ]);
      setDashboardData(dashboard);
      setReports(reportsData);
      setAppointments(appointmentsData);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDownload = async (report: any) => {
    setDownloadingId(report._id);
    try {
      await downloadReport(report);
    } catch (error: any) {
      toast.error(error.message || 'Failed to download report');
    } finally {
      setDownloadingId(null);
    }
  };

  const vitals = dashboardData?.patientDetails?.vitals || {};
  const healthSummary = [
    { icon: Heart, label: 'Heart Rate', value: vitals.heartRate ? `${vitals.heartRate} bpm` : 'N/A', color: '#667eea', bg: '#f0f1ff' },
    { icon: Activity, label: 'Blood Pressure', value: vitals.bloodPressure || 'N/A', color: '#10b981', bg: '#d1fae5' },
    { icon: Thermometer, label: 'Temperature', value: vitals.temperature ? `${vitals.temperature}°` : 'N/A', color: '#f59e0b', bg: '#fef3c7' },
  ];

  const upcomingAppointments = dashboardData?.upcomingAppointments || [];
  const visibleReports = view === 'reports' ? reports : reports.slice(0, 3);

  const reportsCard = (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="mb-0" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {view === 'reports' ? 'All Reports' : 'Recent Reports'}
          </h5>
          {view !== 'reports' && reports.length > 3 && (
            <button className="btn btn-sm btn-outline-primary" onClick={() => navigate('/patient/reports')}>
              View All
            </button>
          )}
        </div>

        {visibleReports.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="border-0">Report</th>
                  <th className="border-0 d-none d-md-table-cell">Date</th>
                  <th className="border-0 d-none d-lg-table-cell">Uploaded By</th>
                  <th className="border-0">Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleReports.map((report) => (
                  <tr key={report._id}>
                    <td>{report.title}</td>
                    <td className="d-none d-md-table-cell small">{formatTimestamp(report.createdAt)}</td>
                    <td className="d-none d-lg-table-cell small">{report.uploadedBy?.name || 'N/A'}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleDownload(report)}
                        disabled={downloadingId === report._id}
                      >
                        <Download size={16} className="me-1" />
                        {downloadingId === report._id ? 'Downloading...' : 'Download'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4 text-muted">
            <FileText size={48} className="mb-2 opacity-50" />
            <p className="mb-0">No reports available</p>
          </div>
        )}
      </div>
    </div>
  );

  const appointmentsCard = (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="mb-0" style={{ fontFamily: 'Poppins, sans-serif' }}>My Appointments</h5>
          <button className="btn btn-sm btn-primary" onClick={() => setBookingOpen(true)}>
            <Calendar size={16} className="me-1" />
            Book New
          </button>
        </div>

        {appointments.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="border-0">Date</th>
                  <th className="border-0">Time</th>
                  <th className="border-0">Doctor</th>
                  <th className="border-0 d-none d-md-table-cell">Reason</th>
                  <th className="border-0">Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment._id}>
                    <td>{formatAppointmentDate(appointment.appointmentDate)}</td>
                    <td>{appointment.appointmentTime}</td>
                    <td>{appointment.doctorId?.name || 'N/A'}</td>
                    <td className="d-none d-md-table-cell small">{appointment.reason}</td>
                    <td>
                      <span className={`badge text-capitalize ${STATUS_BADGE[appointment.status] || 'bg-secondary'}`}>
                        {appointment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4 text-muted">
            <Calendar size={48} className="mb-2 opacity-50" />
            <p className="mb-0">You have no appointments yet.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    if (view === 'reports') return reportsCard;
    if (view === 'appointments') return appointmentsCard;

    return (
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-baseline mb-4">
                <h5 className="mb-0" style={{ fontFamily: 'Poppins, sans-serif' }}>Health Summary</h5>
                {vitals.lastUpdated && (
                  <small className="text-muted">Last updated {formatTimestamp(vitals.lastUpdated)}</small>
                )}
              </div>

              <div className="row g-3">
                {healthSummary.map((item) => (
                  <div key={item.label} className="col-12 col-sm-4">
                    <div className="p-3 rounded-3 text-center" style={{ background: item.bg }}>
                      <item.icon size={24} className="mb-2" style={{ color: item.color }} />
                      <h6 className="mb-1">{item.value}</h6>
                      <small className="text-muted">{item.label}</small>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <h6 className="mb-3">Quick Actions</h6>
                <div className="d-flex flex-wrap gap-2">
                  <button className="btn btn-primary" onClick={() => setBookingOpen(true)}>
                    <Calendar size={16} className="me-2" />
                    Book Appointment
                  </button>
                  <button className="btn btn-outline-primary" onClick={() => navigate('/patient/reports')}>
                    <FileText size={16} className="me-2" />
                    View Reports
                  </button>
                  <button className="btn btn-outline-primary" onClick={() => navigate('/patient/chatbot')}>
                    <MessageSquare size={16} className="me-2" />
                    Chat with AI
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4">{reportsCard}</div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Upcoming Appointment</h5>

              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.slice(0, 1).map((appointment: any) => (
                  <div
                    key={appointment._id}
                    className="p-4 rounded-3 text-white"
                    style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                  >
                    <h6 className="mb-3">{appointment.doctorId?.name || 'Doctor'}</h6>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <Calendar size={16} />
                      <span>{formatAppointmentDate(appointment.appointmentDate)}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <Clock size={16} />
                      <span>{appointment.appointmentTime}</span>
                    </div>
                    <p className="mb-0 small opacity-75">{appointment.reason}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted">
                  <Calendar size={48} className="mb-2 opacity-50" />
                  <p>No upcoming appointments</p>
                  <button className="btn btn-primary btn-sm" onClick={() => setBookingOpen(true)}>
                    Book Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const titles: Record<PatientView, string> = {
    dashboard: 'My Health Dashboard',
    reports: 'My Reports',
    appointments: 'My Appointments',
    chatbot: 'My Health Dashboard',
  };

  return (
    <DashboardLayout title={titles[view]} subtitle="Track your health and manage your appointments.">
      {loading ? <LoadingState label="Loading dashboard..." /> : renderContent()}

      <BookAppointmentDialog open={bookingOpen} onOpenChange={setBookingOpen} onBooked={fetchData} />
      <ChatAssistant open={chatOpen} onClose={() => navigate('/patient/dashboard')} />
    </DashboardLayout>
  );
};

export default PatientDashboard;
