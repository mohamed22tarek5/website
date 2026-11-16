import fs from 'fs';
import path from 'path';

// ============================================
// CATEGORIES DEFINITION & METADATA
// ============================================
const categories = [
  {
    id: 'circuits',
    title: 'Circuits & Electronics',
    shortTitle: 'Circuits',
    desc: 'Ohm’s law, passive component EIA standards, filter networks, op-amps, and microcontrollers.',
    badgeLabel: 'Calculators',
    iconSvg: '<path d="M224 32c0-17.7 14.3-32 32-32s32 14.3 32 32V64h32c17.7 0 32 14.3 32 32v32h32c17.7 0 32 14.3 32 32s-14.3 32-32 32H384v64h32c17.7 0 32 14.3 32 32s-14.3 32-32 32H384v64h32c17.7 0 32 14.3 32 32s-14.3 32-32 32H384v32c0 17.7-14.3 32-32 32H320v32c0 17.7-14.3 32-32 32s-32-14.3-32-32V448H224v32c0 17.7-14.3 32-32 32s-32-14.3-32-32V448H128c-17.7 0-32-14.3-32-32V384H64c-17.7 0-32-14.3-32-32s14.3-32 32-32H96V256H64c-17.7 0-32-14.3-32-32s14.3-32 32-32H96V128c0-17.7 14.3-32 32-32h32V64c0-17.7 14.3-32 32-32s32 14.3 32 32V64h32V32zM160 128H352V384H160V128zm64 64c-17.7 0-32 14.3-32 32v64c0 17.7 14.3 32 32 32h64c17.7 0 32-14.3 32-32V224c0-17.7-14.3-32-32-32H224z"/>',
    viewBox: '0 0 512 512'
  },
  {
    id: 'power',
    title: 'Power, Solar & RF',
    shortTitle: 'Power & Solar',
    desc: 'Photovoltaic array sizing, solar battery banks, inverter surge margins, PCB thermals, and RF conversions.',
    badgeLabel: 'Calculators',
    iconSvg: '<path d="M0 256L224 0 160 208h176L80 512 160 288H0z"/>',
    viewBox: '0 0 384 512'
  },
  {
    id: 'productivity',
    title: 'Productivity & AI',
    shortTitle: 'Productivity & AI',
    desc: 'Curated AI directory, Linux command cheat sheet, daily task management, and health schedules.',
    badgeLabel: 'Tools',
    iconSvg: '<path d="M371.8 1.5c-4.2-2-9.1-2-13.3 0L247.9 54.4c-4.3 2.1-7.1 6.5-7.1 11.2c0 4.7 2.8 9.1 7.1 11.2l110.6 52.9c4.2 2 9.1 2 13.3 0l110.6-52.9c4.3-2.1 7.1-6.5 7.1-11.2c0-4.7-2.8-9.1-7.1-11.2L371.8 1.5zM207.9 146.4c-4.2-2-9.1-2-13.3 0L84 199.3c-4.3 2.1-7.1 6.5-7.1 11.2c0 4.7 2.8 9.1 7.1 11.2l110.6 52.9c4.2 2 9.1 2 13.3 0l110.6-52.9c4.3-2.1 7.1-6.5 7.1-11.2c0-4.7-2.8-9.1-7.1-11.2l-110.6-52.9zM7.1 343.3C2.8 345.4 0 349.8 0 354.5c0 4.7 2.8 9.1 7.1 11.2l110.6 52.9c4.2 2 9.1 2 13.3 0l110.6-52.9c4.3-2.1 7.1-6.5 7.1-11.2c0-4.7-2.8-9.1-7.1-11.2L131 290.4c-4.2-2-9.1-2-13.3 0L7.1 343.3z"/>',
    viewBox: '0 0 512 512'
  },
  {
    id: 'games',
    title: 'Simulations & Games',
    shortTitle: 'Simulations & Games',
    desc: 'Interactive 3D vehicle physics simulation, circuit racer, and classic offline obstacle runner.',
    badgeLabel: 'Apps',
    iconSvg: '<path d="M192 64C86 64 0 150 0 256S86 448 192 448c56.3 0 106.8-24.3 141.9-63.1c11.9-13.1 30.2-20.9 49.3-20.9h60.8c19.1 0 37.4 7.8 49.3 20.9C527.2 423.7 577.7 448 634 448c106 0 192-86 192-192S740 64 634 64c-56.3 0-106.8 24.3-141.9 63.1c-11.9 13.1-30.2 20.9-49.3 20.9H382.1c-19.1 0-37.4-7.8-49.3-20.9C298.8 88.3 248.3 64 192 64zM160 192c0-8.8 7.2-16 16-16h32v-32c0-8.8 7.2-16 16-16s16 7.2 16 16v32h32c8.8 0 16 7.2 16 16s-7.2 16-16 16h-32v32c0 8.8-7.2 16-16 16s-16-7.2-16-16v-32h-32c-8.8 0-16-7.2-16-16zm320 0a24 24 0 1 1 0 48 24 24 0 1 1 0-48zm48 48a24 24 0 1 1 48 0 24 24 0 1 1 -48 0zm-48 48a24 24 0 1 1 0 48 24 24 0 1 1 0-48zm-48-48a24 24 0 1 1 48 0 24 24 0 1 1 -48 0z"/>',
    viewBox: '0 0 640 512'
  },
  {
    id: 'windows',
    title: 'PC & Windows Utilities',
    shortTitle: 'PC & Windows Utilities',
    desc: 'Lightweight desktop optimization tools, system repair, cache cleaner, and network diagnostic utilities.',
    badgeLabel: 'Utilities',
    iconSvg: '<path d="M0 93.7l183.6-25.3v177.4H0V93.7zm0 324.6l183.6 25.3V268.4H0v149.9zm203.8 28L448 480V268.4H203.8V446.3zM448 32L203.8 65.7v179.9H448V32z"/>',
    viewBox: '0 0 448 512'
  }
];

