/* ==========================================================================
   DISEÑO Y FE - LÓGICA INTERACTIVA JS (TEMA OSCURO - ESTILO PORTFOLIO)
   ========================================================================== */

function initAll() {
    // Inicializar modelos
    initCosmosBackground();
    initHeroVisual3D();
    initRoomDna3D();
    initGalaxy3D();
    initFossilExplorer();
    initFineTuningGame();
    initDnaAssemblerGame();
    initUIControls();
    initFaithScience();
    initQuizAndReviews();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
} else {
    initAll();
}

/* ==========================================================================
   1. FONDO DE COSMOS (Partículas en Canvas 2D)
   ========================================================================== */
function initCosmosBackground() {
    const canvas = document.getElementById('cosmos-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let particles = [];
    const particleCount = 100;
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    
    let mouse = { x: null, y: null, radius: 180 };
    
    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });
    
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    
    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    class CosmicParticle {
        constructor() {
            this.reset();
        }
        
        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 1.5 + 0.3;
            this.speedX = Math.random() * 0.08 - 0.04;
            this.speedY = Math.random() * 0.08 - 0.04;
            
            const colors = [
                'rgba(27, 221, 184, 0.4)',  // Teal
                'rgba(167, 139, 250, 0.35)', // Purple
                'rgba(240, 171, 252, 0.35)', // Pink
                'rgba(251, 191, 36, 0.3)',   // Amber
                'rgba(255, 255, 255, 0.5)'   // White
            ];
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.alpha = Math.random() * 0.4 + 0.2;
            this.alphaDirection = Math.random() > 0.5 ? 0.003 : -0.003;
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
                this.reset();
            }
            
            this.alpha += this.alphaDirection;
            if (this.alpha > 0.85 || this.alpha < 0.15) {
                this.alphaDirection = -this.alphaDirection;
            }
            
            // Magnetismo del ratón
            if (mouse.x !== null && mouse.y !== null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    
                    this.x += forceDirectionX * force * 1.0;
                    this.y += forceDirectionY * force * 1.0;
                }
            }
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color.replace(/[\d.]+\)$/, `${this.alpha})`);
            ctx.fill();
        }
    }

    for (let i = 0; i < particleCount; i++) {
        particles.push(new CosmicParticle());
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }
    
    animate();
}

/* ==========================================================================
   UTILERÍA: CREACIÓN DINÁMICA DE TEXTURA DE PARTÍCULA REDONDA GLOW
   ========================================================================== */
function createCircleTexture(colorStr, size = 64) {
    const matCanvas = document.createElement('canvas');
    matCanvas.width = size;
    matCanvas.height = size;
    const matCtx = matCanvas.getContext('2d');
    
    // Crear un gradiente radial sutil para un punto difuminado glowing
    const gradient = matCtx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.15, colorStr);
    gradient.addColorStop(0.5, colorStr.replace(/,?\s*[\d.]+\)$/, ', 0.3)'));
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    matCtx.fillStyle = gradient;
    matCtx.fillRect(0, 0, size, size);
    
    return new THREE.CanvasTexture(matCanvas);
}

/* ==========================================================================
   2. HÉROE: ÁTOMO Y ADN DE PARTÍCULAS EN 3D (Three.js + Parallax)
   ========================================================================== */
function initHeroVisual3D() {
    const container = document.getElementById('hero-interactive-canvas');
    if (!container) return;

    // Si el contenedor aún no tiene dimensiones (pintado pendiente), esperar un frame
    function tryInit() {
        if (container.clientWidth === 0 || container.clientHeight === 0) {
            requestAnimationFrame(tryInit);
            return;
        }
        _doInitHero(container);
    }
    tryInit();
}

