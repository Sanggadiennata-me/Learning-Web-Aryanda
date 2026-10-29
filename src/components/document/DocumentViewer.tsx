import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  Code2,
  FileText,
} from 'lucide-react';
import type { DocumentData } from '../../domain/types';
import { useSiteData } from '../../app/SiteProvider';
import { useTheme } from '../../app/ThemeProvider';
import { TagBadge } from './TagBadge';
import { sortTags } from '../../lib/tagColors';
import { Breadcrumb } from './Breadcrumb';
import { PrevNext } from './PrevNext';
import { Backlinks } from './Backlinks';
import { cn } from '../../lib/utils';
import { copyToClipboard } from '../../lib/clipboard';

/** Label tampilan bahasa untuk code block. */
const LANG_LABELS: Record<string, string> = {
  javascript: 'JavaScript',
  js: 'JavaScript',
  jsx: 'JSX',
  typescript: 'TypeScript',
  ts: 'TypeScript',
  tsx: 'TSX',
  php: 'PHP',
  python: 'Python',
  py: 'Python',
  java: 'Java',
  c: 'C',
  cpp: 'C++',
  'c++': 'C++',
  csharp: 'C#',
  cs: 'C#',
  html: 'HTML',
  xml: 'XML',
  css: 'CSS',
  scss: 'SCSS',
  less: 'Less',
  sql: 'SQL',
  bash: 'Bash',
  shell: 'Shell',
  sh: 'Shell',
  zsh: 'Zsh',
  json: 'JSON',
  yaml: 'YAML',
  yml: 'YAML',
  markdown: 'Markdown',
  md: 'Markdown',
  plaintext: 'Text',
  text: 'Text',
  diff: 'Diff',
  dockerfile: 'Dockerfile',
  go: 'Go',
  rust: 'Rust',
  ruby: 'Ruby',
  kotlin: 'Kotlin',
  swift: 'Swift',
  graphql: 'GraphQL',
  ini: 'INI',
  makefile: 'Makefile',
  perl: 'Perl',
  r: 'R',
  objectivec: 'Objective-C',
  vbnet: 'VB.NET',
  http: 'HTTP',
};

const RUNNABLE_MAP: Record<string, string> = {
  javascript: 'javascript',
  js: 'javascript',
  typescript: 'typescript',
  ts: 'typescript',
  html: 'html',
  xml: 'html',
  css: 'css',
  php: 'php',
  python: 'python',
  py: 'python',
  sql: 'sql',
};

function languageFromCode(code: HTMLElement | null): string {
  if (!code) return '';
  for (const cls of code.classList) {
    if (cls.startsWith('language-')) {
      return cls.slice('language-'.length).toLowerCase();
    }
  }
  return '';
}

/**
 * Scroll ke elemen heading berdasarkan hash.
 */
function scrollToHash(rawHash: string): boolean {
  const id = decodeURIComponent(rawHash);
  let el = document.getElementById(id);
  if (!el) {
    const lower = id.toLowerCase();
    const candidates = document.querySelectorAll<HTMLElement>('h1,h2,h3,h4,h5,h6,[id]');
    for (const candidate of candidates) {
      if ((candidate.id || '').toLowerCase() === lower) {
        el = candidate;
        break;
      }
    }
  }
  if (!el) return false;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return true;
}

/**
 * Document viewer utama (W3Schools & Material Design UX):
 * - Navigasi Bab Atas & Bawah ala W3Schools (Previous / Next selalu terlihat).
 * - Code Block dilengkapi tombol "Coba Sendiri »" yang langsung membuka code editor.
 * - Material 3 chips untuk reading time, tanggal update, dan tags.
 * - Table of contents dinamis dengan smooth scroll spy.
 */
