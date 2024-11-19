import { GameState } from './GameState.js';

/**
 * Class managing all game screens (start, game over, etc.) using PIXI.js v8
 * @class Screens
 */
export class Screens {
    constructor(app, gameState) {
        this.app = app;
        this.gameState = gameState;
        this.currentScreen = null;
        this.cachedScreens = new Map();
    }

    /**
     * Preload all screen assets and cache screens
     */
    async preloadAssets() {
        console.log('Preloading screen assets...');

        try {
            // Create and cache start screen
            const startScreen = await this.createStartScreen();
            this.cachedScreens.set('start', startScreen);
            console.log('Start screen cached');

            // Create and cache game over screen
            const gameOverScreen = await this.createGameOverScreen();
            this.cachedScreens.set('gameOver', gameOverScreen);
            console.log('Game over screen cached');

        } catch (error) {
            console.error('Error preloading screen assets:', error);
        }
    }

    /**
     * Creates a base overlay container with common styles
     */
    createOverlay() {
        const overlay = new PIXI.Container();

        // Add semi-transparent background using correct PIXI v8 syntax
        const background = new PIXI.Graphics()
            .rect(0, 0, this.app.screen.width, this.app.screen.height)
            .fill({ color: 0x000000, alpha: 0.7 });

        overlay.addChild(background);
        overlay.zIndex = 1000;
        this.app.stage.sortableChildren = true;

        return overlay;
    }

    /**
     * Creates the start screen container
     */
    async createStartScreen() {
        console.log('Creating start screen...');
        const overlay = this.createOverlay();

        // Add decorative background rectangle with correct order
        const bgRect = new PIXI.Graphics()
            .rect(
                this.app.screen.width / 2 - 250,
                this.app.screen.height / 2 - 200,
                500,
                400
            )
            .fill({ color: 0x000033, alpha: 0.8 })
            .stroke({ color: 0x4400ff, width: 4, alpha: 1 });

        overlay.addChild(bgRect);

        // Add title text
        const titleText = new PIXI.Text({
            text: 'Space Game',
            style: {
                fontFamily: 'Arial',
                fontSize: 64,
                fill: 0xFFFFFF,
                align: 'center',
                dropShadow: true,
                dropShadowColor: '#000066',
                dropShadowBlur: 8,
                dropShadowDistance: 10,
                letterSpacing: 5,
            }
        });
        titleText.anchor.set(0.5);
        titleText.position.set(this.app.screen.width / 2, this.app.screen.height / 2 - 100);
        overlay.addChild(titleText);

        // Add start button with modified click handler
        const startButton = this.createButton('Start Game', this.app.screen.width / 2, this.app.screen.height / 2 + 50, () => {
            console.log('Start button clicked');
            // Use the gameState reference directly
            this.gameState.setState(GameState.States.PLAYING);
        });
        overlay.addChild(startButton);

        overlay.visible = true;
        return overlay;
    }

    /**
     * Creates the game over screen container
     */
    async createGameOverScreen() {
        console.log('Creating game over screen...');
        const overlay = this.createOverlay();

        // Add decorative background rectangle with correct order
        const bgRect = new PIXI.Graphics()
            .rect(
                this.app.screen.width / 2 - 250,
                this.app.screen.height / 2 - 200,
                500,
                400
            )
            .fill({ color: 0x330000, alpha: 0.8 })
            .stroke({ color: 0xff0000, width: 4, alpha: 1 });

        overlay.addChild(bgRect);

        // Create "Game Over!" text
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
                dropShadowDistance: 10,
                letterSpacing: 5,
            }
        });
        gameOverText.anchor.set(0.5);
        gameOverText.position.set(this.app.screen.width / 2, this.app.screen.height / 2 - 100);
        overlay.addChild(gameOverText);

        // Add restart button with modified click handler
        const restartButton = this.createButton('Play Again', this.app.screen.width / 2, this.app.screen.height / 2 + 50, () => {
            console.log('Restart button clicked');
            this.hideCurrentScreen();
            // Use the gameState reference to restart
            this.gameState.setState(GameState.States.PLAYING);
        });
        overlay.addChild(restartButton);

        overlay.visible = true;
        return overlay;
    }

    /**
     * Shows the start screen
     */
    showStartScreen() {
        console.log('Showing start screen...');
        this.hideCurrentScreen();
        const startScreen = this.cachedScreens.get('start');
        if (startScreen) {
            console.log('Found start screen in cache');
            startScreen.visible = true;
            this.currentScreen = startScreen;
            this.app.stage.addChild(startScreen);

            // Force the screen to be on top
            startScreen.zIndex = 1000;
            this.app.stage.sortChildren();

            // Log screen properties
            console.log('Start screen properties:', {
                visible: startScreen.visible,
                zIndex: startScreen.zIndex,
                position: `${startScreen.x}, ${startScreen.y}`,
                children: startScreen.children.length
            });
        } else {
            console.error('Start screen not found in cache');
        }
    }

    /**
     * Shows the game over screen
     */
    showGameOverScreen() {
        this.hideCurrentScreen();
        const gameOverScreen = this.cachedScreens.get('gameOver');
        if (gameOverScreen) {
            gameOverScreen.visible = true;
            this.currentScreen = gameOverScreen;
            this.app.stage.addChild(gameOverScreen);
        }
    }

    /**
     * Hides current screen if exists
     */
    hideCurrentScreen() {
        if (this.currentScreen) {
            this.currentScreen.visible = false;
            this.app.stage.removeChild(this.currentScreen);
            this.currentScreen = null;
        }
    }

    /**
     * Clean up method
     */
    destroy() {
        this.hideCurrentScreen();
        this.cachedScreens.forEach(screen => screen.destroy({ children: true }));
        this.cachedScreens.clear();
    }

    /**
     * Creates an interactive button with hover effects
     * @private
     * @param {string} text - Button text
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Function} onClick - Click handler
     * @returns {PIXI.Container} Button container
     */
    createButton(text, x, y, onClick) {
        const button = new PIXI.Container();
        button.x = x;
        button.y = y;

        // Create button background with correct order
        const background = new PIXI.Graphics()
            .roundRect(-100, -25, 200, 50, 10)
            .fill({ color: 0x4400ff, alpha: 0.6 })
            .stroke({ color: 0x6622ff, width: 2, alpha: 0.8 });

        // Create button text
        const buttonText = new PIXI.Text({
            text,
            style: {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: 0xFFFFFF,
                align: 'center',
                dropShadow: true,
                dropShadowColor: '#000033',
                dropShadowBlur: 4,
                dropShadowDistance: 2,
            }
        });
        buttonText.anchor.set(0.5);

        // Make button interactive
        button.eventMode = 'static';
        button.cursor = 'pointer';

        // Update hover effects
        button.on('pointerover', () => {
            background.clear()
                .roundRect(-100, -25, 200, 50, 10)
                .fill({ color: 0x6622ff, alpha: 0.8 })
                .stroke({ color: 0x8844ff, width: 2, alpha: 1 });
        });

        button.on('pointerout', () => {
            background.clear()
                .roundRect(-100, -25, 200, 50, 10)
                .fill({ color: 0x4400ff, alpha: 0.6 })
                .stroke({ color: 0x6622ff, width: 2, alpha: 0.8 });
        });

        // Add click handler
        button.on('pointertap', onClick);

        // Add elements to button container
        button.addChild(background);
        button.addChild(buttonText);

        return button;
    }
} 