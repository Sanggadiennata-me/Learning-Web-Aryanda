import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSiteData } from '../app/SiteProvider';
import { TreeExplorer } from '../components/explorer/TreeExplorer';
import { Spinner } from '../components/ui/spinner';
import { countFiles, fetchRoadmaps } from '../services/docs';
import { folderColor } from '../lib/colors';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  FolderTree,
  Map,
  Search,
  Sparkles,
  Star,
} from 'lucide-react';
import type { RoadmapsData } from '../domain/types';

/**
 * Halaman Direktori / Katalog Dokumentasi (W3Schools & Material Style).
 */
export default function DocsPage() {
  const { tree, metadata, loading, error } = useSiteData();
  const [searchParams, setSearchParams] = useSearchParams();
  const catParam = searchParams.get('category') || searchParams.get('cat') || 'all';
  const [roadmaps, setRoadmaps] = useState<RoadmapsData | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(catParam);
  const stripRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const cat = searchParams.get('category') || searchParams.get('cat') || 'all';
    if (cat !== selectedCategory) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  const handleSelectCategory = (catId: string) => {
    setSelectedCategory(catId);
    const newParams = new URLSearchParams(searchParams);
    if (catId === 'all') {
      newParams.delete('category');
      newParams.delete('cat');
    } else {
      newParams.set('category', catId);
      newParams.delete('cat');
    }
    setSearchParams(newParams);
  };

  const updateStripArrows = () => {
    const el = stripRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  const scrollStrip = (direction: 1 | -1) => {
    stripRef.current?.scrollBy({ left: direction * 320, behavior: 'smooth' });
  };

  useEffect(() => {
    if (!roadmaps) return;
    updateStripArrows();
    const el = stripRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateStripArrows, { passive: true });
    window.addEventListener('resize', updateStripArrows);
    return () => {
      el.removeEventListener('scroll', updateStripArrows);
      window.removeEventListener('resize', updateStripArrows);
    };
  }, [roadmaps]);

  useEffect(() => {
    let cancelled = false;
    fetchRoadmaps()
      .then((data) => {
        if (!cancelled) setRoadmaps(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Filter root folders based on selected category
  const filteredTree = useMemo(() => {
    if (!tree) return [];
    if (selectedCategory === 'all') return tree;
    return tree.filter(
      (folder) => folder.name.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [tree, selectedCategory]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error || !tree) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center text-sm text-slate-400">
        {error ?? 'tree.json belum tersedia. Jalankan parser terlebih dahulu.'}
      </div>
    );
  }

  const CATEGORIES = [
    { id: 'all', label: 'Semua Bidang' },
    { id: 'pemrograman', label: '💻 Pemrograman' },
    { id: 'cybersecurity', label: '🛡️ CyberSecurity' },
    { id: 'devops', label: '☁️ DevOps' },
    { id: 'jaringan', label: '🌐 Jaringan' },
    { id: 'terms and foreign words', label: '📖 Kamus IT' },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header Halaman */}
      <header className="space-y-3">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-accent-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent-400">
          <BookOpen className="h-3.5 w-3.5" />
          Katalog Lengkap
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-50 light:text-slate-900">
          Direktori Dokumentasi Pembelajaran
        </h1>
        <p className="text-sm text-slate-400 light:text-slate-600 max-w-2xl">
          Eksplorasi {metadata?.totalNotes ?? 0} catatan dan {metadata?.totalCodeFiles ?? 0} latihan
          koding yang terorganisir per folder vault Obsidian. Gunakan pencarian instan di bawah untuk
          menemukan materi spesifik.
        </p>
      </header>

      {/* Bar Pencarian Cepat & Kategori Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Ketik kata kunci untuk menyaring bab/materi di pohon navigasi..."
            className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20 light:border-slate-300 light:bg-white light:text-slate-900 shadow-sm"
          />
          {searchFilter && (
            <button
              onClick={() => setSearchFilter('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-200"
            >
              Hapus
            </button>
          )}
        </div>

        {/* Filter Bidang Kategori */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleSelectCategory(cat.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-accent-600 text-white shadow-sm'
                  : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-200 light:bg-slate-100 light:border-slate-200 light:text-slate-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Subskills Ribbon Strip */}
      {roadmaps && roadmaps.subskills.length > 0 && (
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 light:text-slate-600">
              <Star className="h-3.5 w-3.5 text-accent-500" />
              Pohon Subskill Terstruktur
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => scrollStrip(-1)}
                disabled={!canScrollLeft}
                aria-label="Geser subskill ke kiri"
                className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-800 bg-slate-900 text-slate-400 hover:text-white disabled:opacity-30 transition-all light:border-slate-200 light:bg-slate-100"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => scrollStrip(1)}
                disabled={!canScrollRight}
                aria-label="Geser subskill ke kanan"
                className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-800 bg-slate-900 text-slate-400 hover:text-white disabled:opacity-30 transition-all light:border-slate-200 light:bg-slate-100"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div
            ref={stripRef}
            className="scrollbar-thin flex gap-2 overflow-x-auto pb-2 scroll-smooth"
          >
            {roadmaps.subskills.map((sub) => (
              <Link
                key={sub.id}
                to={`/docs/${encodeURIComponent(sub.folder.toLowerCase())}`}
                className="group flex shrink-0 items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-accent-500 hover:text-accent-300 light:border-slate-200 light:bg-white light:text-slate-700 shadow-sm transition-all"
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: folderColor(sub.folder.split('/')[0]) }}
                />
                <span className="whitespace-nowrap">{sub.title}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Main Material Card Explorer */}
      <div className="m3-surface p-5 sm:p-7 shadow-md">
        <TreeExplorer
          nodes={filteredTree}
          filterQuery={searchFilter}
          variant="page"
        />
      </div>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 light:text-slate-400 border-t border-slate-800/60 pt-4 light:border-slate-200">
        <span className="flex items-center gap-1.5">
          <Map className="h-3.5 w-3.5 text-accent-500" />
          Ikon Map menunjukkan dokumen Roadmap resmi bidang
        </span>
        <span>Total: {countFiles(tree)} dokumen terindeks</span>
      </div>
    </div>
  );
}