// Three.js scene setup for Vibe Bagshop MD's Pick

console.log('Three.js scene script loaded. Waiting for DOM content.');

document.addEventListener('DOMContentLoaded', () => {
    const canvasContainer = document.getElementById('canvas-container');
    let model;

    if (canvasContainer && typeof THREE !== 'undefined' && typeof THREE.GLTFLoader !== 'undefined' && typeof THREE.OrbitControls !== 'undefined') {
        console.log('THREE, GLTFLoader, and OrbitControls found, initializing scene.');
        
        // Scene, Camera, Renderer
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xe9ecef); // Match CSS background
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.outputEncoding = THREE.sRGBEncoding; // For accurate colors with GLTF
        canvasContainer.appendChild(renderer.domElement);

        camera = new THREE.PerspectiveCamera(50, canvasContainer.clientWidth / canvasContainer.clientHeight, 0.1, 1000);
        camera.position.set(2, 1.5, 3); // Adjusted camera position for a typical model view

        // Controls
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
        controls.dampingFactor = 0.05;
        controls.screenSpacePanning = false;
        controls.minDistance = 1;
        controls.maxDistance = 10;
        // controls.maxPolarAngle = Math.PI / 2; // Prevent looking from below

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7.5);
        directionalLight.castShadow = true; // If you want shadows
        scene.add(directionalLight);

        const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.5);
        scene.add(hemisphereLight);

        // GLTF Loader
        const loader = new THREE.GLTFLoader();
        loader.load(
            'assets/briefcase.glb',
            function (gltf) {
                model = gltf.scene;
                console.log('GLTF model loaded:', model);

                // Optional: Scale and position the model if needed
                // model.scale.set(0.1, 0.1, 0.1);
                // model.position.y = -0.5; 

                // Center the model and adjust camera
                const box = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                model.position.sub(center); // Center model at origin
                
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                const fov = camera.fov * (Math.PI / 180);
                let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
                cameraZ *= 1.5; // Add some padding
                camera.position.z = cameraZ;
                camera.position.y = size.y / 2; // Look at the center of the model height

                controls.target.copy(model.position); // Ensure controls target the model center
                controls.update();

                scene.add(model);
                console.log('Model added to scene.');
            },
            function (xhr) {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            function (error) {
                console.error('An error happened during GLTF loading:', error);
                // Display an error message in the canvas
                const errorMsg = document.createElement('p');
                errorMsg.textContent = 'Error loading 3D model. Please check console.';
                errorMsg.style.color = 'red';
                errorMsg.style.textAlign = 'center';
                canvasContainer.innerHTML = ''; // Clear previous content
                canvasContainer.appendChild(errorMsg);
            }
        );

        // Animation loop
        function animate() {
            requestAnimationFrame(animate);
            controls.update(); // only required if controls.enableDamping or controls.autoRotate are set to true
            renderer.render(scene, camera);
        }

        animate();

        // Handle window resize
        window.addEventListener('resize', () => {
            camera.aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
        });

        // Expose a function to change bag color
        // This will need to be adjusted based on the actual GLTF model structure
        window.changeBagColor = function(color) {
            if (model) {
                model.traverse((child) => {
                    if (child.isMesh) {
                        // This is a basic implementation. You might need to target specific meshes
                        // or materials by name if the model is complex.
                        if (child.material && child.material.isMeshStandardMaterial) {
                            child.material.color.set(color);
                            console.log(`Changed color of mesh '${child.name}' to: ${color}`);
                        } else if (Array.isArray(child.material)) {
                            child.material.forEach(mat => {
                                if (mat.isMeshStandardMaterial) mat.color.set(color);
                            });
                            console.log(`Changed color of multi-material mesh '${child.name}' to: ${color}`);
                        } else {
                            console.warn(`Mesh '${child.name}' does not have a standard material or material array to change color.`);
                        }
                    }
                });
            } else {
                console.warn('Model not loaded yet, cannot change color.');
            }
        }

        // Link color buttons (already in main.js, but can be re-linked here if preferred)
        // Ensure main.js calls window.changeBagColor

        console.log('Three.js scene initialized for GLTF model.');

    } else {
        let errorText = '';
        if (!canvasContainer) errorText += 'Canvas container #canvas-container not found. ';
        if (typeof THREE === 'undefined') errorText += 'Three.js library not loaded. ';
        if (typeof THREE.GLTFLoader === 'undefined') errorText += 'GLTFLoader not loaded. ';
        if (typeof THREE.OrbitControls === 'undefined') errorText += 'OrbitControls not loaded. ';
        console.error(errorText);
        if(canvasContainer) canvasContainer.textContent = 'Error initializing 3D viewer: ' + errorText;
    }
});
