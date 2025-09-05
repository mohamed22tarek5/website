/*
 * Common JavaScript for all calculators and utilities.
 *
 * This script consolidates the logic from each original page into
 * modular wrappers.  Each block is guarded by a simple feature
 * detection so that the code executes only on the pages where the
 * requisite elements exist.  Shared functionality—such as theme
 * toggling and updating the current year—is initialised at the top
 * of the file.
 */

// -------------------------------------------------------------------
// Global theme toggle
// -------------------------------------------------------------------
(() => {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;
    const themeIcon = themeToggle.querySelector('i');
    const currentTheme = localStorage.getItem('theme') ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    function applyTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        if (themeIcon) {
            if (theme === 'dark') {
                themeIcon.classList.add('fa-sun');
                themeIcon.classList.remove('fa-moon');
            } else {
                themeIcon.classList.add('fa-moon');
                themeIcon.classList.remove('fa-sun');
            }
        }
        localStorage.setItem('theme', theme);
    }
    applyTheme(currentTheme);
    themeToggle.addEventListener('click', () => {
        const nextTheme = document.body.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        applyTheme(nextTheme);
    });
})();

// -------------------------------------------------------------------
// Update current year in footer (if present)
// -------------------------------------------------------------------
(() => {
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
})();

// -------------------------------------------------------------------
// Inductance calculator (colour code and series/parallel)
// -------------------------------------------------------------------
(() => {
    // Guard: only run if colour code calculator exists
    const colorCodeContainer = document.getElementById('ColorCode');
    if (!colorCodeContainer) return;

    // Colour definitions for bands
    const colors = [
        { name: "Black", code: "#000000", value: 0, multiplier: 1 },
        { name: "Brown", code: "#966f33", value: 1, multiplier: 10 },
        { name: "Red", code: "#ff0000", value: 2, multiplier: 100 },
        { name: "Orange", code: "#ffa500", value: 3, multiplier: 1000 },
        { name: "Yellow", code: "#ffff00", value: 4, multiplier: 10000 },
        { name: "Green", code: "#008000", value: 5, multiplier: 100000 },
        { name: "Blue", code: "#0000ff", value: 6, multiplier: 1000000 },
        { name: "Violet", code: "#800080", value: 7, multiplier: 10000000 },
        { name: "Gray", code: "#808080", value: 8, multiplier: 100000000 },
        { name: "White", code: "#ffffff", value: 9, multiplier: 1000000000 },
        { name: "Gold", code: "#d4af37", value: -1, multiplier: 0.1, tolerance: "±5%" },
        { name: "Silver", code: "#c0c0c0", value: -1, multiplier: 0.01, tolerance: "±10%" }
    ];
    // Band selections for four and five band inductors
    let bandSelections = [0, 0, 2, 10];
    let bandSelections5 = [0, 0, 0, 2, 10];
    // Open a main tab on the inductance page
    function openMainTab(evt, tabName) {
        const contents = document.getElementsByClassName('main-tabcontent');
        for (let i = 0; i < contents.length; i++) contents[i].style.display = 'none';
        const buttons = document.getElementsByClassName('main-tab-button');
        for (let i = 0; i < buttons.length; i++) buttons[i].classList.remove('active');
        document.getElementById(tabName).style.display = 'block';
        evt.currentTarget.classList.add('active');
    }
    // Tab switching inside the colour code calculator
    function switchTab(tabId) {
        colorCodeContainer.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        colorCodeContainer.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.getElementById(tabId).classList.add('active');
        const btn = colorCodeContainer.querySelector(`button[onclick="switchTab('${tabId}')"]`);
        if (btn) btn.classList.add('active');
        // Update display on switching
        if (tabId === '4band') {
            updateColorCodeResult();
        } else if (tabId === '5band') {
            updateColorCodeResult5();
        }
    }
    // Tab switching inside the series/parallel calculator
    function switchCalcTab(tabId) {
        const container = document.getElementById('SeriesParallel');
        if (!container) return;
        container.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        container.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.getElementById(tabId).classList.add('active');
        const btn = container.querySelector(`button[onclick="switchCalcTab('${tabId}')"]`);
        if (btn) btn.classList.add('active');
    }
    // Cycle through colours for four band selection
    function selectBand(bandNum) {
        const currentColor = bandSelections[bandNum - 1];
        let newIndex = (currentColor + 1) % colors.length;
        if (bandNum === 4) {
            while (newIndex < 10 || colors[newIndex].tolerance === undefined) {
                newIndex = (newIndex + 1) % colors.length;
            }
        } else {
            while (newIndex >= 10) {
                newIndex = (newIndex + 1) % colors.length;
            }
        }
        bandSelections[bandNum - 1] = newIndex;
        const el = document.getElementById(`band${bandNum}`);
        if (el) el.style.backgroundColor = colors[newIndex].code;
        updateColorCodeResult();
    }
    // Cycle through colours for five band selection
    function selectBand5(bandNum) {
        const currentColor = bandSelections5[bandNum - 1];
        let newIndex = (currentColor + 1) % colors.length;
        if (bandNum === 5) {
            while (newIndex < 10 || colors[newIndex].tolerance === undefined) {
                newIndex = (newIndex + 1) % colors.length;
            }
        } else {
            while (newIndex >= 10) {
                newIndex = (newIndex + 1) % colors.length;
            }
        }
        bandSelections5[bandNum - 1] = newIndex;
        const el = document.getElementById(`band${bandNum}-5`);
        if (el) el.style.backgroundColor = colors[newIndex].code;
        updateColorCodeResult5();
    }
    // Update four‑band result display
    function updateColorCodeResult() {
        const [d1, d2, mult, tolIndex] = bandSelections;
        const digit1 = colors[d1].value;
        const digit2 = colors[d2].value;
        const multiplier = colors[mult].multiplier;
        const tolerance = colors[tolIndex].tolerance;
        const inductance = (digit1 * 10 + digit2) * multiplier;
        let displayValue, unit;
        if (inductance >= 1e6) {
            displayValue = inductance / 1e6;
            unit = 'H';
        } else if (inductance >= 1e3) {
            displayValue = inductance / 1e3;
            unit = 'mH';
        } else {
            displayValue = inductance;
            unit = 'μH';
        }
        const resultEl = document.getElementById('colorCodeResult');
        if (resultEl) resultEl.textContent = `Inductance: ${displayValue}${unit} ${tolerance}`;
    }
    // Update five‑band result display
    function updateColorCodeResult5() {
        const [d1, d2, d3, mult, tolIndex] = bandSelections5;
        const digit1 = colors[d1].value;
        const digit2 = colors[d2].value;
        const digit3 = colors[d3].value;
        const multiplier = colors[mult].multiplier;
        const tolerance = colors[tolIndex].tolerance;
        const inductance = (digit1 * 100 + digit2 * 10 + digit3) * multiplier;
        let displayValue, unit;
        if (inductance >= 1e6) {
            displayValue = inductance / 1e6;
            unit = 'H';
        } else if (inductance >= 1e3) {
            displayValue = inductance / 1e3;
            unit = 'mH';
        } else {
            displayValue = inductance;
            unit = 'μH';
        }
        const resultEl = document.getElementById('colorCodeResult5');
        if (resultEl) resultEl.textContent = `Inductance: ${displayValue}${unit} ${tolerance}`;
    }
    // Add or remove inductors for series/parallel calculation
    function addInductor(type) {
        const container = document.getElementById(`${type}-inductors`);
        if (!container) return;
        const count = container.children.length + 1;
        const div = document.createElement('div');
        div.className = 'inductor-input';
        div.innerHTML = `
            <label>L${count}:</label>
            <input type="number" min="0" step="0.01" value="10">
            <select class="unit-selector">
                <option value="1e-6">μH</option>
                <option value="1e-3" selected>mH</option>
                <option value="1">H</option>
            </select>
        `;
        container.appendChild(div);
    }
    function removeInductor(type) {
        const container = document.getElementById(`${type}-inductors`);
        if (container && container.children.length > 1) {
            container.removeChild(container.lastChild);
        }
    }
    // Calculate equivalent inductance for series or parallel
    function calculateInductance(type) {
        const container = document.getElementById(`${type}-inductors`);
        const inputs = container.querySelectorAll('input');
        const units = container.querySelectorAll('select');
        const resultDiv = document.getElementById(`${type}-result`);
        const inductors = [];
        for (let i = 0; i < inputs.length; i++) {
            const value = parseFloat(inputs[i].value);
            const unit = parseFloat(units[i].value);
            if (isNaN(value) || value <= 0) {
                resultDiv.innerHTML = '<p style="color: var(--error-color);">Error: All inductor values must be positive numbers.</p>';
                return;
            }
            inductors.push(value * unit);
        }
        let equivalent;
        let formula = '';
        if (type === 'series') {
            equivalent = 0;
            formula = 'Leq = ';
            for (let i = 0; i < inductors.length; i++) {
                equivalent += inductors[i];
                formula += `L${i+1}`;
                if (i < inductors.length - 1) formula += ' + ';
            }
            formula += ` = ${equivalent.toExponential(6)} H`;
        } else {
            let sum = 0;
            formula = '1/Leq = ';
            for (let i = 0; i < inductors.length; i++) {
                sum += 1 / inductors[i];
                formula += `1/L${i+1}`;
                if (i < inductors.length - 1) formula += ' + ';
            }
            equivalent = 1 / sum;
            formula += ` = ${sum.toFixed(6)} (H<sup>-1</sup>)<br>Therefore, Leq = 1/${sum.toFixed(6)} = ${equivalent.toExponential(6)} H`;
        }
        let displayValue, unit;
        if (equivalent >= 1) {
            displayValue = equivalent;
            unit = 'H';
        } else if (equivalent >= 1e-3) {
            displayValue = equivalent * 1e3;
            unit = 'mH';
        } else {
            displayValue = equivalent * 1e6;
            unit = 'μH';
        }
        resultDiv.innerHTML = `
            <p><strong>Equivalent Inductance:</strong> ${displayValue.toFixed(4)} ${unit}</p>
            <p><strong>Calculation:</strong><br>${formula}</p>
        `;
    }
    // Export functions to global scope for inline event handlers
    window.openMainTab = openMainTab;
    window.switchTab = switchTab;
    window.switchCalcTab = switchCalcTab;
    window.selectBand = selectBand;
    window.selectBand5 = selectBand5;
    window.updateColorCodeResult = updateColorCodeResult;
    window.updateColorCodeResult5 = updateColorCodeResult5;
    window.addInductor = addInductor;
    window.removeInductor = removeInductor;
    window.calculateInductance = calculateInductance;
    // Initialise default display on DOM ready
    document.addEventListener('DOMContentLoaded', () => {
        updateColorCodeResult();
        updateColorCodeResult5();
    });
})();

