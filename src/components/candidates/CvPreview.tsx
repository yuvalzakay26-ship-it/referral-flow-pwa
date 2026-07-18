"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Eye,
  Download,
  ExternalLink,
  X,
  Loader2,
  RefreshCw,
  FileWarning,
  FileText,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getSignedCvUrl } from "@/services/cvService";
import type { Candidate } from "@/types";
import type {
  PDFDocumentProxy,
  PDFDocumentLoadingTask,
  RenderTask,
} from "pdfjs-dist";

const WORD_MESSAGE =
  "לא ניתן להציג קובץ Word ישירות במערכת. ניתן להוריד ולפתוח אותו במכשיר.";

type CvKind = "pdf" | "word" | "none";

/**
 * Decide how a stored CV can be previewed in-app. Only PDFs render in-app (via
 * PDF.js); Word documents are download-only (never sent to an external viewer),
 * and a missing file cannot be previewed at all.
 */
function cvKind(
  candidate: Pick<Candidate, "cv_file_name" | "cv_mime_type">,
): CvKind {
  if (!candidate.cv_file_name) return "none";
  const name = candidate.cv_file_name.toLowerCase();
  const mime = (candidate.cv_mime_type ?? "").toLowerCase();
  if (mime === "application/pdf" || name.endsWith(".pdf")) return "pdf";
  return "word";
}

/**
 * Lazily load pdfjs-dist (kept out of the main app bundles) and point it at the
 * self-hosted worker served from /public — no external/CDN dependency. Cached
 * so the library and worker are only set up once per session.
 */
let pdfjsPromise: Promise<typeof import("pdfjs-dist")> | null = null;
function loadPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist").then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      return pdfjs;
    });
  }
  return pdfjsPromise;
}

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.25;

/**
 * PDF viewer sub-state. The signed URL is never held here — only whether the
 * fetched PDF blob (kept in a ref) is ready to hand to PDF.js. The blob URL used
 * for download / open-in-new-tab lives in a ref and is revoked on close.
 */
type ViewerState =
  | { status: "loading" }
  | { status: "ready"; blob: Blob }
  | { status: "error"; kind: "generate" | "expired" | "missing" | "render" };

/**
 * Secure in-app CV viewer. Renders a prominent "view CV" action alongside the
 * existing download flow. On open it mints a fresh, short-lived signed Supabase
 * Storage URL, fetches the object into a same-origin blob, and renders the PDF
 * in-app with PDF.js (canvas) — never the browser's native PDF plugin, which is
 * unreliable inside iframes on mobile. The signed URL is never stored
 * (DB/localStorage/DOM) and the blob URL is revoked when the modal closes. Word
 * files are download-only and never sent to an external viewer.
 */