// ============================================
// TOOLS ARRAY (49 TOOLS ARRANGED BY DISCIPLINE)
// ============================================
const tools = [
  // ============================================
  // CIRCUITS & ELECTRONICS (19 tools)
  // ============================================
  {
    category: 'circuits',
    badge: 'Circuits',
    title: "Ohm's Law Calculator",
    desc: 'Calculate voltage, current, resistance and power with interactive IV curves and circuit analysis.',
    tag: 'V = I × R',
    href: '/sites/ohms-law-calculator.html',
    cta: 'Launch Calculator',
    svg: '<path d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V64c0-35.3-28.7-64-64-64H64zM96 64H288c17.7 0 32 14.3 32 32v32c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V96c0-17.7 14.3-32 32-32zm-16 160a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm112 0a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm80-32a32 32 0 1 1 0 64 32 32 0 1 1 0-64zM80 320a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm112 0a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm112 0a32 32 0 1 1 0 64 32 32 0 1 1 0-64zM80 416a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm112 0a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm80-32a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/>',
    viewBox: '0 0 384 512'
  },
  {
    category: 'circuits',
    badge: 'Circuits',
    title: 'Resistor Color Code Calculator',
    desc: '4, 5, and 6-band resistor color codes, SMD markings, tolerance limits, and power ratings.',
    tag: 'Color Bands & SMD',
    href: '/sites/resistor-calculator.html',
    cta: 'Launch Calculator',
    svg: '<path d="M0 256L224 0 160 208h176L80 512 160 288H0z"/>',
    viewBox: '0 0 384 512'
  },
  {
    category: 'circuits',
    badge: 'Circuits',
    title: 'Standard Resistor & Capacitor Finder',
    desc: 'Find nearest standard EIA values (E6 to E96) for resistors and capacitors, or synthesize exact values with series/parallel pairs.',
    tag: 'E6 to E96 EIA Values',
    href: '/sites/standard-resistor-capacitor-finder.html',
    cta: 'Launch Finder',
    svg: '<path d="M0 256L224 0 160 208h176L80 512 160 288H0z"/>',
    viewBox: '0 0 384 512'
  },
  {
    category: 'circuits',
    badge: 'Circuits',
    title: 'LED Series Resistor Calculator',
    desc: 'Calculate current-limiting series resistance, forward voltage drop, and safe LED power rating.',
    tag: 'Diode Limiting',
    href: '/sites/resistor-for-led.html',
    cta: 'Launch Calculator',
    svg: '<path d="M297.2 248.9C311.6 228.3 320 203.2 320 176c0-70.7-57.3-128-128-128S64 105.3 64 176c0 27.2 8.4 52.3 22.8 72.9c3.7 5.3 8.1 11.3 12.8 17.7l0 0c12.9 17.7 28.3 38.9 39.8 61.4H244.6c11.5-22.5 26.9-43.7 39.8-61.4l0 0c4.7-6.4 9.1-12.3 12.8-17.7zM352 176c0 38.4-14 73.5-37.4 100.8c-7.7 9-16.6 19.9-25.6 30.9c-15 18.3-30.5 37.2-39.9 58.7c-2.4 5.4-7.7 8.9-13.6 8.9H148.5c-5.9 0-11.2-3.5-13.6-8.9c-9.4-21.5-24.9-40.4-39.9-58.7c-9-11-17.9-21.9-25.6-30.9C46 249.5 32 214.4 32 176C32 87.6 103.6 16 192 16s160 71.6 160 160zM128 416c0-8.8 7.2-16 16-16h96c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16H144c-8.8 0-16-7.2-16-16V416zm32 64h64c8.8 0 16 7.2 16 16s-7.2 16-16 16H160c-8.8 0-16-7.2-16-16s7.2-16 16-16z"/>',
    viewBox: '0 0 384 512'
  },
  {
    category: 'circuits',
    badge: 'Circuits',
    title: 'Voltage Divider Calculator',
    desc: 'Solve Vout, R1, or R2 under load resistance, with power dissipation and E12/E24 standard picks.',
    tag: 'Loaded Divider',
    href: '/sites/voltage-divider-calculator.html',
    cta: 'Launch Calculator',
    svg: '<path d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V64c0-35.3-28.7-64-64-64H64zM96 64H288c17.7 0 32 14.3 32 32v32c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V96c0-17.7 14.3-32 32-32zm-16 160a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm112 0a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm80-32a32 32 0 1 1 0 64 32 32 0 1 1 0-64zM80 320a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm112 0a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm112 0a32 32 0 1 1 0 64 32 32 0 1 1 0-64zM80 416a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm112 0a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm80-32a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/>',
    viewBox: '0 0 384 512'
  },
  {
    category: 'circuits',
    badge: 'Circuits',
    title: 'LM317 Voltage Regulator Calculator',
    desc: 'Calculate resistors (R1, R2), target Vout, power dissipation, dropout voltage, and heatsink requirements.',
    tag: 'Linear Regulator',
    href: '/sites/lm317-voltage-regulator-calculator.html',
    cta: 'Launch Calculator',
    svg: '<path d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V64c0-35.3-28.7-64-64-64H64zM96 64H288c17.7 0 32 14.3 32 32v32c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V96c0-17.7 14.3-32 32-32zm-16 160a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm112 0a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm80-32a32 32 0 1 1 0 64 32 32 0 1 1 0-64zM80 320a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm112 0a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm112 0a32 32 0 1 1 0 64 32 32 0 1 1 0-64zM80 416a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm112 0a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm80-32a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/>',
    viewBox: '0 0 384 512'
  },
  {
    category: 'circuits',
    badge: 'Circuits',
    title: 'Capacitor Calculator',
    desc: 'Capacitance, stored energy (Joules), charge curves, and series/parallel bank configurations.',
    tag: 'Energy & RC Time',
    href: '/sites/capacitor-calculator.html',
    cta: 'Launch Calculator',
    svg: '<path d="M0 256a32 32 0 0 1 32-32h72.2l51.6-116.1c11.6-26.1 48.7-27.4 62.1-2.4L278.4 374l48.8-90.8A32 32 0 0 1 355.2 267H480a32 32 0 0 1 0 64H374.8l-48.8 90.8c-12 22.3-43.7 24.2-58.4 3.7L208.4 179l-49.6 111.6A32 32 0 0 1 129.6 311H32A32 32 0 0 1 0 256z"/>',
    viewBox: '0 0 512 512'
  },
  {
    category: 'circuits',
    badge: 'Circuits',
    title: 'Rectifier Filter Capacitor Calculator',
    desc: 'Calculate power supply smoothing capacitor values, ripple voltage, peak DC voltage, and safe capacitor ratings.',
    tag: 'Bridge Smoothing',
    href: '/sites/rectifier-filter-capacitor-calculator.html',
    cta: 'Launch Calculator',
    svg: '<path d="M0 256a32 32 0 0 1 32-32h72.2l51.6-116.1c11.6-26.1 48.7-27.4 62.1-2.4L278.4 374l48.8-90.8A32 32 0 0 1 355.2 267H480a32 32 0 0 1 0 64H374.8l-48.8 90.8c-12 22.3-43.7 24.2-58.4 3.7L208.4 179l-49.6 111.6A32 32 0 0 1 129.6 311H32A32 32 0 0 1 0 256z"/>',
    viewBox: '0 0 512 512'
  },
  {
    category: 'circuits',
    badge: 'Circuits',
    title: 'Inductance & Coil Calculator',
    desc: 'Air core coil inductor sizing, inductive reactance (XL), turns calculation, and permeability.',
    tag: 'XL & Air Core',
    href: '/sites/inductance-calculator.html',
    cta: 'Launch Calculator',
    svg: '<path d="M0 256L224 0 160 208h176L80 512 160 288H0z"/>',
    viewBox: '0 0 384 512'
  },
  {
    category: 'circuits',
    badge: 'Circuits',
    title: 'RC Time Constant Calculator',
    desc: 'RC charging & discharging curves, time constant (Tau), cutoff frequency, and capacitor voltages at time t.',
    tag: 'τ = R × C',
    href: '/sites/rc-time-constant-calculator.html',
    cta: 'Launch Calculator',
    svg: '<path d="M256 0a256 256 0 1 1 0 512A256 256 0 1 1 256 0zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"/>',
    viewBox: '0 0 512 512'
  },
  {
    category: 'circuits',
    badge: 'Circuits',
    title: 'RC Filter & LC Resonance',
    desc: 'Low/high pass RC filter cutoff frequencies (-3dB point) and LC tank resonant frequencies.',
    tag: 'f₀ Resonance',
    href: '/sites/rc-filter-lc-resonance-calculator.html',
    cta: 'Launch Calculator',
    svg: '<path d="M0 256a32 32 0 0 1 32-32h72.2l51.6-116.1c11.6-26.1 48.7-27.4 62.1-2.4L278.4 374l48.8-90.8A32 32 0 0 1 355.2 267H480a32 32 0 0 1 0 64H374.8l-48.8 90.8c-12 22.3-43.7 24.2-58.4 3.7L208.4 179l-49.6 111.6A32 32 0 0 1 129.6 311H32A32 32 0 0 1 0 256z"/>',
    viewBox: '0 0 512 512'
  },
  {
    category: 'circuits',
    badge: 'Circuits',
    title: 'Op-Amp Gain & Waveform Calculator',
    desc: 'Calculate inverting, non-inverting, summing, and differential op-amp circuits with interactive waveform visualization.',
    tag: 'Gain & Waveform',
    href: '/sites/op-amp-gain-calculator.html',
    cta: 'Launch Calculator',
    svg: '<path d="M0 256a32 32 0 0 1 32-32h72.2l51.6-116.1c11.6-26.1 48.7-27.4 62.1-2.4L278.4 374l48.8-90.8A32 32 0 0 1 355.2 267H480a32 32 0 0 1 0 64H374.8l-48.8 90.8c-12 22.3-43.7 24.2-58.4 3.7L208.4 179l-49.6 111.6A32 32 0 0 1 129.6 311H32A32 32 0 0 1 0 256z"/>',
    viewBox: '0 0 512 512'
  },
  {
    category: 'circuits',
    badge: 'Circuits',
    title: '555 Timer IC Calculator',
    desc: 'Astable frequency, duty cycle, mark/space times, and monostable pulse width timer sizing.',
    tag: 'Astable & Monostable',
    href: '/sites/555-timer-calculator.html',
    cta: 'Launch Calculator',
    svg: '<path d="M256 0a256 256 0 1 1 0 512A256 256 0 1 1 256 0zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"/>',
    viewBox: '0 0 512 512'
  },
  {
    category: 'circuits',
    badge: 'Circuits',
    title: 'ADC Calculator',
    desc: 'ADC bit resolution (8 to 24-bit), LSB voltage step, raw digital counts to analog volts, and input voltage dividers.',
    tag: 'Bit Resolution',
    href: '/sites/adc-calculator.html',
    cta: 'Launch Calculator',
    svg: '<path d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V64c0-35.3-28.7-64-64-64H64zM96 64H288c17.7 0 32 14.3 32 32v32c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V96c0-17.7 14.3-32 32-32zm-16 160a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm112 0a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm80-32a32 32 0 1 1 0 64 32 32 0 1 1 0-64zM80 320a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm112 0a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm112 0a32 32 0 1 1 0 64 32 32 0 1 1 0-64zM80 416a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm112 0a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm80-32a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/>',
    viewBox: '0 0 384 512'
  },
  {
    category: 'circuits',
    badge: 'Circuits',
    title: 'PWM Calculator',
    desc: 'PWM average voltage, high/low pulse widths, max bit resolution, and hardware timer register values for Arduino and ESP32.',
    tag: 'Duty Cycle & Timers',
    href: '/sites/pwm-calculator.html',
    cta: 'Launch Calculator',
    svg: '<path d="M0 256a32 32 0 0 1 32-32h72.2l51.6-116.1c11.6-26.1 48.7-27.4 62.1-2.4L278.4 374l48.8-90.8A32 32 0 0 1 355.2 267H480a32 32 0 0 1 0 64H374.8l-48.8 90.8c-12 22.3-43.7 24.2-58.4 3.7L208.4 179l-49.6 111.6A32 32 0 0 1 129.6 311H32A32 32 0 0 1 0 256z"/>',
    viewBox: '0 0 512 512'
  },
  {
    category: 'circuits',
    badge: 'Circuits',
    title: 'UART Baud Rate Calculator',
    desc: 'AVR/PIC UBRR register values, actual baud rates, clock divisors, and percentage error with Double Speed (U2X) mode.',
    tag: 'UBRR Register & Error',
    href: '/sites/uart-baud-rate-calculator.html',
    cta: 'Launch Calculator',
    svg: '<path d="M0 256a32 32 0 0 1 32-32h72.2l51.6-116.1c11.6-26.1 48.7-27.4 62.1-2.4L278.4 374l48.8-90.8A32 32 0 0 1 355.2 267H480a32 32 0 0 1 0 64H374.8l-48.8 90.8c-12 22.3-43.7 24.2-58.4 3.7L208.4 179l-49.6 111.6A32 32 0 0 1 129.6 311H32A32 32 0 0 1 0 256z"/>',
    viewBox: '0 0 512 512'
  },
  {
    category: 'circuits',
    badge: 'Circuits',
    title: 'LCD Character Generator',
    desc: 'Visual 5x8 dot matrix bitmap pixel editor with instant byte array hex output for HD44780 displays.',
    tag: 'HD44780 5x8 Matrix',
    href: '/sites/lcd-custom-character-generator.html',
    cta: 'Launch Generator',
    svg: '<path d="M64 0C28.7 0 0 28.7 0 64V352c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V64c0-35.3-28.7-64-64-64H64zM448 352H64V64H448V352zM160 448H352c17.7 0 32 14.3 32 32s-14.3 32-32 32H160c-17.7 0-32-14.3-32-32s14.3-32 32-32z"/>',
    viewBox: '0 0 512 512'
  },
  {
    category: 'circuits',
    badge: 'Circuits',
    title: 'Electrical System Calculator',
    desc: 'Comprehensive calculator for single-phase and three-phase AC systems, power factor, apparent power, and impedance.',
    tag: '1-Phase & 3-Phase',
    href: '/sites/electrical-calculation.html',
    cta: 'Launch Calculator',
    svg: '<path d="M0 256L224 0 160 208h176L80 512 160 288H0z"/>',
    viewBox: '0 0 384 512'
  },
  {
    category: 'circuits',
    badge: 'Circuits',
    title: 'Length & PCB Unit Converter',
    desc: 'Convert between mil, mm, inch, oz copper thickness, PCB trace dimensions, and metric units.',
    tag: 'mil / mm / inch / oz',
    href: '/sites/length-converter.html',
    cta: 'Launch Converter',
    svg: '<path d="M0 256a32 32 0 0 1 32-32h72.2l51.6-116.1c11.6-26.1 48.7-27.4 62.1-2.4L278.4 374l48.8-90.8A32 32 0 0 1 355.2 267H480a32 32 0 0 1 0 64H374.8l-48.8 90.8c-12 22.3-43.7 24.2-58.4 3.7L208.4 179l-49.6 111.6A32 32 0 0 1 129.6 311H32A32 32 0 0 1 0 256z"/>',
    viewBox: '0 0 512 512'
  },

  // ============================================
  // POWER, SOLAR & RF (14 tools)
  // ============================================
  {
    category: 'power',
    badge: 'Solar & Power',
    title: 'Solar System Sizing Calculator',
    desc: 'Calculate required solar panels (Wp), battery storage (Ah), inverter wattage, and MPPT charge controller sizing.',
    tag: 'PV Array & Inverter',
    href: '/sites/solar-system-sizing-calculator.html',
    cta: 'Launch Sizing Tool',
    svg: '<path d="M0 256L224 0 160 208h176L80 512 160 288H0z"/>',
    viewBox: '0 0 384 512'
  },
  {
    category: 'power',
    badge: 'Solar & Power',
    title: 'Solar Battery Wiring Calculator',
    desc: 'Calculate required solar battery capacity, series and parallel string wiring (Ns x Np), and total battery modules.',
    tag: 'Ns × Np Bank Strings',
    href: '/sites/solar-battery-series-parallel-calculator.html',
    cta: 'Launch Calculator',
    svg: '<path d="M0 256L224 0 160 208h176L80 512 160 288H0z"/>',
    viewBox: '0 0 384 512'
  },
  {
    category: 'power',
    badge: 'Solar & Power',
    title: 'Solar Inverter Sizing Calculator',
    desc: 'Size continuous power (W), motor starting surge (kVA/kW), and DC battery current for solar inverters with safety margins.',
    tag: 'Surge & Continuous W',
    href: '/sites/solar-inverter-sizing-calculator.html',
    cta: 'Launch Sizing Tool',
    svg: '<path d="M0 256L224 0 160 208h176L80 512 160 288H0z"/>',
    viewBox: '0 0 384 512'
  },
  {
    category: 'power',
    badge: 'Solar & Power',
    title: 'Battery & Solar Sizing',
    desc: 'Off-grid solar system sizing: daily load kWh, battery autonomy days, and solar array peak power.',
    tag: 'Off-Grid Energy',
    href: '/sites/battery-solar-calculator.html',
    cta: 'Launch Calculator',
    svg: '<path d="M0 256L224 0 160 208h176L80 512 160 288H0z"/>',
    viewBox: '0 0 384 512'
  },
  {
    category: 'power',
    badge: 'Solar & Power',
    title: 'Battery Capacity & Runtime',
    desc: 'Battery discharge duration, Peukert’s exponent, C-rate, and state of charge (SoC) estimation.',
    tag: 'Peukert Runtime',
    href: '/sites/battery-capacity-runtime-calculator.html',
    cta: 'Launch Calculator',
    svg: '<path d="M0 256L224 0 160 208h176L80 512 160 288H0z"/>',
    viewBox: '0 0 384 512'
  },
  {
    category: 'power',
    badge: 'Power & PCB',
    title: 'PCB Trace Width Calculator',
    desc: 'Calculate internal and external trace widths, current capacity, cross-sectional area, and thermal temperature rise.',
    tag: 'IPC-2152 / 2221',
    href: '/sites/pcb-trace-width-calculator.html',
    cta: 'Launch Calculator',
    svg: '<path d="M0 256L224 0 160 208h176L80 512 160 288H0z"/>',
    viewBox: '0 0 384 512'
  },
  {
    category: 'power',
    badge: 'Power Electronics',
    title: 'Buck-Boost Converter Calculator',
    desc: 'Calculate inductor, capacitor, and ripple current values for DC-DC switch-mode buck and boost converters.',
    tag: 'SMPS Inductor & Cap',
    href: '/sites/buck-boost-calculator.html',
    cta: 'Launch Calculator',
    svg: '<path d="M0 256L224 0 160 208h176L80 512 160 288H0z"/>',
    viewBox: '0 0 384 512'
  },
  {
    category: 'power',
    badge: 'Power Electronics',
    title: 'Duty Cycle Calculator',
    desc: 'Calculate duty cycle for periodic pulse waveforms, Step-Up Boost, Step-Down Buck, Buck-Boost, and Ćuk converters.',
    tag: 'PWM & SMPS Topologies',
    href: '/sites/duty-cycle-calculator.html',
    cta: 'Launch Calculator',
    svg: '<path d="M256 0a256 256 0 1 1 0 512A256 256 0 1 1 256 0zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"/>',
    viewBox: '0 0 512 512'
  },
  {
    category: 'power',
    badge: 'Power & Solar',
    title: 'Wire Size & Breaker Calculator',
    desc: 'Calculate conductor cross-section, voltage drop, and circuit breaker sizing per IEC 60364 and NEC standards.',
    tag: 'IEC 60364 & NEC',
    href: '/sites/wire-size-voltage-drop-breaker-calculator.html',
    cta: 'Launch Sizing Tool',
    svg: '<path d="M0 256L224 0 160 208h176L80 512 160 288H0z"/>',
    viewBox: '0 0 384 512'
  },
  {
    category: 'power',
    badge: 'Power & Solar',
    title: 'Wire Gauge (AWG) Calculator',
    desc: 'AWG to diameter/cross-section conversion, resistance per meter/foot, and safe copper wire ampacity.',
    tag: 'AWG to mm²',
    href: '/sites/wire-gauge-calculator.html',
    cta: 'Launch Calculator',
    svg: '<path d="M0 256L224 0 160 208h176L80 512 160 288H0z"/>',
    viewBox: '0 0 384 512'
  },
  {
    category: 'power',
    badge: 'Power & Solar',
    title: 'Power Factor Correction',
    desc: 'Target power factor correction, required capacitor bank kVAR, reactive power, and current reduction.',
    tag: 'kVAR Bank Sizing',
    href: '/sites/power-factor-calculator.html',
    cta: 'Launch Calculator',
    svg: '<path d="M0 256L224 0 160 208h176L80 512 160 288H0z"/>',
    viewBox: '0 0 384 512'
  },
  {
    category: 'power',
    badge: 'Power & Solar',
    title: 'Power Triangle Calculator',
    desc: 'Real (P), reactive (Q), and apparent power (S) calculation, power factor, and AC phase angle.',
    tag: 'kW, kVA & kVAR',
    href: '/sites/power-triangle-calculator.html',
    cta: 'Launch Calculator',
    svg: '<path d="M0 256L224 0 160 208h176L80 512 160 288H0z"/>',
    viewBox: '0 0 384 512'
  },
  {
    category: 'power',
    badge: 'Power & Solar',
    title: 'Transformer Turns Ratio',
    desc: 'Primary/secondary voltage, current, turns ratio, and impedance transformation for step-up/down transformers.',
    tag: 'Np/Ns & Impedance',
    href: '/sites/transformer-turns-calculator.html',
    cta: 'Launch Calculator',
    svg: '<path d="M0 256L224 0 160 208h176L80 512 160 288H0z"/>',
    viewBox: '0 0 384 512'
  },
  {
    category: 'power',
    badge: 'RF & Telecom',
    title: 'dB / dBm & RF Calculator',
    desc: 'Power ratios in decibels, dBm to Watts conversion, signal-to-noise ratio (SNR), and RF link attenuation.',
    tag: 'dB, dBm, dBW & Watts',
    href: '/sites/decibel-dbm-calculator.html',
    cta: 'Launch Calculator',
    svg: '<path d="M0 256a32 32 0 0 1 32-32h72.2l51.6-116.1c11.6-26.1 48.7-27.4 62.1-2.4L278.4 374l48.8-90.8A32 32 0 0 1 355.2 267H480a32 32 0 0 1 0 64H374.8l-48.8 90.8c-12 22.3-43.7 24.2-58.4 3.7L208.4 179l-49.6 111.6A32 32 0 0 1 129.6 311H32A32 32 0 0 1 0 256z"/>',
    viewBox: '0 0 512 512'
  },

  // ============================================
  // PRODUCTIVITY & AI
  // ============================================
  {
    category: 'productivity',
    badge: 'Platform',
    title: 'M.T.A. Lab & Articles Hub',
    desc: 'Engineering articles, tutorials, curated AI tools directory, production prompts library, and downloadable resources.',
    tag: 'Articles & AI Hub',
    href: '/article/',
    cta: 'Explore M.T.A. Lab',
    svg: '<path d="M96 0C43 0 0 43 0 96V416c0 53 43 96 96 96H384h32c17.7 0 32-14.3 32-32s-14.3-32-32-32V384c17.7 0 32-14.3 32-32V32c0-17.7-14.3-32-32-32H384 96zm0 384H352v64H96c-17.7 0-32-14.3-32-32s14.3-32 32-32zm32-240c0-8.8 7.2-16 16-16H304c8.8 0 16 7.2 16 16s-7.2 16-16 16H144c-8.8 0-16-7.2-16-16zm0 64c0-8.8 7.2-16 16-16H304c8.8 0 16 7.2 16 16s-7.2 16-16 16H144c-8.8 0-16-7.2-16-16zm0 64c0-8.8 7.2-16 16-16H240c8.8 0 16 7.2 16 16s-7.2 16-16 16H144c-8.8 0-16-7.2-16-16z"/>',
    viewBox: '0 0 512 512'
  },
  {
    category: 'productivity',
    badge: 'Directory',
    title: 'AI Tools & Models Directory',
    desc: 'Curated directory of top AI platforms, LLMs, image/video generators, and coding assistants.',
    tag: 'LLMs & AI Stack',
    href: '/sites/ai-sites-list.html',
    cta: 'Explore Directory',
    svg: '<path d="M371.8 1.5c-4.2-2-9.1-2-13.3 0L247.9 54.4c-4.3 2.1-7.1 6.5-7.1 11.2c0 4.7 2.8 9.1 7.1 11.2l110.6 52.9c4.2 2 9.1 2 13.3 0l110.6-52.9c4.3-2.1 7.1-6.5 7.1-11.2c0-4.7-2.8-9.1-7.1-11.2L371.8 1.5zM207.9 146.4c-4.2-2-9.1-2-13.3 0L84 199.3c-4.3 2.1-7.1 6.5-7.1 11.2c0 4.7 2.8 9.1 7.1 11.2l110.6 52.9c4.2 2 9.1 2 13.3 0l110.6-52.9c4.3-2.1 7.1-6.5 7.1-11.2c0-4.7-2.8-9.1-7.1-11.2l-110.6-52.9zM7.1 343.3C2.8 345.4 0 349.8 0 354.5c0 4.7 2.8 9.1 7.1 11.2l110.6 52.9c4.2 2 9.1 2 13.3 0l110.6-52.9c4.3-2.1 7.1-6.5 7.1-11.2c0-4.7-2.8-9.1-7.1-11.2L131 290.4c-4.2-2-9.1-2-13.3 0L7.1 343.3z"/>',
    viewBox: '0 0 512 512'
  },
  {
    category: 'productivity',
    badge: 'Productivity',
    title: 'Mastering Linux Commands',
    desc: 'Comprehensive terminal guide covering navigation, package management, permissions, and bash syntax.',
    tag: 'Cheat Sheet',
    href: '/sites/mastering-linux-commands.html',
    cta: 'Open Terminal Guide',
    svg: '<path d="M0 256a32 32 0 0 1 32-32h72.2l51.6-116.1c11.6-26.1 48.7-27.4 62.1-2.4L278.4 374l48.8-90.8A32 32 0 0 1 355.2 267H480a32 32 0 0 1 0 64H374.8l-48.8 90.8c-12 22.3-43.7 24.2-58.4 3.7L208.4 179l-49.6 111.6A32 32 0 0 1 129.6 311H32A32 32 0 0 1 0 256z"/>',
    viewBox: '0 0 512 512'
  },
  {
    category: 'productivity',
    badge: 'Productivity',
    title: 'To-Do List & Task Manager',
    desc: 'Clean task organizer with local persistence, priority tagging, categorization, and progress tracking.',
    tag: 'Local Storage',
    href: '/sites/to-do-list.html',
    cta: 'Open Task Manager',
    svg: '<path d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V64c0-35.3-28.7-64-64-64H64zM96 64H288c17.7 0 32 14.3 32 32v32c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V96c0-17.7 14.3-32 32-32zm-16 160a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm112 0a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm80-32a32 32 0 1 1 0 64 32 32 0 1 1 0-64zM80 320a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm112 0a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm112 0a32 32 0 1 1 0 64 32 32 0 1 1 0-64zM80 416a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm112 0a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm80-32a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/>',
    viewBox: '0 0 384 512'
  },
  {
    category: 'productivity',
    badge: 'Productivity',
    title: 'Medication Reminder App',
    desc: 'Dosage tracking, recurring schedule alarms, audio notifications, and adherence logging.',
    tag: 'Health Schedule',
    href: '/sites/medication-reminder.html',
    cta: 'Open Reminder App',
    svg: '<path d="M256 0a256 256 0 1 1 0 512A256 256 0 1 1 256 0zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"/>',
    viewBox: '0 0 512 512'
  },

  // ============================================
  // SIMULATIONS & GAMES (3 tools)
  // ============================================
  {
    category: 'games',
    badge: 'Simulation',
    title: '3D Car Drive Simulator',
    desc: 'Interactive 3D WebGL physics-based driving simulator with vehicle dynamics and camera controls.',
    tag: 'WebGL 3D',
    href: '/sites/3d-car-game.html',
    cta: 'Play Simulation',
    svg: '<path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L0 288v160c0 17.7 14.3 32 32 32h32c17.7 0 32-14.3 32-32V416h256v32c0 17.7 14.3 32 32 32h32c17.7 0 32-14.3 32-32V288l-32-160zM96 352a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm256 0a48 48 0 1 1 96 0 48 48 0 1 1 -96 0z"/>',
    viewBox: '0 0 512 512'
  },
  {
    category: 'games',
    badge: 'Arcade Game',
    title: 'Circuit Race Game',
    desc: 'Retro electronic-themed top-down racing game on circuit board tracks with collision physics and lap timers.',
    tag: 'Canvas 2D',
    href: '/sites/race-game.html',
    cta: 'Start Race',
    svg: '<path d="M192 64C86 64 0 150 0 256S86 448 192 448c56.3 0 106.8-24.3 141.9-63.1c11.9-13.1 30.2-20.9 49.3-20.9h60.8c19.1 0 37.4 7.8 49.3 20.9C527.2 423.7 577.7 448 634 448c106 0 192-86 192-192S740 64 634 64c-56.3 0-106.8 24.3-141.9 63.1c-11.9 13.1-30.2 20.9-49.3 20.9H382.1c-19.1 0-37.4-7.8-49.3-20.9C298.8 88.3 248.3 64 192 64z"/>',
    viewBox: '0 0 640 512'
  },
  {
    category: 'games',
    badge: 'Arcade Game',
    title: 'Classic Dino Runner',
    desc: 'Fast-paced canvas obstacle jumping game inspired by the classic offline browser runner.',
    tag: 'Offline Canvas',
    href: '/sites/dino-game.html',
    cta: 'Play Game',
    svg: '<path d="M192 64C86 64 0 150 0 256S86 448 192 448c56.3 0 106.8-24.3 141.9-63.1c11.9-13.1 30.2-20.9 49.3-20.9h60.8c19.1 0 37.4 7.8 49.3 20.9C527.2 423.7 577.7 448 634 448c106 0 192-86 192-192S740 64 634 64c-56.3 0-106.8 24.3-141.9 63.1c-11.9 13.1-30.2 20.9-49.3 20.9H382.1c-19.1 0-37.4-7.8-49.3-20.9C298.8 88.3 248.3 64 192 64z"/>',
    viewBox: '0 0 640 512'
  },

  // ============================================
  // PC & WINDOWS UTILITIES (9 tools)
  // ============================================
  {
    category: 'windows',
    badge: 'Windows Tool',
    title: 'M.T.A. UltimatePerformance',
    desc: 'Unlock Windows Ultimate Performance power plan for zero-latency CPU scaling and maximum responsiveness.',
    tag: 'ZIP & RAR (.exe)',
    href: '/tools/M.T.A.%20UltimatePerformance%20Tool.zip',
    rarHref: '/tools/M.T.A.%20UltimatePerformance%20Tool.rar',
    cta: 'Download ZIP',
    svg: '<path d="M0 93.7l183.6-25.3v177.4H0V93.7zm0 324.6l183.6 25.3V268.4H0v149.9zm203.8 28L448 480V268.4H203.8V446.3zM448 32L203.8 65.7v179.9H448V32z"/>',
    viewBox: '0 0 448 512'
  },
  {
    category: 'windows',
    badge: 'Windows Tool',
    title: 'M.T.A. Tweaking Tool',
    desc: 'Deep OS optimization tool to disable telemetry, bloatware services, and enhance gaming performance.',
    tag: 'ZIP & RAR (.exe)',
    href: '/tools/M.T.A.%20Tweaking%20Tool.zip',
    rarHref: '/tools/M.T.A.%20Tweaking%20Tool.rar',
    cta: 'Download ZIP',
    svg: '<path d="M0 93.7l183.6-25.3v177.4H0V93.7zm0 324.6l183.6 25.3V268.4H0v149.9zm203.8 28L448 480V268.4H203.8V446.3zM448 32L203.8 65.7v179.9H448V32z"/>',
    viewBox: '0 0 448 512'
  },
  {
    category: 'windows',
    badge: 'Windows Tool',
    title: 'M.T.A. Cleaner Tool',
    desc: 'Comprehensive junk cleaner: temporary files, system caches, browser caches, and Windows log cleanup.',
    tag: 'ZIP & RAR (.exe)',
    href: '/tools/M.T.A.%20Cleaner%20Tool.zip',
    rarHref: '/tools/M.T.A.%20Cleaner%20Tool.rar',
    cta: 'Download ZIP',
    svg: '<path d="M0 93.7l183.6-25.3v177.4H0V93.7zm0 324.6l183.6 25.3V268.4H0v149.9zm203.8 28L448 480V268.4H203.8V446.3zM448 32L203.8 65.7v179.9H448V32z"/>',
    viewBox: '0 0 448 512'
  },
  {
    category: 'windows',
    badge: 'Windows Tool',
    title: 'M.T.A. repair Tool',
    desc: 'Automated Windows system repair utility utilizing SFC, DISM, and component store integrity verification.',
    tag: 'ZIP & RAR (.exe)',
    href: '/tools/M.T.A.%20%20repair%20%20Tool.zip',
    rarHref: '/tools/M.T.A.%20%20repair%20%20Tool.rar',
    cta: 'Download ZIP',
    svg: '<path d="M0 93.7l183.6-25.3v177.4H0V93.7zm0 324.6l183.6 25.3V268.4H0v149.9zm203.8 28L448 480V268.4H203.8V446.3zM448 32L203.8 65.7v179.9H448V32z"/>',
    viewBox: '0 0 448 512'
  },
  {
    category: 'windows',
    badge: 'Windows Tool',
    title: 'M.T.A. Win11 Defender Tool',
    desc: 'Windows Defender manager and security configuration utility for Windows 11 and 10.',
    tag: 'ZIP & RAR (.exe)',
    href: '/tools/M.T.A.%20Win11%20Defender%20Tool.zip',
    rarHref: '/tools/M.T.A.%20Win11%20Defender%20Tool.rar',
    cta: 'Download ZIP',
    svg: '<path d="M0 93.7l183.6-25.3v177.4H0V93.7zm0 324.6l183.6 25.3V268.4H0v149.9zm203.8 28L448 480V268.4H203.8V446.3zM448 32L203.8 65.7v179.9H448V32z"/>',
    viewBox: '0 0 448 512'
  },
  {
    category: 'windows',
    badge: 'Windows Tool',
    title: 'M.T.A. PCInfo Tool',
    desc: 'Detailed hardware specs, CPU/GPU temperatures, RAM frequency, disk health, and BIOS version info.',
    tag: 'ZIP & RAR (.exe)',
    href: '/tools/M.T.A.%20PCInfo%20Tool.zip',
    rarHref: '/tools/M.T.A.%20PCInfo%20Tool.rar',
    cta: 'Download ZIP',
    svg: '<path d="M0 93.7l183.6-25.3v177.4H0V93.7zm0 324.6l183.6 25.3V268.4H0v149.9zm203.8 28L448 480V268.4H203.8V446.3zM448 32L203.8 65.7v179.9H448V32z"/>',
    viewBox: '0 0 448 512'
  },
  {
    category: 'windows',
    badge: 'Windows Tool',
    title: 'M.T.A. IP & MAC Tool',
    desc: 'Network adapter diagnostics, local/public IP lookup, MAC address cloning/spoofing, and DNS flusher.',
    tag: 'ZIP & RAR (.exe)',
    href: '/tools/M.T.A.%20ip%20and%20mac%20Tool.zip',
    rarHref: '/tools/M.T.A.%20ip%20and%20mac%20Tool.rar',
    cta: 'Download ZIP',
    svg: '<path d="M0 93.7l183.6-25.3v177.4H0V93.7zm0 324.6l183.6 25.3V268.4H0v149.9zm203.8 28L448 480V268.4H203.8V446.3zM448 32L203.8 65.7v179.9H448V32z"/>',
    viewBox: '0 0 448 512'
  },
  {
    category: 'windows',
    badge: 'Windows Tool',
    title: 'M.T.A. Downloader Tool',
    desc: 'Multi-threaded batch file downloader with automatic resume, checksum verification, and speed optimization.',
    tag: 'ZIP & RAR (.exe)',
    href: '/tools/M.T.A.%20Downloader%20Tool.zip',
    rarHref: '/tools/M.T.A.%20Downloader%20Tool.rar',
    cta: 'Download ZIP',
    svg: '<path d="M0 93.7l183.6-25.3v177.4H0V93.7zm0 324.6l183.6 25.3V268.4H0v149.9zm203.8 28L448 480V268.4H203.8V446.3zM448 32L203.8 65.7v179.9H448V32z"/>',
    viewBox: '0 0 448 512'
  },
  {
    category: 'windows',
    badge: 'Windows Tool',
    title: 'M.T.A. Active 10 Utility',
    desc: 'System activation helper and status inspector for Windows 10/11 operating systems.',
    tag: 'ZIP & RAR (.exe)',
    href: '/tools/M.T.A.%20active%2010%20Tool.zip',
    rarHref: '/tools/M.T.A.%20active%2010%20Tool.rar',
    cta: 'Download ZIP',
    svg: '<path d="M0 93.7l183.6-25.3v177.4H0V93.7zm0 324.6l183.6 25.3V268.4H0v149.9zm203.8 28L448 480V268.4H203.8V446.3zM448 32L203.8 65.7v179.9H448V32z"/>',
    viewBox: '0 0 448 512'
  }
];