// -------------------------------------------------------------------
// AI Tools Directory interactions (accordion and search)
// -------------------------------------------------------------------
(() => {
    // Check for AI Tools page elements: accordion headers or search input
    const searchInput = document.getElementById('search-input');
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    const toolCards = document.querySelectorAll('.tool-card');
    if (!searchInput && accordionHeaders.length === 0 && toolCards.length === 0) return;

    // Accordion functionality
    if (accordionHeaders.length > 0) {
        accordionHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const accordionContent = header.nextElementSibling;
                const icon = header.querySelector('i');
                const isActive = header.classList.contains('active');
                // Close all other accordions
                document.querySelectorAll('.accordion-header.active').forEach(activeHeader => {
                    if (activeHeader !== header) {
                        activeHeader.classList.remove('active');
                        const content = activeHeader.nextElementSibling;
                        if (content) content.style.maxHeight = null;
                        const activeIcon = activeHeader.querySelector('i');
                        if (activeIcon) {
                            activeIcon.classList.remove('fa-chevron-up');
                            activeIcon.classList.add('fa-chevron-down');
                        }
                    }
                });
                // Toggle current accordion
                if (isActive) {
                    header.classList.remove('active');
                    if (accordionContent) accordionContent.style.maxHeight = null;
                    if (icon) {
                        icon.classList.remove('fa-chevron-up');
                        icon.classList.add('fa-chevron-down');
                    }
                } else {
                    header.classList.add('active');
                    if (accordionContent) accordionContent.style.maxHeight = accordionContent.scrollHeight + 'px';
                    if (icon) {
                        icon.classList.remove('fa-chevron-down');
                        icon.classList.add('fa-chevron-up');
                    }
                }
            });
        });
        // Open first accordion by default
        if (accordionHeaders[0]) accordionHeaders[0].click();
    }

    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const term = searchInput.value.toLowerCase();
            // If the search term is shorter than 2 characters, show all
            if (term.length < 2) {
                toolCards.forEach(card => {
                    card.style.display = 'flex';
                });
                return;
            }
            toolCards.forEach(card => {
                const nameEl = card.querySelector('.tool-name');
                const descEl = card.querySelector('.tool-description');
                const name = nameEl ? nameEl.textContent.toLowerCase() : '';
                const desc = descEl ? descEl.textContent.toLowerCase() : '';
                if (name.includes(term) || desc.includes(term)) {
                    card.style.display = 'flex';
                    // Ensure parent accordion is open
                    const accordionContainer = card.closest('.accordion-container');
                    if (accordionContainer) {
                        const header = accordionContainer.querySelector('.accordion-header');
                        if (header && !header.classList.contains('active')) {
                            header.click();
                        }
                    }
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    // Download button animation and alert
    const downloadBtns = document.querySelectorAll('.download-btn');
    if (downloadBtns.length > 0) {
        downloadBtns.forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                const el = this;
                el.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    el.style.transform = '';
                    alert('Download started! In a real application, this would download the PDF.');
                }, 200);
            });
        });
    }
})();

