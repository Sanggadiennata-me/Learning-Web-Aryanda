import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  BookOpen,
  ChevronsRight,
  Code2,
  FolderTree,
  Map,
  Menu,
  Moon,
  Network,
  PanelLeftClose,
  Search,
  Shield,
  Sparkles,
  Sun,
  X,
} from 'lucide-react';
import { useSiteData } from './SiteProvider';
import { useTheme } from './ThemeProvider';
import { joinWithRoot } from '../lib/base';
import { TreeExplorer } from '../components/explorer/TreeExplorer';
import { TopicRibbon } from '../components/navigation/TopicRibbon';
import { TutorialsModal } from '../components/navigation/TutorialsModal';
import { MobileBottomNav } from '../components/navigation/MobileBottomNav';
import { cn } from '../lib/utils';
import type { TreeFolderNode, TreeNode } from '../domain/types';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'relative inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200',
    isActive
      ? 'bg-accent-600 text-white shadow-sm ring-1 ring-accent-500/50'
      : 'text-slate-300 hover:bg-slate-800 hover:text-white light:text-slate-600 light:hover:bg-slate-200'
  );

const SIDEBAR_STORAGE_KEY = 'lw-sidebar-collapsed';

function readSidebarState(): boolean {
  try {
    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function getActiveTrackInfo(pathname: string, activeId: string | null, tree: TreeFolderNode[] | null): { title: string; nodes: TreeNode[] } {
  const path = (activeId || pathname).toLowerCase();
  if (path.includes('pemrograman/html') || path.includes('/html')) {
    const pem = tree?.find((t) => t.name === 'Pemrograman');
    const htmlFolder = pem?.children.find((c): c is TreeFolderNode => c.type === 'folder' && c.name.toLowerCase() === 'html');
    return {
      title: 'HTML TUTORIAL',
      nodes: htmlFolder ? htmlFolder.children : [],
    };
  }
  if (path.includes('pemrograman/css') || path.includes('/css')) {
    const pem = tree?.find((t) => t.name === 'Pemrograman');
    const cssFolder = pem?.children.find((c): c is TreeFolderNode => c.type === 'folder' && c.name.toLowerCase() === 'css');
    return {
      title: 'CSS TUTORIAL',
      nodes: cssFolder ? cssFolder.children : [],
    };
  }
  if (path.includes('pemrograman/javascript') || path.includes('/javascript')) {
    const pem = tree?.find((t) => t.name === 'Pemrograman');
    const jsFolder = pem?.children.find((c): c is TreeFolderNode => c.type === 'folder' && c.name.toLowerCase() === 'javascript');
    return {
      title: 'JAVASCRIPT TUTORIAL',
      nodes: jsFolder ? jsFolder.children : [],
    };
  }
  if (path.includes('pemrograman/python') || path.includes('/python')) {
    const pem = tree?.find((t) => t.name === 'Pemrograman');
    const pyFolder = pem?.children.find((c): c is TreeFolderNode => c.type === 'folder' && c.name.toLowerCase() === 'python');
    return {
      title: 'PYTHON TUTORIAL',
      nodes: pyFolder ? pyFolder.children : [],
    };
  }
  if (path.includes('pemrograman/php') || path.includes('/php')) {
    const pem = tree?.find((t) => t.name === 'Pemrograman');
    const phpFolder = pem?.children.find((c): c is TreeFolderNode => c.type === 'folder' && c.name.toLowerCase() === 'php');
    return {
      title: 'PHP TUTORIAL',
      nodes: phpFolder ? phpFolder.children : [],
    };
  }
  if (path.includes('pemrograman/fundamental') || path.includes('/fundamental')) {
    const pem = tree?.find((t) => t.name === 'Pemrograman');
    const fundFolder = pem?.children.find((c): c is TreeFolderNode => c.type === 'folder' && c.name.toLowerCase() === 'fundamental');
    return {
      title: 'FUNDAMENTAL CODING',
      nodes: fundFolder ? fundFolder.children : [],
    };
  }
  if (path.includes('cybersecurity')) {
    const cy = tree?.find((t) => t.name === 'CyberSecurity');
    return {
      title: 'CYBERSECURITY TUTORIAL',
      nodes: cy?.children || [],
    };
  }
  if (path.includes('devops')) {
    const dev = tree?.find((t) => t.name === 'DevOps');
    return {
      title: 'DEVOPS & CLOUD TUTORIAL',
      nodes: dev?.children || [],
    };
  }
  if (path.includes('jaringan')) {
    const jar = tree?.find((t) => t.name === 'Jaringan');
    return {
      title: 'JARINGAN KOMPUTER TUTORIAL',
      nodes: jar?.children || [],
    };
  }
  if (path.includes('terms') || path.includes('foreign')) {
    const terms = tree?.find((t) => t.name.toLowerCase().includes('terms'));
    return {
      title: 'KAMUS ISTILAH IT',
      nodes: terms?.children || [],
    };
  }
  return {
    title: 'DAFTAR SEMUA MATERI',
    nodes: tree || [],
  };
}

/**
 * Layout Utama (Material Design & W3Schools Inspiration):
 * - Top App Bar dengan brand, navigasi utama ber-pill, search, & tema.
 * - W3Schools Topic Ribbon bar di bawah navbar untuk lompat cepat ke berbagai modul.
 * - Sidebar Explorer yang fleksibel, rapi, dan mudah difilter.
 * - Mobile Bottom Navigation Bar untuk ergonomi penggunaan HP.
 */
export function Layout({ children }: { children: React.ReactNode }) {
  const { tree } = useSiteData();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tutorialsModalOpen, setTutorialsModalOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(readSidebarState);
  const [sidebarFilter, setSidebarFilter] = useState('');

  const isDocsRoute = location.pathname.startsWith('/docs');
  const activeId =
    location.pathname.startsWith('/docs/') && location.pathname !== '/docs/'
      ? decodeURIComponent(location.pathname.slice('/docs/'.length))
      : null;

  const activeTrackInfo = useMemo(() => {
    return getActiveTrackInfo(location.pathname, activeId, tree);
  }, [location.pathname, activeId, tree]);

  // Tutup drawer saat rute berubah.
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // ESC menutup drawer.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  // Kunci scroll body saat drawer terbuka.
  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);

  // Simpan preferensi collapse sidebar.
  useEffect(() => {
    try {
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, sidebarCollapsed ? '1' : '0');
    } catch {
      /* abaikan */
    }
  }, [sidebarCollapsed]);

  const closeDrawer = () => setDrawerOpen(false);

  // Komponen Sidebar Explorer ala W3Schools
  const explorer = (
    <div className="flex h-full min-h-0 flex-col bg-white border-r border-slate-200 dark:bg-slate-950 dark:border-slate-800">
      {/* Filter Bab Cepat ala W3Schools */}
      <div className="border-b border-slate-200 p-2.5 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
        <div className="relative">
          <input
            type="text"
            value={sidebarFilter}
            onChange={(e) => setSidebarFilter(e.target.value)}
            placeholder="Cari materi tutorial…"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-accent-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          />
          {sidebarFilter && (
            <button
              onClick={() => setSidebarFilter('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {activeTrackInfo.nodes.length > 0 ? (
          <TreeExplorer
            nodes={activeTrackInfo.nodes}
            activeId={activeId}
            filterQuery={sidebarFilter}
            sidebarTitle={activeTrackInfo.title}
            variant="sidebar"
            onNavigate={closeDrawer}
            onOpenTutorialsModal={() => setTutorialsModalOpen(true)}
          />
        ) : tree ? (
          <TreeExplorer
            nodes={tree}
            activeId={activeId}
            filterQuery={sidebarFilter}
            sidebarTitle="DAFTAR SEMUA MATERI"
            variant="sidebar"
            onNavigate={closeDrawer}
            onOpenTutorialsModal={() => setTutorialsModalOpen(true)}
          />
        ) : (
          <p className="px-4 py-6 text-xs text-slate-500">Memuat navigasi materi…</p>
        )}
      </div>
    </div>
  );

  const drawerNav = (
    <nav className="flex flex-col gap-1 p-3" aria-label="Navigasi drawer">
      <p className="px-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
        Menu Utama
      </p>
      <NavLink to="/docs" className={navLinkClass}>
        <BookOpen className="h-3.5 w-3.5" />
        Tutorials
      </NavLink>
      <NavLink to="/roadmap" className={navLinkClass}>
        <Map className="h-3.5 w-3.5" />
        Roadmap Belajar
      </NavLink>
      <NavLink to="/graph" className={navLinkClass}>
        <Network className="h-3.5 w-3.5" />
        Graf Pengetahuan
      </NavLink>
      <NavLink to="/editor" className={navLinkClass}>
        <Code2 className="h-3.5 w-3.5" />
        Code Editor Interaktif
      </NavLink>
      <NavLink to="/cysec-tools" className={navLinkClass}>
        <Shield className="h-3.5 w-3.5" />
        CySec & OSINT Tools
      </NavLink>
      <div className="my-2 border-t border-slate-800 light:border-slate-200" />
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 light:bg-slate-50 light:text-slate-800">
      {/* ============ TOP APP BAR (Material 3 Style) ============ */}
      <header className="sticky top-0 z-40 border-b border-slate-800/90 bg-slate-950/90 backdrop-blur-md supports-[backdrop-filter]:bg-slate-950/80 light:border-slate-200 light:bg-white/95 shadow-sm">
        <div className="mx-auto flex h-14 max-w-[1550px] items-center justify-between gap-2 px-3 sm:gap-4 sm:px-5">
          {/* Sisi Kiri: Hamburger + Brand */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Hamburger button (muncul saat rute docs di HP atau drawer umum) */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100 light:hover:bg-slate-100 lg:hidden"
              aria-label="Buka navigasi materi"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link
              to="/"
              className="group flex min-w-0 items-center gap-2.5 rounded-xl py-1 focus:outline-none"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-500/10 p-1 ring-1 ring-accent-500/30 transition-transform group-hover:scale-105">
                <img
                  src={joinWithRoot('assets/asset/logo%20web.png')}
                  alt="Logo CodeLearn"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold tracking-tight text-slate-100 group-hover:text-accent-400 transition-colors light:text-slate-900 text-sm sm:text-base">
                    CodeLearn
                  </span>
                  <span className="hidden rounded-full bg-accent-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-400 light:bg-accent-100 light:text-accent-700 sm:inline-block">
                    PRO
                  </span>
                </div>
                <span className="hidden text-[10px] text-slate-500 light:text-slate-400 sm:block leading-none -mt-0.5">
                  Knowledge & Security Hub
                </span>
              </div>
            </Link>
          </div>

          {/* Sisi Tengah: Navigasi Desktop Ber-Pills ala Material */}
          <nav className="hidden items-center gap-1.5 lg:flex" aria-label="Navigasi Utama">
            <button
              onClick={() => setTutorialsModalOpen(true)}
              className={cn(
                'group inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition-all duration-150',
                isDocsRoute
                  ? 'bg-accent-600 text-white shadow-sm ring-1 ring-accent-500/50'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white light:text-slate-600 light:hover:bg-slate-100 light:hover:text-slate-900'
              )}
              title="Katalog tutorial & kurikulum belajar"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Tutorials</span>
              <span className="text-[10px] opacity-70">▾</span>
            </button>
            <NavLink to="/roadmap" className={navLinkClass}>
              <Map className="h-3.5 w-3.5" />
              Roadmap
            </NavLink>
            <NavLink to="/graph" className={navLinkClass}>
              <Network className="h-3.5 w-3.5" />
              Graph
            </NavLink>
            <NavLink to="/editor" className={navLinkClass}>
              <Code2 className="h-3.5 w-3.5" />
              Editor
            </NavLink>
            <NavLink to="/cysec-tools" className={navLinkClass}>
              <Shield className="h-3.5 w-3.5" />
              CySec Tools
            </NavLink>
          </nav>

          {/* Sisi Kanan: Search Bar + Theme Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Search Pill Button */}
            <Link
              to="/search"
              className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs text-slate-400 transition-all hover:border-accent-500/50 hover:text-slate-200 light:border-slate-200 light:bg-slate-100 light:text-slate-600 shadow-sm"
              aria-label="Cari materi pembelajaran"
            >
              <Search className="h-3.5 w-3.5 text-accent-500" />
              <span className="hidden sm:inline">Cari materi & tool…</span>
              <kbd className="hidden rounded-md border border-slate-700 bg-slate-800/80 px-1.5 py-0.5 font-mono text-[10px] text-slate-400 light:border-slate-300 light:bg-white md:inline">
                /
              </kbd>
            </Link>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/90 text-slate-400 transition-all hover:border-slate-700 hover:text-slate-100 light:border-slate-200 light:bg-slate-100 light:text-slate-700 shadow-sm active:scale-95"
              aria-label={theme === 'dark' ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'}
              title={theme === 'dark' ? 'Tema terang' : 'Tema gelap'}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-indigo-600" />
              )}
            </button>
          </div>
        </div>

        {/* ============ W3SCHOOLS TOPIC RIBBON BAR ============ */}
        <TopicRibbon />
      </header>

      {/* ============ KONTEN & SIDEBAR ============ */}
      <div className="mx-auto flex max-w-[1550px]">
        {/* ============ MOBILE/TABLET DRAWER ============ */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
            <div
              className="drawer-overlay absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={closeDrawer}
              aria-hidden
            />
            <aside className="drawer-panel absolute left-0 top-0 flex h-full w-80 max-w-[85vw] flex-col border-r border-slate-800 bg-slate-950 shadow-2xl light:border-slate-200 light:bg-white">
              <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 light:border-slate-200">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent-500" />
                  <span className="text-sm font-bold text-slate-100 light:text-slate-900">
                    Navigasi CodeLearn
                  </span>
                </div>
                <button
                  onClick={closeDrawer}
                  className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100 light:hover:bg-slate-100"
                  aria-label="Tutup menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {drawerNav}
              <div className="min-h-0 flex-1">{explorer}</div>
            </aside>
          </div>
        )}

        {/* ============ DESKTOP COLLAPSIBLE SIDEBAR ============ */}
        {isDocsRoute && (
          <aside
            className={cn(
              'sticky top-[5.75rem] hidden h-[calc(100vh-5.75rem)] shrink-0 border-r border-slate-800/80 transition-[width] duration-200 light:border-slate-200 lg:block',
              sidebarCollapsed ? 'w-14' : 'w-72 xl:w-80'
            )}
          >
            {sidebarCollapsed ? (
              <div className="flex h-full flex-col items-center pt-4">
                <button
                  onClick={() => setSidebarCollapsed(false)}
                  className="rounded-xl border border-slate-800 p-2 text-slate-400 transition-all hover:bg-slate-800 hover:text-slate-100 light:border-slate-200 light:hover:bg-slate-100 shadow-sm"
                  aria-label="Buka sidebar materi"
                  title="Buka sidebar materi"
                >
                  <ChevronsRight className="h-4 w-4" />
                </button>
                <span className="mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 [writing-mode:vertical-rl]">
                  Buka Bab
                </span>
              </div>
            ) : (
              explorer
            )}
          </aside>
        )}

        {/* Konten Halaman */}
        <main
          className={cn(
            'min-w-0 flex-1 pb-20 md:pb-8',
            isDocsRoute ? 'px-4 py-6 sm:px-8 xl:px-10' : ''
          )}
        >
          {children}
        </main>
      </div>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 light:border-slate-200 light:bg-white pb-16 md:pb-0">
        <div className="mx-auto max-w-[1550px] px-4 py-8 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2.5 text-sm">
              <img
                src={joinWithRoot('assets/asset/logo%20web.png')}
                alt=""
                className="h-6 w-6 object-contain"
              />
              <span className="font-semibold text-slate-200 light:text-slate-800">
                CodeLearn
              </span>
              <span className="text-xs text-slate-500">
                — Platform Belajar Mandiri berbasis Obsidian Vault
              </span>
            </div>
            <nav className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 light:text-slate-600">
              <Link to="/docs" className="transition-colors hover:text-accent-500">
                Tutorials
              </Link>
              <Link to="/roadmap" className="transition-colors hover:text-accent-500">
                Roadmap
              </Link>
              <Link to="/graph" className="transition-colors hover:text-accent-500">
                Graph
              </Link>
              <Link to="/editor" className="transition-colors hover:text-accent-500">
                Editor
              </Link>
              <Link to="/cysec-tools" className="transition-colors hover:text-accent-500">
                CySec Tools
              </Link>
            </nav>
          </div>
        </div>
      </footer>

      {/* ============ MOBILE BOTTOM NAVIGATION BAR ============ */}
      <MobileBottomNav />

      {/* ============ W3SCHOOLS TUTORIALS MEGA-MENU MODAL ============ */}
      <TutorialsModal
        isOpen={tutorialsModalOpen}
        onClose={() => setTutorialsModalOpen(false)}
      />
    </div>
  );
}