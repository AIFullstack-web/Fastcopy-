'use client';
import { motion } from 'framer-motion';
import { UploadCloud } from 'lucide-react';
import { useCallback, useState } from 'react';
import { validateAndCountPdf } from '../../pdf/pdf-engine';
import { useOrderStore } from '../../stores/order-store';

export function PdfUploader() {
  const [error, setError] = useState<string>();
  const [isParsing, setParsing] = useState(false);
  const { file, pageCount, setFile, setPageCount } = useOrderStore();

  const handleFile = useCallback(async (selected?: File) => {
    if (!selected) return;
    setParsing(true);
    setError(undefined);
    const result = await validateAndCountPdf(selected);
    setParsing(false);
    if (!result.ok) { setError(result.reason); setFile(undefined); setPageCount(0); return; }
    setFile(selected);
    setPageCount(result.pageCount);
  }, [setFile, setPageCount]);

  return (
    <motion.label whileHover={{ scale: 1.01 }} className="glass-card flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-[2rem] p-8 text-center">
      <input className="sr-only" type="file" accept="application/pdf" onChange={event => void handleFile(event.target.files?.[0])} />
      <UploadCloud className="mb-4 h-12 w-12 text-brand-500" />
      <h2 className="text-2xl font-semibold">Drop your PDF here</h2>
      <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-300">We validate PDF signatures, count pages locally, and re-check everything securely on the backend before printing.</p>
      {isParsing && <p className="mt-4 text-sm font-medium text-brand-500">Reading PDF pages…</p>}
      {file && <p className="mt-4 text-sm font-medium">{file.name} · {pageCount} pages</p>}
      {error && <p className="mt-4 rounded-xl bg-red-500/10 px-4 py-2 text-sm text-red-600">{error}</p>}
    </motion.label>
  );
}
