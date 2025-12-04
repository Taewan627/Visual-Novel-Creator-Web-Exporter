
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { VisualNovel, Character, DialogueLine } from '../types';

// --- Constants ---

const STORY_PROMPT_TEMPLATE = (theme: string) => `
    테마 "${theme}"를 기반으로 완전한 비주얼 노벨 스토리를 만들어 주세요.
    스토리는 시작, 중간, 끝이 명확한 독립적인 미니 게임이어야 합니다.
    최소 2명의 캐릭터와 4개의 장면을 포함해야 합니다.
    장면들은 선택지를 통해 서로 연결되어야 합니다. 모든 장면에 도달할 수 있도록 하세요.
    한 장면에 여러 캐릭터가 등장할 수 있으며, 그들 사이에 대화가 오고 갈 수 있습니다.
    마지막 장면에는 이야기의 끝을 알리기 위해 선택지가 없어야 합니다.
    각 캐릭터는 "중립", "행복", "슬픔", "화남"의 4가지 표정을 가져야 합니다. 각 표정에는 고유한 ID와 플레이스홀더 imageUrl이 있어야 합니다.
    각 대화 줄에는 말하는 캐릭터의 감정에 맞는 "expressionId"가 포함되어야 합니다.
    결과는 이 스키마를 엄격하게 따르는 단일 유효 JSON 객체로 제공해 주세요. \`\`\`json과 같은 마크다운 서식은 포함하지 마세요.
    
    JSON 객체는 다음 구조를 가져야 합니다:
    {
      "title": "테마를 기반으로 한 창의적인 제목",
      "description": "이 게임에 대한 흥미진진한 한 줄 요약 또는 소개 (시작 화면용)",
      "characters": [
        { 
          "id": "char_1", 
          "name": "캐릭터 이름", 
          "expressions": [
            { "id": "char_1_neutral", "name": "중립", "imageUrl": "https://picsum.photos/400/600" },
            { "id": "char_1_happy", "name": "행복", "imageUrl": "https://picsum.photos/400/600" },
            { "id": "char_1_sad", "name": "슬픔", "imageUrl": "https://picsum.photos/400/600" },
            { "id": "char_1_angry", "name": "화남", "imageUrl": "https://picsum.photos/400/600" }
          ]
        }
      ],
      "scenes": [
        {
          "id": "scene_1",
          "name": "장면에 대한 짧고 설명적인 이름",
          "backgroundUrl": "https://picsum.photos/1280/720",
          "presentCharacterIds": ["char_1"],
          "dialogue": [
            { "characterId": "char_1", "expressionId": "char_1_neutral", "text": "캐릭터 1이 말하는 대사." },
            { "characterId": null, "expressionId": null, "text": "이것은 내레이터 대사입니다." }
          ],
          "choices": [
            { "text": "선택지 텍스트", "nextSceneId": "scene_2" }
          ]
        }
      ],
      "startSceneId": "첫 번째 장면의 ID"
    }
`;

const CHAR_IMAGE_PROMPT_TEMPLATE = (name: string, details: string, expression: string) => `
    매우 일관된 스타일의 비주얼 노벨 캐릭터 스프라이트. 캐릭터 이름: ${name}. ${details} 캐릭터는 [${expression}] 표정을 짓고 있습니다. 얼굴 표정을 제외한 모든 것(의상, 헤어스타일, 포즈, 신체 비율)은 캐릭터의 다른 이미지와 일관되게 유지되어야 합니다. 스타일: 애니메이션, 생생함, 디지털 아트, 상세함. 캐릭터의 상반신만 나오는 초상화. 배경은 반드시 '완벽하게 균일한 단색의 형광 마젠타(Magenta, #FF00FF)'이어야 합니다. 중요: 배경에 그라데이션, 그림자, 조명 효과, 체크 무늬, 격자 패턴을 절대 넣지 마세요. 오직 #FF00FF 색상만 배경에 사용하세요. 캐릭터 자체에는 마젠타 색상을 사용하지 마세요. 배경색이 캐릭터에 반사되지 않게 하세요(No color spill). 앤티에일리어싱을 최소화하여 가장자리를 선명하게 만드세요.
`;

const EDIT_EXPR_PROMPT_TEMPLATE = (expression: string) => `
    이것은 비주얼 노벨 캐릭터 스프라이트입니다. 캐릭터의 다른 모든 측면(헤어스타일, 의상, 포즈 등)을 완전히 동일하게 유지하면서 얼굴 표정만 [${expression}]으로 바꿔주세요. 배경은 반드시 '완벽하게 균일한 단색의 형광 마젠타(Magenta, #FF00FF)'로 유지해야 합니다. 중요: 배경에 그라데이션, 그림자, 조명 효과, 체크 무늬, 격자 패턴을 절대 넣지 마세요. 오직 #FF00FF 색상만 배경에 사용하세요. 스타일 일관성이 매우 중요합니다.
`;