// Calculate counts
const counts = {
  all: tools.length,
  circuits: tools.filter(t => t.category === 'circuits').length,
  power: tools.filter(t => t.category === 'power').length,
  productivity: tools.filter(t => t.category === 'productivity').length,
  games: tools.filter(t => t.category === 'games').length,
  windows: tools.filter(t => t.category === 'windows').length
};

console.log('Tool counts:', counts);

// ============================================
// HTML GENERATOR HELPERS
// ============================================
function generateCardHtml(t, isHubPage = false) {
  const isWindows = t.category === 'windows';
  const ariaLabel = `${t.title} — ${t.desc}`;

  if (isWindows) {
    return `          <div class="tool-card reveal tool-card-download" data-category="${t.category}" data-title="${t.title.toLowerCase()}" data-desc="${t.desc.toLowerCase()}" data-tag="${t.tag.toLowerCase()}">
            <div class="tool-card-head">
              <div class="tool-card-icon" aria-hidden="true"><svg viewBox="${t.viewBox}" aria-hidden="true">${t.svg}</svg></div>
              <span class="tool-card-badge">${t.badge}</span>
            </div>
            <h3 class="tool-card-title">${t.title}</h3>
            <p class="tool-card-desc">${t.desc}</p>
            <div class="tool-card-footer">
              <span class="tool-card-tag">${t.tag}</span>
              <div class="tool-card-cta-group">
                <a href="${t.href}" class="tool-card-cta" download aria-label="Download ${t.title} ZIP">${t.cta} <svg viewBox="0 0 384 512" aria-hidden="true" style="width:12px;height:12px;fill:currentColor"><path d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.8 224 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"/></svg></a>
                ${t.rarHref ? `<a href="${t.rarHref}" class="tool-card-rar-link" download title="Download RAR archive" aria-label="Download ${t.title} RAR">.RAR</a>` : ''}
              </div>
            </div>
          </div>`;
  }

  return `          <a href="${t.href}" class="tool-card reveal" data-category="${t.category}" data-title="${t.title.toLowerCase()}" data-desc="${t.desc.toLowerCase()}" data-tag="${t.tag.toLowerCase()}" target="_blank" rel="noopener noreferrer" aria-label="${ariaLabel}">
            <div class="tool-card-head">
              <div class="tool-card-icon" aria-hidden="true"><svg viewBox="${t.viewBox}" aria-hidden="true">${t.svg}</svg></div>
              <span class="tool-card-badge">${t.badge}</span>
            </div>
            <h3 class="tool-card-title">${t.title}</h3>
            <p class="tool-card-desc">${t.desc}</p>
            <div class="tool-card-footer">
              <span class="tool-card-tag">${t.tag}</span>
              <span class="tool-card-cta">${t.cta} <svg viewBox="0 0 448 512" aria-hidden="true"><path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"/></svg></span>
            </div>
          </a>`;
}

