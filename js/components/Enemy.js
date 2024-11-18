import { Asteroid } from './Asteroid.js';

/**
 * Class representing an evil flaming bear that tracks the target
 * @class Enemy
 */
export class Enemy {
    constructor(app, texture, x, y, target, game) {
        this.app = app;
        this.target = target;
        this.game = game;
        
        this.container = new PIXI.Container();
        this.container.x = x;
        this.container.y = y;
        
        // Setup the bear sprite
        this.sprite = new PIXI.Sprite(texture);
        this.sprite.anchor.set(0.5);
        this.sprite.tint = 0xFF3300;
        this.sprite.scale.set(1.5);
        
        // Store original tint color
        this.originalTint = 0xFF3300;
        
        // Create flames
        this.flames = new PIXI.Container();
        this.createSimpleFlames();
        
        // Add everything to container
        this.container.addChild(this.flames);
        this.container.addChild(this.sprite);
        
        // Initialize shooting properties
        this.asteroids = [];
        this.initialShot = true;
        this.gameStarted = false;
        this.nextShootTime = 0;
        
        // Bind methods
        this.boundTrack = this.track.bind(this);
        this.handleGameStart = () => {
            console.log('=== GAME STARTED ===');
            console.log('Event listener triggered!');
            console.log('Current ticker time:', this.app.ticker.lastTime);
            this.gameStarted = true;
            this.initialShot = true;
            this.nextShootTime = this.app.ticker.lastTime + 3000;
            console.log('Next shoot time set to:', this.nextShootTime);
            this.asteroids = [];
        };
        
        // Add event listeners
        window.addEventListener('game-started', this.handleGameStart);
        console.log('Added game-started event listener');
        this.app.ticker.add(this.boundTrack);
        
        console.log('Enemy constructed, waiting for game-started event');
    }

    createSimpleFlames() {
        for (let i = 0; i < 12; i++) {
            const flame = new PIXI.Graphics();
            
            const color = i % 2 === 0 ? 0xFF0000 : 0xFF6600;
            flame.fill({ color, alpha: 0.8 });
            
            flame.moveTo(0, -40);
            flame.quadraticCurveTo(
                20, -20,
                10, 10
            );
            flame.quadraticCurveTo(
                0, 0,
                0, 10
            );
            flame.quadraticCurveTo(
                -20, -20,
                0, -40
            );
            flame.fill();
            
            const angle = (i / 12) * Math.PI * 2;
            const radius = 40;
            flame.x = Math.cos(angle) * radius;
            flame.y = Math.sin(angle) * radius;
            
            flame.alpha = 0.8;
            flame.speed = 0.1 + Math.random() * 0.2;
            flame.offset = Math.random() * Math.PI * 2;
            flame.baseX = flame.x;
            flame.baseY = flame.y;
            
            this.flames.addChild(flame);
        }
    }

    shootAsteroid() {
        if (!this.gameStarted) {
            console.log('Attempted to shoot but game not started');
            return;
        }
        
        console.log('=== SHOOTING ASTEROID ===');
        const size = 10 + Math.random() * 20;
        const asteroid = new Asteroid(
            this.app,
            this.container.x,
            this.container.y,
            this.target.sprite.x,
            this.target.sprite.y,
            size
        );
        this.asteroids.push(asteroid);
        
        // Set next shoot time (7-14 seconds)
        this.nextShootTime = this.app.ticker.lastTime + 7000 + Math.random() * 7000;
        console.log('Next shoot time updated to:', this.nextShootTime);
    }

