"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDropzone, FileRejection } from "react-dropzone";
import { UploadCloud, File as FileIcon, X } from "lucide-react";
import { Toaster, toast } from "sonner";
import { uploadArtwork } from "@/lib/api";

const UploadPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const onDrop = (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    if (rejectedFiles.length > 0) {
      toast.error("Only JPEG and PNG images up to 10MB are allowed.");
      return;
    }

    if (acceptedFiles[0]) {
      setFile(acceptedFiles[0]);
      toast.success("File uploaded successfully!");
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removeFile = () => {
    setFile(null);
  };

  const handleContinue = async () => {
    if (!file) {
      toast.error("Please upload a file first.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in to upload artwork.");
      router.push("/login");
      return;
    }

    setIsLoading(true);
    try {
      await uploadArtwork(file, token);
      toast.success("File uploaded successfully! Redirecting...");
      // TODO: Pass upload ID to mapping page
      router.push("/mapping");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(`Upload failed: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchUploads = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to upload artwork.");
        router.push("/login");
        return;
      }
    };

    fetchUploads();
  }, [router]);

  return (
    <>
      <Toaster richColors position="bottom-right" />
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="text-4xl font-bold mb-4">Upload Your Artwork</h1>
        <p className="text-foreground/80 mb-12">
          Drag and drop your file or browse to upload.
        </p>

        <div className="max-w-2xl mx-auto">
          {file ? (
            <div className="glass-card p-8 rounded-2xl flex flex-col items-center justify-center text-center">
              <FileIcon className="w-16 h-16 text-brand-primary mb-4" />
              <p className="font-semibold">{file.name}</p>
              <p className="text-sm text-foreground/70">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <button
                onClick={removeFile}
                className="mt-4 text-red-500 hover:text-red-400"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={`glass-card p-12 rounded-2xl border-2 border-dashed border-foreground/30 hover:border-brand-primary transition-colors cursor-pointer flex flex-col items-center justify-center text-center ${
                isDragActive ? "border-brand-primary" : ""
              }`}
            >
              <input {...getInputProps()} />
              <UploadCloud className="w-16 h-16 text-foreground/50 mb-4" />
              {isDragActive ? (
                <p className="text-lg font-semibold">Drop the files here ...</p>
              ) : (
                <p className="text-lg font-semibold">
                  Drag &apos;n&apos; drop some files here, or click to select
                  files
                </p>
              )}
              <p className="text-sm text-foreground/60 mt-2">
                JPEG/PNG, up to 10MB
              </p>
            </div>
          )}

          <button
            onClick={handleContinue}
            disabled={!file || isLoading}
            className="mt-8 bg-brand-primary text-brand-secondary font-bold py-3 px-8 rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Uploading..." : "Continue"}
          </button>
        </div>
      </div>
    </>
  );
};

export default UploadPage;
