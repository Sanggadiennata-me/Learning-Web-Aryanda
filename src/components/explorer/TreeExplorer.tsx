import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, Code2, FileText, Folder, Map } from 'lucide-react';
import type { TreeNode } from '../../domain/types';
import { countFiles, normalizeId } from '../../services/docs';
import { languageInfo } from '../../lib/codeLanguages';
import { cn } from '../../lib/utils';

interface TreeExplorerProps {
  nodes: TreeNode[];
  activeId?: string | null;
  filterQuery?: string;
  sidebarTitle?: string;
  /** Sidebar: gaya tutorial W3Schools. Page: mode eksplorasi penuh. */
  variant?: 'sidebar' | 'page';
  className?: string;
  onNavigate?: () => void;
  onOpenTutorialsModal?: () => void;
}

function ancestorsOf(nodes: TreeNode[], id: string, trail: string[] = []): string[] {
  for (const node of nodes) {
    if (node.type === 'file') {
      if (node.id === id) return trail;
    } else {
      const pathTrail = [...trail, node.relativePath];
      if (node.relativePath && normalizeId(node.relativePath) === id) {
        return pathTrail;
      }
      const found = ancestorsOf(node.children, id, pathTrail);
      if (found.length > 0) return found;
    }
  }
  return [];
}

function filterTree(
  nodes: TreeNode[],
  query: string
): { filtered: TreeNode[]; matchedPaths: Set<string> } {
  const q = query.trim().toLowerCase();
  if (!q) return { filtered: nodes, matchedPaths: new Set() };

  const matchedPaths = new Set<string>();

  function walk(list: TreeNode[]): TreeNode[] {
    const res: TreeNode[] = [];
    for (const node of list) {
      if (node.type === 'file') {
        if (node.title.toLowerCase().includes(q)) {
          res.push(node);
        }
      } else {
        const matchesSelf = node.name.toLowerCase().includes(q);
        const children = walk(node.children);
        if (matchesSelf || children.length > 0) {
          matchedPaths.add(node.relativePath);
          res.push({
            ...node,
            children: matchesSelf ? node.children : children,
          });
        }
      }
    }
    return res;
  }

  return { filtered: walk(nodes), matchedPaths };
}

/**
 * Sidebar Navigation:
 * - Mengadopsi struktur bab & materi W3Schools yang terstruktur per kurikulum.
 * - Menggunakan palet warna personal CodeLearn: aksen hijau tema (accent) dengan indikator border kiri.
 * - Tampilan flat, bersih, tanpa ikon bertumpuk, nyaman dibaca.
 */
