import React, { useState, useRef, useEffect } from 'react';
import { Heart, FileText, Calendar, Activity, MessageSquare, Send, Bot, ThumbsUp, ThumbsDown, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { getPatientDashboard, getPatientReports } from '../../../services/patientService';
import { sendMessage, getChatHistory } from '../../../services/chatbotService';

const PatientDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
    loadChatHistory();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboard, reportsData] = await Promise.all([
        getPatientDashboard(),
        getPatientReports()
      ]);
      
      setDashboardData(dashboard);
      setReports(reportsData);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load dashboard');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChatHistory = async () => {
    try {
      const history = await getChatHistory();
      const formattedMessages = history.map((chat: any) => ([
        {
          id: `user-${chat._id}`,
          type: 'user',
          text: chat.message,
          timestamp: chat.timestamp,
          feedback: null
        },
        {
          id: `bot-${chat._id}`,
          type: 'bot',
          text: chat.reply,
          timestamp: chat.timestamp,
          feedback: null
        }
      ])).flat();
      
      if (formattedMessages.length === 0) {
        setMessages([{
          id: 'welcome',
          type: 'bot',
          text: 'Hello! I\'m your AI healthcare assistant. How can I help you today?',
          timestamp: new Date().toISOString(),
          feedback: null
        }]);
      } else {
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
      setMessages([{
        id: 'welcome',
        type: 'bot',
        text: 'Hello! I\'m your AI healthcare assistant. How can I help you today?',
        timestamp: new Date().toISOString(),
        feedback: null
      }]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const healthSummary = {
    heartRate: dashboardData?.patientDetails?.vitals?.heartRate || 'N/A',
    bloodPressure: dashboardData?.patientDetails?.vitals?.bloodPressure || 'N/A',
    temperature: dashboardData?.patientDetails?.vitals?.temperature || 'N/A',
    oxygenLevel: '98%',
  };

  const upcomingAppointments = dashboardData?.upcomingAppointments || [];
  const recentReports = reports.slice(0, 3);

  const quickQuestions = [
    'Check doctor availability',
    'View my lab reports',
    'What are clinic hours?',
    'When is my next appointment?',
  ];

  const handleSendMessage = async () => {
    if (message.trim()) {
      const userMessage = { 
        id: `user-${Date.now()}`,
        type: 'user', 
        text: message,
        timestamp: new Date().toISOString(),
        feedback: null
      };
      setMessages([...messages, userMessage]);
      const currentMessage = message;
      setMessage('');
      setIsTyping(true);

      try {
        const response = await sendMessage(currentMessage);
        setIsTyping(false);
        
        const botResponse = {
          id: `bot-${Date.now()}`,
          type: 'bot',
          text: response.reply,
          timestamp: response.timestamp,
          feedback: null
        };
        setMessages((prev) => [...prev, botResponse]);
      } catch (error: any) {
        setIsTyping(false);
        toast.error('Failed to send message');
        console.error('Chat error:', error);
      }
    }
  };

  const handleQuickQuestion = async (question: string) => {
    const userMessage = { 
      id: `user-${Date.now()}`,
      type: 'user', 
      text: question,
      timestamp: new Date().toISOString(),
      feedback: null
    };
    setMessages([...messages, userMessage]);
    setIsTyping(true);

    try {
      const response = await sendMessage(question);
      setIsTyping(false);
      
      const botResponse = {
        id: `bot-${Date.now()}`,
        type: 'bot',
        text: response.reply,
        timestamp: response.timestamp,
        feedback: null
      };
      setMessages((prev) => [...prev, botResponse]);
    } catch (error: any) {
      setIsTyping(false);
      toast.error('Failed to send message');
    }
  };

  const handleFeedback = (messageId: string, feedbackType: 'helpful' | 'not-helpful') => {
    setMessages(messages.map(msg => 
      msg.id === messageId ? { ...msg, feedback: feedbackType } : msg
    ));
    toast.success(`Thank you for your feedback!`);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const handleBookAppointment = () => {
    navigate('/patient/appointments');
  };

  const handleViewReports = () => {
    navigate('/patient/reports');
  };

  const handleDownloadReport = (filePath: string) => {
    if (!filePath) {
      toast.error('Report file path not found');
      return;
    }
    
    // filePath from database could be:
    // - "uploads/report-123.jpg" (Linux/Mac)
    // - "uploads\\report-123.jpg" (Windows)
    // - "report-123.jpg" (if uploads/ was stripped)
    
    // Normalize path separators and remove 'uploads/' prefix
    const normalizedPath = filePath.replace(/\\/g, '/');
    const fileName = normalizedPath.replace(/^uploads\//, '');
    
    // Construct download URL
    const downloadUrl = `http://localhost:5000/uploads/${fileName}`;
    
    console.log('Original filePath:', filePath);
    console.log('Normalized fileName:', fileName);
    console.log('Download URL:', downloadUrl);
    
    // Open in new tab
    window.open(downloadUrl, '_blank');
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
                My Health Dashboard
              </h2>
              <p className="text-muted">Track your health and manage your appointments.</p>
            </div>

            <div className="row g-4">
              {/* Health Summary Card */}
              <div className="col-lg-8">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <h5 className="mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Health Summary
                    </h5>
                    
                    <div className="row g-3">
                      <div className="col-6 col-md-3">
                        <div className="p-3 rounded-3 text-center" style={{ background: '#f0f1ff' }}>
                          <Heart size={24} className="mb-2" style={{ color: '#667eea' }} />
                          <h6 className="mb-1">{healthSummary.heartRate}</h6>
                          <small className="text-muted">Heart Rate</small>
                        </div>
                      </div>
                      <div className="col-6 col-md-3">
                        <div className="p-3 rounded-3 text-center" style={{ background: '#d1fae5' }}>
                          <Activity size={24} className="mb-2" style={{ color: '#10b981' }} />
                          <h6 className="mb-1">{healthSummary.bloodPressure}</h6>
                          <small className="text-muted">Blood Pressure</small>
                        </div>
                      </div>
                      <div className="col-6 col-md-3">
                        <div className="p-3 rounded-3 text-center" style={{ background: '#fef3c7' }}>
                          <Activity size={24} className="mb-2" style={{ color: '#f59e0b' }} />
                          <h6 className="mb-1">{healthSummary.temperature}</h6>
                          <small className="text-muted">Temperature</small>
                        </div>
                      </div>
                      <div className="col-6 col-md-3">
                        <div className="p-3 rounded-3 text-center" style={{ background: '#cffafe' }}>
                          <Activity size={24} className="mb-2" style={{ color: '#06b6d4' }} />
                          <h6 className="mb-1">{healthSummary.oxygenLevel}</h6>
                          <small className="text-muted">Oxygen Level</small>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-4">
                      <h6 className="mb-3">Quick Actions</h6>
                      <div className="d-flex flex-wrap gap-2">
                        <button 
                          className="btn btn-primary"
                          onClick={handleBookAppointment}
                        >
                          <Calendar size={16} className="me-2" />
                          Book Appointment
                        </button>
                        <button 
                          className="btn btn-outline-primary"
                          onClick={handleViewReports}
                        >
                          <FileText size={16} className="me-2" />
                          View Reports
                        </button>
                        <button 
                          className="btn btn-outline-primary"
                          onClick={() => setChatOpen(true)}
                        >
                          <MessageSquare size={16} className="me-2" />
                          Chat with AI
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Reports */}
                <div className="card border-0 shadow-sm mt-4">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h5 className="mb-0" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Recent Reports
                      </h5>
                      <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={handleViewReports}
                      >
                        View All
                      </button>
                    </div>

                    {recentReports.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-hover align-middle">
                          <thead className="bg-light">
                            <tr>
                              <th className="border-0">Report Name</th>
                              <th className="border-0 d-none d-md-table-cell">Date</th>
                              <th className="border-0 d-none d-lg-table-cell">Uploaded By</th>
                              <th className="border-0">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recentReports.map((report: any) => (
                              <tr key={report._id}>
                                <td>{report.title}</td>
                                <td className="d-none d-md-table-cell small">
                                  {new Date(report.createdAt).toLocaleDateString()}
                                </td>
                                <td className="d-none d-lg-table-cell small">
                                  {report.uploadedBy?.name || 'N/A'}
                                </td>
                                <td>
                                  <button 
                                    className="btn btn-sm btn-primary"
                                    onClick={() => handleDownloadReport(report.filePath)}
                                    title="Download Report"
                                  >
                                    <Download size={16} className="me-1" />
                                    Download
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
                        <p>No reports available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Upcoming Appointment */}
              <div className="col-lg-4">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <h5 className="mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Upcoming Appointment
                    </h5>

                    {upcomingAppointments.length > 0 ? (
                      upcomingAppointments.slice(0, 1).map((appointment: any) => (
                        <div key={appointment._id} className="p-4 rounded-3" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                          <div className="text-white">
                            <h6 className="mb-3">{appointment.doctorId?.name || 'Doctor'}</h6>
                            <div className="d-flex align-items-center gap-2 mb-2">
                              <Calendar size={16} />
                              <span>{new Date(appointment.appointmentDate).toLocaleDateString()}</span>
                            </div>
                            <div className="d-flex align-items-center gap-2 mb-3">
                              <Activity size={16} />
                              <span>{appointment.appointmentTime}</span>
                            </div>
                            <p className="mb-0 small opacity-90">{appointment.reason}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-muted">
                        <Calendar size={48} className="mb-2 opacity-50" />
                        <p>No upcoming appointments</p>
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={handleBookAppointment}
                        >
                          Book Now
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Chatbot Modal */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{ background: 'rgba(0,0,0,0.5)', zIndex: 9999 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setChatOpen(false)}
          >
            <motion.div
              className="bg-white rounded-4 shadow-lg"
              style={{ width: '90%', maxWidth: '600px', height: '80vh', maxHeight: '700px' }}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Chat Header */}
              <div className="p-4 border-bottom d-flex justify-content-between align-items-center"
                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-circle bg-white p-2">
                    <Bot size={24} style={{ color: '#667eea' }} />
                  </div>
                  <div className="text-white">
                    <h6 className="mb-0">AI Health Assistant</h6>
                    <small className="opacity-90">Always here to help</small>
                  </div>
                </div>
                <button 
                  className="btn btn-link text-white p-0"
                  onClick={() => setChatOpen(false)}
                >
                  ✕
                </button>
              </div>

              {/* Chat Messages */}
              <div className="p-4 overflow-auto" style={{ height: 'calc(80vh - 200px)', maxHeight: '500px' }}>
                {messages.map((msg) => (
                  <div key={msg.id} className={`mb-3 d-flex ${msg.type === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                    <div style={{ maxWidth: '75%' }}>
                      <div className={`p-3 rounded-3 ${msg.type === 'user' ? 'bg-primary text-white' : 'bg-light'}`}>
                        <p className="mb-0">{msg.text}</p>
                      </div>
                      <small className="text-muted d-block mt-1">{formatTime(msg.timestamp)}</small>
                      
                      {msg.type === 'bot' && (
                        <div className="d-flex gap-2 mt-2">
                          <button
                            className={`btn btn-sm ${msg.feedback === 'helpful' ? 'btn-success' : 'btn-outline-secondary'}`}
                            onClick={() => handleFeedback(msg.id, 'helpful')}
                            disabled={msg.feedback !== null}
                          >
                            <ThumbsUp size={14} />
                          </button>
                          <button
                            className={`btn btn-sm ${msg.feedback === 'not-helpful' ? 'btn-danger' : 'btn-outline-secondary'}`}
                            onClick={() => handleFeedback(msg.id, 'not-helpful')}
                            disabled={msg.feedback !== null}
                          >
                            <ThumbsDown size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="mb-3">
                    <div className="p-3 rounded-3 bg-light" style={{ maxWidth: '75%' }}>
                      <div className="d-flex gap-1">
                        <span className="spinner-grow spinner-grow-sm" role="status"></span>
                        <span className="spinner-grow spinner-grow-sm" role="status"></span>
                        <span className="spinner-grow spinner-grow-sm" role="status"></span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Questions */}
              <div className="px-4 pb-2">
                <div className="d-flex flex-wrap gap-2">
                  {quickQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleQuickQuestion(q)}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input */}
              <div className="p-4 border-top">
                <div className="d-flex gap-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button 
                    className="btn btn-primary"
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isTyping}
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PatientDashboard;
