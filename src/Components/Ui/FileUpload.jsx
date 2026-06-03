import { useCallback, useMemo, useState } from "react";
import { FileText, RotateCcw, Trash2, UploadCloud, X } from "lucide-react";
import { useDropzone } from "react-dropzone";

const DEFAULT_ACCEPT = {
  "application/pdf": [".pdf"],
};

const formatBytes = (bytes = 0) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const rejectionMessage = (rejection) => {
  const error = rejection.errors?.[0];
  if (!error) return `${rejection.file.name} could not be selected.`;
  if (error.code === "file-too-large") return `${rejection.file.name} exceeds the file-size limit.`;
  if (error.code === "file-invalid-type") return `${rejection.file.name} is not an accepted file type.`;
  if (error.code === "too-many-files") return "Too many files were selected.";
  return error.message;
};

export default function FileUpload({
  accept = DEFAULT_ACCEPT,
  disabled = false,
  error,
  files = [],
  label = "Upload files",
  maxFiles = 1,
  maxSize = 5 * 1024 * 1024,
  multiple = false,
  onFilesChange,
  progress = 0,
  required = false,
  status = "idle",
  description,
}) {
  const [selectionError, setSelectionError] = useState("");
  const limit = multiple ? Math.max(1, maxFiles) : 1;

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length) {
      setSelectionError(rejectionMessage(rejectedFiles[0]));
      return;
    }

    setSelectionError("");
    const nextFiles = multiple
      ? [...files, ...acceptedFiles].slice(0, limit)
      : acceptedFiles.slice(0, 1);
    onFilesChange?.(nextFiles);
  }, [files, limit, multiple, onFilesChange]);

  const { getInputProps, getRootProps, isDragActive, open } = useDropzone({
    accept,
    disabled,
    maxFiles: limit,
    maxSize,
    multiple,
    noClick: files.length >= limit,
    noKeyboard: files.length >= limit,
    onDrop,
  });

  const acceptedLabel = useMemo(() => {
    const extensions = Object.values(accept).flat().map((item) => item.replace(".", "").toUpperCase());
    return [...new Set(extensions)].join(", ");
  }, [accept]);

  const removeFile = (index) => {
    setSelectionError("");
    onFilesChange?.(files.filter((_, fileIndex) => fileIndex !== index));
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
          {label}{required ? " *" : ""}
        </p>
        {description && <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">{description}</p>}
      </div>

      <div
        {...getRootProps()}
        className={`rounded-2xl border border-dashed p-5 text-center transition-all duration-300 ${
          disabled
            ? "cursor-not-allowed border-gray-200 bg-gray-100 opacity-60 dark:border-white/10 dark:bg-zinc-900"
            : isDragActive
              ? "cursor-copy border-blue-500 bg-blue-50 dark:bg-blue-500/10"
              : "cursor-pointer border-gray-300 bg-gray-50 hover:border-blue-500 hover:bg-blue-50/60 dark:border-white/15 dark:bg-zinc-900/70 dark:hover:bg-blue-500/10"
        }`}
      >
        <input {...getInputProps()} />
        <UploadCloud className="mx-auto mb-3 text-blue-600 dark:text-blue-400" size={28} />
        <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
          {isDragActive ? "Drop files here" : "Drag and drop or browse files"}
        </p>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {acceptedLabel} · up to {formatBytes(maxSize)} · {multiple ? `${limit} files maximum` : "one file"}
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 dark:border-white/10 dark:bg-zinc-900"
              key={`${file.name}-${file.lastModified}-${index}`}
            >
              <FileText className="shrink-0 text-blue-600 dark:text-blue-400" size={20} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-800 dark:text-gray-100">{file.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{formatBytes(file.size)}</p>
              </div>
              <button
                aria-label={`Remove ${file.name}`}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                disabled={disabled}
                onClick={() => removeFile(index)}
                type="button"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {status === "uploading" && (
        <div className="space-y-2">
          <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
            <div className="h-full rounded-full bg-blue-600 transition-[width] duration-300" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">Uploading securely · {progress}%</p>
        </div>
      )}

      {(selectionError || error) && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          <X className="mt-0.5 shrink-0" size={14} />
          <span>{selectionError || error}</span>
        </div>
      )}

      {files.length >= limit && !disabled && (
        <button className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400" onClick={open} type="button">
          <RotateCcw size={13} /> Choose a different file
        </button>
      )}
    </div>
  );
}

