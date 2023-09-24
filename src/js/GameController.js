/* eslint-disable max-len */
import Bowman from './Bowman';
import Swordsman from './Swordsman';
import Magician from './Magician';
import Vampire from './Vampire';
import Undead from './Undead';
import Daemon from './Daemon';
import themes from './themes';
import PositionedCharacter from './PositionedCharacter';
import { randomInteger, generateTeam } from './generators';
import Cell from './Cell';
import Team from './Team';
import GamePlay from './GamePlay';
import cursors from './cursors';
import { calculateCellsForMove, calculateCellsForAttack, roundToInt } from './utils';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.rounds = 4;
    this.gameRound = 0;
    this.score = [0, 0];
    this.positionedCharacters = [];
    this.playerTypes = [Bowman, Swordsman, Magician];
    this.rivalTypes = [Vampire, Undead, Daemon];
    this.playerTeam = new Team([]);
    this.rivalTeam = new Team([]);
    this.playerAlive = 4;
    this.rivalAlive = 4;
    this.selectedIndex = -1;
    this.selectedGreenIndex = -1;
    this.selectedRedIndex = -1;
    this.cellsForMove = [];
    this.cellsForAttack = [];
    this.gameState = {
      gameRound: 1,
      playerTurn: true,
      characters: null,
      selectedIndex: -1,
    };
  }

  get theme() {
    let currentTheme = 'prairie';
    switch (this.gameRound) {
      case 2:
        currentTheme = themes.desert;
        break;
      case 3:
        currentTheme = themes.arctic;
        break;
      case 4:
        currentTheme = themes.mountain;
        break;
    }
    return currentTheme;
  }

  placeTeam(curTeam) {
    const bs = this.gamePlay.boardSize;
    const tbs = bs * 2;
    const occupiedPositions = [];
    const columns = [0, 1];
    if (curTeam == this.rivalTeam) {
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
      this.positionedCharacters.push(new PositionedCharacter(element, curIndex));
    });
  }

  init() {
    this.gameRound = 0;
    this.score[0] = 0;
    this.score[1] = 0;

    this.playerTeam = generateTeam(this.playerTypes, 2, 4); // создаем команду игрока
    this.rivalTeam = generateTeam(this.rivalTypes, 2, 4); // создаем команду противника
    this.startRound();

    this.gamePlay.addNewGameListener(this.onNewGame.bind(this));
    this.gamePlay.addSaveGameListener(this.onSaveGame.bind(this));
    this.gamePlay.addLoadGameListener(this.onLoadGame.bind(this));
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));

    this.gameState.characters = this.positionedCharacters;
    this.stateService.save(this.gameState);
  }

  gameOver(byEndOfGame = true) {
    if (!byEndOfGame) {
      if (!confirm('Начать новую игру?')) {
        return true;
      }
    }
    if (this.selectedIndex > -1) {
      this.gamePlay.deselectCell(this.selectedIndex);
      this.selectedIndex = -1;
    }
    this.positionedCharacters = [];
    this.gamePlay.redrawPositions(this.positionedCharacters);
    this.gamePlay.cellClickListeners = [];
    this.gamePlay.cellEnterListeners = [];

    if (byEndOfGame) {
      if (this.score[0] > this.score[1]) {
        GamePlay.showMessage(`Игра окончена: вы выиграли. Общий счет ${this.score[0]}:${this.score[1]}`);
      } else {
        GamePlay.showMessage(`Игра окончена: вы проиграги. Общий счет ${this.score[0]}:${this.score[1]}`);
      }
    } else {
      this.gamePlay.newGameListeners = [];
      this.gamePlay.saveGameListeners = [];
      this.gamePlay.loadGameListeners = [];
    }
    return true;
  }

  startRound() {
    this.gameRound += 1;
    this.gameState.playerTurn = true;
    this.playerAlive = 4;
    this.rivalAlive = 4;
    this.positionedCharacters = [];
    this.gamePlay.drawUi(this.theme);
    this.placeTeam(this.playerTeam); // размещаем команду игрока
    this.placeTeam(this.rivalTeam); // размещаем команду противника
    this.gamePlay.redrawPositions(this.positionedCharacters);
  }

  nextRound() {
    let youWin = true;
    if (this.playerTeam.characters.indexOf(this.positionedCharacters[0].character) > -1) {
      this.score[0] += 1;
    } else {
      this.score[1] += 1;
      youWin = false;
    }
    if (this.gameRound === this.rounds) {
      this.gameOver();
    } else {
      // повышаем всем здоровье и уровень выжившим персонажам
      Array.from(this.playerTeam.characters).forEach((el) =>
        el.increaseLevel(el.level + 1));
      Array.from(this.rivalTeam.characters).forEach((el) =>
        el.increaseLevel(el.level + 1));
      if (this.selectedIndex > -1) {
        this.gamePlay.deselectCell(this.selectedIndex);
        this.selectedIndex = -1;
      }
      this.positionedCharacters = [];
      this.gamePlay.drawUi(this.theme);
      if (youWin) {
        GamePlay.showMessage(`Вы выиграли этот раунд. Общий счет ${this.score[0]}:${this.score[1]}`);
      } else {
        GamePlay.showMessage(`Вы проиграли этот раунд. Общий счет ${this.score[0]}:${this.score[1]}`);
      }
      this.startRound(); // стартуем следующий раунд
    }
  }

  getCellsForMove(posCharacter) {
    const cells = calculateCellsForMove(posCharacter, this.gamePlay.boardSize);
    // перемещаться можно только на незанятые ячейки
    this.cellsForMove = cells.filter((value) =>
      (typeof Array.from(this.positionedCharacters).find((el) => el.position === value)) === 'undefined');
  }

  getCellsForAttack(posCharacter) {
    this.cellsForAttack = calculateCellsForAttack(posCharacter, this.gamePlay.boardSize);
  }

  moveCharacter(indexFrom, indexTo) {
    const posCharacter = Array.from(this.positionedCharacters).find((el) => el.position === indexFrom);
    posCharacter.position = indexTo;
    this.gamePlay.redrawPositions(this.positionedCharacters);
    this.onCellClick(indexTo);
    this.passMove(); // передаем ход
  }

  attack(attacker, targetIndex) {
    const target = Array.from(this.positionedCharacters).find((el) => el.position === targetIndex);
    const damage = roundToInt(Math.max(attacker.character.attack - target.character.defence, attacker.character.attack * 0.1));
    this.gamePlay.showDamage(target.position, damage).then(() => {
      target.character.health = Math.max(target.character.health - damage, 0);
      if (target.character.health === 0) {
        this.died(target);
        if (this.playerAlive > 0 && this.rivalAlive > 0) {
          console.log(`Player alive: ${this.playerAlive}, rival alive: ${this.rivalAlive}`);
        } else {
          console.log(`End of the round - Player alive: ${this.playerAlive}, rival alive: ${this.rivalAlive}`);
          this.nextRound(); // завершаем раунд или игру
          return;
        }
      }
      this.gamePlay.redrawPositions(this.positionedCharacters);
      this.passMove(); // передаем ход
    });
  }

  died(posCharacter) {
    if (posCharacter.position === this.selectedIndex) {
      this.gamePlay.deselectCell(this.selectedIndex);
      this.selectedIndex = -1;
    }
    if (posCharacter.position === this.selectedRedIndex) {
      this.gamePlay.deselectCell(this.selectedRedIndex);
      this.selectedRedIndex = -1;
    }
    if (this.playerTeam.characters.indexOf(posCharacter.character) > -1) {
      console.log('Атакован персонаж игрока');
      this.playerAlive -= 1;
    } else {
      console.log('Атакован персонаж противника');
      this.rivalAlive -= 1;
    }
    this.positionedCharacters.splice(this.positionedCharacters.indexOf(posCharacter), 1);

    this.gamePlay.redrawPositions(this.positionedCharacters);
  }

  getTargets() {
    const targets = Array.from(this.cellsForAttack).filter((cell) => {
      const posCharacter = Array.from(this.positionedCharacters).find((element) => element.position === cell);
      if (posCharacter) {
        return this.playerTeam.characters.indexOf(posCharacter.character) > -1;
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
      this.onCellClick(this.selectedIndex);
    }
  }

  rivalTurn() {
    // определяем кто в строю у соперника
    const alive = Array.from(this.positionedCharacters).filter((element) =>
      this.rivalTeam.characters.indexOf(element.character) > -1);
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
    const posCharacter = Array.from(this.positionedCharacters).find((el) => el.position === index);
    if (posCharacter) { // кликнули на занятую ячейку
      if (this.playerTeam.characters.indexOf(posCharacter.character) !== -1) { // ячейка занята персонажем игрока
        if (this.selectedIndex !== -1) { // снимаем выделение с ранее выбранной ячейки
          this.gamePlay.deselectCell(this.selectedIndex);
        }
        this.gamePlay.selectCell(index);
        this.selectedIndex = index;
        this.gameState.selectedIndex = index;
        this.stateService.save(this.gameState);
        // вычисляем доступные для перемещения и атаки поля
        this.getCellsForMove(posCharacter);
        this.getCellsForAttack(posCharacter);
      } else if (this.selectedIndex === -1) { // ячейка занята персонажем противника, персонаж игрока для хода еще не выбран
        GamePlay.showError('Этот персонаж не из вашей команды!');
      } else if (this.cellsForAttack.indexOf(index) === -1) {
        GamePlay.showError('Не достаточно расстояния для атаки!');
      } else { // aтакуем выбранным персонажем
        const attacker = Array.from(this.positionedCharacters).find((el) => el.position === this.selectedIndex);
        this.attack(attacker, index);
      }
    } else if (this.selectedGreenIndex === -1) { // кликнули на не занятую ячейку, но персонажу не хватает дистанции, чтобы дойти
      GamePlay.showError('Сюда нельзя ходить!');
    } else { // перемещаем персонаж
      this.moveCharacter(this.selectedIndex, this.selectedGreenIndex);
    }
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
    if (this.selectedGreenIndex !== -1 && this.selectedIndex !== this.selectedGreenIndex) {
      this.gamePlay.deselectCell(this.selectedGreenIndex);
      this.selectedGreenIndex = -1;
    }
    if (this.selectedRedIndex !== -1 && this.selectedIndex !== this.selectedRedIndex) {
      this.gamePlay.deselectCell(this.selectedRedIndex);
      this.selectedRedIndex = -1;
    }
    const posCharacter = Array.from(this.positionedCharacters).find((el) => el.position === index);
    if (posCharacter) {
      if (this.playerTeam.characters.indexOf(posCharacter.character) !== -1) { // свой персонаж
        this.gamePlay.setCursor(cursors.pointer);
      } else if (this.rivalTeam.characters.indexOf(posCharacter.character) !== -1) { // персонаж противника
        if (this.cellsForAttack.indexOf(posCharacter.position) !== -1 && this.selectedIndex !== -1) { // выбран персонаж игрока и персонаж противника доступен для атаки
          this.gamePlay.setCursor(cursors.crosshair);
          this.gamePlay.selectCell(index, 'red');
          this.selectedRedIndex = index;
        } else {
          this.gamePlay.setCursor(cursors.notallowed);
        }
      }
      this.gamePlay.showCellTooltip(posCharacter.character.getTooltip(), index);
    } else if (this.selectedIndex !== -1 && this.cellsForMove.indexOf(index) !== -1) { // выбран персонаж игрока и поле доступно для перемещения
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
    if (!this.gameOver(false)) {
      return;
    }
    this.init();
  }

  onSaveGame() {

  }

  onLoadGame() {

  }
}
