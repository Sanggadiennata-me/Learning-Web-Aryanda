import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Info, Network, RotateCcw, Sparkles } from 'lucide-react';
import { fetchGraph } from '../services/docs';
import { ForceGraph } from '../components/graph/ForceGraph';
import { Spinner } from '../components/ui/spinner';
import type { GraphData, GraphNode } from '../domain/types';
import { cn } from '../lib/utils';
import { FOLDER_COLORS, FALLBACK_COLOR } from '../lib/colors';

const FOLDER_LABELS: Record<string, { label: string; color: string }> = {
  Pemrograman: { label: 'Pemrograman', color: FOLDER_COLORS.Pemrograman },
  CyberSecurity: { label: 'CyberSecurity', color: FOLDER_COLORS.CyberSecurity },
  DevOps: { label: 'DevOps', color: FOLDER_COLORS.DevOps },
  Jaringan: { label: 'Jaringan', color: FOLDER_COLORS.Jaringan },
  'Terms and foreign words': { label: 'Kamus IT', color: FALLBACK_COLOR },
};

/**
 * Halaman Graf Materi (Material Design & Obsidian Graph View):
 * - Visualisasi fisika d3-force untuk wikilinks antar catatan Obsidian.
 * - Toolbar kontrol Material 3: filter terisolasi, reset zoom (fit), dan legenda interaktif.
 * - Detail card popup saat hover/klik node dengan link langsung ke dokumen.
 */
export default function GraphPage() {
  const [data, setData] = useState<GraphData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showIsolated, setShowIsolated] = useState(false);
  const [hovered, setHovered] = useState<GraphNode | null>(null);
  const [fitSignal, setFitSignal] = useState(0);
  const [showLegend, setShowLegend] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    fetchGraph()
      .then((graph) => {
        if (!cancelled) setData(graph);
      })
      .catch((err) => {
        if (!cancelled) setError((err as Error).message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center text-sm text-slate-400">
        {error}. Jalankan parser untuk membuat graph.json.
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const connected = data.nodes.filter((n) =>
    data.links.some((l) => l.source === n.id || l.target === n.id)
  );

  return (
    <div className="flex h-[calc(100vh-5.5rem)] flex-col bg-slate-950 light:bg-slate-50">
      {/* ============ MATERIAL 3 TOOLBAR ============ */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/90 px-4 py-2.5 backdrop-blur light:border-slate-200 light:bg-white shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-500/15 text-accent-400 light:bg-accent-100 light:text-accent-700">
            <Network className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-100 light:text-slate-900 leading-none">
              Graf Pengetahuan Obsidian
            </h1>
            <p className="text-[11px] text-slate-500 light:text-slate-500 mt-0.5">
              {connected.length} catatan terhubung · {data.links.length} tautan wikilinks
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Legenda Toggle (Mobile & Desktop) */}
          <button
            onClick={() => setShowLegend((v) => !v)}
            className={cn(
              'flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all shadow-sm',
              showLegend
                ? 'border-accent-500 bg-accent-500/15 text-accent-300 light:bg-accent-100 light:text-accent-700'
                : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-slate-200 light:border-slate-200 light:bg-slate-100 light:text-slate-700'
            )}
            title="Tampilkan / Sembunyikan Kategori"
          >
            <Info className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Legenda</span>
          </button>

          {/* Toggle Terisolasi */}
          <button
            onClick={() => setShowIsolated((v) => !v)}
            className={cn(
              'rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all shadow-sm',
              showIsolated
                ? 'border-accent-500 bg-accent-500/15 text-accent-300 light:bg-accent-100 light:text-accent-700'
                : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-slate-200 light:border-slate-200 light:bg-slate-100 light:text-slate-700'
            )}
          >
            {showIsolated ? '✓ ' : ''}Terisolasi ({data.nodes.length - connected.length})
          </button>

          {/* Fit Signal Reset */}
          <button
            onClick={() => setFitSignal((v) => v + 1)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-slate-700 hover:text-white light:border-slate-200 light:bg-slate-100 light:text-slate-700 shadow-sm active:scale-95 transition-all"
            title="Sesuaikan pandangan kamera ke tengah"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Pusatkan</span>
          </button>
        </div>
      </div>

      {/* ============ GRAPH CANVAS AREA ============ */}
      <div className="relative flex-1 overflow-hidden bg-slate-950 light:bg-slate-900">
        <ForceGraph
          data={data}
          showIsolated={showIsolated}
          onNodeClick={(id) => navigate(`/docs/${id}`)}
          onHoverChange={setHovered}
          fitSignal={fitSignal}
        />

        {/* Floating Legenda Card */}
        {showLegend && (
          <div className="absolute left-4 top-4 z-20 w-64 rounded-2xl border border-slate-800 bg-slate-900/95 p-4 shadow-xl backdrop-blur-md light:border-slate-200 light:bg-white/95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 light:border-slate-200">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 light:text-slate-700">
                Warna Kategori
              </span>
              <button
                onClick={() => setShowLegend(false)}
                className="text-xs text-slate-500 hover:text-slate-300"
              >
                ✕
              </button>
            </div>
            <ul className="mt-3 space-y-2 text-xs text-slate-300 light:text-slate-700">
              {Object.entries(FOLDER_LABELS).map(([key, { label, color }]) => (
                <li key={key} className="flex items-center gap-2.5">
                  <span
                    className="h-3 w-3 shrink-0 rounded-full shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-medium truncate">{label}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3.5 border-t border-slate-800 pt-2 text-[10px] leading-relaxed text-slate-500 light:text-slate-400 light:border-slate-200">
              • <strong>Klik node</strong> untuk membaca dokumen lengkap.<br />
              • <strong>Hover</strong> untuk menyorot tetangga terkait.<br />
              • <strong>Scroll</strong> untuk zoom in / out.
            </p>
          </div>
        )}

        {/* Floating Node Detail Card on Hover */}
        {hovered && (
          <div className="absolute bottom-5 left-5 z-20 max-w-sm rounded-2xl border border-slate-800 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-md light:border-slate-200 light:bg-white/95 transition-all">
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent-500 light:text-accent-600 block">
              {hovered.folder || 'Vault Root'}
            </span>
            <h2 className="mt-1 text-sm font-bold text-slate-100 light:text-slate-900 line-clamp-2">
              {hovered.title}
            </h2>
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => navigate(`/docs/${hovered.id}`)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-accent-600 px-3.5 py-1.5 text-xs font-bold text-white shadow transition-all hover:bg-accent-700 active:scale-95"
              >
                Buka Catatan
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
