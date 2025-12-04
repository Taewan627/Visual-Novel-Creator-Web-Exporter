
import React, { useMemo } from 'react';
import { VisualNovel, Scene } from '../types';
import { PlayIcon } from './icons';

interface SceneNodeProps {
  scene: Scene;
  vn: VisualNovel;
  selectedSceneId: string | null;
  onSelectScene: (sceneId: string) => void;
  onPlayFromScene: (sceneId: string) => void;
  visited: Set<string>;
  isFirstLevel?: boolean;
}

const SceneNode: React.FC<SceneNodeProps> = ({ scene, vn, selectedSceneId, onSelectScene, onPlayFromScene, visited, isFirstLevel = false }) => {
  const isSelected = scene.id === selectedSceneId;
  const isStart = scene.id === vn.startSceneId;

  if (visited.has(scene.id)) {
    return (
      <div className="flex items-center gap-2 pl-4 text-sm text-yellow-400 relative">
        {!isFirstLevel && <div className="absolute left-[-0.5rem] top-4 w-4 h-px bg-gray-500"></div>}
        <span>⮐</span>
        <span>반복: {scene.name}</span>
      </div>
    );
  }
  visited.add(scene.id);

  const childScenes = scene.choices
    .map(choice => ({
      choiceText: choice.text,
      scene: vn.scenes.find(s => s.id === choice.nextSceneId)
    }))
    .filter(item => item.scene);

  return (
    <div className="relative">
      {!isFirstLevel && <div className="absolute left-[-0.5rem] top-4 w-4 h-px bg-gray-500"></div>}
      <div
        onClick={() => onSelectScene(scene.id)}
        className={`group flex items-center justify-between gap-2 p-1.5 my-1 rounded cursor-pointer transition-colors ${isSelected ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'}`}
        role="button"
        aria-pressed={isSelected}
        tabIndex={0}
      >
        <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-lg flex-shrink-0" aria-hidden="true">{isStart ? '🏁' : '📄'}</span>
            <span className="font-medium truncate">{scene.name}</span>
        </div>
        
        <button
            onClick={(e) => {
                e.stopPropagation();
                onPlayFromScene(scene.id);
            }}
            className="p-1 text-green-400 hover:text-white hover:bg-green-600 rounded opacity-0 group-hover:opacity-100 transition-all"
            title="이 장면부터 플레이"
        >
            <PlayIcon className="w-4 h-4" />
        </button>
      </div>

      {childScenes.length > 0 && (
        <div className="pl-4 border-l-2 border-gray-600 ml-4">
          {childScenes.map(({ choiceText, scene }, index) => (
            <div key={scene!.id + index} className="relative pt-3">
                 <div className="absolute left-[-0.6rem] top-[-0.1rem] text-xs text-indigo-300 bg-gray-800 px-1 rounded truncate max-w-[90%]">
                    &quot;{choiceText}&quot;
                 </div>
                 <SceneNode
                    scene={scene!}
                    vn={vn}
                    selectedSceneId={selectedSceneId}
                    onSelectScene={onSelectScene}
                    onPlayFromScene={onPlayFromScene}
                    visited={new Set(visited)}
                 />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface SceneTreeProps { 
    vn: VisualNovel; 
    selectedSceneId: string | null; 
    onSelectScene: (id: string) => void;
    onPlayFromScene: (id: string) => void;
}

const SceneTree: React.FC<SceneTreeProps> = ({ vn, selectedSceneId, onSelectScene, onPlayFromScene }) => {
  // Memoize scene map and reachable set to avoid expensive recalculations on every render
  const { sceneMap, orphanScenes } = useMemo(() => {
    // Explicitly type the map entries as tuple to ensure Map<string, Scene> is inferred correctly
    const map = new Map<string, Scene>(vn.scenes.map(s => [s.id, s] as [string, Scene]));
    const reachable = new Set<string>();
    
    if (vn.startSceneId && map.has(vn.startSceneId)) {
      const queue: string[] = [vn.startSceneId];
      reachable.add(vn.startSceneId);
      let head = 0;
      while(head < queue.length) {
        const currentId = queue[head++];
        const scene = map.get(currentId);
        if(scene) {
          scene.choices.forEach(choice => {
            if (choice.nextSceneId && !reachable.has(choice.nextSceneId)) {
              reachable.add(choice.nextSceneId);
              queue.push(choice.nextSceneId);
            }
          });
        }
      }
    }

    const orphans = vn.scenes.filter(s => !reachable.has(s.id));
    return { sceneMap: map, orphanScenes: orphans };
  }, [vn.scenes, vn.startSceneId]);

  const startScene = sceneMap.get(vn.startSceneId);

  return (
    <div className="space-y-4">
      {startScene ? (
         <SceneNode
            scene={startScene}
            vn={vn}
            selectedSceneId={selectedSceneId}
            onSelectScene={onSelectScene}
            onPlayFromScene={onPlayFromScene}
            visited={new Set()}
            isFirstLevel={true}
          />
      ) : (
        <p className="text-red-400 p-2">오류: 시작 장면을 찾을 수 없습니다!</p>
      )}

      {orphanScenes.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-400 mt-6 mb-2 border-t border-gray-600 pt-4">연결되지 않은 장면</h3>
          <div className="space-y-1">
            {orphanScenes.map(scene => (
               <div
                  key={scene.id}
                  onClick={() => onSelectScene(scene.id)}
                  className={`group flex items-center justify-between gap-2 p-1.5 rounded cursor-pointer transition-colors ${selectedSceneId === scene.id ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                  role="button"
                  aria-pressed={selectedSceneId === scene.id}
                  tabIndex={0}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                      <span className="text-lg flex-shrink-0" aria-hidden="true">📄</span>
                      <span className="font-medium truncate">{scene.name}</span>
                  </div>
                  <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onPlayFromScene(scene.id);
                    }}
                    className="p-1 text-green-400 hover:text-white hover:bg-green-600 rounded opacity-0 group-hover:opacity-100 transition-all"
                    title="이 장면부터 플레이"
                  >
                    <PlayIcon className="w-4 h-4" />
                  </button>
                </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SceneTree;
