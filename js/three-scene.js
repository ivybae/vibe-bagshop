// Three.js scene setup for Vibe Bagshop MD's Pick
console.log('Three.js scene script loaded. Waiting for DOM content.');

document.addEventListener('DOMContentLoaded', () => {
    const canvasContainer = document.getElementById('canvas-container');
    const prevModelButton = document.getElementById('prev-model');
    const nextModelButton = document.getElementById('next-model');
    const currentModelNameDisplay = document.getElementById('current-model-name');

    let scene, camera, renderer, controls, currentModel;

    const models = [
        { name: 'Briefcase', path: 'assets/briefcase.glb' },
        { name: 'Cross Bag', path: 'assets/crossbag.glb' },
        { name: 'Woman Bag', path: 'assets/womanbag.glb' }
    ];
    let currentModelIndex = 0;

    if (canvasContainer && typeof THREE !== 'undefined' && typeof THREE.GLTFLoader !== 'undefined' && typeof THREE.OrbitControls !== 'undefined') {
        console.log('THREE, GLTFLoader, and OrbitControls found, initializing scene.');
        initScene();
        loadModel(currentModelIndex);
        setupCarouselControls();
    } else {
        handleInitError();
    }

    function initScene() {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xe9ecef);

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.outputEncoding = THREE.sRGBEncoding;
        canvasContainer.appendChild(renderer.domElement);

        camera = new THREE.PerspectiveCamera(50, canvasContainer.clientWidth / canvasContainer.clientHeight, 0.1, 1000);
        camera.position.set(2, 1.5, 3); // Initial position, will be adjusted by loadModel

        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 0.5; // Adjusted minDistance
        controls.maxDistance = 20;  // Adjusted maxDistance

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
        directionalLight.position.set(5, 10, 7.5);
        scene.add(directionalLight);
        const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.6);
        scene.add(hemisphereLight);

        window.addEventListener('resize', onWindowResize);
        animate();
    }

    function loadModel(index) {
        if (currentModel) {
            scene.remove(currentModel);
            // Dispose of old model's geometry and material if necessary to free up memory
            // currentModel.traverse(child => { ... });
        }

        const modelInfo = models[index];
        if (!modelInfo) {
            console.error('Invalid model index:', index);
            return;
        }

        currentModelNameDisplay.textContent = 'Loading...';
        prevModelButton.disabled = true;
        nextModelButton.disabled = true;

        const loader = new THREE.GLTFLoader();
        loader.load(
            modelInfo.path,
            (gltf) => {
                currentModel = gltf.scene;
                console.log(`GLTF model '${modelInfo.name}' loaded:`, currentModel);

                const box = new THREE.Box3().setFromObject(currentModel);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());

                currentModel.position.sub(center); // Center model at origin

                const maxDim = Math.max(size.x, size.y, size.z);
                const fov = camera.fov * (Math.PI / 180);
                let cameraZ = Math.abs(maxDim / 1.5 / Math.tan(fov / 2)); // Adjust divisor for closer/further view
                cameraZ = Math.max(cameraZ, maxDim); // Ensure camera is not too close
                
                camera.position.set(0, 0 , cameraZ * 1.2); // Position camera, Y set to 0 initially
                camera.lookAt(0,0,0); // Look at the model's origin

                controls.target.set(0, 0, 0); // Set orbit controls target to model's origin
                controls.update();

                // Adjust material properties for specific models
                if (modelInfo.name === 'Cross Bag') {
                    currentModel.traverse((child) => {
                        if (child.isMesh && child.material) {
                            const materials = Array.isArray(child.material) ? child.material : [child.material];
                            materials.forEach(mat => {
                                if (mat.isMeshStandardMaterial) {
                                    mat.metalness *= 0.5; // Reduce metalness to make it less shiny/bright
                                    mat.roughness = Math.min(1.0, mat.roughness + 0.3); // Increase roughness
                                }
                            });
                        }
                    });
                } else if (modelInfo.name === 'Woman Bag') {
                    currentModel.traverse((child) => {
                        if (child.isMesh && child.material) {
                            const materials = Array.isArray(child.material) ? child.material : [child.material];
                            materials.forEach(mat => {
                                if (mat.isMeshStandardMaterial) {
                                    mat.roughness *= 0.6; // Decrease roughness to make it a bit shinier
                                    // If still too dark, consider a slight color boost:
                                    // mat.color.multiplyScalar(1.1);
                                }
                            });
                        }
                    });
                }

                scene.add(currentModel);
                console.log(`Model '${modelInfo.name}' added to scene.`);
                currentModelNameDisplay.textContent = modelInfo.name;
                updateCarouselButtons();
            },
            (xhr) => {
                console.log(`${modelInfo.name}: ${(xhr.loaded / xhr.total * 100).toFixed(2)}% loaded`);
            },
            (error) => {
                console.error(`An error happened during GLTF loading for ${modelInfo.name}:`, error);
                currentModelNameDisplay.textContent = `Error: ${modelInfo.name}`;
                canvasContainer.innerHTML = `<p style="color:red; text-align:center;">Error loading ${modelInfo.name}.</p>`;
                updateCarouselButtons();
            }
        );
    }

    function setupCarouselControls() {
        prevModelButton.addEventListener('click', () => {
            currentModelIndex = (currentModelIndex - 1 + models.length) % models.length;
            loadModel(currentModelIndex);
        });

        nextModelButton.addEventListener('click', () => {
            currentModelIndex = (currentModelIndex + 1) % models.length;
            loadModel(currentModelIndex);
        });
        updateCarouselButtons(); // Initial button state
    }
    
    function updateCarouselButtons() {
        // prevModelButton.disabled = currentModelIndex === 0;
        // nextModelButton.disabled = currentModelIndex === models.length - 1;
        // Enable both buttons for circular carousel
        prevModelButton.disabled = false;
        nextModelButton.disabled = false;
    }

    function animate() {
        requestAnimationFrame(animate);
        if (controls) controls.update();
        if (renderer && scene && camera) renderer.render(scene, camera);
    }

    function onWindowResize() {
        if (camera && renderer && canvasContainer) {
            camera.aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
        }
    }

    window.changeBagColor = function(color) {
        if (currentModel) {
            currentModel.traverse((child) => {
                if (child.isMesh) {
                    if (child.material && child.material.isMeshStandardMaterial) {
                        child.material.color.set(color);
                    } else if (Array.isArray(child.material)) {
                        child.material.forEach(mat => {
                            if (mat.isMeshStandardMaterial) mat.color.set(color);
                        });
                    }
                }
            });
        } else {
            console.warn('Model not loaded yet, cannot change color.');
        }
    };

    function handleInitError() {
        let errorText = '';
        if (!canvasContainer) errorText += 'Canvas container #canvas-container not found. ';
        if (typeof THREE === 'undefined') errorText += 'Three.js library not loaded. ';
        if (typeof THREE.GLTFLoader === 'undefined') errorText += 'GLTFLoader not loaded. ';
        if (typeof THREE.OrbitControls === 'undefined') errorText += 'OrbitControls not loaded. ';
        console.error(errorText);
        if (canvasContainer) canvasContainer.innerHTML = `<p style="color:red; text-align:center;">Error initializing 3D viewer: ${errorText}</p>`;
    }

    console.log('Three.js scene script initialized for GLTF carousel.');
});
