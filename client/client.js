


let players = {}
let myId = 0
let iConn = false
let socket


if (localStorage['name'] == undefined) nameInp.value = 'a' + Math.round(Math.random() * 1000)
else nameInp.value = localStorage['name']

nameInp.onchange = th => {
    socket.send('n' + th.target.value)
    localStorage['name'] = th.target.value
}


socket = new WebSocket("ws://77.222.63.26:8888")
socket.binaryType = "arraybuffer"

socket.onopen = () => {
    iConn = true
    conn.innerHTML = 'Есть подключение'
    socket.send('a')
}

socket.onclose = () => {
    iConn = false
    console.log('-Close-')
    conn.innerHTML = '<no>Соединения нет</no>'
    start.style.display = 'block'
    win.style.display = 'none'
}

socket.onmessage = event => {
    PrnGame(event.data)
}



function goPlay() {
    if (!iConn) return
    socket.send('p')
    start.style.display = 'none'
    win.style.display = 'block'
    socket.send('n' + nameInp.value)

    let keys = ['k', 0, 0, 0, 0, 0]

    document.onkeydown = (e) => {
        e = e || window.event
        // console.log(e.keyCode)
        if (e.keyCode == '38' || e.keyCode == '87') keys[1] = 1 // up
        if (e.keyCode == '40' || e.keyCode == '83') keys[2] = 1 // down
        if (e.keyCode == '37' || e.keyCode == '65') keys[3] = 1 // left
        if (e.keyCode == '39' || e.keyCode == '68') keys[4] = 1 // right
        if (e.keyCode == '32') keys[5] = 1 // space

        if (iConn) socket.send(keys.join(''))
    }

    document.onkeyup = (e) => {
        e = e || window.event
        if (e.keyCode == '38' || e.keyCode == '87') keys[1] = 0
        if (e.keyCode == '40' || e.keyCode == '83') keys[2] = 0
        if (e.keyCode == '37' || e.keyCode == '65') keys[3] = 0
        if (e.keyCode == '39' || e.keyCode == '68') keys[4] = 0
        if (e.keyCode == '32') keys[5] = 0 // space

        if (iConn) socket.send(keys.join(''))
    }

}

function goView() {
    if (!iConn) return
    socket.send('v')
    start.style.display = 'none'
    win.style.display = 'block'
}

function PrnGame(masMess) {
    let data = JSON.parse(masMess)

    if (data.tip == 'a')  // players count
        conn.innerHTML = 'Есть подключение (' + data.plyCnt + ')'

    if (data.tip == 'p')  // plus player
        plusPlayer(data.id)

    if (data.tip == 1) { // print players 
        let mas = data.mas

        for (j in mas) {
            if (!players[j] && mas[j].x) plusPlayer(j)
            if (players[j] && !mas[j].x) {
                players[j].pic.remove()
                delete players[j]
            }

            let col = '#ccc', z = '0', hideName = 'block'

            if (j == myId) {
                col = '#4A8DDF'
                z = '999'
            }
            if (mas[j].lyapa) col = '#d33'
            if (mas[j].lyapaPre) col = '#dd3'
            if (mas[j].hide) {
                col = '#6F747A'
                hideName = 'none'
            }

            if (players[j]) {
                const pic = players[j].pic
                pic.style.left = mas[j].x + 'px'
                pic.style.top = mas[j].y + 'px'
                pic.style.backgroundColor = col
                pic.style.color = col
                pic.style.zIndex = z
                players[j].name.innerHTML = mas[j].name
                players[j].name.style.display = hideName
                players[j].schPn.innerHTML = Math.ceil(mas[j].schPn / 10)
                players[j].schPn.style.display = hideName
                if (mas[j].say) {
                    players[j].say.pause()
                    players[j].say.currentTime = 0
                    players[j].say.play()
                }
                if (mas[j].sayLp) lyapa.play()
            }

        }

        let tdl = []

        for (j in players)
            if (!mas[players[j].id])
                tdl.push(j)

        for (j of tdl) {
            players[j].pic.remove()
            delete players[j]
        }

        stata.innerHTML = 'Игроков: ' + data.stata[0] + '<br>' + 'Зрителей: ' + data.stata[1]
    }

    if (data.tip == 'map') { // print map
        let map = data.map
        for (j in map) {
            const mpo = document.createElement('div')
            mpo.classList.add('mapObj')
            mpo.style.left = map[j][0] + 'px'
            mpo.style.top = map[j][1] + 'px'
            mpo.style.width = map[j][2] - map[j][0] + 'px'
            mpo.style.height = map[j][3] - map[j][1] + 'px'
            pole.appendChild(mpo)
        }
    }

    if (data.tip == 'id')  // my id
        myId = data.id
}


function plusPlayer(id) {
    players[id] = {}
    players[id].id = id
    players[id].name = document.createElement('name')
    players[id].schPn = document.createElement('schPn')
    players[id].pic = document.createElement('div')
    players[id].pic.classList.add('player')
    players[id].pic.appendChild(players[id].name)
    players[id].pic.appendChild(players[id].schPn)
    pole.appendChild(players[id].pic)
    players[id].say = new Audio()
    players[id].say.src = 'say.wav'
}




