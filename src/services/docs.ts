import type { CodeFolderData, DocumentData, GraphData, MetadataFile, RoadmapsData, SearchIndexEntry, TreeFileNode, TreeFolderNode, TreeNode } from '../domain/types';
import { joinWithRoot } from '../lib/base';

async function getJson<T>(path: string): Promise<T> {
  const url = joinWithRoot(path);
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`Gagal memuat ${url} (HTTP ${response.status})`);
  }
  return (await response.json()) as T;
}

/** tree.json. dimuat sekali di awal aplikasi. */
export function fetchTree(): Promise<TreeFolderNode[]> {
  return getJson<TreeFolderNode[]>('docs/tree.json');
}

/** metadata.json. dimuat sekali di awal aplikasi. */
export function fetchMetadata(): Promise<MetadataFile> {
  return getJson<MetadataFile>('docs/metadata.json');
}

/** search-index.json. lazy load hanya saat halaman pencarian dibuka. */
export function fetchSearchIndex(): Promise<SearchIndexEntry[]> {
  return getJson<SearchIndexEntry[]>('docs/search-index.json');
}

/** graph.json. lazy load hanya saat halaman graph dibuka. */
export function fetchGraph(): Promise<GraphData> {
  return getJson<GraphData>('docs/graph.json');
}

/** roadmaps.json. lazy load hanya saat halaman roadmap dibuka. */
export function fetchRoadmaps(): Promise<RoadmapsData> {
  return getJson<RoadmapsData>('docs/roadmaps.json');
}

/** Dokumen individual. dimuat on-demand berdasarkan outputPath dari tree. */
export function fetchDocument(outputPath: string): Promise<DocumentData> {
  return getJson<DocumentData>(`docs/${encodeURI(outputPath)}.json`);
}

/**
 * Data code folder (satu JSON per folder, dihasilkan parser).
 * dimuat lazy HANYA saat user membuka folder/file code.
 */
export function fetchCodeFolder(folderRelativePath: string): Promise<CodeFolderData> {
  return getJson<CodeFolderData>(`docs/code/${encodeURI(folderRelativePath)}.json`);
}

export interface FileMapEntry {
  title: string;
  outputPath: string;
  relativePath: string;
}

/** Membangun peta id -> {title, outputPath} dari tree (recursive). */
export function buildFileMap(tree: TreeFolderNode[]): Map<string, FileMapEntry> {
  const map = new Map<string, FileMapEntry>();
  const walk = (nodes: TreeNode[]): void => {
    for (const node of nodes) {
      if (node.type === 'file') {
        // File code punya pipeline sendiri (fetchCodeFolder) — jangan masuk fileMap.
        if (node.isCode) continue;
        map.set(node.id, {
          title: node.title,
          outputPath: node.outputPath,
          relativePath: node.relativePath,
        });
      } else {
        walk(node.children);
      }
    }
  };
  walk(tree);
  return map;
}

/** Menghitung total file di dalam tree. */
export function countFiles(nodes: TreeNode[]): number {
  let count = 0;
  for (const node of nodes) {
    count += node.type === 'file' ? 1 : countFiles(node.children);
  }
  return count;
}

/* ============================================================
   Code file metadata (dibangun dari tree.json — tanpa muat content).
   ============================================================ */

export interface CodeFileEntry {
  /** Id route (lowercase, spasi -> hyphen). */
  id: string;
  /** Path relatif folder, casing asli, mis. "Pemrograman/Python/Python Dasar/Praktek". */
  folder: string;
  /** Nama file lengkap. */
  name: string;
  /** Path relatif vault file. */
  relativePath: string;
  extension: string;
  language: string;
  size: number;
}

export interface CodeFolderEntry {
  /** Id route folder (lowercase, spasi -> hyphen). */
  id: string;
  /** Path relatif folder, casing asli. */
  folder: string;
  /** Path relatif folder induk langsung ("" jika di root). */
  parentPath: string;
  /** Nama folder terakhir. */
  name: string;
  /** Jumlah file code langsung di folder ini (tanpa subfolder). */
  count: number;
}

/** Path induk dari relative path ("" jika sudah di root). */
export function parentPathOf(relativePath: string): string {
  return relativePath.includes('/') ? relativePath.split('/').slice(0, -1).join('/') : '';
}

/** Cari node folder di dalam tree berdasarkan relativePath asli atau normalized path. */
export function findFolderNode(nodes: TreeNode[], relativePath: string): TreeFolderNode | null {
  const normTarget = normalizeId(relativePath).replace(/^\/+|\/+$/g, '');
  for (const node of nodes) {
    if (node.type === 'file') continue;
    if (
      node.relativePath === relativePath ||
      normalizeId(node.relativePath) === normTarget ||
      normalizeId(node.name) === normTarget
    ) {
      return node;
    }
    const found = findFolderNode(node.children, relativePath);
    if (found) return found;
  }
  return null;
}

