
import { useState } from 'react';
import { VisualNovel, VisualNovelActions, AiOperations } from '../types';
import { generateStory, generateCharacterImage, editCharacterImageExpression, generateSceneBackground, generateSceneDialogue } from '../services/geminiService';
import { removeCharacterImageBackground } from '../utils/imageProcessing';
import { DEMO_VN } from '../constants';

export const useAiOperations = (
    vn: VisualNovel,
    actions: VisualNovelActions,
    setVisualNovel: (vn: VisualNovel) => void,
    setSelectedSceneId: (id: string) => void
): AiOperations => {
    const [aiTheme, setAiTheme] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Granular loading states
    const [generatingExpressionsForCharId, setGeneratingExpressionsForCharId] = useState<string | null>(null);
    const [isRemovingBgForExprId, setIsRemovingBgForExprId] = useState<string | null>(null);
    const [isGeneratingBg, setIsGeneratingBg] = useState(false);
    const [isGeneratingDialogue, setIsGeneratingDialogue] = useState(false);

    const handleGenerateStory = async () => {
        if (!aiTheme.trim()) return;
        setIsGenerating(true);
        setError(null);
        try {
            const generatedVN = await generateStory(aiTheme);
            setVisualNovel(generatedVN);
            setSelectedSceneId(generatedVN.startSceneId);
            setAiTheme('');
        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : '스토리 생성 실패');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateDemoStory = async () => {
        setIsGenerating(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 800)); // Fake delay
            setVisualNovel(DEMO_VN);
            setSelectedSceneId(DEMO_VN.startSceneId);
        } catch(e) {
            setError("데모 로드 실패");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateAllCharacterExpressions = async (charId: string) => {
        const char = vn.characters.find(c => c.id === charId);
        if (!char) return;

        setGeneratingExpressionsForCharId(charId);
        try {
            // 1. Generate Neutral Base Image
            const baseImageUrl = await generateCharacterImage(char.name, char.aiPrompt || '', '중립');
            
            // Remove background from base image immediately
            const processedBaseImage = await removeCharacterImageBackground(baseImageUrl);
            
            const expressions = [...char.expressions];
            const neutralExprIndex = expressions.findIndex(e => e.name === '중립');
            if (neutralExprIndex !== -1) {
                actions.updateCharacterExpressionUrl(charId, expressions[neutralExprIndex].id, processedBaseImage);
            }
            
            const otherExpressions = expressions.filter(e => e.name !== '중립');
            
            for (const expr of otherExpressions) {
                // Add delay to avoid rate limits
                await new Promise(resolve => setTimeout(resolve, 4000));
                
                try {
                    const newImageUrl = await editCharacterImageExpression(baseImageUrl, expr.name);
                    const processedImageUrl = await removeCharacterImageBackground(newImageUrl);
                    actions.updateCharacterExpressionUrl(charId, expr.id, processedImageUrl);
                } catch (err) {
                    console.error(`Failed to generate ${expr.name}`, err);
                }
            }

        } catch (e) {
            console.error(e);
            alert(`캐릭터 생성 실패: ${e instanceof Error ? e.message : '알 수 없는 오류'}`);
        } finally {
            setGeneratingExpressionsForCharId(null);
        }
    };

    const handleRemoveBackground = async (charId: string, exprId: string) => {
        const char = vn.characters.find(c => c.id === charId);
        const expr = char?.expressions.find(e => e.id === exprId);
        if (!char || !expr || !expr.imageUrl) return;

        setIsRemovingBgForExprId(exprId);
        try {
            const newUrl = await removeCharacterImageBackground(expr.imageUrl);
            actions.updateCharacterExpressionUrl(charId, exprId, newUrl);
        } catch (e) {
            console.error(e);
            alert('배경 제거 실패');
        } finally {
            setIsRemovingBgForExprId(null);
        }
    };

    const handleGenerateSceneBackground = async (sceneId: string, prompt: string) => {
        if (!prompt) return;
        setIsGeneratingBg(true);
        try {
            const url = await generateSceneBackground(prompt);
            actions.updateScene(sceneId, 'backgroundUrl', url);
        } catch (e) {
            console.error(e);
            alert('배경 생성 실패');
        } finally {
            setIsGeneratingBg(false);
        }
    };

    const handleGenerateSceneDialogue = async (sceneId: string, prompt: string, presentCharacterIds: string[]) => {
        setIsGeneratingDialogue(true);
        try {
            const scene = vn.scenes.find(s => s.id === sceneId);
            if (!scene) return;
            const presentChars = vn.characters.filter(c => presentCharacterIds.includes(c.id));
            
            const newDialogue = await generateSceneDialogue(scene.name, prompt, presentChars);
            actions.updateScene(sceneId, 'dialogue', newDialogue);

        } catch (e) {
            console.error(e);
            alert('대화 생성 실패');
        } finally {
            setIsGeneratingDialogue(false);
        }
    };

    return {
        aiTheme, setAiTheme,
        isGenerating, error,
        generatingExpressionsForCharId,
        isRemovingBgForExprId,
        isGeneratingBg,
        isGeneratingDialogue,
        
        handleGenerateStory,
        handleGenerateDemoStory,
        handleGenerateAllCharacterExpressions,
        handleRemoveBackground,
        handleGenerateSceneBackground,
        handleGenerateSceneDialogue
    };
};
