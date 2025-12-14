
import { VisualNovel } from '../types';

const toRenpyId = (str: string) => str.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();

const WEB_GAME_STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap');
    body { font-family: 'Noto Sans KR', sans-serif; background-color: black; color: white; overflow: hidden; }
    .character-sprite {
        position: absolute;
        bottom: 0;
        height: 85%;
        transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        max-width: none;
        object-fit: contain;
        filter: drop-shadow(0 5px 15px rgba(0,0,0,0.7));
    }
    .dialogue-box {
        background-color: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(4px);
    }
    .choice-btn {
        width: 100%;
        text-align: left;
        padding: 1rem;
        background-color: rgba(79, 70, 229, 0.5);
        border: 1px solid rgb(129, 140, 248);
        border-radius: 0.5rem;
        transition: all 0.3s;
        cursor: pointer;
    }
    .choice-btn:hover { background-color: rgba(99, 102, 241, 1); }
    .title-screen-btn {
        background-color: rgb(79, 70, 229);
        color: white;
        padding: 1rem 3rem;
        border-radius: 9999px;
        font-size: 1.25rem;
        font-weight: 700;
        transition: transform 0.2s;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }
    .title-screen-btn:hover { transform: scale(1.05); background-color: rgb(67, 56, 202); }
    .hidden { display: none !important; }
    .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
`;

const WEB_GAME_SCRIPT = `
    // Game State
    let currentSceneId = vn.startSceneId;
    let dialogueIndex = 0;

    // DOM Elements
    const titleScreen = document.getElementById('title-screen');
    const gameUi = document.getElementById('game-ui');
    const bgEl = document.getElementById('background');
    const charsContainer = document.getElementById('characters-container');
    const speakerNameEl = document.getElementById('speaker-name');
    const dialogueTextEl = document.getElementById('dialogue-text');
    const choicesContainer = document.getElementById('choices-container');
    const continueIndicator = document.getElementById('continue-indicator');

    function startGame() {
        titleScreen.style.display = 'none';
        gameUi.classList.remove('hidden');
        currentSceneId = vn.startSceneId;
        dialogueIndex = 0;
        render();
    }
    
    function resetGame() {
        titleScreen.style.display = 'flex';
        gameUi.classList.add('hidden');
        currentSceneId = vn.startSceneId;
        dialogueIndex = 0;
    }

    function render() {
        const scene = vn.scenes.find(s => s.id === currentSceneId);
        if (!scene) return alert('오류: 장면을 찾을 수 없습니다.');

        // Background
        bgEl.style.backgroundImage = scene.backgroundUrl ? "url('" + scene.backgroundUrl + "')" : 'none';
        if (!scene.backgroundUrl) bgEl.style.backgroundColor = '#1f2937';

        const line = scene.dialogue[dialogueIndex];
        const isLast = dialogueIndex >= scene.dialogue.length - 1;

        // Characters
        charsContainer.innerHTML = '';
        const presentChars = scene.presentCharacterIds.map(id => vn.characters.find(c => c.id === id)).filter(Boolean);
        
        presentChars.forEach((char, index) => {
            const isSpeaking = line.characterId === char.id;
            let expr = null;
            if (isSpeaking && line.expressionId) expr = char.expressions.find(e => e.id === line.expressionId);
            if (!expr) expr = char.expressions.find(e => e.name === '중립') || char.expressions[0];

            if (expr && expr.imageUrl) {
                const img = document.createElement('img');
                img.src = expr.imageUrl;
                img.className = 'character-sprite';
                img.onerror = function() { this.style.display = 'none'; }; // Hide if broken
                
                // Style positioning
                const total = presentChars.length;
                let left = '50%';
                if (total > 1) {
                        left = ((index / (total - 1)) * 70 + 15) + '%';
                }
                img.style.left = left;
                img.style.transform = isSpeaking ? 'translateX(-50%) scale(1)' : 'translateX(-50%) scale(0.95)';
                img.style.filter = isSpeaking ? 'brightness(1)' : 'brightness(0.6)';
                img.style.zIndex = isSpeaking ? 10 : 5;
                
                charsContainer.appendChild(img);
            }
        });

        // Dialogue
        const speaker = vn.characters.find(c => c.id === line.characterId);
        if (speaker) {
            speakerNameEl.textContent = speaker.name;
            speakerNameEl.classList.remove('hidden');
            dialogueTextEl.classList.remove('pt-2');
        } else {
            speakerNameEl.classList.add('hidden');
            dialogueTextEl.classList.add('pt-2');
        }
        dialogueTextEl.textContent = line.text;

        // Choices & Continue
        choicesContainer.innerHTML = '';
        choicesContainer.classList.add('hidden');
        continueIndicator.classList.add('hidden');

        if (isLast) {
            if (scene.choices.length > 0) {
                choicesContainer.classList.remove('hidden');
                scene.choices.forEach(choice => {
                    const btn = document.createElement('button');
                    btn.className = 'choice-btn';
                    btn.textContent = choice.text;
                    btn.onclick = (e) => {
                        e.stopPropagation();
                        currentSceneId = choice.nextSceneId;
                        dialogueIndex = 0;
                        render();
                    };
                    choicesContainer.appendChild(btn);
                });
            } else {
                // Ending - Show Restart Button
                choicesContainer.classList.remove('hidden');
                choicesContainer.className = "mt-6 flex flex-col items-center";
                
                const endMsg = document.createElement('div');
                endMsg.className = 'text-gray-400 mb-4';
                endMsg.textContent = "~ 끝 ~";
                
                const restartBtn = document.createElement('button');
                restartBtn.className = "flex items-center gap-2 px-6 py-3 bg-white text-black hover:bg-gray-200 rounded-full font-bold transition-colors";
                restartBtn.innerHTML = '↺ 처음으로 돌아가기';
                restartBtn.onclick = (e) => {
                        e.stopPropagation();
                        resetGame();
                };
                
                choicesContainer.appendChild(endMsg);
                choicesContainer.appendChild(restartBtn);
            }
        } else {
            continueIndicator.classList.remove('hidden');
        }
    }

    function handleScreenClick() {
        const scene = vn.scenes.find(s => s.id === currentSceneId);
        if (!scene) return;
        
        // If showing choices or ending, disable click-to-advance
        if (dialogueIndex >= scene.dialogue.length - 1) return;

        dialogueIndex++;
        render();
    };
