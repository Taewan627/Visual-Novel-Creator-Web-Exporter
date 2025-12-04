
import React, { useState, useEffect } from 'react';
import { VisualNovel, Character, Expression, DialogueLine } from '../types';
import { PlayIcon, RefreshIcon } from './icons';

interface GamePlayerProps {
  vn: VisualNovel;
  currentSceneId: string;
  onChoice: (nextSceneId: string) => void;
  startFromTitle?: boolean;
}

// --- Sub-components ---

interface CharacterSpriteProps {
    character: Character;
    isSpeaking: boolean;
    expressionId: string | null;
    index: number;
    total: number;
}

const CharacterSprite: React.FC<CharacterSpriteProps> = ({ character, isSpeaking, expressionId, index, total }) => {
    let expressionToShow: Expression | undefined;
    
    // 1. Try to find the specific expression requested by the dialogue
    if (isSpeaking && expressionId) {
        expressionToShow = character.expressions.find(e => e.id === expressionId);
    }

    // 2. Fallback: Neutral or first available
    if (!expressionToShow) {
        expressionToShow = character.expressions.find(e => e.name === '중립') || character.expressions[0];
    }

    const imageUrl = expressionToShow?.imageUrl || '';

    // Calculate Positioning Style
    const style: React.CSSProperties = {
        bottom: 0,
        height: '85%',
        transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        filter: isSpeaking ? 'brightness(1)' : 'brightness(0.6)',
        transform: isSpeaking ? 'scale(1)' : 'scale(0.95)',
        zIndex: isSpeaking ? 10 : 5,
        position: 'absolute',
    };

    if (total <= 1) {
        style.left = '50%';
        style.transform += ' translateX(-50%)';
    } else {
        const percentage = (index / (total - 1)) * 70 + 15; // spread from 15% to 85%
        style.left = `${percentage}%`;
        style.transform += ' translateX(-50%)';
    }

    if (!imageUrl) return null;

    return (
        <div style={style}>
            <img 
                src={imageUrl} 
                alt={character.name}
                className="max-h-full max-w-none object-contain drop-shadow-[0_5px_15px_rgba(0,0,0,0.7)]"
            />
        </div>
    );
};

interface TitleScreenProps {
    vn: VisualNovel;
    bgUrl: string;
    onStart: () => void;
}

const TitleScreen: React.FC<TitleScreenProps> = ({ vn, bgUrl, onStart }) => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black relative text-white">
        <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: bgUrl ? `url(${bgUrl})` : 'none' }}
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
        </div>

        <div className="z-10 flex flex-col items-center gap-6 animate-fade-in p-8 max-w-4xl text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] tracking-tight leading-tight">
                {vn.title}
            </h1>
            
            {vn.description && (
                <p className="text-lg md:text-xl text-gray-200 leading-relaxed max-w-2xl drop-shadow-md">
                    {vn.description}
                </p>
            )}

            <div className="mt-8">
                <button 
                    onClick={onStart}
                    className="flex items-center gap-3 px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xl font-bold rounded-full transition-all hover:scale-105 shadow-[0_0_20px_rgba(79,70,229,0.5)] ring-2 ring-indigo-400/50"
                >
                    <PlayIcon className="w-8 h-8" />
                    GAME START
                </button>
            </div>
        </div>
    </div>
);

interface GameplayScreenProps {
    vn: VisualNovel;
    currentSceneId: string;
    onChoice: (nextSceneId: string) => void;
    onRestart: () => void;
}