function _doInitHero(container) {
    try {
        const clock = new THREE.Clock();

    // Escena y Cámara
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 15;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);


    // Grupo contenedor para paralaje del cursor
    const parallaxGroup = new THREE.Group();
    scene.add(parallaxGroup);

    // Grupo de rotación continua
    const rotateGroup = new THREE.Group();
    parallaxGroup.add(rotateGroup);

    // TEXTURA DE PUNTOS COMÚN
    const cyanTexture = createCircleTexture('rgba(0, 240, 255, 1)');
    const purpleTexture = createCircleTexture('rgba(167, 139, 250, 1)');
    const pinkTexture = createCircleTexture('rgba(240, 171, 252, 1)');
    const whiteTexture = createCircleTexture('rgba(255, 255, 255, 1)');

    // ----------------------------------------------------
    // MODELO 1: ÁTOMO DE PARTÍCULAS (Lado Izquierdo del Héroe)
    // ----------------------------------------------------
    const atomGroup = new THREE.Group();
    atomGroup.position.set(-2.6, 0.4, 0); // Posición ajustada y desplazada más a la izquierda
    atomGroup.scale.set(1.3, 1.3, 1.3); // Hacelo un poco más grande
    rotateGroup.add(atomGroup);

    // 1. Núcleo del Átomo (Nube de partículas densas)
    const nucleusCount = 1200; // Más denso
    const nucleusPositions = new Float32Array(nucleusCount * 3);
    for (let i = 0; i < nucleusCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const r = Math.random() * 0.75; // Esfera núcleo más grande
        
        nucleusPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        nucleusPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        nucleusPositions[i * 3 + 2] = r * Math.cos(phi);
    }
    const nucleusGeom = new THREE.BufferGeometry();
    nucleusGeom.setAttribute('position', new THREE.BufferAttribute(nucleusPositions, 3));
    
    const nucleusMat = new THREE.PointsMaterial({
        size: 0.12, // Partículas más grandes
        map: cyanTexture,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const nucleusPoints = new THREE.Points(nucleusGeom, nucleusMat);
    atomGroup.add(nucleusPoints);

    // 2. Órbitas Elípticas de Partículas (Estilo stardust del screenshot)
    const orbits = [
        { rotX: 0.5, rotY: 0.3, rotZ: 0, A: 3.2, B: 1.2, texture: cyanTexture, color: 0x00f0ff, speed: 2.8 }, // Órbitas ~1.5x más grandes
        { rotX: -0.6, rotY: -0.4, rotZ: 0.8, A: 2.9, B: 1.1, texture: purpleTexture, color: 0xa78bfa, speed: 3.5 },
        { rotX: 0.2, rotY: 0.8, rotZ: -0.5, A: 3.4, B: 1.4, texture: pinkTexture, color: 0xf0abfc, speed: 2.2 }
    ];

    const electrons = [];

    orbits.forEach(data => {
        const orbitSubGroup = new THREE.Group();
        orbitSubGroup.rotation.set(data.rotX, data.rotY, data.rotZ);
        atomGroup.add(orbitSubGroup);

        // Generar una banda de partículas densa a lo largo de la elipse
        const ringCount = 2200; // Mayor cantidad de estrellas
        const ringPositions = new Float32Array(ringCount * 3);
        for (let i = 0; i < ringCount; i++) {
            const theta = (i / ringCount) * Math.PI * 2;
            const spreadRadius = (Math.random() - 0.5) * 0.25; // Anillo más ancho
            const rOffset = data.A + spreadRadius;
            const spreadY = (Math.random() - 0.5) * 0.2; // Altura del haz

            ringPositions[i * 3] = rOffset * Math.cos(theta);
            ringPositions[i * 3 + 1] = spreadY;
            ringPositions[i * 3 + 2] = rOffset * (data.B / data.A) * Math.sin(theta);
        }

        const ringGeom = new THREE.BufferGeometry();
        ringGeom.setAttribute('position', new THREE.BufferAttribute(ringPositions, 3));

        const ringMat = new THREE.PointsMaterial({
            size: 0.07, // Partículas de órbita más grandes
            map: data.texture,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const ringPoints = new THREE.Points(ringGeom, ringMat);
        orbitSubGroup.add(ringPoints);

        // Electrón físico glowing (Mesh brillante más grande)
        const electronGeom = new THREE.SphereGeometry(0.18, 16, 16);
        const electronMat = new THREE.MeshBasicMaterial({
            color: data.color,
            transparent: true,
            opacity: 0.95
        });
        const electronMesh = new THREE.Mesh(electronGeom, electronMat);
        orbitSubGroup.add(electronMesh);

        electrons.push({
            mesh: electronMesh,
            A: data.A,
            B: data.B,
            speed: data.speed,
            offset: Math.random() * Math.PI * 2
        });
    });

    // ----------------------------------------------------
    // MODELO 2: ADN DE PARTÍCULAS (Lado Derecho del Héroe)
    // ----------------------------------------------------
    const dnaGroup = new THREE.Group();
    dnaGroup.position.set(2.6, -0.4, 0); // Desplazado a la derecha
    dnaGroup.scale.set(1.2, 1.2, 1.2); // Un poco más grande también
    rotateGroup.add(dnaGroup);

    const dnaHeight = 11.5; // ADN 1.5x más alto
    const dnaRadius = 1.5;  // ADN 1.5x más ancho
    const dnaTurns = 2.0;
    const countPerHelix = 1600; // Más denso

    const helixPositions1 = new Float32Array(countPerHelix * 3);
    const helixPositions2 = new Float32Array(countPerHelix * 3);
    const nodesHelix1 = [];
    const nodesHelix2 = [];

    // Generar partículas para las 2 hebras principales del ADN
    for (let i = 0; i < countPerHelix; i++) {
        const fraction = i / countPerHelix;
        const theta = fraction * Math.PI * 2 * dnaTurns;
        const y = fraction * dnaHeight - (dnaHeight / 2);

        // Hebra 1 con ruido de nube
        const bx1 = dnaRadius * Math.cos(theta);
        const bz1 = dnaRadius * Math.sin(theta);
        helixPositions1[i * 3] = bx1 + (Math.random() - 0.5) * 0.22;
        helixPositions1[i * 3 + 1] = y + (Math.random() - 0.5) * 0.07;
        helixPositions1[i * 3 + 2] = bz1 + (Math.random() - 0.5) * 0.22;

        // Hebra 2
        const bx2 = dnaRadius * Math.cos(theta + Math.PI);
        const bz2 = dnaRadius * Math.sin(theta + Math.PI);
        helixPositions2[i * 3] = bx2 + (Math.random() - 0.5) * 0.22;
        helixPositions2[i * 3 + 1] = y + (Math.random() - 0.5) * 0.07;
        helixPositions2[i * 3 + 2] = bz2 + (Math.random() - 0.5) * 0.22;

        // Almacenar nodos principales periódicamente para cruzar los peldaños
        if (i % 60 === 0) {
            nodesHelix1.push(new THREE.Vector3(bx1, y, bz1));
            nodesHelix2.push(new THREE.Vector3(bx2, y, bz2));
        }
    }

    const hGeom1 = new THREE.BufferGeometry();
    hGeom1.setAttribute('position', new THREE.BufferAttribute(helixPositions1, 3));
    const hGeom2 = new THREE.BufferGeometry();
    hGeom2.setAttribute('position', new THREE.BufferAttribute(helixPositions2, 3));

    const helixMat = new THREE.PointsMaterial({
        size: 0.09, // Partículas de hebras más grandes
        map: cyanTexture,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const helixPoints1 = new THREE.Points(hGeom1, helixMat);
    const helixPoints2 = new THREE.Points(hGeom2, helixMat);
    dnaGroup.add(helixPoints1);
    dnaGroup.add(helixPoints2);

    // Generar peldaños hechos enteramente de partículas de neón
    const rungPoints = [];
    const rungColors = [];
    const colorTeal = new THREE.Color(0x00f0ff);
    const colorPurple = new THREE.Color(0xa78bfa);

    for (let r = 0; r < nodesHelix1.length; r++) {
        const p1 = nodesHelix1[r];
        const p2 = nodesHelix2[r];
        const particlesPerRung = 55; // Mayor densidad de peldaño

        for (let j = 0; j <= particlesPerRung; j++) {
            const frac = j / particlesPerRung;
            const rx = p1.x * (1 - frac) + p2.x * frac;
            const ry = p1.y * (1 - frac) + p2.y * frac;
            const rz = p1.z * (1 - frac) + p2.z * frac;

            rungPoints.push(
                rx + (Math.random() - 0.5) * 0.09,
                ry + (Math.random() - 0.5) * 0.04,
                rz + (Math.random() - 0.5) * 0.09
            );

            // Gradiente cromático: mitad cian, mitad violeta
            const mixed = frac < 0.5 ? colorTeal : colorPurple;
            rungColors.push(mixed.r, mixed.g, mixed.b);
        }
    }

    const rungGeom = new THREE.BufferGeometry();
    rungGeom.setAttribute('position', new THREE.Float32BufferAttribute(rungPoints, 3));
    rungGeom.setAttribute('color', new THREE.Float32BufferAttribute(rungColors, 3));

    const rungMat = new THREE.PointsMaterial({
        size: 0.08, // Partículas de peldaños más grandes
        map: whiteTexture,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const dnaRungs = new THREE.Points(rungGeom, rungMat);
    dnaGroup.add(dnaRungs);

    // Rotación e inclinación del ADN del héroe
    dnaGroup.rotation.set(0.6, 0.15, -0.35);

    // ----------------------------------------------------
    // SISTEMA DE ESTRELLAS DE FONDO INTERNAS (ThreeJS)
    // ----------------------------------------------------
    const starCount = 150;
    const starGeom = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
        const rad = Math.random() * 5 + 4.0;
        const th = Math.random() * Math.PI * 2;
        const y = Math.random() * 10 - 5;

        starPos[i * 3] = rad * Math.cos(th);
        starPos[i * 3 + 1] = y;
        starPos[i * 3 + 2] = rad * Math.sin(th);

        const mix = new THREE.Color().lerpColors(colorTeal, colorPurple, Math.random());
        starColors[i * 3] = mix.r;
        starColors[i * 3 + 1] = mix.g;
        starColors[i * 3 + 2] = mix.b;
    }
    starGeom.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeom.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({ size: 0.06, vertexColors: true, transparent: true, opacity: 0.7 });
    const bgStars = new THREE.Points(starGeom, starMat);
    rotateGroup.add(bgStars);

    // --- INTERACTIVIDAD PARALLAX DE RATÓN (Inclinación del Cosmos) ---
    let mouseX = 0, mouseY = 0;
    let targetRotX = 0, targetRotY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;

        targetRotX = mouseY * 0.38; // Inclinar en eje X
        targetRotY = mouseX * 0.38; // Inclinar en eje Y
    });

    // Responsividad
    window.addEventListener('resize', () => {
        if (!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });

    // Loop de animación 3D
    function animate() {
        requestAnimationFrame(animate);

        const elapsed = clock.getElapsedTime();

        // 1. Rotación orbital de electrones
        electrons.forEach(el => {
            const angle = elapsed * el.speed + el.offset;
            el.mesh.position.set(
                el.A * Math.cos(angle),
                0,
                el.B * Math.sin(angle)
            );
        });

        // 2. Rotación continua de modelos
        atomGroup.rotation.y = elapsed * 0.15;
        dnaGroup.rotation.y = elapsed * 0.12;
        bgStars.rotation.y = -elapsed * 0.04;

        // Vibración estocástica leve en el núcleo
        const pos = nucleusGeom.attributes.position.array;
        for (let i = 0; i < pos.length; i++) {
            pos[i] += (Math.random() - 0.5) * 0.003;
        }
        nucleusGeom.attributes.position.needsUpdate = true;

        // 3. Suavizado físico Lerp de inclinación
        parallaxGroup.rotation.x += (targetRotX - parallaxGroup.rotation.x) * 0.05;
        parallaxGroup.rotation.y += (targetRotY - parallaxGroup.rotation.y) * 0.05;

        renderer.render(scene, camera);
    }
    animate();
    } catch (e) {
        console.warn("Could not initialize 3D Hero Visualizer (WebGL might not be supported):", e);
        container.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--color-text-muted);font-size:0.85rem">Visualización 3D no disponible</div>`;
    }
}

/* ==========================================================================
   3. SALA 1: VISUALIZADOR 3D INTERACTIVO DE ADN (Three.js)
   ========================================================================== */
function initRoomDna3D() {
    const container = document.getElementById('dna-canvas-3d');
    if (!container) return;

    try {
        const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06060f, 0.02);

    const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0x030308, 1);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 22;
    controls.minDistance = 6;
    controls.enablePan = false;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.25);
    scene.add(ambientLight);

    const pLight1 = new THREE.PointLight(0x1bddb8, 2.5, 30);
    pLight1.position.set(8, 8, 8);
    scene.add(pLight1);

    const pLight2 = new THREE.PointLight(0xa78bfa, 2.5, 30);
    pLight2.position.set(-8, -8, 8);
    scene.add(pLight2);

    const dnaGroup = new THREE.Group();
    scene.add(dnaGroup);

    // Metadatos científicos adaptados
    const basesMetadata = {
        A: {
            name: "Adenina (A)",
            fullName: "Adenina (Base Purina)",
            pair: "Timina (T)",
            description: "Es una base nitrogenada que se une covalentemente a la desoxirribosa. En la doble hélice, se conecta con la Timina mediante exactamente **dos puentes de hidrógeno**. Su estructura simétrica encaja únicamente con la Timina, asegurando la copia exacta de la información.",
            insight: "La estructura química del par A-T mantiene la anchura de la doble hélice constante. Este nivel de estandarización es indispensable para que los ribosomas puedan transcribir la información lineal, como un lector de cabezal magnético leyendo código binario de ancho fijo."
        },
        T: {
            name: "Timina (T)",
            fullName: "Timina (Base Pirimidina)",
            pair: "Adenina (A)",
            description: "Es una base nitrogenada pirimidina. En el ARN, la timina es reemplazada por el uracilo. En el ADN, se une con la Adenina. Su estabilidad térmica ayuda a conservar el código genético sin distorsiones provocadas por fluctuaciones de temperatura ordinarias.",
            insight: "Las bases nitrogenadas tienen una propiedad llamada tautomería (cambio de posición de un protón). El ADN está diseñado de tal forma que previene estos raros cambios químicos espontáneos, los cuales provocarían mutaciones catastróficas que arruinarían el mensaje funcional de la vida."
        },
        C: {
            name: "Citocina (C)",
            fullName: "Citocina (Base Pirimidina)",
            pair: "Guanina (G)",
            description: "Es una base nitrogenada pirimidina que forma nucleótidos en los ácidos nucleicos. Se empareja de manera absoluta con la Guanina a través de **tres puentes de hidrógeno**, creando un enlace molecular extremadamente fuerte.",
            insight: "El par Citocina-Guanina, al contar con tres enlaces de hidrógeno, requiere mayor energía para romperse que el par A-T. La proporción de pares C-G en un organismo está calibrada de acuerdo con su entorno biológico, optimizando la flexibilidad de la hebra y el consumo de energía en la lectura genética."
        },
        G: {
            name: "Guanina (G)",
            fullName: "Guanina (Base Purina)",
            pair: "Citocina (C)",
            description: "Es una base purina. Su fórmula molecular es C5H5N5O y se une de manera exclusiva a la Citocina. Juntas forman las regiones del genoma que suelen codificar el inicio de lectura de genes importantes (islas CpG).",
            insight: "La información en el ADN no reside en las fuerzas químicas ordinarias de atracción física (que solo sostienen la estructura), sino en la secuencia específica de las bases. Esto se conoce como 'independencia de portador de información': al igual que la tinta no determina las palabras del libro, las leyes químicas no determinan el código genético. Ha sido codificado con un propósito inteligente."
        },
        backbone: {
            name: "Esqueleto Fosfato",
            fullName: "Cadena Azúcar-Fosfato",
            pair: "Enlaces covalentes fosfodiéster",
            description: "Es la espina dorsal que mantiene unida la molécula de ADN. Está compuesta por grupos fosfato alternados con azúcares de desoxirribosa. Sus fuertes enlaces fosfodiéster covalentes otorgan al ADN su célebre resistencia estructural.",
            insight: "La espina dorsal está cargada negativamente. Esta repulsión eléctrica mutua obliga al ADN a mantenerse extendido y previene que se colapse sobre sí mismo, permitiendo que las proteínas de lectura se deslicen por su longitud con total libertad para escanear el código."
        }
    };

    const numNodes = 36;
    const helixRadius = 2.4;
    const helixHeight = 16;
    const turns = 3;
    const backboneNodes = [];
    const interactiveObjects = [];

    const sphereGeom = new THREE.SphereGeometry(0.18, 24, 24);
    const backboneMat = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        emissive: 0x111111,
        shininess: 120
    });

    const baseMaterials = {
        A: new THREE.MeshPhongMaterial({ color: 0x1bddb8, emissive: 0x0d5c4b, shininess: 100 }), // Teal glow
        T: new THREE.MeshPhongMaterial({ color: 0xa78bfa, emissive: 0x3e2475, shininess: 100 }), // Purple glow
        C: new THREE.MeshPhongMaterial({ color: 0xf0abfc, emissive: 0x611f6b, shininess: 100 }), // Pink glow
        G: new THREE.MeshPhongMaterial({ color: 0xfbbf24, emissive: 0x735607, shininess: 100 })  // Amber glow
    };

    const basesOrder = ['A', 'T', 'C', 'G'];

    for (let i = 0; i < numNodes; i++) {
        const t = (i / numNodes) * Math.PI * 2 * turns;
        const y = (i / numNodes) * helixHeight - (helixHeight / 2);

        // Hélice 1
        const x1 = helixRadius * Math.cos(t);
        const z1 = helixRadius * Math.sin(t);
        const node1 = new THREE.Mesh(sphereGeom, backboneMat);
        node1.position.set(x1, y, z1);
        node1.userData = { type: 'backbone' };
        dnaGroup.add(node1);
        interactiveObjects.push(node1);

        // Hélice 2
        const x2 = helixRadius * Math.cos(t + Math.PI);
        const z2 = helixRadius * Math.sin(t + Math.PI);
        const node2 = new THREE.Mesh(sphereGeom, backboneMat);
        node2.position.set(x2, y, z2);
        node2.userData = { type: 'backbone' };
        dnaGroup.add(node2);
        interactiveObjects.push(node2);

        backboneNodes.push({ pos1: new THREE.Vector3(x1, y, z1), pos2: new THREE.Vector3(x2, y, z2) });

        const base1 = basesOrder[i % 4];
        let base2 = '';
        if (base1 === 'A') base2 = 'T';
        if (base1 === 'T') base2 = 'A';
        if (base1 === 'C') base2 = 'G';
        if (base1 === 'G') base2 = 'C';

        const cx = (x1 + x2) / 2;
        const cz = (z1 + z2) / 2;
        const dCenter = new THREE.Vector3(cx, y, cz);
        const d1 = new THREE.Vector3(x1, y, z1);
        const d2 = new THREE.Vector3(x2, y, z2);

        // Mitad 1
        const direction1 = new THREE.Vector3().subVectors(d1, dCenter);
        const len1 = direction1.length();
        const rungGeom1 = new THREE.CylinderGeometry(0.14, 0.14, len1 - 0.18, 12);
        const rung1 = new THREE.Mesh(rungGeom1, baseMaterials[base1]);
        const mid1 = new THREE.Vector3().addVectors(dCenter, d1).multiplyScalar(0.5);
        rung1.position.copy(mid1);
        rung1.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction1.normalize());
        rung1.userData = { type: 'base', name: base1 };
        dnaGroup.add(rung1);
        interactiveObjects.push(rung1);

        // Mitad 2
        const direction2 = new THREE.Vector3().subVectors(d2, dCenter);
        const len2 = direction2.length();
        const rungGeom2 = new THREE.CylinderGeometry(0.14, 0.14, len2 - 0.18, 12);
        const rung2 = new THREE.Mesh(rungGeom2, baseMaterials[base2]);
        const mid2 = new THREE.Vector3().addVectors(dCenter, d2).multiplyScalar(0.5);
        rung2.position.copy(mid2);
        rung2.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction2.normalize());
        rung2.userData = { type: 'base', name: base2 };
        dnaGroup.add(rung2);
        interactiveObjects.push(rung2);
    }

    // Curvas azúcar fosfato
    const curvePoints1 = [];
    const curvePoints2 = [];
    for (let i = 0; i < numNodes; i++) {
        curvePoints1.push(backboneNodes[i].pos1);
        curvePoints2.push(backboneNodes[i].pos2);
    }
    const curve1 = new THREE.CatmullRomCurve3(curvePoints1);
    const curve2 = new THREE.CatmullRomCurve3(curvePoints2);
    const tubeGeom1 = new THREE.TubeGeometry(curve1, 64, 0.08, 8, false);
    const tubeGeom2 = new THREE.TubeGeometry(curve2, 64, 0.08, 8, false);
    const tube1 = new THREE.Mesh(tubeGeom1, backboneMat);
    const tube2 = new THREE.Mesh(tubeGeom2, backboneMat);
    tube1.userData = { type: 'backbone' };
    tube2.userData = { type: 'backbone' };
    dnaGroup.add(tube1, tube2);
    interactiveObjects.push(tube1, tube2);

    // Partículas orbitantes
    const pCount = 200;
    const pGeom = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    const pColors = new Float32Array(pCount * 3);
    const cTeal = new THREE.Color(0x1bddb8);
    const cPurple = new THREE.Color(0xa78bfa);

    const cyanTexture = createCircleTexture('rgba(0, 240, 255, 1)');

    for (let i = 0; i < pCount; i++) {
        const th = Math.random() * Math.PI * 2;
        const rad = Math.random() * 2.2 + 2.8;
        const y = Math.random() * 18 - 9;
        pPos[i * 3] = rad * Math.cos(th);
        pPos[i * 3 + 1] = y;
        pPos[i * 3 + 2] = rad * Math.sin(th);
        
        const mix = new THREE.Color().lerpColors(cTeal, cPurple, Math.random());
        pColors[i * 3] = mix.r;
        pColors[i * 3 + 1] = mix.g;
        pColors[i * 3 + 2] = mix.b;
    }
    pGeom.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeom.setAttribute('color', new THREE.BufferAttribute(pColors, 3));
    const pMat = new THREE.PointsMaterial({ size: 0.07, map: cyanTexture, vertexColors: true, transparent: true, opacity: 0.65 });
    const particles = new THREE.Points(pGeom, pMat);
    dnaGroup.add(particles);

    // Controles
    let autoSpin = true;
    let glowOn = true;

    document.getElementById('btn-spin-toggle').addEventListener('click', (e) => {
        autoSpin = !autoSpin;
        e.target.classList.toggle('active', autoSpin);
    });

    document.getElementById('btn-glow-toggle').addEventListener('click', (e) => {
        glowOn = !glowOn;
        e.target.classList.toggle('active', glowOn);
        pLight1.intensity = glowOn ? 2.5 : 0.8;
        pLight2.intensity = glowOn ? 2.5 : 0.8;
        backboneMat.emissive.setHex(glowOn ? 0x111111 : 0x020202);
    });

    document.getElementById('btn-reset-view').addEventListener('click', () => {
        controls.reset();
        dnaGroup.rotation.set(0, 0, 0);
        camera.position.set(0, 0, 15);
    });

    // Raycasting
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const infoDefault = document.getElementById('nucleotide-info-default');
    const infoActive = document.getElementById('nucleotide-info-active');
    const badge = document.getElementById('base-name-badge');
    const fullName = document.getElementById('base-full-name');
    const pairingInfo = document.getElementById('base-pairing-info');
    const description = document.getElementById('base-description');
    const insight = document.getElementById('base-insight');

    function onMouseDown(event) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(interactiveObjects);

        if (intersects.length > 0) {
            const hit = intersects[0].object;
            const data = hit.userData;
            let meta = null;

            if (data.type === 'base') {
                meta = basesMetadata[data.name];
                badge.style.backgroundColor = 'rgba(255,255,255,0.03)';
                badge.style.borderColor = hit.material.color.getStyle();
                badge.style.color = hit.material.color.getStyle();
            } else if (data.type === 'backbone') {
                meta = basesMetadata.backbone;
                badge.style.backgroundColor = 'rgba(255,255,255,0.03)';
                badge.style.borderColor = '#ffffff';
                badge.style.color = '#ffffff';
            }

            if (meta) {
                badge.textContent = meta.name;
                fullName.textContent = meta.fullName;
                pairingInfo.textContent = meta.pair;
                description.innerHTML = meta.description;
                insight.innerHTML = meta.insight;

                infoDefault.classList.remove('active');
                infoActive.classList.add('active');

                const orig = hit.scale.x;
                hit.scale.set(1.3, 1.3, 1.3);
                setTimeout(() => { hit.scale.set(orig, orig, orig); }, 250);
            }
        }
    }

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('touchstart', (e) => {
        if(e.touches.length === 1) onMouseDown(e.touches[0]);
    });

    window.addEventListener('resize', () => {
        if (!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });

    function animate() {
        requestAnimationFrame(animate);
        if (autoSpin) dnaGroup.rotation.y += 0.003;
        particles.rotation.y += 0.001;
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
    } catch (e) {
        console.warn("Could not initialize DNA 3D Viewer (WebGL might not be supported):", e);
        container.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--color-text-muted);font-size:0.85rem">Visualización 3D no disponible</div>`;
    }
}

