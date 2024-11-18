/**
 * Class managing all game screens (start, game over, etc.) using PIXI.js v8
 * @class Screens
 */
export class Screens {
    constructor(app, game) {
        this.app = app;
        this.game = game;
        this.currentScreen = null;
    }

    /**
     * Creates a base overlay container with common styles and space-themed stars
     * @private
     * @returns {PIXI.Container} The overlay container
     */
    createOverlay() {
        const overlay = new PIXI.Container();
        overlay.zIndex = 1000; // Ensure overlay is on top
        this.app.stage.addChild(overlay);

        // Add dark semi-transparent overlay to hide game elements
        const background = new PIXI.Graphics();
        background.fill({ color: 0x000000, alpha: 0.85 }) // Semi-transparent black
            .rect(0, 0, this.app.screen.width, this.app.screen.height);
        overlay.addChild(background);

        console.log(overlay);
        
        return overlay;
    }

    /**
     * Creates and shows the start screen using PIXI.js
     */
    showStartScreen() {
        const overlay = this.createOverlay();

        // Add dark rectangle behind text and button
        const textBg = new PIXI.Graphics();

        textBg.fill({ color: 0x000000, alpha: 1 }) // More opaque background
            .roundRect(
                this.app.screen.width / 2 - 200, // Wider rectangle
                this.app.screen.height / 2 - 150, // Higher up
                400, // Wider
                250, // Taller
                20
            );

        overlay.addChild(textBg);

        // Create "Click to Start Game" text with glow effect
        const startText = new PIXI.Text({
            text: 'Click to Start Game',
            style: {
                fontFamily: 'Arial',
                fontSize: 48,
                fill: 0xFFFFFF,
                align: 'center',
                dropShadow: true,
                dropShadowColor: '#000066',
                dropShadowBlur: 8,
                dropShadowAngle: Math.PI / 6,
                dropShadowDistance: 10,
            }
        });
        startText.anchor.set(0.5);
        startText.position.set(this.app.screen.width / 2, this.app.screen.height / 2 - 50);
        overlay.addChild(startText);

        // Create Start button
        const startButton = this.createButton('Start Game', this.app.screen.width / 2, this.app.screen.height / 2 + 50, () => {
            this.hideCurrentScreen();
            this.game.startGame();
        });

        overlay.addChild(startButton);
        this.showScreen(overlay);
    }

    /**
     * Creates and shows the game over screen using PIXI.js
     */
    showGameOverScreen() {
        const overlay = this.createOverlay();

        // Add dark rectangle behind text and button
        const textBg = new PIXI.Graphics();
        textBg.fill(0x000000, 1) // More opaque background
            .roundRect(
                this.app.screen.width / 2 - 200, // Wider rectangle
                this.app.screen.height / 2 - 150, // Higher up
                400, // Wider
                250, // Taller
                20
            );
        overlay.addChild(textBg);

        // Create "Game Over!" text with glow effect
        const gameOverText = new PIXI.Text({
            text: 'Game Over!',
            style: {
                fontFamily: 'Arial',
                fontSize: 64,
                fill: 0xFF0000,
                align: 'center',
                dropShadow: true,
                dropShadowColor: '#660000',
                dropShadowBlur: 8,
                dropShadowAngle: Math.PI / 6,
                dropShadowDistance: 10,
            }
        });
        gameOverText.anchor.set(0.5);
        gameOverText.position.set(this.app.screen.width / 2, this.app.screen.height / 2 - 50);
        overlay.addChild(gameOverText);

        // Create Restart button with space theme
        const restartButton = this.createButton('Play Again', this.app.screen.width / 2, this.app.screen.height / 2 + 50, () => {
            this.hideCurrentScreen();
            if (this.game?.restartGame) {
                this.game.restartGame();
            }
        });

        overlay.addChild(restartButton);
        this.showScreen(overlay);
    }

    /**
     * Creates a styled button using PIXI.js
     */
    createButton(text, x, y, onClick) {
        const button = new PIXI.Container();
        button.interactive = true;
        button.cursor = 'pointer';

        // Create button background with gradient effect
        const buttonBg = new PIXI.Graphics();

        // Main button shape with fill and stroke
        buttonBg.fill({ color: 0x4400ff, alpha: 0.8 })
            .roundRect(-120, -30, 240, 60, 15)
            .stroke({ width: 2, color: 0x6622ff, alpha: 1 });

        // Add inner glow
        const innerGlow = new PIXI.Graphics();
        innerGlow.fill({ color: 0x6622ff, alpha: 0.4 })
            .roundRect(-115, -25, 230, 50, 12);

        // Add outer glow
        const outerGlow = new PIXI.Graphics();
        outerGlow.fill({ color: 0x4400ff, alpha: 0.2 })
            .roundRect(-125, -35, 250, 70, 18);

        // Add all layers to button
        button.addChild(outerGlow);
        button.addChild(buttonBg);
        button.addChild(innerGlow);

        // Button text with enhanced glow
        const buttonText = new PIXI.Text({
            text: text,
            style: {
                fontFamily: 'Arial',
                fontSize: 28,
                fill: 0xFFFFFF,
                align: 'center',
                dropShadow: true,
                dropShadowColor: '#000066',
                dropShadowBlur: 6,
                dropShadowAngle: Math.PI / 6,
                dropShadowDistance: 8,
            }
        });
        buttonText.anchor.set(0.5);
        button.addChild(buttonText);

        button.position.set(x, y);

        // Enhanced hover effects
        button.on('pointerover', () => {
            buttonBg.clear()
                .fill({ color: 0x6622ff, alpha: 0.9 })
                .roundRect(-120, -30, 240, 60, 15)
                .stroke({ width: 2, color: 0x8844ff, alpha: 1 });

            innerGlow.clear()
                .fill({ color: 0x8844ff, alpha: 0.5 })
                .roundRect(-115, -25, 230, 50, 12);

            outerGlow.clear()
                .fill({ color: 0x6622ff, alpha: 0.3 })
                .roundRect(-125, -35, 250, 70, 18);

            button.scale.set(1.05);
            buttonText.style.dropShadowDistance = 10;
        });

        button.on('pointerout', () => {
            buttonBg.clear()
                .fill({ color: 0x4400ff, alpha: 0.8 })
                .roundRect(-120, -30, 240, 60, 15)
                .stroke({ width: 2, color: 0x6622ff, alpha: 1 });

            innerGlow.clear()
                .fill({ color: 0x6622ff, alpha: 0.4 })
                .roundRect(-115, -25, 230, 50, 12);

            outerGlow.clear()
                .fill({ color: 0x4400ff, alpha: 0.2 })
                .roundRect(-125, -35, 250, 70, 18);

            button.scale.set(1.0);
            buttonText.style.dropShadowDistance = 8;
        });

        button.on('pointerdown', () => {
            button.scale.set(0.95);
            setTimeout(() => {
                onClick();
            }, 100);
        });

        button.on('pointerup', () => {
            button.scale.set(1.05);
        });

        return button;
    }

    /**
     * Shows a screen and stores it as current
     * @private
     * @param {PIXI.Container} screen - The screen container to show
     */
    showScreen(screen) {
        this.hideCurrentScreen();
        this.currentScreen = screen;
    }

    /**
     * Hides and removes current screen if exists
     * @private
     */
    hideCurrentScreen() {
        if (this.currentScreen) {
            this.app.stage.removeChild(this.currentScreen);
            this.currentScreen.destroy({ children: true });
            this.currentScreen = null;
        }
    }

    /**
     * Clean up method
     */
    destroy() {
        this.hideCurrentScreen();
    }
} 