function generateGroupsHtml(isHubPage = false) {
  const groupBlocks = categories.map(cat => {
    const catTools = tools.filter(t => t.category === cat.id);
    const cardsHtml = catTools.map(t => generateCardHtml(t, isHubPage)).join('\n');
    return `          <!-- Category: ${cat.title} (${catTools.length}) -->
          <div class="tools-category-group" data-category="${cat.id}" id="category-${cat.id}">
            <div class="tools-category-header reveal">
              <div class="tools-category-info">
                <div class="tools-category-icon-box" aria-hidden="true">
                  <svg viewBox="${cat.viewBox}" aria-hidden="true">${cat.iconSvg}</svg>
                </div>
                <div>
                  <h3 class="tools-category-title">${cat.title}</h3>
                  <p class="tools-category-desc">${cat.desc}</p>
                </div>
              </div>
              <span class="tools-category-badge">${catTools.length} ${cat.badgeLabel}</span>
            </div>
            <div class="tools-grid">
${cardsHtml}
            </div>
          </div>`;
  }).join('\n\n');

  const emptyStateHtml = `          <!-- Empty Search State -->
          <div class="tools-empty-state" id="toolsEmptyState">
            <div style="font-size:2.5rem;margin-bottom:0.75rem" aria-hidden="true">🔍</div>
            <h3 style="font-size:1.25rem;margin-bottom:0.5rem;color:#ffffff">No matching tools found</h3>
            <p style="color:var(--color-text-secondary);font-size:0.9rem;margin-bottom:1.25rem">Try searching for a different keyword or switch categories.</p>
            <button id="toolsResetFilterBtn" class="btn btn-primary" style="padding:8px 18px;font-size:0.85rem">Reset Filters</button>
          </div>`;

  return `        <!-- ${counts.all} Pro Tools Arranged by Discipline -->
        <div class="tools-groups-container" id="toolsGrid">

${groupBlocks}

${emptyStateHtml}
        </div>`;
}

