document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.grid')
  const next = document.querySelector('.next')

  const scoreDisplay = document.querySelector('#score')
  const startBtn = document.querySelector('#start-button')

  const width = 10
  const height = 24

  grid.innerHTML = Array(width * height).fill('<div></div>').reduce((div1, div2) => div1 + div2)
  grid.innerHTML += Array(width).fill('<div class="taken"></div>').reduce((div1, div2) => div1 + div2)

  next.innerHTML = Array(49).fill('<div></div>').reduce((div1, div2) => div1 + div2)

  let squares = Array.from(document.querySelectorAll('.grid div'))
  let nextSquares = Array.from(document.querySelectorAll('.next div'))

  const nextWidth = 7
  let timerId

  const getMatrixForAWidth = (width) => {
     const lTetromino = [
       [1, width + 1, width * 2 + 1, 2],
       [width, width + 1, width + 2, width * 2 + 2],
       [1, width + 1, width * 2 + 1, width * 2],
       [width, width * 2, width * 2 + 1, width * 2 + 2],
     ]

     const zTetromino = [
       [0, width, width + 1, width * 2 + 1],
       [width + 1, width + 2, width * 2, width * 2 + 1],
       [0, width, width + 1, width * 2 + 1],
       [width + 1, width + 2, width * 2, width * 2 + 1],
     ]

     const tTetromino = [
       [1, width, width + 1, width + 2],
       [1, width + 1, width + 2, width * 2 + 1],
       [width, width + 1, width + 2, width * 2 + 1],
       [1, width, width + 1, width * 2 + 1],
     ]

     const oTetromino = [
       [0, 1, width, width + 1],
       [0, 1, width, width + 1],
       [0, 1, width, width + 1],
       [0, 1, width, width + 1],
     ]

     const iTetromino = [
       [1, width + 1, width * 2 + 1, width * 3 + 1],
       [width, width + 1, width + 2, width + 3],
       [1, width + 1, width * 2 + 1, width * 3 + 1],
       [width, width + 1, width + 2, width + 3],
     ]

     return [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino]
  }

  const adjustPositionNext = [15, 16, 16, 17, 16]


  const theTetrominoes = getMatrixForAWidth(width)
  const theTetrominoesForDisplayNext = getMatrixForAWidth(nextWidth).map((pieces, index) => [ ...pieces[0],  adjustPositionNext[index]])

  const getNewRandomTetromino = () => Math.floor(Math.random() * theTetrominoes.length)

  const getNewRandomColor = () => { return { r: Math.floor(Math.random() * 255), g:  Math.floor(Math.random() * 255), b:  Math.floor(Math.random() * 255) }}

  const hasSomeNeighborTakenBelow = () =>
    current.some((index) =>
      squares[currentPosition + index].classList.contains('taken')
    )

  const hasSomeNeighborTakenAtRight = () =>
    current.some(
      (index) =>
        squares[currentPosition + index + 1] &&
        squares[currentPosition + index + 1].classList.contains('taken')
    )

  const hasSomeNeighborTakenAtLeft = () =>
    current.some(
      (index) =>
        squares[currentPosition + index - 1] &&
        squares[currentPosition + index - 1].classList.contains('taken')
    )

  const pauseGame = () => {
    if (timerId) {
      clearInterval(timerId)
      timerId = null
    }
  }

  const resumeGame = () => {
    if (!timerId) {
      timerId = setInterval(moveDown, 1000)
    }
  }

  let score = 0

  let random = getNewRandomTetromino()
  let nextRandom = getNewRandomTetromino()

  let currentColor = getNewRandomColor()
  let nextColor = getNewRandomColor()

  let currentPosition = 4
  let currentRotation = 0

  let current = theTetrominoes[random][currentRotation]

  let nextUp = theTetrominoesForDisplayNext[nextRandom]

  const draw = () => {
    current.forEach(index => {
      squares[currentPosition + index].classList.add('tetromino')
      squares[currentPosition + index].style.backgroundColor = `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`
    })

    const nextPosition = [ ...nextUp ]
    const nextToDraw = nextPosition.splice(0, nextPosition.length - 1)
    const position = nextPosition[0]

    nextToDraw.forEach((index) => {
      nextSquares[index + position].classList.add('tetromino')
      nextSquares[
        index + position
      ].style.backgroundColor = `rgb(${nextColor.r}, ${nextColor.g}, ${nextColor.b})`
    })
  }

  const unDraw = () => {
    current.forEach((index) => {
      squares[currentPosition + index].classList.remove('tetromino')
      squares[currentPosition + index].style.backgroundColor = 'transparent'
    })

    nextSquares.forEach((_, index) => {
      nextSquares[index].classList.remove('tetromino')
      nextSquares[index].style.backgroundColor = 'transparent'
    })
  }

  const moveDown = () => {
    unDraw()
    currentPosition += width
    draw()
    freeze()
  }

  const freeze = () => {
    if (current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
      current.forEach(index => squares[currentPosition + index].classList.add('taken'))
      random = nextRandom
      currentColor = nextColor
      nextRandom = getNewRandomTetromino()
      nextColor = getNewRandomColor()
      currentPosition = 4
      currentRotation = 0
      current = theTetrominoes[random][currentRotation]
      nextUp = theTetrominoesForDisplayNext[nextRandom]
      unDraw()
      const hasLines = hasSomeLineCompleted()
      addScore()
      gameOver()
      setTimeout(() => {
        draw()
      }, hasLines ? 400 : 0)
    }
  }

  const hasSomeLineCompleted = () => {
    for (let i = 40; i < (width * height) - 1; i += width) {
      const row = Array(10).fill(i).map((_, index) => index + i)
      if (row.every(index => squares[index].classList.contains('taken'))) {
        return true
      }
    }
  }

  const addScore = () => {

    for (let i = 40; i < (width * height) - 1; i += width) {
      const row = Array(10).fill(i).map((_, index) => index + i)

      if (row.every(index => squares[index].classList.contains('taken'))) {
        score += width
        scoreDisplay.innerHTML = score

        let explodeColor = 'white'
        row.forEach((index) => {
          squares[index].style.backgroundColor = explodeColor
        })

        pauseGame()

        const interval = setInterval(() => {
           explodeColor = explodeColor === 'white' ? 'red' : 'white'
           row.forEach((index) => {
             squares[index].style.backgroundColor = explodeColor
           })
        }, 100)

        setTimeout(() => {
          clearInterval(interval)
          row.forEach((index) => {
            squares[index].style.backgroundColor = 'transparent'
            squares[index].classList.remove('taken')
          })
          const squaresRemoved = squares.splice(i, width)
          squares = squaresRemoved.concat(squares)
          squares.forEach(cell => grid.appendChild(cell))
          resumeGame()
        }, 400)
      }
    }
  }

  const gameOver = () => {
    if (hasSomeNeighborTakenBelow()) {
      pauseGame()
      scoreDisplay.innerHTML = 'Game Over! Your score: ' + score
    }
  }

  const moveLeft = () => {

    const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0)

    if (!isAtLeftEdge && !hasSomeNeighborTakenBelow() && !hasSomeNeighborTakenAtLeft()) {
      unDraw()
      currentPosition -= 1
      draw()
    }
  }

  const moveRight = () => {

    const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1)

    if (!isAtRightEdge && !hasSomeNeighborTakenBelow() && !hasSomeNeighborTakenAtRight()) {
      unDraw()
      currentPosition += 1
      draw()
    }
  }

  const rotate = () => {
    unDraw()
    currentRotation = currentRotation === current.length - 1 ? 0 : currentRotation + 1
    current = theTetrominoes[random][currentRotation]
    draw()
  }

  const control = ({ keyCode }) => {
    if (!timerId) return

    if (keyCode === 97) {
      moveLeft()
    } else if (keyCode === 119) {
      rotate()
    } else if (keyCode === 100) {
      moveRight()
    } else if (keyCode === 115) {
      moveDown()
    }
  }

  document.addEventListener('keypress', control)

  startBtn.addEventListener('click', () => {
    if (timerId) {
      pauseGame()
    } else {
      draw()
      resumeGame()
    }
  })

})