// -------------------------------------------------------------------
// Electrical calculator (voltage/current/resistance/power)
// -------------------------------------------------------------------
(() => {
    const calcTypeSelect = document.getElementById('calculation-type');
    if (!calcTypeSelect) return;
    const inputFields = document.getElementById('input-fields');
    const calculateBtn = document.getElementById('calculate-btn');
    const results = document.getElementById('results');
    const resultValue = document.getElementById('result-value');
    const formula = document.getElementById('formula');
    function updateInputFields() {
        const selectedCalculation = calcTypeSelect.value;
        inputFields.innerHTML = '';
        function addInputOption(options) {
            const formGroup = document.createElement('div');
            formGroup.className = 'form-group';
            const label = document.createElement('label');
            label.setAttribute('for', 'calculation-method');
            label.textContent = 'Select Method:';
            formGroup.appendChild(label);
            const select = document.createElement('select');
            select.id = 'calculation-method';
            options.forEach(opt => {
                const optionEl = document.createElement('option');
                optionEl.value = opt.id;
                optionEl.textContent = opt.label;
                select.appendChild(optionEl);
            });
            formGroup.appendChild(select);
            inputFields.appendChild(formGroup);
            function updateMethodInputs() {
                inputFields.querySelectorAll('.form-group:not(:first-child)')
                    .forEach(el => el.remove());
                const method = select.value;
                const [param1, param2] = method.split('-');
                addInputField(param1);
                addInputField(param2);
            }
            function addInputField(param) {
                const fg = document.createElement('div');
                fg.className = 'form-group';
                const lbl = document.createElement('label');
                lbl.setAttribute('for', param);
                switch (param) {
                    case 'voltage': lbl.textContent = 'Voltage (V):'; break;
                    case 'current': lbl.textContent = 'Current (A):'; break;
                    case 'resistance': lbl.textContent = 'Resistance (Ω):'; break;
                    case 'power': lbl.textContent = 'Power (W):'; break;
                }
                const inp = document.createElement('input');
                inp.type = 'number';
                inp.id = param;
                inp.step = '0.001';
                inp.min = '0';
                fg.appendChild(lbl);
                fg.appendChild(inp);
                inputFields.appendChild(fg);
            }
            select.addEventListener('change', updateMethodInputs);
            updateMethodInputs();
        }
        switch (selectedCalculation) {
            case 'voltage':
                addInputOption([
                    { id: 'current-resistance', label: 'Using Current and Resistance' },
                    { id: 'power-current', label: 'Using Power and Current' },
                    { id: 'power-resistance', label: 'Using Power and Resistance' }
                ]);
                break;
            case 'current':
                addInputOption([
                    { id: 'voltage-resistance', label: 'Using Voltage and Resistance' },
                    { id: 'power-voltage', label: 'Using Power and Voltage' },
                    { id: 'power-resistance', label: 'Using Power and Resistance' }
                ]);
                break;
            case 'resistance':
                addInputOption([
                    { id: 'voltage-current', label: 'Using Voltage and Current' },
                    { id: 'voltage-power', label: 'Using Voltage and Power' },
                    { id: 'power-current', label: 'Using Power and Current' }
                ]);
                break;
            case 'power':
                addInputOption([
                    { id: 'voltage-current', label: 'Using Voltage and Current' },
                    { id: 'voltage-resistance', label: 'Using Voltage and Resistance' },
                    { id: 'current-resistance', label: 'Using Current and Resistance' }
                ]);
                break;
        }
    }
    function calculate() {
        const selected = calcTypeSelect.value;
        const method = document.getElementById('calculation-method').value;
        const [param1, param2] = method.split('-');
        const v1 = parseFloat(document.getElementById(param1).value);
        const v2 = parseFloat(document.getElementById(param2).value);
        if (isNaN(v1) || isNaN(v2)) {
            alert('Please enter valid numbers for both fields');
            return;
        }
        let result, formulaText;
        switch (selected) {
            case 'voltage':
                if (method === 'current-resistance') {
                    result = v1 * v2;
                    formulaText = `V = I × R = ${v1} A × ${v2} Ω = ${result} V`;
                } else if (method === 'power-current') {
                    result = v1 / v2;
                    formulaText = `V = P ÷ I = ${v1} W ÷ ${v2} A = ${result} V`;
                } else if (method === 'power-resistance') {
                    result = Math.sqrt(v1 * v2);
                    formulaText = `V = √(P × R) = √(${v1} W × ${v2} Ω) = ${result} V`;
                }
                break;
            case 'current':
                if (method === 'voltage-resistance') {
                    result = v1 / v2;
                    formulaText = `I = V ÷ R = ${v1} V ÷ ${v2} Ω = ${result} A`;
                } else if (method === 'power-voltage') {
                    result = v1 / v2;
                    formulaText = `I = P ÷ V = ${v1} W ÷ ${v2} V = ${result} A`;
                } else if (method === 'power-resistance') {
                    result = Math.sqrt(v1 / v2);
                    formulaText = `I = √(P ÷ R) = √(${v1} W ÷ ${v2} Ω) = ${result} A`;
                }
                break;
            case 'resistance':
                if (method === 'voltage-current') {
                    result = v1 / v2;
                    formulaText = `R = V ÷ I = ${v1} V ÷ ${v2} A = ${result} Ω`;
                } else if (method === 'voltage-power') {
                    result = (v1 * v1) / v2;
                    formulaText = `R = V² ÷ P = ${v1}² V ÷ ${v2} W = ${result} Ω`;
                } else if (method === 'power-current') {
                    result = v1 / (v2 * v2);
                    formulaText = `R = P ÷ I² = ${v1} W ÷ ${v2}² A = ${result} Ω`;
                }
                break;
            case 'power':
                if (method === 'voltage-current') {
                    result = v1 * v2;
                    formulaText = `P = V × I = ${v1} V × ${v2} A = ${result} W`;
                } else if (method === 'voltage-resistance') {
                    result = (v1 * v1) / v2;
                    formulaText = `P = V² ÷ R = ${v1}² V ÷ ${v2} Ω = ${result} W`;
                } else if (method === 'current-resistance') {
                    result = v1 * v1 * v2;
                    formulaText = `P = I² × R = ${v1}² A × ${v2} Ω = ${result} W`;
                }
                break;
        }
        resultValue.textContent = `${result.toFixed(4)} ${getUnit(selected)}`;
        formula.textContent = formulaText;
        results.style.display = 'block';
    }
    function getUnit(type) {
        switch (type) {
            case 'voltage': return 'Volts (V)';
            case 'current': return 'Amperes (A)';
            case 'resistance': return 'Ohms (Ω)';
            case 'power': return 'Watts (W)';
        }
    }
    calcTypeSelect.addEventListener('change', updateInputFields);
    calculateBtn.addEventListener('click', calculate);
    document.addEventListener('DOMContentLoaded', updateInputFields);
})();

// -------------------------------------------------------------------
// Unit converter (length and angle) with scientific notation
// -------------------------------------------------------------------
(() => {
    const column1 = document.getElementById('column1');
    // If the main section of the unit converter doesn’t exist, bail out.
    if (!column1) return;
    const Constants = {
        lengthUnits: {
            km: 1000, m: 1, dm: 0.1, cm: 0.01, mm: 0.001, 'µm': 1e-6, nm: 1e-9, pm: 1e-12,
            mi: 1609.344, yd: 0.9144, ft: 0.3048, in: 0.0254, mil: 0.0000254,
            nmi: 1852, ftm: 1.8288, cable: 185.2,
            au: 149597870700, ly: 9460730472580800, pc: 30856775814913672,
            Å: 1e-10, fm: 1e-15, fur: 201.168, 'ℓP': 1.616255e-35
        },
        angleUnits: { deg: Math.PI / 180, rad: 1, pi: Math.PI, grad: Math.PI / 200 },
        lengthUnitMap: {
            kilometers: 'km', meters: 'm', decimeters: 'dm', centimeters: 'cm',
            millimeters: 'mm', micrometers: 'µm', nanometers: 'nm', picometers: 'pm',
            miles: 'mi', yards: 'yd', feet: 'ft', inches: 'in', mils: 'mil',
            nauticalMiles: 'nmi', fathoms: 'ftm', cables: 'cable', astronomicalUnits: 'au',
            lightYears: 'ly', parsecs: 'pc', angstroms: 'Å', fermis: 'fm', furlongs: 'fur', planckLengths: 'ℓP'
        },
        angleUnitMap: { degrees: 'deg', radians: 'rad', piRadians: 'pi', gradians: 'grad' }
    };
    const Formatter = {
        formatDecimal(num) {
            if (num === 0) return '0';
            const absNum = Math.abs(num);
            if (absNum >= 1000 || absNum < 0.001) {
                return num.toExponential(6)
                    .replace(/(\.\d*?[1-9])0+e/, '$1e')
                    .replace(/\.?0+e/, 'e');
            }
            return num.toFixed(10).replace(/\.?0+$/, '');
        },
        updateScientificNotation(inputElement, valueInBase) {
            const sci = document.getElementById(`${inputElement.id}-sci`);
            if (!sci) return;
            if (valueInBase === 0 || isNaN(valueInBase)) { sci.textContent = ''; return; }
            const absVal = Math.abs(valueInBase);
            let sciValue;
            if (absVal >= 1e6 || absVal <= 1e-6) {
                sciValue = valueInBase.toExponential(6)
                    .replace(/e\+?(-?\d+)/, '×10<sup>$1</sup>')
                    .replace(/e-/, '×10<sup>-');
            } else {
                sciValue = valueInBase.toFixed(6).replace(/\.?0+$/, '');
            }
            sci.innerHTML = sciValue;
        },
        clearScientificNotation(inputElement) {
            const sci = document.getElementById(`${inputElement.id}-sci`);
            if (sci) sci.textContent = '';
        }
    };
    const UnitConverter = {
        convertFrom(inputElement, unit) {
            const val = parseFloat(inputElement.value);
            if (isNaN(val)) {
                if (inputElement.value === '') Formatter.clearScientificNotation(inputElement);
                return;
            }
            const meters = val * Constants.lengthUnits[unit];
            document.querySelectorAll('.unit-input').forEach(field => {
                if (field !== inputElement && field.closest('.main-section')) {
                    const fieldId = field.id;
                    const fieldUnit = Constants.lengthUnitMap[fieldId];
                    const convVal = meters / Constants.lengthUnits[fieldUnit];
                    field.value = Formatter.formatDecimal(convVal);
                    Formatter.updateScientificNotation(field, convVal * Constants.lengthUnits[fieldUnit]);
                }
            });
            Formatter.updateScientificNotation(inputElement, meters);
        }
    };
    const AngleConverter = {
        convertFrom(inputElement, unit) {
            const val = parseFloat(inputElement.value);
            if (isNaN(val)) {
                if (inputElement.value === '') Formatter.clearScientificNotation(inputElement);
                return;
            }
            const radians = val * Constants.angleUnits[unit];
            document.querySelectorAll('.angle-input').forEach(field => {
                if (field !== inputElement) {
                    const fieldId = field.id;
                    const fieldUnit = Constants.angleUnitMap[fieldId];
                    const convVal = radians / Constants.angleUnits[fieldUnit];
                    field.value = Formatter.formatDecimal(convVal);
                    Formatter.updateScientificNotation(field, convVal * Constants.angleUnits[fieldUnit]);
                }
            });
            Formatter.updateScientificNotation(inputElement, radians);
        }
    };
    const UnitConverterUI = {
        clearAllFields() {
            document.querySelectorAll('.unit-input, .angle-input').forEach(field => { field.value = ''; });
            document.querySelectorAll('.scientific').forEach(el => { el.textContent = ''; });
        },
        swapColumns() {
            const col1 = document.getElementById('column1');
            const col2 = document.getElementById('column2');
            const parent = col1.parentNode;
            parent.insertBefore(col2, col1);
        }
    };
    // Expose conversion functions globally for inline attributes
    window.UnitConverter = UnitConverter;
    window.AngleConverter = AngleConverter;
    window.UnitConverterUI = UnitConverterUI;
})();

