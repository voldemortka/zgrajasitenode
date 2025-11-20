console.log("OK");
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.146.0/build/three.module.js';

// 1. Tworzenie sceny
const scene = new THREE.Scene();
console.log(scene);

// 2. Kamera
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 5); // Początkowa pozycja kamery

// 3. Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight); // Renderowanie na pełny ekran
document.body.appendChild(renderer.domElement); // Dodanie renderera do strony

// 4. Geometria (kształt)
const geometry = new THREE.BoxGeometry(1, 1, 1); // Sześcian o wymiarach 1x1x1

// 5. Materiał (kolor)
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // Zielony kolor

// 6. Siatka (obiekt 3D)
const cube = new THREE.Mesh(geometry, material);
cube.position.set(-2, 0, 0); // Ustawienie sześcianu na lewo (oś X = -2, Y = 0, Z = 0)
scene.add(cube); // Dodanie sześcianu do sceny

// 7. Krawędzie sześcianu
const edges = new THREE.EdgesGeometry(geometry); // Tworzymy krawędzie sześcianu
const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 }); // Czarne krawędzie
const line = new THREE.LineSegments(edges, edgeMaterial); // Linie reprezentujące krawędzie
scene.add(line); // Dodanie krawędzi do sceny

// 8. Skalowanie sześcianu (zmniejszamy jego rozmiar)
cube.scale.set(0.5, 0.5, 0.5); // Zmniejszenie sześcianu do połowy jego rozmiaru

// 9. Nasłuchiwanie zdarzeń klawiatury
let angle = 0; // Kąt dookoła sześcianu

document.addEventListener('keydown', (event) => {
  // Ruch kamery (strzałki)
  if (event.key === 'ArrowUp') {
    camera.position.x += Math.sin(angle) * 0.1;
    camera.position.z += Math.cos(angle) * 0.1;
  } 
  else if (event.key === 'ArrowDown') {
    camera.position.x -= Math.sin(angle) * 0.1;
    camera.position.z -= Math.cos(angle) * 0.1;
  }
  else if (event.key === 'ArrowLeft') {
    angle -= 0.1;
    camera.position.x = Math.sin(angle) * 5;
    camera.position.z = Math.cos(angle) * 5;
  }
  else if (event.key === 'ArrowRight') {
    angle += 0.1;
    camera.position.x = Math.sin(angle) * 5;
    camera.position.z = Math.cos(angle) * 5;
  }

  // Ruch sześcianu (WSAD) - tylko przesuwanie w 2D
  if (event.key === 'w' || event.key === 'W') {
    cube.position.y += 0.1; // Ruch w górę w osi Y
  }
  else if (event.key === 's' || event.key === 'S') {
    cube.position.y -= 0.1; // Ruch w dół w osi Y
  }
  else if (event.key === 'a' || event.key === 'A') {
    cube.position.x -= 0.1; // Ruch w lewo w osi X
  }
  else if (event.key === 'd' || event.key === 'D') {
    cube.position.x += 0.1; // Ruch w prawo w osi X
  }

  camera.lookAt(cube.position); // Kamera zawsze patrzy na sześcian
});

// 10. Funkcja animacji (renderowanie)
function animate() {
  requestAnimationFrame(animate); // Umożliwia płynne renderowanie

  // Renderowanie sceny z kamery
  renderer.render(scene, camera);
}

// 11. Rozpoczęcie animacji
animate();
