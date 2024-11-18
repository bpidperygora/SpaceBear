/**
 * Class representing the Game Over screen with restart functionality
 */
export class GameOverScreen {
    constructor(app, game) {
        this.app = app;
        this.game = game;
        this.container = new PIXI.Container();
        
        // Create semi-transparent background
        this.background = new PIXI.Graphics();
        this.background.fill({ color: 0x000000, alpha: 0.7 })
            // .rect(0, 0, app.screen.width, app.screen.height);
        
        // Create Game Over text
        this.gameOverText = new PIXI.Text({
            text: 'GAME OVER',
            style: {
                fontFamily: 'Arial',
                fontSize: 64,
                fill: 0xff0000,
                align: 'center'
            }
        });
        this.gameOverText.anchor.set(0.5);
        this.gameOverText.x = app.screen.width / 2;
        this.gameOverText.y = app.screen.height / 2 - 50;
        
        // Create Restart button
        this.restartButton = new PIXI.Container();
        
        const buttonBg = new PIXI.Graphics();
        buttonBg.fill({ color: 0x4CAF50 })
            .roundRect(0, 0, 200, 50, 10);
        
        const buttonText = new PIXI.Text({
            text: 'Restart Game',
            style: {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: 0xffffff
            }
        });
        buttonText.anchor.set(0.5);
        buttonText.x = 100;
        buttonText.y = 25;
        
        this.restartButton.addChild(buttonBg);
        this.restartButton.addChild(buttonText);
        this.restartButton.x = app.screen.width / 2 - 100;
        this.restartButton.y = app.screen.height / 2 + 50;
        
        // Make button interactive
        this.restartButton.eventMode = 'static';
        this.restartButton.cursor = 'pointer';
        this.restartButton.on('pointerdown', () => {
            console.log('=== RESTART BUTTON CLICKED ===');
            this.hide();
            // Clear console
            console.clear();
            // Call game's restart method directly
            if (this.game && this.game.restartGame) {
                console.log('Calling game.restartGame()');
                this.game.restartGame();
            } else {
                console.warn('Game reference not found!');
            }
        });
        
        // Add elements to container
        this.container.addChild(this.background);
        this.container.addChild(this.gameOverText);
        this.container.addChild(this.restartButton);
        
        // Hide initially
        this.container.visible = false;
        
        // Set higher z-index for overlay
        this.container.zIndex = 9999; // Ensure it's on top of everything
        
        // Set sortable children to true to respect zIndex
        app.stage.sortableChildren = true;
        app.stage.addChild(this.container);
    }
    
    show() {
        this.container.visible = true;
    }
    
    hide() {
        this.container.visible = false;
    }
    
    destroy() {
        this.container.destroy({ children: true });
    }
} 