const GameplayScreen: React.FC<GameplayScreenProps> = ({ vn, currentSceneId, onChoice, onRestart }) => {
    const [dialogueIndex, setDialogueIndex] = useState(0);
    const currentScene = vn.scenes.find(s => s.id === currentSceneId);

    // Reset dialogue when scene changes
    useEffect(() => {
        setDialogueIndex(0);
    }, [currentSceneId]);

    if (!currentScene) {
        return (
            <div className="flex-grow flex items-center justify-center bg-gray-900 text-white p-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-500">오류!</h2>
                    <p className="mt-2">ID가 "{currentSceneId}"인 장면을 찾을 수 없습니다.</p>
                </div>
            </div>
        );
    }

    const currentDialogueLine = currentScene.dialogue[dialogueIndex];
    
    // Safety check: if scene switched but index not reset yet
    if (!currentDialogueLine) return null;

    const isLastDialogue = dialogueIndex >= currentScene.dialogue.length - 1;

    const handleAdvance = () => {
        if (!isLastDialogue) {
            setDialogueIndex(prev => prev + 1);
        }
    };
    
    const speakingCharacterId = currentDialogueLine?.characterId;
    const speakingCharacterName = speakingCharacterId 
        ? vn.characters.find(c => c.id === speakingCharacterId)?.name 
        : null;

    const presentCharacters = currentScene.presentCharacterIds
        .map(id => vn.characters.find(c => c.id === id))
        .filter((c): c is Character => c !== undefined);

    return (
        <div className="w-full h-full flex flex-col bg-black relative text-white cursor-pointer" onClick={handleAdvance}>
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
                style={{ backgroundImage: `url(${currentScene.backgroundUrl})` }}
            >
                <div className="absolute inset-0 bg-black/20"></div>
            </div>

            {/* Character Sprites */}
            <div className="absolute inset-0 overflow-hidden">
                {presentCharacters.map((char, index) => (
                    <CharacterSprite
                        key={char.id}
                        character={char}
                        isSpeaking={char.id === speakingCharacterId}
                        expressionId={currentDialogueLine?.expressionId}
                        index={index}
                        total={presentCharacters.length}
                    />
                ))}
            </div>

            {/* Dialogue Box */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 bg-black/70 backdrop-blur-sm m-4 rounded-xl border border-gray-700 cursor-default z-20">
                {speakingCharacterName && (
                    <div className="absolute -top-8 left-8 bg-gray-800 text-white px-6 py-2 rounded-t-lg border-t border-l border-r border-gray-600 text-xl font-bold">
                        {speakingCharacterName}
                    </div>
                )}
                <p className={`text-lg md:text-xl leading-relaxed ${!speakingCharacterName ? 'pt-2' : ''}`}>
                    {currentDialogueLine?.text || ''}
                </p>
                
                {/* Choices */}
                {isLastDialogue && currentScene.choices.length > 0 && (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentScene.choices.map((choice, index) => (
                            <button
                                key={index}
                                onClick={(e) => {
                                    e.stopPropagation(); // prevent advancing dialogue
                                    onChoice(choice.nextSceneId);
                                }}
                                className="w-full text-left p-4 bg-indigo-600/50 hover:bg-indigo-500 border border-indigo-400 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer"
                            >
                                {choice.text}
                            </button>
                        ))}
                    </div>
                )}
                
                {/* Ending / Restart */}
                {isLastDialogue && currentScene.choices.length === 0 && (
                    <div className="mt-6 flex flex-col items-center">
                        <div className="text-gray-400 mb-4">~ 끝 ~</div>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                onRestart();
                            }}
                            className="flex items-center gap-2 px-6 py-3 bg-white text-black hover:bg-gray-200 rounded-full font-bold transition-colors"
                        >
                            <RefreshIcon className="w-5 h-5" />
                            처음으로 돌아가기
                        </button>
                    </div>
                )}
                
                {/* Continue Indicator */}
                {!isLastDialogue && (
                    <div className="absolute bottom-2 right-4 text-white animate-pulse">▼</div>
                )}
            </div>
        </div>
    );
};

// --- Main Component ---

const GamePlayer: React.FC<GamePlayerProps> = ({ vn, currentSceneId, onChoice, startFromTitle = true }) => {
  // If startFromTitle is false, we start directly in 'playing' mode
  const [gameState, setGameState] = useState<'title' | 'playing'>(startFromTitle ? 'title' : 'playing');

  const startScene = vn.scenes.find(s => s.id === vn.startSceneId);

  const handleStartGame = () => {
    onChoice(vn.startSceneId); 
    setGameState('playing');
  };
  
  const handleRestart = () => {
      setGameState('title');
  };

  if (gameState === 'title') {
      const bgUrl = vn.coverUrl || startScene?.backgroundUrl || '';
      return <TitleScreen vn={vn} bgUrl={bgUrl} onStart={handleStartGame} />;
  }
  
  return (
      <GameplayScreen 
          vn={vn} 
          currentSceneId={currentSceneId} 
          onChoice={onChoice} 
          onRestart={handleRestart} 
      />
  );
};

export default GamePlayer;
