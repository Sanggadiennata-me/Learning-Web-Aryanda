import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Binary,
  BookOpen,
  Box,
  ChevronRight,
  Cloud,
  Code2,
  Cpu,
  FileCode,
  GitBranch,
  Globe,
  HardDrive,
  Layers,
  Layout,
  Lock,
  Search,
  Server,
  Shield,
  Sparkles,
  Terminal,
  X,
  Zap,
} from 'lucide-react';
import { useSiteData } from '../../app/SiteProvider';
import type { TreeFolderNode } from '../../domain/types';
import { getDefaultSubskillDocId } from '../../services/docs';

export interface TutorialTrack {
  id: string;
  name: string;
  category: string;
  iconBg: string;
  iconColor: string;
  icon: typeof Code2;
  path: string;
}

export interface SkillGroup {
  id: string;
  name: string;
  color: string;
  tracks: TutorialTrack[];
}

interface SkillMeta {
  order: number;
  displayName: string;
  color: string;
}

const SKILL_METAS: Record<string, SkillMeta> = {
  pemrograman: {
    order: 1,
    displayName: 'Pemrograman & Web Development',
    color: '#C49A5A',
  },
  cybersecurity: {
    order: 2,
    displayName: 'Keamanan Siber (Cyber Security)',
    color: '#B86B68',
  },
  devops: {
    order: 3,
    displayName: 'DevOps & Cloud Computing',
    color: '#6F9B78',
  },
  jaringan: {
    order: 4,
    displayName: 'Jaringan Komputer (Networking)',
    color: '#6E9CB8',
  },
};

interface SubskillMeta {
  displayName: string;
  icon: typeof Code2;
  iconBg: string;
  iconColor: string;
}

const SUBSKILL_METAS: Record<string, SubskillMeta> = {
  // Pemrograman
  html: { displayName: 'HTML', icon: FileCode, iconBg: '#C47A5A18', iconColor: '#C47A5A' },
  css: { displayName: 'CSS', icon: Layers, iconBg: '#6E9CB818', iconColor: '#6E9CB8' },
  javascript: { displayName: 'JavaScript', icon: Code2, iconBg: '#C49A5A18', iconColor: '#C49A5A' },
  python: { displayName: 'Python', icon: Terminal, iconBg: '#6F9B7818', iconColor: '#6F9B78' },
  php: { displayName: 'PHP & Laravel', icon: Server, iconBg: '#B86B6818', iconColor: '#B86B68' },
  fundamental: { displayName: 'Fundamental Coding', icon: Cpu, iconBg: '#8A938A18', iconColor: '#8A938A' },
  'rancangan software': { displayName: 'Rancangan Software', icon: Layout, iconBg: '#C49A5A18', iconColor: '#C49A5A' },
  'vibe coding': { displayName: 'Vibe Coding', icon: Zap, iconBg: '#E07A5F18', iconColor: '#E07A5F' },

  // CyberSecurity
  cryptography: { displayName: 'Kriptografi', icon: Lock, iconBg: '#B86B6818', iconColor: '#B86B68' },
  forensic: { displayName: 'Forensik Digital', icon: Search, iconBg: '#6E9CB818', iconColor: '#6E9CB8' },
  pwn: { displayName: 'PWN (Binary Exploit)', icon: Binary, iconBg: '#B86B6818', iconColor: '#B86B68' },
  'web exploitation': { displayName: 'Web Exploitation', icon: Shield, iconBg: '#B86B6818', iconColor: '#B86B68' },

  // DevOps
  cloud: { displayName: 'Cloud Computing', icon: Cloud, iconBg: '#6F9B7818', iconColor: '#6F9B78' },
  docker: { displayName: 'Docker & Container', icon: Box, iconBg: '#6F9B7818', iconColor: '#6F9B78' },
  github: { displayName: 'Git & GitHub', icon: GitBranch, iconBg: '#6F9B7818', iconColor: '#6F9B78' },

  // Jaringan
  hardware: { displayName: 'Hardware Jaringan', icon: HardDrive, iconBg: '#6E9CB818', iconColor: '#6E9CB8' },
  jaringan: { displayName: 'Jaringan Komputer', icon: Globe, iconBg: '#6E9CB818', iconColor: '#6E9CB8' },
};

interface TutorialsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Tutorials Mega-Menu Modal:
 * - Menampilkan seluruh #subskill dari Obsidian Vault secara dinamis.
 * - Desain ultra-clean: tanpa kalimat penjelasan panjang yang memenuhi visual.
 * - Format kartu compact yang interaktif, mudah di-scan dalam 1 detik.
 */
