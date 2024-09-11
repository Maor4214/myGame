'use strict'

// Elements in game:
const WALL = 'WALL'
const FLOOR = 'FLOOR'
const DONUT = 'DONUT'
const GAMER = 'GAMER'
const OBSTACLE = 'OBSTACLE'

//Imgs:
const GAMER_IMG = '<img src="img/gamer.png">'
const DONUT_IMG = '<img src="img/donut.png">'
const OBSTACLE_IMG = '<img src="img/obstacle.png">'

//Sounds:
const DONUT_SOUND = `./sound/eat.mp3`
const OBSTACLE_SOUND = `./sound/stuck.mp3`

// Model:
var gBoard
var gGamerPos
var gDonutCount = 0

var gIntervalDonutId
var gIntervalObstacleId

var gIsFreeToMove = true

function onInitGame() {
    var elCount = document.querySelector('h2 span')
    gGamerPos = { i: 2, j: 9 }
    gBoard = buildBoard()
    renderBoard(gBoard)
    gIntervalDonutId = setInterval(addNewDonut, 3000)
    gIntervalObstacleId = setInterval(addNewObstacle, 5000)
    elCount.innerHTML = `${gDonutCount}`
}

function buildBoard() {
    // DONE: Create the Matrix 10 * 12 
    const board = []
    const rowsCount = 10
    const colsCount = 12
    gDonutCount = 0
    var elBtn = document.querySelector('button')
    var elH4Won = document.querySelector('.won')
    elBtn.style.display = 'none'
    elH4Won.style.display = 'none'
    // DONE: Put FLOOR everywhere and WALL at edges
    for (var i = 0; i < rowsCount; i++) {
        board[i] = []
        for (var j = 0; j < colsCount; j++) {
            board[i][j] = { type: FLOOR, gameElement: null }
            if (i === 0 || i === rowsCount - 1 ||
                j === 0 || j === colsCount - 1) {
                board[i][j].type = WALL
            }
        }
    }
    // DONE: Place the gamer and two balls
    board[gGamerPos.i][gGamerPos.j].gameElement = GAMER
    board[5][5].gameElement = DONUT
    board[7][2].gameElement = DONUT
    board[0][5].type = FLOOR
    board[9][5].type = FLOOR
    board[4][0].type = FLOOR
    board[4][11].type = FLOOR
    return board
}

// Render the c to an HTML table
function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]
            var cellClass = getClassName({ i: i, j: j })

            if (currCell.type === FLOOR) cellClass += ' floor'
            else if (currCell.type === WALL) cellClass += ' wall'

            strHTML += `<td class="cell ${cellClass}"  onclick="moveTo(${i},${j})" >`

            if (currCell.gameElement === GAMER) {
                strHTML += GAMER_IMG
            } else if (currCell.gameElement === DONUT) {
                strHTML += DONUT_IMG
            }

            strHTML += '</td>'
        }
        strHTML += '</tr>'
    }
    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

