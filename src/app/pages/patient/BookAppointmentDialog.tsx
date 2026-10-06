import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../../components/ui/dialog';
import { getDoctors } from '../../../services/patientService';
import { bookAppointment } from '../../../services/appointmentService';
import { todayISO } from '../../utils/dates';

interface BookAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBooked: () => void;
}

const TIME_SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];

const emptyForm = { doctorId: '', appointmentDate: '', appointmentTime: '', reason: '' };

const BookAppointmentDialog = ({ open, onOpenChange, onBooked }: BookAppointmentDialogProps) => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    getDoctors()
      .then(setDoctors)
      .catch((error) => toast.error(error.message || 'Failed to load doctors'));
  }, [open]);

  const update = (field: keyof typeof emptyForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((current) => ({ ...current, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await bookAppointment({ ...form, reason: form.reason.trim() });
      toast.success('Appointment booked successfully');
      setForm(emptyForm);
      onOpenChange(false);
      onBooked();
    } catch (error: any) {
      toast.error(error.message || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>Book an Appointment</DialogTitle>
        <DialogDescription>Choose a doctor and a time that works for you.</DialogDescription>

        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3 mt-2">
          <div>
            <label className="form-label" htmlFor="appt-doctor">Doctor</label>
            <select id="appt-doctor" className="form-select" value={form.doctorId} onChange={update('doctorId')} required>
              <option value="">Select a doctor...</option>
              {doctors.map((doctor) => (
                <option key={doctor._id} value={doctor._id}>{doctor.name}</option>
              ))}
            </select>
          </div>

          <div className="row g-2">
            <div className="col-6">
              <label className="form-label" htmlFor="appt-date">Date</label>
              <input
                id="appt-date"
                type="date"
                className="form-control"
                min={todayISO()}
                value={form.appointmentDate}
                onChange={update('appointmentDate')}
                required
              />
            </div>
            <div className="col-6">
              <label className="form-label" htmlFor="appt-time">Time</label>
              <select id="appt-time" className="form-select" value={form.appointmentTime} onChange={update('appointmentTime')} required>
                <option value="">Select...</option>
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="form-label" htmlFor="appt-reason">Reason for visit</label>
            <textarea
              id="appt-reason"
              className="form-control"
              rows={3}
              maxLength={500}
              value={form.reason}
              onChange={update('reason')}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Booking...' : 'Book Appointment'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookAppointmentDialog;
