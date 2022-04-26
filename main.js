const { app, BrowserWindow } = require('electron')
const { create } = require('lodash')
const THREE = require('three')

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

const createWindow = () => {
    const window = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    })

    window.loadFile('index.html')
}

app.whenReady().then(() => {
    createWindow()
})
