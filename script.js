// Solar System Simulation Class
class SolarSystemSimulation {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.sun = null;
        this.planets = [];
        this.clock = new THREE.Clock();
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.isAnimating = true;
        this.isDarkMode = true;
        this.focusedPlanet = null;

        this.planetData = [
            { name: 'Mercury', orbitRadius: 15, size: 0.4, color: 0x8C7853, speed: 4.7, emoji: '☿️' },
            { name: 'Venus', orbitRadius: 20, size: 0.9, color: 0xFFC649, speed: 3.5, emoji: '♀️' },
            { name: 'Earth', orbitRadius: 25, size: 1.0, color: 0x6B93D6, speed: 3.0, emoji: '🌍' },
            { name: 'Mars', orbitRadius: 30, size: 0.5, color: 0xCD5C5C, speed: 2.4, emoji: '♂️' },
            { name: 'Jupiter', orbitRadius: 40, size: 3.0, color: 0xD8CA9D, speed: 1.3, emoji: '♃' },
            { name: 'Saturn', orbitRadius: 50, size: 2.5, color: 0xFAD5A5, speed: 1.0, emoji: '♄' },
            { name: 'Uranus', orbitRadius: 60, size: 1.8, color: 0x4FD0E3, speed: 0.7, emoji: '⛢' },
            { name: 'Neptune', orbitRadius: 70, size: 1.7, color: 0x4B70DD, speed: 0.5, emoji: '♆' }
        ];

        this.planetSpeeds = {};
        this.planetData.forEach(planet => {
            this.planetSpeeds[planet.name] = planet.speed;
        });