`;

export function exportToRenpy(vn: VisualNovel): string {
  // ... (RenPy export logic remains same as previous but kept for consistency)
  let script = `# Ren'Py script generated by Visual Novel Creator\n`;
  script += `# Documentation: https://www.renpy.org/doc/html/\n\n`;

  // 1. Image Definitions
  script += `## 1. Image Definitions\n`;
  vn.characters.forEach(char => {
    const charTag = toRenpyId(char.id);
    char.expressions.forEach(expr => {
      const exprTag = toRenpyId(expr.name);
      const fileName = `${charTag}_${exprTag}.png`;
      script += `image ${charTag} ${exprTag} = "images/characters/${fileName}"\n`;
    });
    script += `\n`;
  });

  vn.scenes.forEach(scene => {
    const bgTag = toRenpyId(`bg_${scene.id}`);
    const fileName = `${bgTag}.jpg`;
    script += `image ${bgTag} = "images/backgrounds/${fileName}"\n`;
  });
  script += `\n`;

  // 2. Character Definitions
  script += `## 2. Character Definitions\n`;
  vn.characters.forEach(char => {
    const charVar = toRenpyId(char.id);
    const charName = char.name.replace(/'/g, "\\'");
    script += `define ${charVar} = Character('${charName}')\n`;
  });
  script += `\n`;

  // 3. Game Script
  script += `## 3. The game script\n`;
  script += `label start:\n`;
  script += `    jump ${toRenpyId(vn.startSceneId)}\n\n`;

  vn.scenes.forEach(scene => {
    const sceneLabel = toRenpyId(scene.id);
    script += `label ${sceneLabel}:\n\n`;
    
    const bgTag = toRenpyId(`bg_${scene.id}`);
    script += `    scene ${bgTag}\n\n`;
    
    vn.characters.forEach(char => {
        script += `    hide ${toRenpyId(char.id)}\n`;
    });

    const positions = ['at left', 'at right', 'at center', 'at truecenter'];
    if (scene.presentCharacterIds.length > 0) {
        scene.presentCharacterIds.forEach((charId, index) => {
            const char = vn.characters.find(c => c.id === charId);
            if (char) {
                const charTag = toRenpyId(char.id);
                const neutralExpr = char.expressions.find(e => e.name.toLowerCase() === '중립') || char.expressions[0];
                if (neutralExpr) {
                    const exprTag = toRenpyId(neutralExpr.name);
                    const position = positions[index % positions.length];
                    script += `    show ${charTag} ${exprTag} ${position}\n`;
                }
            }
        });
        script += `\n`;
    }

    scene.dialogue.forEach(line => {
      if (line.characterId && line.expressionId) {
        const char = vn.characters.find(c => c.id === line.characterId);
        const expr = char?.expressions.find(e => e.id === line.expressionId);
        if (char && expr) {
          const charTag = toRenpyId(char.id);
          const exprTag = toRenpyId(expr.name);
          script += `    show ${charTag} ${exprTag}\n`; 
        }
      }

      const escapedText = line.text.replace(/"/g, '\\"');
      if (line.characterId) {
        const char = vn.characters.find(c => c.id === line.characterId);
        if (char) {
          const charVar = toRenpyId(char.id);
          script += `    ${charVar} "${escapedText}"\n`;
        }
      } else {
        script += `    "${escapedText}"\n`;
      }
    });

    if (scene.choices.length > 0) {
      script += `\n    menu:\n`;
      scene.choices.forEach(choice => {
        const nextSceneLabel = toRenpyId(choice.nextSceneId);
        const escapedChoiceText = choice.text.replace(/"/g, '\\"');
        script += `        "${escapedChoiceText}":\n`;
        script += `            jump ${nextSceneLabel}\n`;
      });
    } else {
      script += `\n    # This is an ending scene.\n`;
      script += `    return\n`;
    }
    script += `\n`;
  });

  return script;
}

export function exportToHtml(vn: VisualNovel): string {
  const vnData = JSON.stringify(vn).replace(/</g, '\\u003c'); // Escape HTML tags in JSON
  
  // Find background for title screen: Use coverUrl if exists, else start scene bg
  const startScene = vn.scenes.find(s => s.id === vn.startSceneId);
  const titleBgUrl = vn.coverUrl || (startScene ? startScene.backgroundUrl : '');
  
  // Conditionally create style string. If no URL, don't set background-image.
  const titleBgStyle = titleBgUrl ? `background-image: url('${titleBgUrl}');` : 'background-color: #000;';
  
  return `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${vn.title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        ${WEB_GAME_STYLES}
    </style>
</head>
<body>
    <div id="game-root" class="w-screen h-screen relative flex flex-col">
        
        <!-- Title Screen -->
        <div id="title-screen" class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black">
            <div class="absolute inset-0 bg-cover bg-center" style="${titleBgStyle} filter: brightness(0.4) blur(2px);"></div>
            <div class="z-10 text-center p-8 animate-fade-in max-w-4xl">
                <h1 class="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg tracking-tight">${vn.title}</h1>
                ${vn.description ? `<p class="text-xl text-gray-200 mb-12 drop-shadow-md leading-relaxed">${vn.description}</p>` : ''}
                <button onclick="startGame()" class="title-screen-btn">GAME START</button>
            </div>
        </div>

        <!-- Game UI -->
        <div id="game-ui" class="absolute inset-0 hidden cursor-pointer" onclick="handleScreenClick()">
            <!-- Background -->
            <div id="background" class="absolute inset-0 bg-cover bg-center transition-all duration-1000">
                <div class="absolute inset-0 bg-black/20"></div>
            </div>

            <!-- Characters -->
            <div id="characters-container" class="absolute inset-0 overflow-hidden pointer-events-none"></div>

            <!-- Dialogue UI -->
            <div id="ui-layer" class="absolute bottom-0 left-0 right-0 p-6 md:p-8 m-4 rounded-xl border border-gray-700 dialogue-box z-20 cursor-default">
                <div id="speaker-name" class="absolute -top-8 left-8 bg-gray-800 text-white px-6 py-2 rounded-t-lg border-t border-l border-r border-gray-600 text-xl font-bold hidden"></div>
                <p id="dialogue-text" class="text-lg md:text-xl leading-relaxed min-h-[3rem]"></p>
                <div id="choices-container" class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 hidden"></div>
                <div id="continue-indicator" class="absolute bottom-2 right-4 text-white animate-pulse hidden">▼</div>
            </div>
        </div>
    </div>

    <script>
        const vn = ${vnData};
        ${WEB_GAME_SCRIPT}
    </script>
</body>
</html>`;
}
