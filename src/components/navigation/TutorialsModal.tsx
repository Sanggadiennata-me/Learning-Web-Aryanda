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

export const TUTORIAL_TRACKS: TutorialTrack[] = [
  {
    id: 'html',
    name: 'HTML',
    category: 'Web',
    description: 'Pondasi struktur halaman web dan markup modern',
    iconBg: '#C47A5A18',
    iconColor: '#C47A5A',
    icon: FileCode,
    path: '/docs/pemrograman/html/block-formatting-text',
  },
  {
    id: 'css',
    name: 'CSS',
    category: 'Styling',
    description: 'Style, responsive layout, Flexbox, dan Box Model',
    iconBg: '#6E9CB818',
    iconColor: '#6E9CB8',
    icon: Layers,
    path: '/docs/pemrograman/css/native/01_css-native',
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    category: 'Programming',
    description: 'Logika interaktif, DOM manipulation, dan asynchronous',
    iconBg: '#C49A5A18',
    iconColor: '#C49A5A',
    icon: Code2,
    path: '/docs/pemrograman/javascript/framework/react/react-lanjutan/react-lanjutan',
  },
  {
    id: 'python',
    name: 'Python',
    category: 'Programming',
    description: 'Bahasa populer untuk automasi, data, backend & AI',
    iconBg: '#6F9B7818',
    iconColor: '#6F9B78',
    icon: Terminal,
    path: '/docs/pemrograman/python/python-advanced/02_python-advanced',
  },
  {
    id: 'php',
    name: 'PHP',
    category: 'Backend',
    description: 'Server-side scripting, Laravel framework & web backend',
    iconBg: '#B86B6818',
    iconColor: '#B86B68',
    icon: Server,
    path: '/docs/pemrograman/php/framework/laravel/filament/filament',
  },
  {
    id: 'fundamental',
    name: 'Fundamental Coding',
    category: 'Dasar IT',
    description: 'Algoritma, gerbang logika & computational thinking',
    iconBg: '#8A938A18',
    iconColor: '#8A938A',
    icon: Cpu,
    path: '/docs/pemrograman/fundamental/fundamental-pemrograman',
  },
  {
    id: 'cryptography',
    name: 'Kriptografi & Security',
    category: 'CyberSec',
    description: 'Enkripsi klasik, modern ciphers, hashing & CTF',
    iconBg: '#B86B6818',
    iconColor: '#B86B68',
    icon: Lock,
    path: '/docs/cybersecurity/cryptography/pengenalan/1.-pengenalan',
  },
  {
    id: 'forensics',
    name: 'Forensik & PCAP',
    category: 'CyberSec',
    description: 'Packet analysis Wireshark, file metadata & memory forensics',
    iconBg: '#6E9CB818',
    iconColor: '#6E9CB8',
    icon: Shield,
    path: '/docs/cybersecurity/forensic/network-forensic/pengenalan-network-forensic',
  },
  {
    id: 'websec',
    name: 'Web Exploitation',
    category: 'CyberSec',
    description: 'SQLi, XSS, SSRF, JWT vulnerabilities & pentesting',
    iconBg: '#B86B6818',
    iconColor: '#B86B68',
    icon: Shield,
    path: '/docs/cybersecurity/web-exploitation/1.-pengenalan-web-exploitation/1.-pengenalan-web-exploitation',
  },
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
  {
    id: 'jaringan',
    name: 'Jaringan Komputer',
    category: 'Networking',
    description: 'Model OSI, arsitektur TCP/IP, IP addressing & subnetting',
    iconBg: '#6E9CB818',
    iconColor: '#6E9CB8',
    icon: Globe,
    path: '/docs/jaringan/jaringan/jaringan-basic/1.-fundamental-jaringan',
  },
];

interface TutorialsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * W3Schools Signature "Tutorials" Mega-Menu Modal (Screenshot 1):
 * - Popup modal berukuran besar dengan search filter di kanan atas.
 * - Grid 4 kolom berisi kartu topik dengan icon warna-warni, judul bold, dan deskripsi.
 */
export function TutorialsModal({ isOpen, onClose }: TutorialsModalProps) {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const filteredTracks = TUTORIAL_TRACKS.filter((t) =>
    t.name.toLowerCase().includes(query.toLowerCase()) ||
    t.description.toLowerCase().includes(query.toLowerCase()) ||
    t.category.toLowerCase().includes(query.toLowerCase())
  );

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

      {/* Modal Dialog Content (W3Schools Style) */}
      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border border-slate-700 bg-white shadow-2xl overflow-hidden dark:bg-slate-900 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Pilih Tutorial &amp; Materi Pembelajaran
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pilih bidang pemrograman, keamanan siber, atau cloud untuk langsung membuka kurikulumnya.
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
              placeholder="Filter tutorial… (misal: Python, HTML, Docker, Kripto)"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:border-accent-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              autoFocus
            />
          </div>
        </div>

        {/* Grid 4 Kolom ala W3Schools */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {filteredTracks.map((track) => (
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
                  <h3 className="mt-3 text-sm font-bold text-slate-900 group-hover:text-accent-600 transition-colors dark:text-slate-100 dark:group-hover:text-accent-400">
                    {track.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {track.description}
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-semibold text-accent-600 dark:text-accent-400">
                  <span>Buka Tutorial</span>
                  <span>❯</span>
                </div>
              </Link>
            ))}
          </div>

          {filteredTracks.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-400">
              Tidak ada tutorial yang cocok dengan &ldquo;{query}&rdquo;.
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950/80 flex items-center justify-between">
          <span>Semua materi disinkronkan langsung dari Obsidian Vault</span>
          <Link
            to="/docs"
            onClick={onClose}
            className="font-bold text-accent-600 hover:underline dark:text-accent-400"
          >
            Lihat Katalog Semua Materi ❯
          </Link>
        </div>
      </div>
    </div>
  );
}
