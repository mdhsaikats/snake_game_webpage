class ParticleSystem {
    constructor() {
        this.particles = [];
        this.container = document.getElementById('particles');
        this.createParticles();
        this.animate();
    }
    
    createParticles() {
        for (let i = 0; i < 50; i++) {
            this.createParticle();
        }
    }
    
    createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random starting position
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
        
        // Random color variation
        const colors = ['#00ff88', '#00ccff', '#ff4757', '#ffc107'];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        
        // Random size
        const size = Math.random() * 3 + 1;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        this.container.appendChild(particle);
        this.particles.push(particle);
    }
    
    animate() {
        // Continuously create new particles
        setInterval(() => {
            if (this.particles.length < 50) {
                this.createParticle();
            }
        }, 200);
        
        // Clean up old particles
        setInterval(() => {
            this.particles = this.particles.filter(particle => {
                if (particle.offsetTop < -10) {
                    particle.remove();
                    return false;
                }
                return true;
            });
        }, 1000);
    }
}

// Initialize particle system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ParticleSystem();
});