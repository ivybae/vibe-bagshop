// Three.js scene setup for Vibe Bagshop MD's Pick

console.log('Three.js scene script loaded. Waiting for DOM content.');

document.addEventListener('DOMContentLoaded', () => {
    const canvasContainer = document.getElementById('canvas-container');

    if (canvasContainer && typeof THREE !== 'undefined') {
        console.log('THREE object found, initializing scene.');
        // Scene, Camera, Renderer
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xcccccc); // Set background color for the canvas

        const camera = new THREE.PerspectiveCamera(75, canvasContainer.clientWidth / canvasContainer.clientHeight, 0.1, 1000);
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
        canvasContainer.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7.5);
        scene.add(directionalLight);

        // Placeholder Cube (representing the bag)
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({ color: 0x0077ff }); // Default color
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        // Animation loop
        function animate() {
            requestAnimationFrame(animate);

            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;

            renderer.render(scene, camera);
        }

        animate();

        // Handle window resize
        window.addEventListener('resize', () => {
            camera.aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
        });

        // Expose a function to change bag color (placeholder)
        window.changeBagColor = function(color) {
            if (cube && cube.material) {
                cube.material.color.set(color);
                console.log(`Bag color changed to: ${color}`);
            }
        }

        // Link color buttons from main.js (or directly if preferred)
        const colorButtons = document.querySelectorAll('#md-pick .color-options button');
        colorButtons.forEach(button => {
            button.addEventListener('click', () => {
                const colorValue = button.dataset.color;
                if (window.changeBagColor) {
                    window.changeBagColor(colorValue);
                }
            });
        });

        console.log('Three.js scene initialized with a placeholder cube.');

    } else {
        if (!canvasContainer) {
            console.error('Canvas container #canvas-container not found.');
        }
        if (typeof THREE === 'undefined') {
            console.error('Three.js library not loaded.');
        }
    }
});
