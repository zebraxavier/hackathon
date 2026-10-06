// Appointment dates come from <input type="date"> as YYYY-MM-DD and are stored
// as UTC midnight, so "today" must also be computed as a UTC calendar day.
const DAY_MS = 24 * 60 * 60 * 1000;

const startOfUTCDay = (date = new Date()) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

// Allow one day of slack so users ahead of UTC can still book "today".
const earliestBookableDate = () => new Date(startOfUTCDay().getTime() - DAY_MS);

module.exports = { DAY_MS, startOfUTCDay, earliestBookableDate };
