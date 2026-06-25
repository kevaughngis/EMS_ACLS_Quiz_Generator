# EMS/ACLS/PALS/NRP Interactive Tutor - Project Overview

This project is a high-fidelity medical simulation platform designed for Paramedics and Physician Assistants. It features a custom physiology engine, dynamic ECG generation, 3D interaction, and AI-driven feedback.

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **3D Rendering**: Three.js, React Three Fiber, React Three Drei
- **State Management**: Zustand
- **Styling**: Tailwind CSS v3
- **AI**: Google Gemini AI SDK
- **Icons**: Lucide React

## Project Structure

### Core Engine
- `src/engine/PhysiologyEngine.ts`: The "brain" of the app. A compartmental model that simulates HR, MAP, SpO2, ETCO2, and pH. It handles drug kinetics (Epinephrine, Amiodarone, etc.) and electrical therapy.
- `src/engine/GeminiService.ts`: Integration with Gemini AI to provide natural language clinical debriefings based on student actions.

### Components
- `src/components/HUD.tsx`: The primary user interface. Includes the real-time monitor, action buttons, and logs.
- `src/components/ECGMonitor.tsx`: A Canvas-based real-time ECG generator that draws waveforms (Sinus, VF, VT, Heart Blocks, etc.) based on physiology engine data.
- `src/components/SimulationView.tsx`: The 3D scene container.
- `src/components/Scene.tsx`: The Three.js models for the patient, bed, and medical room.
- `src/components/AnatomyLesson.tsx`: An interactive 3D viewer for medical education.

### Data & Types
- `src/data/library.ts`: Extensive library of ECG rhythms and protocol constants.
- `src/data/scenarios.ts`: Branching clinical scenarios for ACLS, BLS, PALS, and NRP.
- `src/store/useStore.ts`: Global state management for the simulation.
- `src/types/index.ts`: TypeScript interfaces for patients, vitals, and scenarios.

## Features Implemented
1. **Realistic Physiology**: Vitals are interdependent. Giving Epinephrine increases HR and MAP; poor ventilation leads to hypoxia and acidosis.
2. **100+ ECG Rhythms**: Supports complex morphologies including 1st/2nd/3rd degree heart blocks, Brugada, WPW, and Torsades.
3. **3D Assessment**: Users can click the 3D patient's head or chest to perform clinical assessments.
4. **AI Debriefing**: After a scenario, users can click "AI Review" to get a detailed critique from Gemini.
5. **Study Mode**: Interactive lessons on cardiac pathophysiology with 3D models.

## Setup Instructions
1. Install dependencies: `npm install` or `pnpm install`.
2. Add your Gemini API key to a `.env` file: `VITE_GEMINI_API_KEY=your_key_here`.
3. Run development server: `npm run dev`.
4. Build for production: `npm run build`.