export function TreeExplorer({
  nodes,
  activeId,
  filterQuery = '',
  sidebarTitle,
  variant = 'sidebar',
  className,
  onNavigate,
  onOpenTutorialsModal,
}: TreeExplorerProps) {
  const { filtered: displayNodes, matchedPaths } = useMemo(
    () => filterTree(nodes, filterQuery),
    [nodes, filterQuery]
  );

  const autoExpand = useMemo(
    () => (activeId ? new Set(ancestorsOf(nodes, activeId)) : new Set<string>()),
    [nodes, activeId]
  );

  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    setExpanded((prev) => new Set([...prev, ...autoExpand]));
  }, [autoExpand]);

  useEffect(() => {
    if (filterQuery.trim()) {
      setExpanded((prev) => new Set([...prev, ...matchedPaths]));
    }
  }, [filterQuery, matchedPaths]);

  const toggle = (relativePath: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(relativePath)) next.delete(relativePath);
      else next.add(relativePath);
      return next;
    });
  };

  return (
    <nav className={cn('select-none flex flex-col h-full', className)} aria-label="Navigasi tutorial">
      {/* W3Schools Sidebar Title (Screenshot 2) */}
      {variant === 'sidebar' && sidebarTitle && (
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 bg-white dark:bg-slate-950 dark:border-slate-800">
          <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            {sidebarTitle}
          </span>
          {onOpenTutorialsModal && (
            <button
              onClick={onOpenTutorialsModal}
              className="text-[11px] font-bold text-accent-600 hover:underline dark:text-accent-400"
              title="Ganti modul tutorial"
            >
              Ganti ▾
            </button>
          )}
        </div>
      )}

      {displayNodes.length === 0 && (
        <div className="py-8 px-4 text-center text-xs text-slate-400">
          Tidak ada materi yang sesuai &ldquo;{filterQuery}&rdquo;.
        </div>
      )}

      {/* List bab & materi tutorial */}
      <div className="flex-1 overflow-y-auto scrollbar-thin py-1">
        <ul className="space-y-0.5">
          {displayNodes.map((node) => (
            <TreeNodeRow
              key={node.type === 'file' ? node.id : node.relativePath}
              node={node}
              depth={0}
              activeId={activeId}
              expanded={expanded}
              onToggle={toggle}
              variant={variant}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      </div>
    </nav>
  );
}

interface RowProps {
  node: TreeNode;
  depth: number;
  activeId?: string | null;
  expanded: Set<string>;
  onToggle: (path: string) => void;
  variant: 'sidebar' | 'page';
  onNavigate?: () => void;
}

function TreeNodeRow({
  node,
  depth,
  activeId,
  expanded,
  onToggle,
  variant,
  onNavigate,
}: RowProps) {
  if (node.type === 'file') {
    const active = activeId === node.id;
    const padding = variant === 'sidebar' ? 16 + depth * 12 : 12 + depth * 16;
    const codeLang = node.isCode ? languageInfo(node.language ?? 'plaintext') : null;

    if (variant === 'sidebar') {
      return (
        <li>
          <Link
            to={`/docs/${node.id}`}
            onClick={onNavigate}
            className={cn(
              'flex items-center justify-between w-full py-2 pr-3 text-[13.5px] transition-colors',
              active
                ? 'bg-accent-500/15 text-accent-800 font-bold border-l-4 border-l-accent-600 dark:bg-accent-500/20 dark:text-accent-300 dark:border-l-accent-400'
                : 'text-slate-700 hover:bg-slate-200/60 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white'
            )}
            style={{ paddingLeft: padding }}
            title={node.title}
          >
            <span className="truncate">{node.title}</span>
            {node.isRoadmap && (
              <span className="text-[9px] font-bold uppercase tracking-wider text-accent-600 dark:text-accent-400 ml-1.5 shrink-0">
                MAP
              </span>
            )}
          </Link>
        </li>
      );
    }

    // Tampilan Page Explorer (Directory Mode)
    return (
      <li>
        <Link
          to={`/docs/${node.id}`}
          onClick={onNavigate}
          className={cn(
            'group relative flex items-center gap-2 rounded-xl py-1.5 pr-2.5 text-xs transition-all',
            active
              ? 'bg-accent-600 text-white font-bold shadow-sm'
              : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
          )}
          style={{ paddingLeft: padding }}
        >
          {node.isRoadmap ? (
            <Map className="h-3.5 w-3.5 shrink-0 text-accent-400" />
          ) : (
            <FileText className="h-3.5 w-3.5 shrink-0 opacity-60" />
          )}
          <span className="truncate">{node.title}</span>
        </Link>
      </li>
    );
  }

  const isOpen = expanded.has(node.relativePath);
  const count = countFiles([node]);
  const padding = variant === 'sidebar' ? 16 + depth * 12 : 10 + depth * 16;

  if (variant === 'sidebar') {
    return (
      <li className="mt-0.5">
        <button
          onClick={() => onToggle(node.relativePath)}
          className="flex w-full items-center justify-between py-2 pr-3 text-left text-[13.5px] font-bold text-slate-800 transition-colors hover:bg-slate-200/80 dark:text-slate-200 dark:hover:bg-slate-800"
          style={{ paddingLeft: padding }}
          aria-expanded={isOpen}
        >
          <span className="truncate">{node.name}</span>
          <span className="text-[10px] text-slate-400 shrink-0 ml-1">
            {isOpen ? '▲' : '▼'}
          </span>
        </button>

        {isOpen && (
          <ul className="space-y-0.5 bg-black/[0.02] dark:bg-white/[0.02]">
            {node.children.map((child) => (
              <TreeNodeRow
                key={child.type === 'file' ? child.id : child.relativePath}
                node={child}
                depth={depth + 1}
                activeId={activeId}
                expanded={expanded}
                onToggle={onToggle}
                variant={variant}
                onNavigate={onNavigate}
              />
            ))}
          </ul>
        )}
      </li>
    );
  }

  return (
    <li>
      <button
        onClick={() => onToggle(node.relativePath)}
        className="flex w-full items-center gap-2 rounded-xl py-1.5 pr-2 text-left text-xs font-semibold text-slate-300 hover:bg-slate-800/70 hover:text-white"
        style={{ paddingLeft: padding }}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        )}
        <Folder className="h-3.5 w-3.5 shrink-0 text-amber-400" />
        <span className="truncate">{node.name}</span>
        <span className="ml-auto rounded-full bg-slate-800 px-1.5 py-0.5 text-[9px] text-slate-500">
          {count}
        </span>
      </button>

      {isOpen && (
        <ul className="space-y-0.5 border-l border-slate-800/60 ml-3.5 pl-1 my-0.5">
          {node.children.map((child) => (
            <TreeNodeRow
              key={child.type === 'file' ? child.id : child.relativePath}
              node={child}
              depth={depth + 1}
              activeId={activeId}
              expanded={expanded}
              onToggle={onToggle}
              variant={variant}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
