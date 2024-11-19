import { ExplosionEffect } from './ExplosionEffect.js';
import { ParticleTrail } from './ParticleTrail.js';
import { SoundManager } from './SoundManager.js';
import { PlasmaSystem } from './PlasmaSystem.js';

/**
 * Class representing a sprite that bounces around the screen
 * @class Hero
 */
export class Hero {

    constructor(app, texture, x, y, game) {
        this.app = app;
        this.sprite = new PIXI.Sprite(texture);
        
        // Set initial properties
        this.sprite.anchor.set(0.5);
        this.sprite.x = x;
        this.sprite.y = y;
        
        // Velocity components for smoother movement
        this.velocityX = 5;
        this.velocityY = 5;
        
        // Store screen boundaries
        this.screenBounds = {
            left: this.sprite.width / 2,
            right: this.app.screen.width - this.sprite.width / 2,
            top: this.sprite.height / 2,
            bottom: this.app.screen.height - this.sprite.height / 2
        };
        
        // Bind the animation to prevent memory leaks
        this.boundAnimate = this.animate.bind(this);
        
        // Start animation
        this.startAnimation();
        
        // Add rotation interpolation factor (smaller value for smoother rotation)
        this.rotationLerpFactor = 0.12;
        
        // Initialize target rotation to match initial movement direction
        this.targetRotation = Math.atan2(this.velocityY, this.velocityX) - Math.PI/2;
        
        // Set initial rotation
        this.sprite.rotation = this.targetRotation;
        
        // Listen for control events
        window.addEventListener('speed-change', (e) => {
            const speed = e.detail;
            this.velocityX = Math.sign(this.velocityX) * speed;
            this.velocityY = Math.sign(this.velocityY) * speed;
        });

        window.addEventListener('scale-change', (e) => {
            this.sprite.scale.set(e.detail);
        });

        // Create particle trail
        this.trail = new ParticleTrail(app, this);
        
        // Initialize sound manager
        this.soundManager = new SoundManager();
        
        // Add hit flash effect
        this.hitFlash = false;
        this.flashDuration = 100; // milliseconds
        
        // Listen for game over
        window.addEventListener('game-over', () => this.onGameOver());
        
        this.resetPosition(x, y);
        
        // Initialize plasma system
        this.plasmaSystem = new PlasmaSystem(app, this);

        this.game = game;
    }

    startAnimation() {
        // Remove any existing ticker to prevent duplicates
        this.stopAnimation();
        this.app.ticker.add(this.boundAnimate);
    }

    stopAnimation() {
        this.app.ticker.remove(this.boundAnimate);
    }

    animate() {
        // Update position
        this.sprite.x += this.velocityX;
        this.sprite.y += this.velocityY;
        
        // Calculate target rotation based on movement direction
        this.targetRotation = Math.atan2(this.velocityY, this.velocityX) - Math.PI/2;
        
        // Smoothly interpolate current rotation to target rotation
        const rotationDiff = this.targetRotation - this.sprite.rotation;
        
        // Normalize the rotation difference to prevent spinning more than 180 degrees
        const normalizedDiff = Math.atan2(Math.sin(rotationDiff), Math.cos(rotationDiff));
        
        // Apply smooth rotation with adjusted lerp factor for smoother rotation
        this.sprite.rotation += normalizedDiff * this.rotationLerpFactor;
        
        // Bounce off horizontal edges with explosion
        if (this.sprite.x >= this.screenBounds.right) {
            this.createExplosion();
            this.sprite.x = this.screenBounds.right;
            this.velocityX *= -1;
            this.soundManager.play('bounce');
        } else if (this.sprite.x <= this.screenBounds.left) {
            this.createExplosion();
            this.sprite.x = this.screenBounds.left;
            this.velocityX *= -1;
            this.soundManager.play('bounce');
        }
        
        // Bounce off vertical edges with explosion
        if (this.sprite.y >= this.screenBounds.bottom) {
            this.createExplosion();
            this.sprite.y = this.screenBounds.bottom;
            this.velocityY *= -1;
            this.soundManager.play('bounce');
        } else if (this.sprite.y <= this.screenBounds.top) {
            this.createExplosion();
            this.sprite.y = this.screenBounds.top;
            this.velocityY *= -1;
            this.soundManager.play('bounce');
        }
        
        // Update plasma system
        this.plasmaSystem.update();
    }

    /**
     * Creates an explosion effect at the current sprite position
     * @private
     */
    createExplosion() {
        new ExplosionEffect(this.app, this.sprite.x, this.sprite.y, {
            scale: 0.5,
            speed: 0.75
        });
    }

    // Clean up method to prevent memory leaks
    destroy() {
        this.stopAnimation();
        if (this.trail) {
            this.trail.destroy();
        }
        if (this.sprite) {
            this.sprite.destroy();
            this.sprite = null; // Ensure sprite reference is cleared
        }
        
        if (this.plasmaSystem) {
            this.plasmaSystem.destroy();
        }
    }

    onGameOver() {
        if (!this.sprite) return; // Add check for sprite existence
        
        // Flash effect
        this.hitFlash = true;
        this.sprite.tint = 0xFF0000; // Red tint
        
        // Create explosion effect and store last position
        const lastX = this.sprite.x;
        const lastY = this.sprite.y;
        
        // Stop movement
        this.stopAnimation();
        
        // Create explosion at last known position
        new ExplosionEffect(this.app, lastX, lastY, {
            scale: 0.5,
            speed: 0.75
        });
        
        // Play death sound if available
        if (this.soundManager) {
            this.soundManager.play('bounce');
        }
    }

    resetPosition(x, y) {
        console.log('=== HERO RESET POSITION CALLED ===');
        console.log('Reset to x:', x, 'y:', y);
        
        this.sprite.x = x;
        this.sprite.y = y;
        
        // Set random initial direction
        const randomAngle = Math.random() * Math.PI * 2; // Random angle between 0 and 2π
        const speed = 5; // Base speed
        
        // Calculate velocities based on random angle
        this.velocityX = Math.cos(randomAngle) * speed;
        this.velocityY = Math.sin(randomAngle) * speed;
        
        // Ensure we don't get very shallow angles (too horizontal or vertical)
        if (Math.abs(this.velocityX) < 2) {
            this.velocityX = Math.sign(this.velocityX) * 2;
        }
        if (Math.abs(this.velocityY) < 2) {
            this.velocityY = Math.sign(this.velocityY) * 2;
        }
        
        // Reset rotation to match new direction
        this.targetRotation = Math.atan2(this.velocityY, this.velocityX) - Math.PI/2;
        this.sprite.rotation = this.targetRotation;
        
        console.log('New random direction:', {
            angle: (randomAngle * 180 / Math.PI).toFixed(2) + '°',
            velocityX: this.velocityX.toFixed(2),
            velocityY: this.velocityY.toFixed(2)
        });
    }
} 