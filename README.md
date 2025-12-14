# VN-AI Studio
**AI-Assisted Visual Novel Authoring Tool (Web-Based)**

🚀 Live Demo  
https://huggingface.co/spaces/devmeta/visual-novel-creator-v2

VN-AI Studio is a web-based visual novel creation tool that leverages generative AI to reduce the entry barriers of game development—such as story planning, character art creation, and scripting—and enables users to rapidly create, test, and export playable visual novel games.

---

## Overview

Creating a visual novel traditionally requires multidisciplinary expertise in writing, illustration, and programming.  
VN-AI Studio introduces an AI-assisted creation workflow that allows creators to focus on narrative structure and experimentation rather than technical implementation.

Core philosophy:

Generate many playable prototypes quickly, then curate and refine the best result.

---

## Key Features

### AI-Assisted Content Generation
- Automatic story generation from a simple theme input
- Character sprite generation with consistent visual style
- Automatic generation of four emotional expressions (neutral, happy, sad, angry)
- Background image generation from scene descriptions
- Automatic background removal using Canvas API and pixel-level chroma key analysis

### Visual Novel Editor
- Scene creation and deletion
- Branching narrative structure with choice-based flow
- Dialogue editing with character and narration support
- Character management with prompt-based customization

### Scene Tree Visualization
- Hierarchical scene tree for at-a-glance understanding
- Clear visualization of cause-and-effect between choices and outcomes
- Detection of unreachable (orphan) scenes
- Structural awareness of loops and branching complexity

### Three-Stage Scene Architecture
1. Intro (Start Scene)
2. Development (Branching Scenes)
3. Ending (Result Scenes)

This structure guides coherent narrative pacing while preventing uncontrolled branching.

### Play & Export
- In-browser preview player
- Standalone HTML export
- Ren’Py (.rpy) script export
- JSON-based project backup and restore

---

## Technology Stack

- Frontend: React 19
- Language: TypeScript
- Styling: Tailwind CSS
- AI Integration: Google Gemini API  
  - gemini-2.5-flash (text)  
  - gemini-2.5-flash-image (image)
- State Management: React Hooks
- Build Tools: Vite / Webpack
- Image Processing: HTML Canvas API

---

## System Architecture

- Client-side processing only (no backend server)
- All logic, image processing, and file handling run in the browser
- Reduced operational cost and improved data privacy
- Entire project stored as a single JSON object for easy save/load/export

---

## Data Schema (JSON Example)

    {
      "title": "String",
      "characters": [
        {
          "id": "UUID",
          "name": "String",
          "expressions": [
            { "id": "UUID", "imageUrl": "Base64" }
          ]
        }
      ],
      "scenes": [
        {
          "id": "UUID",
          "dialogue": [
            { "text": "String", "characterId": "UUID" }
          ],
          "choices": [
            { "text": "String", "nextSceneId": "UUID" }
          ]
        }
      ]
    }

---

## User Workflow

1. Enter a theme and generate a story draft or demo project.
2. Configure game settings (title, synopsis, cover image, start scene).
3. Add characters and generate or upload expression sprites.
4. Review and adjust the branching scene tree.
5. Edit scene details: backgrounds, dialogue, and choices.
6. Preview the game and export as JSON, HTML, or Ren’Py scripts.

---

## Expected Outcomes

- AI-Assisted Creation Support  
  Enables non-experts to create playable visual novel games with AI assistance.

- Rapid Prototyping  
  Quickly visualize and validate narrative ideas during the planning phase.

- Iterative Design Optimization  
  Generate multiple prototypes and select the most promising one for refinement.

- Structure-Oriented Narrative Design  
  Scene tree visualization encourages logical and coherent storytelling.

- Reduced Development Cost  
  Serverless, client-side architecture minimizes infrastructure requirements.

- Scalability  
  Ren’Py export allows seamless transition from prototype to commercial development.

---

## Credits

Created by: Tae-wan Kim
