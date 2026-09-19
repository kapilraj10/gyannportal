import type { ListResult, PaginationParams } from "@/types/api";
import type { AppNotification } from "@/types/domain";

import { get, getList, patch, post } from "./helpers";

export interface NotificationInput {
  title: string;
  message: string;
  type?: string;
  recipientId?: string;
  recipientIds?: string[];
  classId?: string;
}

export const notificationsApi = {
  list: (params?: PaginationParams): Promise<ListResult<AppNotification>> =>
    getList<AppNotification>("/notifications", params),

  get: (id: string): Promise<AppNotification> =>
    get<AppNotification>(`/notifications/${id}`),

  send: (input: NotificationInput): Promise<unknown> =>
    post<unknown, NotificationInput>("/notifications", input).then(
      (r) => r.data,
    ),

  markRead: (id: string): Promise<unknown> =>
    patch<unknown>(`/notifications/${id}/read`).then((r) => r.data),

  markAllRead: (): Promise<unknown> =>
    patch<unknown>("/notifications/read-all").then((r) => r.data),
};