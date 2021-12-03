import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Water } from 'three/examples/jsm/objects/Water.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as dat from 'dat.gui';

let camera, scene, renderer;
let controls, water, sun;
let currentPos = 0;

const canvas = document.querySelector('canvas.webgl');
// const gui = new dat.GUI();

const loader = new GLTFLoader();

class Boat {
  constructor() {
    loader.load('assets/boat/scene.gltf', (gltf) => {
      scene.add(gltf.scene);
      gltf.scene.scale.set(0.005, 0.005, 0.005);
      gltf.scene.position.set(15, 6, 0);
      this.boat = gltf.scene;

      // const shipPos = gui.addFolder('shipPos');
      // shipPos.add(gltf.scene.position, 'x').min(-1000).max(1000).step(0.1);
      // shipPos.add(gltf.scene.position, 'y').min(-1000).max(1000).step(0.1);
      // shipPos.add(gltf.scene.position, 'z').min(-1000).max(1000).step(0.1);
      // shipPos.open();

      // const shipRot = gui.addFolder('shipRot');
      // shipRot.add(gltf.scene.rotation, 'x').min(0).max(1000).step(0.1);
      // shipRot.add(gltf.scene.rotation, 'y').min(0).max(1000).step(0.1);
      // shipRot.add(gltf.scene.rotation, 'z').min(0).max(1000).step(0.1);
      // shipRot.open();
    });
  }

  update() {
    if (this.boat) {
      console.log(this.boat.rotation.y);
      this.boat.rotation.y = -0.5 + currentPos;
      this.boat.position.z -= 0.5;
    }
  }
}

const boat = new Boat();

init();
animate();

async function init() {
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    1,
    20000
  );
  camera.position.set(0,30, 100);
  // const cameraPos = gui.addFolder('cameraPos');
  // cameraPos.add(camera.position, 'x').min(-1000).max(1000).step(0.1);
  // cameraPos.add(camera.position, 'y').min(-1000).max(1000).step(0.1);
  // cameraPos.add(camera.position, 'z').min(-1000).max(1000).step(0.1);
  // cameraPos.open();

  // const cameraRot = gui.addFolder('cameraRot');
  // cameraRot.add(camera.rotation, 'x').min(0).max(1000).step(0.1);
  // cameraRot.add(camera.rotation, 'y').min(0).max(1000).step(0.1);
  // cameraRot.add(camera.rotation, 'z').min(0).max(1000).step(0.1);
  // cameraRot.open();

  sun = new THREE.Vector3();

  // Water

  const waterGeometry = new THREE.PlaneGeometry(10000, 10000);

  water = new Water(waterGeometry, {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: new THREE.TextureLoader().load(
      'assets/waternormals.jpg',
      function (texture) {
        texture.repeat.set(512, 512);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }
    ),
    sunDirection: new THREE.Vector3(),
    sunColor: 0xffffff,
    waterColor: 0x001e0f,
    distortionScale: 3.7,
    fog: scene.fog !== undefined,
  });

  water.rotation.x = -Math.PI / 2;

  scene.add(water);

  // Skybox

  const sky = new Sky();
  sky.scale.setScalar(10000);
  scene.add(sky);

  const skyUniforms = sky.material.uniforms;

  skyUniforms['turbidity'].value = 10;
  skyUniforms['rayleigh'].value = 2;
  skyUniforms['mieCoefficient'].value = 0.005;
  skyUniforms['mieDirectionalG'].value = 0.8;

  const parameters = {
    elevation: 2,
    azimuth: 180,
  };

  const pmremGenerator = new THREE.PMREMGenerator(renderer);

  function updateSun() {
    const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
    const theta = THREE.MathUtils.degToRad(parameters.azimuth);

    sun.setFromSphericalCoords(1, phi, theta);

    sky.material.uniforms['sunPosition'].value.copy(sun);
    water.material.uniforms['sunDirection'].value.copy(sun).normalize();

    scene.environment = pmremGenerator.fromScene(sky).texture;
  }

  updateSun();

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;
  controls.enableRotate = false;
  controls.enablePan = false;
  controls.update();

  window.addEventListener('resize', onWindowResize);

  window.addEventListener('mousemove', function (e) {
    currentPos = e.pageX / 1000;
  });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  render();
  boat.update();
  camera.position.z -= 0.5;
}

function render() {
  water.material.uniforms['time'].value += 1.0 / 60.0;
  renderer.render(scene, camera);
}