// -------------------------------------------------------------------
// Medication reminder
// -------------------------------------------------------------------
(() => {
    const medNameInput = document.getElementById('medicationName');
    if (!medNameInput) return;
    let remindersInterval;
    let reminderTimeouts = [];
    function addMedication() {
        const name = medNameInput.value;
        const time = document.getElementById('time').value;
        if (name.trim() === '' || time.trim() === '') {
            alert('Please enter both the medication name and time.');
            return;
        }
        const meds = JSON.parse(localStorage.getItem('medications') || '[]');
        meds.push({ name, time });
        localStorage.setItem('medications', JSON.stringify(meds));
        medNameInput.value = '';
        document.getElementById('time').value = '';
        displayReminders();
    }
    function removeMedication(index) {
        const meds = JSON.parse(localStorage.getItem('medications') || '[]');
        meds.splice(index, 1);
        localStorage.setItem('medications', JSON.stringify(meds));
        displayReminders();
    }
    function formatRemainingTime(remaining) {
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        return `${hours}h ${minutes}m ${seconds}s`;
    }
    function updateRemainingTimes() {
        const meds = JSON.parse(localStorage.getItem('medications') || '[]');
        meds.forEach((med, idx) => {
            let reminderTime = new Date(new Date().toDateString() + ' ' + med.time);
            let remaining = reminderTime.getTime() - Date.now();
            if (remaining <= 0) {
                reminderTime.setDate(reminderTime.getDate() + 1);
                remaining = reminderTime.getTime() - Date.now();
            }
            const el = document.getElementById(`remainingTime${idx}`);
            if (el) el.innerHTML = formatRemainingTime(remaining);
        });
    }
    function displayReminders() {
        const meds = JSON.parse(localStorage.getItem('medications') || '[]');
        const container = document.getElementById('remindersContainer');
        container.innerHTML = '';
        // clear existing timeouts
        reminderTimeouts.forEach(timeout => clearTimeout(timeout));
        reminderTimeouts = [];
        if (meds.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-muted);">No medications scheduled</p>';
            return;
        }
        meds.forEach((med, idx) => {
            let reminderTime = new Date(new Date().toDateString() + ' ' + med.time);
            let remaining = reminderTime.getTime() - Date.now();
            if (remaining <= 0) {
                reminderTime.setDate(reminderTime.getDate() + 1);
                remaining = reminderTime.getTime() - Date.now();
            }
            const div = document.createElement('div');
            div.className = 'reminder-item';
            div.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>${med.name}</strong>
                        <div class="reminder-time">${med.time}</div>
                        <div>Next dose in: <span class="remaining-time" id="remainingTime${idx}">${formatRemainingTime(remaining)}</span></div>
                    </div>
                    <button onclick="removeMedication(${idx})" class="btn btn-danger" style="padding:8px 16px;">Remove</button>
                </div>
            `;
            container.appendChild(div);
            const timeout = setTimeout(() => {
                alert(`Time to take your medication: ${med.name}`);
                displayReminders();
            }, remaining);
            reminderTimeouts.push(timeout);
        });
        clearInterval(remindersInterval);
        remindersInterval = setInterval(updateRemainingTimes, 1000);
    }
    window.addMedication = addMedication;
    window.removeMedication = removeMedication;
    document.addEventListener('DOMContentLoaded', displayReminders);
})();

// -------------------------------------------------------------------
// Power factor correction calculator
// -------------------------------------------------------------------
(() => {
    const loadPower = document.getElementById('loadPower');
    if (!loadPower) return;
    function calculateCorrection() {
        const P = parseFloat(document.getElementById('loadPower').value);
        const existingPF = parseFloat(document.getElementById('existingPF').value);
        const targetPF = parseFloat(document.getElementById('targetPF').value);
        const V = parseFloat(document.getElementById('voltage').value);
        const f = parseFloat(document.getElementById('frequency').value);
        if (isNaN(P)) { alert('Please enter a valid Load Power value'); return; }
        if (existingPF <= 0 || existingPF >= 1 || isNaN(existingPF)) { alert('Existing Power Factor must be between 0 and 1'); return; }
        if (targetPF <= 0 || targetPF >= 1 || isNaN(targetPF)) { alert('Target Power Factor must be between 0 and 1'); return; }
        if (targetPF <= existingPF) { alert('Target Power Factor must be greater than Existing Power Factor'); return; }
        const apparentBefore = P / existingPF;
        const reactiveBefore = Math.sqrt(apparentBefore * apparentBefore - P * P);
        const apparentAfter = P / targetPF;
        const reactiveAfter = Math.sqrt(apparentAfter * apparentAfter - P * P);
        const angleBefore = Math.acos(existingPF) * (180 / Math.PI);
        const angleAfter = Math.acos(targetPF) * (180 / Math.PI);
        const capacitorSize = reactiveBefore - reactiveAfter;
        const capacitance = (capacitorSize * 1e6) / (2 * Math.PI * f * V * V);
        const pfImprovement = ((targetPF - existingPF) / existingPF) * 100;
        const kvaReduction = apparentBefore - apparentAfter;
        document.getElementById('capSize').textContent = capacitorSize.toFixed(2) + ' kVAR';
        document.getElementById('capacitance').textContent = capacitance.toFixed(2) + ' µF';
        document.getElementById('pfImprovement').textContent = pfImprovement.toFixed(1) + '%';
        document.getElementById('kvaReduction').textContent = kvaReduction.toFixed(2) + ' kVA';
        document.getElementById('beforeReal').textContent = P.toFixed(2) + ' kW';
        document.getElementById('beforeReactive').textContent = reactiveBefore.toFixed(2) + ' kVAR';
        document.getElementById('beforeApparent').textContent = apparentBefore.toFixed(2) + ' kVA';
        document.getElementById('beforePF').textContent = existingPF.toFixed(3);
        document.getElementById('beforeAngle').textContent = angleBefore.toFixed(2) + '°';
        document.getElementById('afterReal').textContent = P.toFixed(2) + ' kW';
        document.getElementById('afterReactive').textContent = reactiveAfter.toFixed(2) + ' kVAR';
        document.getElementById('afterApparent').textContent = apparentAfter.toFixed(2) + ' kVA';
        document.getElementById('afterPF').textContent = targetPF.toFixed(3);
        document.getElementById('afterAngle').textContent = angleAfter.toFixed(2) + '°';
    }
    window.calculateCorrection = calculateCorrection;
    document.addEventListener('DOMContentLoaded', calculateCorrection);
})();

// -------------------------------------------------------------------
// Resistor calculator (colour code, SMD and series/parallel)
// -------------------------------------------------------------------
(() => {
    const bandCountSelect = document.getElementById('bandCount');
    if (!bandCountSelect) return;
    const colors = {
        black: ['0', '0', '1', null, null],
        brown: ['1', '1', '10', '1%', '100ppm'],
        red: ['2', '2', '100', '2%', '50ppm'],
        orange: ['3', '3', '1000', '0.05%', '15ppm'],
        yellow: ['4', '4', '10000', '0.02%', '25ppm'],
        green: ['5', '5', '100000', '0.5%', '20ppm'],
        blue: ['6', '6', '1000000', '0.25%', '10ppm'],
        violet: ['7', '7', '10000000', '0.1%', '5ppm'],
        gray: ['8', '8', '100000000', '0.01%', null],
        white: ['9', '9', '1000000000', null, null],
        gold: [null, null, '0.1', '5%', null],
        silver: [null, null, '0.01', '10%', null]
    };
    function openMainTab(evt, tabName) {
        const contents = document.getElementsByClassName('main-tabcontent');
        for (let i = 0; i < contents.length; i++) contents[i].style.display = 'none';
        const buttons = document.getElementsByClassName('main-tab-button');
        for (let i = 0; i < buttons.length; i++) buttons[i].classList.remove('active');
        document.getElementById(tabName).style.display = 'block';
        evt.currentTarget.classList.add('active');
    }
    function switchCalcTab(tabId) {
        const sp = document.getElementById('SeriesParallel');
        sp.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        sp.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.getElementById(tabId).classList.add('active');
        const btn = sp.querySelector(`button[onclick="switchCalcTab('${tabId}')"]`);
        if (btn) btn.classList.add('active');
    }
    function updateBands() {
        const count = parseInt(bandCountSelect.value);
        const bandSelectors = document.getElementById('bandSelectors');
        bandSelectors.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const select = document.createElement('select');
            select.className = 'input-field';
            select.id = `band${i}`;
            select.onchange = calculateResistance;
            Object.keys(colors).forEach(color => {
                let shouldAdd = false;
                if (i < 2) {
                    shouldAdd = colors[color][0] !== null;
                } else if (i === 2) {
                    if (count === 4) {
                        shouldAdd = colors[color][2] !== null;
                    } else {
                        shouldAdd = colors[color][1] !== null;
                    }
                } else if (i === 3) {
                    if (count === 4) {
                        shouldAdd = colors[color][3] !== null;
                    } else {
                        shouldAdd = colors[color][2] !== null;
                    }
                } else if (i === 4) {
                    shouldAdd = colors[color][3] !== null;
                } else if (i === 5) {
                    shouldAdd = colors[color][4] !== null;
                }
                if (shouldAdd) {
                    const option = document.createElement('option');
                    option.value = color;
                    option.style.backgroundColor = color;
                    if (['black', 'blue', 'violet', 'brown'].includes(color)) option.style.color = 'white';
                    option.textContent = color.charAt(0).toUpperCase() + color.slice(1);
                    select.appendChild(option);
                }
            });
            bandSelectors.appendChild(select);
        }
        calculateResistance();
    }
    function calculateResistance() {
        const count = parseInt(bandCountSelect.value);
        const values = [];
        const resistorDisplay = document.getElementById('resistorDisplay');
        resistorDisplay.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const bandDiv = document.createElement('div');
            bandDiv.className = 'band';
            const selected = document.getElementById(`band${i}`);
            const color = selected ? selected.value : null;
            bandDiv.style.backgroundColor = color;
            bandDiv.style.left = `${50 + i * 40}px`;
            resistorDisplay.appendChild(bandDiv);
            values.push(color);
        }
        let resistance = 0;
        let tolerance = '';
        let tempCoeff = '';
        if (count === 4) {
            resistance = parseInt(colors[values[0]][0] + colors[values[1]][0]) * parseFloat(colors[values[2]][2]);
            tolerance = colors[values[3]][3];
        } else if (count === 5) {
            resistance = parseInt(colors[values[0]][0] + colors[values[1]][0] + colors[values[2]][1]) * parseFloat(colors[values[3]][2]);
            tolerance = colors[values[4]][3];
        } else if (count === 6) {
            resistance = parseInt(colors[values[0]][0] + colors[values[1]][0] + colors[values[2]][1]) * parseFloat(colors[values[3]][2]);
            tolerance = colors[values[4]][3];
            tempCoeff = colors[values[5]][4];
        }
        let resStr = formatResistance(resistance);
        document.getElementById('colorResult').textContent = `Resistance: ${resStr} ±${tolerance}`;
        if (count === 6) {
            document.getElementById('tempCoeff').textContent = `Temperature Coefficient: ${tempCoeff}`;
        } else {
            document.getElementById('tempCoeff').textContent = '';
        }
    }
    function calculateSMD() {
        const code = document.getElementById('smdCode').value.toUpperCase();
        if (code.length < 2) return;
        let resistance = 0;
        if (code.includes('R')) {
            resistance = parseFloat(code.replace('R', '.'));
        } else if (/^\d{3,4}$/.test(code)) {
            const multiplier = code.length === 3 ? 1 : 10;
            const digits = code.length === 3 ? 2 : 3;
            const value = parseInt(code.substring(0, digits));
            const exp = parseInt(code.substring(digits));
            resistance = value * Math.pow(10, exp) / multiplier;
        } else if (/^\d{1,2}R\d{1,2}$/.test(code)) {
            const parts = code.split('R');
            resistance = parseFloat(parts[0] + '.' + parts[1]);
        }
        document.getElementById('smdResult').textContent = `Resistance: ${formatResistance(resistance)}`;
    }
    function addResistor(type) {
        const container = document.getElementById(`${type}-resistors`);
        const count = container.children.length + 1;
        const div = document.createElement('div');
        div.className = 'resistor-input';
        div.innerHTML = `
            <label>R${count}:</label>
            <input type="number" min="0" step="0.01" value="100">
            <select class="unit-selector">
                <option value="1">Ω</option>
                <option value="1000" selected>kΩ</option>
                <option value="1000000">MΩ</option>
            </select>
        `;
        container.appendChild(div);
    }
    function removeResistor(type) {
        const container = document.getElementById(`${type}-resistors`);
        if (container.children.length > 1) {
            container.removeChild(container.lastChild);
        }
    }
    function calculate(type) {
        const container = document.getElementById(`${type}-resistors`);
        const inputs = container.querySelectorAll('input');
        const units = container.querySelectorAll('select');
        const resultDiv = document.getElementById(`${type}-result`);
        const resistors = [];
        for (let i = 0; i < inputs.length; i++) {
            const value = parseFloat(inputs[i].value);
            const unit = parseFloat(units[i].value);
            if (isNaN(value) || value <= 0) {
                resultDiv.innerHTML = '<p style="color: var(--error-color);">Error: All resistor values must be positive numbers.</p>';
                return;
            }
            resistors.push(value * unit);
        }
        let equivalent;
        let formula = '';
        if (type === 'series') {
            equivalent = 0;
            formula = 'Req = ';
            for (let i = 0; i < resistors.length; i++) {
                equivalent += resistors[i];
                formula += `R${i+1}`;
                if (i < resistors.length - 1) formula += ' + ';
            }
            formula += ` = ${equivalent} Ω`;
        } else {
            let sum = 0;
            formula = '1/Req = ';
            for (let i = 0; i < resistors.length; i++) {
                sum += 1 / resistors[i];
                formula += `1/R${i+1}`;
                if (i < resistors.length - 1) formula += ' + ';
            }
            if (resistors.length === 2) {
                const productOverSum = (resistors[0] * resistors[1]) / (resistors[0] + resistors[1]);
                formula += ` = ${sum.toFixed(6)} (Ω<sup>-1</sup>)<br>`;
                formula += `For two resistors: Req = (R1 × R2) / (R1 + R2) = (${resistors[0]} × ${resistors[1]}) / (${resistors[0]} + ${resistors[1]}) = ${productOverSum.toFixed(4)} Ω`;
            } else {
                formula += ` = ${sum.toFixed(6)} (Ω<sup>-1</sup>)<br>Therefore, Req = 1/${sum.toFixed(6)} = ${(1 / sum).toFixed(4)} Ω`;
            }
            equivalent = 1 / sum;
        }
        let displayValue, unitLabel;
        if (equivalent >= 1e6) {
            displayValue = equivalent / 1e6;
            unitLabel = 'MΩ';
        } else if (equivalent >= 1e3) {
            displayValue = equivalent / 1e3;
            unitLabel = 'kΩ';
        } else {
            displayValue = equivalent;
            unitLabel = 'Ω';
        }
        resultDiv.innerHTML = `<p><strong>Equivalent Resistance:</strong> ${displayValue.toFixed(4)} ${unitLabel}</p><p><strong>Calculation:</strong><br>${formula}</p>`;
    }
    function formatResistance(res) {
        if (res === null || res === undefined) return '0Ω';
        if (res >= 1e6) return (res / 1e6).toFixed(2) + 'MΩ';
        if (res >= 1e3) return (res / 1e3).toFixed(2) + 'kΩ';
        return res.toFixed(2) + 'Ω';
    }
    window.openMainTab = openMainTab;
    window.switchCalcTab = switchCalcTab;
    window.updateBands = updateBands;
    window.calculateResistance = calculateResistance;
    window.calculateSMD = calculateSMD;
    window.addResistor = addResistor;
    window.removeResistor = removeResistor;
    window.calculate = calculate;
    window.formatResistance = formatResistance;
    document.addEventListener('DOMContentLoaded', updateBands);
})();

// -------------------------------------------------------------------
// LED resistor calculator
// -------------------------------------------------------------------
(() => {
    const supplyInput = document.getElementById('supplyVoltage');
    if (!supplyInput) return;
    const standardResistors = [10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82,
        100, 120, 150, 180, 220, 270, 330, 390, 470, 560, 680, 820];
    function calculateResistor() {
        const supply = parseFloat(document.getElementById('supplyVoltage').value);
        const ledV = parseFloat(document.getElementById('ledVoltage').value);
        const ledI = parseFloat(document.getElementById('ledCurrent').value);
        if (isNaN(supply) || supply <= 0 || isNaN(ledV) || ledV <= 0 || ledV >= supply || isNaN(ledI) || ledI <= 0) {
            alert('Please enter valid values.\n\n- All values must be positive numbers\n- LED voltage must be less than supply voltage');
            return;
        }
        const resistorValue = (supply - ledV) / (ledI / 1000);
        let nearest = standardResistors[0];
        let minDiff = Math.abs(resistorValue - nearest);
        for (const r of standardResistors) {
            const diff = Math.abs(resistorValue - r);
            if (diff < minDiff) {
                minDiff = diff;
                nearest = r;
            }
        }
        const power = Math.pow(ledI / 1000, 2) * nearest;
        document.getElementById('resistorValue').textContent = resistorValue.toFixed(0) + ' Ω';
        document.getElementById('standardResistor').textContent = nearest + ' Ω';
        document.getElementById('resistorPower').textContent = power.toFixed(3) + ' W';
    }
    window.calculateResistor = calculateResistor;
})();

// -------------------------------------------------------------------
// To‑do list manager
// -------------------------------------------------------------------
(() => {
    const itemInput = document.getElementById('itemInput');
    if (!itemInput) return;
    let tasks = [];
    let currentFilter = 'all';
    function createTask(content) {
        return { id: Date.now(), content: content, completed: false, createdAt: new Date() };
    }
    function loadTasks() {
        const saved = localStorage.getItem('tasks');
        if (saved) tasks = JSON.parse(saved);
        showTasks();
    }
    function saveTasks() { localStorage.setItem('tasks', JSON.stringify(tasks)); }
    function addItem() {
        const content = itemInput.value.trim();
        if (content !== '') {
            const newTask = createTask(content);
            tasks.unshift(newTask);
            itemInput.value = '';
            saveTasks();
            showTasks();
            updateStats();
        }
    }
    function removeItem(id) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        showTasks();
        updateStats();
    }
    function editItem(id) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            const newContent = prompt('Edit task:', task.content);
            if (newContent !== null && newContent.trim() !== '') {
                task.content = newContent.trim();
                saveTasks();
                showTasks();
            }
        }
    }
    function toggleComplete(id) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            saveTasks();
            showTasks();
            updateStats();
        }
    }
    function filterTasks(filter) {
        currentFilter = filter;
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        // highlight the clicked button (event.target) is not accessible here; rely on inline calls
        showTasks();
    }
    function updateStats() {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const pending = total - completed;
        document.getElementById('totalTasks').textContent = total;
        document.getElementById('completedTasks').textContent = completed;
        document.getElementById('pendingTasks').textContent = pending;
    }
    function showTasks() {
        const list = document.getElementById('itemList');
        list.innerHTML = '';
        let filtered = tasks;
        if (currentFilter === 'completed') filtered = tasks.filter(t => t.completed);
        else if (currentFilter === 'pending') filtered = tasks.filter(t => !t.completed);
        if (filtered.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'empty-state';
            empty.innerHTML = `
                <i class="fas fa-inbox"></i>
                <p>${currentFilter === 'all' ? 'No tasks yet. Add your first task!' :
                    currentFilter === 'completed' ? 'No completed tasks yet.' : 'No pending tasks. Great job!'}</p>
            `;
            list.appendChild(empty);
        } else {
            filtered.forEach(task => {
                const taskItem = document.createElement('div');
                taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
                taskItem.innerHTML = `
                    <div class="checkbox ${task.completed ? 'checked' : ''}" onclick="toggleComplete(${task.id})"></div>
                    <div class="task-content">${task.content}</div>
                    <div class="task-actions">
                        <button class="btn btn-warning btn-small" onclick="editItem(${task.id})"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-danger btn-small" onclick="removeItem(${task.id})"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                list.appendChild(taskItem);
            });
        }
        updateStats();
    }
    window.addItem = addItem;
    window.removeItem = removeItem;
    window.editItem = editItem;
    window.toggleComplete = toggleComplete;
    window.filterTasks = filterTasks;
    document.addEventListener('DOMContentLoaded', loadTasks);
})();

