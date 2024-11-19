import { Controls } from './components/Controls.js';
import { Enemy } from './components/Enemy.js';
import { Hero } from './components/Hero.js';
import { BoostSystem } from './components/BoostSystem.js';
import { GameState } from './components/GameState.js';
import { ScoreDisplay } from './components/ScoreDisplay.js';

class Game {
    constructor() {
        this.sprites = [];
        this.asteroids = [];
        this.paused = true;
        this.gameOver = false;
        this.controls = null;
        this.gameState = null;
        this.boostSystem = null;
        this.scoreDisplay = null;
        this.initGame();
    }

    async initGame() {
        try {
            // Create PIXI application
            this.app = new PIXI.Application();
            await this.app.init({ 
                width: Math.max(640, window.innerWidth),
                height: Math.max(360, window.innerHeight),
                resizeTo: window,
                backgroundColor: 0x000033,
            });

            // Add to DOM
            const gameContainer = document.getElementById('gameContainer');
            if (!gameContainer) {
                throw new Error('Game container not found');
            }
            gameContainer.appendChild(this.app.canvas);

            // Create space background
            this.createSpaceBackground();

            // Initialize game state (which will handle screens)
            this.gameState = new GameState(this);
            await this.gameState.initialize(this.app);

            // Initialize controls
            this.controls = new Controls(this.app, false);

            // Initialize game over handler
            this.initGameOverHandler();

            // Keep ticker running for UI animations
            this.app.ticker.start();

        } catch (error) {
            // Keep error handling but remove console
        }
    }

    initGameOverHandler() {
        window.addEventListener('game-over', () => {
            if (this.gameOver) return;
            this.gameOver = true;
            this.app.ticker.stop();
            this.gameState.setState(GameState.States.GAME_OVER);
        });
    }

    async startGame() {
        try {
            // Stop the UI ticker temporarily
            this.app.ticker.stop();

            // Clear any existing sprites
            this.sprites.forEach(sprite => sprite?.destroy?.());
            this.sprites = [];

            // Load game assets
            const [bunnyTexture, mcTexture] = await Promise.all([
                PIXI.Assets.load('https://pixijs.io/examples/examples/assets/bunny.png'),
                PIXI.Assets.load('https://pixijs.com/assets/spritesheet/mc.json')
            ]);

            // Initialize game objects
            const x = this.app.screen.width / 2;
            const y = this.app.screen.height / 2;

            const hero = new Hero(this.app, bunnyTexture, x, y, this);
            const enemy = new Enemy(this.app, bunnyTexture, x, y, hero, this);

            // Reset score before adding event listener
            this.score = 0;
            if (this.scoreDisplay) {
                this.scoreDisplay.destroy();
            }
            this.scoreDisplay = new ScoreDisplay();
            this.scoreDisplay.updateScore(this.score);

            this.app.stage.addChild(enemy.container);
            this.app.stage.addChild(hero.sprite);

            this.sprites.push(enemy, hero);

            // Initialize boost system
            if (this.boostSystem) {
                this.boostSystem.destroy();
            }
            this.boostSystem = new BoostSystem();

            // Start the game
            this.paused = false;
            this.gameOver = false;
            this.app.ticker.start();
            
            // Dispatch game started event
            window.dispatchEvent(new CustomEvent('game-started'));

        } catch (error) {
            // Keep error handling but remove console
        }
    }

    restartGame() {
        this.gameState.setState(GameState.States.PLAYING);
    }

    createSpaceBackground() {
        // Create a starfield background
        const stars = new PIXI.Container();
        
        // Add dark background with correct PIXI v8 syntax
        const background = new PIXI.Graphics()
            .rect(0, 0, this.app.screen.width, this.app.screen.height)
            .fill({ color: 0x000033, alpha: 1 });
        stars.addChild(background);

        // Create star container
        const starsGraphics = new PIXI.Graphics();
        stars.addChild(starsGraphics);

        // Create initial stars
        const starPoints = [];
        for (let i = 0; i < 200; i++) {
            starPoints.push({
                x: Math.random() * this.app.screen.width,
                y: Math.random() * this.app.screen.height,
                size: Math.random() * 2,
                speed: (Math.random() * 2) + 1,
                alpha: Math.random() * 0.5 + 0.5
            });
        }

        // Add nebula effect with correct PIXI v8 syntax
        const nebula = new PIXI.Graphics();
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * this.app.screen.width;
            const y = Math.random() * this.app.screen.height;
            const radius = 100 + Math.random() * 150;
            const color = [0x4400ff, 0xff00ff, 0x00ffff][Math.floor(Math.random() * 3)];
            
            nebula
                .circle(x, y, radius)
                .fill({ color, alpha: 0.1 });
        }
        stars.addChild(nebula);
        
        // Add stars behind everything else
        stars.zIndex = -1;
        this.app.stage.sortableChildren = true;
        this.app.stage.addChild(stars);
        
        // Animate stars with correct PIXI v8 syntax
        this.app.ticker.add(() => {
            starsGraphics.clear();
            
            starPoints.forEach(star => {
                // Move star down
                star.y += star.speed;
                
                // Reset star position when it goes off screen
                if (star.y > this.app.screen.height) {
                    star.y = -5;
                    star.x = Math.random() * this.app.screen.width;
                }
                
                // Draw star with current position and twinkle effect
                const twinkle = 0.3 + Math.sin(Date.now() * 0.001 + star.x) * 0.2;
                starsGraphics
                    .circle(star.x, star.y, star.size)
                    .fill({ color: 0xFFFFFF, alpha: star.alpha * twinkle });
            });
        });
    }

    // Update score method
    updateScore(amount) {
        this.score += amount;
        if (this.scoreDisplay) {
            this.scoreDisplay.updateScore(this.score);
        }
    }

    // Update destroy/cleanup
    destroy() {
        if (this.scoreDisplay) {
            this.scoreDisplay.destroy();
        }
        if (this.boostSystem) {
            this.boostSystem.destroy();
        }
        if (this.gameState) {
            this.gameState.destroy();
        }
        if (this.controls) {
            this.controls.destroy();
        }
        if (this.app) {
            this.app.destroy(true);
        }
    }

    addAsteroid(asteroid) {
        this.asteroids.push(asteroid);
    }

    removeAsteroid(asteroid) {
        const index = this.asteroids.indexOf(asteroid);
        if (index > -1) {
            this.asteroids.splice(index, 1);
        }
    }
}

// Initialize game when window loads
window.addEventListener('load', () => {
    new Game();
}); 