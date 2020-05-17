import * as THREE from '/build/three.module.js';
import { OrbitControls } from '/jsm/controls/OrbitControls';
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.translateZ(1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
const createRunway = (scene) => {
    let runwayLength = 100;
    let runwayWidth = 15;
    const geometry = new THREE.BoxGeometry(runwayWidth, 1, runwayLength);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    const runway = new THREE.Mesh(geometry, material);
    runway.translateZ(-runwayLength / 2);
    runway.rotation.x += 0.2;
    scene.add(runway);
    // Create line on runway
    var lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
    var points = [];
    points.push(new THREE.Vector3(-7.5, -8, -7.5));
    points.push(new THREE.Vector3(7.5, -8, -7.5));
    var lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    var line = new THREE.Line(lineGeometry, lineMaterial);
    scene.add(line);
};
createRunway(scene);
camera.position.z = 11;
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}
let startTime = Date.now() / 1000;
let currentCubes = [];
let points = 0;
let isPressed = [false, false, false, false, false];
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case "1":
            isPressed[0] = true;
            break;
        case "2":
            isPressed[1] = true;
            break;
        case "3":
            isPressed[2] = true;
            break;
        case "4":
            isPressed[3] = true;
            break;
        case "5":
            isPressed[4] = true;
    }
});
document.addEventListener('keyup', (event) => {
    switch (event.key) {
        case "1":
            isPressed[0] = false;
            break;
        case "2":
            isPressed[1] = false;
            break;
        case "3":
            isPressed[2] = false;
            break;
        case "4":
            isPressed[3] = false;
            break;
        case "5":
            isPressed[4] = false;
    }
});
var animate = function () {
    requestAnimationFrame(animate);
    const currentTime = Date.now() / 1000;
    const oneSecondHasPassed = currentTime > startTime + 1;
    if (oneSecondHasPassed) {
        startTime = currentTime;
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
        const cube = new THREE.Mesh(geometry, material);
        cube.translateZ(-75);
        cube.translateY(6);
        const positions = [-6, -3, 0, 3, 6];
        const randomPosition = Math.floor(Math.random() * 5);
        cube.translateX(positions[randomPosition]);
        cube.rotation.x += 0.2;
        currentCubes.push({ cube, lane: randomPosition });
        scene.add(cube);
    }
    currentCubes.forEach((cubeData) => {
        if (cubeData.cube.position.z >= 0) {
            scene.remove(cubeData.cube);
        }
        else {
            if (cubeData.cube.position.z < -7 &&
                cubeData.cube.position.z > -8 &&
                isPressed[cubeData.lane]) {
                points++;
                console.log({ points });
                document.getElementById("points").innerHTML = points.toString();
            }
            cubeData.cube.translateZ(0.3);
        }
    });
    controls.update();
    render();
};
function render() {
    renderer.render(scene, camera);
}
animate();
