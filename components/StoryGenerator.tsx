import React from 'react';
import { SparklesIcon } from './icons';

interface StoryGeneratorProps {
  aiTheme: string;
  setAiTheme: (theme: string) => void;
  onGenerateStory: () => void;
  onGenerateDemoStory: () => void;
  isGenerating: boolean;
  error: string | null;
}

export const StoryGenerator: React.FC<StoryGeneratorProps> = ({
  aiTheme,
  setAiTheme,
  onGenerateStory,
  onGenerateDemoStory,
  isGenerating,
  error,
}) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h2 className="font-bold mb-2 text-lg flex items-center gap-2 text-white">
        <SparklesIcon className="w-5 h-5 text-yellow-400" /> AI 스토리 생성기
      </h2>
      <p className="text-sm text-gray-400 mb-3">나만의 테마로 이야기를 만들거나, 즉시 완전한 데모 프로젝트를 생성하세요.</p>
      
      <label className="text-sm font-medium text-gray-300">당신의 테마</label>
      <input 
        type="text" 
        value={aiTheme} 
        onChange={e => setAiTheme(e.target.value)} 
        placeholder="예: '유령의 집 미스터리'" 
        className="w-full p-2 bg-gray-900 rounded border border-gray-600 mt-1 text-white focus:outline-none focus:border-indigo-500 transition-colors" 
        disabled={isGenerating}
      />
      <button 
        onClick={onGenerateStory} 
        disabled={isGenerating || !aiTheme.trim()} 
        className="w-full mt-2 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
      >
        테마로 생성하기
      </button>

      <div className="relative flex py-3 items-center">
          <div className="flex-grow border-t border-gray-600"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-xs">또는</span>
          <div className="flex-grow border-t border-gray-600"></div>
      </div>

      <button 
        onClick={onGenerateDemoStory} 
        disabled={isGenerating} 
        className="w-full p-2 bg-teal-600 hover:bg-teal-500 text-white rounded disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-semibold"
      >
        ✨ 데모 스토리 생성
      </button>
      
      {isGenerating && <p className="text-center text-yellow-400 text-sm mt-3 animate-pulse">스토리를 생성 중입니다... 잠시만 기다려 주세요.</p>}
      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
    </div>
  );
};