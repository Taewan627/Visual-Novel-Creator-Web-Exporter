
import React, { useState, ChangeEvent } from 'react';
import { Scene, VisualNovel, VisualNovelActions, AiOperations } from '../types';
import { TrashIcon, SparklesIcon, PlusIcon, PhotoIcon } from './icons';
import { ImagePreviewModal } from './ImagePreviewModal';
import { fileToBase64 } from '../utils/imageProcessing';

interface SceneEditorProps {
  selectedScene: Scene | undefined;
  vn: VisualNovel;
  actions: VisualNovelActions;
  aiOps: AiOperations;
}

export const SceneEditor: React.FC<SceneEditorProps> = ({
  selectedScene,
  vn,
  actions,
  aiOps,
}) => {
  const [previewImage, setPreviewImage] = useState<{ url: string, name: string } | null>(null);

  if (!selectedScene) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>왼쪽 패널에서 편집할 장면을 선택하세요.</p>
      </div>
    );
  }

  const handleBgUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const base64 = await fileToBase64(e.target.files[0]);
      actions.updateScene(selectedScene.id, 'backgroundUrl', base64);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-gray-700 pb-2">
        <h2 className="text-2xl font-bold text-white">장면 편집</h2>
        <button 
          onClick={() => actions.deleteScene(selectedScene.id)} 
          className="p-2 text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors rounded hover:bg-red-900/20"
        >
          <TrashIcon className="w-5 h-5"/> 삭제
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">장면 이름</label>
        <input 
          type="text" 
          value={selectedScene.name} 
          onChange={e => actions.updateScene(selectedScene.id, 'name', e.target.value)} 
          className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600 focus:outline-none focus:border-indigo-500" 
        />
      </div>

      <div className="bg-gray-800 p-4 rounded-lg border border-indigo-500/30">
          <h3 className="font-bold text-lg mb-2 flex items-center gap-2 text-white"><SparklesIcon className="w-5 h-5 text-yellow-400" /> AI 장면 어시스턴트</h3>
          <p className="text-sm text-gray-400 mb-3">이 장면에 대한 프롬프트를 제공하여 배경과 대화를 자동으로 생성하세요.</p>
          
          <div>
              <label htmlFor="ai-scene-prompt" className="block text-sm font-medium text-gray-300 mb-1">장면 프롬프트</label>
              <textarea
                  id="ai-scene-prompt"
                  rows={3}
                  value={selectedScene.aiPrompt || ''}
                  onChange={e => actions.updateScene(selectedScene.id, 'aiPrompt', e.target.value)}
                  placeholder="예: 미래적인 네온 불빛 바에서의 긴장감 넘치는 협상."
                  className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-indigo-500"
                  disabled={aiOps.isGeneratingBg || aiOps.isGeneratingDialogue}
              />
          </div>

          <div className="flex items-center gap-4 mt-3">
              <button
                  onClick={() => aiOps.handleGenerateSceneBackground(selectedScene.id, selectedScene.aiPrompt || '')}
                  disabled={!selectedScene.aiPrompt?.trim() || aiOps.isGeneratingBg || aiOps.isGeneratingDialogue}
                  className="flex-1 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                  <SparklesIcon className="w-5 h-5" />
                  {aiOps.isGeneratingBg ? '생성 중...' : '배경 생성하기'}
              </button>
              <button
                  onClick={() => aiOps.handleGenerateSceneDialogue(selectedScene.id, selectedScene.aiPrompt || '', selectedScene.presentCharacterIds)}
                  disabled={!selectedScene.aiPrompt?.trim() || aiOps.isGeneratingBg || aiOps.isGeneratingDialogue}
                  className="flex-1 p-2 bg-teal-600 hover:bg-teal-500 text-white rounded disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  title={selectedScene.presentCharacterIds.length === 0 ? "장면에 먼저 캐릭터를 추가하세요" : ""}
              >
                  <SparklesIcon className="w-5 h-5" />
                  {aiOps.isGeneratingDialogue ? '생성 중...' : '대화 생성하기'}
              </button>
          </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">배경 이미지</label>
        <div className="flex items-start gap-4">
            <div 
                className="w-48 aspect-video bg-gray-800 rounded flex-shrink-0 overflow-hidden border border-gray-600 group relative cursor-zoom-in"
                onClick={() => selectedScene.backgroundUrl && setPreviewImage({ url: selectedScene.backgroundUrl, name: selectedScene.name })}
                title={selectedScene.backgroundUrl ? "클릭하여 크게 보기" : "이미지가 없습니다"}
            >
                {selectedScene.backgroundUrl ? (
                  <>
                    <img 
                        src={selectedScene.backgroundUrl} 
                        alt="background" 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <div className="bg-black/50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            크게 보기
                        </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex flex-col items-center justify-center p-2 text-center opacity-70">
                        <PhotoIcon className="w-8 h-8 text-gray-500 mb-2" />
                        <span className='text-xs text-gray-400 leading-tight'>
                            환상적인 배경이<br/>이곳에 생성됩니다
                        </span>
                  </div>
                )}
            </div>
            <div className="flex-grow space-y-2">
                <input 
                  type="text" 
                  placeholder="배경 이미지 URL" 
                  value={selectedScene.backgroundUrl} 
                  onChange={e => actions.updateScene(selectedScene.id, 'backgroundUrl', e.target.value)} 
                  className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600 focus:outline-none focus:border-indigo-500" 
                />
                <input type="file" accept="image/*" onChange={handleBgUpload} className="w-full text-sm text-gray-400" />
            </div>
        </div>
      </div>

      <div>
        <label className="block mb-2 font-medium text-gray-300">등장 캐릭터</label>
        <div className="flex flex-wrap gap-x-4 gap-y-2 p-3 bg-gray-800 rounded border border-gray-600">
            {vn.characters.length > 0 ? vn.characters.map(char => (
            <label key={char.id} className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={selectedScene.presentCharacterIds.includes(char.id)}
                  onChange={e => actions.toggleCharacterInScene(selectedScene.id, char.id, e.target.checked)}
                  className="h-4 w-4 accent-indigo-500 bg-gray-700 border-gray-500 rounded focus:ring-indigo-500"
                />
                <span className="text-white">{char.name}</span>
            </label>
            )) : <p className="text-gray-500 text-sm">아직 생성된 캐릭터가 없습니다.</p>}
        </div>
      </div>

      <div className="bg-gray-800/50 p-1 rounded-lg">
        <div className="flex justify-between items-center mb-2 px-1">
            <h3 className="font-bold text-lg text-white">대화</h3>
            <button onClick={() => actions.addDialogueLine(selectedScene.id)} className="p-1 bg-green-600 hover:bg-green-500 text-white rounded transition-colors" title="대화 줄 추가"><PlusIcon className="w-5 h-5"/></button>
        </div>
        <div className="space-y-2">
          {selectedScene.dialogue.map((line, index) => {
               const speakingChar = vn.characters.find(c => c.id === line.characterId);
               return (
                <div key={index} className="flex items-start gap-2 bg-gray-800 p-3 rounded border border-gray-700 shadow-sm">
                    <div className="flex-shrink-0 flex flex-col gap-2 w-40">
                        <select 
                          value={line.characterId || ''} 
                          onChange={e => actions.updateDialogueLine(selectedScene.id, index, 'characterId', e.target.value || null)} 
                          className="w-full p-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                            <option value="">내레이터</option>
                            {vn.characters
                                .filter(c => selectedScene.presentCharacterIds.includes(c.id))
                                .map(char => <option key={char.id} value={char.id}>{char.name}</option>)
                            }
                        </select>
                        {speakingChar && (
                             <select 
                                value={line.expressionId || ''} 
                                onChange={e => actions.updateDialogueLine(selectedScene.id, index, 'expressionId', e.target.value || null)} 
                                className="w-full p-2 bg-gray-700 text-white rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                             >
                                <option value="">기본 표정</option>
                                {speakingChar.expressions.map(expr => <option key={expr.id} value={expr.id}>{expr.name}</option>)}
                            </select>
                        )}
                    </div>
                    <textarea 
                      value={line.text} 
                      onChange={e => actions.updateDialogueLine(selectedScene.id, index, 'text', e.target.value)} 
                      rows={3} 
                      className="flex-grow p-2 bg-gray-700 text-white rounded resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                      placeholder="대화 텍스트..."
                    />
                    <button onClick={() => actions.deleteDialogueLine(selectedScene.id, index)} className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded flex-shrink-0 transition-colors"><TrashIcon className="w-5 h-5"/></button>
                </div>
               )
          })}
        </div>
      </div>

      <div className="bg-gray-800/50 p-1 rounded-lg">
        <div className="flex justify-between items-center mb-2 px-1">
            <h3 className="font-bold text-lg text-white">선택지</h3>
            <button onClick={() => actions.addChoice(selectedScene.id, '')} className="p-1 bg-green-600 hover:bg-green-500 text-white rounded transition-colors"><PlusIcon className="w-5 h-5"/></button>
        </div>
        <div className="space-y-2">
          {selectedScene.choices.map((choice, index) => (
            <div key={index} className="flex items-center gap-2 bg-gray-800 p-3 rounded border border-gray-700">
              <input 
                type="text" 
                value={choice.text} 
                onChange={e => actions.updateChoice(selectedScene.id, index, 'text', e.target.value)} 
                className="flex-grow p-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                placeholder="선택지 텍스트" 
              />
              <span className="text-gray-400 font-bold">→</span>
              <select 
                value={choice.nextSceneId} 
                onChange={e => actions.updateChoice(selectedScene.id, index, 'nextSceneId', e.target.value)} 
                className="p-2 bg-gray-700 text-white rounded max-w-[150px] truncate focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {vn.scenes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <button onClick={() => actions.deleteChoice(selectedScene.id, index)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded transition-colors"><TrashIcon className="w-5 h-5"/></button>
            </div>
          ))}
          {selectedScene.choices.length === 0 && <p className="text-gray-500 text-center py-4 bg-gray-800 rounded italic">이것이 엔딩 장면입니다.</p>}
        </div>
      </div>

      <ImagePreviewModal 
        imageUrl={previewImage?.url || null} 
        altText={previewImage?.name || ''} 
        onClose={() => setPreviewImage(null)} 
      />
    </div>
  );
};
