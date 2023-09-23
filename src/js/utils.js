/* eslint-disable max-len */
import Cell from './Cell';

/**
 * @todo
 * @param index - индекс поля
 * @param boardSize - размер квадратного поля (в длину или ширину)
 * @returns строка - тип ячейки на поле:
 *
 * top-left
 * top-right
 * top
 * bottom-left
 * bottom-right
 * bottom
 * right
 * left
 * center
 *
 * @example
 * ```js
 * calcTileType(0, 8); // 'top-left'
 * calcTileType(1, 8); // 'top'
 * calcTileType(63, 8); // 'bottom-right'
 * calcTileType(7, 7); // 'left'
 * ```
 * */
export function calcTileType(index, boardSize) {
  // TODO: ваш код будет тут
  const cell = Cell.byIndex(index, boardSize);
  const maxIndex = boardSize - 1;

  if (cell.column === 0) {
    if (cell.row === 0) {
      return 'top-left';
    } if (cell.row === maxIndex) {
      return 'bottom-left';
    }
    return 'left';
  } if (cell.column === maxIndex) {
    if (cell.row === 0) {
      return 'top-right';
    } if (cell.row === maxIndex) {
      return 'bottom-right';
    }
    return 'right';
  }

  if (cell.row === 0) {
    return 'top';
  } if (cell.row === maxIndex) {
    return 'bottom';
  }
  return 'center';
}

export function calcHealthLevel(health) {
  if (health < 15) {
    return 'critical';
  }

  if (health < 50) {
    return 'normal';
  }

  return 'high';
}

export function calculateCellsForMove(posCharacter, boardSize) {
  const cellsForMove = [];
  const currentCell = Cell.byIndex(posCharacter.position, boardSize);
  const cellForMove = new Cell(currentCell.row, currentCell.column, boardSize);
  const rightMargin = Math.min(currentCell.column + posCharacter.character.distance, boardSize - 1);
  const leftMargin = Math.max(currentCell.column - posCharacter.character.distance, 0);
  const bottomMargin = Math.min(currentCell.row + posCharacter.character.distance, boardSize - 1);
  const topMargin = Math.max(currentCell.row - posCharacter.character.distance, 0);

  for (let i = 1; i <= posCharacter.character.distance; i += 1) {
    const toRight = currentCell.column + i;
    const toBottom = currentCell.row + i;
    const toLeft = currentCell.column - i;
    const toTop = currentCell.row - i;

    if (toRight <= rightMargin) {
      cellForMove.row = currentCell.row;
      cellForMove.column = toRight;
      cellsForMove.push(cellForMove.index); // вправо
    }

    if (toLeft >= leftMargin) {
      cellForMove.row = currentCell.row;
      cellForMove.column = toLeft;
      cellsForMove.push(cellForMove.index); // влево
    }

    if (toTop >= topMargin) {
      cellForMove.column = currentCell.column;
      cellForMove.row = toTop;
      cellsForMove.push(cellForMove.index); // вверх
    }

    if (toBottom <= bottomMargin) {
      cellForMove.column = currentCell.column;
      cellForMove.row = toBottom;
      cellsForMove.push(cellForMove.index); // вниз
    }

    if (toRight <= rightMargin && toTop >= topMargin) {
      cellForMove.row = toTop;
      cellForMove.column = toRight;
      cellsForMove.push(cellForMove.index); // вправо вверх
    }

    if (toLeft >= leftMargin && toTop >= topMargin) {
      cellForMove.row = toTop;
      cellForMove.column = toLeft;
      cellsForMove.push(cellForMove.index); // влево вверх
    }

    if (toLeft >= leftMargin && toBottom <= bottomMargin) {
      cellForMove.column = toLeft;
      cellForMove.row = toBottom;
      cellsForMove.push(cellForMove.index); // влево вниз
    }

    if (toRight <= rightMargin && toBottom <= bottomMargin) {
      cellForMove.row = toBottom;
      cellForMove.column = toRight;
      cellsForMove.push(cellForMove.index); // вправо вниз
    }
  }
  return cellsForMove;
}

export function calculateCellsForAttack(posCharacter, boardSize) {
  const cellsForAttack = [];
  const currentCell = Cell.byIndex(posCharacter.position, boardSize);
  const cellForAttack = new Cell(currentCell.row, currentCell.column, boardSize);
  const rightMargin = Math.min(currentCell.column + posCharacter.character.attackDistance, boardSize - 1);
  const leftMargin = Math.max(currentCell.column - posCharacter.character.attackDistance, 0);
  const bottomMargin = Math.min(currentCell.row + posCharacter.character.attackDistance, boardSize - 1);
  const topMargin = Math.max(currentCell.row - posCharacter.character.attackDistance, 0);

  for (let row = topMargin; row <= bottomMargin; row += 1) {
    for (let col = leftMargin; col <= rightMargin; col += 1) {
      cellForAttack.row = row;
      cellForAttack.column = col;
      cellsForAttack.push(cellForAttack.index);
    }
  }
  return cellsForAttack;
}
