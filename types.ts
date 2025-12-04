
export interface Expression {
  id: string;
  name: string;
  imageUrl: string;
}

export interface Character {
  id: string;
  name: string;
  expressions: Expression[];
  aiPrompt?: string;
}

export interface Choice {
  text: string;
  nextSceneId: string;
}

export interface DialogueLine {
  characterId: string | null;
  expressionId: string | null;
  text: string;
}

export interface Scene {
  id: string;
  name: string;
  backgroundUrl: string;
  presentCharacterIds: string[];
  dialogue: DialogueLine[];
  choices: Choice[];
  aiPrompt?: string;
}

export interface VisualNovel {
  title: string;
  description: string; // 게임 개요
  coverUrl: string;    // 메인 타이틀 배경 이미지
  characters: Character[];
  scenes: Scene[];
  startSceneId: string;
}

export interface VisualNovelActions {
  updateTitle: (title: string) => void;
  updateDescription: (desc: string) => void;
  updateCoverUrl: (url: string) => void;
  updateStartSceneId: (id: string) => void;
  addCharacter: () => void;
  deleteCharacter: (id: string) => void;
  updateCharacterName: (id: string, name: string) => void;
  updateCharacterAiPrompt: (id: string, prompt: string) => void;
  updateCharacterExpressionUrl: (charId: string, exprId: string, url: string) => void;
  addScene: (newSceneId: string) => void;
  deleteScene: (id: string) => void;
  updateScene: (id: string, field: keyof Scene, value: any) => void;
  toggleCharacterInScene: (sceneId: string, charId: string, isPresent: boolean) => void;
  addDialogueLine: (sceneId: string) => void;
  updateDialogueLine: (sceneId: string, index: number, field: keyof DialogueLine, value: any) => void;
  deleteDialogueLine: (sceneId: string, index: number) => void;
  addChoice: (sceneId: string, nextSceneId: string) => void;
  updateChoice: (sceneId: string, index: number, field: keyof Choice, value: string) => void;
  deleteChoice: (sceneId: string, index: number) => void;
  updateCharacter: (updater: (draft: VisualNovel) => VisualNovel) => void;
}

export interface AiOperations {
  aiTheme: string;
  setAiTheme: (theme: string) => void;
  isGenerating: boolean;
  error: string | null;
  generatingExpressionsForCharId: string | null;
  isRemovingBgForExprId: string | null;
  isGeneratingBg: boolean;
  isGeneratingDialogue: boolean;
  handleGenerateStory: () => Promise<void>;
  handleGenerateDemoStory: () => Promise<void>;
  handleGenerateAllCharacterExpressions: (charId: string) => Promise<void>;
  handleRemoveBackground: (charId: string, exprId: string) => Promise<void>;
  handleGenerateSceneBackground: (sceneId: string, prompt: string) => Promise<void>;
  handleGenerateSceneDialogue: (sceneId: string, prompt: string, presentCharacterIds: string[]) => Promise<void>;
}
