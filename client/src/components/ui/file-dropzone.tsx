import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Loader2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileDropzoneProps {
  onUploadComplete: (url: string) => void;
  accept?: Record<string, string[]>;
  className?: string;
  filePath?: string;
}

export function FileDropzone({ onUploadComplete, accept, className, filePath }: FileDropzoneProps) {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("file_location", filePath || "");

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const { url } = await response.json();
      onUploadComplete(url);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  }, [onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple: false
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors",
        isDragActive ? "border-primary bg-primary/10" : "border-border",
        className
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center gap-2 text-sm">
        {uploading ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          <>
            <Upload className="h-6 w-6" />
            <p className="text-center">
              {isDragActive
                ? "Drop the file here"
                : "Drag & drop an image here, or click to select"}
            </p>
          </>
        )}
      </div>
    </div>
  );
}