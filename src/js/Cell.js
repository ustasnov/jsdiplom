export default class Cell {
  constructor(row, column, boardSize) {
    this.row = row;
    this.column = column;
    this.boardSize = boardSize;
  }

  static byIndex(index, boardSize) {
    return new this(
      Math.floor(index / boardSize),
      (index + boardSize) % boardSize,
      boardSize,
    );
  }

  get index() {
    return this.row * this.boardSize + this.column;
  }
}
