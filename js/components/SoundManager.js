/**
 * Class for managing game sound effects
 * @class SoundManager
 */
export class SoundManager {
    constructor() {
        this.enabled = true;
        this.sounds = {};
        this.loaded = false;
        
        // Initialize sounds
        this.loadSounds();
        
        // Listen for sound toggle events
        window.addEventListener('sound-toggle', (e) => {
            this.enabled = e.detail;
        });
    }

    async loadSounds() {
        try {
            // Use a shorter, more reliable sound
            const soundUrl = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU' + 
                           'tvT19AAAAAAA==';
            
            this.sounds.bounce = new Audio(soundUrl);
            this.sounds.bounce.volume = 0.3;
            
            // Preload the sound
            await this.sounds.bounce.load();
            this.loaded = true;
        } catch (error) {
            console.warn('Failed to load sound effects:', error);
            this.sounds.bounce = new Audio();
            this.sounds.bounce.volume = 0;
        }
    }

    play(soundName) {
        if (!this.enabled || !this.loaded) return;
        
        const sound = this.sounds[soundName];
        if (sound) {
            try {
                // Clone the audio for overlapping sounds
                const clone = sound.cloneNode();
                clone.play()
                    .catch(error => console.warn('Failed to play sound:', error));
                    
                // Clean up clone after playing
                clone.onended = () => clone.remove();
            } catch (error) {
                console.warn('Error playing sound:', error);
            }
        }
    }
} 