import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Code2,
  FileCode,
  FileText,
  Globe,
  Layers,
  Lock,
  Play,
  Search,
  Server,
  Shield,
  Sparkles,
  Terminal,
  UserRound,
  ExternalLink,
} from 'lucide-react';
import { useSiteData } from '../app/SiteProvider';
import { joinWithRoot } from '../lib/base';
import { Spinner } from '../components/ui/spinner';
import { cn } from '../lib/utils';

// Contoh snippet interaktif untuk "Try it Yourself" di Hero
const HERO_SNIPPETS: Record<string, { label: string; code: string; defaultOutput: string }> = {
  javascript: {
    label: 'JavaScript',
    code: `// Coba eksekusi kode JavaScript langsung di browser!
const skills = ['Python', 'Docker', 'Web Security', 'Networking'];

function sapa(nama) {
  return \`Halo, selamat datang \${nama} di CodeLearn!\`;
}

console.log(sapa("Aryanda"));
console.log("Topik siap dipelajari:", skills.join(" · "));
`,
    defaultOutput: `Halo, selamat datang Aryanda di CodeLearn!
Topik siap dipelajari: Python · Docker · Web Security · Networking`,
  },
  python: {
    label: 'Python',
    code: `# Algoritma Enkripsi Caesar Cipher Sederhana
def caesar(teks, shift=3):
    hasil = ""
    for c in teks:
        if c.isalpha():
            base = ord('A') if c.isupper() else ord('a')
            hasil += chr((ord(c) - base + shift) % 26 + base)
        else:
            hasil += c
    return hasil

plain = "CodeLearn 2026"
cipher = caesar(plain, 3)
print(f"Plaintext : {plain}")
print(f"Ciphertext: {cipher}")
`,
    defaultOutput: `Plaintext : CodeLearn 2026
Ciphertext: FrghOhduq 2026`,
  },
  php: {
    label: 'PHP',
    code: `<?php
// PHP WebAssembly berjalan 100% di browser
$modul = [
    "Fundamental" => "Tipe Data & Percabangan",
    "CyberSec"    => "Kriptografi & Forensic",
    "DevOps"      => "Docker & AWS Cloud"
];

echo "Daftar Modul Belajar:\n";
foreach ($modul as $kategori => $materi) {
    echo "- [$kategori]: $materi\n";
}
`,
    defaultOutput: `Daftar Modul Belajar:
- [Fundamental]: Tipe Data & Percabangan
- [CyberSec]: Kriptografi & Forensic
- [DevOps]: Docker & AWS Cloud`,
  },
  html: {
    label: 'HTML/CSS',
    code: `<!-- Preview HTML interaktif -->
<div style="font-family: sans-serif; padding: 1.5rem; text-align: center;">
  <h2 style="color: #16a34a; margin: 0 0 0.5rem 0;">🎉 Halo dari Browser!</h2>
  <p style="color: #64748b; font-size: 14px;">HTML, CSS dan JavaScript dirender tanpa backend server.</p>
  <button style="background: #16a34a; color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; font-weight: bold; cursor: pointer;">
    Coba Sendiri »
  </button>
</div>
`,
    defaultOutput: `[Pratinjau HTML terender langsung di iframe sandbox]`,
  },
};