export function TutorialsModal({ isOpen, onClose }: TutorialsModalProps) {
  const { tree } = useSiteData();
  const [query, setQuery] = useState('');

  // Buat grup skill dan subskill dinamis dari tree vault
  const groups: SkillGroup[] = useMemo(() => {
    if (!tree || tree.length === 0) return [];

    const result: SkillGroup[] = [];

    for (const cat of tree) {
      // Abaikan folder terms atau glossary
      if (cat.name.toLowerCase().includes('terms and foreign words')) continue;

      const catKey = cat.name.toLowerCase();
      const meta = SKILL_METAS[catKey] || {
        order: 99,
        displayName: cat.name,
        color: '#6F9B78',
      };

      const tracks: TutorialTrack[] = [];

      for (const child of cat.children || []) {
        if (child.type === 'folder') {
          const rawSubName = child.name;
          const subKey = rawSubName.toLowerCase();
          const subMeta = SUBSKILL_METAS[subKey] || {
            displayName: rawSubName,
            icon: BookOpen,
            iconBg: `${meta.color}18`,
            iconColor: meta.color,
          };

          const bestId = getDefaultSubskillDocId(child);

          tracks.push({
            id: `${catKey}-${subKey}`,
            name: subMeta.displayName,
            category: meta.displayName,
            iconBg: subMeta.iconBg,
            iconColor: subMeta.iconColor,
            icon: subMeta.icon,
            path: `/docs/${bestId}`,
          });
        }
      }

      if (tracks.length > 0) {
        result.push({
          id: catKey,
          name: meta.displayName,
          color: meta.color,
          tracks,
        });
      }
    }

    // Urutkan grup sesuai urutan hierarki kurikulum
    result.sort((a, b) => {
      const orderA = SKILL_METAS[a.id]?.order ?? 99;
      const orderB = SKILL_METAS[b.id]?.order ?? 99;
      return orderA - orderB;
    });

    return result;
  }, [tree]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Filter subskill berdasarkan input pencarian
  const filteredGroups = groups
    .map((group) => {
      const matchingTracks = group.tracks.filter(
        (t) =>
          !q ||
          t.name.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          group.name.toLowerCase().includes(q)
      );
      return {
        ...group,
        tracks: matchingTracks,
      };
    })
    .filter((group) => group.tracks.length > 0);

  const totalResults = filteredGroups.reduce((acc, g) => acc + g.tracks.length, 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden
      />

      {/* Modal Dialog Content */}
      <div className="relative z-10 w-full max-w-5xl max-h-[88vh] flex flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden dark:bg-slate-900 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header: Clean & Ringkas */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-500/10 text-accent-600 dark:text-accent-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
              Katalog Tutorial
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
            aria-label="Tutup jendela"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Filter Input Bar */}
        <div className="border-b border-slate-200 bg-white px-6 py-3 dark:border-slate-800 dark:bg-slate-900">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari subskill tutorial… (misal: Python, React, PWN, Docker, Git)"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-9 py-2 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:border-accent-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Content Area: Dikelompokkan per Bidang Skill */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 scrollbar-thin space-y-6">
          {filteredGroups.map((group) => (
            <section key={group.id} className="space-y-3">
              {/* Header Grup Skill: Bersih tanpa teks deskripsi panjang */}
              <div className="flex items-center gap-2.5 border-b border-slate-200/80 pb-2 dark:border-slate-800">
                <span
                  className="h-3.5 w-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: group.color }}
                />
                <h3
                  className="text-xs sm:text-sm font-extrabold uppercase tracking-wider"
                  style={{ color: group.color }}
                >
                  {group.name}
                </h3>
                <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  {group.tracks.length} Subskill
                </span>
              </div>

              {/* Grid Kartu Subskill Compact & Bersih */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5">
                {group.tracks.map((track) => (
                  <Link
                    key={track.id}
                    to={track.path}
                    onClick={onClose}
                    className="group flex items-center justify-between rounded-xl border border-slate-200/90 bg-white p-3 transition-all hover:border-accent-500 hover:bg-slate-50/80 hover:shadow-sm dark:border-slate-800/80 dark:bg-slate-950/60 dark:hover:border-accent-500 dark:hover:bg-slate-900/80"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-bold transition-transform group-hover:scale-105"
                        style={{ backgroundColor: track.iconBg, color: track.iconColor }}
                      >
                        <track.icon className="h-4.5 w-4.5" />
                      </div>
                      <span className="truncate text-xs sm:text-[13px] font-bold text-slate-800 transition-colors group-hover:text-accent-600 dark:text-slate-200 dark:group-hover:text-accent-400">
                        {track.name}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-accent-500 dark:text-slate-600" />
                  </Link>
                ))}
              </div>
            </section>
          ))}

          {filteredGroups.length === 0 && (
            <div className="py-16 text-center text-sm text-slate-400">
              Tidak ada subskill yang cocok dengan &ldquo;{query}&rdquo;.
            </div>
          )}
        </div>

        {/* Footer Ringkas */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950/80 flex items-center justify-between">
          <span className="font-medium text-slate-600 dark:text-slate-400">
            {totalResults} Subskill Tersedia
          </span>
          <Link
            to="/editor"
            onClick={onClose}
            className="font-bold text-accent-600 hover:underline dark:text-accent-400"
          >
            Code Editor ❯
          </Link>
        </div>
      </div>
    </div>
  );
}
