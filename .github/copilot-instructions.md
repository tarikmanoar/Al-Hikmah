# Al-Hikmah: Islamic History Scholar - Copilot Instructions

## Project Context
Al-Hikmah is a React-based AI chatbot application focused on Islamic history. It leverages Google's Gemini AI for text generation, voice interaction (Live Mode), and image restoration. The app uses Firebase for authentication and persistence.

## Architecture & Core Components

### Key Directories
- `components/`: UI components separated by feature (Chat, Live, Image modes).
- `services/`: Business logic and external API integrations.
  - `geminiService.ts`: **CRITICAL**. Centralized wrapper for `@google/genai`. Handles streaming chat, grounded search, and image processing.
- `context/`: Global state management.
  - `AuthContext.tsx`: Manages Firebase authentication state.
- `prompt/`: Contains system prompts for the AI models.

### Major Components
- `App.tsx`: Main entry point. Handles layout, sidebar navigation, and mode switching (`Chat`, `Live`, `Image`).
- `FirebaseConfigModal.tsx`: A specialized component allowing users to input Firebase credentials at runtime if environment variables are missing.

## Development Workflow

### Setup & Run
- **Package Manager**: `npm`
- **Dev Server**: `npm run dev` (Vite)
- **Build**: `npm run build`

### Configuration (Critical)
The application supports two configuration methods for Firebase:
1. **Environment Variables**: Standard `.env` file usage (see `firebase.ts`).
2. **Runtime Configuration**: If env vars are missing, the app uses `localStorage` key `firebase_custom_config`. This is managed via the UI in `FirebaseConfigModal`.
   - *Note*: When debugging auth or connection issues, check if the user is using the UI-based config override.

## Tech Stack & Conventions

- **Framework**: React 19 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS. Use utility classes directly in JSX.
  - *Theme*: Emerald/Green/Amber color palette to reflect the Islamic theme.
- **Icons**: `lucide-react`
- **State Management**: React Context (`AuthContext`) + Local State (`useState`).
- **AI SDK**: `@google/genai` (Google GenAI SDK).

## AI Integration Patterns

- **Streaming**: Chat responses are streamed using async generators (`streamScholarChat` in `geminiService.ts`).
- **System Instructions**: AI behavior is controlled by prompts defined in `constants.ts` (imported as `SYSTEM_INSTRUCTION_SCHOLAR`).
- **Multimodal**: The app handles text, voice (Live Mode), and images.
  - *Image Mode*: Uses `editImage` in `geminiService.ts` for restoration tasks.

## Common Tasks

- **Adding a new AI Feature**:
  1. Update `services/geminiService.ts` to add a new SDK method wrapper.
  2. Add a new mode in `App.tsx` (if it's a major feature) or a new tool in `ChatMode.tsx`.
  3. Update `types.ts` to reflect new message types or states.

- **Modifying UI**:
  - Stick to the existing Tailwind color scheme (`emerald-950`, `amber-400`, `stone-900`).
  - Ensure responsiveness (sidebar collapses on mobile).
