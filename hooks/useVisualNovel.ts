
import { useState, useEffect } from 'react';
import { VisualNovel, Character, Scene, Choice, DialogueLine, VisualNovelActions } from '../types';
import { DEMO_VN, LOCAL_STORAGE_KEY } from '../constants';

export const useVisualNovel = (): { vn: VisualNovel; setVisualNovel: (vn: VisualNovel) => void; actions: VisualNovelActions } => {
  const [vn, setVn] = useState<VisualNovel>(DEMO_VN);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        setVn(JSON.parse(savedData));
      }
    } catch (e) {
      console.error("로컬 스토리지에서 데이터를 불러오는 데 실패했습니다", e);
    }
  }, []);

  // Helper for immutable updates
  const updateVn = (updater: (draft: VisualNovel) => VisualNovel) => {
    setVn(prev => updater(JSON.parse(JSON.stringify(prev))));
  };

  const setVisualNovel = (newVn: VisualNovel) => setVn(newVn);

  const updateTitle = (title: string) => updateVn(draft => ({ ...draft, title }));

  const updateDescription = (desc: string) => updateVn(draft => ({ ...draft, description: desc }));

  const updateCoverUrl = (url: string) => updateVn(draft => ({ ...draft, coverUrl: url }));
  
  const updateStartSceneId = (id: string) => updateVn(draft => ({ ...draft, startSceneId: id }));

  const addCharacter = () => {
    const newId = `char_${Date.now()}`;
    const newCharacter: Character = { 
        id: newId, 
        name: '새 캐릭터', 
        expressions: [
            { id: `${newId}_expr_1`, name: '중립', imageUrl: '' },
            { id: `${newId}_expr_2`, name: '행복', imageUrl: '' },
            { id: `${newId}_expr_3`, name: '슬픔', imageUrl: '' },
            { id: `${newId}_expr_4`, name: '화남', imageUrl: '' },
        ],
        aiPrompt: '',
    };
    updateVn(draft => ({ ...draft, characters: [...draft.characters, newCharacter] }));
  };

  const deleteCharacter = (id: string) => {
    updateVn(draft => {
      draft.characters = draft.characters.filter(c => c.id !== id);
      draft.scenes.forEach(s => {
        s.presentCharacterIds = s.presentCharacterIds.filter(cid => cid !== id);
        s.dialogue.forEach(d => {
          if (d.characterId === id) {
              d.characterId = null;
              d.expressionId = null;
          }
        });
      });
      return draft;
    });
  };

  const updateCharacterName = (id: string, name: string) => {
    updateVn(draft => {
        const char = draft.characters.find(c => c.id === id);
        if (char) char.name = name;
        return draft;
    });
  };

  const updateCharacterAiPrompt = (id: string, prompt: string) => {
    updateVn(draft => {
        const char = draft.characters.find(c => c.id === id);
        if (char) char.aiPrompt = prompt;
        return draft;
    });
  };

  const updateCharacterExpressionUrl = (charId: string, exprId: string, url: string) => {
    updateVn(draft => {
        const char = draft.characters.find(c => c.id === charId);
        if (char) {
            const expr = char.expressions.find(e => e.id === exprId);
            if (expr) expr.imageUrl = url;
        }
        return draft;
    });
  };

  const addScene = (newSceneId: string) => {
      const newScene: Scene = { id: newSceneId, name: '새 장면', backgroundUrl: '', presentCharacterIds: [], dialogue: [{ characterId: null, expressionId: null, text: '새 대사...' }], choices: [], aiPrompt: '' };
      updateVn(draft => ({ ...draft, scenes: [...draft.scenes, newScene] }));
  };

  const deleteScene = (id: string) => {
    updateVn(draft => {
        draft.scenes = draft.scenes.filter(s => s.id !== id);
        draft.scenes.forEach(s => {
          s.choices = s.choices.filter(c => c.nextSceneId !== id);
        });
        return draft;
    });
  };

  const updateScene = (id: string, field: keyof Scene, value: any) => {
      updateVn(draft => ({
        ...draft,
        scenes: draft.scenes.map(s => s.id === id ? { ...s, [field]: value } : s),
      }));
  };

  const toggleCharacterInScene = (sceneId: string, charId: string, isPresent: boolean) => {
    updateVn(draft => {
        const scene = draft.scenes.find(s => s.id === sceneId);
        if (scene) {
            if (isPresent) {
                if (!scene.presentCharacterIds.includes(charId)) scene.presentCharacterIds.push(charId);
            } else {
                scene.presentCharacterIds = scene.presentCharacterIds.filter(id => id !== charId);
                scene.dialogue.forEach(line => {
                    if (line.characterId === charId) {
                        line.characterId = null; 
                        line.expressionId = null;
                    }
                });
            }
        }
        return draft;
    });
  };

  const addDialogueLine = (sceneId: string) => {
    updateVn(draft => {
      const scene = draft.scenes.find(s => s.id === sceneId);
      if (scene) scene.dialogue.push({ characterId: null, expressionId: null, text: '' });
      return draft;
    });
  };

  const updateDialogueLine = (sceneId: string, index: number, field: keyof DialogueLine, value: any) => {
    updateVn(draft => {
        const scene = draft.scenes.find(s => s.id === sceneId);
        if (scene) {
            const line = scene.dialogue[index];
            (line as any)[field] = value;
        }
        return draft;
    });
  };

  const deleteDialogueLine = (sceneId: string, index: number) => {
    updateVn(draft => {
        const scene = draft.scenes.find(s => s.id === sceneId);
        if (scene && scene.dialogue.length > 1) {
            scene.dialogue.splice(index, 1);
        }
        return draft;
    });
  };

  const addChoice = (sceneId: string, nextSceneId: string) => {
      const newChoice: Choice = { text: '새 선택지', nextSceneId };
      updateVn(draft => ({
        ...draft,
        scenes: draft.scenes.map(s => s.id === sceneId ? { ...s, choices: [...s.choices, newChoice] } : s),
      }));
  };

  const updateChoice = (sceneId: string, index: number, field: keyof Choice, value: string) => {
    updateVn(draft => ({
      ...draft,
      scenes: draft.scenes.map(s => {
        if (s.id === sceneId) s.choices[index] = { ...s.choices[index], [field]: value };
        return s;
      }),
    }));
  };

  const deleteChoice = (sceneId: string, index: number) => {
    updateVn(draft => {
      const scene = draft.scenes.find(s => s.id === sceneId);
      if (scene) scene.choices.splice(index, 1);
      return draft;
    });
  };

  const updateCharacter = (updater: (draft: VisualNovel) => VisualNovel) => {
    updateVn(updater);
  };

  return {
    vn,
    setVisualNovel,
    actions: {
        updateTitle,
        updateDescription,
        updateCoverUrl,
        updateStartSceneId,
        addCharacter,
        deleteCharacter,
        updateCharacterName,
        updateCharacterAiPrompt,
        updateCharacterExpressionUrl,
        addScene,
        deleteScene,
        updateScene,
        toggleCharacterInScene,
        addDialogueLine,
        updateDialogueLine,
        deleteDialogueLine,
        addChoice,
        updateChoice,
        deleteChoice,
        updateCharacter
    }
  };
};
