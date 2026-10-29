import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Code2,
  FileCode,
  Globe,
  Layers,
  Lock,
  Search,
  Server,
  Shield,
  Terminal,
  X,
  Database,
  Cpu,
  BookOpen,
} from 'lucide-react';

export interface TutorialTrack {
  id: string;
  name: string;
  category: string;
  description: string;
  iconBg: string;
  iconColor: string;
  icon: typeof Code2;
  path: string;
}

export interface SkillGroup {
  id: string;
  name: string;
  description: string;
  color: string;
  tracks: TutorialTrack[];
}

export const TUTORIAL_GROUPS: SkillGroup[] = [
  {
    id: 'programming',
    name: 'Pemrograman & Web Development',
    description: 'Pondasi HTML/CSS, JavaScript modern, backend Python, PHP & Laravel',
    color: '#C49A5A',
    tracks: [
      {
        id: 'html',
        name: 'HTML',
        category: 'Web Markup',
        description: 'Pondasi struktur halaman web dan semantic markup modern',
        iconBg: '#C47A5A18',
        iconColor: '#C47A5A',
        icon: FileCode,
        path: '/docs/pemrograman/html/block-formatting-text',
      },
      {
        id: 'css',
        name: 'CSS',
        category: 'Web Styling',
        description: 'Style layout responsive, Flexbox, Grid, dan Box Model',
        iconBg: '#6E9CB818',
        iconColor: '#6E9CB8',
        icon: Layers,
        path: '/docs/pemrograman/css/native/01_css-native',
      },
      {
        id: 'javascript',
        name: 'JavaScript',
        category: 'Programming',
        description: 'Logika interaktif, DOM manipulation, asynchronous & React',
        iconBg: '#C49A5A18',
        iconColor: '#C49A5A',
        icon: Code2,
        path: '/docs/pemrograman/javascript/framework/react/react-lanjutan/react-lanjutan',
      },
      {
        id: 'python',
        name: 'Python',
        category: 'Programming',
        description: 'Bahasa populer untuk automasi scripting, data, backend & AI',
        iconBg: '#6F9B7818',
        iconColor: '#6F9B78',
        icon: Terminal,
        path: '/docs/pemrograman/python/python-advanced/02_python-advanced',
      },
      {
        id: 'php',
        name: 'PHP',
        category: 'Backend',
        description: 'Server-side scripting, OOP, REST API & Laravel framework',
        iconBg: '#B86B6818',
        iconColor: '#B86B68',
        icon: Server,
        path: '/docs/pemrograman/php/framework/laravel/filament/filament',
      },
      {
        id: 'fundamental',
        name: 'Fundamental Coding',
        category: 'Dasar IT',
        description: 'Logika pemrograman, tipe data, algoritma & problem solving',
        iconBg: '#8A938A18',
        iconColor: '#8A938A',
        icon: Cpu,
        path: '/docs/pemrograman/fundamental/fundamental-pemrograman',
      },
    ],
  },
  {
    id: 'cybersecurity',
    name: 'Keamanan Siber (Cyber Security)',
    description: 'Kriptografi, analisis forensik paket & investigasi web exploitation',
    color: '#B86B68',
    tracks: [
      {
        id: 'cryptography',
        name: 'Kriptografi & Security',
        category: 'CyberSec',
        description: 'Enkripsi klasik & modern (AES, RSA, ECC), hashing & CTF',
        iconBg: '#B86B6818',
        iconColor: '#B86B68',
        icon: Lock,
        path: '/docs/cybersecurity/cryptography/pengenalan/1.-pengenalan',
      },
      {
        id: 'forensics',
        name: 'Forensik Digital & PCAP',
        category: 'CyberSec',
        description: 'Packet dissector Wireshark, file metadata & memory triage',
        iconBg: '#6E9CB818',
        iconColor: '#6E9CB8',
        icon: Shield,
        path: '/docs/cybersecurity/forensic/network-forensic/pengenalan-network-forensic',
      },
      {
        id: 'websec',
        name: 'Web Exploitation & CTF',
        category: 'CyberSec',
        description: 'SQLi, XSS, SSRF, JWT vulnerabilities & security audit',
        iconBg: '#B86B6818',
        iconColor: '#B86B68',
        icon: Shield,
        path: '/docs/cybersecurity/web-exploitation/1.-pengenalan-web-exploitation/1.-pengenalan-web-exploitation',
      },
    ],
  },
  {
    id: 'devops',
    name: 'DevOps & Cloud Computing',
    description: 'Containerization dengan Docker, infrastruktur AWS Cloud & CI/CD',
    color: '#6F9B78',
    tracks: [
      {
        id: 'docker',
        name: 'Docker & Container',
        category: 'DevOps',
        description: 'Containerization, Dockerfile, multi-container compose',
        iconBg: '#6F9B7818',
        iconColor: '#6F9B78',
        icon: Server,
        path: '/docs/devops/docker/docker-basic/pengenalan-docker',
      },
      {
        id: 'aws',
        name: 'AWS Cloud',
        category: 'DevOps',
        description: 'Komputasi cloud EC2, VPC, S3, dan edge infrastructure',
        iconBg: '#6F9B7818',
        iconColor: '#6F9B78',
        icon: Server,
        path: '/docs/devops/cloud/cloud-dasar/1.-cloud-dasar',
      },
    ],
  },
  {
    id: 'networking',
    name: 'Jaringan Komputer (Networking)',
    description: 'Model OSI, arsitektur protokol TCP/IP, subnetting IP & routing',
    color: '#6E9CB8',
    tracks: [
      {
        id: 'jaringan',
        name: 'Jaringan Komputer',
        category: 'Networking',
        description: 'Model OSI, TCP/UDP, IP addressing CIDR & analisis paket',
        iconBg: '#6E9CB818',
        iconColor: '#6E9CB8',
        icon: Globe,
        path: '/docs/jaringan/jaringan/jaringan-basic/1.-fundamental-jaringan',
      },
    ],
  },
];

