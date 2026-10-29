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
 * W3Schools Signature Horizontal Ribbon Bar (Screenshot 2):
 * - Background khas W3Schools: dark charcoal #282A35.
 * - Tab aktif memiliki background PUTIH dan teks HITAM TEBAL (persis tab HTML di screenshot).
 * - Tab non-aktif memiliki teks PUTIH dengan hover dark highlight.
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
        'relative bg-[#282a35] border-b border-black/40 text-white select-none shadow-sm z-30',
        className
      )}
      role="navigation"
      aria-label="Pilihan topik W3Schools"
    >
      <div className="mx-auto flex max-w-[1600px] items-center px-1 sm:px-2">
        {/* Scroll Left Button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="hidden sm:flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black transition-all shrink-0"
            aria-label="Geser ke kiri"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}

        {/* Scrollable Container */}
        <div
          ref={scrollRef}
          className="scrollbar-thin flex flex-1 items-center overflow-x-auto scroll-smooth"
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
                  'px-3.5 py-2 text-xs font-bold tracking-wider uppercase transition-colors whitespace-nowrap shrink-0',
                  isActive
                    ? 'bg-white text-black shadow'
                    : 'text-white hover:bg-black/40'
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
            className="hidden sm:flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black transition-all shrink-0"
            aria-label="Geser ke kanan"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
