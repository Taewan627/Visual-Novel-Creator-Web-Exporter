import React, { useEffect } from 'react';

interface ImagePreviewModalProps {
  imageUrl: string | null;
  altText: string;
  onClose: () => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ imageUrl, altText, onClose }) => {
  // ESC 키로 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm cursor-zoom-out"
      onClick={onClose}
    >
      <div className="relative max-w-full max-h-full flex flex-col items-center">
        <img 
          src={imageUrl} 
          alt={altText} 
          className="max-w-[90vw] max-h-[85vh] object-contain rounded-md shadow-2xl border border-gray-700"
          onClick={(e) => e.stopPropagation()} // 이미지 클릭 시 닫기 방지
        />
        <div className="mt-4 flex gap-4">
             <button 
                className="px-4 py-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors border border-gray-600 font-medium"
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
            >
                닫기 (ESC)
            </button>
             <a 
                href={imageUrl} 
                download={`image_download.png`}
                onClick={(e) => e.stopPropagation()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-500 transition-colors font-medium flex items-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                </svg>
                다운로드
            </a>
        </div>
      </div>
    </div>
  );
};
