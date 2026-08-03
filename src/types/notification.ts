export type NotificationCategory = 'marketing' | 'kyc_update' | 'commission_paid' | 'general' | null;

export type AppNotification = {
  id: number;
  title: string;
  message: string;
  category: NotificationCategory;
  type: string | null;
  is_read: boolean | number;
  created_at: string;
};

export type NotificationListResponse = {
  success: boolean;
  message: string;
  data: AppNotification[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
};

export type UnreadCountResponse = {
  success: boolean;
  message: string;
  data: { count: number };
};