// -------------------------------------------------------------------
// Wire gauge calculator
// -------------------------------------------------------------------
(() => {
    const awgTable = document.getElementById('awgTableBody');
    if (!awgTable) return;
    const awgData = [
        { awg: 0, diameter: 8.25, mm2: 53.5, maxCurrent: 195, resistance: 0.32 },
        { awg: 1, diameter: 7.35, mm2: 42.4, maxCurrent: 165, resistance: 0.40 },
        { awg: 2, diameter: 6.54, mm2: 33.6, maxCurrent: 130, resistance: 0.51 },
        { awg: 3, diameter: 5.83, mm2: 26.7, maxCurrent: 115, resistance: 0.64 },
        { awg: 4, diameter: 5.19, mm2: 21.2, maxCurrent: 95, resistance: 0.81 },
        { awg: 5, diameter: 4.62, mm2: 16.8, maxCurrent: 85, resistance: 1.02 },
        { awg: 6, diameter: 4.11, mm2: 13.3, maxCurrent: 75, resistance: 1.29 },
        { awg: 7, diameter: 3.67, mm2: 10.5, maxCurrent: 65, resistance: 1.63 },
        { awg: 8, diameter: 3.26, mm2: 8.37, maxCurrent: 55, resistance: 2.06 },
        { awg: 9, diameter: 2.91, mm2: 6.63, maxCurrent: 45, resistance: 2.59 },
        { awg: 10, diameter: 2.59, mm2: 5.26, maxCurrent: 35, resistance: 3.28 },
        { awg: 11, diameter: 2.30, mm2: 4.17, maxCurrent: 30, resistance: 4.13 },
        { awg: 12, diameter: 2.05, mm2: 3.31, maxCurrent: 25, resistance: 5.21 },
        { awg: 13, diameter: 1.83, mm2: 2.62, maxCurrent: 20, resistance: 6.57 },
        { awg: 14, diameter: 1.63, mm2: 2.08, maxCurrent: 18, resistance: 8.29 },
        { awg: 15, diameter: 1.45, mm2: 1.65, maxCurrent: 16, resistance: 10.4 },
        { awg: 16, diameter: 1.29, mm2: 1.31, maxCurrent: 14, resistance: 13.2 },
        { awg: 17, diameter: 1.15, mm2: 1.04, maxCurrent: 12, resistance: 16.6 },
        { awg: 18, diameter: 1.02, mm2: 0.823, maxCurrent: 10, resistance: 20.9 },
        { awg: 19, diameter: 0.91, mm2: 0.653, maxCurrent: 8, resistance: 26.4 },
        { awg: 20, diameter: 0.81, mm2: 0.518, maxCurrent: 6, resistance: 33.3 },
        { awg: 22, diameter: 0.64, mm2: 0.326, maxCurrent: 4, resistance: 52.9 },
        { awg: 24, diameter: 0.51, mm2: 0.205, maxCurrent: 2.5, resistance: 84.2 },
        { awg: 26, diameter: 0.40, mm2: 0.129, maxCurrent: 1.5, resistance: 134 },
        { awg: 28, diameter: 0.32, mm2: 0.0810, maxCurrent: 1, resistance: 213 },
        { awg: 30, diameter: 0.25, mm2: 0.0509, maxCurrent: 0.5, resistance: 339 }
    ];
    function populateAWGTable() {
        awgTable.innerHTML = '';
        awgData.forEach(wire => {
            const row = awgTable.insertRow();
            row.innerHTML = `
                <td>AWG ${wire.awg}</td>
                <td>${wire.diameter.toFixed(2)}</td>
                <td>${wire.mm2.toFixed(2)}</td>
                <td>${wire.maxCurrent}</td>
                <td>${wire.resistance.toFixed(2)}</td>
            `;
        });
    }
    function calculateWireGauge() {
        const current = parseFloat(document.getElementById('current').value);
        const voltageDropPercent = parseFloat(document.getElementById('voltageDrop').value);
        const length = parseFloat(document.getElementById('length').value);
        const voltage = parseFloat(document.getElementById('voltage').value);
        if (isNaN(current) || current <= 0) { alert('Current must be a positive number'); return; }
        if (isNaN(voltageDropPercent) || voltageDropPercent <= 0 || voltageDropPercent > 10) { alert('Voltage drop must be between 0% and 10%'); return; }
        if (isNaN(length) || length <= 0) { alert('Wire length must be positive'); return; }
        if (isNaN(voltage) || voltage <= 0) { alert('System voltage must be positive'); return; }
        const maxVoltageDrop = (voltageDropPercent / 100) * voltage;
        const maxResistance = maxVoltageDrop / current;
        const resistivity = 1.68e-8;
        const areaMm2 = (resistivity * length * 2 / maxResistance) * 1e6;
        // Determine the recommended AWG wire.  The data array is ordered from
        // largest cross‑section (AWG 0) down to the smallest (AWG 30), so
        // iterating from start would always select AWG 0 for any required area.
        // To find the smallest gauge that still meets the required area, iterate
        // from the end (smallest mm²) upwards until finding a wire with a
        // cross‑section equal to or larger than the calculated area.  This
        // ensures the selected wire is as small as possible while meeting the
        // specification.
        let recommended = awgData[awgData.length - 1];
        for (let i = awgData.length - 1; i >= 0; i--) {
            const wire = awgData[i];
            if (wire.mm2 >= areaMm2) {
                recommended = wire;
                break;
            }
        }
        const actualResistance = (resistivity * length * 2) / (recommended.mm2 * 1e-6);
        const actualVoltageDrop = (actualResistance * current / voltage) * 100;
        const powerLoss = current * current * actualResistance;
        document.getElementById('awgResult').textContent = `AWG ${recommended.awg}`;
        document.getElementById('mm2Result').textContent = `${recommended.mm2.toFixed(2)} mm²`;
        document.getElementById('actualDrop').textContent = `${actualVoltageDrop.toFixed(2)}%`;
        document.getElementById('powerLoss').textContent = `${powerLoss.toFixed(2)} W`;
        const dropBox = document.getElementById('dropBox');
        const awgBox = document.getElementById('awgBox');
        if (actualVoltageDrop <= voltageDropPercent) {
            dropBox.className = 'result-box success';
            awgBox.className = 'result-box success';
        } else if (actualVoltageDrop <= voltageDropPercent * 1.2) {
            dropBox.className = 'result-box warning';
            awgBox.className = 'result-box warning';
        } else {
            dropBox.className = 'result-box error';
            awgBox.className = 'result-box error';
        }
        if (current > recommended.maxCurrent) {
            awgBox.className = 'result-box error';
            document.getElementById('awgResult').innerHTML = `AWG ${recommended.awg}<br><small style="color: var(--error-color);">Exceeds ampacity!</small>`;
        }
    }
    function openMainTab(evt, tabName) {
        const contents = document.getElementsByClassName('main-tabcontent');
        for (let i = 0; i < contents.length; i++) contents[i].style.display = 'none';
        const buttons = document.getElementsByClassName('main-tab-button');
        for (let i = 0; i < buttons.length; i++) buttons[i].classList.remove('active');
        document.getElementById(tabName).style.display = 'block';
        evt.currentTarget.classList.add('active');
    }
    window.openMainTab = openMainTab;
    window.populateAWGTable = populateAWGTable;
    window.calculateWireGauge = calculateWireGauge;
    document.addEventListener('DOMContentLoaded', () => {
        populateAWGTable();
        calculateWireGauge();
    });
})();

