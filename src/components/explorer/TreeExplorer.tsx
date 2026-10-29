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
  /** Sidebar: kompak, bisa collapse. Page: mode eksplorasi penuh. */
  variant?: 'sidebar' | 'page';
  className?: string;
  /** Dipanggil saat file diklik (mis. menutup drawer mobile). */
  onNavigate?: () => void;
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
 * Sidebar dokumentasi recursive (W3Schools & Material Design).
 * Mendukung filter instan per bab, auto-expand, dan indikator aktif yang tajam.
 */
export function TreeExplorer({
  nodes,
  activeId,
  filterQuery = '',
  variant = 'sidebar',
  className,
  onNavigate,
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
    <nav className={cn('select-none', className)} aria-label="Navigasi dokumen">
      {displayNodes.length === 0 && (
        <div className="py-6 px-3 text-center text-xs text-slate-500">
          Tidak ada materi yang sesuai &ldquo;{filterQuery}&rdquo;.
        </div>
      )}
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
    const padding = variant === 'sidebar' ? 10 + depth * 14 : 10 + depth * 18;
    const codeLang = node.isCode ? languageInfo(node.language ?? 'plaintext') : null;

    return (
      <li>
        <Link
          to={`/docs/${node.id}`}
          onClick={onNavigate}
          className={cn(
            'group relative flex items-center gap-2 rounded-xl py-1.5 pr-2.5 text-xs transition-all duration-150',
            node.isCode && 'font-mono',
            active
              ? 'bg-accent-500/15 text-accent-400 font-semibold ring-1 ring-accent-500/30'
              : node.isRoadmap
                ? 'font-medium text-slate-200 hover:bg-slate-800/80 hover:text-white light:text-slate-700 light:hover:bg-slate-100'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 light:text-slate-600 light:hover:bg-slate-100'
          )}
          style={{ paddingLeft: padding }}
          title={node.isCode ? `${node.title} · ${codeLang?.label}` : node.title}
        >
          {/* Active Accent Bar on Left (W3Schools / Material marker) */}
          {active && (
            <span className="absolute left-1 top-1.5 bottom-1.5 w-1 rounded-full bg-accent-500" />
          )}

          {node.isRoadmap ? (
            <Map className="h-3.5 w-3.5 shrink-0 text-accent-400" />
          ) : node.isCode ? (
            <Code2 className="h-3.5 w-3.5 shrink-0" style={{ color: codeLang?.color }} />
          ) : (
            <FileText className="h-3.5 w-3.5 shrink-0 opacity-60 group-hover:opacity-100" />
          )}

          <span className="truncate">{node.title}</span>

          {node.isRoadmap && (
            <span className="ml-auto shrink-0 rounded-full bg-accent-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-accent-400">
              map
            </span>
          )}
        </Link>
      </li>
    );
  }

  const isOpen = expanded.has(node.relativePath);
  const count = countFiles([node]);
  const padding = variant === 'sidebar' ? 8 + depth * 14 : 8 + depth * 18;

  return (
    <li>
      <button
        onClick={() => onToggle(node.relativePath)}
        className="flex w-full items-center gap-2 rounded-xl py-1.5 pr-2 text-left text-xs text-slate-300 font-medium transition-colors hover:bg-slate-800/70 hover:text-slate-100 light:text-slate-700 light:hover:bg-slate-100"
        style={{ paddingLeft: padding }}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        )}
        <Folder className="h-3.5 w-3.5 shrink-0 text-amber-400/80" />
        <span className="truncate font-semibold tracking-tight">{node.name}</span>

        {node.isCodeFolder ? (
          <span className="ml-auto flex shrink-0 items-center gap-1 rounded-full bg-slate-800/60 px-1.5 py-0.5 text-[9px] text-accent-400 font-mono">
            <Code2 className="h-2.5 w-2.5" />
            <span>{count}</span>
          </span>
        ) : (
          <span className="ml-auto rounded-full bg-slate-800/50 light:bg-slate-200 px-1.5 py-0.5 text-[9px] tabular-nums text-slate-400 light:text-slate-600">
            {count}
          </span>
        )}
      </button>

      {isOpen && (
        <ul className="space-y-0.5 border-l border-slate-800/60 ml-3.5 pl-1 my-0.5 light:border-slate-200">
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