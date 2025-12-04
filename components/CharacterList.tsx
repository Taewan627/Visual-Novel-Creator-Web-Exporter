
import React, { useState, ChangeEvent } from 'react';
import { Character, VisualNovelActions, AiOperations } from '../types';
import { PlusIcon, TrashIcon, SparklesIcon, DownloadIcon, MagicWandIcon, UserIcon } from './icons';
import { ImagePreviewModal } from './ImagePreviewModal';
import { fileToBase64 } from '../utils/imageProcessing';

interface CharacterListProps {
  characters: Character[];
  actions: VisualNovelActions;
  aiOps: AiOperations;
}

export const CharacterList: React.FC<CharacterListProps> = ({
  characters,
  actions,
  aiOps,
}) => {
  const [activeExpressionTabs, setActiveExpressionTabs] = useState<Record<string, string>>({});
  const [previewImage, setPreviewImage] = useState<{ url: string, name: string } | null>(null);

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>, charId: string, expressionId: string) => {
    if (e.target.files && e.target.files[0]) {
      const base64 = await fileToBase64(e.target.files[0]);
      actions.updateCharacterExpressionUrl(charId, expressionId, base64);
    }
  };

  const handleDownload = (url: string, charName: string, exprName: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `${charName}_${exprName}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-bold text-lg text-white">캐릭터</h2>
        <button onClick={actions.addCharacter} className="p-1 bg-green-600 hover:bg-green-500 text-white rounded transition-colors"><PlusIcon className="w-5 h-5"/></button>
      </div>
      <div className="space-y-3">
        {characters.map(char => {
          const activeExpressionId = activeExpressionTabs[char.id] || char.expressions[0]?.id;
          const activeExpression = char.expressions.find(e => e.id === activeExpressionId);

          return (
            <div key={char.id} className="bg-gray-700 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <input 
                  type="text" 
                  placeholder="캐릭터 이름" 
                  value={char.name} 
                  onChange={e => actions.updateCharacterName(char.id, e.target.value)} 
                  className="w-full p-2 bg-gray-600 text-white rounded font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                />
                <button onClick={() => actions.deleteCharacter(char.id)} className="p-2 text-red-400 hover:text-red-300 flex-shrink-0 transition-colors"><TrashIcon className="w-5 h-5"/></button>
              </div>
              
              <div className="mb-2">
                <label className="text-xs text-gray-400 block mb-1">AI 생성 프롬프트</label>
                <textarea
                    placeholder="예: 푸른 눈의 전사, 은색 갑옷"
                    value={char.aiPrompt || ''}
                    onChange={e => actions.updateCharacterAiPrompt(char.id, e.target.value)}
                    className="w-full p-1.5 text-xs bg-gray-600 text-white rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    rows={2}
                />
              </div>

              <button
                onClick={() => aiOps.handleGenerateAllCharacterExpressions(char.id)}
                disabled={aiOps.generatingExpressionsForCharId === char.id}
                className="w-full mt-1 mb-3 p-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <SparklesIcon className="w-4 h-4" />
                {aiOps.generatingExpressionsForCharId === char.id ? '모든 표정 생성 중...' : 'AI로 모든 표정 생성'}
              </button>
              
              {/* Expression Tabs */}
              <div className="flex -mb-px overflow-x-auto scrollbar-hide">
                {char.expressions.map(expr => (
                  <button
                    key={expr.id}
                    onClick={() => setActiveExpressionTabs(prev => ({ ...prev, [char.id]: expr.id }))}
                    className={`px-3 py-2 text-sm font-medium rounded-t-md transition-colors whitespace-nowrap ${
                      activeExpressionId === expr.id 
                        ? 'bg-gray-600 text-white' 
                        : 'text-gray-400 hover:bg-gray-600/50 hover:text-white'
                    }`}
                  >
                    {expr.name}
                  </button>
                ))}
              </div>
              
              {/* Expression Content */}
              <div className="bg-gray-600 p-3 rounded-b-md rounded-tr-md">
                  {activeExpression && (
                    <div key={activeExpression.id}>
                      <div className="flex gap-3">
                        <div 
                            className="w-1/3 aspect-[2/3] bg-gray-800 rounded-sm flex items-center justify-center flex-shrink-0 relative overflow-hidden group border border-gray-500 cursor-zoom-in"
                            onClick={() => activeExpression.imageUrl && setPreviewImage({ url: activeExpression.imageUrl, name: `${char.name} - ${activeExpression.name}` })}
                            title={activeExpression.imageUrl ? "클릭하여 크게 보기" : "이미지가 없습니다"}
                        >
                          {aiOps.generatingExpressionsForCharId === char.id ? (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
                                    <span className="text-xs text-gray-400">생성 중...</span>
                                </div>
                          ) : activeExpression.imageUrl ? (
                                <>
                                    <img 
                                    src={activeExpression.imageUrl} 
                                    alt={`${char.name} ${activeExpression.name}`} 
                                    className="w-full h-full object-contain"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                        <div className="bg-black/50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                            크게 보기
                                        </div>
                                    </div>
                                </>
                          ) : (
                                <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex flex-col items-center justify-center p-2 text-center opacity-70">
                                    <UserIcon className="w-8 h-8 text-gray-500 mb-1" />
                                    <span className='text-[10px] text-gray-400 leading-tight'>
                                        멋진 캐릭터가<br/>AI로 생성됩니다
                                    </span>
                                </div>
                          )}
                        </div>
                        <div className="w-2/3 space-y-1 flex flex-col">
                          <div className="flex items-center justify-between">
                            <label className="text-xs text-gray-300">이미지 URL</label>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDownload(activeExpression.imageUrl, char.name, activeExpression.name)}
                                disabled={!activeExpression.imageUrl}
                                className="p-1 text-sky-300 hover:text-sky-200 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                                title="이미지 다운로드"
                              >
                                <DownloadIcon className="w-4 h-4" />
                              </button>
                              {aiOps.isRemovingBgForExprId === activeExpression.id ? (
                                <span className="text-xs animate-pulse text-yellow-300 p-1">제거 중...</span>
                              ) : (
                                <button
                                  onClick={() => aiOps.handleRemoveBackground(char.id, activeExpression.id)}
                                  disabled={!activeExpression.imageUrl}
                                  className="p-1 text-purple-300 hover:text-purple-200 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                                  title="배경 제거"
                                >
                                  <MagicWandIcon className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                          <input 
                            type="text" 
                            placeholder="이미지 URL" 
                            value={activeExpression.imageUrl} 
                            onChange={e => actions.updateCharacterExpressionUrl(char.id, activeExpression.id, e.target.value)} 
                            className="w-full p-1 text-xs bg-gray-500 text-white rounded focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                          />
                          <label className="text-xs text-gray-300 mt-2 block">이미지 업로드</label>
                          <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, char.id, activeExpression.id)} className="w-full text-xs text-gray-300" />
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          );
        })}
      </div>

      <ImagePreviewModal 
        imageUrl={previewImage?.url || null} 
        altText={previewImage?.name || ''} 
        onClose={() => setPreviewImage(null)} 
      />
    </div>
  );
};
