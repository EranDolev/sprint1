'use strict'

// console.log('hello js')

const FLAG = '🚩'
const MINE = '💣'
var gMinesPositions = []
var gBoard = []
var gGame = {
    isOn: true,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    lives: 3
}

var gLevel = {
    size: 4,
    mines: 2
}


// var gGameSize
// var gGameMines
var gFirstClick
var gTimeInterval
var gSeconds
var gStartTime
var gSafePosition
var gSafeClicksRemain


function buildBoard(size, num) {
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        lives: 3
    }
    gBoard = []
    gMinesPositions = []
    gSafePosition = []
    gLevel.size = size
    gLevel.mines = num
    gFirstClick = true
    gSeconds = 0
    gSafeClicksRemain = 3
    clearInterval(gTimeInterval)

    var elH2Span = document.querySelector("h2 span")
    var elLives = document.querySelector("h3 span")
    var elH4 = document.querySelector('h4 span')
    var elSafeBtn = document.querySelector('.safe-button span')
    elH2Span.innerText = gLevel.mines - gGame.markedCount
    elLives.innerText = '❤️❤️❤️'
    elH4.innerText = gSeconds
    elSafeBtn.innerText = gSafeClicksRemain


    for (var i = 0; i < size; i++) {
        gBoard.push([])

        for (var j = 0; j < size; j++) {
            gBoard[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
                isChecked: false
            }
        }
    }

    console.log(gBoard)

}

//this function only works when it is the first move of the game, being called from onCellClicked function
function onFirstClick(board, size, num, rowIdx, colIdx) {
    setMines(size, num, rowIdx, colIdx)
    for (var i = 0; i < gMinesPositions.length; i++) {
        board[gMinesPositions[i].i][gMinesPositions[i].j].isMine = true
    }
    setMinesNegsCount(board)
}

//inserts gMinesPositions array positions for the mines according to board size and number of mines
function setMines(size, num, rowIdx, colIdx) {

    var availablePositions = []

    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            if (gBoard[i][j] !== gBoard[rowIdx][colIdx]) availablePositions.push({ i, j })
        }
    }
    console.log(availablePositions);
    for (var k = 0; k < num; k++) {
        gMinesPositions.push(availablePositions.splice(getRandomInt(0, availablePositions.length), 1)[0])
    }
}

//starts th sequence for creating the game
function onInit(size, mines) {
    var elModal = document.querySelector(".modal")
    var elSmiley = document.querySelector(".smiley button")

    elModal.style.display = 'none'
    elSmiley.innerText = '😃'

    styleLevel(size)
    buildBoard(size, mines)
    renderBoard(gBoard, '.board-container')
}

//inputs the data of mines around for each cell
function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            board[i][j].minesAroundCount = setCellMinesNegsCount(board, i, j)
        }
    }
}

//counts how many mines neighbors for a cell
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

//results for each cell click
function onCellClicked(elCell, i, j) {

    var elModal = document.querySelector(".modal")
    var elSmiley = document.querySelector(".smiley button")
    var elLives = document.querySelector("h3 span")
    console.log(elSmiley)

    if (gFirstClick) {
        onFirstClick(gBoard, gLevel.size, gLevel.mines, i, j)
        console.log(gBoard)
        gStartTime = new Date()
        gTimeInterval = setInterval(updateTime, 1000, gStartTime)
        gFirstClick = false
    }

    if (!gGame.isOn) return
    if (gBoard[i][j].isShown) return
    if (gBoard[i][j].isMarked) return

    if (gBoard[i][j].isMine && gGame.lives < 2) {
        gGame.isOn = false
        clearInterval(gTimeInterval)
        elCell.innerText = MINE
        elModal.innerText = 'You Lost'
        elModal.style.display = 'block'
        elSmiley.innerText = '🤯'
        elLives.innerText = ''
    } else if (gBoard[i][j].isMine) {
        gGame.lives--
        if (gGame.lives === 2) {
            elLives.innerText = '❤️❤️'
            elCell.style.backgroundColor = 'red'
        } else {
            elLives.innerText = '❤️'
            elCell.style.backgroundColor = 'red'
        }
    } else {
        if (gBoard[i][j].minesAroundCount === 0 || gBoard[i][j].minesAroundCount === '') {
            expandShown(gBoard, i, j)
        }
        gBoard[i][j].isShown = true
        gGame.shownCount++
        elCell.innerText = gBoard[i][j].minesAroundCount
        elCell.classList.add('cell-revealed')
        if (checkGameOver()) {
            gGame.isOn = false
            gFirstClick = false
            clearInterval(gTimeInterval)
            elModal.innerText = 'You Won!!!'
            elModal.style.display = 'block'
            elSmiley.innerText = '😎'
        }
    }

}