/**
 * Mencari dokumen default pembuka subskill:
 * 1. Mengutamakan file yang memiliki hashtag #ROADMAP (node.isRoadmap === true).
 * 2. Jika ada beberapa roadmap, utamakan yang berorientasi dasar / pembuka (dasar, pengenalan, 01, 1., dsb)
 *    serta kedalaman folder yang lebih umum (shallower).
 * 3. Jika belum memiliki #ROADMAP, utamakan file catatan indeks subskill (mis. Html.md, GitHub.md)
 *    atau file pengenalan materi.
 */
export function getDefaultSubskillDocId(node: TreeFolderNode): string {
  const files: TreeFileNode[] = [];
  function collect(n: TreeNode) {
    if (n.type === 'file') {
      files.push(n);
    } else {
      for (const child of n.children) {
        collect(child);
      }
    }
  }
  collect(node);

  const mdFiles = files.filter((f) => !f.isCode);
  if (mdFiles.length === 0) {
    return files[0]?.id || node.relativePath.toLowerCase();
  }

  // 1. Prioritas Utama: File yang memiliki hashtag #ROADMAP (isRoadmap === true)
  const roadmapFiles = mdFiles.filter((f) => f.isRoadmap);
  if (roadmapFiles.length > 0) {
    function getScore(f: TreeFileNode): number {
      let score = 0;
      const tl = f.title.toLowerCase();
      const il = f.id.toLowerCase();
      const depth = f.relativePath.split('/').length;

      if (
        tl.includes('pengenalan') ||
        il.includes('pengenalan') ||
        tl.includes('dasar') ||
        il.includes('dasar') ||
        tl.includes('basic') ||
        il.includes('basic') ||
        tl.includes('intro') ||
        il.includes('intro') ||
        tl.includes('01') ||
        il.includes('01') ||
        tl.startsWith('1.') ||
        il.includes('/1.')
      ) {
        score += 50;
      }

      if (tl === node.name.toLowerCase()) {
        score += 40;
      }

      score -= depth * 2;
      return score;
    }

    roadmapFiles.sort((a, b) => getScore(b) - getScore(a));
    return roadmapFiles[0].id;
  }

  // 2. Prioritas Kedua: File catatan indeks subskill (mis. Html.md, GitHub.md)
  const subskillMatch = mdFiles.find(
    (f) => f.title.toLowerCase() === node.name.toLowerCase()
  );
  if (subskillMatch) return subskillMatch.id;

  // 3. Prioritas Ketiga: File pembuka materi (pengenalan, dasar, intro)
  for (const f of mdFiles) {
    const tl = f.title.toLowerCase();
    const il = f.id.toLowerCase();
    if (
      tl.includes('pengenalan') ||
      il.includes('pengenalan') ||
      tl.includes('intro') ||
      tl.includes('dasar') ||
      tl.includes('basic')
    ) {
      return f.id;
    }
  }

  return mdFiles[0].id;
}

/**
 * Bangun index code folder + code file dari tree (metadata ringan, tanpa content).
 * dipakai routing /docs/* agar tahu path mana folder-code / file-code.
 */
export function buildCodeIndex(tree: TreeFolderNode[]): {
  codeFileById: Map<string, CodeFileEntry>;
  codeFolderById: Map<string, CodeFolderEntry>;
} {
  const codeFileById = new Map<string, CodeFileEntry>();
  const codeFolderById = new Map<string, CodeFolderEntry>();

  const walk = (nodes: TreeNode[]): void => {
    for (const node of nodes) {
      if (node.type === 'file') {
        if (!node.isCode || !node.id) continue;
        codeFileById.set(node.id, {
          id: node.id,
          folder: node.relativePath.includes('/')
            ? node.relativePath.split('/').slice(0, -1).join('/')
            : '',
          name: node.title,
          relativePath: node.relativePath,
          extension: node.extension ?? '',
          language: node.language ?? 'plaintext',
          size: node.size ?? 0,
        });
      } else {
        if (node.isCodeFolder && node.relativePath) {
          codeFolderById.set(normalizeId(node.relativePath), {
            id: normalizeId(node.relativePath),
            folder: node.relativePath,
            parentPath: parentPathOf(node.relativePath),
            name: node.name,
            count: node.children.filter((c) => c.type === 'file' && c.isCode).length,
          });
        }
        walk(node.children);
      }
    }
  };
  walk(tree);
  return { codeFileById, codeFolderById };
}

/** Normalisasi path folder code untuk id route (lowercase, spasi -> hyphen). */
export function normalizeId(relativePath: string): string {
  return relativePath.replace(/\\/g, '/').toLowerCase().replace(/ /g, '-');
}