// -------------------------------------------------------------------
// Global scroll‑to‑top button (if present)
// -------------------------------------------------------------------
(() => {
    const scrollBtn = document.getElementById('scroll-to-top');
    if (!scrollBtn) return;
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    });
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
})();

// -------------------------------------------------------------------
// Unified main tab switching
//
// Several calculators require switching between high‑level tab panels (e.g.,
// Inductance vs. Series/Parallel on the resistor and capacitor pages).  The
// original pages each defined their own `openMainTab` function, which led to
// multiple definitions in this consolidated script.  To ensure consistent
// behaviour across all pages and to avoid the need to pass the native
// `event` object explicitly, a single implementation is defined below and
// exported on the global `window` object.  The first argument may be an
// Event, an element, or omitted entirely; when missing the function will
// locate the corresponding tab button based on the target tab name.
function openMainTab(evt, tabName) {
    // Hide all main tab contents
    const contents = document.getElementsByClassName('main-tabcontent');
    for (let i = 0; i < contents.length; i++) contents[i].style.display = 'none';
    // Remove active class from all tab buttons
    const buttons = document.getElementsByClassName('main-tab-button');
    for (let i = 0; i < buttons.length; i++) buttons[i].classList.remove('active');
    // Show the requested tab
    const target = document.getElementById(tabName);
    if (target) target.style.display = 'block';
    // Determine which button to activate
    let buttonToActivate = null;
    if (evt) {
        // If passed an event use its currentTarget; if passed a DOM node use it directly
        buttonToActivate = evt.currentTarget || evt;
    } else {
        // Fallback: attempt to find the button whose onclick handler references the tabName
        const candidates = document.querySelectorAll(`.main-tab-button[onclick*='${tabName}']`);
        if (candidates.length > 0) buttonToActivate = candidates[0];
    }
    if (buttonToActivate && buttonToActivate.classList) {
        buttonToActivate.classList.add('active');
    }
}
// Export globally; this will override earlier definitions from other modules
window.openMainTab = openMainTab;

