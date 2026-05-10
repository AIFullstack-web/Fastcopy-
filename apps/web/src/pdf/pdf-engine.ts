import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export type PdfValidationResult = { ok: true; pageCount: number; fingerprint: string } | { ok: false; reason: string };

export async function validateAndCountPdf(file: File): Promise<PdfValidationResult> {
  if (file.type !== 'application/pdf' || !file.name.toLowerCase().endsWith('.pdf')) return { ok: false, reason: 'Only PDF files are supported.' };
  if (file.size > 100 * 1024 * 1024) return { ok: false, reason: 'PDF must be smaller than 100MB.' };
  const header = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  if (String.fromCharCode(...header) !== '%PDF-') return { ok: false, reason: 'The file is not a valid PDF signature.' };
  try {
    const bytes = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: bytes, stopAtErrors: true }).promise;
    return { ok: true, pageCount: pdf.numPages, fingerprint: pdf.fingerprints[0] ?? file.name };
  } catch (error) {
    const message = error instanceof Error && error.message.toLowerCase().includes('password') ? 'Password-protected PDFs are not supported yet.' : 'The PDF appears corrupted or unreadable.';
    return { ok: false, reason: message };
  }
}