export default function HomePage() {
  const { tree, metadata, loading, error } = useSiteData();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // State untuk interactive Try-it-yourself widget di Hero
  const [activeSnippetLang, setActiveSnippetLang] = useState<keyof typeof HERO_SNIPPETS>('javascript');
  const [snippetCode, setSnippetCode] = useState(HERO_SNIPPETS.javascript.code);
  const [snippetOutput, setSnippetOutput] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleSelectLang = (langKey: keyof typeof HERO_SNIPPETS) => {
    setActiveSnippetLang(langKey);
    setSnippetCode(HERO_SNIPPETS[langKey].code);
    setSnippetOutput(null);
  };

  const handleRunHeroSnippet = () => {
    setIsExecuting(true);
    setSnippetOutput(null);

    if (activeSnippetLang === 'javascript') {
      setTimeout(() => {
        try {
          const logs: string[] = [];
          const customConsole = {
            log: (...args: unknown[]) =>
              logs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')),
          };
          const fn = new Function('console', snippetCode);
          fn(customConsole);
          setSnippetOutput(logs.join('\n') || '(Selesai tanpa output)');
        } catch (err) {
          setSnippetOutput(`Error: ${(err as Error).message}`);
        }
        setIsExecuting(false);
      }, 250);
    } else {
      setTimeout(() => {
        setSnippetOutput(HERO_SNIPPETS[activeSnippetLang].defaultOutput);
        setIsExecuting(false);
      }, 400);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error || !tree) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-100">Data belum tersedia</h1>
        <p className="mt-3 text-sm text-slate-400">
          {error ?? 'tree.json tidak ditemukan.'} Jalankan parser terlebih dahulu:
        </p>
        <pre className="mt-4 rounded-xl border border-slate-800 bg-slate-900 p-4 text-xs text-slate-300">
          npm run parse -- --vault=/path/ke/Obsidian-Vault
        </pre>
      </div>
    );
  }

  return (
    <div className="space-y-12 sm:space-y-16 py-4 sm:py-6">
      {/* ============================================================
          1. HERO SECTION (W3Schools Welcome & Interactive Try-It)
          ============================================================ */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-6 sm:p-10 lg:p-12 light:border-slate-200 light:from-slate-50 light:to-white shadow-md">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
          {/* Kolom Kiri: Headline, Search & Action */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent-500/30 bg-accent-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-accent-400 light:bg-accent-100 light:text-accent-700">
              <Sparkles className="h-3.5 w-3.5" />
              Platform Belajar IT Mandiri
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-50 sm:text-5xl lg:text-5xl light:text-slate-900 leading-[1.15]">
              BELAJAR <span className="text-accent-500">STEP BY STEP</span>
            </h1>

            {/* W3Schools Signature Search Box */}
            <form onSubmit={handleSearchSubmit} className="relative max-w-lg">
              <div className="flex items-center rounded-2xl border border-slate-700 bg-slate-900/90 p-1.5 shadow-inner focus-within:border-accent-500 focus-within:ring-2 focus-within:ring-accent-500/30 light:border-slate-300 light:bg-white">
                <Search className="ml-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Mau belajar apa? misal: Python, Docker, SQLi..."
                  className="w-full bg-transparent px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none light:text-slate-900"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-accent-600 px-4 py-2 text-xs font-bold text-white shadow transition-all hover:bg-accent-700 active:scale-95 shrink-0"
                >
                  Cari Materi ❯
                </button>
              </div>

              {/* Quick suggestion tags */}
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-400 light:text-slate-600">
                <span className="text-[11px] font-semibold text-slate-500">Populer:</span>
                {[
                  { label: 'Python', path: '/docs/pemrograman/python/python-advanced/02_python-advanced' },
                  { label: 'JavaScript', path: '/docs/pemrograman/javascript/framework/react/react-lanjutan/react-lanjutan' },
                  { label: 'Docker', path: '/docs/devops/docker/docker-basic/pengenalan-docker' },
                  { label: 'Kriptografi', path: '/docs/cybersecurity/cryptography/pengenalan/1.-pengenalan' },
                  { label: 'CySec Tools', path: '/cysec-tools' },
                ].map((sug) => (
                  <Link
                    key={sug.label}
                    to={sug.path}
                    className="rounded-lg bg-slate-800/80 px-2 py-0.5 text-[11px] font-medium text-slate-300 transition-colors hover:bg-accent-500/20 hover:text-accent-300 light:bg-slate-200 light:text-slate-700"
                  >
                    {sug.label}
                  </Link>
                ))}
              </div>
            </form>

            {/* Quick Action CTA Buttons */}
            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                to="/docs"
                className="inline-flex items-center gap-2 rounded-xl bg-accent-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition-all hover:bg-accent-700 hover:shadow-md active:scale-95"
              >
                <BookOpen className="h-4 w-4" />
                Mulai Belajar ❯
              </Link>
              <Link
                to="/editor"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-200 transition-all hover:border-accent-500 hover:bg-slate-800 hover:text-white light:border-slate-300 light:bg-white light:text-slate-700 active:scale-95"
              >
                <Code2 className="h-4 w-4 text-accent-500" />
                Code Editor
              </Link>
              <Link
                to="/cysec-tools"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-200 transition-all hover:border-accent-500 hover:bg-slate-800 hover:text-white light:border-slate-300 light:bg-white light:text-slate-700 active:scale-95"
              >
                <Shield className="h-4 w-4 text-accent-500" />
                CySec Tools
              </Link>
            </div>
          </div>

          {/* Kolom Kanan: W3Schools Interactive "Try It Yourself" Sandbox */}
          <div className="lg:col-span-6">
            <div className="w3-try-box relative rounded-2xl border border-slate-700 bg-slate-900/95 shadow-xl light:border-slate-300 light:bg-white overflow-hidden">
              {/* Header Tab Bahasa */}
              <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 py-2.5 light:border-slate-200 light:bg-slate-100">
                <div className="flex items-center gap-1.5">
                  <Terminal className="h-4 w-4 text-accent-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200 light:text-slate-800">
                    Coba Langsung (Try It Yourself)
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {(Object.keys(HERO_SNIPPETS) as Array<keyof typeof HERO_SNIPPETS>).map((key) => (
                    <button
                      key={key}
                      onClick={() => handleSelectLang(key)}
                      className={cn(
                        'rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all',
                        activeSnippetLang === key
                          ? 'bg-accent-600 text-white shadow-sm'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 light:text-slate-600 light:hover:bg-slate-200'
                      )}
                    >
                      {HERO_SNIPPETS[key].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Code Area */}
              <div className="p-3 sm:p-4">
                <div className="relative rounded-xl border border-slate-800 bg-slate-950 p-3 light:border-slate-200 light:bg-slate-900 font-mono text-xs text-slate-200">
                  <textarea
                    value={snippetCode}
                    onChange={(e) => setSnippetCode(e.target.value)}
                    rows={7}
                    className="w-full resize-none bg-transparent font-mono text-xs leading-relaxed text-emerald-300 focus:outline-none scrollbar-thin"
                    spellCheck={false}
                  />
                </div>

                {/* Tombol Eksekusi & Link Full Editor */}
                <div className="mt-3 flex items-center justify-between gap-2">
                  <button
                    onClick={handleRunHeroSnippet}
                    disabled={isExecuting}
                    className="inline-flex items-center gap-2 rounded-xl bg-accent-600 px-4 py-2 text-xs font-bold text-white shadow transition-all hover:bg-accent-700 active:scale-95 disabled:opacity-50"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    {isExecuting ? 'Mengeksekusi…' : 'Jalankan Kode ❯'}
                  </button>

                  <Link
                    to={`/editor?lang=${activeSnippetLang}&code=${encodeURIComponent(snippetCode)}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-accent-500 hover:text-accent-400 hover:underline"
                  >
                    Buka di Full Editor ↗
                  </Link>
                </div>

                {/* Output Console Box */}
                {snippetOutput && (
                  <div className="mt-3 rounded-xl border border-slate-800 bg-black/60 p-3 light:border-slate-300 light:bg-slate-100">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Hasil Output:
                    </p>
                    <pre className="whitespace-pre-wrap font-mono text-xs text-slate-200 light:text-slate-800">
                      {snippetOutput}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          2. STATISTIK KONTEN (Material 3 Tonal Metric Row)
          ============================================================ */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
        {[
          {
            icon: FileText,
            value: metadata?.totalNotes ?? 618,
            label: 'Catatan Dokumentasi',
          },
          {
            icon: FileCode,
            value: metadata?.totalCodeFiles ?? 172,
            label: 'File Latihan Koding',
          },
          {
            icon: Shield,
            value: '108+',
            label: 'CySec & OSINT Tools',
          },
          {
            icon: Layers,
            value: metadata?.subskillCount ?? 13,
            label: 'Pohon Subskill',
          },
        ].map((item) => (
          <div
            key={item.label}
            className="m3-card m3-card-hover flex items-center gap-3.5 p-4"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-500/15 text-accent-500 light:bg-accent-100 light:text-accent-700">
              <item.icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <span className="text-xl sm:text-2xl font-black text-slate-50 light:text-slate-900 tabular-nums block leading-tight">
                {item.value}
              </span>
              <h3 className="text-xs font-semibold text-slate-400 light:text-slate-600 truncate mt-0.5">
                {item.label}
              </h3>
            </div>
          </div>
        ))}
      </section>

      {/* ============================================================
          3. W3SCHOOLS-STYLE TRACK CARDS (Modul Jalur Belajar Utama)
          ============================================================ */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-100 light:text-slate-900 flex items-center gap-2">
              <span className="h-6 w-1.5 rounded-full bg-accent-500" />
              Jalur Belajar Utama (Learning Tracks)
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 light:text-slate-600 mt-0.5">
              Pilih bidang keahlian yang ingin dipelajari, lengkap dengan teori dan latihan koding.
            </p>
          </div>
          <Link
            to="/docs"
            className="inline-flex items-center gap-1 text-xs font-bold text-accent-500 hover:text-accent-400 self-start sm:self-auto"
          >
            Lihat Semua Modul ❯
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Track 1: Pemrograman & Web Dev */}
          <div className="m3-card p-5 sm:p-6 flex flex-col justify-between border-l-4 border-l-emerald-500">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
                  <Code2 className="h-3.5 w-3.5" />
                  Pemrograman & Web
                </span>
                <span className="text-xs font-medium text-slate-500">400+ Catatan</span>
              </div>
              <h3 className="text-lg font-bold text-slate-100 light:text-slate-900">
                Python, JavaScript & Frameworks
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-400 light:text-slate-600">
                Kuasai logika pemrograman dari nol: tipe data, modularitas, OOP, hingga pembuatan aplikasi web modern.
              </p>
            </div>
            <div className="mt-5 flex items-center gap-3 pt-4 border-t border-slate-800/80 light:border-slate-200">
              <Link
                to="/docs/pemrograman/fundamental/fundamental-pemrograman"
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-95"
              >
                Mulai Belajar ❯
              </Link>
              <Link
                to="/editor?lang=javascript"
                className="text-xs font-semibold text-slate-400 hover:text-slate-200 light:text-slate-600 hover:underline"
              >
                Coba di Editor →
              </Link>
            </div>
          </div>

          {/* Track 2: Cyber Security & Kriptografi */}
          <div className="m3-card p-5 sm:p-6 flex flex-col justify-between border-l-4 border-l-indigo-500">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-400">
                  <Shield className="h-3.5 w-3.5" />
                  Keamanan Siber
                </span>
                <span className="text-xs font-medium text-slate-500">100+ Tools & Catatan</span>
              </div>
              <h3 className="text-lg font-bold text-slate-100 light:text-slate-900">
                Kriptografi, Forensik Digital & CTF
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-400 light:text-slate-600">
                Belajar analisis kriptografi, packet analysis (PCAP), investigasi berkas biner, dan web exploitation.
              </p>
            </div>
            <div className="mt-5 flex items-center gap-3 pt-4 border-t border-slate-800/80 light:border-slate-200">
              <Link
                to="/docs/cybersecurity/cryptography/pengenalan/1.-pengenalan"
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 active:scale-95"
              >
                Mulai Belajar ❯
              </Link>
              <Link
                to="/cysec-tools"
                className="text-xs font-semibold text-slate-400 hover:text-slate-200 light:text-slate-600 hover:underline"
              >
                Buka 108 Tools
              </Link>
            </div>
          </div>

          {/* Track 3: DevOps & Cloud Computing */}
          <div className="m3-card p-5 sm:p-6 flex flex-col justify-between border-l-4 border-l-cyan-500">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-400">
                  <Server className="h-3.5 w-3.5" />
                  DevOps & Cloud
                </span>
                <span className="text-xs font-medium text-slate-500">Panduan Praktis</span>
              </div>
              <h3 className="text-lg font-bold text-slate-100 light:text-slate-900">
                Docker, AWS Cloud & Containerization
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-400 light:text-slate-600">
                Pelajari konsep containerization dengan Docker, multi-container compose, dan arsitektur cloud AWS.
              </p>
            </div>
            <div className="mt-5 flex items-center gap-3 pt-4 border-t border-slate-800/80 light:border-slate-200">
              <Link
                to="/docs/devops/docker/docker-basic/pengenalan-docker"
                className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-cyan-700 active:scale-95"
              >
                Mulai Belajar ❯
              </Link>
              <Link
                to="/editor?lang=javascript"
                className="text-xs font-semibold text-slate-400 hover:text-slate-200 light:text-slate-600 hover:underline"
              >
                Coba di Editor →
              </Link>
            </div>
          </div>

          {/* Track 4: Jaringan Komputer */}
          <div className="m3-card p-5 sm:p-6 flex flex-col justify-between border-l-4 border-l-amber-500">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400">
                  <Globe className="h-3.5 w-3.5" />
                  Jaringan Komputer
                </span>
                <span className="text-xs font-medium text-slate-500">Fundamental</span>
              </div>
              <h3 className="text-lg font-bold text-slate-100 light:text-slate-900">
                Model OSI, TCP/IP & Analisis Paket
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-400 light:text-slate-600">
                Pahami cara internet bekerja: TCP/IP, IP addressing & subnetting, DNS, routing, dan analisis traffic.
              </p>
            </div>
            <div className="mt-5 flex items-center gap-3 pt-4 border-t border-slate-800/80 light:border-slate-200">
              <Link
                to="/docs/jaringan/jaringan/jaringan-basic/1.-fundamental-jaringan"
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-700 active:scale-95"
              >
                Mulai Belajar ❯
              </Link>
              <Link
                to="/cysec-tools/pcap"
                className="text-xs font-semibold text-slate-400 hover:text-slate-200 light:text-slate-600 hover:underline"
              >
                Buka PCAP Analyzer
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          4. INTERACTIVE TOOL SPOTLIGHT (108 Client-Side Utilities)
          ============================================================ */}
      <section className="m3-surface p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-500 uppercase tracking-wider">
              <Lock className="h-3.5 w-3.5" />
              100% Privacy & Client-Side
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-100 light:text-slate-900 mt-1">
              Cyber Security & OSINT Interactive Tools
            </h2>
          </div>
          <Link
            to="/cysec-tools"
            className="inline-flex items-center gap-1 text-xs font-bold text-accent-500 hover:text-accent-400 shrink-0 self-start sm:self-auto"
          >
            Buka Katalog 108 Tools ❯
          </Link>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              id: 'hash-generator',
              name: 'Hash Generator',
              category: 'Kriptografi',
              desc: 'MD5, SHA-1, SHA-256, SHA-3, ChaCha20',
              link: '/cysec-tools/hash-generator',
            },
            {
              id: 'pcap',
              name: 'PCAP & PCAPNG Dissector',
              category: 'Jaringan',
              desc: 'Disseksi paket jaringan Ethernet, IPv4, TCP, DNS',
              link: '/cysec-tools/pcap',
            },
            {
              id: 'jwt',
              name: 'JWT Token Inspector',
              category: 'Web Security',
              desc: 'Decode header, payload & verifikasi expired date',
              link: '/cysec-tools/jwt',
            },
            {
              id: 'google-dork-search',
              name: 'Google Dork Search Builder',
              category: 'OSINT',
              desc: 'Generator query dorking cerdas untuk intelijen',
              link: '/osint/google-dork-search',
            },
            {
              id: 'pe-viewer',
              name: 'ELF / PE Header Viewer',
              category: 'Reverse Eng',
              desc: 'Bedah struktur header file executable biner',
              link: '/cysec-tools/pe-viewer',
            },
            {
              id: 'subnet',
              name: 'Subnet & CIDR Calculator',
              category: 'Jaringan',
              desc: 'Hitung network, broadcast, wildcard & usable IP',
              link: '/cysec-tools/subnet',
            },
          ].map((tool) => (
            <Link
              key={tool.id}
              to={tool.link}
              className="group m3-card m3-card-hover p-4 flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent-500 light:text-accent-700">
                  {tool.category}
                </span>
                <h4 className="text-sm font-bold text-slate-100 group-hover:text-accent-400 transition-colors light:text-slate-900 mt-0.5">
                  {tool.name}
                </h4>
                <p className="text-xs text-slate-400 light:text-slate-600 mt-1">
                  {tool.desc}
                </p>
              </div>
              <div className="mt-3 flex items-center justify-end text-xs font-semibold text-slate-500 group-hover:text-accent-400">
                Gunakan Tool →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ============================================================
          5. TENTANG PENGEMBANG & EKOSISTEM
          ============================================================ */}
      <section className="space-y-4 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <UserRound className="h-4 w-4 text-accent-500" />
          Tentang Pengembang & Ekosistem
        </h3>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {/* 1. Nama Kampus: Politeknik Negeri Banjarmasin */}
          <a
            href="https://poliban.ac.id/"
            target="_blank"
            rel="noopener noreferrer"
            className="group m3-card m3-card-hover p-4 flex items-center gap-3.5"
          >
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-white p-1 ring-1 ring-slate-800 flex items-center justify-center">
              <img
                src={joinWithRoot('assets/asset/Logo%20Poliban.jpeg')}
                alt="Politeknik Negeri Banjarmasin"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-100 group-hover:text-accent-400 transition-colors truncate">
                Politeknik Negeri Banjarmasin
              </p>
              <p className="text-[11px] text-slate-500">Pendidikan Vokasi</p>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-slate-500 group-hover:text-accent-500 shrink-0" />
          </a>

          {/* 2. Nama Jurusan: Jurusan Administrasi Bisnis Poliban */}
          <a
            href="https://poliban.ac.id/"
            target="_blank"
            rel="noopener noreferrer"
            className="group m3-card m3-card-hover p-4 flex items-center gap-3.5"
          >
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-white p-1 ring-1 ring-slate-800 flex items-center justify-center">
              <img
                src={joinWithRoot('assets/asset/logo-administrasi-bisnis.jpeg')}
                alt="Jurusan Administrasi Bisnis Poliban"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-100 group-hover:text-accent-400 transition-colors truncate">
                Jurusan Administrasi Bisnis
              </p>
              <p className="text-[11px] text-slate-500">Politeknik Negeri Banjarmasin</p>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-slate-500 group-hover:text-accent-500 shrink-0" />
          </a>

          {/* 3. Nama Prodi: Sistem Informasi Poliban */}
          <a
            href="https://poliban.ac.id/"
            target="_blank"
            rel="noopener noreferrer"
            className="group m3-card m3-card-hover p-4 flex items-center gap-3.5"
          >
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-white p-1 ring-1 ring-slate-800 flex items-center justify-center">
              <img
                src={joinWithRoot('assets/asset/logo-sistem-informasi.jpeg')}
                alt="Sistem Informasi Poliban"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-100 group-hover:text-accent-400 transition-colors truncate">
                Sistem Informasi Poliban
              </p>
              <p className="text-[11px] text-slate-500">Program Studi Vokasi</p>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-slate-500 group-hover:text-accent-500 shrink-0" />
          </a>

          {/* 4. Itech: Itech Poliban */}
          <a
            href="https://www.itechpoliban.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="group m3-card m3-card-hover p-4 flex items-center gap-3.5"
          >
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-white p-1 ring-1 ring-slate-800 flex items-center justify-center">
              <img
                src={joinWithRoot('assets/asset/logo%20itech%20poliban.png')}
                alt="Itech Poliban"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-100 group-hover:text-accent-400 transition-colors truncate">
                Itech Poliban
              </p>
              <p className="text-[11px] text-slate-500">Komunitas Teknologi</p>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-slate-500 group-hover:text-accent-500 shrink-0" />
          </a>

          {/* 5. Makat-Xploit: Komunitas Makat-Xploit */}
          <a
            href="https://github.com/makat-xploit"
            target="_blank"
            rel="noopener noreferrer"
            className="group m3-card m3-card-hover p-4 flex items-center gap-3.5"
          >
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-slate-900 p-0.5 ring-1 ring-slate-800 flex items-center justify-center">
              <img
                src={joinWithRoot('assets/asset/logo-makat-xploit.jpeg')}
                alt="Komunitas Makat-Xploit"
                className="h-full w-full object-cover rounded-lg"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-100 group-hover:text-accent-400 transition-colors truncate">
                Komunitas Makat-Xploit
              </p>
              <p className="text-[11px] text-slate-500">Cyber Security Research</p>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-slate-500 group-hover:text-accent-500 shrink-0" />
          </a>

          {/* 6. Baru Aku: M. Aryanda Sanggadiennata */}
          <a
            href="https://portofolioaryanda.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="group m3-card m3-card-hover p-4 flex items-center gap-3.5"
          >
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-accent-500/20 text-accent-400 flex items-center justify-center font-bold text-sm ring-1 ring-accent-500/30">
              MA
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-100 group-hover:text-accent-400 transition-colors truncate">
                M. Aryanda Sanggadiennata
              </p>
              <p className="text-[11px] text-slate-500">Developer & Author</p>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-slate-500 group-hover:text-accent-500 shrink-0" />
          </a>
        </div>
      </section>
    </div>
  );
}
