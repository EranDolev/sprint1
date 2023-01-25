'use strict'

// console.log('hello util')

window.addEventListener('contextmenu', (event) => {
    event.preventDefault()
})

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

function renderBoard(mat, selector) {

    var strHTML = '<table><tbody>'
    var cell

    for (var i = 0; i < mat.length; i++) {

        strHTML += '<tr>'
        for (var j = 0; j < mat[0].length; j++) {

            if (mat[i][j].isMine) {
                cell = MINE
            } else { cell = mat[i][j].minesAroundCount }
            const className = `cell cell-${i}-${j}`

            strHTML += `<td onclick="onCellClicked(this, ${i}, ${j})" oncontextmenu="onCellMarked(this, ${i}, ${j})" class="${className}"></td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'

    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML
}