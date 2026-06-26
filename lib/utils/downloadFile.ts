/** Trigger a browser download for a Blob or string payload. Client-only. */
export function downloadFile(
  filename: string,
  data: Blob | string,
  mime = "application/octet-stream",
): void {
  const blob = typeof data === "string" ? new Blob([data], { type: mime }) : data;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke on the next tick so the click has time to start the download.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
