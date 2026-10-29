import { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSiteData } from '../../app/SiteProvider';
import type { TreeFolderNode } from '../../domain/types';
import { getDefaultSubskillDocId, normalizeId } from '../../services/docs';
import { cn } from '../../lib/utils';

export interface RibbonItem {
  id: string;
  label: string;
  path: string;
  matchPrefixes: string[];
}

const CATEGORY_ORDER: Record<string, number> = {
  pemrograman: 1,
  cybersecurity: 2,
  devops: 3,
  jaringan: 4,
};

const SUBSKILL_ORDER: Record<string, number> = {
  html: 1,
  css: 2,
  javascript: 3,
  python: 4,
  php: 5,
  fundamental: 6,
  'rancangan software': 7,
  'vibe coding': 8,

  cryptography: 1,
  forensic: 2,
  pwn: 3,
  'web exploitation': 4,

  cloud: 1,
  docker: 2,
  github: 3,

  hardware: 1,
  jaringan: 2,
};

const LABEL_MAP: Record<string, string> = {
  html: 'HTML',
  css: 'CSS',
  javascript: 'JAVASCRIPT',
  python: 'PYTHON',
  php: 'PHP',
  fundamental: 'FUNDAMENTAL',
  'rancangan software': 'RANCANGAN SOFTWARE',
  'vibe coding': 'VIBE CODING',
  cryptography: 'KRIPTOGRAFI',
  forensic: 'FORENSIK',
  pwn: 'PWN',
  'web exploitation': 'WEB EXPLOIT',
  cloud: 'CLOUD',
  docker: 'DOCKER',
  github: 'GITHUB',
  hardware: 'HARDWARE',
  jaringan: 'JARINGAN',
};

const FALLBACK_ITEMS: RibbonItem[] = [
  { id: 'html', label: 'HTML', path: '/docs/pemrograman/html/pengenalan-html', matchPrefixes: ['/docs/pemrograman/html'] },
  { id: 'css', label: 'CSS', path: '/docs/pemrograman/css/native/pengenalan-css-native', matchPrefixes: ['/docs/pemrograman/css'] },
  { id: 'javascript', label: 'JAVASCRIPT', path: '/docs/pemrograman/javascript/framework/react/pengenalan-react', matchPrefixes: ['/docs/pemrograman/javascript'] },
  { id: 'python', label: 'PYTHON', path: '/docs/pemrograman/python/python-dasar/01_python-dasar', matchPrefixes: ['/docs/pemrograman/python'] },
  { id: 'php', label: 'PHP', path: '/docs/pemrograman/php/framework/laravel/dasar-routing', matchPrefixes: ['/docs/pemrograman/php'] },
  { id: 'tools', label: 'TOOLS', path: '/cysec-tools', matchPrefixes: ['/cysec-tools', '/osint'] },
  { id: 'editor', label: 'EDITOR', path: '/editor', matchPrefixes: ['/editor'] },
];

/**
 * Horizontal Ribbon Bar Navigasi:
 * - Menampilkan SELURUH subskill dari Obsidian Vault secara dinamis.
 * - Jika ada skill / subskill baru dibuat di Obsidian, otomatis langsung muncul di sini.
 * - Mengadopsi struktur horizontal scroll W3Schools yang cepat diakses.
 * - Aksen hijau segar khas CodeLearn dengan auto-centering ke tab materi yang sedang dibuka.
 */
