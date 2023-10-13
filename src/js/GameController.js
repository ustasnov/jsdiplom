/* eslint-disable max-len */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-alert */

import themes from './themes';
import Bowman from './Bowman';
import Swordsman from './Swordsman';
import Magician from './Magician';
import Vampire from './Vampire';
import Undead from './Undead';
import Daemon from './Daemon';
import PositionedCharacter from './PositionedCharacter';
import Cell from './Cell';
import GamePlay from './GamePlay';
import cursors from './cursors';
import GameState from './GameState';
import Team from './Team';
import { randomInteger, generateTeam } from './generators';
import { calculateCellsForMove, calculateCellsForAttack, roundToInt } from './utils';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.characterCount = 4;
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.rounds = 4;
    this.selectedGreenIndex = -1;
    this.selectedRedIndex = -1;
    this.cellsForMove = [];
    this.cellsForAttack = [];
    this.gameState = new GameState();
    this.chractersTypes = [
      [Bowman, Swordsman, Magician],
      [Vampire, Undead, Daemon]
    ];
  }

  get theme() {
    return Object.values(themes)[this.gameState.gameRound - 1] ?? themes.prairie;
  }

  placeTeam(curTeam) {
    const bs = this.gamePlay.boardSize;
    const tbs = bs * 2;
    const occupiedPositions = [];
    const columns = [0, 1];
    if (curTeam === this.gameState.teams[1]) {
      columns[0] = bs - 2;
      columns[1] = bs - 1;
    }

    Array.from(curTeam.characters).forEach((element) => {
      let randIndex = randomInteger(0, tbs - 1);
      while (occupiedPositions.indexOf(randIndex) > -1) {
        randIndex = randomInteger(0, tbs - 1);
      }
      occupiedPositions.push(randIndex);
      const curIndex = randIndex < bs
        ? new Cell(randIndex, columns[0], bs).index
        : new Cell(randIndex - bs, columns[1], bs).index;
      this.gameState.positionedCharacters.push(new PositionedCharacter(element, curIndex));
    });
  }

  addListeners() {
    this.gamePlay.addNewGameListener(this.onNewGame.bind(this));
    this.gamePlay.addSaveGameListener(this.onSaveGame.bind(this));
    this.gamePlay.addLoadGameListener(this.onLoadGame.bind(this));
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
  }

  clearButtonsListeners() {
    this.gamePlay.newGameListeners = [];
    this.gamePlay.saveGameListeners = [];
    this.gamePlay.loadGameListeners = [];
  }

  clearMouseListeners() {
    this.gamePlay.cellClickListeners = [];
    this.gamePlay.cellEnterListeners = [];
  }

  init() {
    this.gameState.gameRound = 0;
    this.gameState.score[0] = 0;
    this.gameState.score[1] = 0;

    for (let i = 0; i < this.gameState.teams.length; i += 1) {
      this.gameState.teams[i] = Team.create(i, this.chractersTypes[i], 2, this.characterCount);
    }

    this.startRound();
    this.addListeners();
  }

  gameOver(byEndOfGame = true) {
    if (!byEndOfGame) {
      if (!confirm('Начать новую игру?')) {
        return true;
      }
    }
    if (this.gameState.selectedIndex > -1) {
      this.gamePlay.deselectCell(this.gameState.selectedIndex);
      this.gameState.selectedIndex = -1;
    }
    this.gameState.positionedCharacters = [];
    this.gamePlay.redrawPositions(this.gameState.positionedCharacters);
    this.clearMouseListeners();

    setTimeout(() => {
      if (byEndOfGame) {
        if (this.gameState.score[0] > this.gameState.score[1]) {
          GamePlay.showMessage(`Игра окончена: вы выиграли. Общий счет ${this.gameState.score[0]}:${this.gameState.score[1]}`);
        } else {
          GamePlay.showMessage(`Игра окончена: вы проиграги. Общий счет ${this.gameStateis.score[0]}:${this.gameState.score[1]}`);
        }
      } else {
        this.clearButtonsListeners();
        this.init();
      }
    }, 200);
    return true;
  }

  startRound() {
    this.gameState.gameRound += 1;
    this.gameState.playerTurn = true;
    this.gameState.playerAlive = 4;
    this.gameState.rivalAlive = 4;
    this.gameState.positionedCharacters = [];
    this.gamePlay.drawUi(this.theme);
    // размещаем команды
    for (let i = 0; i < this.gameState.teams.length; i += 1) {
      this.placeTeam(this.gameState.teams[i]);
    }
    this.gamePlay.redrawPositions(this.gameState.positionedCharacters);
  }

  nextRound() {
    this.gameState.score[this.gameState.positionedCharacters[0].character.teamId] += 1;
    const youWin = this.gameState.positionedCharacters[0].character.teamId === 0;

    if (this.gameState.gameRound === this.rounds) {
      this.gameOver();
    } else {
      // повышаем всем здоровье и уровень выжившим персонажам
      for (let i = 0; i < this.gameState.teams.length; i += 1) {
        this.gameState.teams[i].increaseCharactersLevel();
      }

      if (this.gameState.selectedIndex > -1) {
        this.gamePlay.deselectCell(this.gameState.selectedIndex);
        this.gameState.selectedIndex = -1;
      }
      this.gameState.positionedCharacters = [];
      this.gamePlay.redrawPositions(this.gameState.positionedCharacters);

      setTimeout(() => {
        if (youWin) {
          GamePlay.showMessage(`Вы выиграли этот раунд. Общий счет ${this.gameState.score[0]}:${this.gameState.score[1]}`);
        } else {
          GamePlay.showMessage(`Вы проиграли этот раунд. Общий счет ${this.gameState.score[0]}:${this.gameState.score[1]}`);
        }
        this.startRound(); // стартуем следующий раунд
      }, 200);
    }
  }

  getCellsForMove(posCharacter) {
    const cells = calculateCellsForMove(posCharacter, this.gamePlay.boardSize);
    // перемещаться можно только на незанятые ячейки
    this.cellsForMove = cells.filter((value) => (typeof Array.from(this.gameState.positionedCharacters).find((el) => el.position === value)) === 'undefined');
  }

  getCellsForAttack(posCharacter) {
    this.cellsForAttack = calculateCellsForAttack(posCharacter, this.gamePlay.boardSize);
  }

  moveCharacter(indexFrom, indexTo) {
    const posCharacter = Array.from(this.gameState.positionedCharacters).find((el) => el.position === indexFrom);
    posCharacter.position = indexTo;
    this.gamePlay.redrawPositions(this.gameState.positionedCharacters);
    this.onCellClick(indexTo);
    this.passMove(); // передаем ход
  }

  attack(attacker, targetIndex) {
    const target = Array.from(this.gameState.positionedCharacters).find((el) => el.position === targetIndex);
    const damage = roundToInt(Math.max(attacker.character.attack - target.character.defence, attacker.character.attack * 0.1));
    this.gamePlay.showDamage(target.position, damage).then(() => {
      target.character.health = Math.max(target.character.health - damage, 0);
      if (target.character.health === 0) {
        this.died(target);
        if (this.gameState.playerAlive === 0 || this.gameState.rivalAlive === 0) {
          this.nextRound(); // завершаем раунд или игру
          return;
        }
      }
      this.gamePlay.redrawPositions(this.gameState.positionedCharacters);
      this.passMove(); // передаем ход
    });
  }

  died(posCharacter) {
    if (posCharacter.position === this.gameState.selectedIndex) {
      this.gamePlay.deselectCell(this.gameState.selectedIndex);
      this.gameState.selectedIndex = -1;
    }
    if (posCharacter.position === this.selectedRedIndex) {
      this.gamePlay.deselectCell(this.selectedRedIndex);
      this.selectedRedIndex = -1;
    }
    if (this.gameState.teams[0].has(posCharacter.character)) {
      this.gameState.playerAlive -= 1;
    } else {
      this.gameState.rivalAlive -= 1;
    }
    this.gameState.positionedCharacters.splice(this.gameState.positionedCharacters.indexOf(posCharacter), 1);

    this.gamePlay.redrawPositions(this.gameState.positionedCharacters);
  }

  getTargets() {
    const targets = Array.from(this.cellsForAttack).filter((cell) => {
      const posCharacter = Array.from(this.gameState.positionedCharacters).find((element) => element.position === cell);
      if (posCharacter) {
        return this.gameState.teams[0].has(posCharacter.character);
      }
      return false;
    });
    return targets;
  }

  passMove() {
    this.gameState.playerTurn = !this.gameState.playerTurn;
    if (!this.gameState.playerTurn) { // ход противника
      this.rivalTurn();
    } else {
      this.onCellClick(this.gameState.selectedIndex);
    }
  }

  rivalTurn() {
    // определяем кто в строю у соперника
    const alive = Array.from(this.gameState.positionedCharacters).filter((element) => this.gameState.teams[1].has(element.character));
    if (alive.length > 0) {
      // выбираем кандидата на выполнение атаки
      let candidate = null;
      let maxAttack = 0;
      let targets = [];
      for (let i = 0; i < alive.length; i += 1) {
        this.getCellsForAttack(alive[i]);
        targets = this.getTargets();
        if (targets.length > 0) { // есть цели для атаки
          if (alive[i].character.attack > maxAttack) { // выбираем персонаж с наибольшим уровнем атаки
            maxAttack = alive[i].character.attack;
            candidate = alive[i];
          }
        }
      }

      if (candidate) { // атакуем
        this.getCellsForAttack(candidate);
        targets = this.getTargets();
        this.attack(candidate, targets[randomInteger(0, targets.length - 1)]);
      } else { // выбираем кандидата на ход
        candidate = null;
        let maxDefence = 0;
        for (let i = 0; i < alive.length; i += 1) {
          if (alive[i].character.defence > maxDefence) { // выбираем персонаж с наибольшим уровнем защиты
            maxDefence = alive[i].character.defence;
            candidate = alive[i];
          }
        }
        if (candidate) { // ходим
          this.getCellsForMove(candidate);
          this.moveCharacter(candidate.position, this.cellsForMove[randomInteger(0, this.cellsForMove.length - 1)]);
        }
      }
    }
  }

  onCellClick(index) {
    if (!this.gameState.playerTurn || index === -1) {
      return;
    }
    const posCharacter = Array.from(this.gameState.positionedCharacters).find((el) => el.position === index);
    if (posCharacter) { // кликнули на занятую ячейку
      if (this.gameState.teams[0].has(posCharacter.character)) { // ячейка занята персонажем игрока
        if (this.gameState.selectedIndex !== -1) { // снимаем выделение с ранее выбранной ячейки
          this.gamePlay.deselectCell(this.gameState.selectedIndex);
        }
        this.gamePlay.selectCell(index);
        this.gameState.selectedIndex = index;
        // вычисляем доступные для перемещения и атаки поля
        this.getCellsForMove(posCharacter);
        this.getCellsForAttack(posCharacter);
      } else if (this.gameState.selectedIndex === -1) { // ячейка занята персонажем противника, персонаж игрока для хода еще не выбран
        GamePlay.showError('Этот персонаж не из вашей команды!');
      } else if (this.cellsForAttack.indexOf(index) === -1) {
        GamePlay.showError('Не достаточно расстояния для атаки!');
      } else { // aтакуем выбранным персонажем
        const attacker = Array.from(this.gameState.positionedCharacters).find((el) => el.position === this.gameState.selectedIndex);
        this.attack(attacker, index);
      }
    } else if (this.selectedGreenIndex === -1) { // кликнули на не занятую ячейку, но персонажу не хватает дистанции, чтобы дойти
      GamePlay.showError('Сюда нельзя ходить!');
    } else { // перемещаем персонаж
      this.moveCharacter(this.gameState.selectedIndex, this.selectedGreenIndex);
    }
  }

  onCellEnter(index) {
    if (this.selectedGreenIndex !== -1 && this.gameState.selectedIndex !== this.selectedGreenIndex) {
      this.gamePlay.deselectCell(this.selectedGreenIndex);
      this.selectedGreenIndex = -1;
    }
    if (this.selectedRedIndex !== -1 && this.gameState.selectedIndex !== this.selectedRedIndex) {
      this.gamePlay.deselectCell(this.selectedRedIndex);
      this.selectedRedIndex = -1;
    }
    const posCharacter = Array.from(this.gameState.positionedCharacters).find((el) => el.position === index);
    if (posCharacter) {
      if (this.gameState.teams[0].has(posCharacter.character)) { // персонаж игрока
        this.gamePlay.setCursor(cursors.pointer);
      } else if (this.gameState.teams[1].has(posCharacter.character)) { // персонаж противника
        if (this.cellsForAttack.indexOf(posCharacter.position) !== -1 && this.gameState.selectedIndex !== -1) { // выбран персонаж игрока и персонаж противника доступен для атаки
          this.gamePlay.setCursor(cursors.crosshair);
          this.gamePlay.selectCell(index, 'red');
          this.selectedRedIndex = index;
        } else {
          this.gamePlay.setCursor(cursors.notallowed);
        }
      }
      this.gamePlay.showCellTooltip(posCharacter.character.getTooltip(), index);
    } else if (this.gameState.selectedIndex !== -1 && this.cellsForMove.indexOf(index) !== -1) { // выбран персонаж игрока и поле доступно для перемещения
      this.gamePlay.setCursor(cursors.pointer);
      this.gamePlay.selectCell(index, 'green');
      this.selectedGreenIndex = index;
    } else {
      this.gamePlay.setCursor(cursors.notallowed);
    }
  }

  onCellLeave(index) {
    this.gamePlay.hideCellTooltip(index);
  }

  onNewGame() {
    this.gameOver(false);
  }

  onSaveGame() {
    if (!confirm('Сохранить игру?')) {
      return;
    }

    try {
      this.stateService.save(this.gameState);
    } catch (e) {
      GamePlay.showError(`Игра не сохранена из-за ошибки: ${e.message}`);
      return;
    }

    GamePlay.showMessage('Игра успешно сохранена.');
  }

  onLoadGame() {
    if (!confirm('Загрузить ранее сохраненную игру?')) {
      return;
    }

    let gameState = null;
    try {
      gameState = this.stateService.load();
    } catch (e) {
      GamePlay.showError(`Не удалось загрузить игру из-за ошибки: ${e.message}`);
      return;
    }

    this.selectedGreenIndex = -1;
    this.selectedRedIndex = -1;
    this.gameState.selectedIndex = -1;

    this.clearButtonsListeners();
    this.clearMouseListeners();
    this.addListeners();

    this.gameState = GameState.from(gameState);

    this.gamePlay.drawUi(this.theme);
    this.gamePlay.redrawPositions(this.gameState.positionedCharacters);

    this.onCellClick(this.gameState.selectedIndex);
  }
}
