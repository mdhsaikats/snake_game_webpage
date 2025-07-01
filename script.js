// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new SnakeGame();
    
    // Prevent default behavior for arrow keys and space
    document.addEventListener('keydown', (e) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
            e.preventDefault();
        }
    });
    
    // Prevent context menu on long press for mobile
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
    
    // Prevent default touch behaviors
    document.addEventListener('touchstart', (e) => {
        // Allow scrolling on menu and game over screens
        const allowScrollElements = ['.menu', '.game-over-screen', '.pause-screen'];
        const isScrollableArea = allowScrollElements.some(selector => 
            e.target.closest(selector)
        );
        
        if (!isScrollableArea) {
            e.preventDefault();
        }
    }, { passive: false });
    
    document.addEventListener('touchmove', (e) => {
        // Prevent scrolling during gameplay
        const gameArea = document.getElementById('gameArea');
        if (gameArea.style.display !== 'none') {
            e.preventDefault();
        }
    }, { passive: false });
    
    // Add visibility change handler to pause game when tab is not active
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && !game.isPaused && !game.isGameOver) {
            game.togglePause();
        }
    });
    
    // Handle orientation changes
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            game.setupCanvas();
            // Reset snake position to prevent out-of-bounds issues
            if (!game.isGameOver) {
                game.snake = [{ x: 10 * game.box, y: 10 * game.box }];
                game.food = game.generateFood();
            }
        }, 100);
    });
    
    // Handle resize for responsive canvas
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            game.setupCanvas();
            // Regenerate food to ensure it's within bounds
            if (!game.isGameOver) {
                game.food = game.generateFood();
            }
        }, 250);
    });
    
    // Prevent zoom on double tap
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
    
    // Add focus management for better mobile experience
    const focusableElements = document.querySelectorAll('button, [tabindex]');
    focusableElements.forEach(element => {
        element.addEventListener('focus', () => {
            element.style.outline = '2px solid #00ff88';
        });
        
        element.addEventListener('blur', () => {
            element.style.outline = 'none';
        });
    });
    
    // Performance optimization: reduce particle count on low-end devices
    const isLowEndDevice = () => {
        return navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
    };
    
    if (isLowEndDevice()) {
        // Reduce visual effects for better performance
        const style = document.createElement('style');
        style.textContent = `
            .particle { display: none; }
            #gameCanvas { box-shadow: none; }
            .menu { animation: none; }
            .game-over-screen { animation: none; }
        `;
        document.head.appendChild(style);
    }
    
    // Add haptic feedback support detection
    if ('vibrate' in navigator) {
        console.log('Haptic feedback supported');
    }
    
    // Service Worker registration for offline support (optional)
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            // Uncomment to enable offline support
            // navigator.serviceWorker.register('/sw.js')
            //     .then(registration => console.log('SW registered'))
            //     .catch(error => console.log('SW registration failed'));
        });
    }
});