/**
 * Switch between sub‑tabs within a calculator section.  Many pages have a
 * container with multiple `.tab-content` panels and corresponding
 * `.tab-button` controls.  Rather than hard‑coding an ID like
 * `SeriesParallel`, this implementation determines which container
 * contains the requested tab and only toggles visibility within that
 * context.  This allows multiple sub‑tab interfaces to coexist on a
 * page (e.g., in the resistor and capacitor calculators) without
 * interfering with each other.
 *
 * @param {string} tabId The ID of the content panel to show (e.g., 'SeriesTab').
 */
function switchCalcTab(tabId) {
    const targetContent = document.getElementById(tabId);
    if (!targetContent) return;
    // Find the nearest ancestor that contains tab buttons; this should be
    // a `.main-tabcontent` or similar container.
    let container = targetContent.parentElement;
    while (container && !container.classList.contains('main-tabcontent') && !container.querySelector('.tab-button')) {
        container = container.parentElement;
    }
    if (!container) return;
    // Remove active class and hide all tabs within this container
    container.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    container.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    // Show the requested panel
    targetContent.classList.add('active');
    // Activate the corresponding button
    const btn = container.querySelector(`button[onclick*="${tabId}"]`);
    if (btn) btn.classList.add('active');
}
// Override any earlier definitions
window.switchCalcTab = switchCalcTab;

