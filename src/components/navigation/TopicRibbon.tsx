import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface RibbonItem {
  id: string;
  label: string;
  path: string;
  matchPrefixes: string[];
}

export const W3S_RIBBON_ITEMS: RibbonItem[] = [
  {
    id: 'html',
    label: 'HTML',
    path: '/docs/pemrograman/html/block-formatting-text',
    matchPrefixes: ['/docs/pemrograman/html'],
  },
  {
    id: 'css',
    label: 'CSS',
    path: '/docs/pemrograman/css/native/01_css-native',
    matchPrefixes: ['/docs/pemrograman/css'],
  },
  {
    id: 'javascript',
    label: 'JAVASCRIPT',
    path: '/docs/pemrograman/javascript/framework/react/react-lanjutan/react-lanjutan',
    matchPrefixes: ['/docs/pemrograman/javascript'],
  },
  {
    id: 'python',
    label: 'PYTHON',
    path: '/docs/pemrograman/python/python-advanced/02_python-advanced',
    matchPrefixes: ['/docs/pemrograman/python'],
  },
  {
    id: 'php',
    label: 'PHP',
    path: '/docs/pemrograman/php/framework/laravel/filament/filament',
    matchPrefixes: ['/docs/pemrograman/php'],
  },
  {
    id: 'cybersecurity',
    label: 'CYBERSEC',
    path: '/docs/cybersecurity/cryptography/pengenalan/1.-pengenalan',
    matchPrefixes: ['/docs/cybersecurity'],
  },
  {
    id: 'devops',
    label: 'DEVOPS',
    path: '/docs/devops/docker/docker-basic/pengenalan-docker',
    matchPrefixes: ['/docs/devops'],
  },
  {
    id: 'jaringan',
    label: 'JARINGAN',
    path: '/docs/jaringan/jaringan/jaringan-basic/1.-fundamental-jaringan',
    matchPrefixes: ['/docs/jaringan'],
  },
  {
    id: 'tools',
    label: 'TOOLS',
    path: '/cysec-tools',
    matchPrefixes: ['/cysec-tools', '/osint'],
  },
  {
    id: 'roadmap',
    label: 'ROADMAP',
    path: '/roadmap',
    matchPrefixes: ['/roadmap'],
  },
  {
    id: 'editor',
    label: 'EDITOR',
    path: '/editor',
    matchPrefixes: ['/editor'],
  },
];

/**
 * Horizontal Ribbon Bar Navigasi:
 * - Mengadopsi struktur horizontal scroll W3Schools yang cepat diakses.
 * - Menggunakan palet warna personal: slate charcoal background & aksen hijau segar khas CodeLearn.
 * - Tab aktif terhighlight dengan aksen brand (accent-600).
 */
export function TopicRibbon({ className }: { className?: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const offset = direction === 'left' ? -240 : 240;
    scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  return (
    <div
      className={cn(
        'relative bg-slate-900 border-b border-slate-800 text-slate-200 select-none shadow-sm z-30',
        'dark:bg-slate-950 dark:border-slate-800/80',
        'light:bg-slate-100 light:border-slate-200 light:text-slate-700',
        className
      )}
      role="navigation"
      aria-label="Pilihan topik materi"
    >
      <div className="mx-auto flex max-w-[1600px] items-center px-1 sm:px-2">
        {/* Scroll Left Button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="hidden sm:flex h-7 w-7 items-center justify-center rounded-full bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60 light:bg-white light:border-slate-300 light:text-slate-700 light:hover:bg-slate-200 transition-all shrink-0"
            aria-label="Geser ke kiri"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}

        {/* Scrollable Container */}
        <div
          ref={scrollRef}
          className="scrollbar-thin flex flex-1 items-center overflow-x-auto scroll-smooth py-1"
        >
          {W3S_RIBBON_ITEMS.map((item) => {
            const isActive = item.matchPrefixes.some((prefix) =>
              location.pathname.startsWith(prefix)
            );

            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={cn(
                  'px-3.5 py-1.5 text-xs font-bold tracking-wider uppercase rounded-lg transition-all whitespace-nowrap shrink-0 mx-0.5',
                  isActive
                    ? 'bg-accent-600 text-white shadow-sm ring-1 ring-accent-500/50'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 light:text-slate-600 light:hover:text-slate-950 light:hover:bg-slate-200/80'
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
            className="hidden sm:flex h-7 w-7 items-center justify-center rounded-full bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60 light:bg-white light:border-slate-300 light:text-slate-700 light:hover:bg-slate-200 transition-all shrink-0"
            aria-label="Geser ke kanan"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
