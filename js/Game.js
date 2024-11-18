import { Controls } from './components/Controls.js';
import { Enemy } from './components/Enemy.js';
import { Hero } from './components/Hero.js';
import { BoostSystem } from './components/BoostSystem.js';
import { Screens } from './components/Screens.js';

class Game {
    constructor() {
        this.sprites = [];
        this.paused = true;
        this.gameOver = false;
        this.controls = null;
        this.screens = null;
        this.initGame();
        this.initGameOverHandler();
    }

    initGameOverHandler() {
        window.addEventListener('game-over', () => {
            if (this.gameOver) return;
            this.gameOver = true;
            
            // Stop the game
            this.app.ticker.stop();
            
            // Show game over screen
            this.screens.showGameOverScreen();
        });
    }

    restartGame() {
        console.log('=== RESTART GAME CALLED ===');
        // Reset game state
        this.gameOver = false;
        this.paused = false;
        
        // Clear console
        console.clear();
        
        console.log('Clearing existing sprites...');
        // Clear existing sprites
        this.sprites.forEach(sprite => {
            if (sprite.destroy) {
                console.log('Destroying sprite:', sprite);
                sprite.destroy();
            }
        });
        this.sprites = [];
        
        console.log('Reinitializing game...');
        // Reset positions and reinitialize game
        this.init().then(hero => {
            if (hero) {
                const centerX = this.app.screen.width / 2;
                const centerY = this.app.screen.height / 2;
                console.log('Found hero, resetting position to center:', centerX, centerY);
                hero.resetPosition(centerX, centerY);
                hero.startAnimation();
            } else {
                console.warn('Hero not found after init!');
            }
            
            // Start ticker and dispatch event
            this.app.ticker.start();
            window.dispatchEvent(new CustomEvent('game-started'));
            
            // Initialize boost system
            this.boostSystem = new BoostSystem();
        });
        
        console.log('=== RESTART GAME COMPLETE ===');
    }

    async initGame() {
        try {
            // Create application instance without options
            this.app = new PIXI.Application();
            
            // Initialize with options using init()
            await this.app.init({ 
                width: Math.max(640, window.innerWidth),
                height: Math.max(360, window.innerHeight),
                resizeTo: window,
                backgroundColor: 0x000033,
            });
            
            // Create space background after app is initialized
            this.createSpaceBackground();

            // Initialize controls without start overlay
            this.controls = new Controls(this.app, false);

            // Initialize screens
            this.screens = new Screens(this.app, this);

            // Show start screen instead of creating it directly
            this.screens.showStartScreen();

            this.app.renderer.resize(Math.max(640, window.innerWidth), Math.max(360, window.innerHeight));

            window.addEventListener('resize', () => {
                const newWidth = Math.max(640, window.innerWidth);
                const newHeight = Math.max(360, window.innerHeight);
                this.app.renderer.resize(newWidth, newHeight);
                
                if (this.sprites.length > 0) {
                    const centerX = newWidth / 2;
                    const centerY = newHeight / 2;
                    this.sprites.forEach(sprite => {
                        sprite.sprite.x = centerX;
                        sprite.sprite.y = centerY;
                    });
                }
            });

            const gameContainer = document.getElementById('gameContainer');
            if (gameContainer) {
                gameContainer.appendChild(this.app.canvas);
                await this.init();
                
                this.app.ticker.stop();

                if (!this.gameStartListenerAdded) {
                    window.addEventListener('game-started', () => {
                        this.paused = false;
                        this.app.ticker.start();
                        this.boostSystem = new BoostSystem();
                    });
                    this.gameStartListenerAdded = true;
                }
            } else {
                throw new Error('Game container not found');
            }
        } catch (error) {
            console.error('Failed to initialize PIXI application:', error);
        }
    }

    async init() {
        try {
            const bunnyTexture = await PIXI.Assets.load('https://pixijs.io/examples/examples/assets/bunny.png');
            const mcTexture = await PIXI.Assets.load('https://pixijs.com/assets/spritesheet/mc.json');
            
            console.log('=== GAME INIT ===');
            // Reset positions to center
            const x = this.app.screen.width / 2;
            const y = this.app.screen.height / 2;
            console.log('Center coordinates - x:', x, 'y:', y);

            const hero = new Hero(
                this.app,
                bunnyTexture,
                x,
                y
            );

            console.log('Hero created, forcing position reset');
            hero.resetPosition(x, y);
            console.log('Hero position after reset - x:', hero.sprite.x, 'y:', hero.sprite.y);

            const enemy = new Enemy(
                this.app,
                bunnyTexture,
                x,
                y,
                hero,
                this
            );

            this.app.stage.addChild(enemy.container);
            this.app.stage.addChild(hero.sprite);

            this.sprites.push(enemy, hero);
            
            console.log('=== GAME INIT COMPLETE ===');
            console.log('Final hero position - x:', hero.sprite.x, 'y:', hero.sprite.y);

            return hero;
        } catch (error) {
            console.error('Failed to initialize game components:', error);
        }
    }

    startGame() {
        this.paused = false;
        this.app.ticker.start();
        // This is the ONLY place we should dispatch game-started
        window.dispatchEvent(new CustomEvent('game-started'));
    }

    createSpaceBackground() {
        // Create a starfield background
        const stars = new PIXI.Container();
        
        // Create multiple layers of stars for parallax effect
        for (let i = 0; i < 200; i++) {
            const star = new PIXI.Graphics();
            const size = Math.random() * 2 + 1;
            const alpha = Math.random() * 0.5 + 0.5;
            
            star.fill({ color: 0xFFFFFF, alpha })
                .circle(0, 0, size);
            
            star.x = Math.random() * this.app.screen.width;
            star.y = Math.random() * this.app.screen.height;
            
            stars.addChild(star);
        }

        // Set the background color to dark space
        this.app.renderer.background.color = 0x000033;
        
        // Add stars behind everything else
        stars.zIndex = -1;
        this.app.stage.sortableChildren = true;
        this.app.stage.addChild(stars);
        
        // Optional: Add subtle animation to stars
        this.app.ticker.add(() => {
            stars.children.forEach(star => {
                star.alpha = 0.3 + Math.sin(Date.now() * 0.001 + star.x) * 0.2;
            });
        });
    }
}

window.addEventListener('load', () => {
    new Game();
}); 