// Filter pills HTML
const filterPillsHtml = `          <div class="tools-filter-pills" role="tablist" aria-label="Filter tools by discipline">
            <button class="tools-filter-pill active" data-filter="all" role="tab" aria-selected="true">
              All Tools <span class="pill-count" id="count-all">${counts.all}</span>
            </button>
            <button class="tools-filter-pill" data-filter="circuits" role="tab" aria-selected="false">
              Circuits &amp; Electronics <span class="pill-count">${counts.circuits}</span>
            </button>
            <button class="tools-filter-pill" data-filter="power" role="tab" aria-selected="false">
              Power &amp; Solar <span class="pill-count">${counts.power}</span>
            </button>
            <button class="tools-filter-pill" data-filter="productivity" role="tab" aria-selected="false">
              Productivity &amp; AI <span class="pill-count">${counts.productivity}</span>
            </button>
            <button class="tools-filter-pill" data-filter="games" role="tab" aria-selected="false">
              Simulations &amp; Games <span class="pill-count">${counts.games}</span>
            </button>
            <button class="tools-filter-pill" data-filter="windows" role="tab" aria-selected="false">
              PC &amp; Windows Utilities <span class="pill-count">${counts.windows}</span>
            </button>
          </div>`;

// Client-side Filter & Live Search Script Block (pure JS body)
const toolsFilterBlock = `/* ----------------------------------------
         TOOLS FILTER & LIVE SEARCH
         ---------------------------------------- */
      const toolsSearchInput = document.getElementById("toolsSearchInput");
      const toolsClearSearchBtn = document.getElementById("toolsClearSearchBtn");
      const toolsFilterPills = document.querySelectorAll(".tools-filter-pill");
      const categoryGroups = document.querySelectorAll(".tools-category-group");
      const toolsEmptyState = document.getElementById("toolsEmptyState");
      const toolsResetFilterBtn = document.getElementById("toolsResetFilterBtn");
      let currentToolFilter = "all";

      function applyToolFilters() {
        const query = (toolsSearchInput ? toolsSearchInput.value : "").trim().toLowerCase();
        if (toolsClearSearchBtn) {
          toolsClearSearchBtn.style.display = query ? "flex" : "none";
        }

        let totalVisible = 0;
        categoryGroups.forEach((group) => {
          const groupCategory = group.getAttribute("data-category");
          const categoryMatches = (currentToolFilter === "all" || groupCategory === currentToolFilter);

          if (!categoryMatches) {
            group.style.display = "none";
            return;
          }

          const cards = group.querySelectorAll(".tool-card");
          let groupVisibleCards = 0;

          cards.forEach((card) => {
            const title = card.getAttribute("data-title") || "";
            const desc = card.getAttribute("data-desc") || "";
            const tag = card.getAttribute("data-tag") || "";
            const matchesQuery = !query || title.includes(query) || desc.includes(query) || tag.includes(query);

            if (matchesQuery) {
              card.style.display = "flex";
              card.classList.add("revealed");
              groupVisibleCards++;
              totalVisible++;
            } else {
              card.style.display = "none";
            }
          });

          if (groupVisibleCards > 0) {
            group.style.display = "block";
          } else {
            group.style.display = "none";
          }
        });

        if (toolsEmptyState) {
          toolsEmptyState.classList.toggle("visible", totalVisible === 0);
        }
      }

      if (toolsSearchInput) {
        toolsSearchInput.addEventListener("input", applyToolFilters);
      }

      if (toolsClearSearchBtn) {
        toolsClearSearchBtn.addEventListener("click", () => {
          if (toolsSearchInput) {
            toolsSearchInput.value = "";
            toolsSearchInput.focus();
            applyToolFilters();
          }
        });
      }

      toolsFilterPills.forEach((pill) => {
        pill.addEventListener("click", () => {
          toolsFilterPills.forEach((p) => {
            p.classList.remove("active");
            p.setAttribute("aria-selected", "false");
          });
          pill.classList.add("active");
          pill.setAttribute("aria-selected", "true");
          currentToolFilter = pill.getAttribute("data-filter") || "all";
          applyToolFilters();
        });
      });

      if (toolsResetFilterBtn) {
        toolsResetFilterBtn.addEventListener("click", () => {
          if (toolsSearchInput) toolsSearchInput.value = "";
          currentToolFilter = "all";
          toolsFilterPills.forEach((p) => {
            const isAll = p.getAttribute("data-filter") === "all";
            p.classList.toggle("active", isAll);
            p.setAttribute("aria-selected", String(isAll));
          });
          applyToolFilters();
        });
      }`;