const SCENE_DIALOGUE_PROMPT_TEMPLATE = (sceneName: string, sceneTheme: string, charDescriptions: string) => `
    당신은 비주얼 노벨의 대화 작가입니다.
    현재 장면의 이름은 "${sceneName}"입니다.
    장면의 테마는 "${sceneTheme}"입니다.
    등장인물과 그들의 사용 가능한 표정은 다음과 같습니다:
    ${charDescriptions}

    이 장면에 대한 짧고 흥미로운 대화 시퀀스를 작성해 주세요. 3~5줄 길이여야 합니다.
    각 대화 줄마다 캐릭터의 감정에 가장 잘 맞는 표정의 'id'를 'expressionId'로 선택하세요.
    설명적인 텍스트에는 "내레이터"를 사용할 수 있습니다. 내레이터 대사의 경우 "characterId"와 "expressionId"는 null이어야 합니다.
    캐릭터가 말하는 대사에는 제공된 character "id"를 사용하세요.
    결과는 이 스키마를 엄격하게 따르는 단일 유효 JSON 객체 배열로 제공해 주세요. \`\`\`json과 같은 마크다운 서식은 포함하지 마세요.
    
    JSON 배열은 다음 구조를 가져야 합니다:
    [
      { "characterId": "the_character_id" | null, "expressionId": "the_expression_id" | null, "text": "캐릭터 또는 내레이터가 말하는 대화." }
    ]
`;

// --- Helper Functions ---

function getAiClient(): GoogleGenAI {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY 환경 변수가 설정되지 않았습니다");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
}

function handleGeminiError(error: unknown, context: string): never {
  console.error(`${context} 오류 (Gemini):`, error);
  if (error instanceof Error) {
    if (error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('429')) {
      throw new Error("API 요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.");
    }
    if (error.message.includes('JSON.parse')) {
        throw new Error(`${context} 실패: AI가 잘못된 JSON 구조를 반환했습니다.`);
    }
    if (error.message.includes('blockReason')) {
        throw new Error(`${context} 차단됨: 안전 설정 문제입니다.`);
    }
    throw error;
  }
  throw new Error(`알 수 없는 오류로 ${context}에 실패했습니다.`);
}

// --- API Functions ---

export async function generateStory(theme: string): Promise<VisualNovel> {
  const ai = getAiClient();
  const prompt = STORY_PROMPT_TEMPLATE(theme);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            startSceneId: { type: Type.STRING },
            characters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  expressions: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            name: { type: Type.STRING },
                            imageUrl: { type: Type.STRING },
                        },
                        required: ['id', 'name', 'imageUrl'],
                    }
                  }
                },
                required: ['id', 'name', 'expressions'],
              },
            },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  backgroundUrl: { type: Type.STRING },
                  presentCharacterIds: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  dialogue: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        characterId: { type: Type.STRING, nullable: true },
                        expressionId: { type: Type.STRING, nullable: true },
                        text: { type: Type.STRING },
                      },
                      required: ['text'],
                    }
                  },
                  choices: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        text: { type: Type.STRING },
                        nextSceneId: { type: Type.STRING },
                      },
                      required: ['text', 'nextSceneId'],
                    },
                  },
                },
                required: ['id', 'name', 'backgroundUrl', 'presentCharacterIds', 'dialogue', 'choices'],
              },
            },
          },
          required: ['title', 'description', 'startSceneId', 'characters', 'scenes'],
        },
      },
    });

    const jsonString = response.text.trim();
    const generatedData = JSON.parse(jsonString) as VisualNovel;

    // Basic validation
    if (!generatedData.title || !generatedData.scenes || !generatedData.characters || !generatedData.startSceneId) {
        throw new Error("AI 응답에 필수 필드가 누락되었습니다.");
    }
    
    // Ensure data conforms to the VisualNovel type
    generatedData.coverUrl = ""; // AI does not generate cover image yet
    generatedData.scenes.forEach((scene) => {
        if (!Array.isArray(scene.presentCharacterIds)) scene.presentCharacterIds = [];
        if (!Array.isArray(scene.dialogue)) scene.dialogue = [{ text: '...', characterId: null, expressionId: null }];
        scene.dialogue.forEach((line) => {
            if (typeof line.characterId === 'undefined') line.characterId = null;
            if (typeof line.expressionId === 'undefined') line.expressionId = null;
        });
    });

    return generatedData;
  } catch (error) {
    handleGeminiError(error, "스토리 생성");
  }
  return {} as VisualNovel; // Unreachable but required for TS
}

