/**
 * Class representing a particle trail effect
 * @class ParticleTrail
 */
export class ParticleTrail {
    constructor(app, target) {
        this.app = app;
        this.target = target;
        this.particles = new PIXI.Container();
        this.particlePool = [];
        this.enabled = false;
        this.currentColor = 0xFFFF00;
        this.particleSize = 2; // Default size

        app.stage.addChild(this.particles);
        
        this.boundUpdate = this.update.bind(this);
        app.ticker.add(this.boundUpdate);

        // Listen for toggle events with color and size
        window.addEventListener('trail-toggle', (e) => {
            this.enabled = e.detail.enabled;
            if (e.detail.color !== undefined) {
                this.currentColor = e.detail.color;
                // Set particle size based on boost type
                this.particleSize = e.detail.color === 0xFF6800 ? 4 : 2; // Bigger for super boost
                this.clearParticles();
            }
            if (!this.enabled) {
                this.clearParticles();
            }
        });
    }

    createParticle() {
        const particle = new PIXI.Graphics();
        particle.fill(this.currentColor);
        particle.circle(0, 0, this.particleSize);
        particle.fill();
        particle.tint = this.currentColor;
        return particle;
    }

    update() {
        if (!this.enabled) return;

        let particle = this.particlePool.pop();
        if (!particle) {
            particle = this.createParticle();
        } else {
            // Update existing particle's color and size
            particle.clear();
            particle.fill(this.currentColor);
            particle.circle(0, 0, this.particleSize);
            particle.fill();
            particle.tint = this.currentColor;
        }
        
        particle.x = this.target.sprite.x;
        particle.y = this.target.sprite.y;
        particle.alpha = 0.6;
        this.particles.addChild(particle);

        // Update existing particles
        for (let i = this.particles.children.length - 1; i >= 0; i--) {
            const p = this.particles.children[i];
            p.alpha -= 0.02;

            if (p.alpha <= 0) {
                this.particles.removeChild(p);
                this.particlePool.push(p);
            }
        }
    }

    clearParticles() {
        // Remove all existing particles
        while (this.particles.children.length > 0) {
            const particle = this.particles.children[0];
            this.particles.removeChild(particle);
            this.particlePool.push(particle);
        }
    }

    destroy() {
        this.app.ticker.remove(this.boundUpdate);
        this.clearParticles();
        // Clean up particle pool
        this.particlePool.forEach(p => p.destroy());
        this.particlePool = [];
        this.particles.destroy(true);
    }
} 