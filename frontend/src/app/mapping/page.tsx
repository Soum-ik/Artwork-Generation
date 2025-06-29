"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Slider } from "@/components/ui/slider";
import { Eye, RotateCw, X } from "lucide-react";
import Image from "next/image";
import { mapArtwork } from "@/lib/api";
import { Toaster, toast } from "sonner";

const MappingEditor = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const artworkUrl = searchParams.get("artworkUrl");
  const baseImageUrl = searchParams.get("baseImageUrl");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState("");
  const [modalImageAlt, setModalImageAlt] = useState("");
  console.log(artworkUrl, baseImageUrl);

  console.log(modalImageSrc, modalImageAlt);

  const [scale] = useState(1);
  const [rotation, setRotation] = useState(0);

  const uploadedArtworkUrl = artworkUrl;
  const finalBaseImageUrl = baseImageUrl;

  const openModal = (src: string, alt: string) => {
    setModalImageSrc(src);
    setModalImageAlt(alt);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalImageSrc("");
    setModalImageAlt("");
  };

  const handleRemap = async () => {
    if (!artworkUrl || !baseImageUrl) {
      alert("Artwork or base image URL is missing.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await mapArtwork(
        artworkUrl,
        baseImageUrl,
        scale,
        rotation
      );
      console.log(response);
      const mappedImageUrl = response?.s3Url;
      toast.success("Processing successfully done");
      router.push(`/viewer?textureUrl=${encodeURIComponent(mappedImageUrl)}`);
    } catch (error) {
      console.error("Remap error:", error);
      alert(
        `An error occurred: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster richColors position="bottom-right" />
      <div className="container mx-auto px-4 py-32">
        <h1 className="text-4xl font-bold mb-4 text-center">Artwork Mapping</h1>
        <p className="text-foreground/80 mb-12 text-center">
          Adjust your artwork&apos;s scale and rotation.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Preview Section */}
          {finalBaseImageUrl && uploadedArtworkUrl ? (
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-2xl font-bold mb-4">Preview</h2>
              <div className="relative w-full aspect-square bg-gray-900 rounded-lg overflow-hidden">
                <Image
                  src={finalBaseImageUrl}
                  alt="Base"
                  className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  width={500}
                  height={500}
                  onClick={() => openModal(finalBaseImageUrl, "Base Image")}
                />
                <Image
                  src={uploadedArtworkUrl}
                  alt="Artwork"
                  width={500}
                  height={500}
                  className="absolute top-0 left-0 w-full h-full object-contain transition-transform duration-200 cursor-pointer hover:opacity-90"
                  style={{
                    transform: `scale(${scale}) rotate(${rotation}deg)`,
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-2xl font-bold mb-4">Preview</h2>
              <div className="flex items-center justify-center w-full aspect-square bg-gray-900 rounded-lg">
                <div className="text-center">
                  <p className="text-foreground/70">Loading preview...</p>
                </div>
              </div>
            </div>
          )}

          {/* Controls Section */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex gap-4 mb-6 ">
              <button
                onClick={() => openModal(finalBaseImageUrl!, "Base Image")}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100/10 transition-colors"
              >
                <Eye className="w-5 h-5" />
                <span className="font-medium">Preview base image</span>
              </button>
              <button
                onClick={() => openModal(uploadedArtworkUrl!, "Artwork")} 
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100/10 transition-colors"
              >
                <Eye className="w-5 h-5" />
                <span className="font-medium">Preview artwork image</span>
              </button>
            </div>

            <h2 className="text-2xl font-bold mb-6">Controls</h2>
            <div className="space-y-8">
              <div>
                <label className="flex items-center gap-2 mb-3 text-lg">
                  <RotateCw className="w-6 h-6" />
                  Rotation
                </label>
                <Slider
                  defaultValue={[0]}
                  value={[rotation]}
                  onValueChange={(value: number[]) => setRotation(value[0])}
                  min={-180}
                  max={180}
                  step={1}
                  className="w-full bg-amber-50"
                />
                <div className="text-right text-sm text-foreground/70 mt-1">
                  {rotation.toFixed(0)}°
                </div>
              </div>
            </div>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleRemap}
                disabled={isLoading}
                className="w-full bg-brand-primary text-brand-secondary font-bold py-3 px-6 rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Processing..." : "Remap"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[10000000] p-4"
          onClick={closeModal}
        >
          <div className="relative max-w-2xl max-h-[70%] w-full h-full flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-1 right-1 z-10 bg-white bg-opacity-20 hover:bg-opacity-30 text-black p-2 rounded-full transition-all duration-200 backdrop-blur-sm"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Modal Image */}
            <div
              className="relative w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={modalImageSrc}
                alt={modalImageAlt}
                width={1200}
                height={1200}
                className="max-w-full max-h-full object-contain rounded-lg"
                // priority
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const MappingPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MappingEditor />
    </Suspense>
  );
};

export default MappingPage;