export async function generateCharacterImage(characterName: string, characterPrompt: string, expressionName: string): Promise<string> {
    const ai = getAiClient();
    const promptDetails = characterPrompt ? `캐릭터 설명: ${characterPrompt}.` : '';
    const fullPrompt = CHAR_IMAGE_PROMPT_TEMPLATE(characterName, promptDetails, expressionName);

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: fullPrompt }] },
        });

        const candidate = response.candidates?.[0];
        if (!candidate || !candidate.content || !candidate.content.parts) {
            const blockReason = response.promptFeedback?.blockReason;
            if (blockReason) {
                throw new Error(`안전 설정 차단: ${blockReason}`);
            }
            throw new Error("유효한 이미지 응답이 없습니다.");
        }
        
        let imageUrl: string | null = null;
        for (const part of candidate.content.parts) {
            if (part.inlineData) {
                imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                break;
            }
        }

        if (!imageUrl) throw new Error("이미지 데이터가 없습니다.");
        return imageUrl;

    } catch (error) {
        handleGeminiError(error, "캐릭터 이미지 생성");
    }
    return ''; // Unreachable
}

export async function editCharacterImageExpression(baseImage: string, targetExpressionName: string): Promise<string> {
    const ai = getAiClient();
    
    const match = baseImage.match(/^data:(image\/.+);base64,(.+)$/);
    if (!match) {
        throw new Error("기본 이미지 형식이 잘못되었습니다 (Invalid Base64).");
    }
    const mimeType = match[1];
    const base64Data = match[2];

    const imagePart = {
        inlineData: { mimeType, data: base64Data },
    };
    
    const textPart = {
        text: EDIT_EXPR_PROMPT_TEMPLATE(targetExpressionName),
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [imagePart, textPart] },
        });
        
        const candidate = response.candidates?.[0];
        if (!candidate || !candidate.content || !candidate.content.parts) {
             const blockReason = response.promptFeedback?.blockReason;
            if (blockReason) throw new Error(`안전 설정 차단: ${blockReason}`);
            throw new Error("유효한 이미지 응답이 없습니다.");
        }

        let imageUrl: string | null = null;
        for (const part of candidate.content.parts) {
            if (part.inlineData) {
                imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                break;
            }
        }
        
        if (!imageUrl) throw new Error("이미지 데이터가 없습니다.");
        return imageUrl;

    } catch (error) {
        handleGeminiError(error, "캐릭터 표정 수정");
    }
    return ''; // Unreachable
}

export async function generateSceneBackground(prompt: string): Promise<string> {
    const ai = getAiClient();
    const fullPrompt = `고품질 비주얼 노벨 배경 이미지. 장면 설명: ${prompt}. 스타일: 생생함, 애니메이션, 디지털 아트, 디테일.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: fullPrompt }] },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
        throw new Error("이미지 데이터가 없습니다.");
    } catch (error) {
        handleGeminiError(error, "배경 생성");
    }
    return ''; // Unreachable
}

export async function generateSceneDialogue(sceneName: string, scenePrompt: string, presentCharacters: Character[]): Promise<DialogueLine[]> {
    const ai = getAiClient();

    const characterDescriptions = presentCharacters.length > 0 
        ? presentCharacters.map(c => `- ${c.name} (id: ${c.id}), 사용 가능 표정: ${c.expressions.map(e => `"${e.name}" (id: ${e.id})`).join(', ')}`).join('\n')
        : '없음. 내레이터만 사용하세요.';

    const prompt = SCENE_DIALOGUE_PROMPT_TEMPLATE(sceneName, scenePrompt, characterDescriptions);

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            characterId: { type: Type.STRING, nullable: true },
                            expressionId: { type: Type.STRING, nullable: true },
                            text: { type: Type.STRING },
                        },
                        required: ['text'],
                    }
                }
            }
        });

        const jsonString = response.text.trim();
        const generatedDialogue = JSON.parse(jsonString);

        if (!Array.isArray(generatedDialogue)) {
            throw new Error("AI 응답이 유효한 배열이 아닙니다.");
        }

        return generatedDialogue.map((line: any) => ({
            characterId: line.characterId || null,
            expressionId: line.expressionId || null,
            text: line.text,
        }));
    } catch (error) {
        handleGeminiError(error, "대화 생성");
    }
    return []; // Unreachable
}
