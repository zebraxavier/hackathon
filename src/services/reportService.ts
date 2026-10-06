import { downloadFile } from './api';

export interface ReportSummary {
  _id: string;
  fileName?: string;
  title?: string;
}

// Download a report file through the authenticated API endpoint
export const downloadReport = (report: ReportSummary) =>
  downloadFile(`/reports/${report._id}/download`, report.fileName || report.title || 'report');