// -------------------------------------------------------------------
// Capacitor calculator logic (code calculators and series/parallel)
// -------------------------------------------------------------------
(() => {
    const codeContainer = document.getElementById('CodeCalculator');
    if (!codeContainer) return;
    function switchCapTab(tabId) {
        codeContainer.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        codeContainer.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        const activeTab = document.getElementById(tabId);
        if (activeTab) activeTab.classList.add('active');
        const button = codeContainer.querySelector(`button[onclick="switchCapTab('${tabId}')"]`);
        if (button) button.classList.add('active');
    }
    function calculateCeramic() {
        const codeEl = document.getElementById('ceramicCode');
        const resultEl = document.getElementById('ceramicResult');
        if (!codeEl || !resultEl) return;
        const codeVal = codeEl.value.trim().toUpperCase();
        let capacitance = 0;
        let unit = 'pF';
        if (codeVal.includes('R')) {
            capacitance = parseFloat(codeVal.replace('R', '.'));
            unit = 'pF';
        } else if (/^\d{2,3}$/.test(codeVal)) {
            const digits = codeVal.length;
            const value = parseInt(codeVal.substring(0, digits - 1));
            const multiplier = parseInt(codeVal.substring(digits - 1));
            capacitance = value * Math.pow(10, multiplier);
            if (capacitance >= 1000000) {
                capacitance = capacitance / 1000000;
                unit = 'µF';
            } else if (capacitance >= 1000) {
                capacitance = capacitance / 1000;
                unit = 'nF';
            } else {
                unit = 'pF';
            }
        }
        let resultText = 'Capacitance: ';
        if (capacitance > 0 || codeVal === '0') {
            resultText += capacitance.toFixed(2).replace(/\.0+$/, '').replace(/\.0$/, '') + unit;
            if (unit === 'pF' && capacitance >= 1000) {
                const nfValue = capacitance / 1000;
                resultText += ' (' + nfValue.toFixed(2).replace(/\.0+$/, '').replace(/\.0$/, '') + 'nF)';
            } else if (unit === 'nF' && capacitance >= 1000) {
                const ufValue = capacitance / 1000;
                resultText += ' (' + ufValue.toFixed(2).replace(/\.0+$/, '').replace(/\.0$/, '') + 'µF)';
            } else if (unit === 'pF' && capacitance >= 1000000) {
                const ufVal = capacitance / 1000000;
                resultText += ' (' + ufVal.toFixed(2).replace(/\.0+$/, '').replace(/\.0$/, '') + 'µF)';
            }
        }
        resultEl.textContent = resultText;
    }
    function calculateElectrolytic() {
        const valueInput = document.getElementById('electrolyticValue');
        const voltageColor = document.getElementById('voltageColor');
        const resultEl = document.getElementById('electrolyticResult');
        const voltageRes = document.getElementById('voltageResult');
        if (!valueInput || !resultEl) return;
        const valueStr = valueInput.value.trim();
        let capacitance = 0;
        let unit = 'µF';
        const match = valueStr.match(/^([\d.]+)\s*([munp]?F)?$/i);
        if (match) {
            capacitance = parseFloat(match[1]);
            if (match[2]) unit = match[2].toUpperCase();
            if (unit === 'PF') {
                capacitance = capacitance / 1000000;
                unit = 'µF';
            } else if (unit === 'NF') {
                capacitance = capacitance / 1000;
                unit = 'µF';
            } else if (unit === 'MF' || unit === 'F') {
                capacitance = capacitance * 1000000;
                unit = 'µF';
            }
        }
        let resultText = 'Capacitance: ';
        if (capacitance > 0 || valueStr === '0') {
            resultText += capacitance.toFixed(2).replace(/\.0+$/, '').replace(/\.0$/, '') + 'µF';
            const nfVal = capacitance * 1000;
            const pfVal = capacitance * 1000000;
            resultText += ' (' + nfVal.toFixed(0) + 'nF, ' + pfVal.toFixed(0) + 'pF)';
        }
        resultEl.textContent = resultText;
        if (voltageRes) {
            const col = voltageColor ? voltageColor.value : '';
            voltageRes.textContent = col ? 'Estimated Voltage Rating: ' + col + 'V' : '';
        }
    }
    function addCapacitor(type) {
        const container = document.getElementById(type + '-capacitors');
        if (!container) return;
        const count = container.children.length + 1;
        const div = document.createElement('div');
        div.className = 'capacitor-input';
        div.innerHTML = `
            <label>C${count}:</label>
            <input type="number" min="0" step="0.01" value="10">
            <select class="unit-selector">
                <option value="1e-12">pF</option>
                <option value="1e-9">nF</option>
                <option value="1e-6" selected>μF</option>
                <option value="1e-3">mF</option>
                <option value="1">F</option>
            </select>
        `;
        container.appendChild(div);
    }
    function removeCapacitor(type) {
        const container = document.getElementById(type + '-capacitors');
        if (!container) return;
        if (container.children.length > 1) container.removeChild(container.lastChild);
    }
    function calculateCapacitance(type) {
        const container = document.getElementById(type + '-capacitors');
        const resultDiv = document.getElementById(type + '-result');
        if (!container || !resultDiv) return;
        const inputs = container.querySelectorAll('input');
        const units = container.querySelectorAll('select');
        const caps = [];
        for (let i = 0; i < inputs.length; i++) {
            const val = parseFloat(inputs[i].value);
            const unit = parseFloat(units[i].value);
            if (isNaN(val) || val <= 0) {
                resultDiv.innerHTML = '<p style="color: var(--error-color);">Error: All capacitor values must be positive numbers.</p>';
                return;
            }
            caps.push(val * unit);
        }
        let equivalent;
        let formula = '';
        if (type === 'series') {
            let sum = 0;
            formula = '1/Ceq = ';
            for (let i = 0; i < caps.length; i++) {
                sum += 1 / caps[i];
                formula += `1/C${i + 1}`;
                if (i < caps.length - 1) formula += ' + ';
            }
            equivalent = 1 / sum;
            formula += ` = ${sum.toFixed(6)} (F<sup>-1</sup>)<br>Therefore, Ceq = 1/${sum.toFixed(6)} = ${equivalent.toExponential(6)} F`;
        } else {
            equivalent = 0;
            formula = 'Ceq = ';
            for (let i = 0; i < caps.length; i++) {
                equivalent += caps[i];
                formula += `C${i + 1}`;
                if (i < caps.length - 1) formula += ' + ';
            }
            formula += ` = ${equivalent.toExponential(6)} F`;
        }
        let displayValue, displayUnit;
        if (equivalent >= 1) {
            displayValue = equivalent;
            displayUnit = 'F';
        } else if (equivalent >= 1e-3) {
            displayValue = equivalent * 1e3;
            displayUnit = 'mF';
        } else if (equivalent >= 1e-6) {
            displayValue = equivalent * 1e6;
            displayUnit = 'µF';
        } else if (equivalent >= 1e-9) {
            displayValue = equivalent * 1e9;
            displayUnit = 'nF';
        } else {
            displayValue = equivalent * 1e12;
            displayUnit = 'pF';
        }
        resultDiv.innerHTML = `<p><strong>Equivalent Capacitance:</strong> ${displayValue.toFixed(4)} ${displayUnit}</p><p><strong>Calculation:</strong><br>${formula}</p>`;
    }
    window.switchCapTab = switchCapTab;
    window.calculateCeramic = calculateCeramic;
    window.calculateElectrolytic = calculateElectrolytic;
    window.addCapacitor = addCapacitor;
    window.removeCapacitor = removeCapacitor;
    window.calculateCapacitance = calculateCapacitance;
    document.addEventListener('DOMContentLoaded', () => {
        calculateCeramic();
    });
})();