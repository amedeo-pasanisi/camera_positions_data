import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
/**
 * Debug
 */
const gui = new dat.GUI({closeFolders: true})  //To close folders on startup

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Axes Helper
const axesHelper = new THREE.AxesHelper(2)
scene.add(axesHelper)

/**
 * Objects
 */
// const material = new THREE.MeshBasicMaterial()
const material = new THREE.MeshLambertMaterial()
material.transparent = true
material.opacity = 0.05
const division = 2
const cubeSize = 1 / division
const cubesXSide = 5 * division
const cubesZSide = 7 * division
const cubesYSide = 2 * division
for(let x = 0; x < cubesXSide; x++) {
    for(let z = 0; z < cubesZSide; z++) {
        for(let y = 0; y < cubesYSide; y++) {
            const cube = new THREE.Mesh(new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize), material)
            cube.position.x = ((x * cubeSize) + (cubeSize * 0.5)) - (cubesXSide * (cubeSize * 0.5))
            cube.position.z = ((z * cubeSize) + (cubeSize * 0.5)) - (cubesZSide * (cubeSize * 0.5))
            cube.position.y = ((y * cubeSize) + (cubeSize * 0.5))
            scene.add(cube)
        }
    }
}

/**
 * Particles
 */
const parameters = {}
parameters.count = 1000
parameters.size = 0.02
let geometry = null
let particlesMaterial = null
let points = null
const generateGalaxy = () => {
    // Destroy old galaxy
    if(points !== null) {
        geometry.dispose()
        material.dispose()
        scene.remove(points)
    }
    geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(parameters.count * 3)
    for(let i = 0; i < parameters.count; i++) {
        const i3 = i * 3
        positions[i3    ] = (Math.random() - 0.5) * (cubesXSide / division)
        positions[i3 + 1] = (Math.random()      ) * (cubesYSide / division)
        positions[i3 + 2] = (Math.random() - 0.5) * (cubesZSide / division)
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    particlesMaterial = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    })

    points = new THREE.Points(geometry, particlesMaterial)
    scene.add(points)
}
generateGalaxy()
gui.add(parameters, 'count').min(10).max(5000).step(1).onFinishChange(generateGalaxy)
gui.add(parameters, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy)

/**
 * Models
 */
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)
gltfLoader.load(
    '/models/car.glb',
    (gltf) =>
    {
        scene.add(gltf.scene)
    }
)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)
const pointLight = new THREE.PointLight(0xffffff, 1)
pointLight.position.x = 2
pointLight.position.y = 3
pointLight.position.z = 4
scene.add(pointLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 6
camera.position.y = 3
camera.position.z = 8
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    // Update controls
    controls.update()
    // Render
    renderer.render(scene, camera)
    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}
tick()