//checkes if game won
function checkGameOver() {
    console.log('marked:', gGame.markedCount)
    console.log('Shown:', gGame.shownCount)
    if (gGame.shownCount + gGame.markedCount === (gLevel.size ** 2) && gGame.markedCount === gLevel.mines) return true
}

//results for mouse right click
function onCellMarked(elCell, rowIdx, colIdx) {

    var elModal = document.querySelector(".modal")
    var elH2Span = document.querySelector("h2 span")
    var elSmiley = document.querySelector(".smiley button")

    if (gBoard[rowIdx][colIdx].isShown) return
    if (!gBoard[rowIdx][colIdx].isMarked) {
        gGame.markedCount++
        gBoard[rowIdx][colIdx].isMarked = true
        elCell.innerText = FLAG
        if (checkGameOver()) {
            clearInterval(gTimeInterval)
            gGame.isOn = false
            gFirstClick = false
            elModal.innerText = 'You Won!!!'
            elModal.style.display = 'block'
            elSmiley.innerText = '😎'
        }
    } else {
        gGame.markedCount--
        gBoard[rowIdx][colIdx].isMarked = false
        elCell.innerText = ''
    }
    elH2Span.innerText = gLevel.mines - gGame.markedCount
}

//expands neighbors for cells with no neighbor mines 
function expandShown(board, rowIdx, colIdx) {
    gBoard[rowIdx][colIdx].isChecked = true
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= board[i].length) continue
            if (board[i][j].isChecked) continue
            var elCell = document.querySelector(`.cell-${i}-${j}`)
            onCellClicked(elCell, i, j)
        }
    }
}

function styleLevel(num) {
    var elLevels = document.querySelectorAll('.buttons button')
    console.log(elLevels)
    elLevels[0].classList.remove('chosen-level')
    elLevels[1].classList.remove('chosen-level')
    elLevels[2].classList.remove('chosen-level')
    if (num === 4) {
        console.log(elLevels)
        elLevels[0].classList.add('chosen-level')
    } else if (num === 8) {
        elLevels[1].classList.add('chosen-level')
    } else { elLevels[2].classList.add('chosen-level') }
}

function updateTime(currentTime) {
    var elH4 = document.querySelector('h4 span')
    console.log(elH4);
    var date = new Date() - currentTime
    gSeconds = Math.trunc(date / 1000)
    elH4.innerText = gSeconds
}

function safeClick() {
    var safeClickPositions = []
    var elSafeBtn = document.querySelector('.safe-button span')
    gSafePosition = []
    if (gSafeClicksRemain === 0 || gFirstClick) return
    gSafeClicksRemain --
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (!gBoard[i][j].isShown && !gBoard[i][j].isMine && !gBoard[i][j].isMarked) {
                safeClickPositions.push({ i, j })
            }
        }
    }
    gSafePosition.push(safeClickPositions.splice(getRandomInt(0, safeClickPositions.length), 1)[0])
    var elCell = document.querySelector(`.cell-${gSafePosition[0].i}-${gSafePosition[0].j}`)
    elCell.classList.add('safe')
    elSafeBtn.innerText = gSafeClicksRemain
    setTimeout(clearSafeClick,1000,elCell)
}

function clearSafeClick(elCell){
    elCell.classList.remove('safe')
}