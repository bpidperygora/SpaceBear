/**
 * Class managing boost mechanics and fuel system
 * @class BoostSystem
 */
export class BoostSystem {
    // Class constants and configuration
    static BOOST_CONFIG = {
        NORMAL_SPEED: 5,
        BOOST_SPEED: 10,
        SUPER_BOOST_SPEED: 20,
        MAX_FUEL: 100,
        MIN_FUEL_FOR_SUPER: 30,
        DOUBLE_TAP_THRESHOLD: 300,
        SUPER_BOOST_DURATION: 5000,
        
        // Fuel consumption rates (per tick)
        REGULAR_BOOST_CONSUMPTION: 0.5,
        SUPER_BOOST_CONSUMPTION: 2,
        
        // Recharge rates (per tick)
        REGULAR_RECHARGE_RATE: 0.2,
        SUPER_RECHARGE_RATE: 0.1,
        
        // Update interval in milliseconds
        TICK_RATE: 100,
        
        // Fuel bar thresholds
        LOW_FUEL_THRESHOLD: 30
    };

    // UI Colors
    static COLORS = {
        FULL: 'linear-gradient(90deg, #4CAF50, #8BC34A)',    // Green
        MEDIUM: 'linear-gradient(90deg, #2196F3, #03A9F4)',  // Blue
        LOW: 'linear-gradient(90deg, #f44336, #ff9800)'      // Red-Orange
    };

    constructor() {
        // Initialize properties
        this.fuelLevel = BoostSystem.BOOST_CONFIG.MAX_FUEL;
        this.lastSpacePress = 0;
        this.superBoostActive = false;
        this.spacePressed = false;
        this.boostAvailable = true;
        this.maxFuel = BoostSystem.BOOST_CONFIG.MAX_FUEL;
        this.normalSpeed = BoostSystem.BOOST_CONFIG.NORMAL_SPEED;
        this.boostSpeed = BoostSystem.BOOST_CONFIG.BOOST_SPEED;
        this.superBoostSpeed = BoostSystem.BOOST_CONFIG.SUPER_BOOST_SPEED;

        // Bind event handlers
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);

