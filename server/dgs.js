
console.log(tm() + '-Start-')

const WebSocketServer = new require('ws')
const port = 8888
const webSocketServer = new WebSocketServer.Server({ port: port })

const clients = {}
const clientsPrm = {}
let map = []
let clientsCount = 0
let clientIds = 0
let speed = 10
let stata = [0, 0]

CrtMap()

webSocketServer.on('connection', ws => {
    let id = clientIds++
    clients[id] = {}
    clients[id].ws = ws
    clients[id].active = false
    clientsCount++
    ws.send(JSON.stringify({ tip: 'map', map: map }))
    ws.send(JSON.stringify({ tip: 'id', id: id }))

    ws.on('close', () => {
        console.log(tm() + 'close')
        delete clients[id]
        if (clientsPrm[id]) delete clientsPrm[id]
        clientsCount--
    })

    ws.on('message', message => {
        messageWrk(id, message)
    })
})



function messageWrk(id, message) {
    const cln = clients[id]

    let key = ''
    if (message[0]) key = String.fromCharCode(message[0])

    if (key == 'a') { // players count 
        let plyCnt = 0
        for (j in clients)
            if (clients[j].player) plyCnt++
        cln.ws.send(JSON.stringify({ tip: 'a', plyCnt: plyCnt }))
    }

    if (key == 'p') { // plus player
        clientsPrm[id] = {}
        const prm = clientsPrm[id]

        cln.active = true
        prm.x = 20
        prm.y = 20
        prm.name = ''
        cln.keys = [0, 0, 0, 0, 0, 0]

        prm.lyapa = false
        prm.lyapaPre = false
        cln.lyapaSch = 0

        cln.player = true
        cln.schSt = 0
        prm.schPn = 0

        cln.ws.send(JSON.stringify({ tip: 'p', id: id }))
    }

    if (key == 'v')  // plus viewer
        clients[j].active = true

    if (key == 'n') { // name
        cln.name = ab2str(message.slice(1)).slice(0, 10) // ??
        if (clientsPrm[id]) clientsPrm[id].name = cln.name
        console.log(tm() + 'name: ' + cln.name)
    }

    if (key == 'k') {
        cln.keys = message
        cln.schSt = 0
    }
}





setInterval(() => {
    let selLyapa = true
    let ply = 0, vw = 0

    for (j in clients) {
        const cln = clients[j]

        if (cln.player) {
            ply++

            const prm = clientsPrm[j]
            let nx = prm.x, ny = prm.y
            let nx2 = prm.x, ny2 = prm.y

            if (cln.keys[3] == 49) nx -= speed
            if (cln.keys[4] == 49) nx += speed
            if (cln.keys[1] == 49) ny2 -= speed
            if (cln.keys[2] == 49) ny2 += speed

            if (prm.sayLp) delete prm.sayLp
            if (prm.say) delete prm.say
            if (cln.keys[5] == 49) prm.hide = true
            else {
                if (prm.hide) prm.say = true
                prm.hide = false
            }

            let noX = false
            let noY = false
            for (k in map) {
                if (nx + 20 > map[k][0] && nx < map[k][2] && ny + 20 > map[k][1] && ny < map[k][3]) noX = true
                if (nx2 + 20 > map[k][0] && nx2 < map[k][2] && ny2 + 20 > map[k][1] && ny2 < map[k][3]) noY = true
            }

            if (!noX) prm.x = nx
            if (!noY) prm.y = ny2

            if (prm.lyapa) {
                prm.schPn = 0
                for (k in clients) {
                    const cln2 = clients[k]
                    const prm2 = clientsPrm[k]

                    if (cln2.player && cln2 != cln) {
                        if (prm.x + 20 > prm2.x && prm.x < prm2.x + 20
                            && prm.y + 20 > prm2.y && prm.y < prm2.y + 20) {
                            prm2.lyapaPre = true
                            cln2.lyapaSch = 0
                            prm.lyapaPre = false
                            prm.lyapa = false
                            cln.lyapaSch = 0
                            selLyapa = false
                            prm.sayLp = true
                            break
                        }
                    }
                }
            }

            if (prm.lyapaPre) cln.lyapaSch++
            if (cln.lyapaSch == 30) {
                prm.lyapa = true
                prm.lyapaPre = false
            }

            if (prm.lyapa || prm.lyapaPre) selLyapa = false

            cln.schSt++
            if (cln.schSt > 5000) {
                cln.player = false
                delete clientsPrm[j]
            }
            prm.schPn++
        } else vw++

        if (cln.active)
            cln.ws.send(JSON.stringify({
                tip: 1,
                mas: clientsPrm,
                stata: stata,
            }))

        lyapaSay = false
    }

    stata = [ply, vw]

    if (selLyapa)
        for (j in clients)
            if (clients[j].player) {
                clientsPrm[j].lyapa = true
                break
            }

}, 40)



function CrtMap() {
    map = []

    require('fs').readFileSync('map.txt', 'utf-8').split(/\r?\n/).forEach(line => {
        if (line.trim() != '') {
            let ln = line.split(',')
            map.push([
                parseInt(ln[0].trim()),
                parseInt(ln[1].trim()),
                parseInt(ln[2].trim()) + parseInt(ln[0].trim()),
                parseInt(ln[3].trim()) + parseInt(ln[1].trim()),
            ])
        }
    })
}


var util = require('util')
var decoder = new util.TextDecoder("utf-8")

const ab2str = buf => {
    return decoder.decode(new Uint8Array(buf))
}

function tm() {
    const dt = new Date()
    return dt.getMonth() + '.' + dt.getDate() + ' ' + dt.getHours() + ':' + dt.getMinutes() + ' : '
}