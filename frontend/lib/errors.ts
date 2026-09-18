import { AxiosError } from "axios";

function extractMessage(payload: unknown): string {
  if (payload && typeof payload === "object" && "message" in payload) {
    const message = (payload as { message: unknown }).message;

    if (Array.isArray(message)) {
      return message.map((item) => String(item)).join(", ");
    }

    if (typeof message === "string") {
      return message;
    }
  }

  return "";
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    return extractMessage(error.response?.data);
  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}