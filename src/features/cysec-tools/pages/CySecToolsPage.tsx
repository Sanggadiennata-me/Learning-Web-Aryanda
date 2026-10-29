/**
 * Dashboard CySec Tools. selector kategori (workspace category).
 * /cysec-tools → pilih kategori → daftar tool kategori → tool.
 * Search global (kategori + tool) + recently used (localStorage).
 */

import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Shield, Star } from 'lucide-react';
import { categoryCards, searchCatalog, labelForToolId, type CategoryCard, type CatalogEntry } from '../catalog';
import { useToolHistory } from '../hooks/useToolHistory';
import { useOsintHistory } from '../../osint/hooks/useOsintHistory';

function CategoryCardView({ card }: { card: CategoryCard }) {
  return (
    <Link
      to={`/cysec-tools/category/${card.id}`}
      className="m3-card m3-card-hover group flex flex-col justify-between p-5"
    >
      <div>
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800/80 text-2xl transition-transform group-hover:scale-105 light:bg-slate-100 shadow-sm" aria-hidden>
          {card.icon}
        </span>
        <h2 className="mt-3.5 text-base font-bold text-slate-100 transition-colors group-hover:text-accent-400 light:text-slate-900">
          {card.title}
        </h2>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-400 light:text-slate-600 line-clamp-2">
          {card.description}
        </p>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3 light:border-slate-200">
        <span className="text-xs font-bold text-accent-500 light:text-accent-600">
          {card.count} Tools
        </span>
        <span className="text-xs font-semibold text-slate-400 group-hover:text-accent-400 transition-colors">
          Buka ❯
        </span>
      </div>
    </Link>
  );
}

function ToolCardView({ entry }: { entry: CatalogEntry }) {
  return (
    <Link to={entry.path} className="m3-card m3-card-hover group flex flex-col justify-between p-4">
      <div>
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800/80 text-xl light:bg-slate-100 shadow-sm" aria-hidden>
            {entry.icon}
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-100 transition-colors group-hover:text-accent-400 light:text-slate-900">
              {entry.title}
            </h3>
            <p className="mt-1 line-clamp-2 text-xs text-slate-400 light:text-slate-600">
              {entry.description}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-2.5 light:border-slate-200">
        <span className="rounded-lg bg-slate-800/80 px-2 py-0.5 text-[10px] font-semibold text-slate-400 light:bg-slate-100 light:text-slate-600">
          {entry.categoryName}
        </span>
        <span className="text-xs font-semibold text-accent-500 group-hover:translate-x-0.5 transition-transform">
          Gunakan →
        </span>
      </div>
    </Link>
  );
}

export default function CySecToolsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '');
  const { recent, favorites } = useToolHistory();
  const { recent: osintRecent } = useOsintHistory();

  const cards = useMemo(() => categoryCards(), []);
  const results = useMemo(() => (query.trim() ? searchCatalog(query) : null), [query]);

  const recentItems = useMemo(() => {
    const items: { icon: string; title: string; path: string; categoryName: string }[] = [];
    const seen = new Set<string>();
    for (const id of recent) {
      const l = labelForToolId(id);
      if (l && !seen.has(l.path)) {
        seen.add(l.path);
        items.push(l);
      }
    }
    for (const id of osintRecent) {
      const l = labelForToolId(id);
      if (l && !seen.has(l.path)) {
        seen.add(l.path);
        items.push(l);
      }
    }
    return items.slice(0, 10);
  }, [recent, osintRecent]);

  const favoriteItems = useMemo(() => {
    return favorites
      .map(labelForToolId)
      .filter((l): l is NonNullable<typeof l> => !!l)
      .slice(0, 8);
  }, [favorites]);

  const onChangeQuery = (v: string) => {
    setQuery(v);
    if (v.trim()) setSearchParams({ q: v.trim() }, { replace: true });
    else setSearchParams({}, { replace: true });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-8 space-y-3">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-accent-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent-400">
          <Shield className="h-3.5 w-3.5" />
          100% Privacy & Client-Side
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-100">
          Cyber Security & OSINT Interactive Tools
        </h1>

        {/* Search global W3Schools / Material Bar */}
        <div className="pt-2 max-w-md">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => onChangeQuery(e.target.value)}
              placeholder="Cari tool & kategori… (misal: hash, pcap, jwt, dork, subnet)"
              aria-label="Cari tools dan kategori"
              className="h-11 w-full rounded-2xl border border-slate-800 bg-slate-900/90 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20 light:border-slate-300 light:bg-white light:text-slate-900 shadow-sm"
            />
          </div>
        </div>
      </header>

      {/* Recently used + favorites */}
      {(recentItems.length > 0 || favoriteItems.length > 0) && !results && (
        <div className="mb-8 grid gap-4 md:grid-cols-2">
          {recentItems.length > 0 && (
            <section>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Recently Used</h2>
              <div className="flex flex-wrap gap-2">
                {recentItems.map((r) => (
                  <Link
                    key={r.path}
                    to={r.path}
                    className="group rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-xs transition-colors hover:border-accent-500/50"
                  >
                    <span className="text-slate-300 group-hover:text-accent-300">{r.icon} {r.title}</span>
                    <span className="ml-2 text-[10px] text-slate-600">{r.categoryName}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
          {favoriteItems.length > 0 && (
            <section>
              <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <Star className="h-3 w-3 text-amber-400" /> Favorites
              </h2>
              <div className="flex flex-wrap gap-2">
                {favoriteItems.map((r) => (
                  <Link
                    key={r.path}
                    to={r.path}
                    className="group rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-1.5 text-xs transition-colors hover:border-amber-400/60"
                  >
                    <span className="text-amber-200">{r.icon} {r.title}</span>
                    <span className="ml-2 text-[10px] text-amber-200/50">{r.categoryName}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Hasil pencarian */}
      {results ? (
        <div className="space-y-8" aria-live="polite">
          {results.categories.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-slate-300">Kategori ({results.categories.length})</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {results.categories.map((c) => (
                  <CategoryCardView key={c.id} card={c} />
                ))}
              </div>
            </section>
          )}
          <section>
            <h2 className="mb-3 text-sm font-semibold text-slate-300">
              Tools ({results.tools.length}). untuk “{query.trim()}”
            </h2>
            {results.tools.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                Tidak ada tool yang cocok. Coba kata kunci lain (mis. hash, dns, jwt, pcap, osint).
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {results.tools.map((t) => (
                  <ToolCardView key={`${t.category}:${t.id}`} entry={t} />
                ))}
              </div>
            )}
          </section>
        </div>
      ) : (
        /* Category selector. kartu workspace besar */
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cards.map((c) => (
            <CategoryCardView key={c.id} card={c} />
          ))}
        </div>
      )}

      <p className="mt-10 border-t border-slate-800 pt-4 text-center text-xs text-slate-600">
        Pilih bidang untuk membuka tools-nya. Semua tool berjalan client-side di browser.
      </p>
    </div>
  );
}
