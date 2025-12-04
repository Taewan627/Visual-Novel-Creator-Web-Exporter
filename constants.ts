
import { VisualNovel } from './types';

export const LOCAL_STORAGE_KEY = 'visual-novel-creator-data';

export const DEMO_VN: VisualNovel = {
  title: "어느 용의 퀘스트",
  description: "용감한 기사가 되어 전설의 용이 살고 있는 동굴을 탐험하세요. 전투와 우정, 당신의 선택에 따라 운명이 결정됩니다.",
  coverUrl: "https://picsum.photos/seed/vn-cave/1280/720",
  startSceneId: "scene_1",
  characters: [
    { 
      id: "char_hero", 
      name: "용감한 기사", 
      aiPrompt: "빛나는 갑옷을 입고 결연한 표정을 짓고 있는 판타지 세계의 용감한 기사.",
      expressions: [
        { id: "char_hero_neutral", name: "중립", imageUrl: `https://picsum.photos/seed/vn-hero-neutral/400/600` },
        { id: "char_hero_happy", name: "행복", imageUrl: `https://picsum.photos/seed/vn-hero-happy/400/600` },
        { id: "char_hero_sad", name: "슬픔", imageUrl: `https://picsum.photos/seed/vn-hero-sad/400/600` },
        { id: "char_hero_angry", name: "화남", imageUrl: `https://picsum.photos/seed/vn-hero-angry/400/600` },
      ],
    },
    { 
      id: "char_dragon", 
      name: "용 스파키", 
      aiPrompt: "반짝이는 비늘과 장난기 넘치는 눈을 가진 작고 친근한 용.",
      expressions: [
        { id: "char_dragon_neutral", name: "중립", imageUrl: `https://picsum.photos/seed/vn-dragon-neutral/400/600` },
        { id: "char_dragon_happy", name: "행복", imageUrl: `https://picsum.photos/seed/vn-dragon-happy/400/600` },
        { id: "char_dragon_sad", name: "슬픔", imageUrl: `https://picsum.photos/seed/vn-dragon-sad/400/600` },
        { id: "char_dragon_angry", name: "화남", imageUrl: `https://picsum.photos/seed/vn-dragon-angry/400/600` },
      ],
    },
  ],
  scenes: [
    {
      id: "scene_1",
      name: "동굴 입구",
      backgroundUrl: "https://picsum.photos/seed/vn-cave/1280/720",
      presentCharacterIds: [],
      dialogue: [{ characterId: null, expressionId: null, text: "당신은 어둡고 불길한 동굴 앞에 서 있습니다. 낡은 표지판에는 '용 출몰 지역!'이라고 쓰여 있습니다. 다음 행동은?" }],
      choices: [
        { text: "용감하게 동굴로 들어간다.", nextSceneId: "scene_2" },
        { text: "이건 좋지 않은 생각이라고 판단하고 집으로 돌아간다.", nextSceneId: "scene_4" },
      ],
      aiPrompt: "영웅이 용의 동굴의 어둡고 불길한 입구 앞에 서 있다. 근처에는 낡은 경고 표지판이 붙어 있다.",
    },
    {
      id: "scene_2",
      name: "동굴 안",
      backgroundUrl: "https://picsum.photos/seed/vn-inside-cave/1280/720",
      presentCharacterIds: ["char_hero", "char_dragon"],
      dialogue: [
        { characterId: "char_dragon", expressionId: "char_dragon_happy", text: "작고 반짝이는 용이 당신을 쳐다봅니다. '안녕! 난 스파키야! 놀러 온 거야?'라고 삑삑거립니다." },
        { characterId: "char_hero", expressionId: "char_hero_neutral", text: "용...? 나는 용감한 기사다. 내 힘을... 시험하러 왔다!" },
        { characterId: "char_dragon", expressionId: "char_dragon_neutral", text: "오, 게임! 무슨 게임 할 건데?" },
      ],
      choices: [
        { text: "결투를 신청한다!", nextSceneId: "scene_3a" },
        { text: "보드게임이 있는지 물어본다.", nextSceneId: "scene_3b" },
      ],
      aiPrompt: "보물이 가득한 동굴 안, 용감한 기사가 작고 친근하며 반짝이는 용 스파키와 마주한다.",
    },
    {
      id: "scene_3a",
      name: "'결투'",
      backgroundUrl: "https://picsum.photos/seed/vn-inside-cave/1280/720",
      presentCharacterIds: ["char_dragon"],
      dialogue: [{ characterId: "char_dragon", expressionId: "char_dragon_happy", text: "스파키가 킥킥거리며 당신에게 무해한 비눗방울 하나를 뿜습니다. '네가 이겼어!'라고 지저귑니다. 당신은 약간 바보가 된 기분입니다." }],
      choices: [],
      aiPrompt: "작은 용이 동굴 안에서 기사에게 장난스럽게 무해한 비눗방울 하나를 뿜는다.",
    },
    {
      id: "scene_3b",
      name: "게임의 밤",
      backgroundUrl: "https://picsum.photos/seed/vn-games/1280/720",
      presentCharacterIds: ["char_hero", "char_dragon"],
      dialogue: [
        { characterId: null, expressionId: null, text: "당신은 스파키와 함께 '성과 투석기' 게임을 하며 오후를 보냅니다." },
        { characterId: "char_hero", expressionId: "char_hero_happy", text: "올해 들어 가장 재미있는 시간이었어." },
      ],
      choices: [],
       aiPrompt: "기사와 작은 용이 보물에 둘러싸여 함께 즐겁게 보드게임을 하고 있다.",
    },
     {
      id: "scene_4",
      name: "안전한 귀갓길",
      backgroundUrl: "https://picsum.photos/seed/vn-home/1280/720",
      presentCharacterIds: [],
      dialogue: [{ characterId: null, expressionId: null, text: "당신은 무사히 집으로 돌아옵니다. 세상은 아직 모험하지 않은 채로 남아있지만, 적어도 용의 먹이는 되지 않았습니다." }],
      choices: [],
       aiPrompt: "해질녘 집으로 이어지는 아늑하고 평화로운 마을 길.",
    },
  ],
};

export const EMPTY_VN: VisualNovel = {
  title: "새 프로젝트",
  description: "여기에 게임에 대한 간단한 소개를 입력하세요.",
  coverUrl: "",
  startSceneId: "scene_1",
  characters: [],
  scenes: [
    {
      id: "scene_1",
      name: "시작 장면",
      backgroundUrl: "",
      presentCharacterIds: [],
      dialogue: [{ characterId: null, expressionId: null, text: "이야기를 시작하세요..." }],
      choices: [],
      aiPrompt: "",
    },
  ],
};
