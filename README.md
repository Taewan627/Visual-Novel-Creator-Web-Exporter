# VN-AI Studio
**AI-Assisted Visual Novel Authoring Tool (Web-Based)**

VN-AI Studio is a web-based visual novel creation tool that leverages generative AI to reduce the entry barriers of game development—such as story planning, character art creation, and scripting—and enables users to rapidly create, test, and export playable visual novel games.

---

## Overview

Creating a visual novel traditionally requires multidisciplinary expertise in writing, illustration, and programming.  
VN-AI Studio addresses this challenge by introducing an **AI-assisted creation workflow**, allowing users to focus on narrative design and structural experimentation rather than technical implementation.

The core philosophy of the project is:

> **Generate many playable prototypes quickly, then curate and refine the best result.**

---


## Live Demo

You can try VN-AI Studio directly in your browser without installation:

👉 https://huggingface.co/spaces/devmeta/visual-novel-creator-v2



## Key Features

### 1. AI-Assisted Content Generation
- **Automatic Story Generation**  
  Generates a full narrative draft—including title, synopsis, characters, and scene structure—from a simple theme input (e.g., *“School Mystery”*).

- **Character Sprite Generation**  
  Creates visually consistent character images based on prompts.  
  Automatically generates four emotional expressions:
  - Neutral
  - Happy
  - Sad
  - Angry  
  *(Powered by Gemini 2.5 Flash Image)*

- **Background Image Generation**  
  Produces high-resolution background images based on scene descriptions.

- **Automatic Background Removal**  
  Uses the HTML Canvas API and pixel-level analysis (Magenta chroma key) to convert generated character images into transparent sprites.

---

### 2. Visual Novel Editor

- **Scene Management**  
  Add, remove, and organize scenes using a branching tree structure.

- **Dialogue Editor**  
  Edit character dialogue, narrator text, and emotional expressions.

- **Character Management**  
  Manage character names, prompts, and custom sprite uploads.

---

### 3. Scene Tree Visualization (At-a-Glance Design)

VN-AI Studio visualizes branching narratives using a **hierarchical scene tree**, allowing users to understand the entire story flow at a glance.

**Benefits:**
- Clear visualization of cause-and-effect relationships between choices and outcomes
- Easy detection of unreachable (orphan) scenes
- Structural awareness of loops and branching complexity

---

### 4. Three-Stage Scene Architecture

The editor is designed around a three-stage narrative depth:

1. **Intro (Start Scene)**  
   Introduces the world and context.

2. **Development (Branching Scenes)**  
   Core decision points where the story diverges.

3. **Ending (Result Scenes)**  
   Resolution of player choices (e.g., good/bad endings).

This structure guides users toward coherent narrative pacing while preventing uncontrolled branching complexity.

---

### 5. Play & Export

- **In-Browser Preview Player**  
  Instantly play and test the game during development.

- **Standalone HTML Export**  
  Export the entire game as a single `.html` file runnable in any modern browser.

- **Ren’Py Script Export**  
  Convert projects into `.rpy` format for further development in the Ren’Py engine.

- **Project Backup & Restore**  
  Save and load projects using a JSON-based format.

---

## Technology Stack

- **Frontend:** React 19 (Component-based Architecture)  
- **Language:** TypeScript  
- **Styling:** Tailwind CSS  
- **AI Integration:** Google Gemini API  
  - `gemini-2.5-flash` (Text generation)  
  - `gemini-2.5-flash-image` (Image generation)  
- **State Management:** React Hooks (`useState`, `useReducer`, `useEffect`)  
- **Build Tools:** Vite / Webpack  
- **Image Processing:** HTML Canvas API

---

## System Architecture

- **Client-Side Processing**  
  All logic—including image processing and file handling—is executed in the browser.  
  No backend server is required, resulting in reduced operational cost and improved data privacy.

- **AI Service Layer**  
  The Google GenAI SDK handles text and image generation requests.

- **Data Structure**  
  The entire project is stored as a single JSON object, making saving, loading, and exporting straightforward.

---

## Data Schema (JSON)

```json
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
}
