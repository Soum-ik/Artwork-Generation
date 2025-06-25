'use client';

import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { RotateCw, ZoomIn } from 'lucide-react';
import Image from 'next/image';

const MappingPage = () => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Placeholder for the uploaded image URL
  const uploadedArtworkUrl = 'https://placehold.co/400x400/0a0a0a/ffffff?text=Your+Artwork';
  // Placeholder for the base image URL
  const baseImageUrl = 'https://placehold.co/600x600/e0e0e0/000000?text=Base+Image';

  const handleRemap = () => {
    // TODO: Implement remap logic
    console.log({ scale, rotation });
  };

  return (
    <div className="container mx-auto px-4 py-32">
      <h1 className="text-4xl font-bold mb-4 text-center">Artwork Mapping</h1>
      <p className="text-foreground/80 mb-12 text-center">Adjust your artwork&apos;s scale and rotation.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Preview Section */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-4">Preview</h2>
          <div className="relative w-full aspect-square bg-gray-900 rounded-lg overflow-hidden">
            <Image src={baseImageUrl} alt="Base" className="w-full h-full object-cover" width={500} height={500} />
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

        {/* Controls Section */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-6">Controls</h2>
          <div className="space-y-8">
            <div>
              <label className="flex items-center gap-2 mb-3 text-lg">
                <ZoomIn className="w-6 h-6" />
                Scale
              </label>
              <Slider
                defaultValue={[1]}
                value={[scale]}
                onValueChange={(value: number[]) => setScale(value[0])}
                min={0.1}
                max={3}
                step={0.05}
              />
               <div className="text-right text-sm text-foreground/70 mt-1">{scale.toFixed(2)}x</div>
            </div>
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
              />
              <div className="text-right text-sm text-foreground/70 mt-1">{rotation.toFixed(0)}°</div>
            </div>
          </div>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleRemap}
              className="w-full bg-brand-primary text-brand-secondary font-bold py-3 px-6 rounded-full hover:scale-105 transition-transform"
            >
              Remap
            </button>
            <button
              className="w-full bg-gray-700 text-white font-bold py-3 px-6 rounded-full hover:scale-105 transition-transform"
            >
              Download Result
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MappingPage; 