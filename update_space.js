const js_content = `document.addEventListener('DOMContentLoaded', function () {
    console.log("Enhanced Space.js starting...");
    const canvas = document.createElement('canvas');
    canvas.id = 'space-canvas';
    const ctx = canvas.getContext('2d');
    document.body.appendChild(canvas);

    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '-1';
    canvas.style.pointerEvents = 'none';
    canvas.style.background = 'black';

    let width, height;
    let stars = [];
    let shootingStars = [];
    let constellations = [];
    let asteroids = [];
    const numStars = 300; // Increased for better visibility

    // Star color types based on stellar classification
    const starTypes = [
        { color: '#9bb0ff', temp: 'O/B', size: 1.8, brightness: 0.9 },  // Blue-white (hot)
        { color: '#cad7ff', temp: 'A', size: 1.5, brightness: 0.85 },   // White
        { color: '#fff4ea', temp: 'F/G', size: 1.3, brightness: 0.8 },  // Yellow-white (Sun-like)
        { color: '#ffd2a1', temp: 'K', size: 1.1, brightness: 0.7 },    // Orange
        { color: '#ffcc6f', temp: 'M', size: 0.9, brightness: 0.6 }     // Red
    ];

    // Constellation data (simplified positions)
    const constellationData = [
        {
            name: 'Orion',
            stars: [
                [0.3, 0.25], [0.35, 0.3], [0.3, 0.35], [0.25, 0.3], // Belt
                [0.3, 0.2], [0.3, 0.4], [0.35, 0.23], [0.25, 0.37]  // Surrounding
            ]
        },
        {
            name: 'Ursa Major',
            stars: [
                [0.7, 0.3], [0.73, 0.28], [0.76, 0.29], [0.78, 0.27],
                [0.74, 0.32], [0.72, 0.34], [0.7, 0.35]
            ]
        },
        {
            name: 'Cassiopeia',
            stars: [
                [0.5, 0.15], [0.53, 0.13], [0.56, 0.15], [0.59, 0.13], [0.62, 0.15]
            ]
        },
        {
            name: 'Cygnus',
            stars: [
                [0.2, 0.6], [0.25, 0.65], [0.3, 0.7], [0.25, 0.75], [0.2, 0.8], // Cross
                [0.15, 0.7], [0.35, 0.7] // Wings
            ]
        },
        {
            name: 'Lyra',
            stars: [
                [0.8, 0.6], [0.82, 0.62], [0.84, 0.6], [0.82, 0.58], [0.8, 0.55]
            ]
        },
        {
            name: 'Scorpius',
            stars: [
                [0.85, 0.75], [0.87, 0.78], [0.88, 0.82], [0.86, 0.86], [0.83, 0.88],
                [0.80, 0.87], [0.78, 0.84], [0.76, 0.80]
            ]
        },
        {
            name: 'Leo',
            stars: [
                [0.45, 0.45], [0.48, 0.42], [0.52, 0.43], [0.55, 0.46],
                [0.52, 0.50], [0.48, 0.52], [0.44, 0.50]
            ]
        },
        {
            name: 'Aquila',
            stars: [
                [0.60, 0.55], [0.63, 0.58], [0.66, 0.60], [0.63, 0.63], [0.60, 0.65],
                [0.57, 0.58]
            ]
        },
        {
            name: 'Gemini',
            stars: [
                [0.12, 0.25], [0.15, 0.28], [0.13, 0.32], [0.10, 0.35],
                [0.18, 0.28], [0.20, 0.32], [0.17, 0.36]
            ]
        },
        {
            name: 'Draco',
            stars: [
                [0.90, 0.20], [0.88, 0.24], [0.85, 0.22], [0.82, 0.25],
                [0.80, 0.28], [0.83, 0.32], [0.87, 0.35], [0.90, 0.38]
            ]
        },
        {
            name: 'Corona Borealis',
            stars: [
                [0.65, 0.25], [0.68, 0.23], [0.71, 0.22], [0.74, 0.23],
                [0.76, 0.25], [0.74, 0.27], [0.71, 0.28]
            ]
        }
    ];

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        initStars();
        initConstellations();
        console.log("Resized to", width, height);
    }

    function initStars() {
        stars = [];
        for (let i = 0; i < numStars; i++) {
            const type = starTypes[Math.floor(Math.random() * starTypes.length)];
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                baseSize: (Math.random() * 0.8 + 0.4) * type.size,
                type: type,
                twinkleOffset: Math.random() * Math.PI * 2,
                twinkleSpeed: 0.001 + Math.random() * 0.002,
                vx: (Math.random() - 0.5) * 0.05, // Extremely slow base movement
                vy: (Math.random() - 0.5) * 0.05
            });
        }
    }

    function initConstellations() {
        constellations = constellationData.map(c => ({
            name: c.name,
            stars: c.stars.map(([rx, ry]) => ({
                x: rx * width,
                y: ry * height,
                size: 2,
                brightness: 1
            }))
        }));
    }

    function createShootingStar() {
        const startX = Math.random() * width;
        const startY = Math.random() * height * 0.3; // Upper portion
        const angle = Math.PI / 4 + (Math.random() - 0.5) * Math.PI / 6; // Varied angles
        const speed = 5 + Math.random() * 5; // Faster speed for longer distance

        shootingStars.push({
            x: startX,
            y: startY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            trail: [],
            maxTrail: 60, // Longer tail
            life: 1,
            decay: 0.004 // Slower fade (longer life)
        });
    }

    function createAsteroid() {
        const side = Math.floor(Math.random() * 4);
        let startX, startY, angle;

        if (side === 0) { // Top
            startX = Math.random() * width;
            startY = -50;
            angle = Math.random() * Math.PI; // Downwards
        } else if (side === 1) { // Right
            startX = width + 50;
            startY = Math.random() * height;
            angle = Math.PI / 2 + Math.random() * Math.PI; // Leftwards
        } else if (side === 2) { // Bottom
            startX = Math.random() * width;
            startY = height + 50;
            angle = Math.PI + Math.random() * Math.PI; // Upwards
        } else { // Left
            startX = -50;
            startY = Math.random() * height;
            angle = -Math.PI / 2 + Math.random() * Math.PI; // Rightwards
        }

        const speed = 1 + Math.random() * 3;
        const radius = 5 + Math.random() * 15;
        const vertices = 5 + Math.floor(Math.random() * 5);
        const offsets = [];
        for (let i = 0; i < vertices; i++) {
            offsets.push(Math.random() * 0.4 + 0.8);
        }

        asteroids.push({
            x: startX,
            y: startY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: radius,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.05,
            vertices: vertices,
            offsets: offsets,
            glowParams: {
                phase: Math.random() * Math.PI * 2,
                speed: 0.02 + Math.random() * 0.03
            }
        });
    }

    let lastSpawnTime = 0;
    let lastAsteroidSpawnTime = 0;
    const spawnInterval = 15000; // 15 seconds
    const asteroidSpawnInterval = 8000; // 8 seconds
    let isHovering = true; // Default to true

    document.addEventListener('mouseenter', () => isHovering = true);
    document.addEventListener('mouseleave', () => isHovering = false);

    function drawNebula() {
        const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width);
        gradient.addColorStop(0, 'rgba(0, 40, 80, 0.15)'); // Deep blue nebula
        gradient.addColorStop(0.5, 'rgba(10, 20, 50, 0.08)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }

    function drawConstellations() {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'; // Very subtle
        ctx.lineWidth = 1;
        constellations.forEach(c => {
            ctx.beginPath();
            if (c.stars.length > 0) {
                ctx.moveTo(c.stars[0].x, c.stars[0].y);
                for (let i = 1; i < c.stars.length; i++) {
                    ctx.lineTo(c.stars[i].x, c.stars[i].y);
                }
            }
            ctx.stroke();

            // Draw constellation stars
            c.stars.forEach(s => {
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
                ctx.fillStyle = \`rgba(0, 240, 255, \${Math.random() * 0.3 + 0.2})\`; // Dimmer neon blue
                ctx.fill();
            });
        });
    }

    let lastFrameTime = 0;

    function animate(timestamp) {
        if (!lastSpawnTime) lastSpawnTime = timestamp;
        if (!lastAsteroidSpawnTime) lastAsteroidSpawnTime = timestamp;
        if (!lastFrameTime) lastFrameTime = timestamp;

        // Calculate delta time (in seconds)
        const deltaTime = (timestamp - lastFrameTime) / 1000;
        lastFrameTime = timestamp;

        const speedFactor = deltaTime * 60;

        // Spawn shooting stars
        if (timestamp - lastSpawnTime > spawnInterval) {
            if (deltaTime < 1.0 && !document.hidden && isHovering && shootingStars.length < 2 && Math.random() < 0.2) {
                createShootingStar();
            }
            lastSpawnTime = timestamp;
        }

        // Spawn asteroids
        if (timestamp - lastAsteroidSpawnTime > asteroidSpawnInterval) {
            if (deltaTime < 1.0 && !document.hidden && isHovering && asteroids.length < 5 && Math.random() < 0.5) {
                createAsteroid();
            }
            lastAsteroidSpawnTime = timestamp;
        }

        // Clear canvas completely to remove trails
        ctx.clearRect(0, 0, width, height);

        // Draw nebula
        drawNebula();

        // Draw and update regular stars
        stars.forEach(star => {
            star.x += star.vx * speedFactor;
            star.y += star.vy * speedFactor;

            if (Math.random() < 0.001) {
                star.vx = (Math.random() - 0.5) * 0.05;
                star.vy = (Math.random() - 0.5) * 0.05;
            }

            if (star.x < 0) star.x = width;
            if (star.x > width) star.x = 0;
            if (star.y < 0) star.y = height;
            if (star.y > height) star.y = 0;

            const twinkle = Math.sin(Date.now() * star.twinkleSpeed + star.twinkleOffset) * 0.3 + 0.7;
            const alpha = star.type.brightness * twinkle;

            ctx.beginPath();
            ctx.arc(star.x, star.y, star.baseSize, 0, Math.PI * 2);
            ctx.fillStyle = star.type.color.replace(')', \`, \${alpha})\`).replace('rgb', 'rgba');
            ctx.shadowBlur = star.baseSize * 3;
            ctx.shadowColor = star.type.color;
            ctx.fill();
            ctx.shadowBlur = 0;
        });

        // Draw constellations
        drawConstellations();

        // Draw and update shooting stars
        shootingStars.forEach((ss, index) => {
            ss.x += ss.vx * speedFactor;
            ss.y += ss.vy * speedFactor;
            ss.life -= ss.decay * speedFactor;

            ss.trail.push({ x: ss.x, y: ss.y });
            if (ss.trail.length > ss.maxTrail) ss.trail.shift();

            if (ss.trail.length > 1) {
                ctx.beginPath();
                ctx.moveTo(ss.trail[0].x, ss.trail[0].y);
                for (let i = 1; i < ss.trail.length; i++) {
                    ctx.lineTo(ss.trail[i].x, ss.trail[i].y);
                }

                const gradient = ctx.createLinearGradient(
                    ss.trail[0].x, ss.trail[0].y,
                    ss.x, ss.y
                );
                gradient.addColorStop(0, 'rgba(0, 240, 255, 0)');
                gradient.addColorStop(1, \`rgba(0, 240, 255, \${ss.life})\`);

                ctx.strokeStyle = gradient;
                ctx.lineWidth = 4;
                ctx.lineCap = 'round';
                ctx.stroke();
            }

            ctx.beginPath();
            ctx.arc(ss.x, ss.y, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = \`rgba(0, 240, 255, \${ss.life})\`;
            ctx.shadowBlur = 20;
            ctx.shadowColor = \`rgba(0, 240, 255, \${ss.life})\`;
            ctx.fill();
            ctx.shadowBlur = 0;

            if (ss.life <= 0 || ss.x < 0 || ss.x > width || ss.y > height) {
                shootingStars.splice(index, 1);
            }
        });

        // Draw and update asteroids
        asteroids.forEach((ast, index) => {
            ast.x += ast.vx * speedFactor;
            ast.y += ast.vy * speedFactor;
            ast.rotation += ast.rotationSpeed * speedFactor;
            ast.glowParams.phase += ast.glowParams.speed * speedFactor;

            // Off-screen check (with buffer)
            if (ast.x < -100 || ast.x > width + 100 || ast.y < -100 || ast.y > height + 100) {
                asteroids.splice(index, 1);
                return;
            }

            ctx.save();
            ctx.translate(ast.x, ast.y);
            ctx.rotate(ast.rotation);

            ctx.beginPath();
            for (let i = 0; i < ast.vertices; i++) {
                const angle = (Math.PI * 2 * i) / ast.vertices;
                const r = ast.radius * ast.offsets[i];
                const px = Math.cos(angle) * r;
                const py = Math.sin(angle) * r;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();

            // Cosmic strike asteroid coloring
            const glowAlpha = Math.sin(ast.glowParams.phase) * 0.2 + 0.3;
            ctx.fillStyle = 'rgba(20, 20, 30, 0.9)'; // Dark rocky body
            ctx.strokeStyle = \`rgba(0, 240, 255, \${glowAlpha})\`; // Neon blue glow edges
            ctx.lineWidth = 2;
            
            ctx.shadowBlur = 15;
            ctx.shadowColor = \`rgba(0, 240, 255, \${glowAlpha})\`;
            
            ctx.fill();
            ctx.stroke();
            
            // Add some crater/inner details
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.arc(ast.radius * 0.3, ast.radius * 0.2, ast.radius * 0.15, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(10, 10, 15, 0.8)';
            ctx.fill();

            ctx.restore();
        });

        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    resize();
    requestAnimationFrame(animate);

    // Create initial shooting star and asteroid
    setTimeout(createShootingStar, 2000);
    setTimeout(createAsteroid, 3000);

    console.log("Animation started with", numStars, "stars and cosmic strike asteroids");
});
`;

const fs = require('fs');
fs.writeFileSync('c:\\\\Dev\\\\ExploitX\\\\CTFd-Whale-Deployment\\\\CTFd\\\\themes\\\\into-the-void\\\\assets\\\\js\\\\space_v5.js', js_content, 'utf8');
