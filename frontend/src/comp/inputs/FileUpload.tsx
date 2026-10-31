import React, { useState, useRef } from "react"
import { cn } from "@/lib/utils"
import { UploadCloud, File, X } from "lucide-react"

export interface FileUploadProps {
  onFilesSelected: (files: File[]) => void
  accept?: string
  multiple?: boolean
  maxSizeBytes?: number
  label?: string
  description?: string
  className?: string
}

/**
 * Calm Apple-styled drag-and-drop file uploader zone.
 */
export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  accept,
  multiple = false,
  maxSizeBytes = 10 * 1024 * 1024, // 10MB
  label = "Upload files",
  description = "Drag & drop files or browse",
  className,
}) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFileList, setSelectedFileList] = useState<File[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    const validFiles: File[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.size <= maxSizeBytes) validFiles.push(file)
    }
    const updated = multiple ? [...selectedFileList, ...validFiles] : validFiles
    setSelectedFileList(updated)
    onFilesSelected(updated)
  }

  const removeFile = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const updated = selectedFileList.filter((_, i) => i !== idx)
    setSelectedFileList(updated)
    onFilesSelected(updated)
  }

  return (
    <div className={cn("w-full space-y-2 text-xs", className)}>
      <div
        onDragOver={e => {
          e.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={e => {
          e.preventDefault()
          setIsDragOver(false)
          handleFiles(e.dataTransfer.files)
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-colors duration-150 ease-apple text-center",
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-border/80 bg-card/60 hover:bg-card"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
        <div className="p-3 bg-muted rounded-full mb-2">
          <UploadCloud className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="font-semibold text-foreground">{label}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>
      </div>

      {selectedFileList.length > 0 && (
        <div className="space-y-1.5 pt-1">
          {selectedFileList.map((file, i) => (
            <div
              key={`${file.name}-${i}`}
              className="flex items-center justify-between p-2 rounded-xl bg-muted/40 border border-border/40 text-xs"
            >
              <div className="flex items-center gap-2 truncate">
                <File className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate font-medium">{file.name}</span>
                <span className="text-[10px] text-muted-foreground tabular-nums font-mono">
                  {(file.size / 1024).toFixed(0)} KB
                </span>
              </div>
              <button
                type="button"
                onClick={e => removeFile(i, e)}
                className="p-1 hover:text-destructive text-muted-foreground transition-colors"
                aria-label={`Remove ${file.name}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
