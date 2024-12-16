function generateInput() {
  const COLS = 20;
  const ROWS = COLS;

  const map = new Array(ROWS).fill(null).map(() => new Array(COLS).fill("."));

  for (let row = 0; row < ROWS; row++) {
    map[row][0] = "#";
    map[row][COLS - 1] = "#";
  }

  for (let col = 0; col < COLS; col++) {
    map[0][col] = "#";
    map[ROWS - 1][col] = "#";
  }

  let obstacleCount = Math.floor((ROWS * COLS) / 25);

  while (obstacleCount) {
    const row = Math.round(Math.random() * (ROWS - 1));
    const col = Math.round(Math.random() * (COLS - 1));

    if (map[row][col] === ".") {
      map[row][col] = "#";
      obstacleCount--;
    }
  }

  let boxCount = Math.floor((ROWS * COLS) / 5);

  while (boxCount) {
    const row = Math.round(Math.random() * (ROWS - 1));
    const col = Math.round(Math.random() * (COLS - 1));

    if (map[row][col] === ".") {
      map[row][col] = "O";
      boxCount--;
    }
  }

  let robotCount = 1;
  while (robotCount) {
    const row = Math.round(Math.random() * (ROWS - 1));
    const col = Math.round(Math.random() * (COLS - 1));

    if (map[row][col] === ".") {
      map[row][col] = "@";
      robotCount--;
    }
  }

  return map.map((row) =>
    row
      .map((val) => (val === "@" ? "@." : val === "O" ? "[]" : val.repeat(2)))
      .join("")
      .split(""),
  );
}

const matrix = generateInput();

const directions = [
  [-1, 0],
  [0, 1],
  [1, 0],
  [0, -1],
];

let curPos = [0, 0];

for (let row = 0; row < matrix.length; row++) {
  for (let col = 0; col < matrix[row].length; col++) {
    if (matrix[row][col] === "@") {
      curPos = [row, col];
    }
  }
}

function moveRobot(dir) {
  let curDir;
  switch (dir) {
    case "^":
      curDir = 0;
      break;
    case ">":
      curDir = 1;
      break;
    case "v":
      curDir = 2;
      break;
    case "<":
      curDir = 3;
      break;
    default:
      return;
  }

  let nextPos = curPos.map((pos, i) => pos + directions[curDir][i]);
  if (matrix[nextPos[0]][nextPos[1]] === "#") {
    return;
  }

  curPos = move(curPos, curDir);
  return;
}

function swap(curPos, nextPos) {
  const cur = matrix[curPos[0]][curPos[1]];
  matrix[curPos[0]][curPos[1]] = matrix[nextPos[0]][nextPos[1]];
  matrix[nextPos[0]][nextPos[1]] = cur;
}

function move(curPos, curDir) {
  const nextPos = [
    curPos[0] + directions[curDir][0],
    curPos[1] + directions[curDir][1],
  ];
  const queue = [curPos];
  const stack = [];
  const visited = new Set();

  while (queue.length) {
    const [curRow, curCol] = queue.shift();
    const key = `${curRow},${curCol}`;
    if (visited.has(key)) {
      continue;
    }
    visited.add(key);
    stack.push([curRow, curCol]);
    let nextRow = curRow + directions[curDir][0];
    let nextCol = curCol + directions[curDir][1];

    if (matrix[nextRow][nextCol] === "#") {
      return curPos;
    }
    if (["[", "]"].includes(matrix[nextRow][nextCol])) {
      queue.push([nextRow, nextCol]);
      if (directions[curDir][0]) {
        queue.push([
          nextRow,
          nextCol + (matrix[nextRow][nextCol] === "[" ? 1 : -1),
        ]);
      }
    }
    if (directions[curDir][0]) {
      if (matrix[curRow][curCol] === "[") {
        nextCol++;
      } else {
        nextCol--;
      }
    }
  }

  while (stack.length) {
    const curPos = stack.pop();
    swap(
      curPos,
      curPos.map((val, i) => val + directions[curDir][i]),
    );
  }

  return nextPos;
}

let isReady = false;

function render() {
  document.querySelector("#game").innerHTML =
    `<p>${matrix.map((row) => row.join("")).join("<br>")}</p>`;
}

function getDistance(screenX, screenY) {
  const width = document.body.clientWidth;
  const height = document.body.clientHeight;

  const top = [width / 2, 0];
  const bot = [width / 2, height];
  const left = [width / 4, height / 2];
  const right = [(width * 3) / 4, height / 2];

  return {
    top: Math.abs(top[0] - screenX) + Math.abs(top[1] - screenY),
    bot: Math.abs(bot[0] - screenX) + Math.abs(bot[1] - screenY),
    left: Math.abs(left[0] - screenX) + Math.abs(left[1] - screenY),
    right: Math.abs(right[0] - screenX) + Math.abs(right[1] - screenY),
  };
}

function onKeydown(e) {
  switch (e.code) {
    case "KeyH":
    case "ArrowLeft":
      moveRobot("<");
      render();
      break;
    case "KeyJ":
    case "ArrowDown":
      moveRobot("v");
      render();
      break;
    case "KeyK":
    case "ArrowUp":
      moveRobot("^");
      render();
      break;
    case "KeyL":
    case "ArrowRight":
      moveRobot(">");
      render();
      break;
  }
}

function onClick(e) {
  const distances = getDistance(e.screenX, e.screenY);

  switch (Object.entries(distances).sort((a, b) => a[1] - b[1])[0][0]) {
    case "left":
      moveRobot("<");
      render();
      break;
    case "bot":
      moveRobot("v");
      render();
      break;
    case "top":
      moveRobot("^");
      render();
      break;
    case "right":
      moveRobot(">");
      render();
      break;
  }
}

function setupGame() {
  if (isReady) {
    return;
  }
  render();

  document.addEventListener("keydown", onKeydown);

  document.addEventListener("click", onClick);

  isReady = true;
}

document.addEventListener("readystatechange", () => {
  setupGame();
});