// Move the player to a specific location
function moveTo(i, j) {
    if (!gIsFreeToMove) return
    const targetCell = gBoard[i][j]
    if (targetCell.type === WALL) return


    // Hiiden path1 go from the top cell to the low cell
    if ((isValidHiddenPath1(i, j))) {
        // Remove Player from last cell (DOM and Modal)
        gBoard[gGamerPos.i][gGamerPos.j].gameElement = null
        renderCell(gGamerPos, '')

        // Add Player to new cell(DOM and Modal)
        gGamerPos.i = 9
        gGamerPos.j = j
        renderCell(gGamerPos, GAMER_IMG)
        gBoard[i][j].gameElement = GAMER
    }

    //Hidden path2 go from the low cell to the top cell 
    if ((isValidHiddenPath2(i, j))) {
        // Remove Player from last cell (DOM and Modal)
        gBoard[gGamerPos.i][gGamerPos.j].gameElement = null
        renderCell(gGamerPos, '')

        // Add Player to new cell(DOM and Modal)
        gGamerPos.i = 0
        gGamerPos.j = j
        renderCell(gGamerPos, GAMER_IMG)
        gBoard[i][j].gameElement = GAMER
    }


    // Hidden path3 go from the left cell to the right cell 
    if ((isValidHiddenPath3(i, j))) {
        // Remove Player from last cell (DOM and Modal)
        gBoard[gGamerPos.i][gGamerPos.j].gameElement = null
        renderCell(gGamerPos, '')

        // Add Player to new cell(DOM and Modal)
        gGamerPos.i = i
        gGamerPos.j = 11
        renderCell(gGamerPos, GAMER_IMG)
        gBoard[i][j].gameElement = GAMER
    }

    // Hidden path4 go from the right cell to the left cell 
    if ((isValidHiddenPath4(i, j))) {
        // Remove Player from last cell (DOM and Modal)
        gBoard[gGamerPos.i][gGamerPos.j].gameElement = null
        renderCell(gGamerPos, '')

        // Add Player to new cell(DOM and Modal)
        gGamerPos.j = 0
        gGamerPos.i = i
        renderCell(gGamerPos, GAMER_IMG)
        gBoard[i][j].gameElement = GAMER
    }

    // Calculate distance to make sure we are moving to a neighbor cell
    const iAbsDiff = Math.abs(i - gGamerPos.i)
    const jAbsDiff = Math.abs(j - gGamerPos.j)


    // If the clicked Cell is one of the four allowed
    if ((iAbsDiff === 1 && jAbsDiff === 0) ||
        (jAbsDiff === 1 && iAbsDiff === 0)) {


        if (targetCell.gameElement === DONUT) {
            var elCount = document.querySelector('h2 span')
            console.log('Mmmmmm Dount')
            playSound(DONUT_SOUND)
            gDonutCount++
            elCount.innerHTML = `${gDonutCount}`
        }

        if (targetCell.gameElement === OBSTACLE) {
            console.log('You ate a policeman donut, you are arrested for 3 seconds!')
            playSound(OBSTACLE_SOUND)
            gIsFreeToMove = false
            setTimeout(() => {
                gIsFreeToMove = true
            }, 3000)
        }

        gBoard[gGamerPos.i][gGamerPos.j].gameElement = null
        renderCell(gGamerPos, '')


        gBoard[i][j].gameElement = GAMER
        gGamerPos.i = i
        gGamerPos.j = j

        renderCell(gGamerPos, GAMER_IMG)
        var closeDonuts = countCloseDonuts(gGamerPos.i, gGamerPos.j, gBoard)
        document.querySelector("h3 span").innerHTML = closeDonuts
        checkVictory()

    } else {
        console.log('TOO FAR', iAbsDiff, jAbsDiff)
    }
}

function addNewDonut() {
    var emptyCells = findEmptyCells()
    if (emptyCells.length === 0) return
    var newCellIdx = getRandomInt(0, emptyCells.length)
    var emptyCell = emptyCells[newCellIdx]
    const cellSelector = '.' + getClassName(emptyCell)
    const elEmptyCell = document.querySelector(cellSelector)
    // Update Dom
    elEmptyCell.innerHTML = DONUT_IMG
    // Update Modal
    gBoard[emptyCell.i][emptyCell.j].gameElement = DONUT
    var closeDonuts = countCloseDonuts(gGamerPos.i, gGamerPos.j, gBoard)
    document.querySelector("h3 span").innerHTML = closeDonuts
}

function addNewObstacle() {
    var emptyCells = findEmptyCells()
    if (emptyCells.length === 0) return
    var newCellIdx = getRandomInt(0, emptyCells.length)
    var emptyCell = emptyCells[newCellIdx]
    const cellSelector = '.' + getClassName(emptyCell)
    const elEmptyCell = document.querySelector(cellSelector)
    // Update Dom
    elEmptyCell.innerHTML = OBSTACLE_IMG
    // Update Modal
    gBoard[emptyCell.i][emptyCell.j].gameElement = OBSTACLE
    setTimeout(() => {
        if (gBoard[emptyCell.i][emptyCell.j].gameElement === OBSTACLE) {
            elEmptyCell.innerHTML = ''
            // Update Modal
            gBoard[emptyCell.i][emptyCell.j].gameElement = null
        }
    }, 3000)

}

