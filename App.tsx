
import React, { useState, useEffect, ChangeEvent } from 'react';
import GamePlayer from './components/GamePlayer';
import SceneTree from './components/SceneTree';
import { Header } from './components/Header';
import { StoryGenerator } from './components/StoryGenerator';
import { CharacterList } from './components/CharacterList';
import { SceneEditor } from './components/SceneEditor';
import { PlusIcon, PhotoIcon } from './components/icons';
import { useVisualNovel } from './hooks/useVisualNovel';
import { useAiOperations } from './hooks/useAiOperations';
import { useFileIO } from './hooks/useFileIO';
import { fileToBase64 } from './utils/imageProcessing';

const App: React.FC = () => {
  const { vn, setVisualNovel, actions } = useVisualNovel();
  const [mode, setMode] = useState<'edit' | 'play'>('edit');
  const [currentSceneId, setCurrentSceneId] = useState<string>('');
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [startFromTitle, setStartFromTitle] = useState(true);
  
  // Initialize selection when VN loads
  useEffect(() => {
    if (vn && !selectedSceneId) {
        setSelectedSceneId(vn.startSceneId);
    }
    if (vn && !currentSceneId) {
        setCurrentSceneId(vn.startSceneId);
    }
  }, [vn, selectedSceneId, currentSceneId]);

  // AI Operations Hook
  const aiOps = useAiOperations(vn, actions, setVisualNovel, setSelectedSceneId);

  // File I/O Hook
  const fileIO = useFileIO({ vn, setVisualNovel, setSelectedSceneId });

  const handlePlayFromScene = (sceneId: string) => {
    setStartFromTitle(false); // Skip title screen
    setCurrentSceneId(sceneId);
    setMode('play');
  };

  const handleMainPlay = () => {
      setStartFromTitle(true); // Show title screen
      setCurrentSceneId(vn.startSceneId); 
      setMode('play');
  };

  const handleCoverUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const base64 = await fileToBase64(e.target.files[0]);
      actions.updateCoverUrl(base64);
    }
  };

  // --- Render ---

  if (mode === 'play') {
    const handlePlayerChoice = (nextSceneId: string) => setCurrentSceneId(nextSceneId);
    return (
      <div className="w-screen h-screen bg-black relative">
        <GamePlayer 
            vn={vn} 
            currentSceneId={currentSceneId} 
            onChoice={handlePlayerChoice} 
            startFromTitle={startFromTitle}
        />
        <button
          onClick={() => setMode('edit')}
          className="absolute top-4 right-4 z-50 flex items-center p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors"
          title="에디터로 돌아가기"
        >
          <div className="w-6 h-6 flex items-center justify-center">✏️</div>
        </button>
      </div>
    );
  }

  // Find currently selected scene object
  const selectedScene = vn.scenes.find(s => s.id === selectedSceneId);

  return (
    <div className="w-screen h-screen bg-gray-800 text-white flex flex-col font-sans overflow-hidden">
      <input
        type="file"
        ref={fileIO.fileInputRef}
        onChange={fileIO.handleFileSelected}
        accept=".json"
        className="hidden"
      />
      
      <Header 
        onSave={fileIO.handleSaveToLocalStorage}
        onSaveToFile={fileIO.handleSaveToFile}
        onLoadFromFile={fileIO.handleLoadFromFileClick}
        onExportToRenpy={fileIO.handleExportToRenpy}
        onExportToHtml={fileIO.handleExportToHtml}
        onReset={fileIO.handleReset}
        onPlay={handleMainPlay}
      />

      <div className="flex flex-grow overflow-hidden">
        {/* Left Panel: Characters & Story Gen */}
        <aside className="w-4/12 bg-gray-700 p-4 overflow-y-auto flex flex-col gap-4">
          <StoryGenerator 
            aiTheme={aiOps.aiTheme}
            setAiTheme={aiOps.setAiTheme}
            onGenerateStory={aiOps.handleGenerateStory}
            onGenerateDemoStory={aiOps.handleGenerateDemoStory}
            isGenerating={aiOps.isGenerating}
            error={aiOps.error}
          />

          {/* Game Settings */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="font-bold mb-2 text-white">게임 설정</h2>
            <div className="space-y-3">
                <div>
                    <label className="text-gray-300 text-sm block mb-1">제목</label>
                    <input 
                        type="text" 
                        value={vn.title} 
                        onChange={e => actions.updateTitle(e.target.value)} 
                        className="w-full p-2 bg-gray-900 text-white rounded border border-gray-600 focus:outline-none focus:border-indigo-500" 
                    />
                </div>
                <div>
                     <label className="text-gray-300 text-sm block mb-1">게임 개요 (메인 화면용)</label>
                     <textarea
                        value={vn.description || ''}
                        onChange={e => actions.updateDescription(e.target.value)}
                        placeholder="게임에 대한 간단한 소개를 적어주세요."
                        rows={3}
                        className="w-full p-2 bg-gray-900 text-white rounded border border-gray-600 focus:outline-none focus:border-indigo-500 resize-none text-sm"
                     />
                </div>
                <div>
                    <label className="text-gray-300 text-sm block mb-1">메인 배경 이미지</label>
                    <div className="flex items-center gap-3">
                         <div className="w-16 h-10 bg-gray-900 rounded overflow-hidden flex-shrink-0 border border-gray-600">
                             {vn.coverUrl ? (
                                 <img src={vn.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                             ) : (
                                 <div className="w-full h-full flex items-center justify-center text-gray-600"><PhotoIcon className="w-5 h-5"/></div>
                             )}
                         </div>
                         <div className="flex-grow relative">
                             <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleCoverUpload}
                                className="w-full text-xs text-gray-400 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gray-600 file:text-white hover:file:bg-gray-500"
                             />
                         </div>
                    </div>
                </div>
                <div>
                    <label className="mt-2 block text-gray-300 text-sm">시작 장면</label>
                    <select 
                        value={vn.startSceneId} 
                        onChange={e => actions.updateStartSceneId(e.target.value)} 
                        className="w-full p-2 bg-gray-900 text-white rounded border border-gray-600 focus:outline-none focus:border-indigo-500"
                    >
                        {vn.scenes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
            </div>
          </div>

          <CharacterList 
            characters={vn.characters}
            actions={actions}
            aiOps={aiOps}
          />
        </aside>

        {/* Middle Panel: Scene Tree */}
        <div className="w-3/12 bg-gray-800 p-4 overflow-y-auto border-l border-r border-gray-600">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-bold text-lg text-white">장면 구조</h2>
              <button 
                onClick={() => {
                  const newId = `scene_${Date.now()}`;
                  actions.addScene(newId);
                  setSelectedSceneId(newId);
                }} 
                className="p-1 bg-green-600 hover:bg-green-500 text-white rounded transition-colors" 
                title="새 장면 추가"
              >
                <PlusIcon className="w-5 h-5"/>
              </button>
            </div>
             <SceneTree 
                vn={vn} 
                selectedSceneId={selectedSceneId} 
                onSelectScene={setSelectedSceneId}
                onPlayFromScene={handlePlayFromScene} 
             />
        </div>

        {/* Right Panel: Scene Editor */}
        <main className="w-5/12 bg-gray-900 p-4 overflow-y-auto">
          <SceneEditor 
            selectedScene={selectedScene}
            vn={vn}
            actions={actions}
            aiOps={aiOps}
          />
        </main>
      </div>
    </div>
  );
};

export default App;
