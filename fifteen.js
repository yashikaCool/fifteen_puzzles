/* Sliding 15 puzzle */


var gamePiece;
var spaceY;
var spaceX;

var spaceposX = 3;
var spaceposY = 3;

var tmpposX = 0;
var tmpposY = 0;

var isRunning = 0;
let moves = 0;
let minute = 0;
let second = 0;
let subsecond = 0;
let utcstamp = 0;
let cron;

// Grid
var grid = [
  [1, 2, 3, 4],
  [5, 6, 7, 8],
  [9, 10, 11, 12],
  [13, 14, 15, 0],
];

window.onload = function () {
  var puzzleArea = document.getElementById("puzzlearea");
  gamePiece = puzzleArea.getElementsByTagName("div");
  for (var i = 0; i < gamePiece.length; i++) {
    // Used to position each puzzle piece
    var tmpwidth = gamePiece[i].offsetWidth;
    gamePiece[i].style.marginLeft = (i % 4) * (tmpwidth + 5) + "px";
    gamePiece[i].style.marginTop = ~~(i / 4) * (tmpwidth + 5) + "px";
    gamePiece[i].onmouseover = function () {
      if (checkMove(parseInt(this.innerHTML)) != 0) {
        // If a piece can be moved, change its style
        this.style.backgroundColor = "#78c078";
        this.style.cursor = "pointer";
      }
    };

    gamePiece[i].onmouseout = function () {
      // Reset piece style when mouse exits
      this.style.cursor = "default";
      this.style.backgroundColor = "#9ae09a";
    };

    gamePiece[i].onclick = function () {
      // Check if a piece can be moved, and process accordingly
      if (isRunning == 1) {
        if (checkMove(parseInt(this.innerHTML)) != 0) {
          // Swap the specified piece with blank
          swap(this.innerHTML - 1);
          moves += 1;
          document.getElementById("num_moves").innerText = moves;
          if (finish()) {
            // If all the 15 tiles are correctly placed, show an alert and end the game.
            win();
          }

          return;
        }
      }
    };
  }

  // Calculate the location of the blank
  spaceX = gamePiece[11].style.marginLeft;
  spaceY = gamePiece[14].style.marginTop;

  var shuffle = document.getElementById("shufflebutton");

  shuffle.onclick = () => shuffle_tiles();
};

// Function to shuffle the tiles
function shuffle_tiles() {
  for (var i = 0; i < 5; i++) {
    var sign = Math.random() < 0.5 ? -1 : 1;
    var dx = Math.random() < 0.5 ? 0 : 1;
    var dy = (dx + 1) % 2;

    tmpposX = spaceposX + dx * sign;
    tmpposY = spaceposY + dy * sign;

    // Randomly generate a valid position to move, with some math-magic
    tmpposX = Math.abs((tmpposX % 4) + ~~(tmpposX / 4) * 2);
    tmpposY = Math.abs((tmpposY % 4) + ~~(tmpposY / 4) * 2);
    if (checkMove(grid[tmpposX][tmpposY]) != 0) {
      swap(grid[tmpposX][tmpposY] - 1);
    } else {
      continue;
    }
  }

  moves = 0;
  document.getElementById("num_moves").innerText = moves;
  reset();
  startTimer();

  isRunning = 1;
}

function checkMove(position) {
  // Find the position of the tile in the grid matrix
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (grid[i][j] == position) {
        tmpposX = i;
        tmpposY = j;
      }
    }
  }

  // Check if the tile can be moved into an empty space, return 0 if it cannot.
  // Return a number denoting direction if it can.
  if (Math.abs(spaceposX - tmpposX) + Math.abs(spaceposY - tmpposY) == 1) {
    return spaceposX - tmpposX + 2 * (spaceposY - tmpposY);
  } else {
    return 0;
  }
}

function win() {
  // Process the win event
  pause();
  isRunning = 0;
  var ctime = new Date().getTime();
  // If the user is logged in, add the game details to the database.
  $.post("/history", { time: ctime - utcstamp, num_moves: moves });
  setTimeout(() => {
    alert("Winner! ... Shuffle and Play Again");
  }, 100);
  pause();
}

function finish() {
  // Checks if the user has aligned all tiles correctly
  var flag = true;

  for (var i = 0; i < grid.length; i++) {
    var row = grid[i];
    for (var j = 0; j < row.length; j++) {
      if (!(grid[i][j] == (4 * i + j + 1) % 16)) {
        flag = false;
      }
    }
  }

  return flag;
}

function swap(position) {
  // Swap the puzzle piece with blank

  grid[tmpposX][tmpposY] = 0;

  grid[spaceposX][spaceposY] = parseInt(position + 1);

  spaceposX = tmpposX;
  spaceposY = tmpposY;

  var tmpX = gamePiece[position].style.marginLeft;
  gamePiece[position].style.marginLeft = spaceX;
  spaceX = tmpX;

  var tmpY = gamePiece[position].style.marginTop;
  gamePiece[position].style.marginTop = spaceY;
  spaceY = tmpY;
}

function startTimer() {
  utcstamp = new Date().getTime();
  clearInterval(cron);
  cron = setInterval(() => {
    timer();
  }, 10);
}

function pause() {
  clearInterval(cron);
}

function reset() {
  minute = 0;
  second = 0;
  subsecond = 0;
  document.getElementById("minute").innerText = "00";
  document.getElementById("second").innerText = "00";
  document.getElementById("millisecond").innerText = "00";
}

// Timer function to store time elapsed
function timer() {
  var ctime = new Date().getTime();
  subsecond = ~~(((ctime - utcstamp) % 1000) / 10);
  second = ~~((ctime - utcstamp) / 1000) % 60;
  minute = ~~((ctime - utcstamp) / 60000);
  document.getElementById("minute").innerText = minute;
  document.getElementById("second").innerText = second;
  document.getElementById("millisecond").innerText = subsecond;
}