export function DocumentViewer({ doc }: { doc: DocumentData }) {
  const articleRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { fileMap } = useSiteData();

  const prevDoc = doc.previous ? fileMap.get(doc.previous) : null;
  const nextDoc = doc.next ? fileMap.get(doc.next) : null;

  // Intercept klik pada link internal agar SPA tidak reload/redirect.
  useEffect(() => {
    const element = articleRef.current;
    if (!element) return;

    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href') ?? '';

      if (href.startsWith('/docs/')) {
        event.preventDefault();
        navigate(href);
      } else if (href === '#') {
        event.preventDefault();
      } else if (href.startsWith('#')) {
        event.preventDefault();
        const id = href.slice(1);
        scrollToHash(id);
        navigate(`${location.pathname}${location.search}#${id}`, { replace: true });
      }
    };

    element.addEventListener('click', onClick);
    return () => element.removeEventListener('click', onClick);
  }, [navigate, doc.id, location.pathname, location.search]);

  // Scroll ke heading saat URL membawa anchor (#...).
  useEffect(() => {
    if (!location.hash) return;
    const rawHash = location.hash.slice(1);
    const timer = setTimeout(() => {
      scrollToHash(rawHash);
    }, 60);
    return () => clearTimeout(timer);
  }, [location.hash, doc.id]);

  // Tingkatkan code block: label bahasa + tombol "Coba Sendiri" + tombol copy.
  useEffect(() => {
    const root = articleRef.current;
    if (!root) return;

    root.querySelectorAll<HTMLPreElement>('pre').forEach((pre) => {
      if (pre.querySelector('.code-block-header')) return;
      const code = pre.querySelector('code');
      const lang = languageFromCode(code);
      const label = LANG_LABELS[lang] ?? (lang ? lang.charAt(0).toUpperCase() + lang.slice(1) : 'Text');

      const header = document.createElement('div');
      header.className = 'code-block-header';

      const langEl = document.createElement('span');
      langEl.className = 'code-block-lang';
      langEl.textContent = label;

      const actions = document.createElement('div');
      actions.className = 'flex items-center gap-1.5 ml-auto';

      // Coba Sendiri (Run Code) button ala W3Schools
      const mappedLang = RUNNABLE_MAP[lang];
      if (mappedLang) {
        const tryBtn = document.createElement('button');
        tryBtn.type = 'button';
        tryBtn.className = 'code-block-try';
        tryBtn.textContent = 'Coba Sendiri »';
        tryBtn.setAttribute('title', `Buka dan jalankan contoh ${label} ini di Code Editor`);
        tryBtn.addEventListener('click', (e) => {
          e.preventDefault();
          const text = code?.innerText ?? '';
          navigate(`/editor?lang=${mappedLang}&code=${encodeURIComponent(text)}`);
        });
        actions.appendChild(tryBtn);
      }

      // Tombol Copy
      const copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'code-block-copy';
      copyBtn.textContent = 'Copy';
      copyBtn.setAttribute('aria-label', `Salin kode ${label}`);

      copyBtn.addEventListener('click', async () => {
        const text = code?.innerText ?? '';
        try {
          await copyToClipboard(text);
          copyBtn.textContent = 'Copied';
          copyBtn.classList.add('copied');
        } catch {
          copyBtn.textContent = 'Gagal';
        }
        window.setTimeout(() => {
          copyBtn.textContent = 'Copy';
          copyBtn.classList.remove('copied');
        }, 1600);
      });

      actions.appendChild(copyBtn);
      header.append(langEl, actions);
      pre.prepend(header);
      pre.classList.add('code-block');
    });
  }, [doc.id, doc.html, navigate]);

  return (
    <article className="w-full">
      {/* ============ BREADCRUMB & HEADER ============ */}
      <div className="flex flex-col gap-2">
        <Breadcrumb folder={doc.folder} current={doc.title} />

        {/* ============ W3SCHOOLS SIGNATURE TOP NAVIGATION BAR ============ */}
        <nav
          aria-label="Navigasi bab atas"
          className="my-3 flex items-center justify-between gap-3"
        >
          {prevDoc ? (
            <Link
              to={`/docs/${doc.previous}`}
              className="w3-nav-btn w3-nav-btn-secondary px-4 py-2 sm:px-5 sm:py-2.5 font-bold shadow-sm"
              title={prevDoc.title}
            >
              <span>❮</span>
              <span>Sebelumnya</span>
            </Link>
          ) : (
            <Link
              to="/docs"
              className="w3-nav-btn w3-nav-btn-secondary px-4 py-2 sm:px-5 sm:py-2.5 font-bold shadow-sm"
            >
              <span>❮</span>
              <span>Home</span>
            </Link>
          )}

          {nextDoc && (
            <Link
              to={`/docs/${doc.next}`}
              className="w3-nav-btn w3-nav-btn-primary px-5 py-2 sm:px-6 sm:py-2.5 font-bold shadow ml-auto"
              title={nextDoc.title}
            >
              <span>Selanjutnya</span>
              <span>❯</span>
            </Link>
          )}
        </nav>
      </div>

      {/* ============ JUDUL DOKUMEN & METADATA ============ */}
      <header className="mt-4 border-b border-slate-800 pb-6">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-100">
          {doc.title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-400">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1 font-medium shadow-sm">
            <Clock className="h-3.5 w-3.5 text-accent-500" />
            {doc.readingTime} menit baca
          </span>
          {doc.updated && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1 font-medium shadow-sm">
              <Calendar className="h-3.5 w-3.5 text-accent-500" />
              {doc.updated}
            </span>
          )}
          {sortTags(doc.tags).map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>

        {/* W3Schools Signature "Learn [Topic]" Hero Card (Screenshot 2) */}
        {!doc.previous && (
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-500/15 text-accent-500 font-bold text-xl">
                ★
              </span>
              <div className="min-w-0">
                <h2 className="text-2xl font-extrabold text-slate-100">
                  Pelajari {doc.title}
                </h2>
                <p className="mt-2 text-base sm:text-[17px] text-slate-400 leading-relaxed">
                  Modul kurikulum terstruktur. Ikuti materi di bawah secara bertahap untuk menguasai materi ini dengan tuntas.
                </p>
                {nextDoc && (
                  <Link
                    to={`/docs/${doc.next}`}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-accent-600 px-6 py-3 text-sm font-bold text-white shadow-sm ring-1 ring-accent-500/50 transition-all hover:bg-accent-500 active:scale-95"
                  >
                    <span>Mulai Belajar Sekarang</span>
                    <span>❯</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ============ AREA KONTEN PENUH (FULL WIDTH) ============ */}
      <div className="mt-8 w-full">
        {/* HTML Markdown Content */}
        <div
          ref={articleRef}
          className={cn(
            'doc-content prose prose-slate max-w-none text-slate-300',
            theme === 'dark' && 'prose-invert'
          )}
          dangerouslySetInnerHTML={{ __html: doc.html }}
        />

        {/* Backlinks & Bottom Navigation */}
        <div className="mt-12 space-y-6">
          {/* W3Schools Signature Bottom Nav Bar */}
          {(prevDoc || nextDoc) && (
            <nav
              aria-label="Navigasi bab bawah"
              className="my-6 flex items-center justify-between gap-3 border-t border-slate-800 pt-6 light:border-slate-200"
            >
              {prevDoc ? (
                <Link
                  to={`/docs/${doc.previous}`}
                  className="w3-nav-btn w3-nav-btn-secondary px-4 py-2 sm:px-5 sm:py-2.5 font-bold shadow-sm"
                  title={prevDoc.title}
                >
                  <span>❮</span>
                  <span>Sebelumnya</span>
                </Link>
              ) : (
                <div />
              )}

              {nextDoc ? (
                <Link
                  to={`/docs/${doc.next}`}
                  className="w3-nav-btn w3-nav-btn-primary px-5 py-2 sm:px-6 sm:py-2.5 font-bold shadow ml-auto"
                  title={nextDoc.title}
                >
                  <span>Selanjutnya</span>
                  <span>❯</span>
                </Link>
              ) : (
                <div />
              )}
            </nav>
          )}

          <Backlinks doc={doc} />
          <PrevNext doc={doc} />
        </div>
      </div>
    </article>
  );
}