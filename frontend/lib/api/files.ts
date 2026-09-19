import type { ListResult, PaginationParams } from "@/types/api";

import { del, get, getList } from "./helpers";

export interface FileRecord {
  id: string;
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  url: string;
  category?: string | null;
  uploadedById?: string | null;
  createdAt?: string;
}

export interface UploadInput {
  file: File | Blob;
  category?: string;
  onProgress?: (percent: number) => void;
}

export const filesApi = {
  upload: async ({ file, category, onProgress }: UploadInput): Promise<FileRecord> => {
    const form = new FormData();
    form.append("file", file);
    if (category) form.append("category", category);

    const { api } = await import("./client");
    const response = await api.post<{ data: FileRecord }>("/files/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
      },
    });

    return response.data.data;
  },

  list: (params?: PaginationParams): Promise<ListResult<FileRecord>> =>
    getList<FileRecord>("/files", params),

  get: (id: string): Promise<FileRecord> => get<FileRecord>(`/files/${id}`),

  remove: (id: string): Promise<null> => del<null>(`/files/${id}`).then(() => null),
};