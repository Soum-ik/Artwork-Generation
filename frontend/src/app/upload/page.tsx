"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDropzone, FileRejection } from "react-dropzone";
import { UploadCloud, File as FileIcon, X } from "lucide-react";
import { Toaster, toast } from "sonner";
import { uploadArtwork } from "@/lib/api";

interface LoadingStage {
  message: string;
  description: string;
}

const loadingStages: LoadingStage[] = [
  {
    message: "Uploading your artwork...",
    description: "Securely storing your image to cloud storage",
  },
  {
    message: "Generating base texture...",
    description:
      "AI is creating realistic paper texture (this may take 8-10 seconds)",
  },
  {
    message: "Processing final image...",
    description: "Optimizing and preparing your artwork for mapping",
  },
  {
    message: "Almost done...",
    description: "Finalizing everything for the mapping interface",
  },
];

const UploadPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("");

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
    setLoadingStage(0);
    setLoadingMessage(loadingStages[0].message);

    // Start progressive loading stages
    const stageTimer = setInterval(() => {
      setLoadingStage((prev) => {
        const nextStage = prev + 1;
        if (nextStage < loadingStages.length) {
          setLoadingMessage(loadingStages[nextStage].message);
          return nextStage;
        }
        return prev;
      });
    }, 3500); // Change stage every 3.5 seconds

    try {
      const response = await uploadArtwork(file, token);
      clearInterval(stageTimer);

      toast.success("File uploaded successfully! Redirecting...");

      const { artworkUrl, baseImageUrl } = response.upload;
      router.push(
        `/mapping?artworkUrl=${encodeURIComponent(
          artworkUrl
        )}&baseImageUrl=${encodeURIComponent(baseImageUrl)}`
      );
    } catch (error) {
      clearInterval(stageTimer);

      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(`Upload failed: ${message}`);
    } finally {
      setIsLoading(false);
      setLoadingStage(0);
      setLoadingMessage("");
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

          {isLoading && (
            <div className=" mt-4">
              <div className="flex items-center justify-center space-x-4">
                {/* <Loader2 className="w-6 h-6 animate-spin text-brand-primary" /> */}
                <div className="text-center">
                  <p className="font-semibold text-lg">
                    {loadingMessage || loadingStages[0].message}
                  </p>
                  <p className="text-sm text-foreground/70">
                    {loadingStages[loadingStage]?.description}
                  </p>
                  <div className="mt-2 w-48 bg-foreground/20 rounded-full h-2">
                    <div
                      className="bg-brand-primary h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${
                          ((loadingStage + 1) / loadingStages.length) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleContinue}
            disabled={!file || isLoading}
            className={`mt-8 bg-brand-primary text-brand-secondary font-bold py-3 px-8 rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed ${
              isLoading ? "hidden" : ""
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    </>
  );
};

export default UploadPage;
