'use strict'

// console.log('hello js')

const FLAG = 'F'
const MINE = '*'
var gMinesPositions = []
var gBoard = []
var gGame = {
    isOn: true,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

var gLevel = [{
    name: 'easy',
    size: 4,
    mines: 2
}, {
    name: 'medium',
    size: 8,
    mines: 14
}]

gBoard = buildBoard(4, 2)
console.log(gBoard)
renderBoard(gBoard, '.board-container')

function buildBoard(size, num) {
    const board = []

    for (var i = 0; i < size; i++) {
        board.push([])

        for (var j = 0; j < size; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }
    setMines(size, num)
    for (var k = 0; k < gMinesPositions.length; k++) {
        board[gMinesPositions[k].i][gMinesPositions[k].j].isMine = true
    }
    setMinesNegsCount(board)
    return board
}


//returns array with positions for the mines according to board size and number of mines
function setMines(size, num) {

    var availablePositions = []

    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            availablePositions.push({ i, j })
        }
    }
    console.log(availablePositions);
    for (var k = 0; k < num; k++) {
        gMinesPositions.push(availablePositions.splice(getRandomInt(0, size ** 2), 1)[0])
    }
}


function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            board[i][j].minesAroundCount = setCellMinesNegsCount(board, i, j)
        }
    }
}

function setCellMinesNegsCount(board, rowIdx, colIdx) {
    var countMines = 0

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= board[i].length) continue
            if (board[i][j].isMine) {
                countMines++
            }
        }
    }
    if (countMines === 0) {
        return ''
    } else { return countMines }
}

function onCellClicked(elCell, i, j) {


    var elModal = document.querySelector(".modal")

    if (gGame.isOn === false) return
    if (gBoard[i][j].isShown) return
    if (gBoard[i][j].isMarked) return

    if (gBoard[i][j].isMine) {
        gGame.isOn = false
        elCell.innerText = MINE
        elModal.innerText = 'You Lost'
        elModal.style.display = 'block'
    } else {
        gBoard[i][j].isShown = true
        gGame.shownCount++
        elCell.innerText = gBoard[i][j].minesAroundCount
        elCell.classList.add('cell-revealed')
        if (checkGameOver()) {
            gGame.isOn = false
            elModal.innerText = 'You Won'
            elModal.style.display = 'block'
        }
    }

}


function checkGameOver() {
    console.log('marked:', gGame.markedCount)
    console.log('Shown:', gGame.shownCount)
    if (gGame.shownCount + gGame.markedCount === (gLevel[0].size ** 2) && gGame.markedCount === gLevel[0].mines) return true
}

function onCellMarked(elCell, rowIdx, colIdx) {

    var elModal = document.querySelector(".modal")

    if (gBoard[rowIdx][colIdx].isShown) return
    if (!gBoard[rowIdx][colIdx].isMarked) {
        gGame.markedCount++
        gBoard[rowIdx][colIdx].isMarked = true
        elCell.innerText = FLAG
        if (checkGameOver()) {
            gGame.isOn = false
            elModal.innerText = 'You Won'
            elModal.style.display = 'block'
        }
    } else {
        gGame.markedCount--
        gBoard[rowIdx][colIdx].isMarked = false
        elCell.innerText = ''
    }
}