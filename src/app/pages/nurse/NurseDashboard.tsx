import React, { useState, useEffect } from 'react';
import { Users, Upload, Activity, CheckCircle, FileText, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { uploadReport, getAllPatients, getUploadedReports } from '../../../services/nurseService';
import { toast } from 'sonner';

const NurseDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [patients, setPatients] = useState<any[]>([]);
  const [recentUploads, setRecentUploads] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Load patients and reports on mount
  useEffect(() => {
    loadPatients();
    loadReports();
  }, []);

  const loadPatients = async () => {
    try {
      const patientsData = await getAllPatients();
      setPatients(patientsData);
    } catch (error: any) {
      console.error('Failed to load patients:', error);
      toast.error('Failed to load patients list');
    }
  };

  const loadReports = async () => {
    try {
      const reports = await getUploadedReports();
      setRecentUploads(reports);
    } catch (error: any) {
      console.error('Failed to load reports:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleUploadDocument = async () => {
    // Validation
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }
    if (!selectedPatient) {
      toast.error('Please select a patient');
      return;
    }
    if (!documentType) {
      toast.error('Please select a document type');
      return;
    }

    setIsUploading(true);

    try {
      // Map document type to display name
      const typeDisplayNames: Record<string, string> = {
        'lab': 'Lab Report',
        'radiology': 'X-Ray/Scan',
        'prescription': 'Prescription',
        'discharge': 'Discharge Summary',
        'other': 'Other'
      };

      // Create FormData
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('patientId', selectedPatient);
      formData.append('reportType', documentType);
      formData.append('title', `${typeDisplayNames[documentType]} - ${selectedFile.name}`);
      formData.append('description', `${typeDisplayNames[documentType]} uploaded by nurse`);

      // Upload
      await uploadReport(formData);
      
      toast.success('Document uploaded successfully!');
      
      // Reload reports to show the new upload
      loadReports();
      
      // Reset form
      setSelectedFile(null);
      setSelectedPatient('');
      setDocumentType('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const stats = [
    {
      icon: Users,
      label: 'Patients Assigned',
      value: patients.length.toString(),
      change: '+6%',
      color: '#667eea',
      bgColor: '#f0f1ff',
    },
    {
      icon: Upload,
      label: 'Reports Uploaded',
      value: recentUploads.length.toString(),
      change: '+15%',
      color: '#10b981',
      bgColor: '#d1fae5',
    },
    {
      icon: Activity,
      label: 'Vitals Updated',
      value: '34',
      change: '+8%',
      color: '#f59e0b',
      bgColor: '#fef3c7',
    },
    {
      icon: CheckCircle,
      label: 'Tasks Completed',
      value: '67',
      change: '+12%',
      color: '#06b6d4',
      bgColor: '#cffafe',
    },
  ];

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hour${Math.floor(seconds / 3600) > 1 ? 's' : ''} ago`;
    return `${Math.floor(seconds / 86400)} day${Math.floor(seconds / 86400) > 1 ? 's' : ''} ago`;
  };

  const recentUploadsData = [
    { id: 1, patient: 'John Doe', type: 'Lab Report', file: 'blood_test_report.pdf', time: '10 min ago', status: 'Uploaded' },
    { id: 2, patient: 'Jane Smith', type: 'X-Ray', file: 'chest_xray.jpg', time: '25 min ago', status: 'Uploaded' },
    { id: 3, patient: 'Mike Johnson', type: 'ECG Report', file: 'ecg_results.pdf', time: '1 hour ago', status: 'Uploaded' },
    { id: 4, patient: 'Sarah Williams', type: 'Blood Pressure', file: 'bp_readings.csv', time: '2 hours ago', status: 'Uploaded' },
  ];

  const pendingTasks = [
    { id: 1, patient: 'Emily Brown', task: 'Update vital signs', priority: 'High', due: '11:00 AM' },
    { id: 2, patient: 'David Lee', task: 'Upload lab results', priority: 'Medium', due: '02:00 PM' },
    { id: 3, patient: 'Lisa Chen', task: 'Record medication', priority: 'High', due: '03:30 PM' },
    { id: 4, patient: 'Tom Wilson', task: 'Update case notes', priority: 'Low', due: '05:00 PM' },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'danger';
      case 'Medium': return 'warning';
      case 'Low': return 'info';
      default: return 'secondary';
    }
  };

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
                Nurse Dashboard
              </h2>
              <p className="text-muted">Manage patient care and documentation efficiently.</p>
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
              {/* Quick Upload Section */}
              <div className="col-lg-6">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <h5 className="mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Quick Upload
                    </h5>

                    <div 
                      className="border-2 border-dashed rounded-4 p-5 text-center"
                      style={{ 
                        borderColor: '#667eea',
                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)';
                      }}
                      onClick={handleBrowseClick}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="d-none"
                        onChange={handleFileSelect}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.csv"
                      />
                      <Upload size={48} className="mb-3" style={{ color: '#667eea' }} />
                      <h6 className="mb-2">Drag & Drop Files Here</h6>
                      <p className="text-muted small mb-3">or click to browse</p>
                      {selectedFile ? (
                        <div className="alert alert-success py-2 mb-0">
                          <small>Selected: {selectedFile.name}</small>
                        </div>
                      ) : (
                        <button className="btn btn-primary" type="button">
                          Select Files
                        </button>
                      )}
                    </div>

                    <div className="mt-4">
                      <label className="form-label">Select Patient</label>
                      <select 
                        className="form-select mb-3"
                        value={selectedPatient}
                        onChange={(e) => setSelectedPatient(e.target.value)}
                      >
                        <option value="">Choose patient...</option>
                        {patients.map((patient) => (
                          <option key={patient._id} value={patient._id}>
                            {patient.name} - {patient.email}
                          </option>
                        ))}
                      </select>

                      <label className="form-label">Document Type</label>
                      <select 
                        className="form-select mb-3"
                        value={documentType}
                        onChange={(e) => setDocumentType(e.target.value)}
                      >
                        <option value="">Choose type...</option>
                        <option value="lab">Lab Report</option>
                        <option value="radiology">X-Ray/Scan</option>
                        <option value="prescription">Prescription</option>
                        <option value="discharge">Discharge Summary</option>
                        <option value="other">Other</option>
                      </select>

                      <button 
                        className="btn w-100 text-white"
                        style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        }}
                        onClick={handleUploadDocument}
                        disabled={isUploading}
                      >
                        {isUploading ? 'Uploading...' : 'Upload Document'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Uploads */}
              <div className="col-lg-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h5 className="mb-0" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Recent Uploads
                      </h5>
                      <button className="btn btn-sm btn-outline-primary">View All</button>
                    </div>

                    <div className="d-flex flex-column gap-3">
                      {recentUploads.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                          <Upload size={48} className="mb-3 opacity-50" />
                          <p>No uploads yet. Upload your first document above.</p>
                        </div>
                      ) : (
                        recentUploads.slice(0, 4).map((upload, idx) => {
                          const timeAgo = getTimeAgo(new Date(upload.createdAt));
                          const reportTypeDisplay = {
                            'lab': 'Lab Report',
                            'radiology': 'X-Ray/Scan',
                            'prescription': 'Prescription',
                            'discharge': 'Discharge Summary',
                            'other': 'Other'
                          }[upload.reportType] || upload.reportType;

                          return (
                            <motion.div
                              key={upload._id}
                              className="d-flex align-items-start gap-3 p-3 rounded-3 border"
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              style={{ background: '#f8f9fa' }}
                            >
                              <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                                style={{
                                  width: '45px',
                                  height: '45px',
                                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                }}>
                                <FileText size={20} className="text-white" />
                              </div>
                              <div className="flex-grow-1">
                                <h6 className="mb-1">{upload.patientId?.name || 'Unknown Patient'}</h6>
                                <p className="text-muted small mb-1">{reportTypeDisplay} • {upload.fileName}</p>
                                <div className="d-flex justify-content-between align-items-center">
                                  <small className="text-muted">{timeAgo}</small>
                                  <span className="badge bg-success">Uploaded</span>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pending Tasks */}
            <div className="row g-4 mt-2">
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h5 className="mb-0" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Pending Tasks
                      </h5>
                      <button className="btn btn-sm btn-primary">Add Task</button>
                    </div>

                    <div className="table-responsive">
                      <table className="table table-hover align-middle">
                        <thead className="bg-light">
                          <tr>
                            <th className="border-0">Patient</th>
                            <th className="border-0">Task</th>
                            <th className="border-0">Priority</th>
                            <th className="border-0">Due Time</th>
                            <th className="border-0">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pendingTasks.map((task, idx) => (
                            <motion.tr
                              key={idx}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: idx * 0.05 }}
                            >
                              <td>{task.patient}</td>
                              <td>{task.task}</td>
                              <td>
                                <span className={`badge bg-${getPriorityColor(task.priority)}`}>
                                  {task.priority}
                                </span>
                              </td>
                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  <Clock size={14} className="text-muted" />
                                  <span className="small">{task.due}</span>
                                </div>
                              </td>
                              <td>
                                <button className="btn btn-sm btn-success me-2">Complete</button>
                                <button className="btn btn-sm btn-light">View</button>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
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

export default NurseDashboard;
