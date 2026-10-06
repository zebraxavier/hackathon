import React, { useState } from 'react';
import { HelpCircle, Mail, Search, AlertTriangle } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';

// Configure the clinic's support inbox at build time.
const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || '';

const FAQS: Record<string, { question: string; answer: string }[]> = {
  patient: [
    {
      question: 'How do I book an appointment?',
      answer: 'Click "Book Appointment" on your dashboard or open Appointments from the menu, then choose a doctor, date and time.',
    },
    {
      question: 'How can I access my reports?',
      answer: 'Open "My Reports" from the menu. Reports uploaded by your care team can be downloaded from there.',
    },
    {
      question: 'Can I cancel an appointment?',
      answer: 'Please contact the clinic to cancel or reschedule. Your doctor will update the appointment status.',
    },
    {
      question: 'Is the AI assistant a replacement for a doctor?',
      answer: 'No. The AI assistant provides general first aid guidance only. It cannot diagnose conditions or prescribe treatment. Always consult a qualified doctor.',
    },
  ],
  doctor: [
    {
      question: 'How do I view a patient\'s records?',
      answer: 'Open Patients from the menu and click the view icon next to a patient to see their reports, vitals and appointment history.',
    },
    {
      question: 'How do I update an appointment?',
      answer: 'Open Appointments from the menu and mark scheduled visits as completed, no-show or cancelled.',
    },
  ],
  nurse: [
    {
      question: 'Which file types can I upload?',
      answer: 'PDF, JPG, PNG, DOC and DOCX files up to 10MB.',
    },
    {
      question: 'How do I record vitals?',
      answer: 'Open Update Vitals from the menu, select the patient and enter the readings. Patients see their latest vitals on their dashboard.',
    },
  ],
};

const COMMON_FAQS = [
  {
    question: 'How do I change my password?',
    answer: 'Go to Profile Settings → Security and enter your current and new password.',
  },
];

const HelpSupport = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [subject, setSubject] = useState('Technical Issue');
  const [message, setMessage] = useState('');

  const faqs = [...(FAQS[user?.role || 'patient'] || []), ...COMMON_FAQS];
  const query = searchQuery.toLowerCase();
  const filteredFaqs = faqs.filter(
    (faq) => faq.question.toLowerCase().includes(query) || faq.answer.toLowerCase().includes(query)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = `${message.trim()}\n\n---\nAccount: ${user?.email} (${user?.role})`;
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`[Support] ${subject}`)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <DashboardLayout title="Help & Support" subtitle="Answers to common questions and how to reach us">
      <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
        <AlertTriangle size={20} className="flex-shrink-0" />
        <span>For a medical emergency, call your local emergency number immediately. Do not use this page.</span>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>Frequently Asked Questions</h5>

              <div className="input-group mb-4">
                <span className="input-group-text bg-white"><Search size={18} className="text-muted" /></span>
                <input
                  type="search"
                  className="form-control"
                  placeholder="Search FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search FAQs"
                />
              </div>

              <div className="d-flex flex-column gap-2">
                {filteredFaqs.map((faq) => (
                  <details key={faq.question} className="rounded-3 border bg-light">
                    <summary className="p-3 d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
                      <HelpCircle size={18} className="text-primary flex-shrink-0" />
                      {faq.question}
                    </summary>
                    <div className="px-3 pb-3 bg-light">{faq.answer}</div>
                  </details>
                ))}
              </div>

              {filteredFaqs.length === 0 && (
                <p className="text-center py-4 text-muted mb-0">No FAQs found matching your search.</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="mb-3 d-flex align-items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                <Mail size={20} />
                Contact Support
              </h5>

              {SUPPORT_EMAIL ? (
                <form onSubmit={handleSubmit}>
                  <p className="text-muted small">
                    This opens an email to <strong>{SUPPORT_EMAIL}</strong> in your mail app.
                  </p>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="support-subject">Subject</label>
                    <select id="support-subject" className="form-select" value={subject} onChange={(e) => setSubject(e.target.value)}>
                      <option>Technical Issue</option>
                      <option>Appointment Help</option>
                      <option>Medical Records</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="support-message">Message</label>
                    <textarea
                      id="support-message"
                      className="form-control"
                      rows={6}
                      placeholder="Describe your issue in detail..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100">Email Support</button>
                </form>
              ) : (
                <p className="text-muted mb-0">Please contact the clinic front desk for help with your account.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HelpSupport;