const toolsFilterScript = `    (() => {
      'use strict';

      ${toolsFilterBlock}
    })();`;

// ============================================
// 1. UPDATE public/index.html
// ============================================
const indexPath = path.resolve('public/index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Update FAQ schema answer
indexContent = indexContent.replace(
  /"text": "Yes\. All \d+ interactive calculators and engineering utilities[^"]+"/,
  `"text": "Yes. All ${counts.all} interactive calculators, simulations, and engineering utilities—including Ohm's Law, Resistor Color Codes, Solar Sizing, Buck-Boost Design, 555 Timer, and Windows utilities—operate 100% client-side in the browser or offline, require no login, and are completely free."`
);

// Update section subtitle
indexContent = indexContent.replace(
  /<p class="section-subtitle">A production-grade suite of \d+ electronics calculators[^<]+<\/p>/,
  `<p class="section-subtitle">A production-grade suite of ${counts.all} electronics calculators, IoT tools, simulations, and desktop utilities engineered by Mohamed Tarek Abdelhady. 100% free, browser-based, and offline PWA ready.</p>`
);

// Update search input placeholder
indexContent = indexContent.replace(
  /placeholder="Search \d+\+ calculators, formulas, or utilities[^"]+"/,
  `placeholder="Search ${counts.all}+ calculators, formulas, or utilities (e.g. Ohm, PCB, Solar, 555, Cleaner)..."`
);

