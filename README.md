# Maple

Maple is a generative MIDI sequencer and visualizer designed to create organic, evolving musical patterns. It combines a Python-based fractal generation engine with a responsive, interactive web frontend.  This app is inspired by my lovely wife who enjoys all things maple, woodsy, and organic.

## Overview

Maple operates as a hybrid software instrument:
- **Backend (Python)**: Runs the generative engine, handles MIDI I/O, and manages the application state. It uses a "Lobe" based system where parameters control the probability and timing of musical events.
- **Frontend (React)**: Provides a beautiful, maple-leaf-inspired visualization that reacts in real-time to the generated music. It also serves as the control surface for the generative engine, allowing you to tweak parameters, select scales, and manage MIDI output.

### Key Features
- **Generative MIDI Sequencing**: Create complex, evolving melodies and rhythms based on fractal logic.
- **Real-time Visualization**: Watch the music unfold on an interactive visual interface.
- **Live Control**: Adjust tempo, scales, and lobe parameters on the fly.
- **MIDI Output**: Connect to your favorite DAWs, hardware synths, or software instruments.
- **Preset Management**: Save and load your generative states to revisit your favorite patterns.

## Installation & Setup

### Prerequisites
- **Python 3.8+**
- **Node.js 16+** & **npm**

---

### Linux Setup

#### 1. Backend Setup
Navigate to the backend directory and set up the Python environment:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r ../requirements.txt
```

Start the backend server:
```bash
python main.py
```
The server will start on `http://localhost:8000`.

#### 2. Frontend Setup
Open a new terminal, navigate to the frontend directory, and install dependencies:

```bash
cd frontend
npm install
```

Start the development server:
```bash
npm run dev
```
Open your browser to the URL shown (usually `http://localhost:5173`).

---

### Windows Setup

#### 1. Backend Setup
Open PowerShell or Command Prompt, navigate to the backend directory, and set up the Python environment:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r ..\requirements.txt
```

Start the backend server:
```powershell
python main.py
```
The server will start on `http://localhost:8000`.

#### 2. Frontend Setup
Open a new terminal window, navigate to the frontend directory:

```powershell
cd frontend
npm install
```

Start the development server:
```powershell
npm run dev
```
Open your browser to the URL shown (usually `http://localhost:5173`).

## Usage

1. **Connect MIDI**: Ensure you have a MIDI destination available (e.g., a virtual MIDI port or a hardware synth connected via USB). Maple will detect available ports on startup.
2. **Start Playback**: Toggle the play button in the global controls.
3. **Experiment**: Click on different "Lobes" (sections of the leaf) to adjust their generation parameters. Change the global scale and tempo to suit your mood.

Maple leaf vector image from https://www.vecteezy.com/
