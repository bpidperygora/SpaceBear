/**
 * Class representing an animated explosion effect
 * @class ExplosionEffect
 */
export class ExplosionEffect {
    /**
     * Creates a new explosion animation
     * @param {PIXI.Application} app - The PIXI application instance
     * @param {number} x - X position of explosion
     * @param {number} y - Y position of explosion
     * @param {Object} options - Configuration options
     */
    constructor(app, x, y, options = {}) {
        const explosionTextures = [];
        
        // Create textures array from sprite sheet
        for (let i = 0; i < 26; i++) {
            explosionTextures.push(
                PIXI.Texture.from(`Explosion_Sequence_A ${i + 1}.png`)
            );
        }
        
        // Create the explosion sprite
        this.explosion = new PIXI.AnimatedSprite(explosionTextures);
        
        // Configure the explosion
        this.explosion.x = x;
        this.explosion.y = y;
        this.explosion.anchor.set(0.5);
        this.explosion.scale.set(options.scale || 0.75);
        this.explosion.animationSpeed = options.speed || 0.5;
        this.explosion.loop = false;
        
        // Add to stage
        app.stage.addChild(this.explosion);
        
        // Play the animation
        this.explosion.play();
        
        // Remove sprite when animation completes
        this.explosion.onComplete = () => {
            app.stage.removeChild(this.explosion);
            this.explosion.destroy();
        };
    }
} 