const socket = require('./socket')
const gui = require('./gui')

const white = 0xffffff

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// White directional light at half intensity shining from the top.
pointLight = new THREE.PointLight(white, 1, 100)
pointLight.position.set(5, 5, -5)
scene.add(pointLight)

// White ambient light
light = new THREE.AmbientLight(white, 0.5)
scene.add(light)

// Red cube
geometry = new THREE.BoxGeometry()
material = new THREE.MeshPhongMaterial({ color: 0xff0000 })
red = new THREE.Mesh(geometry, material)
scene.add(red)
red.position.set(-2.5, 0.5, 0)
// Blue cube
material = new THREE.MeshPhongMaterial({ color: 0x0000ff })
blue = new THREE.Mesh(geometry, material)
scene.add(blue)
blue.position.set(2.5, 0.5, 0)

// White plane
geometry = new THREE.PlaneGeometry(10, 10)
material = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
})
const plane = new THREE.Mesh(geometry, material)
scene.add(plane)
plane.rotation.x = Math.PI / 2

// Setup camera
camera.position.set(0, 5, 7)
camera.rotation.x = -0.7

// Clock
clock = new THREE.Clock()
clock.start()

cube = null // local player
netCube = null // networked player
connected = false // avoid moving anyone until connected

// Might need to call this function a few times if connection not ready yet
function checkConnection() {
    let player = socket.getPlayer()
    if (player == 'unknown') return false
    console.log(player)
    switch (player) {
        case 'red':
            cube = red
            netCube = blue
            break
        case 'blue':
            cube = blue
            netCube = red
            break
    }
    return true
}

// Initialize input vars
speed = 2
keysDown = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    ArrowDown: false,
}
// Add listeners for input
document.addEventListener('keydown', onDocumentKeyDown, false)
document.addEventListener('keyup', onDocumentKeyUp, false)
function onDocumentKeyDown(event) {
    if (event.code in keysDown) keysDown[event.code] = true
}
function onDocumentKeyUp(event) {
    if (event.code in keysDown) keysDown[event.code] = false
}

function applyInput() {
    // Check if user has tabbed out, if so, remove input
    if (!document.hasFocus()) for (key in keysDown) keysDown[key] = false

    // Determine direction vector from pressed keys
    let direction = new THREE.Vector3(0, 0, 0)
    if (keysDown.ArrowLeft) direction.x -= 1
    if (keysDown.ArrowRight) direction.x += 1
    if (keysDown.ArrowUp) direction.z -= 1
    if (keysDown.ArrowDown) direction.z += 1

    // Normalize and apply speed and deltaTime
    cube.position.add(direction.normalize().multiplyScalar(speed * deltaTime))
}

function networkUpdate() {
    // Check if our friend has sent a new location
    arr = socket.getPosition()
    if (arr != null) {
        // arr is Float32Array, convert to netCube position
        netCube.position.set(arr[0], arr[1], arr[2])
    }

    // Send our position
    socket.sendPosition(cube.position.toArray())
}

function animate() {
    requestAnimationFrame(animate)

    // Even if we don't use this, we must call getDelta so it stays updated
    deltaTime = clock.getDelta()

    if (connected) {
        // If we are connected, apply input and send/receive update
        applyInput()
        networkUpdate()
    } else {
        // If we are not connected, check every frame until we are
        connected = checkConnection()
    }

    renderer.render(scene, camera)
}
animate()
