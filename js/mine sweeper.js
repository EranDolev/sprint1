'use strict'

// console.log('hello js')

const FLAG = '🚩'
const MINE = '💣'
var gMinesPositions = []
var gBoard = []
var gUndo = []
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
var gIsHint
var gHintCount


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
    gUndo = []
    gLevel.size = size
    gLevel.mines = num
    gFirstClick = true
    gIsHint = false
    gSeconds = 0
    gSafeClicksRemain = 3
    gHintCount = 3
    clearInterval(gTimeInterval)

    var elH2Span = document.querySelector("h2 span")
    var elLives = document.querySelector("h3 span")
    var elH4 = document.querySelector('h4 span')
    var elSafeBtn = document.querySelector('.safe-button span')
    var elHintBtn = document.querySelector('.hint-button')
    var elHintBtnSpan = document.querySelector('.hint-button span')
    elH2Span.innerText = gLevel.mines - gGame.markedCount
    elLives.innerText = '❤️❤️❤️'
    elH4.innerText = gSeconds
    elSafeBtn.innerText = gSafeClicksRemain
    elHintBtnSpan.innerText = gHintCount
    elHintBtn.classList.remove('hint-on')


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
    // console.log(gHintCount)
}

//this function only works when it is the first move of the game, being called from onCellClicked function
function onFirstClick(board, size, num, rowIdx, colIdx) {
    setMines(size, num, rowIdx, colIdx)
    for (var i = 0; i < gMinesPositions.length; i++) {
        board[gMinesPositions[i].i][gMinesPositions[i].j].isMine = true
    }
    setMinesNegsCount(board)
}

//inserts positions to gMinesPositions array for the mines according to board size and number of mines
function setMines(size, num, rowIdx, colIdx) {

    var availablePositions = []

    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            if (gBoard[i][j] !== gBoard[rowIdx][colIdx]) availablePositions.push({ i, j })
        }
    }
    // console.log(availablePositions)
    for (var k = 0; k < num; k++) {
        gMinesPositions.push(availablePositions.splice(getRandomInt(0, availablePositions.length), 1)[0])
    }
}

//starts the sequence for creating the game
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
    // console.log(elSmiley)

    if (gIsHint) {
        getHint(i, j)
        return
    }

    if (gFirstClick) {
        onFirstClick(gBoard, gLevel.size, gLevel.mines, i, j)
        // console.log(gBoard)
        gStartTime = new Date()
        gTimeInterval = setInterval(updateTime, 1000, gStartTime)
        gFirstClick = false
    }


    if (!gGame.isOn) return
    if (gBoard[i][j].isShown) return
    if (gBoard[i][j].isMarked) return
    if (gBoard[i][j].isMine && elCell.style.backgroundColor === 'red') return //can't step on a mine twice

    gUndo.push({ i, j, rightClick: false })
    console.log(gUndo)

    if (gBoard[i][j].isMine && gGame.lives < 2) {
        gGame.isOn = false
        clearInterval(gTimeInterval)
        elCell.innerText = MINE
        elModal.innerText = 'You Lost'
        elModal.style.display = 'block'
        elSmiley.innerText = '🤯'
        elLives.innerText = ''
        revealMines(elCell)
    } else if (gBoard[i][j].isMine) {
        gGame.lives--
        elCell.style.backgroundColor = 'red'
        if (gGame.lives === 2) {
            elLives.innerText = '❤️❤️'
        } else {
            elLives.innerText = '❤️'
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
    // console.log('marked:', gGame.markedCount)
    // console.log('Shown:', gGame.shownCount)
    if (gGame.shownCount + gGame.markedCount === (gLevel.size ** 2) && gGame.markedCount === gLevel.mines) return true
}

//results for mouse right click
function onCellMarked(elCell, rowIdx, colIdx) {

    var elModal = document.querySelector(".modal")
    var elH2Span = document.querySelector("h2 span")
    var elSmiley = document.querySelector(".smiley button")

    if (gBoard[rowIdx][colIdx].isShown) return

    gUndo.push({ i: rowIdx, j: colIdx, rightClick: true })

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
    gBoard[rowIdx][colIdx].isShown = true
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
    elLevels[0].classList.remove('chosen-level')
    elLevels[1].classList.remove('chosen-level')
    elLevels[2].classList.remove('chosen-level')
    if (num === 4) {
        elLevels[0].classList.add('chosen-level')
    } else if (num === 8) {
        elLevels[1].classList.add('chosen-level')
    } else { elLevels[2].classList.add('chosen-level') }
}

function updateTime(currentTime) {
    var elH4 = document.querySelector('h4 span')
    var date = new Date() - currentTime
    gSeconds = Math.trunc(date / 1000)
    elH4.innerText = gSeconds
}

function safeClick() {
    var safeClickPositions = []
    var elSafeBtn = document.querySelector('.safe-button span')
    gSafePosition = []
    if (gSafeClicksRemain === 0 || gFirstClick) return
    gSafeClicksRemain--
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
    setTimeout(clearSafeClick, 1000, elCell)
}

function clearSafeClick(elCell) {
    elCell.classList.remove('safe')
}

function revealMines(elCell1) {
    elCell1.style.backgroundColor = 'red'
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isMine) {
                var elCell2 = document.querySelector(`.cell-${i}-${j}`)
                elCell2.innerText = MINE
            }
        }
    }
}