/* ==========================================================================
   3.5 SALA 2: GALAXIA ESPIRAL 3D (Three.js)
   ========================================================================== */
function initGalaxy3D() {
    const container = document.getElementById('galaxy-3d-container');
    const canvas = document.getElementById('galaxy-3d-canvas');
    if (!container || !canvas) return;

    try {
        // Escena, Cámara y Renderizador
        const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06060f, 0.03);

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 4.0, 6.5); // Vista ligeramente elevada e inclinada (acercada para mayor tamaño)

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Controles orbitales para que el usuario pueda interactuar (rotar/zoom)
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 15;
    controls.minDistance = 3;
    controls.enablePan = false;
    controls.autoRotate = true; // Rotación automática constante
    controls.autoRotateSpeed = 0.8; // Velocidad de rotación lenta y elegante

    // Luz sutil
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambientLight);

    // ----------------------------------------------------
    // GENERACIÓN DE PARTÍCULAS DE LA GALAXIA ESPIRAL
    // ----------------------------------------------------
    const parameters = {
        count: 14000,          // Gran cantidad de estrellas para máxima fidelidad
        size: 0.055,           // Tamaño de estrellas más grande
        radius: 6.2,           // Radio de la galaxia (más grande)
        branches: 3,           // 3 brazos espirales para mayor complejidad
        spin: 1.25,            // Winding (cuánto se enroscan los brazos)
        randomness: 0.32,      // Dispersión de partículas
        power: 3.5,            // Concentración en el núcleo (a mayor potencia, más denso el centro)
        insideColor: '#f97316', // Color interno naranja cálido (#f97316 o #fbbf24)
        outsideColor: '#a78bfa' // Color exterior morado celestial
    };

    let geometry = null;
    let material = null;
    let points = null;

    function generateGalaxy() {
        if (points !== null) {
            geometry.dispose();
            material.dispose();
            scene.remove(points);
        }

        geometry = new THREE.BufferGeometry();

        const positions = new Float32Array(parameters.count * 3);
        const colors = new Float32Array(parameters.count * 3);

        const colorInside = new THREE.Color(parameters.insideColor);
        const colorOutside = new THREE.Color(parameters.outsideColor);

        for (let i = 0; i < parameters.count; i++) {
            // Posición de la partícula
            const radius = Math.pow(Math.random(), parameters.power) * parameters.radius;
            const spinAngle = radius * parameters.spin;
            const branchAngle = ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

            // Dispersión aleatoria (ruido)
            const randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
            const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
            const randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;

            positions[i * 3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
            positions[i * 3 + 1] = randomY; // Fino en el eje vertical
            positions[i * 3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

            // Color de la partícula (Gradiente cálido en el núcleo a morado en el exterior)
            const mixedColor = colorInside.clone();
            mixedColor.lerp(colorOutside, radius / parameters.radius);

            // Agregar un toque estocástico de brillo blanco en el centro para simular estrellas supergigantes
            if (radius < 0.8 && Math.random() > 0.82) {
                mixedColor.setHex(0xffffff);
            }

            colors[i * 3] = mixedColor.r;
            colors[i * 3 + 1] = mixedColor.g;
            colors[i * 3 + 2] = mixedColor.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        // Textura suave y glowing
        const starTexture = createCircleTexture('rgba(251, 191, 36, 1)'); // Textura circular con brillo

        material = new THREE.PointsMaterial({
            size: parameters.size,
            sizeAttenuation: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexColors: true,
            map: starTexture,
            transparent: true,
            opacity: 0.85
        });

        points = new THREE.Points(geometry, material);
        points.scale.set(1.15, 1.15, 1.15); // Agrandar el grupo de puntos
        scene.add(points);
    }

    generateGalaxy();

    // Inclinación inicial de la galaxia para perspectiva óptima
    points.rotation.x = 0.2;
    points.rotation.z = -0.1;

    // Responsividad
    window.addEventListener('resize', () => {
        if (!container || !renderer) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });

    // Loop de animación
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const elapsed = clock.getElapsedTime();

        // Rotación lenta de los brazos independientemente de autoRotate de la cámara
        if (points) {
            points.rotation.y = elapsed * 0.03;
        }

        controls.update();
        renderer.render(scene, camera);
    }
    animate();
    } catch (e) {
        console.warn("Could not initialize Galaxy 3D (WebGL might not be supported):", e);
        canvas.style.display = 'none';
        container.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--color-text-muted);font-size:0.85rem">Visualización 3D no disponible</div>`;
    }
}

