# ChatGPT Modes & Prompting Cheatsheet
Author: Mohamed Tarek Abdelhady (M.T.A. Lab)

## 1. Interaction Modes
- **Direct Mode:** Single, laser-focused question without preamble. Best for quick syntax, regex, or terminal commands.
- **Role/Persona Mode:** Assign a role: "Act as a Senior Embedded Systems Engineer with 10+ years in ESP32/C++".
- **Step-by-Step Chain-of-Thought:** Ask the model to show internal reasoning before answering: "Break this down into 3 analysis stages before presenting the solution."
- **Reviewer / Devil's Advocate:** "Critique this design for potential race conditions, thermal dissipation, or memory leaks."

## 2. Universal Prompt Formula
`[ROLE] + [CONTEXT] + [TASK] + [CONSTRAINTS] + [OUTPUT FORMAT]`

### Example:
- **Role:** Senior Hardware Engineer
- **Context:** Designing a 12V to 3.3V DC-DC buck converter for an IoT sensor node.
- **Task:** Recommend optimal component values and inductor saturation current rating.
- **Constraints:** Switching frequency = 500 kHz, ambient temperature up to 60°C, ripple < 30mV.
- **Output:** Markdown table with component reference, value, tolerance, and justification.
