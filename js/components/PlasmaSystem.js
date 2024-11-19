/**
 * Class managing plasma shot mechanics and cooldown system
 * @class PlasmaSystem
 */
export class PlasmaSystem {
    static PLASMA_CONFIG = {
        COOLDOWN_TIME: 200,
        PLASMA_SPEED: 15,
        PLASMA_SIZE: 20,
        PLASMA_COLOR: 0x00ffff,
    };

    constructor(app, hero) {
        this.app = app;
        this.hero = hero;
        this.cooldownProgress = 100;
        this.canShoot = true;
        this.plasmaShots = [];

        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.initializeControls();
    }

    initializeControls() {
        document.removeEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keydown', this.handleKeyDown);
    }

    handleKeyDown(e) {
        if (e.code === 'Enter' && this.canShoot) {
            this.shootPlasma();
        }
    }

    shootPlasma() {
        if (!this.canShoot) return;

        // Create plasma shot
        const plasma = new PIXI.Graphics()
            .circle(0, 0, PlasmaSystem.PLASMA_CONFIG.PLASMA_SIZE)
            .fill({ color: PlasmaSystem.PLASMA_CONFIG.PLASMA_COLOR, alpha: 0.8 });

        // Set initial position
        plasma.x = this.hero.sprite.x;
        plasma.y = this.hero.sprite.y;

        // Set velocity based on hero's direction
        const angle = this.hero.sprite.rotation + Math.PI / 2;
        plasma.vx = Math.cos(angle) * PlasmaSystem.PLASMA_CONFIG.PLASMA_SPEED;
        plasma.vy = Math.sin(angle) * PlasmaSystem.PLASMA_CONFIG.PLASMA_SPEED;

        // Add to stage and array
        this.app.stage.addChild(plasma);
        this.plasmaShots.push(plasma);

        // Start cooldown
        this.canShoot = false;

        // Cooldown timer
        setTimeout(() => {
            this.canShoot = true;
        }, PlasmaSystem.PLASMA_CONFIG.COOLDOWN_TIME);
    }

    update() {
        for (let i = this.plasmaShots.length - 1; i >= 0; i--) {
            const plasma = this.plasmaShots[i];
            plasma.x += plasma.vx;
            plasma.y += plasma.vy;

            // Out of bounds check
            if (plasma.x < 0 || plasma.x > this.app.screen.width ||
                plasma.y < 0 || plasma.y > this.app.screen.height) {
                this.destroyPlasma(i);
                continue;
            }

            // Get asteroids from the game instance
            const asteroids = this.hero.game.asteroids;
            
            // Check collision with each asteroid
            for (let j = asteroids.length - 1; j >= 0; j--) {
                const asteroid = asteroids[j];
                if (!asteroid || !asteroid.sprite) continue;

                // Calculate collision
                const dx = plasma.x - asteroid.sprite.x;
                const dy = plasma.y - asteroid.sprite.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const combinedRadius = asteroid.size + PlasmaSystem.PLASMA_CONFIG.PLASMA_SIZE;

                if (distance < combinedRadius) {
                    // Destroy asteroid
                    asteroid.destroy();
                    this.hero.game.removeAsteroid(asteroid);
                    
                    // Update score
                    if (this.hero.game) {
                        this.hero.game.updateScore(-1);
                    }
                    
                    // Destroy plasma
                    this.destroyPlasma(i);
                    break;
                }
            }
        }
    }

    destroyPlasma(index) {
        const plasma = this.plasmaShots[index];
        if (plasma) {
            this.app.stage.removeChild(plasma);
            plasma.destroy();
            this.plasmaShots.splice(index, 1);
        }
    }

    destroy() {
        document.removeEventListener('keydown', this.handleKeyDown);
        
        // Clean up plasma shots
        this.plasmaShots.forEach(plasma => {
            this.app.stage.removeChild(plasma);
            plasma.destroy();
        });
        this.plasmaShots = [];
    }
} 