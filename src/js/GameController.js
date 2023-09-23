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
import { calculateCellsForMove, calculateCellsForAttack } from './utils';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.positionedCharacters = [];
    this.playerTeam = new Team([]);
    this.rivalTeam = new Team([]);
    this.selectedIndex = -1;
    this.selectedGreenIndex = -1;
    this.selectedRedIndex = -1;
    this.cellsForMove = [];
    this.cellsForAttack = [];
    this.gameState = {
      playerTurn: true,
      characters: null,
      selectedIndex: -1,
    };
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
    this.gamePlay.drawUi(themes.mountain);

    const bs = this.gamePlay.boardSize;
    const tbs = bs * 2;
    const playerTypes = [Bowman, Swordsman, Magician];
    const rivalTypes = [Vampire, Undead, Daemon];
    const occupiedPositions = [];

    this.playerTeam = generateTeam(playerTypes, 2, 4);
    Array.from(this.playerTeam.characters).forEach((element) => {
      let randIndex = randomInteger(0, tbs - 1);
      while (occupiedPositions.indexOf(randIndex) !== -1) {
        randIndex = randomInteger(0, tbs - 1);
      }
      occupiedPositions.push(randIndex);
      const curIndex = randIndex < bs
        ? new Cell(randIndex, 0, bs).index
        : new Cell(randIndex - bs, 1, bs).index;
      const positionedCharacter = new PositionedCharacter(element, curIndex);
      this.positionedCharacters.push(positionedCharacter);
    });

    this.rivalTeam = generateTeam(rivalTypes, 2, 4);
    Array.from(this.rivalTeam.characters).forEach((element) => {
      let randIndex = randomInteger(0, tbs - 1);
      while (occupiedPositions.indexOf(randIndex) !== -1) {
        randIndex = randomInteger(0, tbs - 1);
      }
      occupiedPositions.push(randIndex);
      const curIndex = randIndex < bs
        ? new Cell(randIndex, bs - 2, bs).index
        : new Cell(randIndex - bs, bs - 1, bs).index;
      const posCharacter = new PositionedCharacter(element, curIndex);
      this.positionedCharacters.push(posCharacter);
    });

    this.gamePlay.redrawPositions(this.positionedCharacters);

    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));

    this.gameState.characters = this.positionedCharacters;
    this.stateService.save(this.gameState);
  }

  getCellsForMove(posCharacter) {
    const cells = calculateCellsForMove(posCharacter, this.gamePlay.boardSize);
    // перемещаться можно только на незанятые ячейки
    this.cellsForMove = cells.filter((value) => typeof Array.from(this.positionedCharacters).find((posIdx) => posIdx === value) === 'undefined');
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
    const damage = Math.max(attacker.character.attack - target.character.defence, attacker.character.attack * 0.1);
    this.gamePlay.showDamage(target.position, damage).then(() => {
      target.character.health -= damage;
      if (target.character.health <= 0) {
        this.died(target);
      } else {
        this.gamePlay.redrawPositions(this.positionedCharacters);
      }
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
    this.positionedCharacters.splice(this.positionedCharacters.indexOf(posCharacter), 1);
    this.gamePlay.redrawPositions(this.positionedCharacters);
  }

  getTargets() {
    const targets = Array.from(this.cellsForAttack).filter((cell) => {
      const posCharacter = Array.from(this.positionedCharacters).find((element) => element.position === cell);
      return posCharacter ? this.playerTeam.characters.indexOf(posCharacter.character) !== -1 : false;
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
    const alive = Array.from(this.positionedCharacters).filter((element) => this.rivalTeam.characters.indexOf(element.character) !== -1);
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
        this.attack(candidate, targets[0]);
      } else { // выбираем кандидата на ход
        let maxDefence = 0;
        for (let i = 0; i < alive.length; i += 1) {
          if (alive[i].character.defence > maxDefence) { // выбираем персонаж с наибольшим уровнем защиты
            maxDefence = alive[i].character.defence;
            candidate = alive[i];
          }
        }
        if (candidate) { // ходим
          this.getCellsForMove(candidate);
          const randIndex = randomInteger(0, this.cellsForMove.length - 1);
          this.moveCharacter(candidate.position, randIndex);
        } else {
          this.passMove(); // передаем ход
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
}
