import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import { useSiteData } from '../app/SiteProvider';
import { DocumentViewer } from '../components/document/DocumentViewer';
import { Spinner } from '../components/ui/spinner';
import { fetchDocument, findFolderNode, getDefaultSubskillDocId } from '../services/docs';
import { CodeFolderPage } from './CodeFolderPage';
import { CodeFileViewer } from './CodeFileViewer';
import type { DocumentData } from '../domain/types';

/**
 * Halaman dokumen. URL /docs/:id* membawa stable id (path normalized).
 * Dispatcher:
 *   1. id = code FILE → CodeFileViewer (source code dari vault)
 *   2. id = code FOLDER → CodeFolderPage (code directory browser)
 *   3. id = folder prefix → Otomatis alihkan ke dokumen pertama di folder tersebut
 *   4. selainnya → <DocumentDoc> (dokumen markdown biasa).
 */
export default function DocumentPage() {
  const { '*': idParam } = useParams();
  const rawId = idParam ? decodeURIComponent(idParam) : '';
  const id = rawId.toLowerCase();
  const { fileMap, tree, codeFileById, codeFolderById } = useSiteData();

  const codeFile = codeFileById.get(id);
  if (codeFile) {
    return <CodeFileViewer file={codeFile} />;
  }
  const codeFolder = codeFolderById.get(id);
  if (codeFolder) {
    return <CodeFolderPage folder={codeFolder} />;
  }

  // Jika ID persis ditemukan di fileMap
  if (fileMap.has(id)) {
    return <DocumentDoc id={id} />;
  }

  // Smart fallback: Jika user membuka nama folder / subskill (misal: "pemrograman/python", "cybersecurity/pwn")
  // alihkan otomatis ke file #ROADMAP default dari subskill tersebut!
  if (id && tree) {
    const matchedFolder = findFolderNode(tree, id);
    if (matchedFolder) {
      const defaultDocId = getDefaultSubskillDocId(matchedFolder);
      if (defaultDocId && defaultDocId !== id) {
        return <Navigate to={`/docs/${defaultDocId}`} replace />;
      }
    }
  }

  // Fallback sekunder jika membuka prefix folder tanpa exact tree match
  if (id && fileMap.size > 0) {
    const prefix = id.endsWith('/') ? id : `${id}/`;
    for (const [key] of fileMap.entries()) {
      if (key.toLowerCase().startsWith(prefix)) {
        return <Navigate to={`/docs/${key}`} replace />;
      }
    }
  }

  return <DocumentDoc id={id} />;
}

/** Muat dokumen markdown on-demand (hooks hanya di komponen ini). */
function DocumentDoc({ id }: { id: string }) {
  const { fileMap, loading: siteLoading } = useSiteData();
  const [doc, setDoc] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    const entry = fileMap.get(id);
    if (!entry) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    fetchDocument(entry.outputPath)
      .then((data) => {
        if (!cancelled) setDoc(data);
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, fileMap]);

  if (siteLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (notFound || !doc) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center py-20 text-center">
        <FileQuestion className="h-10 w-10 text-slate-700" />
        <h1 className="mt-4 text-xl font-bold text-slate-100">Dokumen tidak ditemukan</h1>
        <p className="mt-2 text-sm text-slate-500">
          Tidak ada dokumen dengan id <code className="rounded bg-slate-900 px-1.5 py-0.5 text-xs">{id}</code>
        </p>
        <Link
          to="/docs"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white hover:bg-accent-600"
        >
          Kembali ke Docs
        </Link>
      </div>
    );
  }

  return <DocumentViewer doc={doc} />;
}