function getHint(rowIdx, colIdx) {
    var elHintBtn = document.querySelector('.hint-button span')
    gHintCount--
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue
            var elCell = document.querySelector(`.cell-${i}-${j}`)
            if (!(gBoard[i][j].isMarked) || (gBoard[i][j].isShown)) {
                if (gBoard[i][j].isMine) {
                    elCell.innerText = MINE
                    elCell.style.borderColor = 'red'
                } else if ((gBoard[i][j].isShown)) {
                    continue
                } else if (gBoard[i][j].minesAroundCount > -1 || gBoard[i][j].minesAroundCount === '') {
                    elCell.innerText = gBoard[i][j].minesAroundCount
                    elCell.style.borderColor = 'red'
                }
            }
        }
    }
    elHintBtn.innerText = gHintCount
    gIsHint = false
    setTimeout(removeGetHint, 1000, rowIdx, colIdx)
}

function turnOnOffHint(elCell) {
    if (gIsHint || gFirstClick || gHintCount === 0) {
        gIsHint = false
        elCell.classList.remove('hint-on')
    } else {
        gIsHint = true
        elCell.classList.add('hint-on')
    }
}

function removeGetHint(rowIdx, colIdx) {
    var elHintBtn = document.querySelector('.hint-button')
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue
            var elCell1 = document.querySelector(`.cell-${i}-${j}`)
            console.log('inner text', gBoard[i][j].isMarked)
            if (!(gBoard[i][j].isMarked) || (gBoard[i][j].isShown)) {
                if (gBoard[i][j].isMine) {
                    elCell1.innerText = ''
                    elCell1.style.borderColor = 'black'
                } else if ((gBoard[i][j].isShown)) {
                    continue
                } else if (gBoard[i][j].minesAroundCount > -1 || gBoard[i][j].minesAroundCount === '') {
                    elCell1.innerText = ''
                    elCell1.style.borderColor = 'black'
                }
            }
        }
    }
    elHintBtn.classList.remove('hint-on')
}

function undo() {
    if (!gGame.isOn) return
    var elLives = document.querySelector("h3 span")
    var elH2Span = document.querySelector("h2 span")
    var lastMove = gUndo.pop()
    console.log(lastMove)
    var elCell = document.querySelector(`.cell-${lastMove.i}-${lastMove.j}`)
    if (lastMove.rightClick) {
        elCell.innerText = ''
        gGame.markedCount--
        gBoard[lastMove.i][lastMove.j].isMarked = false
        elH2Span.innerText = gLevel.mines - gGame.markedCount
    } else if (gBoard[lastMove.i][lastMove.j].isMine) {
        elCell.style.backgroundColor = 'lightgray'
        gGame.lives++
        elLives.innerText += '❤️'
    } else {
        gBoard[lastMove.i][lastMove.j].isShown = false
        gGame.shownCount--
        elCell.classList.remove('cell-revealed')
        elCell.innerText = ''
        if (gBoard[lastMove.i][lastMove.j].isChecked) {gBoard[lastMove.i][lastMove.j].isChecked = false}
    }
}