    track() {
        if (!this.target || !this.target.sprite) return;

        // Basic tracking movement
        const dx = this.target.sprite.x - this.container.x;
        const dy = this.target.sprite.y - this.container.y;
        const angle = Math.atan2(dy, dx);
        
        const targetRotation = angle + Math.PI / 2;
        let currentRotation = this.sprite.rotation;
        
        while (targetRotation - currentRotation > Math.PI) currentRotation += Math.PI * 2;
        while (targetRotation - currentRotation < -Math.PI) currentRotation -= Math.PI * 2;
        
        this.sprite.rotation = currentRotation + (targetRotation - currentRotation) * 0.1;

        // Animate flames
        const time = this.app.ticker.lastTime * 0.001;
        this.flames.children.forEach((flame, i) => {
            flame.x = flame.baseX + Math.sin(time * flame.speed + flame.offset) * 5;
            flame.y = flame.baseY + Math.cos(time * flame.speed + flame.offset) * 5;
            flame.alpha = 0.6 + Math.sin(time * 3 + i) * 0.3;
            flame.rotation = Math.sin(time * flame.speed) * 0.3;
            const scale = 0.8 + Math.sin(time * 2 + i) * 0.2;
            flame.scale.set(scale);
        });

        // Handle shooting logic only if game has started
        if (this.gameStarted) {
            const currentTime = this.app.ticker.lastTime;
            const timeToShoot = this.nextShootTime - currentTime;
            
            // Log timing every second (to avoid console spam)
            if (Math.floor(currentTime / 1000) !== Math.floor((currentTime - 16) / 1000)) {
                console.log('=== TIMING UPDATE ===');
                console.log('Game started:', this.gameStarted);
                console.log('Current time:', currentTime);
                console.log('Next shoot time:', this.nextShootTime);
                console.log('Time to shoot:', timeToShoot);
                console.log('Initial shot:', this.initialShot);
            }

            // Warning animation
            if (timeToShoot < 2000) {
                const progress = Math.max(0, Math.min(1, 1 - (timeToShoot / 2000)));
                this.sprite.tint = this.lerpColor(this.originalTint, 0xFFFFFF, progress);
                console.log('Warning animation progress:', progress);
            } else {
                this.sprite.tint = this.originalTint;
            }

            // Shoot if it's time
            if (currentTime >= this.nextShootTime) {
                console.log('SHOOT CONDITION MET!');
                console.log('Current time:', currentTime);
                console.log('Next shoot time:', this.nextShootTime);
                this.shootAsteroid();
            }

            // Update asteroids and check collisions
            for (let i = this.asteroids.length - 1; i >= 0; i--) {
                const asteroid = this.asteroids[i];
                if (asteroid.update()) {
                    asteroid.destroy();
                    this.asteroids.splice(i, 1);
                    continue;
                }

                if (this.checkCollision(asteroid, this.target)) {
                    this.handleGameOver();
                    break;
                }
            }
        }
    }

    handleGameOver() {
        this.gameStarted = false;
        
        // Clear all asteroids first
        this.asteroids.forEach(asteroid => asteroid.destroy());
        this.asteroids = [];
        
        // Reset timers
        this.nextShootTime = 0;
        this.initialShot = true;
        
        // Dispatch game-over event
        window.dispatchEvent(new CustomEvent('game-over'));
        
        // Stop the game ticker last
        this.app.ticker.stop();
    }

    destroy() {
        this.app.ticker.remove(this.boundTrack);
        window.removeEventListener('game-started', this.handleGameStart);
        this.flames.destroy({ children: true });
        this.sprite.destroy();
        this.container.destroy();
        
        // Clear all asteroids
        this.asteroids.forEach(asteroid => asteroid.destroy());
        this.asteroids = [];
    }

    // Add collision detection method
    checkCollision(asteroid, hero) {
        if (!hero.sprite || !asteroid.sprite) return false; // Add null checks
        
        const dx = asteroid.sprite.x - hero.sprite.x;
        const dy = asteroid.sprite.y - hero.sprite.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const combinedRadius = asteroid.size + hero.sprite.width / 2;
        
        if (distance < combinedRadius) {
            this.handleGameOver();
            return true;
        }
        return false;
    }

    // Helper function for color interpolation
    lerpColor(start, end, amount) {
        const sr = (start >> 16) & 255;
        const sg = (start >> 8) & 255;
        const sb = start & 255;
        
        const er = (end >> 16) & 255;
        const eg = (end >> 8) & 255;
        const eb = end & 255;
        
        const r = sr + (er - sr) * amount;
        const g = sg + (eg - sg) * amount;
        const b = sb + (eb - sb) * amount;
        
        return (r << 16) | (g << 8) | b;
    }
} 