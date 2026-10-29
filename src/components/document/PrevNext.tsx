import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSiteData } from '../../app/SiteProvider';
import type { DocumentData } from '../../domain/types';

/**
 * Navigasi Previous/Next (W3Schools style & Material Design Card).
 */
export function PrevNext({ doc }: { doc: DocumentData }) {
  const { fileMap } = useSiteData();
  if (!doc.previous && !doc.next) return null;

  const prev = doc.previous ? fileMap.get(doc.previous) : undefined;
  const next = doc.next ? fileMap.get(doc.next) : undefined;

  return (
    <nav
      aria-label="Navigasi antar dokumen"
      className="mt-12 grid gap-4 border-t border-slate-800 pt-8 sm:grid-cols-2 light:border-slate-200"
    >
      {prev ? (
        <Link
          to={`/docs/${doc.previous}`}
          className="group m3-card m3-card-hover flex items-center gap-3.5 p-4 sm:p-5"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-300 transition-colors group-hover:bg-accent-600 group-hover:text-white light:bg-slate-100 light:text-slate-700">
            <ArrowLeft className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 light:text-slate-400">
              ❮ Bab Sebelumnya
            </span>
            <span className="block truncate text-sm font-bold text-slate-200 group-hover:text-accent-400 transition-colors light:text-slate-800">
              {prev.title}
            </span>
          </div>
        </Link>
      ) : (
        <span />
      )}

      {next ? (
        <Link
          to={`/docs/${doc.next}`}
          className="group m3-card m3-card-hover flex items-center justify-between gap-3.5 p-4 sm:p-5 border-l-4 border-l-accent-500"
        >
          <div className="min-w-0">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-accent-500 light:text-accent-600">
              Bab Selanjutnya ❯
            </span>
            <span className="block truncate text-sm font-bold text-slate-100 group-hover:text-accent-400 transition-colors light:text-slate-900">
              {next.title}
            </span>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-600 text-white shadow transition-transform group-hover:translate-x-1">
            <ArrowRight className="h-4 w-4" />
          </div>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}