/* ==========================================================================
   4. SALA 3: EXPLORADOR DE FÓSILES (Pestañas)
   ========================================================================== */
function initFossilExplorer() {
    const tabs = document.querySelectorAll('.fossil-tab');
    const details = document.querySelectorAll('.fossil-detail');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            details.forEach(d => d.classList.remove('active'));

            tab.classList.add('active');
            const fossilId = tab.getAttribute('data-fossil');
            const targetDetail = document.getElementById(`fossil-${fossilId}`);
            if (targetDetail) {
                targetDetail.classList.add('active');
            }
        });
    });
}

/* ==========================================================================
   5. ZONA DE DESAFÍOS: JUEGO 1 (SIMULADOR DE AJUSTE FINO)
   ========================================================================== */
function initFineTuningGame() {
    const slideGravity = document.getElementById('slide-gravity');
    const slideNuclear = document.getElementById('slide-nuclear');
    const slideCosmo = document.getElementById('slide-cosmo');
    const slideProton = document.getElementById('slide-proton');

    const valGravity = document.getElementById('val-gravity');
    const valNuclear = document.getElementById('val-nuclear');
    const valCosmo = document.getElementById('val-cosmo');
    const valProton = document.getElementById('val-proton');

    if (!slideGravity) return;

    const universeGlow = document.getElementById('universe-glow');
    const universeStatus = document.getElementById('universe-status');
    const simMainStar = document.getElementById('sim-main-star');
    const simPlanet = document.getElementById('sim-planet-1');
    const verdictTitle = document.querySelector('#universe-verdict h4');
    const verdictDesc = document.getElementById('universe-verdict-desc');
    const btnResetUniverse = document.getElementById('btn-reset-universe');

    const targets = {
        gravity: { ideal: 1.0 },
        nuclear: { ideal: 0.007 },
        cosmo: { ideal: 1.0 },
        proton: { ideal: 1.0 }
    };

    function updateSimulation() {
        const gravity = parseFloat(slideGravity.value);
        const nuclear = parseFloat(slideNuclear.value);
        const cosmo = parseFloat(slideCosmo.value);
        const proton = parseFloat(slideProton.value);

        valGravity.textContent = gravity.toFixed(4) + 'x';
        valNuclear.textContent = nuclear.toFixed(4);
        valCosmo.textContent = cosmo.toFixed(4) + 'x';
        valProton.textContent = proton.toFixed(4) + 'x';

        let isViable = true;
        let message = "";
        let description = "";
        let visualClass = "perfect";

        if (gravity > 1.15) {
            isViable = false;
            message = "⚠️ COLAPSO GRAVITATORIO";
            description = `La fuerza de gravedad es demasiado intensa (${gravity.toFixed(2)}x). La materia colapsó instantáneamente en agujeros negros. No hay planetas estables, inhabilitando la existencia de vida.`;
            visualClass = "collapsed";
        } else if (gravity < 0.85) {
            isViable = false;
            message = "⚠️ EXPANSIÓN DISPERSA";
            description = `La gravedad es muy débil (${gravity.toFixed(2)}x). El gas cósmico nunca logró condensarse para encender estrellas. El universo es solo hidrógeno en expansión fría.`;
            visualClass = "dispersed";
        }
        else if (nuclear > 0.0073) {
            isViable = false;
            message = "⚠️ CATÁSTROFE NUCLEAR FUERTE";
            description = `La fuerza nuclear fuerte es superior a 0.0070. Esto acelera la fusión estelar, quemando todo el hidrógeno en helio en los primeros minutos del Big Bang. No existe agua ni carbono.`;
            visualClass = "hot-death";
        } else if (nuclear < 0.0067) {
            isViable = false;
            message = "⚠️ UNIVERSO SIN QUÍMICA PESADA";
            description = `La fuerza nuclear fuerte está por debajo de 0.0070. El deuterio es inestable y no se forman núcleos pesados como el carbono u oxígeno. Solo hay hidrógeno libre.`;
            visualClass = "cold-dark";
        }
        else if (cosmo > 1.15) {
            isViable = false;
            message = "⚠️ GRAN DESGARRO CÓSMICO";
            description = `La velocidad de expansión del vacío es hiperbólica (${cosmo.toFixed(2)}x). Las galaxias se desgarran antes de unirse. El universo es un vacío oscuro y congelado.`;
            visualClass = "torn";
        } else if (cosmo < 0.85) {
            isViable = false;
            message = "⚠️ GRAN IMPLOSIÓN (BIG CRUNCH)";
            description = `La constante cosmológica de expansión es insuficiente. La gravedad detiene el espacio y el universo implociona sobre sí mismo rápidamente en un Big Crunch.`;
            visualClass = "collapsed";
        }
        else if (proton > 1.05 || proton < 0.95) {
            isViable = false;
            message = "⚠️ INESTABILIDAD MOLECULAR";
            description = `Variar la masa del protón rompe los niveles de energía orbital cuántica. Los electrones no pueden unirse para formar compuestos químicos vitales como el agua (H₂O).`;
            visualClass = "no-chemistry";
        }

        if (isViable) {
            message = "🌌 UNIVERSO APTO PARA LA VIDA";
            description = "Has calibrado las constantes en su estrecho rango de sintonización precisa. Las estrellas brillan de forma estable y los planetas rocosos retienen agua líquida permitiendo la vida.";
            visualClass = "perfect";
        }

        universeStatus.textContent = message;
        verdictDesc.innerHTML = description;
        verdictTitle.textContent = isViable ? "ESTADO: PERFECTO" : "ESTADO: CAÓTICO";
        
        if (isViable) {
            verdictTitle.className = "text-teal";
            universeStatus.style.color = "var(--color-teal)";
        } else {
            verdictTitle.className = "text-red";
            universeStatus.style.color = "var(--color-red)";
        }

        switch(visualClass) {
            case "perfect":
                universeGlow.style.background = "radial-gradient(circle, rgba(27, 221, 184, 0.2) 0%, rgba(167, 139, 250, 0.1) 60%, transparent 80%)";
                simMainStar.style.transform = "scale(1)";
                simMainStar.style.backgroundColor = "var(--color-teal)";
                simMainStar.style.boxShadow = "0 0 25px var(--color-teal)";
                simPlanet.style.opacity = "1";
                simPlanet.style.animationPlayState = "running";
                break;
            case "collapsed":
                universeGlow.style.background = "radial-gradient(circle, rgba(231, 76, 60, 0.15) 0%, transparent 60%)";
                simMainStar.style.transform = "scale(0.18)";
                simMainStar.style.backgroundColor = "#070714";
                simMainStar.style.boxShadow = "0 0 10px rgba(255, 255, 255, 0.15)";
                simPlanet.style.opacity = "0";
                simPlanet.style.animationPlayState = "paused";
                break;
            case "dispersed":
            case "torn":
                universeGlow.style.background = "transparent";
                simMainStar.style.transform = "scale(0.0)";
                simMainStar.style.boxShadow = "none";
                simPlanet.style.opacity = "0";
                simPlanet.style.animationPlayState = "paused";
                break;
            case "hot-death":
                universeGlow.style.background = "radial-gradient(circle, rgba(243, 156, 18, 0.3) 0%, transparent 70%)";
                simMainStar.style.transform = "scale(2.0)";
                simMainStar.style.backgroundColor = "var(--color-red)";
                simMainStar.style.boxShadow = "0 0 35px var(--color-red)";
                simPlanet.style.opacity = "0.2";
                break;
            case "cold-dark":
            case "no-chemistry":
                universeGlow.style.background = "radial-gradient(circle, rgba(167, 139, 250, 0.15) 0%, transparent 60%)";
                simMainStar.style.transform = "scale(0.75)";
                simMainStar.style.backgroundColor = "var(--color-purple)";
                simMainStar.style.boxShadow = "0 0 15px var(--color-purple)";
                simPlanet.style.opacity = "0.4";
                break;
        }
    }

    slideGravity.addEventListener('input', updateSimulation);
    slideNuclear.addEventListener('input', updateSimulation);
    slideCosmo.addEventListener('input', updateSimulation);
    slideProton.addEventListener('input', updateSimulation);

    btnResetUniverse.addEventListener('click', () => {
        slideGravity.value = "1.0";
        slideNuclear.value = "0.007";
        slideCosmo.value = "1.0";
        slideProton.value = "1.0";
        updateSimulation();
    });

    updateSimulation();
}