// Flat helper list untuk referensi cepat
export const TUTORIAL_TRACKS: TutorialTrack[] = TUTORIAL_GROUPS.flatMap((g) => g.tracks);

interface TutorialsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Tutorials Mega-Menu Modal:
 * - Dikelompokkan per Bidang/Skill (Pemrograman, CyberSec, DevOps, Jaringan).
 * - Fitur search filter yang menyaring topik di seluruh kategori.
 * - Desain Material 3 bersih, rapi, dan responsif.
 */
export function TutorialsModal({ isOpen, onClose }: TutorialsModalProps) {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Kelompokkan dan filter per grup
  const filteredGroups = TUTORIAL_GROUPS.map((group) => {
    const matchingTracks = group.tracks.filter(
      (t) =>
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        group.name.toLowerCase().includes(q)
    );
    return {
      ...group,
      tracks: matchingTracks,
    };
  }).filter((group) => group.tracks.length > 0);

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
      <div className="relative z-10 w-full max-w-5xl max-h-[90vh] flex flex-col rounded-3xl border border-slate-700 bg-white shadow-2xl overflow-hidden dark:bg-slate-900 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Katalog Tutorial Pembelajaran
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pilih bidang keahlian di bawah untuk langsung membuka modul kurikulum catatan dan latihan.
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
            aria-label="Tutup jendela"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter Input Bar */}
        <div className="border-b border-slate-200 bg-white px-6 py-3.5 dark:border-slate-800 dark:bg-slate-900">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari materi tutorial… (misal: Python, React, Docker, Kripto, OSI)"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:border-accent-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              autoFocus
            />
          </div>
        </div>

        {/* Content Area: Dikelompokkan per Skill */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin space-y-8">
          {filteredGroups.map((group) => (
            <section key={group.id} className="space-y-3.5">
              {/* Header Grup Skill */}
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
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  — {group.description}
                </span>
                <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  {group.tracks.length} materi
                </span>
              </div>

              {/* Grid Kartu Topik */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3.5">
                {group.tracks.map((track) => (
                  <Link
                    key={track.id}
                    to={track.path}
                    onClick={onClose}
                    className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-accent-500 hover:shadow-lg hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-950/60 dark:hover:border-accent-500"
                  >
                    <div>
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-xl font-bold shadow-sm"
                        style={{ backgroundColor: track.iconBg, color: track.iconColor }}
                      >
                        <track.icon className="h-6 w-6" />
                      </div>
                      <h4 className="mt-3 text-sm font-bold text-slate-900 group-hover:text-accent-600 transition-colors dark:text-slate-100 dark:group-hover:text-accent-400">
                        {track.name}
                      </h4>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {track.description}
                      </p>
                    </div>
                    <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-semibold text-accent-600 dark:text-accent-400">
                      <span>Buka Kurikulum</span>
                      <span className="group-hover:translate-x-0.5 transition-transform">❯</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}

          {filteredGroups.length === 0 && (
            <div className="py-16 text-center text-sm text-slate-400">
              Tidak ada tutorial yang cocok dengan &ldquo;{query}&rdquo;.
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950/80 flex items-center justify-between">
          <span>{totalResults} modul tutorial siap dipelajari dari Obsidian Vault</span>
          <Link
            to="/editor"
            onClick={onClose}
            className="font-bold text-accent-600 hover:underline dark:text-accent-400"
          >
            Buka Tryit Editor Interaktif ❯
          </Link>
        </div>
      </div>
    </div>
  );
}