function findEmptyCells() {
    var emptyCells = []

    for (var i = 1; i < gBoard.length - 1; i++) {
        for (var j = 1; j < gBoard[0].length - 1; j++) {

            var currCell = gBoard[i][j]

            if (currCell.type === FLOOR && !currCell.gameElement) {
                var emptyCell = { i, j }
                emptyCells.push(emptyCell)
            }
        }
    }
    return emptyCells
}

function noMoreDonuts() {
    for (var i = 1; i < gBoard.length - 1; i++) {
        for (var j = 1; j < gBoard[0].length - 1; j++) {
            var currCell = gBoard[i][j]
            if (currCell.gameElement === DONUT) return false
        }
    }
    return true
}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
    const cellSelector = '.' + getClassName(location)
    const elCell = document.querySelector(cellSelector)
    elCell.innerHTML = value
}

function getClassName(location) {
    const cellClass = `cell-${location.i}-${location.j}`
    return cellClass
}

// Move the player by keyboard arrows
function onKey(ev) {
    const i = gGamerPos.i
    const j = gGamerPos.j

    switch (ev.key) {
        case 'ArrowLeft':
            if (i === 4 && j === 0) moveTo(i, 11)
            else moveTo(i, j - 1)
            break
        case 'ArrowRight':
            if (i === 4 && j === 11) moveTo(i, 0)
            else moveTo(i, j + 1)
            break
        case 'ArrowUp':
            if (i === 0 && j === 5) moveTo(9, j)
            else moveTo(i - 1, j)
            break
        case 'ArrowDown':
            if (i === 9 && j === 5) moveTo(0, j)
            else moveTo(i + 1, j)
            break
    }
}
function countCloseDonuts(rowIdx, cellIdx, board) {
    var donutsCount = 0

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = cellIdx - 1; j <= cellIdx + 1; j++) {
            if (j < 0 || j >= board[0].length) continue
            if (i === rowIdx && j === cellIdx) continue
            if (board[i][j].gameElement === DONUT) donutsCount++
        }
    }
    return donutsCount
}


// function isValidHiddenPath(i, j) {
//     if ((i < 0 && j === 5) || (gGamerPos.i === 0 && gGamerPos.j === 5) && (i === 9 && j === 5)) {return true}
//     else if ((i > 9 && j === 5) || (gGamerPos.i === 9 && gGamerPos.j === 5) && (i === 0 && j === 5)) {return true}
//     else if ((j < 0 && i === 4) || (gGamerPos.i === 4 && gGamerPos.j === 0) && (i === 4 && j === 11)) {return true}
//     else if ((j > 11 && i === 4) || (gGamerPos.i === 4 && gGamerPos.j === 11) && (i === 4 && j === 0)) {return true}
// }


function isValidHiddenPath1(i, j) {
    if ((i < 0 && j === 5) || (gGamerPos.i === 0 && gGamerPos.j === 5) && (i === 9 && j === 5)) return true
}
function isValidHiddenPath2(i, j) {
    if ((i > 9 && j === 5) || (gGamerPos.i === 9 && gGamerPos.j === 5) && (i === 0 && j === 5)) return true
}
function isValidHiddenPath3(i, j) {
    if ((j < 0 && i === 4) || (gGamerPos.i === 4 && gGamerPos.j === 0) && (i === 4 && j === 11)) return true
}
function isValidHiddenPath4(i, j) {
    if ((j > 11 && i === 4) || (gGamerPos.i === 4 && gGamerPos.j === 11) && (i === 4 && j === 0)) return true
}


function checkVictory() {
    if (noMoreDonuts()) {
        clearInterval(gIntervalDonutId)
        clearInterval(gIntervalObstacleId)
        console.log('You ate all the donuts, congratulations you won!')
        var elBtn = document.querySelector('button')
        var elH4Won = document.querySelector('.won')
        elBtn.style.display = 'block'
        elH4Won.style.display = 'block'
    }
}

