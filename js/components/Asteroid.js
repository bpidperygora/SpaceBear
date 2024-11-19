export class Asteroid {
    constructor(app, startX, startY, targetX, targetY, size) {
        this.app = app;
        this.name = 'asteroid';
        this.destroyed = false;
        
        // Create asteroid graphics
        this.sprite = new PIXI.Graphics();
        this.sprite.fill(0x808080);
        this.sprite.circle(0, 0, size);
        this.sprite.fill();
        
        // Add some crater details
        for (let i = 0; i < 3; i++) {
            const craterSize = size * 0.3;
            const angle = Math.random() * Math.PI * 2;
            const distance = size * 0.4;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            
            this.sprite.fill(0x606060);
            this.sprite.circle(x, y, craterSize);
            this.sprite.fill();
        }

        this.sprite.x = startX;
        this.sprite.y = startY;
        
        // Calculate velocity based on target position
        const angle = Math.atan2(targetY - startY, targetX - startX);
        this.speed = 2 + Math.random() * 5; // Random speed between 2 and 7
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
        
        // Add rotation
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
        
        // Store size for collision detection
        this.size = size;
        
        app.stage.addChild(this.sprite);
        this.dodged = false;
    }

    update() {
        // Skip update if asteroid is destroyed
        if (this.destroyed || !this.sprite) return false;

        // Update position
        this.sprite.x += this.vx;
        this.sprite.y += this.vy;
        this.sprite.rotation += this.rotationSpeed;
        
        // Check for collisions with screen edges
        const margin = this.size;
        const screenWidth = this.app.screen.width;
        const screenHeight = this.app.screen.height;

        // Bounce off edges
        if (this.sprite.x < margin) {
            this.sprite.x = margin;
            this.vx = Math.abs(this.vx);
        } else if (this.sprite.x > screenWidth - margin) {
            this.sprite.x = screenWidth - margin;
            this.vx = -Math.abs(this.vx);
        }

        if (this.sprite.y < margin) {
            this.sprite.y = margin;
            this.vy = Math.abs(this.vy);
        } else if (this.sprite.y > screenHeight - margin) {
            this.sprite.y = screenHeight - margin;
            this.vy = -Math.abs(this.vy);
        }

        // Add slight random variation to velocity after bounce
        if (this.sprite.x <= margin || this.sprite.x >= screenWidth - margin) {
            this.vy += (Math.random() - 0.5) * 0.5;
            this.rotationSpeed = (Math.random() - 0.5) * 0.1;
        }
        if (this.sprite.y <= margin || this.sprite.y >= screenHeight - margin) {
            this.vx += (Math.random() - 0.5) * 0.5;
            this.rotationSpeed = (Math.random() - 0.5) * 0.1;
        }

        // Normalize speed to prevent acceleration
        const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (currentSpeed > this.speed) {
            this.vx = (this.vx / currentSpeed) * this.speed;
            this.vy = (this.vy / currentSpeed) * this.speed;
        }

        return false;
    }

    destroy() {
        if (!this.destroyed && this.sprite) {
            this.app.stage.removeChild(this.sprite);
            this.sprite.destroy();
            this.sprite = null;
            this.destroyed = true;
        }
    }
} 