/* ==========================================================================
   6. ZONA DE DESAFÍOS: JUEGO 2 (ENSAMBLADOR DEL CÓDIGO GENÉTICO)
   ========================================================================== */
function initDnaAssemblerGame() {
    const btnStart = document.getElementById('btn-start-game');
    const overlay = document.getElementById('game-overlay');
    const requiredDisplay = document.getElementById('required-base');
    const pointsDisplay = document.getElementById('game-points');
    const timerDisplay = document.getElementById('game-timer');
    const accuracyDisplay = document.getElementById('game-accuracy');
    const previewStrand = document.getElementById('strand-preview');
    const baseButtons = document.querySelectorAll('.base-btn');

    if (!btnStart) return;

    let score = 0;
    let timer = 30;
    let hits = 0;
    let totalAttempts = 0;
    let gameActive = false;
    let gameInterval = null;
    let currentRequired = '';
    let currentTarget = '';

    const bases = ['A', 'T', 'C', 'G'];
    const pairings = { 'A': 'T', 'T': 'A', 'C': 'G', 'G': 'C' };

    function pickNewBase() {
        currentRequired = bases[Math.floor(Math.random() * bases.length)];
        currentTarget = pairings[currentRequired];
        requiredDisplay.textContent = currentRequired;
        requiredDisplay.className = 'active-falling-base base-' + currentRequired;
    }

    function startGame() {
        score = 0;
        timer = 30;
        hits = 0;
        totalAttempts = 0;
        gameActive = true;
        
        pointsDisplay.textContent = score;
        timerDisplay.textContent = timer;
        accuracyDisplay.textContent = '100%';
        previewStrand.innerHTML = '';
        overlay.style.display = 'none';

        pickNewBase();

        gameInterval = setInterval(() => {
            timer--;
            timerDisplay.textContent = timer;
            
            if (timer <= 0) {
                endGame();
            }
        }, 1000);
    }

    function handleUserInput(selectedBase) {
        if (!gameActive) return;
        totalAttempts++;
        
        if (selectedBase === currentTarget) {
            score += 10;
            hits++;
            pointsDisplay.textContent = score;

            const node = document.createElement('div');
            node.className = `strand-node base-${selectedBase}`;
            node.textContent = selectedBase;
            previewStrand.appendChild(node);
            previewStrand.scrollLeft = previewStrand.scrollWidth;

            requiredDisplay.style.borderColor = 'var(--color-teal)';
            setTimeout(() => { requiredDisplay.style.borderColor = '#fff'; }, 150);
        } else {
            score = Math.max(0, score - 5);
            pointsDisplay.textContent = score;

            requiredDisplay.style.borderColor = 'var(--color-red)';
            setTimeout(() => { requiredDisplay.style.borderColor = '#fff'; }, 150);
        }

        const accuracy = Math.round((hits / totalAttempts) * 100);
        accuracyDisplay.textContent = accuracy + '%';
        pickNewBase();
    }

    baseButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            handleUserInput(btn.getAttribute('data-base'));
        });
    });

    btnStart.addEventListener('click', startGame);
}

