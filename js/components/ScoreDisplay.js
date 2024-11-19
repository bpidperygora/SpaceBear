/**
 * Class managing the score display
 * @class ScoreDisplay
 */
export class ScoreDisplay {
    constructor() {
        this.score = 0;
        this.createScoreUI();
    }

    createScoreUI() {
        const scoreContainer = document.createElement('div');
        scoreContainer.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            font-family: Arial, sans-serif;
            font-size: 28px;
            color: #fff;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 10px;
            background: rgba(0, 0, 0, 0.5);
            padding: 8px 15px;
            border-radius: 15px;
            border: 2px solid rgba(255, 255, 255, 0.3);
        `;

        // Create asteroid icon
        const asteroidIcon = document.createElement('div');
        asteroidIcon.style.cssText = `
            width: 28px;
            height: 28px;
            background: linear-gradient(135deg, #808080, #606060);
            border-radius: 50%;
            box-shadow: 
                inset -2px -2px 4px rgba(0,0,0,0.5),
                2px 2px 4px rgba(0,0,0,0.3);
            position: relative;
            overflow: hidden;
        `;

        // Add crater details to asteroid icon
        const crater1 = document.createElement('div');
        crater1.style.cssText = `
            position: absolute;
            width: 8px;
            height: 8px;
            background: rgba(0,0,0,0.3);
            border-radius: 50%;
            top: 25%;
            left: 25%;
        `;
        asteroidIcon.appendChild(crater1);

        // Create score text with label
        const scoreLabel = document.createElement('span');
        scoreLabel.textContent = 'Score: ';
        scoreLabel.style.cssText = `
            color: #aaa;
            font-size: 24px;
        `;

        this.scoreText = document.createElement('span');
        this.scoreText.textContent = '0';
        this.scoreText.style.cssText = `
            font-weight: bold;
            font-size: 28px;
            color: #fff;
            min-width: 30px;
        `;

        scoreContainer.appendChild(asteroidIcon);
        scoreContainer.appendChild(scoreLabel);
        scoreContainer.appendChild(this.scoreText);
        document.body.appendChild(scoreContainer);
        
        this.container = scoreContainer;
    }

    updateScore(newScore) {
        this.score = newScore;
        this.scoreText.textContent = newScore.toString();
        
        // Add animation effect on score change
        this.scoreText.style.transform = 'scale(1.2)';
        this.scoreText.style.transition = 'transform 0.1s ease-out';
        
        setTimeout(() => {
            this.scoreText.style.transform = 'scale(1)';
        }, 100);
    }

    destroy() {
        if (this.container) {
            this.container.remove();
        }
    }
} 