export function TopicRibbon({ className }: { className?: string }) {
  const { tree } = useSiteData();
  const scrollRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Bangun daftar seluruh subskill dinamis dari struktur tree vault
  const ribbonItems: RibbonItem[] = useMemo(() => {
    if (!tree || tree.length === 0) {
      return FALLBACK_ITEMS;
    }

    // Urutkan kategori skill utama
    const sortedCategories = [...tree].sort((a, b) => {
      const orderA = CATEGORY_ORDER[a.name.toLowerCase()] ?? 99;
      const orderB = CATEGORY_ORDER[b.name.toLowerCase()] ?? 99;
      return orderA - orderB;
    });

    const items: RibbonItem[] = [];

    for (const cat of sortedCategories) {
      if (cat.name.toLowerCase().includes('terms and foreign words')) continue;

      const catKey = cat.name.toLowerCase();

      // Ambil seluruh folder subskill di dalam kategori
      const subFolders = cat.children.filter(
        (c): c is TreeFolderNode => c.type === 'folder'
      );

      // Urutkan subskill dalam kategori
      subFolders.sort((a, b) => {
        const orderA = SUBSKILL_ORDER[a.name.toLowerCase()] ?? 99;
        const orderB = SUBSKILL_ORDER[b.name.toLowerCase()] ?? 99;
        if (orderA !== orderB) return orderA - orderB;
        return a.name.localeCompare(b.name);
      });

      for (const sub of subFolders) {
        const subKey = sub.name.toLowerCase();
        const label = LABEL_MAP[subKey] || sub.name.toUpperCase();
        const bestDocId = getDefaultSubskillDocId(sub);
        const normRelPath = normalizeId(sub.relativePath);

        items.push({
          id: `${catKey}-${subKey}`,
          label,
          path: `/docs/${bestDocId}`,
          matchPrefixes: [
            `/docs/${normRelPath}`,
            `/docs/${catKey}/${subKey}`,
            `/docs/${normalizeId(sub.name)}`,
          ],
        });
      }
    }

    // Tab shortcut tools & editor interaktif
    items.push({
      id: 'tools',
      label: 'TOOLS',
      path: '/cysec-tools',
      matchPrefixes: ['/cysec-tools', '/osint'],
    });
    items.push({
      id: 'editor',
      label: 'EDITOR',
      path: '/editor',
      matchPrefixes: ['/editor'],
    });

    return items;
  }, [tree]);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 6);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 6);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [ribbonItems]);

  // Geser otomatis ke subskill aktif agar langsung terlihat di layar
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const activeEl = el.querySelector('[data-active="true"]') as HTMLElement | null;
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [location.pathname]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const offset = direction === 'left' ? -260 : 260;
    scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  return (
    <div
      className={cn(
        'relative bg-white border-b border-emerald-100/80 text-slate-700 select-none shadow-sm z-30',
        'dark:bg-[#0c1410] dark:border-accent-950/60 dark:text-slate-200',
        className
      )}
      role="navigation"
      aria-label="Pilihan topik materi"
    >
      <div className="flex w-full items-center px-1 sm:px-4">
        {/* Scroll Left Button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="hidden sm:flex h-7 w-7 items-center justify-center rounded-full bg-white text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900 border border-emerald-200 dark:bg-[#13281d] dark:text-emerald-200 dark:hover:bg-[#1a3828] dark:border-accent-800/50 shadow-sm transition-all shrink-0 active:scale-95"
            aria-label="Geser ke kiri"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}

        {/* Scrollable Ribbon Container */}
        <div
          ref={scrollRef}
          className="scrollbar-thin flex flex-1 items-center overflow-x-auto scroll-smooth py-1"
        >
          {ribbonItems.map((item) => {
            const currentPath = decodeURIComponent(location.pathname).toLowerCase();
            const isActive = item.matchPrefixes.some((prefix) =>
              currentPath.startsWith(prefix.toLowerCase())
            );

            return (
              <NavLink
                key={item.id}
                to={item.path}
                data-active={isActive ? 'true' : 'false'}
                className={cn(
                  'px-3 py-1.5 text-xs font-bold tracking-wider uppercase rounded-lg transition-all whitespace-nowrap shrink-0 mx-0.5',
                  isActive
                    ? 'bg-accent-600 text-white shadow-sm ring-1 ring-accent-500/50'
                    : 'text-slate-600 hover:text-accent-700 hover:bg-emerald-50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-accent-500/10'
                )}
              >
                {item.label}
              </NavLink>
            );
          })}
        </div>

        {/* Scroll Right Button */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="hidden sm:flex h-7 w-7 items-center justify-center rounded-full bg-white text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900 border border-emerald-200 dark:bg-[#13281d] dark:text-emerald-200 dark:hover:bg-[#1a3828] dark:border-accent-800/50 shadow-sm transition-all shrink-0 active:scale-95"
            aria-label="Geser ke kanan"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