        this.init();
        this.setupEventListeners();
        this.createSpeedControls();
        this.animate();
    }

    init() {
        const canvas = document.getElementById('solar-system-canvas');
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(this.isDarkMode ? 0x000011 : 0x87CEEB);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 50, 100);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.createStars();
        this.createSun();
        this.createPlanets();
        this.setupLighting();
    }

    createStars() {
        const starsGeometry = new THREE.BufferGeometry();
        const starsMaterial = new THREE.PointsMaterial({ color: 0xFFFFFF, size: 1 });
        const starsVertices = [];

        for (let i = 0; i < 10000; i++) {
            starsVertices.push(
                (Math.random() - 0.5) * 2000,
                (Math.random() - 0.5) * 2000,
                (Math.random() - 0.5) * 2000
            );
        }

        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
        const stars = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(stars);
    }

    createSun() {
        const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFD700,
            emissive: 0xFFD700,
            emissiveIntensity: 0.3
        });
        this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
        this.sun.userData = { name: 'Sun' };
        this.scene.add(this.sun);
    }

    createPlanets() {
        this.planetData.forEach(data => {
            const geometry = new THREE.SphereGeometry(data.size, 32, 32);
            const material = new THREE.MeshLambertMaterial({ color: data.color });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.receiveShadow = true;
            mesh.castShadow = true;
            mesh.userData = {
                name: data.name,
                orbitRadius: data.orbitRadius,
                orbitSpeed: data.speed,
                rotationSpeed: 0.02,
                angle: Math.random() * Math.PI * 2
            };

            const orbitGeometry = new THREE.RingGeometry(data.orbitRadius - 0.1, data.orbitRadius + 0.1, 64);
            const orbitMaterial = new THREE.MeshBasicMaterial({
                color: 0x444444,
                transparent: true,
                opacity: 0.8,
                side: THREE.DoubleSide
            });

            const orbitRing = new THREE.Mesh(orbitGeometry, orbitMaterial);
            orbitRing.rotation.x = Math.PI / 2;
            this.scene.add(orbitRing);

            this.scene.add(mesh);
            this.planets.push(mesh);
        });
    }

    setupLighting() {
        const sunLight = new THREE.PointLight(0xFFFFFF, 2, 300);
        sunLight.position.set(0, 0, 0);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        this.scene.add(sunLight);

        const ambientLight = new THREE.AmbientLight(0x404040, 0.2);
        this.scene.add(ambientLight);
    }

    createSpeedControls() {
        const controlsContainer = document.getElementById('speed-controls');
        this.planetData.forEach(planet => {
            const controlGroup = document.createElement('div');
            controlGroup.className = 'control-group';

            const label = document.createElement('div');
            label.className = 'control-label';
            label.innerHTML = `
                <span class="planet-${planet.name.toLowerCase()}">${planet.emoji} ${planet.name}</span>
                <span id="${planet.name}-speed-value">${planet.speed.toFixed(1)}x</span>
            `;

            const slider = document.createElement('input');
            slider.type = 'range';
            slider.id = `${planet.name}-speed`;
            slider.className = 'speed-slider';
            slider.min = '0';
            slider.max = '10';
            slider.step = '0.1';
            slider.value = planet.speed;

            slider.addEventListener('input', (e) => {
                const newSpeed = parseFloat(e.target.value);
                this.planetSpeeds[planet.name] = newSpeed;
                document.getElementById(`${planet.name}-speed-value`).textContent = `${newSpeed.toFixed(1)}x`;
            });

            controlGroup.appendChild(label);
            controlGroup.appendChild(slider);
            controlsContainer.appendChild(controlGroup);
        });
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };

        this.renderer.domElement.addEventListener('mousedown', (e) => {
            isDragging = true;
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });

        this.renderer.domElement.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const deltaMove = {
                    x: e.clientX - previousMousePosition.x,
                    y: e.clientY - previousMousePosition.y
                };

                const spherical = new THREE.Spherical();
                spherical.setFromVector3(this.camera.position);
                spherical.theta -= deltaMove.x * 0.01;
                spherical.phi += deltaMove.y * 0.01;
                spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
                this.camera.position.setFromSpherical(spherical);
                this.camera.lookAt(0, 0, 0);
            }

            const rect = this.renderer.domElement.getBoundingClientRect();
            this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

            this.showTooltip(e);
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });

        this.renderer.domElement.addEventListener('mouseup', () => {
            isDragging = false;
        });

        this.renderer.domElement.addEventListener('mouseleave', () => {
            document.getElementById('tooltip').style.display = 'none';
        });

        this.renderer.domElement.addEventListener('wheel', (e) => {
            const direction = new THREE.Vector3();
            this.camera.getWorldDirection(direction);
            const distance = e.deltaY * 0.1;
            this.camera.position.add(direction.multiplyScalar(distance));

            const distanceFromCenter = this.camera.position.length();
            if (distanceFromCenter < 10) {
                this.camera.position.normalize().multiplyScalar(10);
            } else if (distanceFromCenter > 200) {
                this.camera.position.normalize().multiplyScalar(200);
            }
        });

        this.renderer.domElement.addEventListener('click', () => {
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(this.planets);
            if (intersects.length > 0) {
                this.focusOnPlanet(intersects[0].object.userData.name);
            }
        });

        document.getElementById('pause-btn').addEventListener('click', () => this.toggleAnimation());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetCamera());
        document.getElementById('theme-btn').addEventListener('click', () => this.toggleTheme());

        // Mobile touch support
        this.renderer.domElement.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                this.previousTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            } else if (e.touches.length === 2) {
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                this.previousPinchDistance = Math.sqrt(dx * dx + dy * dy);
            }
        });

        this.renderer.domElement.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (e.touches.length === 1 && this.previousTouch) {
                const dx = e.touches[0].clientX - this.previousTouch.x;
                const dy = e.touches[0].clientY - this.previousTouch.y;

                const spherical = new THREE.Spherical();
                spherical.setFromVector3(this.camera.position);
                spherical.theta -= dx * 0.01;
                spherical.phi += dy * 0.01;
                spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
                this.camera.position.setFromSpherical(spherical);
                this.camera.lookAt(0, 0, 0);

                this.previousTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            } else if (e.touches.length === 2) {
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const delta = this.previousPinchDistance - distance;

                const direction = new THREE.Vector3();
                this.camera.getWorldDirection(direction);
                this.camera.position.add(direction.multiplyScalar(delta * 0.05));
                this.previousPinchDistance = distance;
            }
        }, { passive: false });

        this.renderer.domElement.addEventListener('touchend', () => {
            this.previousTouch = null;
            this.previousPinchDistance = null;
        });
    }

    showTooltip(event) {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects([this.sun, ...this.planets]);
        const tooltip = document.getElementById('tooltip');

        if (intersects.length > 0) {
            const object = intersects[0].object;
            tooltip.textContent = object.userData.name;
            tooltip.style.display = 'block';
            tooltip.style.left = `${event.clientX + 10}px`;
            tooltip.style.top = `${event.clientY - 30}px`;
        } else {
            tooltip.style.display = 'none';
        }
    }

    focusOnPlanet(planetName) {
        const planet = this.planets.find(p => p.userData.name === planetName);
        if (planet) {
            this.focusedPlanet = planetName;
            const pos = planet.position;
            const distance = planet.userData.orbitRadius * 0.3;
            this.camera.position.set(pos.x + distance, pos.y + distance * 0.5, pos.z + distance);
            this.camera.lookAt(pos);
            document.getElementById('focused-planet').textContent = `🎯 Focused: ${planetName}`;
        }
    }

    toggleAnimation() {
        this.isAnimating = !this.isAnimating;
        const btn = document.getElementById('pause-btn');
        const status = document.getElementById('status');

        if (this.isAnimating) {
            btn.textContent = '⏸️ Pause';
            status.textContent = '🟢 System Running';
            status.className = 'status-indicator status-running';
            this.clock.start();
        } else {
            btn.textContent = '▶️ Resume';
            status.textContent = '🔴 System Paused';
            status.className = 'status-indicator status-paused';
            this.clock.stop();
        }
    }

    resetCamera() {
        this.camera.position.set(0, 50, 100);
        this.camera.lookAt(0, 0, 0);
        this.focusedPlanet = null;
        document.getElementById('focused-planet').textContent = '';
    }

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        const body = document.body;
        const btn = document.getElementById('theme-btn');

        if (this.isDarkMode) {
            body.classList.remove('light-mode');
            btn.textContent = '🌙 Light Mode';
            this.scene.background = new THREE.Color(0x000011);
        } else {
            body.classList.add('light-mode');
            btn.textContent = '🌞 Dark Mode';
            this.scene.background = new THREE.Color(0x87CEEB);
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.isAnimating) {
            const delta = this.clock.getDelta();

            this.planets.forEach(planet => {
                const data = planet.userData;
                const speed = this.planetSpeeds[data.name] || data.orbitSpeed;
                data.angle += speed * delta * 0.1;
                planet.position.x = Math.cos(data.angle) * data.orbitRadius;
                planet.position.z = Math.sin(data.angle) * data.orbitRadius;
                planet.rotation.y += data.rotationSpeed;
            });

            if (this.sun) {
                this.sun.rotation.y += 0.005;
            }
        }

        this.renderer.render(this.scene, this.camera);
    }
}


window.addEventListener('load', () => {
    new SolarSystemSimulation();
});