        // Create UI and initialize controls
        this.createBoostUI();
        this.initializeControls();
    }

    initializeControls() {
        // Remove any existing listeners
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        
        // Add new listeners with bound handlers
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
    }

    handleKeyDown(e) {
        if (e.code === 'Space' && !e.repeat) {
            this.spacePressed = true;
            const currentTime = Date.now();
            const timeDiff = currentTime - this.lastSpacePress;
            
            if (timeDiff < BoostSystem.BOOST_CONFIG.DOUBLE_TAP_THRESHOLD) {
                this.activateSuperBoost();
            } else if (this.fuelLevel > BoostSystem.BOOST_CONFIG.LOW_FUEL_THRESHOLD) {
                this.toggleBoost(true);
            }
            
            this.lastSpacePress = currentTime;
        }
    }

    handleKeyUp(e) {
        if (e.code === 'Space') {
            this.spacePressed = false;
            if (this.superBoostActive) {
                this.endSuperBoost();
            } else {
                this.toggleBoost(false);
            }
        }
    }

    destroy() {
        // Remove event listeners
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        
        // Remove UI elements
        if (this.fuelIndicator?.parentElement) {
            this.fuelIndicator.parentElement.remove();
        }
        
        // Clear any timers
        if (this.superBoostTimer) {
            clearTimeout(this.superBoostTimer);
        }
        if (this.fuelRecoveryInterval) {
            clearInterval(this.fuelRecoveryInterval);
        }
        if (this.rechargeInterval) {
            clearInterval(this.rechargeInterval);
        }
    }

    createBoostUI() {
        const boostBar = document.createElement('div');
        boostBar.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            width: 200px;
            height: 20px;
            background: #333;
            border: 2px solid #666;
            border-radius: 10px;
            overflow: hidden;
            z-index: 1000;
        `;

        this.fuelIndicator = document.createElement('div');
        this.fuelIndicator.style.cssText = `
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, #4CAF50, #8BC34A);
            transition: width 0.3s;
        `;

        boostBar.appendChild(this.fuelIndicator);
        document.body.appendChild(boostBar);
    }

    activateSuperBoost() {
        const config = BoostSystem.BOOST_CONFIG;
        
        if (this.fuelLevel >= config.MIN_FUEL_FOR_SUPER && this.boostAvailable) {
            clearInterval(this.fuelConsumption);
            this.superBoostActive = true;
            this.boostAvailable = false;
            
            window.dispatchEvent(new CustomEvent('speed-change', { detail: this.superBoostSpeed }));
            window.dispatchEvent(new CustomEvent('trail-toggle', { 
                detail: { enabled: true, color: 0xFF6800 } // Red color for super boost
            }));

            this.superBoostStartFuel = this.fuelLevel;

            this.fuelConsumption = setInterval(() => {
                this.fuelLevel = Math.max(0, this.fuelLevel - config.SUPER_BOOST_CONSUMPTION);
                this.updateFuelBar();
                
                if (this.fuelLevel <= 0) {
                    this.endSuperBoost();
                }
            }, config.TICK_RATE);

            this.superBoostTimeout = setTimeout(() => {
                this.endSuperBoost();
            }, config.SUPER_BOOST_DURATION);
        }
    }

    toggleBoost(active) {
        const config = BoostSystem.BOOST_CONFIG;
        
        if (!this.spacePressed || this.superBoostActive || 
            (this.fuelLevel < config.LOW_FUEL_THRESHOLD)) {
            this.endBoost();
            return;
        }
        
        if (active && this.fuelLevel > config.LOW_FUEL_THRESHOLD) {
            clearInterval(this.fuelConsumption);
            this.isBoostActive = true;
            window.dispatchEvent(new CustomEvent('speed-change', { detail: this.boostSpeed }));
            window.dispatchEvent(new CustomEvent('trail-toggle', { 
                detail: { enabled: true, color: 0xFFFF00 }
            }));
            
            this.fuelConsumption = setInterval(() => {
                this.fuelLevel = Math.max(0, this.fuelLevel - config.REGULAR_BOOST_CONSUMPTION);
                this.updateFuelBar();
                
                if (this.fuelLevel <= config.LOW_FUEL_THRESHOLD || !this.spacePressed) {
                    this.endBoost();
                }
            }, config.TICK_RATE);
        } else {
            this.endBoost();
        }
    }

    endBoost() {
        clearInterval(this.fuelConsumption);
        this.superBoostActive = false;
        this.isBoostActive = false;
        
        window.dispatchEvent(new CustomEvent('speed-change', { detail: this.normalSpeed }));
        window.dispatchEvent(new CustomEvent('trail-toggle', { 
            detail: { enabled: false }
        }));
        
        this.startRegularBoostRecharge();
        this.updateFuelBar();
    }

    updateFuelBar() {
        const percentage = (this.fuelLevel / this.maxFuel) * 100;
        this.fuelIndicator.style.width = `${percentage}%`;
        
        if (percentage === 100) {
            this.boostAvailable = true;
            this.fuelIndicator.style.background = BoostSystem.COLORS.FULL;
        } else if (percentage < BoostSystem.BOOST_CONFIG.LOW_FUEL_THRESHOLD) {
            this.fuelIndicator.style.background = BoostSystem.COLORS.LOW;
            this.boostAvailable = !this.superBoostActive;
        } else {
            this.fuelIndicator.style.background = BoostSystem.COLORS.MEDIUM;
            this.boostAvailable = true;
        }
    }


    endSuperBoost() {
        clearTimeout(this.superBoostTimeout);
        clearInterval(this.fuelConsumption);
        this.superBoostActive = false;
        this.isBoostActive = false;
        
        window.dispatchEvent(new CustomEvent('speed-change', { detail: this.normalSpeed }));
        window.dispatchEvent(new CustomEvent('trail-toggle', { 
            detail: { enabled: false }
        }));
        
        this.startSuperBoostRecharge();
    }

    startRegularBoostRecharge() {
        // Clear any existing recharge intervals
        if (this.rechargeInterval) {
            clearInterval(this.rechargeInterval);
        }

        const config = BoostSystem.BOOST_CONFIG;
        this.rechargeInterval = setInterval(() => {
            if (!this.isBoostActive && !this.superBoostActive && this.fuelLevel < this.maxFuel) {
                this.fuelLevel = Math.min(this.maxFuel, this.fuelLevel + config.REGULAR_RECHARGE_RATE);
                this.updateFuelBar();
                
                if (this.fuelLevel >= this.maxFuel) {
                    clearInterval(this.rechargeInterval);
                    this.boostAvailable = true;
                }
            }
        }, config.TICK_RATE);
    }

    startSuperBoostRecharge() {
        // Clear any existing recharge intervals
        if (this.rechargeInterval) {
            clearInterval(this.rechargeInterval);
        }

        const config = BoostSystem.BOOST_CONFIG;
        this.rechargeInterval = setInterval(() => {
            if (!this.isBoostActive && !this.superBoostActive && this.fuelLevel < this.maxFuel) {
                this.fuelLevel = Math.min(this.maxFuel, this.fuelLevel + config.SUPER_RECHARGE_RATE);
                this.updateFuelBar();
                
                if (this.fuelLevel >= this.maxFuel) {
                    clearInterval(this.rechargeInterval);
                    this.boostAvailable = true;
                }
            }
        }, config.TICK_RATE);
    }
} 