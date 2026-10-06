import { useEffect, useState } from 'react';
import { getAppointments } from '../../services/appointmentService';
import { getPatientReports } from '../../services/patientService';
import { useAuth } from '../context/AuthContext';
import { formatAppointmentDate, isTodayOrLater } from '../utils/dates';

export type NotificationType = 'appointment' | 'report';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  date: Date;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const RECENT_REPORT_WINDOW_MS = 14 * DAY_MS;

// Builds notifications from real clinic data: upcoming scheduled appointments
// for every role and, for patients, reports added in the last two weeks.
export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const load = async () => {
      const [appointments, reports] = await Promise.all([
        getAppointments().catch(() => []),
        user.role === 'patient' ? getPatientReports().catch(() => []) : Promise.resolve([]),
      ]);

      const appointmentItems: AppNotification[] = appointments
        .filter((a: any) => a.status === 'scheduled' && isTodayOrLater(a.appointmentDate))
        .map((a: any) => {
          const date = new Date(a.appointmentDate);
          const withWhom = user.role === 'patient'
            ? `with ${a.doctorId?.name || 'your doctor'}`
            : `with ${a.patientId?.name || 'a patient'}`;
          return {
            id: `appointment-${a._id}`,
            type: 'appointment' as const,
            title: 'Upcoming appointment',
            message: `${formatAppointmentDate(date, { weekday: 'short', month: 'short', day: 'numeric' })} at ${a.appointmentTime} ${withWhom}`,
            date,
          };
        })
        .sort((a: AppNotification, b: AppNotification) => a.date.getTime() - b.date.getTime());

      const reportItems: AppNotification[] = reports
        .filter((r: any) => Date.now() - new Date(r.createdAt).getTime() < RECENT_REPORT_WINDOW_MS)
        .map((r: any) => ({
          id: `report-${r._id}`,
          type: 'report' as const,
          title: 'New report available',
          message: `${r.title} was added to your records`,
          date: new Date(r.createdAt),
        }));

      if (!cancelled) {
        setNotifications([...appointmentItems, ...reportItems]);
        setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return { notifications, loading };
};
