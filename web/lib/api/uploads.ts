import { headersBearerAuth, readErrorMessage, requireApiBase } from "./client";

export type UploadSingleResult = {
  bucket: string;
  key: string;
  originalName: string;
  size: number;
  url: string;
};

/** POST /uploads/single — multipart, champ `file` */
export async function uploadSingleFile(file: File): Promise<UploadSingleResult> {
  const base = requireApiBase();
  const body = new FormData();
  body.append("file", file);
  const res = await fetch(`${base}/uploads/single`, {
    method: "POST",
    headers: headersBearerAuth(),
    body,
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return (await res.json()) as UploadSingleResult;
}
