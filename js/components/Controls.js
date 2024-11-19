/**
 * Class representing UI controls for animation parameters
 * @class Controls
 */
export class Controls {
    constructor(app, autoStart = false) {
        this.app = app;
        this.speedSlider = null;
        this.panel = null;
        this.isPanelVisible = false;
        
        this.createInstructions();
        this.createOptionsButton();
        this.createControlPanel();
    }

    createInstructions() {
        const instructions = document.createElement('div');
        instructions.style.cssText = `
            position: fixed;
            bottom: 50px;
            left: 20px;
            background: rgba(0, 0, 0, 0.3);
            padding: 15px;
            border-radius: 8px;
            color: white;
            font-family: Arial;
            font-size: 12px;
            z-index: 1000;
            pointer-events: none;
        `;
        
        instructions.innerHTML = `
            <div style="margin-bottom: 10px"><strong>Controls:</strong></div>
            <div style="margin-bottom: 5px">Hold SPACE: 13x speed + trail</div>
            <div style="margin-bottom: 5px">Double SPACE: 20x speed (5s or until released)</div>
            <div style="margin-bottom: 5px">Hold ALT: Slow motion</div>
            <div style="margin-bottom: 5px">ENTER: Shoot plasma</div>
        `;
        
        document.body.appendChild(instructions);
    }

    createOptionsButton() {
        const button = document.createElement('div');
        button.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 40px;
            height: 40px;
            background: rgba(0, 0, 0, 0.7);
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1001;
            transition: transform 0.3s;
        `;

        // Gear icon using Unicode
        button.innerHTML = `<span style="color: white; font-size: 24px;">⚙️</span>`;

        button.addEventListener('click', () => {
            this.togglePanel();
            button.style.transform = this.isPanelVisible ? 'rotate(90deg)' : 'rotate(0deg)';
        });

        document.body.appendChild(button);
    }

    createControlPanel() {
        this.panel = document.createElement('div');
        this.panel.style.cssText = `
            position: fixed;
            top: 60px;
            right: -250px;
            width: 200px;
            background: rgba(0, 0, 0, 0.7);
            padding: 15px;
            border-radius: 8px;
            color: white;
            font-family: Arial;
            z-index: 1000;
            transition: right 0.3s;
        `;

        // Only sound toggle
        this.addSoundToggle(this.panel);

        document.body.appendChild(this.panel);

        // Listen for speed changes from boost system
        window.addEventListener('speed-change', (e) => {
            if (this.speedSlider) {
                this.speedSlider.value = e.detail;
            }
        });
    }

    togglePanel() {
        this.isPanelVisible = !this.isPanelVisible;
        this.panel.style.right = this.isPanelVisible ? '10px' : '-250px';
    }

    addSoundToggle(parent) {
        const container = document.createElement('div');
        container.style.marginBottom = '10px';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'sound-effects';
        checkbox.checked = true;

        const labelElement = document.createElement('label');
        labelElement.textContent = 'Sound Effects';
        labelElement.htmlFor = checkbox.id;

        checkbox.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('sound-toggle', { 
                detail: checkbox.checked 
            }));
        });

        container.appendChild(checkbox);
        container.appendChild(labelElement);
        parent.appendChild(container);
    }
} 