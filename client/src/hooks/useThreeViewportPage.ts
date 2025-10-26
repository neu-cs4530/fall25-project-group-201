import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

// test comment
const useThreeViewportPage = (modelPath: string) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- Scene setup ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    containerRef.current.appendChild(renderer.domElement);

    // --- Lighting ---
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(2, 2, 5);
    scene.add(light);

    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);

    // --- Loader setup ---
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      modelPath,
      (gltf) => {
        const model = gltf.scene;
        scene.add(model);

        // --- Center and scale model ---
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // Center model at origin
        model.position.sub(center);

        // Scale model to fit in a fixed "unit" size
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 1.5 / maxDim; // adjust 1.5 to change how large it appears
        model.scale.setScalar(scale);

        // --- Frame model with camera ---
        const boundingSphere = box.getBoundingSphere(new THREE.Sphere());
        const radius = boundingSphere.radius * scale;

        // Compute distance from camera to fit object in view
        const fov = camera.fov * (Math.PI / 180);
        const cameraZ = radius / Math.sin(fov / 2);

        camera.position.set(0, radius * 0.5, cameraZ * 1.1); // slight offset in Y and Z
        camera.lookAt(0, 0, 0);
      },
      undefined,
      (error) => {
        console.error(`Error loading model (${modelPath}):`, error);
      }
    );

    // --- Handle window resize ---
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect =
        containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        containerRef.current.clientWidth,
        containerRef.current.clientHeight
      );
    };
    window.addEventListener('resize', handleResize);

    // --- Animation loop ---
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // --- Cleanup ---
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      scene.clear();
      dracoLoader.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [modelPath]);

  return { containerRef };
};

export default useThreeViewportPage;
