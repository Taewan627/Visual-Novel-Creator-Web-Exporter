
import React from 'react';
import { SaveIcon, DownloadIcon, UploadIcon, ResetIcon, PlayIcon, WebIcon } from './icons';

interface HeaderProps {
  onSave: () => void;
  onSaveToFile: () => void;
  onLoadFromFile: () => void;
  onExportToRenpy: () => void;
  onExportToHtml: () => void;
  onReset: () => void;
  onPlay: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSave,
  onSaveToFile,
  onLoadFromFile,
  onExportToRenpy,
  onExportToHtml,
  onReset,
  onPlay,
}) => {
  return (
    <header className="flex-shrink-0 bg-gray-900 p-2 flex items-center justify-between shadow-md z-10">
      <div className="flex flex-col md:flex-row md:items-baseline gap-0 md:gap-3 ml-1">
        <h1 className="text-xl font-bold text-white tracking-tight">VN-AI Studio</h1>
        <span className="text-xs text-gray-400 font-medium">Created by Tae-wan Kim</span>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onSave} className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors" title="브라우저 임시 저장 (쿠키)">
          <SaveIcon className="w-5 h-5" /> <span className="hidden sm:inline">임시 저장</span>
        </button>
        <button onClick={onSaveToFile} className="flex items-center gap-2 px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded transition-colors" title="모든 이미지와 데이터를 PC에 파일로 저장">
          <DownloadIcon className="w-5 h-5" /> <span className="hidden sm:inline">프로젝트 백업 (.json)</span>
        </button>
        <button onClick={onLoadFromFile} className="flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors" title="PC에 저장된 프로젝트 파일 열기">
          <UploadIcon className="w-5 h-5" /> <span className="hidden sm:inline">프로젝트 열기</span>
        </button>
        <div className="h-6 w-px bg-gray-700 mx-1"></div>
        <button onClick={onExportToHtml} className="flex items-center gap-2 px-3 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded transition-colors" title="웹 게임으로 내보내기 (.html)">
          <WebIcon className="w-5 h-5" /> <span className="hidden sm:inline">웹 게임 내보내기 (.html)</span>
        </button>
        <button onClick={onExportToRenpy} className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded transition-colors" title="Ren'Py 게임 엔진용 스크립트 내보내기">
          <DownloadIcon className="w-5 h-5" /> <span className="hidden sm:inline">Ren'Py</span>
        </button>
        <button onClick={onReset} className="flex items-center gap-2 px-3 py-2 bg-red-700 hover:bg-red-600 text-white rounded transition-colors" title="초기화">
          <ResetIcon className="w-5 h-5" />
        </button>
        <button onClick={onPlay} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded transition-colors ml-2">
          <PlayIcon className="w-5 h-5" /> 플레이
        </button>
      </div>
    </header>
  );
};
