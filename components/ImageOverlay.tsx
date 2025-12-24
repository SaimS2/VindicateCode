import React from 'react';

interface ImageOverlayProps {
  imageInfo: { url: string; label: string } | null;
}

const ImageOverlay: React.FC<ImageOverlayProps> = ({ imageInfo }) => {
  if (!imageInfo) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 animate-fade-in-fast pointer-events-none">
      <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg shadow-2xl max-w-3xl max-h-[90vh] flex flex-col pointer-events-auto">
        <img src={imageInfo.url} alt={imageInfo.label} className="max-w-full max-h-[75vh] object-contain rounded-md" />
        <p className="mt-2 text-center font-semibold text-slate-800 dark:text-slate-200">{imageInfo.label}</p>
        <p className="text-xs text-center text-slate-500 dark:text-slate-400">(Example imaging from stock source)</p>
      </div>
    </div>
  );
};

export default ImageOverlay;
