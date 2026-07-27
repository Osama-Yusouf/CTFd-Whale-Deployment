document.addEventListener('DOMContentLoaded', function () {
    console.log("Void/Black Hole Space.js starting...");
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
    canvas.style.background = '#020005'; // Deep void pitch black

    let width, height;
    let stars = [];
    let shootingStars = [];
    let constellations = [];
    let asteroids = [];
    const numStars = 400; // More stars for gravity effect

    let mouseX = -1000;
    let mouseY = -1000;
    let mouseActive = false;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        mouseActive = true;
    });
    document.addEventListener('mouseleave', () => mouseActive = false);
    document.addEventListener('mouseenter', () => mouseActive = true);

    // Star color types based on void/multiverse theme
    const starTypes = [
        { color: '#ff00ff', temp: 'O/B', size: 1.8, brightness: 0.9 },  // Magenta
        { color: '#8a2be2', temp: 'A', size: 1.5, brightness: 0.85 },   // Blue Violet
        { color: '#d866ff', temp: 'F/G', size: 1.3, brightness: 0.8 },  // Light Purple
        { color: '#ffffff', temp: 'K', size: 1.1, brightness: 0.7 },    // White
        { color: '#6a0dad', temp: 'M', size: 0.9, brightness: 0.6 }     // Deep Purple
    ];

    // Constellation data
    const constellationData = [
        { name: 'Orion', stars: [[0.3, 0.25], [0.35, 0.3], [0.3, 0.35], [0.25, 0.3], [0.3, 0.2], [0.3, 0.4], [0.35, 0.23], [0.25, 0.37]] },
        { name: 'Ursa Major', stars: [[0.7, 0.3], [0.73, 0.28], [0.76, 0.29], [0.78, 0.27], [0.74, 0.32], [0.72, 0.34], [0.7, 0.35]] },
        { name: 'Cassiopeia', stars: [[0.5, 0.15], [0.53, 0.13], [0.56, 0.15], [0.59, 0.13], [0.62, 0.15]] },
        { name: 'Cygnus', stars: [[0.2, 0.6], [0.25, 0.65], [0.3, 0.7], [0.25, 0.75], [0.2, 0.8], [0.15, 0.7], [0.35, 0.7]] },
        { name: 'Lyra', stars: [[0.8, 0.6], [0.82, 0.62], [0.84, 0.6], [0.82, 0.58], [0.8, 0.55]] }
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
                vx: 0,
                vy: 0,
                baseVx: (Math.random() - 0.5) * 0.05,
                baseVy: (Math.random() - 0.5) * 0.05
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
        const startY = Math.random() * height * 0.3;
        const angle = Math.PI / 4 + (Math.random() - 0.5) * Math.PI / 6;
        const speed = 5 + Math.random() * 5;

        shootingStars.push({
            x: startX,
            y: startY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            trail: [],
            maxTrail: 60,
            life: 1,
            decay: 0.004
        });
    }

    function createAsteroid() {
        const side = Math.floor(Math.random() * 4);
        let startX, startY, angle;

        if (side === 0) {
            startX = Math.random() * width; startY = -50; angle = Math.random() * Math.PI;
        } else if (side === 1) {
            startX = width + 50; startY = Math.random() * height; angle = Math.PI / 2 + Math.random() * Math.PI;
        } else if (side === 2) {
            startX = Math.random() * width; startY = height + 50; angle = Math.PI + Math.random() * Math.PI;
        } else {
            startX = -50; startY = Math.random() * height; angle = -Math.PI / 2 + Math.random() * Math.PI;
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
            glowParams: { phase: Math.random() * Math.PI * 2, speed: 0.02 + Math.random() * 0.03 }
        });
    }

    let lastSpawnTime = 0;
    let lastAsteroidSpawnTime = 0;
    const spawnInterval = 15000;
    const asteroidSpawnInterval = 8000;

    function drawNebula() {
        const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width);
        gradient.addColorStop(0, 'rgba(40, 0, 70, 0.2)'); // Dark magenta core
        gradient.addColorStop(0.5, 'rgba(20, 0, 40, 0.1)'); // Deep purple edge
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }

    function drawConstellations() {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
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

            c.stars.forEach(s => {
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 0, 255, ${Math.random() * 0.3 + 0.2})`;
                ctx.fill();
            });
        });
    }

    let lastFrameTime = 0;

    function animate(timestamp) {
        if (!lastSpawnTime) lastSpawnTime = timestamp;
        if (!lastAsteroidSpawnTime) lastAsteroidSpawnTime = timestamp;
        if (!lastFrameTime) lastFrameTime = timestamp;

        const deltaTime = (timestamp - lastFrameTime) / 1000;
        lastFrameTime = timestamp;
        const speedFactor = deltaTime * 60;

        if (timestamp - lastSpawnTime > spawnInterval) {
            if (deltaTime < 1.0 && !document.hidden && mouseActive && shootingStars.length < 2 && Math.random() < 0.2) {
                createShootingStar();
            }
            lastSpawnTime = timestamp;
        }

        if (timestamp - lastAsteroidSpawnTime > asteroidSpawnInterval) {
            if (deltaTime < 1.0 && !document.hidden && mouseActive && asteroids.length < 5 && Math.random() < 0.5) {
                createAsteroid();
            }
            lastAsteroidSpawnTime = timestamp;
        }

        ctx.clearRect(0, 0, width, height);
        drawNebula();

        const gravityRadius = 300;
        const gravityStrength = 1.2;

        stars.forEach(star => {
            if (mouseActive) {
                const dx = mouseX - star.x;
                const dy = mouseY - star.y;
                const distSq = dx * dx + dy * dy;
                
                if (distSq < gravityRadius * gravityRadius && distSq > 100) {
                    const dist = Math.sqrt(distSq);
                    const force = gravityStrength * (1 - dist / gravityRadius);
                    
                    // Add orbital vector (tangent to radius)
                    const orbitalForce = force * 2.0;
                    const tangentX = -dy / dist;
                    const tangentY = dx / dist;
                    
                    star.vx += ((dx / dist) * force + tangentX * orbitalForce) * deltaTime * 10;
                    star.vy += ((dy / dist) * force + tangentY * orbitalForce) * deltaTime * 10;
                    
                    // Limit max speed to prevent them flying off instantly
                    const speed = Math.sqrt(star.vx * star.vx + star.vy * star.vy);
                    if (speed > 8) {
                        star.vx = (star.vx / speed) * 8;
                        star.vy = (star.vy / speed) * 8;
                    }
                } else {
                    // Gradual slow down to base movement
                    star.vx += (star.baseVx - star.vx) * 0.05;
                    star.vy += (star.baseVy - star.vy) * 0.05;
                }
                
                // If star goes right into the center of the black hole, respawn it randomly
                if (distSq <= 100) {
                    star.x = Math.random() * width;
                    star.y = Math.random() * height;
                    star.vx = star.baseVx;
                    star.vy = star.baseVy;
                }
            } else {
                star.vx += (star.baseVx - star.vx) * 0.05;
                star.vy += (star.baseVy - star.vy) * 0.05;
            }

            star.x += star.vx * speedFactor;
            star.y += star.vy * speedFactor;

            if (Math.random() < 0.001) {
                star.baseVx = (Math.random() - 0.5) * 0.05;
                star.baseVy = (Math.random() - 0.5) * 0.05;
            }

            if (star.x < 0) star.x = width;
            if (star.x > width) star.x = 0;
            if (star.y < 0) star.y = height;
            if (star.y > height) star.y = 0;

            const twinkle = Math.sin(Date.now() * star.twinkleSpeed + star.twinkleOffset) * 0.3 + 0.7;
            const alpha = star.type.brightness * twinkle;

            ctx.beginPath();
            ctx.arc(star.x, star.y, star.baseSize, 0, Math.PI * 2);
            ctx.fillStyle = star.type.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
            ctx.shadowBlur = star.baseSize * 4;
            ctx.shadowColor = star.type.color;
            ctx.fill();
            ctx.shadowBlur = 0;
        });

        drawConstellations();

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

                const gradient = ctx.createLinearGradient(ss.trail[0].x, ss.trail[0].y, ss.x, ss.y);
                gradient.addColorStop(0, 'rgba(255, 0, 255, 0)');
                gradient.addColorStop(1, `rgba(255, 0, 255, ${ss.life})`);

                ctx.strokeStyle = gradient;
                ctx.lineWidth = 4;
                ctx.lineCap = 'round';
                ctx.stroke();
            }

            ctx.beginPath();
            ctx.arc(ss.x, ss.y, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 0, 255, ${ss.life})`;
            ctx.shadowBlur = 20;
            ctx.shadowColor = `rgba(255, 0, 255, ${ss.life})`;
            ctx.fill();
            ctx.shadowBlur = 0;

            if (ss.life <= 0 || ss.x < 0 || ss.x > width || ss.y > height) {
                shootingStars.splice(index, 1);
            }
        });

        asteroids.forEach((ast, index) => {
            // Apply gravity to asteroids too
            if (mouseActive) {
                const dx = mouseX - ast.x;
                const dy = mouseY - ast.y;
                const distSq = dx * dx + dy * dy;
                if (distSq < gravityRadius * gravityRadius && distSq > 100) {
                    const dist = Math.sqrt(distSq);
                    const force = 0.5 * (1 - dist / gravityRadius);
                    ast.vx += (dx / dist) * force * deltaTime * 10;
                    ast.vy += (dy / dist) * force * deltaTime * 10;
                }
                
                if (distSq <= 400) { // Absorbed by black hole!
                    asteroids.splice(index, 1);
                    return;
                }
            }

            ast.x += ast.vx * speedFactor;
            ast.y += ast.vy * speedFactor;
            ast.rotation += ast.rotationSpeed * speedFactor;
            ast.glowParams.phase += ast.glowParams.speed * speedFactor;

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

            const glowAlpha = Math.sin(ast.glowParams.phase) * 0.2 + 0.3;
            ctx.fillStyle = 'rgba(10, 0, 20, 0.9)'; // Dark void rock
            ctx.strokeStyle = `rgba(138, 43, 226, ${glowAlpha})`; // Violet glow
            ctx.lineWidth = 2;
            ctx.shadowBlur = 15;
            ctx.shadowColor = `rgba(255, 0, 255, ${glowAlpha})`;
            ctx.fill();
            ctx.stroke();
            
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.arc(ast.radius * 0.3, ast.radius * 0.2, ast.radius * 0.15, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(5, 0, 10, 0.8)';
            ctx.fill();

            ctx.restore();
        });

        // Draw Black Hole Event Horizon + Accretion Disk at mouse
        if (mouseActive) {
            ctx.save();
            ctx.translate(mouseX, mouseY);
            
            // Outer accretion disk (rotating)
            const time = timestamp * 0.002;
            ctx.rotate(time);
            
            const diskGradient = ctx.createRadialGradient(0, 0, 15, 0, 0, 80);
            diskGradient.addColorStop(0, 'rgba(255, 0, 255, 0.7)'); // Hot magenta
            diskGradient.addColorStop(0.3, 'rgba(138, 43, 226, 0.5)'); // Violet
            diskGradient.addColorStop(0.7, 'rgba(40, 0, 80, 0.2)'); // Dark edge
            diskGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.beginPath();
            ctx.ellipse(0, 0, 80, 60, 0, 0, Math.PI * 2); // Oval to give 3D tilt illusion
            ctx.fillStyle = diskGradient;
            ctx.fill();

            ctx.rotate(-time); // Un-rotate for the event horizon
            
            // Event Horizon (The void)
            ctx.beginPath();
            ctx.arc(0, 0, 15, 0, Math.PI * 2);
            ctx.fillStyle = '#000000';
            ctx.shadowBlur = 25;
            ctx.shadowColor = '#ff00ff';
            ctx.fill();
            
            // Inner void core (extra darkness)
            ctx.beginPath();
            ctx.arc(0, 0, 12, 0, Math.PI * 2);
            ctx.fillStyle = '#000000';
            ctx.shadowBlur = 0;
            ctx.fill();

            ctx.restore();
        }

        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    resize();
    requestAnimationFrame(animate);

    setTimeout(createShootingStar, 2000);
    setTimeout(createAsteroid, 3000);

    console.log("Black Hole Animation started");
});