// Update filter pills in index.html
indexContent = indexContent.replace(
  /<div class="tools-filter-pills"[\s\S]*?<\/div>\s*<\/div>/,
  `${filterPillsHtml}\n        </div>`
);

// Replace grid in index.html with arranged category groups
const indexGroupsHtml = generateGroupsHtml(false);
indexContent = indexContent.replace(
  /(?:<!--.*?-->|\s)*<div class="(?:tools-grid|tools-groups-container)" id="toolsGrid">[\s\S]*?<\/div>\s*(?=<!-- Bottom Showcase Banner -->)/,
  () => `\n\n${indexGroupsHtml}\n\n        `
);

// Update Filter Script in index.html
indexContent = indexContent.replace(
  /\/\*\s*-{10,}\s*TOOLS FILTER & LIVE SEARCH[\s\S]*?applyToolFilters\(\);\s*\}\);\s*\}\s*\}\)\(\);/,
  () => `${toolsFilterBlock}\n    })();`
);

// Update FAQ in body text
indexContent = indexContent.replace(
  /Yes\. All \d+ interactive calculators and engineering utilities—including Ohm's Law[^<]+/,
  `Yes. All ${counts.all} interactive calculators, simulations, and engineering utilities—including Ohm's Law, Resistor Color Codes, Solar Sizing, Buck-Boost Design, and 555 Timer—operate 100% client-side in the browser, require no login, and are completely free.\n            `
);

fs.writeFileSync(indexPath, indexContent, 'utf8');
console.log('Updated public/index.html successfully!');

// ============================================
// 2. GENERATE public/tools.html
// ============================================
const toolsGroupsHtml = generateGroupsHtml(true);

