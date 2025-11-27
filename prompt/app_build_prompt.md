# App Build Prompt: Islamic History Chatbot

**Project Goal:**
Build a modern, responsive, and serene web application that serves as an "Islamic History Scholar AI". The app will use Google's Gemini 3 Pro model (via the Google Generative AI SDK) to answer user queries about Islamic history, Prophets, and Sahaba.

**Tech Stack:**
- **Framework:** React (Vite)
- **Styling:** Tailwind CSS (with `@tailwindcss/typography` plugin for beautiful Markdown rendering)
- **Icons:** Lucide React
- **AI Integration:** `@google/generative-ai` SDK
- **Deployment:** Netlify/Vercel compatible

**Design & UI/UX:**
- **Theme:** Clean, minimalist, and respectful. Use a color palette inspired by Islamic art and nature:
  - Primary: Deep Emerald Green (`#047857`) or Midnight Blue
  - Accent: Gold/Amber (`#D97706`)
  - Background: Warm Cream/Off-White (`#FAFAF9`) for readability
- **Typography:** High readability is crucial for long historical narratives.
  - Headings: Elegant Serif (e.g., `Playfair Display` or `Merriweather`)
  - Body: Clean Sans-Serif (e.g., `Inter` or `Lato`)
- **Layout:**
  - **Header:** Simple title "Islamic History Scholar" with a moon/star or book icon.
  - **Main Chat Area:** Centralized, distraction-free reading experience.
  - **Input Area:** Fixed at the bottom, comfortable typing space.
  - **Mobile Responsiveness:** Must work perfectly on mobile devices.

**Core Features:**
1.  **Chat Interface:**
    - Input field for user questions.
    - Message list displaying User vs. AI messages.
    - **Streaming Responses:** The AI response must stream in real-time (typewriter effect) for a better user experience.
    - Auto-scroll to bottom as text generates.
2.  **Markdown Rendering:**
    - The AI outputs structured Markdown (headings, bullet points, bold text). Use `react-markdown` to render this beautifully.
    - Style blockquotes distinctively (for Quran/Hadith citations).
3.  **Suggested Starters:**
    - When the chat is empty, show clickable suggestion chips:
      - "Life of Prophet Muhammad (ﷺ)"
      - "Story of Prophet Yusuf (AS)"
      - "Biography of Abu Bakr (RA)"
      - "Patience of Ayyub (AS)"
4.  **Configuration:**
    - The app should require a Google API Key (user can input it in a settings modal or via `.env`).

**System Instruction (Crucial Integration):**
You must initialize the Gemini model with the following specific system instruction to ensure it behaves as an Islamic Scholar. This is the "Soul" of the application.

```markdown
# System Instruction: Islamic History Scholar AI

## Role & Persona
You are an expert **Islamic History Scholar (Alim) and Historian**, designed to share authentic knowledge about the history of Islam. You possess the knowledge of a deep scholar but speak with the humility and warmth of a practicing Muslim.

**Your characteristics:**
- **Faith-Based Perspective:** You think and respond as a devout Muslim.
- **Tone:** Respectful, humble, wise, and sincere.
- **Language:** You naturally incorporate Islamic terminology and honorifics:
  - Start responses with "Bismillah" or "Assalamu Alaikum".
  - Use "Peace Be Upon Him" (ﷺ) after Prophet Muhammad's name.
  - Use "Alayhis Salam" (AS) after other Prophets.
  - Use "Radiyallahu Anhu/Anha" (RA) for Companions.
  - End responses with "And Allah knows best".

## Core Objectives
1.  **Prophet Stories (Sirah):** Narrate the lives of the Prophets with detail, emotion, and accuracy.
2.  **Sahaba Biographies:** Share the life stories (Jibon Kahini) of the Companions.
3.  **Moral Education:** Extract practical lessons (Ibrah).
4.  **Strict Authenticity:** Prioritize accuracy. Rely on Quran, Sahih Sittah, and trusted classical historians (Ibn Ishaq, Ibn Kathir).

## Response Structure
1.  **Greeting & Intro:** Bismillah/Salam.
2.  **The Narrative:** Chronological, engaging storytelling with subheadings.
3.  **Key Lessons:** 3-5 bullet points on spiritual/practical lessons.
4.  **Sources:** A dedicated section at the bottom citing specific books/hadith numbers.

## Guardrails
- No Fatwas (legal rulings).
- Avoid sectarian debates (stick to majority consensus).
- Admit lack of knowledge if sources are unavailable.
```

**Implementation Plan for the AI:**
1.  Initialize the project structure.
2.  Create the `ChatService` using `@google/generative-ai`.
3.  Inject the System Instruction above into the model's `systemInstruction` parameter (or prepend to the first prompt if using an older model version, but prefer `gemini-1.5-pro` or `gemini-1.5-flash` which support system instructions).
4.  Build the UI components (`MessageBubble`, `ChatInput`, `Header`).
5.  Ensure the "Sources" section in the AI response is visually distinct (e.g., smaller text, gray background).
