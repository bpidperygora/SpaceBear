import { Screens } from './Screens.js';

/**
 * Class managing game state and transitions
 * @class GameState
 */
export class GameState {
    static States = {
        LOADING: 'loading',
        START_SCREEN: 'startScreen',
        PLAYING: 'playing',
        GAME_OVER: 'gameOver'
    };

    constructor(game) {
        this.game = game;
        this.currentState = GameState.States.LOADING;
        this.screens = null;
        this.initialized = false;
    }

    /**
     * Initialize game state and screens
     * @param {PIXI.Application} app - The PIXI application instance
     */
    async initialize(app) {
        if (this.initialized) return;
        
        try {
            this.screens = new Screens(app, this);
            await this.screens.preloadAssets();
            this.setState(GameState.States.START_SCREEN);
            this.initialized = true;
        } catch (error) {
            // Keep error handling but remove console
        }
    }

    /**
     * Set new game state and handle transitions
     * @param {string} newState - New state to transition to
     */
    setState(newState) {
        const prevState = this.currentState;
        this.currentState = newState;

        // Handle state transitions
        switch (newState) {
            case GameState.States.START_SCREEN:
                this.screens.showStartScreen();
                break;

            case GameState.States.PLAYING:
                this.screens.hideCurrentScreen();
                this.game.startGame();
                break;

            case GameState.States.GAME_OVER:
                this.screens.showGameOverScreen();
                break;
        }

        // Dispatch state change event
        window.dispatchEvent(new CustomEvent('game-state-change', {
            detail: { prevState, newState }
        }));
    }

    /**
     * Clean up resources
     */
    destroy() {
        if (this.screens) {
            this.screens.destroy();
        }
    }
} 