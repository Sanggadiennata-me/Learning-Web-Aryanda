import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { TreeNode } from '../../domain/types';
import { normalizeId } from '../../services/docs';
import { cn } from '../../lib/utils';

interface TreeExplorerProps {
  nodes: TreeNode[];
  activeId?: string | null;
  filterQuery?: string;
  sidebarTitle?: string;
  className?: string;
  variant?: 'page' | 'sidebar' | string;
  onNavigate?: () => void;
  onOpenTutorialsModal?: () => void;
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
  className,
  onNavigate,
  onOpenTutorialsModal,
}: TreeExplorerProps) {
  const { filtered: displayNodes, matchedPaths } = useMemo(
    () => filterTree(nodes, filterQuery),
    [nodes, filterQuery]
  );

  // Folder pada sidebar diset tertutup secara default (auto open = false)
  // sesuai permintaan: saat subskill dibuka, hanya nama subskill/bab utama yang tampil
  // dan pengguna membukanya secara manual.
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set<string>());

  // Saat modul tutorial berganti (nodes berganti), reset folder bab ke kondisi tertutup
  useEffect(() => {
    setExpanded(new Set<string>());
  }, [nodes]);

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
      {/* Sidebar Header Title */}
      {sidebarTitle && (
        <div className="flex items-center justify-between border-b border-emerald-100/80 px-4 py-3 bg-white dark:bg-[#0c1410] dark:border-accent-950/60">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent-500" />
            <span className="text-xs font-black uppercase tracking-wider text-accent-700 dark:text-accent-400">
              {sidebarTitle}
            </span>
          </div>
          {onOpenTutorialsModal && (
            <button
              onClick={onOpenTutorialsModal}
              className="text-[11px] font-bold text-accent-600 hover:text-accent-700 hover:underline dark:text-accent-400 dark:hover:text-accent-300"
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
  onNavigate?: () => void;
}

function TreeNodeRow({
  node,
  depth,
  activeId,
  expanded,
  onToggle,
  onNavigate,
}: RowProps) {
  if (node.type === 'file') {
    const active =
      activeId === node.id ||
      (Boolean(activeId) && normalizeId(activeId!) === normalizeId(node.id));
    const padding = 16 + depth * 12;

    return (
      <li>
        <Link
          to={`/docs/${node.id}`}
          onClick={onNavigate}
          className={cn(
            'flex items-center justify-between w-full py-2 pr-3 text-[13.5px] transition-colors',
            active
              ? 'bg-accent-500/15 text-accent-700 font-bold border-l-4 border-l-accent-600 dark:bg-accent-500/20 dark:text-accent-300 dark:border-l-accent-400'
              : 'text-slate-700 hover:bg-accent-50/70 hover:text-accent-700 dark:text-slate-300 dark:hover:bg-accent-500/10 dark:hover:text-accent-300'
          )}
          style={{ paddingLeft: padding }}
          title={node.title}
        >
          <span className="truncate">{node.title}</span>
        </Link>
      </li>
    );
  }

  const isOpen = expanded.has(node.relativePath);
  const padding = 16 + depth * 12;

  return (
    <li className="mt-0.5">
      <button
        onClick={() => onToggle(node.relativePath)}
        className="flex w-full items-center justify-between py-2 pr-3 text-left text-[13.5px] font-bold text-slate-800 hover:text-accent-700 hover:bg-accent-50/60 dark:text-slate-100 dark:hover:text-accent-300 dark:hover:bg-accent-500/10 transition-colors"
        style={{ paddingLeft: padding }}
        aria-expanded={isOpen}
      >
        <span className="truncate">{node.name}</span>
        <span className="text-[10px] font-bold text-accent-600 dark:text-accent-400 shrink-0 ml-1">
          {isOpen ? '▲' : '▼'}
        </span>
      </button>

      {isOpen && (
        <ul className="space-y-0.5 bg-accent-500/[0.03] dark:bg-accent-500/[0.04]">
          {node.children.map((child) => (
            <TreeNodeRow
              key={child.type === 'file' ? child.id : child.relativePath}
              node={child}
              depth={depth + 1}
              activeId={activeId}
              expanded={expanded}
              onToggle={onToggle}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
