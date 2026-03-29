import { ApiRequestError } from "@/lib/api/api-request-error";

export type ParsedErrorBody = {
  message: string;
  messages: string[];
};

export async function readJsonErrorBody(res: Response): Promise<ParsedErrorBody> {
  const text = await res.text();
  if (!text) {
    return {
      message: `${res.status} ${res.statusText}`,
      messages: [],
    };
  }
  try {
    const body = JSON.parse(text) as { message?: string | string[] };
    const messages = Array.isArray(body.message)
      ? body.message.map(String)
      : body.message
        ? [String(body.message)]
        : [];
    const message =
      messages.length > 0 ? messages.join(", ") : `${res.status} ${res.statusText}`;
    return { message, messages };
  } catch {
    return { message: `${res.status} ${res.statusText}`, messages: [] };
  }
}

export async function throwIfNotOk(res: Response): Promise<void> {
  if (res.ok) return;
  const { message, messages } = await readJsonErrorBody(res);
  throw new ApiRequestError(message, messages, res.status);
}