/* ==========================================================================
   7. CONTROLES DE LA UI (Navegación, Pestañas, Responsividad)
   ========================================================================== */
function initUIControls() {
    const header = document.querySelector('.main-header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Menú móvil responsive
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
            if (navLinks.style.display === 'flex') {
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '80px';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.background = 'rgba(6, 6, 15, 0.98)';
                navLinks.style.padding = '2rem';
                navLinks.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
            }
        });
        
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    navLinks.style.display = 'none';
                }
            });
        });
    }

    // Scrollspy activo
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= (sectionTop - 160)) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${current}`) {
                item.classList.add('active');
            }
        });
    });

    // Pestañas de la Zona de Desafíos (Juegos)
    const gameTabs = document.querySelectorAll('.challenge-tab');
    const gameWrappers = document.querySelectorAll('.game-wrapper');

    gameTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            gameTabs.forEach(t => t.classList.remove('active'));
            gameWrappers.forEach(w => w.classList.remove('active'));

            tab.classList.add('active');
            const gameId = tab.getAttribute('data-game');
            const targetGame = document.getElementById(gameId);
            if (targetGame) {
                targetGame.classList.add('active');
            }
        });
    });
}

/* ==========================================================================
   FE Y CIENCIA: ACORDEÓN FAQ + CASILLERO DE PREGUNTAS
   ========================================================================== */
function initFaithScience() {

    /* ---- Acordeón FAQ ---- */
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const btn = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        if (!btn || !answer) return;

        btn.addEventListener('click', () => {
            const isOpen = item.classList.contains('is-open');

            // Cerrar todos los demás — comportamiento acordeón clásico
            faqItems.forEach(other => {
                if (other !== item) {
                    other.classList.remove('is-open');
                    other.querySelector('.faq-answer').style.maxHeight = '0';
                    other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
                }
            });

            if (isOpen) {
                // Cerrar este
                item.classList.remove('is-open');
                answer.style.maxHeight = '0';
                btn.setAttribute('aria-expanded', 'false');
            } else {
                // Abrir este
                item.classList.add('is-open');
                // Calcular altura del contenido interno
                const inner = answer.querySelector('.faq-answer-inner');
                answer.style.maxHeight = (inner ? inner.scrollHeight : answer.scrollHeight) + 32 + 'px';
                btn.setAttribute('aria-expanded', 'true');
            }
        });
    });

    /* ---- Casillero de Preguntas ---- */
    const askForm      = document.getElementById('ask-form');
    const askSuccess   = document.getElementById('ask-success');
    const askResetBtn  = document.getElementById('ask-reset-btn');

    if (askForm && askSuccess) {
        askForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Validación mínima
            const name     = document.getElementById('ask-name');
            const question = document.getElementById('ask-question');

            if (!name.value.trim() || !question.value.trim()) {
                // Sacudir los campos vacíos
                [name, question].forEach(field => {
                    if (!field.value.trim()) {
                        field.style.borderColor = 'rgba(231, 76, 60, 0.6)';
                        field.style.boxShadow   = '0 0 0 3px rgba(231, 76, 60, 0.1)';
                        setTimeout(() => {
                            field.style.borderColor = '';
                            field.style.boxShadow   = '';
                        }, 1800);
                    }
                });
                return;
            }

            // Simular envío con pequeño retraso
            const submitBtn = askForm.querySelector('.ask-submit-btn');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Enviando...';
            }

            setTimeout(() => {
                // Mostrar éxito
                askSuccess.classList.add('visible');
                askSuccess.setAttribute('aria-hidden', 'false');

                // Resetear formulario
                askForm.reset();
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Enviar al Panel de Expertos <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M7 17L17 7M17 7H7M17 7v10"/></svg>';
                }
            }, 900);
        });

        // Botón "Enviar otra pregunta"
        if (askResetBtn) {
            askResetBtn.addEventListener('click', () => {
                askSuccess.classList.remove('visible');
                askSuccess.setAttribute('aria-hidden', 'true');
            });
        }
    }
}

/* ==========================================================================
   CUESTIONARIO Y RESEÑA INTERACTIVOS
   ========================================================================== */
function initQuizAndReviews() {
    // ---- QUIZ LOGIC ----
    const quizQuestions = [
        {
            question: "¿Qué es la \"Complejidad Irreducible\"?",
            options: [
                "Un sistema que puede evolucionar por acumulación de pequeños cambios graduales.",
                "Un sistema compuesto por varias partes interactuantes donde la eliminación de cualquiera de ellas hace que deje de funcionar.",
                "Una estructura biológica extremadamente simple que no requiere calibración."
            ],
            correctIndex: 1,
            verdict: "La Complejidad Irreducible (como en el flagelo bacteriano o el ojo) demuestra que los sistemas biológicos complejos requieren estar completos desde el primer día para funcionar, lo cual desafía el gradualismo darwiniano."
        },
        {
            question: "¿Qué nos muestra el \"Ajuste Fino\" de las constantes del universo?",
            options: [
                "Que el universo está calibrado con una precisión asombrosa para permitir la vida, lo que sugiere un diseñador inteligente.",
                "Que las constantes físicas cambian constantemente a lo largo del tiempo.",
                "Que las leyes físicas son completamente aleatorias y carecen de precisión."
            ],
            correctIndex: 0,
            verdict: "El Ajuste Fino es la calibración exacta de fuerzas fundamentales (como la gravedad o la constante cosmológica) dentro de rangos infinitesimales necesarios para que el universo y la vida orgánica puedan existir."
        },
        {
            question: "¿Cuánta información digital contiene una sola célula humana?",
            options: [
                "El equivalente a unas pocas páginas de un folleto de instrucciones.",
                "El equivalente a aproximadamente 10 libros de ciencia.",
                "El equivalente a 1,000 libros de información codificada de forma compleja."
            ],
            correctIndex: 2,
            verdict: "La información compleja del ADN es comparable a un código de software sumamente sofisticado, y su inmensa densidad digital en cada célula es evidencia directa de un diseño inteligente original."
        }
    ];

    let currentQuestionIdx = 0;
    let score = 0;

    const questionTextEl = document.getElementById('quiz-question-text');
    const optionsGridEl = document.getElementById('quiz-options-grid');
    const progressEl = document.getElementById('quiz-progress');
    const questionCard = document.getElementById('quiz-question-card');
    const resultsCard = document.getElementById('quiz-results-card');
    const scoreEl = document.getElementById('quiz-score');
    const verdictEl = document.getElementById('quiz-verdict');
    const btnRestart = document.getElementById('btn-restart-quiz');

    function renderQuestion() {
        if (!questionTextEl || !optionsGridEl) return;

        const currentQ = quizQuestions[currentQuestionIdx];
        progressEl.textContent = `Pregunta ${currentQuestionIdx + 1} de ${quizQuestions.length}`;
        questionTextEl.textContent = currentQ.question;
        optionsGridEl.innerHTML = '';

        currentQ.options.forEach((optText, idx) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option-btn';
            btn.textContent = optText;
            btn.addEventListener('click', () => handleOptionClick(idx, btn));
            optionsGridEl.appendChild(btn);
        });
    }

    function handleOptionClick(selectedIdx, btnElement) {
        const currentQ = quizQuestions[currentQuestionIdx];
        const optionBtns = optionsGridEl.querySelectorAll('.quiz-option-btn');
        
        // Desactivar clics adicionales
        optionBtns.forEach(btn => btn.disabled = true);

        if (selectedIdx === currentQ.correctIndex) {
            btnElement.classList.add('correct');
            score++;
        } else {
            btnElement.classList.add('incorrect');
            optionBtns[currentQ.correctIndex].classList.add('correct');
        }

        setTimeout(() => {
            currentQuestionIdx++;
            if (currentQuestionIdx < quizQuestions.length) {
                renderQuestion();
            } else {
                showQuizResults();
            }
        }, 1500);
    }

    function showQuizResults() {
        if (!questionCard || !resultsCard || !scoreEl || !verdictEl) return;
        questionCard.style.display = 'none';
        resultsCard.style.display = 'block';
        scoreEl.textContent = `${score} / ${quizQuestions.length}`;

        if (score === quizQuestions.length) {
            verdictEl.textContent = "¡Perfecto! Has comprendido profundamente las huellas del Diseñador en la ciencia.";
            verdictEl.style.color = "var(--color-teal)";
        } else if (score >= 1) {
            verdictEl.textContent = "¡Buen esfuerzo! Entiendes las bases fundamentales, pero te invitamos a repasar las salas del museo.";
            verdictEl.style.color = "var(--color-text-white)";
        } else {
            verdictEl.textContent = "Te recomendamos volver a repasar la información del ADN y el Ajuste Fino en nuestras exposiciones.";
            verdictEl.style.color = "var(--color-text-muted)";
        }
    }

    if (btnRestart) {
        btnRestart.addEventListener('click', () => {
            currentQuestionIdx = 0;
            score = 0;
            if (questionCard && resultsCard) {
                resultsCard.style.display = 'none';
                questionCard.style.display = 'block';
                renderQuestion();
            }
        });
    }

    // Inicializar primera pregunta
    if (questionTextEl) {
        renderQuestion();
    }

    // ---- REVIEWS LOGIC ----
    const starsContainer = document.querySelector('.star-rating');
    const starBtns = document.querySelectorAll('.star-btn');
    const starsInput = document.getElementById('review-stars-val');
    const reviewForm = document.getElementById('review-form');
    const reviewSuccess = document.getElementById('review-success');
    const reviewsBoardList = document.getElementById('reviews-board-list');
    const btnResetReview = document.getElementById('btn-reset-review');

    if (starsContainer && starBtns.length > 0) {
        starBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const rating = parseInt(btn.getAttribute('data-star') || '5', 10);
                if (starsInput) starsInput.value = rating;

                // Actualizar estado de las estrellas
                starBtns.forEach(s => {
                    const sRating = parseInt(s.getAttribute('data-star') || '0', 10);
                    s.classList.toggle('active', sRating <= rating);
                });
            });
        });
    }

    if (reviewForm && reviewSuccess && reviewsBoardList) {
        reviewForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nameVal = document.getElementById('review-name').value.trim();
            const commentVal = document.getElementById('review-comment').value.trim();
            const ratingVal = parseInt(starsInput ? starsInput.value : '5', 10);

            if (!nameVal || !commentVal) return;

            // Simular publicación agregando una tarjeta de reseña
            const starsStr = '★'.repeat(ratingVal) + '☆'.repeat(5 - ratingVal);
            const reviewHtml = `
                <div class="student-review-item reveal revealed" style="animation: scaleUp 0.4s ease-out;">
                    <div class="review-item-header">
                        <strong>${nameVal}</strong>
                        <span class="stars text-amber">${starsStr}</span>
                    </div>
                    <p>"${commentVal}"</p>
                </div>
            `;

            // Agregar al mural al principio de la lista
            reviewsBoardList.insertAdjacentHTML('afterbegin', reviewHtml);
            
            // Ocultar formulario, mostrar éxito
            reviewForm.style.display = 'none';
            reviewSuccess.style.display = 'block';
        });
    }

    if (btnResetReview) {
        btnResetReview.addEventListener('click', () => {
            if (reviewForm && reviewSuccess) {
                reviewSuccess.style.display = 'none';
                reviewForm.style.display = 'flex';
                reviewForm.reset();
                
                // Resetear estrellas a 5
                if (starsInput) starsInput.value = '5';
                starBtns.forEach(s => s.classList.add('active'));
            }
        });
    }
}

