import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  ArrowLeft, User, Calendar, Phone, Mail, MapPin,
  FileText, Activity, Pill, Download, Heart, Thermometer,
} from 'lucide-react';
import { toast } from 'sonner';
import DashboardLayout, { LoadingState } from '../../components/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { getPatientDetails } from '../../../services/doctorService';
import { downloadReport } from '../../../services/reportService';
import { formatAppointmentDate, formatTimestamp } from '../../utils/dates';

const calculateAge = (dob?: string) => {
  if (!dob) return null;
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getUTCFullYear() - birth.getUTCFullYear();
  const beforeBirthday = now.getUTCMonth() < birth.getUTCMonth()
    || (now.getUTCMonth() === birth.getUTCMonth() && now.getUTCDate() < birth.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age;
};

const STATUS_BADGE: Record<string, string> = {
  scheduled: 'bg-primary',
  completed: 'bg-success',
  cancelled: 'bg-secondary',
  'no-show': 'bg-warning text-dark',
};

const InfoItem = ({ icon: Icon, label, value }: { icon: typeof User; label: string; value?: string | null }) => (
  <div className="col-sm-6 col-lg-4">
    <div className="d-flex align-items-center gap-2">
      <Icon size={18} className="text-muted flex-shrink-0" />
      <div style={{ minWidth: 0 }}>
        <small className="text-muted d-block">{label}</small>
        <strong className="small text-break">{value || 'N/A'}</strong>
      </div>
    </div>
  </div>
);

const EmptyState = ({ icon: Icon, text }: { icon: typeof User; text: string }) => (
  <div className="text-center text-muted py-4">
    <Icon size={40} className="mb-2 opacity-50" />
    <p className="mb-0">{text}</p>
  </div>
);

const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getPatientDetails(id)
      .then(setData)
      .catch((error) => toast.error(error.message || 'Failed to load patient'))
      .finally(() => setLoading(false));
  }, [id]);

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

  const backButton = (
    <button className="btn btn-light d-flex align-items-center gap-2" onClick={() => navigate('/doctor/patients')}>
      <ArrowLeft size={18} />
      Back to Patients
    </button>
  );

  if (loading) {
    return (
      <DashboardLayout title="Patient Details" actions={backButton}>
        <LoadingState label="Loading patient..." />
      </DashboardLayout>
    );
  }

  if (!data?.patient) {
    return (
      <DashboardLayout title="Patient Details" actions={backButton}>
        <EmptyState icon={User} text="Patient not found." />
      </DashboardLayout>
    );
  }

  const { patient, patientDetails, reports = [], appointments = [] } = data;
  const vitals = patientDetails?.vitals || {};
  const age = calculateAge(patient.dateOfBirth);
  const medications = patientDetails?.medications || [];
  const history = patientDetails?.medicalHistory || [];
  const allergies: string[] = patientDetails?.allergies || [];

  return (
    <DashboardLayout title="Patient Details" actions={backButton}>
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="row">
            <div className="col-md-3 text-center mb-3 mb-md-0">
              <div
                className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                style={{ width: '120px', height: '120px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
              >
                <User size={50} className="text-white" />
              </div>
              <h4 className="mb-1">{patient.name}</h4>
              <p className="text-muted mb-0 small">ID: {patient._id.slice(-6).toUpperCase()}</p>
            </div>

            <div className="col-md-9">
              <div className="row g-3">
                <InfoItem
                  icon={Calendar}
                  label="Age / Gender"
                  value={`${age ?? 'N/A'} / ${patient.gender ? patient.gender[0].toUpperCase() + patient.gender.slice(1) : 'N/A'}`}
                />
                <InfoItem icon={Phone} label="Phone" value={patient.phone} />
                <InfoItem icon={Mail} label="Email" value={patient.email} />
                <InfoItem icon={MapPin} label="Address" value={patient.address} />
                <InfoItem icon={Calendar} label="Registered" value={formatTimestamp(patient.createdAt)} />
              </div>

              {allergies.length > 0 && (
                <div className="mt-4 p-3 rounded-3 bg-danger-subtle">
                  <strong>Allergies:</strong> {allergies.join(', ')}
                </div>
              )}

              <div className="row g-3 mt-2">
                {[
                  { icon: Heart, label: 'Heart Rate', value: vitals.heartRate ? `${vitals.heartRate} bpm` : null },
                  { icon: Activity, label: 'Blood Pressure', value: vitals.bloodPressure },
                  { icon: Thermometer, label: 'Temperature', value: vitals.temperature ? `${vitals.temperature}°` : null },
                ].map((v) => (
                  <InfoItem key={v.label} icon={v.icon} label={v.label} value={v.value} />
                ))}
              </div>
              {vitals.lastUpdated && (
                <small className="text-muted d-block mt-2">Vitals last updated {formatTimestamp(vitals.lastUpdated)}</small>
              )}
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="reports" className="w-100">
        <TabsList className="mb-4">
          <TabsTrigger value="reports">Reports ({reports.length})</TabsTrigger>
          <TabsTrigger value="appointments">Appointments ({appointments.length})</TabsTrigger>
          <TabsTrigger value="history">Medical History</TabsTrigger>
        </TabsList>

        <TabsContent value="reports">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              {reports.length === 0 ? (
                <EmptyState icon={FileText} text="No reports uploaded for this patient." />
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="bg-light">
                      <tr>
                        <th>Report</th>
                        <th className="d-none d-md-table-cell">Type</th>
                        <th>Date</th>
                        <th className="d-none d-lg-table-cell">Uploaded By</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map((report: any) => (
                        <tr key={report._id}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <FileText size={18} className="text-primary flex-shrink-0" />
                              {report.title}
                            </div>
                          </td>
                          <td className="d-none d-md-table-cell text-capitalize">{report.reportType}</td>
                          <td>{formatTimestamp(report.createdAt)}</td>
                          <td className="d-none d-lg-table-cell small">{report.uploadedBy?.name || 'N/A'}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-primary"
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
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="appointments">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              {appointments.length === 0 ? (
                <EmptyState icon={Calendar} text="No appointments for this patient." />
              ) : (
                <div className="d-flex flex-column gap-3">
                  {appointments.map((a: any) => (
                    <div key={a._id} className="p-3 rounded-3 border" style={{ background: '#f8f9fa' }}>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <h6 className="mb-1">{a.reason}</h6>
                          <p className="text-muted small mb-0">
                            {formatAppointmentDate(a.appointmentDate)} · {a.appointmentTime} · {a.doctorId?.name || 'N/A'}
                          </p>
                        </div>
                        <span className={`badge text-capitalize ${STATUS_BADGE[a.status] || 'bg-secondary'}`}>{a.status}</span>
                      </div>
                      {a.notes && <p className="mb-0 small"><strong>Notes:</strong> {a.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="row g-4">
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h6 className="mb-3">Conditions</h6>
                  {history.length === 0 ? (
                    <EmptyState icon={Activity} text="No medical history recorded." />
                  ) : (
                    history.map((item: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-3 border mb-2">
                        <strong>{item.condition}</strong>
                        {item.diagnosedDate && (
                          <small className="text-muted d-block">Diagnosed {formatTimestamp(item.diagnosedDate)}</small>
                        )}
                        {item.notes && <p className="small mb-0 mt-1">{item.notes}</p>}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h6 className="mb-3">Medications</h6>
                  {medications.length === 0 ? (
                    <EmptyState icon={Pill} text="No medications recorded." />
                  ) : (
                    medications.map((m: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-3 border mb-2">
                        <strong>{m.name}</strong>
                        <small className="text-muted d-block">
                          {[m.dosage, m.frequency].filter(Boolean).join(' · ') || 'No dosage details'}
                        </small>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default PatientDetails;
