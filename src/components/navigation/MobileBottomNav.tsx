import { NavLink } from 'react-router-dom';
import { BookOpen, Code2, Home, Network, Shield } from 'lucide-react';
import { cn } from '../../lib/utils';

interface NavItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', to: '/', icon: Home },
  { label: 'Tutorials', to: '/docs', icon: BookOpen },
  { label: 'Graph', to: '/graph', icon: Network },
  { label: 'Editor', to: '/editor', icon: Code2 },
  { label: 'Tools', to: '/cysec-tools', icon: Shield },
];

/**
 * Material Design 3 Mobile Navigation Bar.
 * Fixed at the bottom of the viewport on mobile devices for ergonomic thumb reach.
 */
export function MobileBottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800 bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-slate-950/85 md:hidden"
      aria-label="Navigasi bawah mobile"
    >
      <div className="grid h-16 grid-cols-5 items-center px-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'group flex flex-col items-center justify-center py-1 text-center transition-all',
                isActive
                  ? 'text-accent-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'flex h-7 w-12 items-center justify-center rounded-full transition-all duration-200',
                    isActive
                      ? 'bg-accent-500/20 text-accent-400'
                      : 'text-slate-400 group-hover:bg-slate-800'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                </span>
                <span className="mt-0.5 text-[11px] leading-tight tracking-tight">
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}