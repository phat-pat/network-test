const socket = require('./socket')

const packetLoss = document.getElementById('packetLoss')
const latency = document.getElementById('latency')
const sent = document.getElementById('packetsSent')
const received = document.getElementById('packetsReceived')
const packetsPerSecond = document.getElementById('packetsPerSecond')

let lastSent = 0

// Listen for input to update loss and latency
packetLoss.oninput = function () {
    socket.setPacketLoss(this.value)
}

latency.oninput = function () {
    socket.setLatency(this.value)
}

// Update counts at 30fps
setInterval(() => {
    stats = socket.getStats()
    sent.textContent = `Packets Sent: ${stats.sent}`
    received.textContent = `Packets Received: ${stats.received}`
}, 1 / 30)

// Update packets per second once a second
setInterval(() => {
    pps = stats.sent - lastSent
    kbps = (pps * 12 * 8) / 1000
    packetsPerSecond.textContent = `Packets Per Second: ${pps} @ ${kbps} kbps`
    lastSent = stats.sent
}, 1000)
