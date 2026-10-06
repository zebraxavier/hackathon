import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Users, Upload, FileText, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import DashboardLayout from '../../components/DashboardLayout';
import { uploadReport, getAllPatients, getUploadedReports, updatePatientVitals } from '../../../services/nurseService';

type NurseView = 'dashboard' | 'upload' | 'vitals';

const REPORT_TYPES: Record<string, string> = {
  lab: 'Lab Report',
  radiology: 'X-Ray/Scan',
  prescription: 'Prescription',
  discharge: 'Discharge Summary',
  other: 'Other',
};

const ACCEPTED_FILES = '.pdf,.jpg,.jpeg,.png,.doc,.docx';
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const getTimeAgo = (date: Date) => {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  const hours = Math.floor(seconds / 3600);
  if (seconds < 86400) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(seconds / 86400);
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

const PatientSelect = ({ id, patients, value, onChange }: {
  id: string;
  patients: any[];
  value: string;
  onChange: (value: string) => void;
}) => (
  <select id={id} className="form-select" value={value} onChange={(e) => onChange(e.target.value)} required>
    <option value="">Choose patient...</option>
    {patients.map((patient) => (
      <option key={patient._id} value={patient._id}>
        {patient.name} - {patient.email}
      </option>
    ))}
  </select>
);

const emptyVitals = { bloodPressure: '', heartRate: '', temperature: '', weight: '', height: '' };

const NurseDashboard = ({ view = 'dashboard' }: { view?: NurseView }) => {
  const [patients, setPatients] = useState<any[]>([]);
  const [recentUploads, setRecentUploads] = useState<any[]>([]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadPatient, setUploadPatient] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [vitalsPatient, setVitalsPatient] = useState('');
  const [vitals, setVitals] = useState(emptyVitals);
  const [savingVitals, setSavingVitals] = useState(false);

  const loadReports = useCallback(async () => {
    try {
      setRecentUploads(await getUploadedReports());
    } catch (error: any) {
      toast.error(error.message || 'Failed to load recent uploads');
    }
  }, []);

  useEffect(() => {
    getAllPatients()
      .then(setPatients)
      .catch((error) => toast.error(error.message || 'Failed to load patients list'));
    loadReports();
  }, [loadReports]);

  const selectFile = (file?: File) => {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File is too large (max 10MB)');
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('patientId', uploadPatient);
      formData.append('reportType', documentType);
      formData.append('title', `${REPORT_TYPES[documentType]} - ${selectedFile.name}`);

      await uploadReport(formData);
      toast.success('Document uploaded successfully!');
      loadReports();

      setSelectedFile(null);
      setUploadPatient('');
      setDocumentType('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    const toNumber = (value: string) => (value === '' ? undefined : Number(value));
    const payload = {
      bloodPressure: vitals.bloodPressure.trim() || undefined,
      heartRate: toNumber(vitals.heartRate),
      temperature: toNumber(vitals.temperature),
      weight: toNumber(vitals.weight),
      height: toNumber(vitals.height),
    };

    if (Object.values(payload).every((v) => v === undefined)) {
      toast.error('Enter at least one vital sign');
      return;
    }

    setSavingVitals(true);
    try {
      await updatePatientVitals(vitalsPatient, payload);
      toast.success('Vitals updated successfully');
      setVitals(emptyVitals);
      setVitalsPatient('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update vitals');
    } finally {
      setSavingVitals(false);
    }
  };

  const stats = [
    { icon: Users, label: 'Registered Patients', value: patients.length, color: '#667eea', bg: '#f0f1ff' },
    { icon: Upload, label: 'My Recent Uploads', value: recentUploads.length, color: '#10b981', bg: '#d1fae5' },
  ];

  const uploadCard = (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body">
        <h5 className="mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Upload Report</h5>

        <form onSubmit={handleUpload}>
          <div
            className="border border-2 rounded-4 p-5 text-center"
            style={{
              borderStyle: 'dashed',
              borderColor: '#667eea',
              background: isDragging ? 'rgba(102, 126, 234, 0.12)' : 'rgba(102, 126, 234, 0.05)',
              cursor: 'pointer',
            }}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              selectFile(e.dataTransfer.files?.[0]);
            }}
            role="button"
            tabIndex={0}
            aria-label="Select a file to upload"
          >
            <input
              ref={fileInputRef}
              type="file"
              className="d-none"
              onChange={(e) => selectFile(e.target.files?.[0])}
              accept={ACCEPTED_FILES}
            />
            <Upload size={48} className="mb-3" style={{ color: '#667eea' }} />
            <h6 className="mb-2">Drag & Drop a File Here</h6>
            <p className="text-muted small mb-3">PDF, JPG, PNG, DOC or DOCX — max 10MB</p>
            {selectedFile ? (
              <div className="alert alert-success py-2 mb-0">
                <small>Selected: {selectedFile.name}</small>
              </div>
            ) : (
              <span className="btn btn-primary">Select File</span>
            )}
          </div>

          <div className="mt-4">
            <label className="form-label" htmlFor="upload-patient">Patient</label>
            <div className="mb-3">
              <PatientSelect id="upload-patient" patients={patients} value={uploadPatient} onChange={setUploadPatient} />
            </div>

            <label className="form-label" htmlFor="upload-type">Document Type</label>
            <select
              id="upload-type"
              className="form-select mb-3"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              required
            >
              <option value="">Choose type...</option>
              {Object.entries(REPORT_TYPES).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>

            <button
              type="submit"
              className="btn w-100 text-white"
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const vitalsField = (field: keyof typeof emptyVitals, label: string, props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div className="col-6">
      <label className="form-label" htmlFor={`vitals-${field}`}>{label}</label>
      <input
        id={`vitals-${field}`}
        className="form-control"
        value={vitals[field]}
        onChange={(e) => setVitals((current) => ({ ...current, [field]: e.target.value }))}
        {...props}
      />
    </div>
  );

  const vitalsCard = (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body">
        <h5 className="mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
          <Activity size={20} className="me-2" />
          Update Vitals
        </h5>
        <form onSubmit={handleSaveVitals}>
          <label className="form-label" htmlFor="vitals-patient">Patient</label>
          <div className="mb-3">
            <PatientSelect id="vitals-patient" patients={patients} value={vitalsPatient} onChange={setVitalsPatient} />
          </div>
          <div className="row g-3 mb-4">
            {vitalsField('bloodPressure', 'Blood Pressure', { placeholder: '120/80', pattern: '\\d{2,3}/\\d{2,3}' })}
            {vitalsField('heartRate', 'Heart Rate (bpm)', { type: 'number', min: 20, max: 250 })}
            {vitalsField('temperature', 'Temperature', { type: 'number', step: '0.1', min: 25, max: 115 })}
            {vitalsField('weight', 'Weight (kg)', { type: 'number', step: '0.1', min: 0 })}
            {vitalsField('height', 'Height (cm)', { type: 'number', step: '0.1', min: 0 })}
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={savingVitals}>
            {savingVitals ? 'Saving...' : 'Save Vitals'}
          </button>
        </form>
      </div>
    </div>
  );

  const recentUploadsCard = (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body">
        <h5 className="mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Recent Uploads</h5>
        <div className="d-flex flex-column gap-3">
          {recentUploads.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <Upload size={48} className="mb-3 opacity-50" />
              <p className="mb-0">No uploads yet.</p>
            </div>
          ) : (
            recentUploads.slice(0, 6).map((upload, idx) => (
              <motion.div
                key={upload._id}
                className="d-flex align-items-start gap-3 p-3 rounded-3 border"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                style={{ background: '#f8f9fa' }}
              >
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: '45px', height: '45px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                >
                  <FileText size={20} className="text-white" />
                </div>
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <h6 className="mb-1">{upload.patientId?.name || 'Unknown Patient'}</h6>
                  <p className="text-muted small mb-1 text-truncate">
                    {REPORT_TYPES[upload.reportType] || upload.reportType} • {upload.fileName}
                  </p>
                  <small className="text-muted">{getTimeAgo(new Date(upload.createdAt))}</small>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const titles: Record<NurseView, string> = {
    dashboard: 'Nurse Dashboard',
    upload: 'Upload Reports',
    vitals: 'Update Vitals',
  };

  return (
    <DashboardLayout title={titles[view]} subtitle="Manage patient care and documentation efficiently.">
      {view === 'dashboard' && (
        <div className="row g-4 mb-4">
          {stats.map((stat) => (
            <div key={stat.label} className="col-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body d-flex align-items-center gap-3">
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center"
                    style={{ width: '50px', height: '50px', backgroundColor: stat.bg }}
                  >
                    <stat.icon size={24} style={{ color: stat.color }} />
                  </div>
                  <div>
                    <h3 className="mb-0">{stat.value}</h3>
                    <p className="text-muted small mb-0">{stat.label}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="row g-4">
        {view !== 'vitals' && <div className="col-lg-6">{uploadCard}</div>}
        {view !== 'upload' && <div className="col-lg-6">{vitalsCard}</div>}
        {view === 'upload' && <div className="col-lg-6">{recentUploadsCard}</div>}
        {view === 'dashboard' && <div className="col-12">{recentUploadsCard}</div>}
      </div>
    </DashboardLayout>
  );
};

export default NurseDashboard;
