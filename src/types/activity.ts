// Re-export ActivityType from UserActivity for use throughout the application
import { ActivityType } from '@/lib/db/models/UserActivity'

export { ActivityType }

// Interface for year change request details
export interface YearChangeRequestDetails {
  currentYear: number | null;
  requestedYear: number;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Date;
  comments?: string;
}
