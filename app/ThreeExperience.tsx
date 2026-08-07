'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

interface ThreeExperienceProps {
  techs: string[];
  onTechClick?: (tech: string) => void;
}

export default function ThreeExperience({ techs, onTechClick }: ThreeExperienceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredTech, setHoveredTech] = useState<string | null>(null);
  const hoveredTechRef = useRef<string | null>(null);

  useEffect(() => {
    hoveredTechRef.current = hoveredTech;
  }, [hoveredTech]);

  const createLabelTexture = useCallback((text: string, color: string, isMobile: boolean) => {
    const canvas = document.createElement('canvas');
    const scale = isMobile ? 4 : 8;
    canvas.width = 512 * (scale / 2);
    canvas.height = 128 * (scale / 2);

    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const pad = 32 * scale;
    ctx.font = `800 ${18 * scale}px "Inter", -apple-system, sans-serif`;
    const textWidth = ctx.measureText(text).width;
    const pillWidth = Math.max(textWidth + pad, 200 * scale);
    const pillHeight = 48 * scale;
    const x = (canvas.width - pillWidth) / 2;
    const y = (canvas.height - pillHeight) / 2;

    const grad = ctx.createLinearGradient(x, y, x, y + pillHeight);
    grad.addColorStop(0, 'rgba(15, 23, 42, 0.98)');
    grad.addColorStop(1, 'rgba(2, 6, 23, 0.98)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, y, pillWidth, pillHeight, 24 * scale);
    ctx.fill();

    ctx.strokeStyle = color;
    ctx.lineWidth = 3 * scale;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12 * scale;
    ctx.beginPath();
    ctx.roundRect(x, y, pillWidth, pillHeight, 24 * scale);
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 2 * scale);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;

    return texture;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth;
    let height = container.clientHeight;
    let isMobile = width < 768;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.06);

    const camera = new THREE.PerspectiveCamera(
      isMobile ? 36 : 26,
      width / height,
      0.1,
      100
    );

    // Positionnement caméra zoomé par défaut pour un rendu net
    const updateCameraPosition = (mobile: boolean) => {
      if (mobile) {
        camera.position.set(0, 3.8, 6.2);
      } else {
        camera.position.set(3.4, 2.6, 4.6);
      }
    };
    updateCameraPosition(isMobile);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      stencil: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // Studio IBL
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const roomScene = new THREE.Scene();
    const lightBox = new THREE.Mesh(
      new THREE.BoxGeometry(14, 14, 14),
      new THREE.MeshBasicMaterial({ color: 0x0f172a, side: THREE.BackSide })
    );
    roomScene.add(lightBox);
    const envTexture = pmremGenerator.fromScene(roomScene).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();
    lightBox.geometry.dispose();

    // Post-Processing
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    let ssaoPass: SSAOPass | null = null;
    if (!isMobile) {
      ssaoPass = new SSAOPass(scene, camera, width, height);
      ssaoPass.kernelRadius = 0.35;
      ssaoPass.minDistance = 0.001;
      ssaoPass.maxDistance = 0.1;
      composer.addPass(ssaoPass);
    }

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      0.15,
      0.4,
      0.85
    );
    composer.addPass(bloomPass);
    composer.addPass(new OutputPass());

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.04;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.6;
    controls.enableZoom = true;
    controls.minDistance = 2.5;
    controls.maxDistance = 10;
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.minPolarAngle = Math.PI / 6;
    controls.target.set(0, 0.4, 0);

    // Éclairage
    const ambientLight = new THREE.AmbientLight(0x020617, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.0);
    keyLight.position.set(5, 7, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.bias = -0.00005;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    fillLight.position.set(-6, 4, -3);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0x818cf8, 4, 12);
    rimLight.position.set(0, 3, -4);
    scene.add(rimLight);

    // Particles
    const particleCount = isMobile ? 60 : 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 14;
      particlePos[i + 1] = Math.random() * 6;
      particlePos[i + 2] = (Math.random() - 0.5) * 14;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.025,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Bureau
    const deskGroup = new THREE.Group();
    const deskMat = new THREE.MeshPhysicalMaterial({
      color: 0x090d16,
      roughness: 0.2,
      metalness: 0.8,
      clearcoat: 0.5,
      clearcoatRoughness: 0.1,
    });
    const desk = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.14, 4.2), deskMat);
    desk.receiveShadow = true;
    desk.castShadow = true;
    deskGroup.add(desk);

    const ledStrip = new THREE.Mesh(
      new THREE.BoxGeometry(7.1, 0.02, 0.02),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    ledStrip.position.set(0, -0.07, 2.09);
    deskGroup.add(ledStrip);

    const deskPad = new THREE.Mesh(
      new THREE.BoxGeometry(6.2, 0.01, 2.8),
      new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.8, metalness: 0.1 })
    );
    deskPad.position.set(0, 0.075, 0.3);
    deskPad.receiveShadow = true;
    deskGroup.add(deskPad);

    const legMat = new THREE.MeshStandardMaterial({ color: 0x020617, metalness: 0.9, roughness: 0.2 });
    const legLeft = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.4, 3.8), legMat);
    legLeft.position.set(-3.4, -0.7, 0);
    const legRight = legLeft.clone();
    legRight.position.x = 3.4;
    deskGroup.add(legLeft, legRight);

    scene.add(deskGroup);

    // Écran
    const screenGroup = new THREE.Group();
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.3, metalness: 0.85 });

    const standBase = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.03, 0.6), frameMat);
    standBase.position.set(0, 0.08, -0.6);
    const standArm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.9, 16), frameMat);
    standArm.position.set(0, 0.48, -0.7);
    standArm.rotation.x = -0.1;
    screenGroup.add(standBase, standArm);

    const screenWidth = isMobile ? 3.6 : 3.4;
    const screenHeight = isMobile ? 1.7 : 1.6;

    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(screenWidth + 0.08, screenHeight + 0.08, 0.05),
      frameMat
    );
    frame.position.set(0, 1.25, -0.6);
    frame.castShadow = true;
    screenGroup.add(frame);

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    const screenTexture = new THREE.CanvasTexture(canvas);

    const screenMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(screenWidth, screenHeight),
      new THREE.MeshBasicMaterial({ map: screenTexture })
    );
    screenMesh.position.set(0, 1.25, -0.57);
    screenGroup.add(screenMesh);

    const updateScreenLayout = (mobile: boolean) => {
      if (mobile) {
        screenGroup.position.set(0, 0.2, -0.2);
        screenGroup.rotation.y = 0;
      } else {
        screenGroup.position.set(-1.4, 0, -0.2);
        screenGroup.rotation.y = 0.18;
      }
    };
    updateScreenLayout(isMobile);
    scene.add(screenGroup);

    let lastCodeDraw = 0;
    const drawScreenContent = (time: number) => {
      if (time - lastCodeDraw < 0.05) return;
      lastCodeDraw = time;

      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, canvas.width, 40);
      ctx.fillStyle = '#f87171'; ctx.beginPath(); ctx.arc(20, 20, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(40, 20, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#34d399'; ctx.beginPath(); ctx.arc(60, 20, 6, 0, Math.PI * 2); ctx.fill();

      const lines = [
        { text: 'import { StudioEngine } from "@three/core";', color: '#f472b6' },
        { text: 'import { Physics, Lighting } from "@studio/pbr";', color: '#f472b6' },
        { text: '', color: '' },
        { text: 'export default function Experience() {', color: '#38bdf8' },
        { text: '  const engine = useThree({ quality: "ultra" });', color: '#38bdf8' },
        { text: '  const lighting = new Lighting({ bloom: 0.3 });', color: '#a78bfa' },
        { text: '', color: '' },
        { text: '  // Active Tech Stack Pipeline', color: '#475569' },
        { text: '  return <Canvas fps={60} interactive={true} />;', color: '#34d399' },
        { text: '}', color: '#38bdf8' },
      ];

      ctx.font = '500 22px "JetBrains Mono", monospace';
      lines.forEach((line, index) => {
        if (line.text) {
          ctx.fillStyle = line.color;
          ctx.fillText(line.text, 50, 80 + index * 38);
        }
      });

      if (Math.floor(time * 2.5) % 2 === 0) {
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(50 + ctx.measureText('  return <Canvas fps={60} interactive={true} />;').width + 4, 362, 10, 24);
      }

      screenTexture.needsUpdate = true;
    };

    // Tech Objects
    const techGroup = new THREE.Group();
    const techMeshes: THREE.Mesh[] = [];
    const techSprites: THREE.Sprite[] = [];
    const basePositions: THREE.Vector3[] = [];

    const palette = [0x38bdf8, 0xc084fc, 0xf43f5e, 0x34d399, 0xfbbf24, 0x818cf8];

    const updateTechPositions = (mobile: boolean) => {
      techMeshes.forEach((mesh, i) => {
        const phi = i * 0.85;
        const radiusScale = mobile ? 0.75 : 1.15;
        const radius = Math.log(i + 2) * radiusScale;

        const centerX = mobile ? 0 : 1.2;
        const centerZ = mobile ? 0.3 : 0.2;

        const posX = centerX + radius * Math.cos(phi);
        const posZ = centerZ + radius * Math.sin(phi);
        const posY = 0.35 + Math.sin(phi * 1.5) * 0.15;

        const pos = new THREE.Vector3(posX, posY, posZ);
        basePositions[i].copy(pos);
        mesh.position.copy(pos);

        if (techSprites[i]) {
          techSprites[i].position.set(pos.x, pos.y + 0.38, pos.z);
        }
      });
    };

    techs.forEach((tech, i) => {
      const color = palette[i % palette.length];
      let geo: THREE.BufferGeometry;

      switch (i % 4) {
        case 0: geo = new THREE.IcosahedronGeometry(0.17, 0); break;
        case 1: geo = new THREE.TorusGeometry(0.13, 0.045, 16, 32); break;
        case 2: geo = new THREE.CylinderGeometry(0.11, 0.11, 0.24, 16); break;
        default: geo = new THREE.OctahedronGeometry(0.17, 0); break;
      }

      const mat = new THREE.MeshPhysicalMaterial({
        color: color,
        metalness: 0.1,
        roughness: 0.1,
        transmission: 0.75,
        thickness: 0.8,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        emissive: color,
        emissiveIntensity: 0.2,
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { tech, originalColor: color, index: i };

      basePositions.push(new THREE.Vector3());
      techGroup.add(mesh);
      techMeshes.push(mesh);

      const spriteMat = new THREE.SpriteMaterial({
        map: createLabelTexture(tech, '#' + color.toString(16).padStart(6, '0'), isMobile),
        transparent: true,
        depthTest: false,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(1.4, 0.35, 1);
      techGroup.add(sprite);
      techSprites.push(sprite);
    });

    updateTechPositions(isMobile);
    scene.add(techGroup);

    // Raycasting & Pointer Events
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const handlePointerMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(techMeshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        if (hoveredTechRef.current !== hit.userData.tech) {
          setHoveredTech(hit.userData.tech);
          document.body.style.cursor = 'pointer';
        }
      } else if (hoveredTechRef.current !== null) {
        setHoveredTech(null);
        document.body.style.cursor = 'default';
      }
    };

    const handlePointerLeave = () => {
      setHoveredTech(null);
      document.body.style.cursor = 'default';
    };

    const handlePointerDown = () => {
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(techMeshes);
      if (intersects.length > 0 && onTechClick) {
        onTechClick(intersects[0].object.userData.tech);
      }
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('pointermove', handlePointerMove);
    domElement.addEventListener('pointerleave', handlePointerLeave);
    domElement.addEventListener('pointerdown', handlePointerDown);

    // Responsive Handling
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w === 0 || h === 0) return;

        const mobileState = w < 768;
        if (mobileState !== isMobile) {
          isMobile = mobileState;
          updateCameraPosition(isMobile);
          updateScreenLayout(isMobile);
          updateTechPositions(isMobile);
        }

        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        composer.setSize(w, h);
        if (ssaoPass) ssaoPass.setSize(w, h);
      }
    });

    resizeObserver.observe(container);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      const t = clock.getElapsedTime();

      drawScreenContent(t);

      const positions = particles.geometry.attributes.position.array as Float32Array;
      for (let i = 1; i < particleCount * 3; i += 3) {
        positions[i] += Math.sin(t * 0.5 + i) * 0.0012;
        if (positions[i] > 6) positions[i] = 0;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      techMeshes.forEach((mesh, index) => {
        const isHovered = mesh.userData.tech === hoveredTechRef.current;
        const mat = mesh.material as THREE.MeshPhysicalMaterial;

        mesh.rotation.x = t * 0.35 + index;
        mesh.rotation.y = t * 0.45 + index;

        const floatY = Math.sin(t * 2 + index) * 0.025;
        const targetY = basePositions[index].y + floatY + (isHovered ? 0.12 : 0);

        mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, targetY, 0.08);
        mesh.scale.setScalar(THREE.MathUtils.lerp(mesh.scale.x, isHovered ? 1.25 : 1.0, 0.08));

        mat.emissiveIntensity = THREE.MathUtils.lerp(
          mat.emissiveIntensity,
          isHovered ? 0.65 : 0.2,
          0.08
        );

        if (techSprites[index]) {
          techSprites[index].position.y = mesh.position.y + 0.38;
          techSprites[index].scale.setScalar(
            THREE.MathUtils.lerp(techSprites[index].scale.x, isHovered ? 1.25 : 1.1, 0.08)
          );
        }
      });

      controls.update();
      composer.render();
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      domElement.removeEventListener('pointermove', handlePointerMove);
      domElement.removeEventListener('pointerleave', handlePointerLeave);
      domElement.removeEventListener('pointerdown', handlePointerDown);

      controls.dispose();
      composer.dispose();
      renderer.dispose();

      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Sprite || object instanceof THREE.Points) {
          object.geometry?.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((mat) => mat.dispose());
          } else if (object.material) {
            object.material.dispose();
          }
        }
      });

      if (domElement.parentNode) {
        domElement.parentNode.removeChild(domElement);
      }
    };
  }, [techs, onTechClick, createLabelTexture]);

  return (
    <div ref={containerRef} className="h-full w-full relative overflow-hidden bg-slate-950 select-none touch-none">
      {hoveredTech && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-sky-400/40 backdrop-blur-xl px-6 py-2.5 rounded-full text-sm font-sans font-semibold text-sky-300 shadow-[0_0_30px_rgba(56,189,248,0.25)] pointer-events-none z-20 flex items-center gap-3 transition-all duration-300 animate-in fade-in zoom-in-95">
          <span className="h-2 w-2 rounded-full bg-sky-400 animate-ping" />
          <span>{hoveredTech}</span>
        </div>
      )}

      <div className="absolute top-5 left-5 z-20 flex items-center gap-2.5 border border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[0.7rem] font-mono tracking-widest text-slate-300 shadow-xl pointer-events-none">
        <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
        SYSTEM ONLINE
      </div>
    </div>
  );
}