const toolsPageHtml = `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">

  <title>Engineering Tools &amp; Calculators Hub | Mohamed Tarek Abdelhady</title>
  <meta name="description" content="Production-grade suite of ${counts.all} free engineering tools by Mohamed Tarek Abdelhady — PCB trace, solar system sizing, battery storage, Ohm's law, op-amp, 555 timer, ADC, PWM, and Windows utilities.">
  <meta name="robots" content="index, follow">
  <meta name="theme-color" content="#0a0e1a">
  <link rel="canonical" href="https://mohamed-tarek-abdelhady.vercel.app/tools.html">
  <link rel="alternate" type="text/plain" href="/llms.txt" title="LLMs.txt">
  <link rel="payment" href="/api/x402">
  <link rel="ucp" href="/.well-known/ucp">

  <meta property="og:type" content="website">
  <meta property="og:title" content="Engineering Tools &amp; Calculators Hub | Mohamed Tarek Abdelhady">
  <meta property="og:description" content="Explore ${counts.all} free engineering tools, PCB calculators, solar sizing systems, embedded IoT apps, and Windows utilities engineered by Mohamed Tarek Abdelhady.">
  <meta property="og:image" content="https://mohamed-tarek-abdelhady.vercel.app/photo.jpg">
  <meta property="og:image:width" content="851">
  <meta property="og:image:height" content="1134">
  <meta property="og:image:alt" content="Mohamed Tarek Abdelhady — Communication Engineer">
  <meta property="og:url" content="https://mohamed-tarek-abdelhady.vercel.app/tools.html">
  <meta property="og:site_name" content="Mohamed Tarek Abdelhady — Communication Engineer">
  <meta property="og:locale" content="en_US">
  <meta property="og:updated_time" content="2026-11-15T00:00:00+03:00">

  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="Engineering Tools &amp; Calculators Hub | Mohamed Tarek Abdelhady">
  <meta name="twitter:description" content="Explore ${counts.all} free engineering tools, PCB calculators, solar sizing systems, embedded IoT apps, and Windows utilities engineered by Mohamed Tarek Abdelhady.">
  <meta name="twitter:image" content="https://mohamed-tarek-abdelhady.vercel.app/photo.jpg">

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Mohamed Tarek Abdelhady | Engineering Tools & Calculators Hub",
    "description": "Collection of ${counts.all} professional engineering tools, calculators, simulations, and desktop utilities by Mohamed Tarek Abdelhady.",
    "url": "https://mohamed-tarek-abdelhady.vercel.app/tools.html",
    "author": {
      "@type": "Person",
      "name": "Mohamed Tarek Abdelhady",
      "alternateName": ["Mohamed Tarek", "M. Tarek Abdelhady", "Eng. Mohamed Tarek", "Eng.M.T.A.", "المهندس محمد طارق"],
      "jobTitle": "Communication Engineer",
      "url": "https://mohamed-tarek-abdelhady.vercel.app"
    }
  }
  </script>

  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="M. Tarek Tools">
  <meta name="mobile-web-app-capable" content="yes">

  <link rel="stylesheet" href="/common.css">
  <link rel="manifest" href="/manifest.webmanifest">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="icon" href="/icon.png" type="image/png" sizes="any">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180x180.png">
  <link rel="apple-touch-icon" sizes="192x192" href="/icon-192.png">
  <link rel="apple-touch-icon" sizes="512x512" href="/icon-512.png">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" media="print" onload="this.media='all'"><noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"></noscript>
  <link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" as="style" integrity="sha512-Avb2QiuDEEvB4bZJYdft2mNjVShBftLdPG8FJ0V7irTLQ8Uo0qcPxh4Plq7G5tGm0rU+1SPhVotteLpBERwTkw==" crossorigin="anonymous" referrerpolicy="no-referrer" onload="this.onload=null;this.rel='stylesheet'"><noscript><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" integrity="sha512-Avb2QiuDEEvB4bZJYdft2mNjVShBftLdPG8FJ0V7irTLQ8Uo0qcPxh4Plq7G5tGm0rU+1SPhVotteLpBERwTkw==" crossorigin="anonymous" referrerpolicy="no-referrer"></noscript>

  <style>
    /* Page-specific styling */
    .page-hero {
      padding-top: calc(var(--header-height) + 3.5rem);
      padding-bottom: 2.5rem;
      text-align: center;
      background: var(--color-bg-primary);
      position: relative;
    }

    .page-hero::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(rgba(59, 130, 246, 0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(59, 130, 246, 0.04) 1px, transparent 1px);
      background-size: 50px 50px;
      pointer-events: none;
    }

    .page-hero .container { position: relative; z-index: 1; }

    .profile-avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid var(--color-border-accent);
      box-shadow: 0 0 35px rgba(59, 130, 246, 0.18);
      margin: 0 auto 1.25rem;
      transition: transform var(--transition-base);
      display: block;
    }

    .profile-avatar:hover {
      transform: scale(1.06);
    }

    .page-hero h1 {
      font-size: clamp(2rem, 4.5vw, 2.75rem);
      font-weight: 800;
      letter-spacing: -0.03em;
      margin-bottom: 0.75rem;
      background: var(--gradient-accent);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .page-hero p.hero-subtitle {
      font-size: 1.0625rem;
      color: var(--color-text-secondary);
      max-width: 640px;
      margin: 0 auto;
      line-height: 1.6;
    }

    .tools-hub-section {
      padding: 1.5rem 0 5rem;
      border-top: 1px solid var(--color-border);
    }
  </style>
  <noscript><style>.loader{display:none!important}</style></noscript>
</head>
<body>
  <!-- Loading Screen -->
  <div class="loader" id="loader" aria-hidden="true">
    <div class="loader-spinner"></div>
    <p class="loader-text">Loading tools suite...</p>
  </div>

  <!-- Skip Link -->
  <a href="#main" class="skip-link">Skip to content</a>

  <!-- Scroll Progress -->
  <div class="scroll-progress" id="scrollProgress" aria-hidden="true"></div>

  <!-- Mobile Overlay -->
  <div class="mobile-overlay" id="mobileOverlay" aria-hidden="true"></div>

  <!-- Header -->
  <header class="header" id="header" role="banner">
    <div class="container">
      <a href="/" class="logo" aria-label="Mohamed Tarek Abdelhady - Home">
        <span class="logo-icon">MT</span>
        <span>Mohamed Tarek Abdelhady</span>
      </a>

      <button class="menu-toggle" id="menuToggle" aria-label="Toggle navigation" aria-expanded="false" aria-controls="navMenu">
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
      </button>

      <nav class="nav" id="navMenu" role="navigation" aria-label="Main navigation">
        <a href="/" class="nav-link">Home</a>
        <a href="/about.html" class="nav-link">About</a>
        <a href="/services.html" class="nav-link">Services</a>
        <a href="/projects.html" class="nav-link">Projects</a>
        <a href="/article/" class="nav-link">M.T.A. Lab</a>
        <a href="/tools.html" class="nav-link active" aria-current="page">Tools &amp; Calculators</a>
        <a href="/certificates.html" class="nav-link">Certificates</a>
        <a href="/cv.html" class="nav-cta">CV</a>
      </nav>
    </div>
  </header>

  <!-- Main Content -->
  <main id="main">
    <!-- Hero Section -->
    <section class="page-hero">
      <div class="container">
        <img src="/photo.jpg" alt="Mohamed Tarek Abdelhady" class="profile-avatar reveal" width="120" height="120" loading="eager" decoding="async">
        <h1 class="reveal reveal-delay-1">Engineering Tools &amp; Calculators Hub</h1>
        <p class="hero-subtitle reveal reveal-delay-2">A production-grade suite of ${counts.all} electronics calculators, solar sizing systems, embedded IoT utilities, and Windows tools engineered by Mohamed Tarek Abdelhady. 100% free, browser-based, and offline PWA ready.</p>
      </div>
    </section>

    <!-- Engineering Tools & Interactive Suite (Matching index.html) -->
    <section class="tools-discovery tools-hub-section" id="tools" aria-labelledby="tools-title">
      <div class="container">
        <div class="section-header reveal">
          <span class="section-label">Tools &amp; Calculators</span>
          <h2 class="section-title" id="tools-title">Engineering Calculators &amp; Interactive Apps</h2>
          <p class="section-subtitle">Browse through all ${counts.all} utilities arranged by discipline. Use live search or filter by domain to quickly launch any tool.</p>
        </div>

        <!-- Controls: Live Search & Filter Pills -->
        <div class="tools-toolbar reveal reveal-delay-1">
          <div class="tools-search-box">
            <span class="tools-search-icon" aria-hidden="true"><svg viewBox="0 0 512 512" style="width:16px;height:16px;fill:currentColor"><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0s208 93.1 208 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/></svg></span>
            <input type="search" id="toolsSearchInput" class="tools-search-input" placeholder="Search ${counts.all}+ calculators, formulas, or utilities (e.g. Ohm, PCB, Solar, 555, Cleaner)..." aria-label="Search engineering tools">
            <button id="toolsClearSearchBtn" class="tools-clear-btn" aria-label="Clear search">&times;</button>
          </div>

${filterPillsHtml}
        </div>

${toolsGroupsHtml}

        <!-- Bottom Showcase Banner -->
        <div class="tools-bottom-banner reveal">
          <div>
            <h3>Need Custom Hardware Engineering or Firmware?</h3>
            <p>I design high-performance embedded systems, custom PCBs, and IoT solutions for clients worldwide.</p>
          </div>
          <div class="tools-bottom-actions">
            <a href="/projects.html" class="btn btn-primary">
              View Engineering Projects <svg viewBox="0 0 448 512" aria-hidden="true" style="width:14px;height:14px;fill:currentColor"><path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"/></svg>
            </a>
            <a href="/#contact" class="btn btn-secondary">Get in Touch</a>
          </div>
        </div>
      </div>
    </section>
  </main>

  <!-- Footer -->
  <footer class="footer" role="contentinfo">
    <div class="container">
      <div class="footer-bottom">
        <p>&copy; <span id="currentYear"></span> Mohamed Tarek Abdelhady. All rights reserved.</p>
      </div>
    </div>
  </footer>

  <!-- Floating Controls -->
  <button class="back-to-top" id="backToTop" aria-label="Back to top">
    <svg viewBox="0 0 384 512" aria-hidden="true"><path d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 109.3 329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"/></svg>
  </button>
  <button class="theme-toggle" id="themeToggle" aria-label="Toggle dark/light mode">
    <svg class="moon-icon" viewBox="0 0 384 512" aria-hidden="true"><path d="M223.5 32C100 32 0 132.3 0 256S100 480 223.5 480c60.6 0 115.5-24.2 155.8-63.4c5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6c-96.9 0-175.5-78.8-175.5-176c0-65.8 36-123.1 89.3-153.3c6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z"/></svg>
    <svg class="sun-icon" viewBox="0 0 512 512" aria-hidden="true"><path d="M361.5 1.2c5 2.1 8.6 6.6 9.6 11.9L391 121l107.9 19.8c5.3 1 9.8 4.6 11.9 9.6s1.5 10.7-1.6 15.2L446.9 256l62.3 90.5c3.1 4.5 3.7 10.2 1.6 15.2s-6.6 8.6-11.9 9.6L391 391 371.1 498.9c-1 5.3-4.6 9.8-9.6 11.9s-10.7 1.5-15.2-1.6L256 446.9l-90.5 62.3c-4.5 3.1-10.2 3.7-15.2 1.6s-8.6-6.6-9.6-11.9L121 391 13.1 371.1c-5.3-1-9.8-4.6-11.9-9.6s-1.5-10.7 1.6-15.2L65.1 256 2.8 165.5c-3.1-4.5-3.7-10.2-1.6-15.2s6.6-8.6 11.9-9.6L121 121 140.9 13.1c1-5.3 4.6-9.8 9.6-11.9s10.7-1.5 15.2 1.6L256 65.1 346.5 2.8c4.5-3.1 10.2-3.7 15.2-1.6zM256 160a96 96 0 1 0 0 192 96 96 0 1 0 0-192z"/></svg>
  </button>

  <script>
${toolsFilterScript}
  </script>
  <script src="/pwa.js" defer></script>
  <script src="/common.js" defer></script>
<!-- Vercel Speed Insights -->
<script>
  window.si = window.si || function () { (window.siq = window.siq || []).push(arguments); };
</script>
<script defer src="/_vercel/speed-insights/script.js"></script>
</body>
</html>
`;

fs.writeFileSync(path.resolve('public/tools.html'), toolsPageHtml, 'utf8');
console.log('Updated public/tools.html successfully!');
