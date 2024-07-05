

import * as THREE from 'three';

import {GLTFLoader}  from 'three/examples/jsm/loaders/GLTFLoader.js';

import init from './init';

import './style.css';

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const { sizes, scene, canvas, controls, renderer } = init();

camera.position.set(0, 3, 10)

const floor = new THREE.Mesh(
	new THREE.PlaneGeometry(30, 30),
	new THREE.MeshStandardMaterial({ 
		color: '#444444', 
		metalness: 0, 
		roughness: 0.5,
	}),
);

floor.receiveShadow = true;
floor.rotation.x = -Math.PI * 0.5;
scene.add(floor)

const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0,61);
hemiLight.position.set(0, 50, 0);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.74);
dirLight.position.set(-8, 12, 8);
dirLight.castShadow=true;
dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
scene.add(dirLight);

const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.74);
dirLight.position.set(8, 12, -8);
dirLight.castShadow=true;
dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
scene.add(dirLight2);

const loader = new GLTFLoader();
let model;

loader.load(
    '/models/nissan/scene.gltf', 
    (gltf) => {
        console.log('succes');
        console.log(gltf);
        model = gltf.scene.children[0];
        scene.add(model);
    },
    undefined,
    (error) => {
        console.error(error);
    }
);

const keyframes = [
	{ scrollPos: 0.10, position: { x: 0, y: 2, z: 9 } },
	{ scrollPos: 0.20, position: { x: 1, y: 3, z: 10 } },
    { scrollPos: 0.40, position: { x: 2, y: 3, z: 10 } },
	{ scrollPos: 0.60, position: { x: 5, y: 4, z: 9 } },
	{ scrollPos: 0.80, position: { x: 4, y: 4, z: 8 } },
	{ scrollPos: 1, position: { x: 3.25, y: 3, z: 3.25 } }
];

// Интерполяция между ключевыми точками
function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}

// Функция для обновления положения камеры
function updateCameraPosition(scrollY, maxScroll) {
    const scrollProgress = scrollY / maxScroll;

    for (let i = 0; i < keyframes.length - 1; i++) {
        const startFrame = keyframes[i];
        const endFrame = keyframes[i + 1];

        if (scrollProgress >= startFrame.scrollPos && scrollProgress <= endFrame.scrollPos) {
            const frameProgress = (scrollProgress - startFrame.scrollPos) / (endFrame.scrollPos - startFrame.scrollPos);

            camera.position.x = lerp(startFrame.position.x, endFrame.position.x, frameProgress);
            camera.position.y = lerp(startFrame.position.y, endFrame.position.y, frameProgress);
            camera.position.z = lerp(startFrame.position.z, endFrame.position.z, frameProgress);
            break;
        }
    }

// Обновляем направление камеры, чтобы она смотрела на модель
if (model) {
	camera.lookAt(model.position);
}
}

// Обработчик скролла
function onScroll() {
    const scrollY = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    updateCameraPosition(scrollY, maxScroll);
}

window.addEventListener('scroll', onScroll);

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();

const tick = () => {
	controls.update();
	renderer.render(scene, camera);
	window.requestAnimationFrame(tick);
};
tick();

/** Базовые обпаботчики событий длы поддержки ресайза */
window.addEventListener('resize', () => {
	// Обновляем размеры
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Обновляем соотношение сторон камеры
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Обновляем renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	renderer.render(scene, camera);
});

// Обработка изменения размеров окна
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
