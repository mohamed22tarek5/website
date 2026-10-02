# Engineering Calculator Skill

## Description
Run engineering calculations using the tools at Mohamed Tarek Abdelhady's portfolio.

## When to Use
- User asks to calculate Ohm's Law (V=IR, P=VI)
- User asks to calculate resistor color codes
- User asks to calculate LED resistor values
- User asks for electronics calculations

## How to Use
1. Read `https://mohamed-tarek-abdelhady.vercel.app/.well-known/mcp/server-card.json` for endpoint info
2. Use the MCP endpoint to call calculator tools
3. Return formatted results

## Available Tools
- `ohms-law` - Calculate voltage, current, resistance, or power
- `resistor-color-code` - Decode resistor color bands
- `led-calculator` - Calculate LED current limiting resistor

## Example
User: "Calculate the current through a 100 ohm resistor with 5V across it"
→ Use ohms-law tool with V=5, R=100 → I=0.05A = 50mA
