"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Slider } from "@/components/ui/slider";
import { RotateCw } from "lucide-react";
import Image from "next/image";
import { mapArtwork } from "@/lib/api";

const MappingEditor = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const artworkUrl = searchParams.get("artworkUrl");
  const baseImageUrl = searchParams.get("baseImageUrl");
  const [isLoading, setIsLoading] = useState(false);
  console.log(artworkUrl, baseImageUrl);

  const [scale] = useState(1);
  const [rotation, setRotation] = useState(0);

  const uploadedArtworkUrl = artworkUrl;
  const finalBaseImageUrl = baseImageUrl;

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
                className="w-full h-full object-cover"
                width={500}
                height={500}
              />
              <Image
                src={uploadedArtworkUrl}
                alt="Artwork"
                width={500}
                height={500}
                className="absolute top-0 left-0 w-full h-full object-contain transition-transform duration-200"
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
