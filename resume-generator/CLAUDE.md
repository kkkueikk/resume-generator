# CLAUDE.md — Pixel Resume Generator Style & Architecture Guide

## 🎨 Theme & Visual Identity
- **Overall vibe**: retro 8-bit pixel-art / arcade game
- **Fonts**:  
  - Titles: `"Press Start 2P"`  
  - Body: `"VT323"`  
- **Colors**:  
  - Dark mode (default): neon cyan, magenta, green on black background  
  - Light mode: pastel cyan, magenta, green on cream background  
- **UI Aesthetics**: chunky borders, blocky pixel buttons, glowing hover states, pixelated banners
- **Animations**: minimal, retro feel (blink, glow, slide-in)

## 🌓 Theme Switching
- Provide **light/dark toggle** in top-right corner
- Use Tailwind `dark:` classes for styling  
- Default to **dark mode**  
- Remember to preserve pixel-art aesthetic in both modes

## 🧩 Component Architecture
- Build modular, reusable React components:
  - `PixelButton` → retro-styled button
  - `PixelDialog` → RPG-style modal window
  - `PixelBanner` → pixelated section header
  - `ThemeToggle` → light/dark switch
  - `SkillSelector` → checkboxes in pixel dialog
  - `ResumePreview` → preview of generated text before PDF
- Each component should:
  - Be standalone, accept `props` for customization
  - Encapsulate its own styles with Tailwind
  - Avoid inline styles unless unavoidable

## 🛠️ Layout & Flow
- Landing screen = "Game Menu"
  - `Start Game` → opens `SkillSelector` modal
  - `Load Resume` → triggers LLM + PDF generation
  - `Credits` → shows footer with “Powered by En Yee’s ResumeForge ⚡”
- Layout grid should resemble a **retro game UI** (centered menu box, background pattern, pixelated borders)

## 📄 Resume Generation Rules
- Always limit resume to **1 page**
- Content must match selected skills/tags
- Projects come from a pre-defined data source (JSON or GitHub descriptions)
- Footer: `"Powered by En Yee’s ResumeForge ⚡"`
- Keep ATS-friendly formatting (simple bullet points, no tables)

## 🌟 Code Guidelines
- Use **React + TailwindCSS**
- Keep components in `/components` folder
- Keep theme settings in `/theme` file for easy change
- Use context or hooks for theme toggle state
- Prefer functional components with hooks
- Strive for clean, commented, self-explanatory code

---
