// Appointment dates are calendar days stored as UTC midnight. Format them in UTC
// so they don't shift to the previous day for users west of Greenwich.
export const formatAppointmentDate = (value: string | Date, options: Intl.DateTimeFormatOptions = {}) =>
  new Date(value).toLocaleDateString(undefined, { timeZone: 'UTC', ...options });

// Today's date as YYYY-MM-DD in the user's local timezone.
export const todayISO = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

// Compare an appointment's calendar day with today's local calendar day.
export const isTodayOrLater = (value: string | Date) => new Date(value).toISOString().slice(0, 10) >= todayISO();

export const isToday = (value: string | Date) => new Date(value).toISOString().slice(0, 10) === todayISO();

// Real timestamps (createdAt etc.) are shown in local time.
export const formatTimestamp = (value: string | Date) => new Date(value).toLocaleDateString();