export function CvPreview({ candidate }: { candidate: Candidate }) {
  const kind = cvKind(candidate);
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const [state, setState] = useState<ViewerState>({ status: "loading" });
  const [wordBusy, setWordBusy] = useState(false);
  const [wordError, setWordError] = useState(false);
  const blobUrlRef = useRef<string | null>(null);

  const revoke = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  }, []);

  // Request a fresh signed URL, fetch the file into a blob, and hand it to the
  // in-app PDF.js viewer.
  const loadPdf = useCallback(async () => {
    revoke();
    setState({ status: "loading" });
    let signed: string | null;
    try {
      signed = await getSignedCvUrl(candidate.id);
    } catch {
      setState({ status: "error", kind: "generate" });
      return;
    }
    if (!signed) {
      setState({ status: "error", kind: "missing" });
      return;
    }
    try {
      const res = await fetch(signed, { cache: "no-store" });
      if (!res.ok) {
        // A short-lived signed URL that no longer resolves is treated as
        // expired — the user can retry to mint a new one.
        setState({ status: "error", kind: "expired" });
        return;
      }
      const raw = await res.blob();
      const blob =
        raw.type === "application/pdf"
          ? raw
          : new Blob([raw], { type: "application/pdf" });
      blobUrlRef.current = URL.createObjectURL(blob);
      setState({ status: "ready", blob });
    } catch {
      setState({ status: "error", kind: "expired" });
    }
    // `signed` intentionally goes out of scope here: it is never persisted.
  }, [candidate.id, revoke]);

  function handleOpen() {
    if (kind === "none") return;
    setWordError(false);
    setOpen(true);
    if (kind === "pdf") void loadPdf();
  }

  const handleClose = useCallback(() => {
    setOpen(false);
    setShown(false);
    revoke();
    setState({ status: "loading" });
  }, [revoke]);

  const handleRenderFailure = useCallback(() => {
    setState({ status: "error", kind: "render" });
  }, []);

  // Enter transition + Escape-to-close + scroll lock while open.
  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => setShown(true));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, handleClose]);

  // Safety net: revoke any live blob URL if the component unmounts while open.
  useEffect(() => () => revoke(), [revoke]);

  function downloadBlob() {
    const url = blobUrlRef.current;
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = candidate.cv_file_name ?? "cv.pdf";
    a.click();
  }

  function openInNewTab() {
    const url = blobUrlRef.current;
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  }

  // Download path for Word (and the modal's download when no blob exists):
  // mint a fresh signed URL on demand and hand it to the browser.
  async function downloadViaSignedUrl() {
    setWordError(false);
    setWordBusy(true);
    try {
      const url = await getSignedCvUrl(candidate.id);
      if (url) window.open(url, "_blank", "noopener,noreferrer");
      else setWordError(true);
    } catch {
      setWordError(true);
    } finally {
      setWordBusy(false);
    }
  }

  const canPreview = kind !== "none";
  const pdfReady = kind === "pdf" && state.status === "ready";

  return (
    <>
      <Button
        variant="solid"
        onClick={handleOpen}
        disabled={!canPreview}
        className="border-[var(--rf-purple)] text-[var(--rf-text)]"
      >
        <Eye size={16} />
        צפייה בקורות החיים
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-stretch justify-center sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="צפייה בקורות החיים"
        >
          <div
            onClick={handleClose}
            aria-hidden
            className={`absolute inset-0 bg-[var(--overlay)] backdrop-blur-sm transition-opacity duration-200 ease-out motion-reduce:transition-none ${
              shown ? "opacity-100" : "opacity-0"
            }`}
          />
          <div
            className={`glass-elevated relative z-10 flex h-dvh w-full flex-col overflow-hidden sm:h-[90dvh] sm:max-w-5xl sm:rounded-3xl transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none ${
              shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            {/* Header: file name + actions */}
            <div className="flex items-center justify-between gap-2 border-b border-[var(--border-subtle)] p-3 sm:p-4">
              <div className="flex min-w-0 items-center gap-2">
                <FileText
                  size={18}
                  className="flex-none text-[var(--rf-text-muted)]"
                />
                <h3 className="truncate text-sm font-bold text-[var(--rf-text)] sm:text-base">
                  {candidate.cv_file_name ?? "קורות חיים"}
                </h3>
              </div>
              <div className="flex flex-none items-center gap-1.5">
                {pdfReady && (
                  <button
                    type="button"
                    onClick={openInNewTab}
                    aria-label="פתיחה בלשונית חדשה"
                    title="פתיחה בלשונית חדשה"
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm text-[var(--rf-text-muted)] hover:bg-[var(--hover-background)] hover:text-[var(--rf-text)] focus-ring"
                  >
                    <ExternalLink size={18} />
                    <span className="hidden sm:inline">פתיחה בלשונית חדשה</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={pdfReady ? downloadBlob : downloadViaSignedUrl}
                  disabled={wordBusy}
                  aria-label="הורדה"
                  title="הורדה"
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm text-[var(--rf-text-muted)] hover:bg-[var(--hover-background)] hover:text-[var(--rf-text)] focus-ring disabled:opacity-50"
                >
                  {wordBusy ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Download size={18} />
                  )}
                  <span className="hidden sm:inline">הורדה</span>
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  aria-label="סגירה"
                  title="סגירה"
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm text-[var(--rf-text-muted)] hover:bg-[var(--hover-background)] hover:text-[var(--rf-text)] focus-ring"
                >
                  <X size={18} />
                  <span className="hidden sm:inline">סגירה</span>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="relative flex-1 overflow-hidden bg-[var(--surface-muted)]">
              {kind === "word" ? (
                <ViewerMessage
                  icon={FileWarning}
                  title="תצוגה מקדימה אינה נתמכת"
                  message={WORD_MESSAGE}
                  action={
                    <Button
                      variant="gradient"
                      onClick={downloadViaSignedUrl}
                      disabled={wordBusy}
                    >
                      {wordBusy ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Download size={16} />
                      )}
                      הורדת קורות חיים
                    </Button>
                  }
                  error={wordError ? "הורדת הקובץ נכשלה. נסו שוב." : undefined}
                />
              ) : state.status === "loading" ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[var(--rf-text-muted)]">
                  <Loader2 size={28} className="animate-spin" />
                  <p className="text-sm">טוען תצוגה מקדימה…</p>
                </div>
              ) : state.status === "ready" ? (
                <PdfDocumentView
                  blob={state.blob}
                  onFailure={handleRenderFailure}
                />
              ) : state.status === "error" && state.kind === "missing" ? (
                <ViewerMessage
                  icon={FileWarning}
                  title="הקובץ אינו זמין"
                  message="קובץ קורות החיים אינו זמין כעת."
                />
              ) : state.status === "error" && state.kind === "generate" ? (
                <ViewerMessage
                  icon={FileWarning}
                  title="יצירת הקישור נכשלה"
                  message="לא ניתן היה ליצור קישור מאובטח לצפייה."
                  action={
                    <Button variant="gradient" onClick={() => void loadPdf()}>
                      <RefreshCw size={16} />
                      נסו שוב
                    </Button>
                  }
                />
              ) : state.status === "error" && state.kind === "render" ? (
                <ViewerMessage
                  icon={FileWarning}
                  title="טעינת התצוגה נכשלה"
                  message="לא ניתן היה להציג את הקובץ. ניתן לנסות שוב או להוריד אותו."
                  action={
                    <Button variant="gradient" onClick={() => void loadPdf()}>
                      <RefreshCw size={16} />
                      נסו שוב
                    </Button>
                  }
                />
              ) : (
                <ViewerMessage
                  icon={RefreshCw}
                  title="תוקף הקישור פג"
                  message="הקישור המאובטח לצפייה כבר אינו בתוקף."
                  action={
                    <Button variant="gradient" onClick={() => void loadPdf()}>
                      <RefreshCw size={16} />
                      רענון הקישור
                    </Button>
                  }
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * In-app PDF renderer built on PDF.js. Fetches nothing itself — it renders the
 * already-fetched, private blob to <canvas> elements (one per page), fit to the
 * container width by default, with all pages scrollable and simple zoom
 * controls. No native PDF plugin / iframe, so mobile never shows the broken
 * native "open" placeholder.
 */
function PdfDocumentView({
  blob,
  onFailure,
}: {
  blob: Blob;
  onFailure: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const canvasesRef = useRef<Array<HTMLCanvasElement | null>>([]);
  const docRef = useRef<PDFDocumentProxy | null>(null);
  const loadingTaskRef = useRef<PDFDocumentLoadingTask | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");
  const [width, setWidth] = useState(0);

  // Load the document once from the in-memory blob.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pdfjs = await loadPdfjs();
        const data = await blob.arrayBuffer();
        if (cancelled) return;
        const task = pdfjs.getDocument({ data });
        loadingTaskRef.current = task;
        const doc = await task.promise;
        if (cancelled) return;
        docRef.current = doc;
        canvasesRef.current = new Array(doc.numPages).fill(null);
        setNumPages(doc.numPages);
        setPhase("ready");
      } catch {
        if (!cancelled) {
          setPhase("error");
          onFailure();
        }
      }
    })();
    return () => {
      cancelled = true;
      const task = loadingTaskRef.current;
      loadingTaskRef.current = null;
      docRef.current = null;
      // Destroying the loading task aborts work and tears down the worker.
      if (task) void task.destroy();
    };
  }, [blob, onFailure]);

  // Track the scroll container width so pages fit to width (and re-fit on
  // rotation / resize).
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const measure = () => setWidth(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [phase]);

  // Render every page whenever the document, zoom, or available width changes.
  useEffect(() => {
    const doc = docRef.current;
    if (phase !== "ready" || !doc || width === 0) return;
    let cancelled = false;
    const tasks: RenderTask[] = [];
    (async () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      for (let i = 1; i <= doc.numPages; i++) {
        if (cancelled) return;
        const canvas = canvasesRef.current[i - 1];
        if (!canvas) continue;
        const page = await doc.getPage(i);
        if (cancelled) return;
        const base = page.getViewport({ scale: 1 });
        // Fit the page to the container width, then apply the zoom multiplier.
        const cssWidth = Math.max(1, (width - 24) * zoom);
        const cssScale = cssWidth / base.width;
        const viewport = page.getViewport({ scale: cssScale * dpr });
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        canvas.style.width = `${Math.floor(cssWidth)}px`;
        canvas.style.height = `${Math.floor(viewport.height / dpr)}px`;
        const task = page.render({ canvas, viewport });
        tasks.push(task);
        try {
          await task.promise;
        } catch {
          /* render cancelled by a newer zoom/resize pass */
        }
      }
    })();
    return () => {
      cancelled = true;
      tasks.forEach((t) => t.cancel());
    };
  }, [phase, zoom, width, numPages]);

  const zoomOut = () =>
    setZoom((z) => Math.max(ZOOM_MIN, Math.round((z - ZOOM_STEP) * 100) / 100));
  const zoomIn = () =>
    setZoom((z) => Math.min(ZOOM_MAX, Math.round((z + ZOOM_STEP) * 100) / 100));

  return (
    <div className="absolute inset-0">
      <div
        ref={scrollRef}
        className="h-full w-full overflow-auto overscroll-contain"
        dir="ltr"
      >
        <div className="flex flex-col items-center gap-3 p-3">
          {Array.from({ length: numPages }).map((_, i) => (
            <canvas
              key={i}
              ref={(el) => {
                canvasesRef.current[i] = el;
              }}
              className="max-w-full rounded-lg bg-white shadow-md"
            />
          ))}
        </div>
      </div>

      {phase !== "ready" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[var(--rf-text-muted)]">
          <Loader2 size={28} className="animate-spin" />
          <p className="text-sm">טוען תצוגה מקדימה…</p>
        </div>
      )}

      {phase === "ready" && (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
          <div className="glass-elevated pointer-events-auto flex items-center gap-1 rounded-full p-1 shadow-lg">
            <button
              type="button"
              onClick={zoomOut}
              disabled={zoom <= ZOOM_MIN}
              aria-label="הקטנה"
              title="הקטנה"
              className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--rf-text)] hover:bg-[var(--hover-background)] focus-ring disabled:opacity-40"
            >
              <ZoomOut size={18} />
            </button>
            <span className="min-w-12 text-center text-xs font-semibold tabular-nums text-[var(--rf-text)]">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={zoomIn}
              disabled={zoom >= ZOOM_MAX}
              aria-label="הגדלה"
              title="הגדלה"
              className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--rf-text)] hover:bg-[var(--hover-background)] focus-ring disabled:opacity-40"
            >
              <ZoomIn size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ViewerMessage({
  icon: Icon,
  title,
  message,
  action,
  error,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  message: string;
  action?: React.ReactNode;
  error?: string;
}) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface)] text-[var(--rf-text-muted)]">
        <Icon size={26} />
      </span>
      <div>
        <p className="text-base font-bold text-[var(--rf-text)]">{title}</p>
        <p className="mt-1 max-w-sm text-sm text-[var(--rf-text-muted)]">
          {message}
        </p>
      </div>
      {action}
      {error && (
        <p
          className="rf-badge badge-red rounded-lg border px-3 py-1.5 text-xs"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
