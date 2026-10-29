import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface TopicItem {
  label: string;
  path: string;
  icon?: string;
  badge?: string;
}

const DEFAULT_TOPICS: TopicItem[] = [
  { label: 'Semua Docs', path: '/docs', icon: '📚' },
  { label: 'Pemrograman', path: '/docs/pemrograman', icon: '💻' },
  { label: 'Python', path: '/docs/pemrograman/python', icon: '🐍' },
  { label: 'JavaScript', path: '/docs/pemrograman/javascript', icon: '⚡' },
  { label: 'PHP', path: '/docs/pemrograman/php', icon: '🐘' },
  { label: 'CyberSecurity', path: '/docs/cybersecurity', icon: '🛡️' },
  { label: 'DevOps & Docker', path: '/docs/devops', icon: '☁️' },
  { label: 'Jaringan', path: '/docs/jaringan', icon: '🌐' },
  { label: 'Roadmap', path: '/roadmap', icon: '🗺️' },
  { label: 'Code Editor', path: '/editor', icon: '⌨️' },
  { label: 'CySec Tools', path: '/cysec-tools', icon: '🔧', badge: '108+' },
  { label: 'Kamus IT', path: '/docs/terms-and-foreign-words', icon: '📖' },
];

/**
 * W3Schools-style Category Ribbon Bar.
 * Horizontal scrollable quick-jump bar with smooth touch/mouse navigation,
 * Material 3 pill indicators, and high visibility across devices.
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
        'relative border-b border-slate-800/80 bg-slate-900/95 backdrop-blur shadow-sm select-none',
        'dark:bg-slate-900/95 dark:border-slate-800/80',
        'light:bg-slate-100/90 light:border-slate-200',
        className
      )}
      role="navigation"
      aria-label="Pilihan topik cepat (W3Schools style)"
    >
      <div className="mx-auto flex max-w-[1500px] items-center px-1 sm:px-3">
        {/* Scroll Left Button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="hidden sm:flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-slate-300 shadow-sm transition-all hover:bg-slate-700 hover:text-white"
            aria-label="Geser ke kiri"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}

        {/* Scrollable Container */}
        <div
          ref={scrollRef}
          className="scrollbar-thin flex flex-1 items-center gap-1 overflow-x-auto py-1.5 px-1 scroll-smooth"
        >
          {DEFAULT_TOPICS.map((topic) => {
            const isActive =
              topic.path === '/docs'
                ? location.pathname === '/docs'
                : location.pathname.startsWith(topic.path);

            return (
              <NavLink
                key={topic.path}
                to={topic.path}
                className={cn(
                  'w3-ribbon-tab group inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold tracking-wide rounded-lg transition-all duration-150',
                  isActive
                    ? 'bg-accent-600 text-white shadow-sm ring-1 ring-accent-500/50'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100 light:text-slate-600 light:hover:bg-slate-200'
                )}
              >
                {topic.icon && <span className="text-xs">{topic.icon}</span>}
                <span>{topic.label}</span>
                {topic.badge && (
                  <span
                    className={cn(
                      'ml-0.5 rounded-full px-1.5 py-0.2 text-[9px] font-bold',
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-accent-500/15 text-accent-400'
                    )}
                  >
                    {topic.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Scroll Right Button */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="hidden sm:flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-slate-300 shadow-sm transition-all hover:bg-slate-700 hover:text-white"
            aria-label="Geser ke kanan"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}