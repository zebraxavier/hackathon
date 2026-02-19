import React, { useState, useEffect } from 'react';
import { Users, FileText, Calendar, AlertCircle, TrendingUp, Eye } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { getDoctorDashboard, getAllPatients } from '../../../services/doctorService';

const DoctorDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboard, patientsList] = await Promise.all([
        getDoctorDashboard(),
        getAllPatients()
      ]);
      
      setDashboardData(dashboard);
      setPatients(patientsList.slice(0, 5)); // Get first 5 patients
    } catch (error: any) {
      toast.error(error.message || 'Failed to load dashboard');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      icon: Users,
      label: 'Total Patients',
      value: dashboardData?.stats?.totalPatients?.toString() || '0',
      change: '+12%',
      color: '#667eea',
      bgColor: '#f0f1ff',
    },
    {
      icon: Calendar,
      label: 'Appointments Today',
      value: dashboardData?.stats?.todayAppointments?.toString() || '0',
      change: '+5%',
      color: '#10b981',
      bgColor: '#d1fae5',
    },
    {
      icon: FileText,
      label: 'Pending Reports',
      value: '0',
      change: '-3%',
      color: '#f59e0b',
      bgColor: '#fef3c7',
    },
    {
      icon: AlertCircle,
      label: 'Active Cases',
      value: patients.length.toString(),
      change: '+8%',
      color: '#ef4444',
      bgColor: '#fee2e2',
    },
  ];

  const recentAppointments = dashboardData?.recentAppointments || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Critical': return 'danger';
      case 'Stable': return 'success';
      case 'Monitoring': return 'warning';
      case 'Follow-up': return 'info';
      default: return 'secondary';
    }
  };

  const handleViewPatient = (patientId: string) => {
    navigate(`/doctor/patient/${patientId}`);
  };

  const handleViewAllPatients = () => {
    navigate('/doctor/patients');
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: '#f8f9fa' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ background: '#f8f9fa', fontFamily: 'Inter, sans-serif' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="d-lg-flex">
        <div className="flex-grow-1">
          <Navbar onMenuClick={() => setSidebarOpen(true)} />
          
          <div className="container-fluid p-4">
            {/* Page Header */}
            <div className="mb-4">
              <h2 className="mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Doctor Dashboard
              </h2>
              <p className="text-muted">Welcome back! Here's your overview for today.</p>
            </div>

            {/* Stats Cards */}
            <div className="row g-4 mb-4">
              {stats.map((stat, idx) => (
                <div key={idx} className="col-6 col-lg-3">
                  <motion.div
                    className="card border-0 shadow-sm h-100"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  >
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="rounded-3 d-flex align-items-center justify-content-center"
                          style={{
                            width: '50px',
                            height: '50px',
                            backgroundColor: stat.bgColor,
                          }}>
                          <stat.icon size={24} style={{ color: stat.color }} />
                        </div>
                        <span className={`badge ${stat.change.startsWith('+') ? 'bg-success' : 'bg-danger'}`}>
                          {stat.change}
                        </span>
                      </div>
                      <h3 className="mb-1">{stat.value}</h3>
                      <p className="text-muted small mb-0">{stat.label}</p>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>

            <div className="row g-4">
              {/* Recent Patients Table */}
              <div className="col-lg-8">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h5 className="mb-0" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Recent Patients
                      </h5>
                      <button className="btn btn-sm btn-outline-primary" onClick={handleViewAllPatients}>
                        View All
                      </button>
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
                          {patients.length > 0 ? (
                            patients.map((patient, idx) => (
                              <motion.tr
                                key={patient._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: idx * 0.05 }}
                              >
                                <td className="small">{patient._id.slice(-6).toUpperCase()}</td>
                                <td>{patient.name}</td>
                                <td className="d-none d-md-table-cell small">{patient.email}</td>
                                <td className="d-none d-lg-table-cell small">{patient.phone || 'N/A'}</td>
                                <td>
                                  <button 
                                    className="btn btn-sm btn-light"
                                    onClick={() => handleViewPatient(patient._id)}
                                    title="View Patient Details"
                                  >
                                    <Eye size={16} />
                                  </button>
                                </td>
                              </motion.tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className="text-center text-muted py-4">
                                No patients found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upcoming Appointments */}
              <div className="col-lg-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <h5 className="mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Today's Appointments
                    </h5>

                    <div className="d-flex flex-column gap-3">
                      {recentAppointments.length > 0 ? (
                        recentAppointments.map((appointment: any, idx: number) => (
                          <motion.div
                            key={appointment._id}
                            className="p-3 rounded-3 border"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            style={{ background: '#f8f9fa' }}
                          >
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div className="rounded-2 px-2 py-1 text-white small"
                                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                                {appointment.appointmentTime}
                              </div>
                              <span className="badge bg-light text-dark">{appointment.status}</span>
                            </div>
                            <h6 className="mb-1">{appointment.patientId?.name || 'Unknown Patient'}</h6>
                            <p className="text-muted small mb-0">{appointment.reason}</p>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center text-muted py-4">
                          <Calendar size={48} className="mb-2 opacity-50" />
                          <p className="mb-0">No appointments today</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Chart */}
            <div className="row g-4 mt-2">
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h5 className="mb-0" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Patient Statistics
                      </h5>
                      <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-outline-secondary">Week</button>
                        <button className="btn btn-sm btn-primary">Month</button>
                        <button className="btn btn-sm btn-outline-secondary">Year</button>
                      </div>
                    </div>
                    
                    <div className="d-flex align-items-center justify-content-center py-5 text-muted">
                      <div className="text-center">
                        <TrendingUp size={48} className="mb-3" />
                        <p>Chart visualization would be displayed here</p>
                        <p className="small">Using Recharts library for detailed analytics</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
