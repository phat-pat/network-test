const dgram = require('dgram')

// WebRTC Data channel is promising, but requires an obscure signaling method
// Apparently this signaling method is up to me, but I'm not sure how that works.

// For now we can just check if there is an available connection
// If not, start listening

const socket = dgram.createSocket('udp4')

const local_ip = '169.237.151.205'
const remote_ip = '169.237.151.205'
const host = true

let player = 'unknown'

let stats = {
    sent: 0,
    received: 0,
    packetLoss: 0,
    latency: 0,
}

// If the socket is already bound, we are playing on same computer as the second player
socket.on('error', (err) => {
    if (err.code != 'EADDRINUSE') {
        console.log(err)
        return 'error'
    }

    console.log('Address in use, binding to 54000')
    socket.bind(
        {
            port: 54000,
            address: local_ip,
        },
        () => {
            console.log('Attempting to connect to 50000')
            socket.connect(50000, remote_ip)
            player = 'blue'
        }
    )
})

// If this socket is not already bound, we are the first player / playing over internet
console.log(`Attempting to bind to ${local_ip}:50000`)
socket.bind(
    {
        port: 50000,
    },
    () => {
        if (local_ip == remote_ip) {
            console.log(`Attempting to connect to ${remote_ip}:54000`)
            socket.connect(54000, remote_ip)
            player = 'red'
        } else {
            console.log(`Attempting to connect to ${remote_ip}:50000`)
            player = host ? 'red' : 'blue'
        }
    }
)

function getPlayer() {
    return player
}

// Expects location as array
function sendPosition(pos) {
    // Simulate packet loss
    if (Math.random() * 100 >= stats.packetLoss) {
        setTimeout(() => {
            socket.send(new Float32Array(pos))
        }, stats.latency)
    }
    stats.sent++
}

// Naive method - always assume most recently received packet is most recent
position = null
socket.on('message', (msg, rinfo) => {
    // By default msg is interpreted as Int8Array regardless of how it was sent
    // So grab the raw buffer and reconstruct array from that
    position = new Float32Array(msg.buffer)
    stats.received++
})

// Returns location as a Float32Array
function getPosition() {
    return position
}

function getStats() {
    return stats
}

function setPacketLoss(percent) {
    stats.packetLoss = percent
}

function setLatency(ms) {
    console.log(ms)
    stats.latency = ms
}

module.exports = {
    getPlayer,
    getPosition,
    sendPosition,
    getStats,
    setPacketLoss,
    setLatency,
}
