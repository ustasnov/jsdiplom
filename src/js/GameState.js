/* eslint-disable max-len */

import Bowman from './Bowman';
import Swordsman from './Swordsman';
import Magician from './Magician';
import Vampire from './Vampire';
import Undead from './Undead';
import Daemon from './Daemon';
import PositionedCharacter from './PositionedCharacter';
import Team from './Team';

export default class GameState {
  constructor() {
    this.playerTeam = null;
    this.rivalTeam = null;
    this.score = [0, 0];
    this.gameRound = 0;
    this.playerTurn = true;
    this.playerAlive = 4;
    this.rivalAlive = 4;
    this.positionedCharacters = [];
    this.selectedIndex = -1;

    this.playerTypes = {
      bowman: Bowman,
      swordsman: Swordsman,
      magician: Magician,
    };

    this.rivalTypes = {
      vampire: Vampire,
      undead: Undead,
      daemon: Daemon,
    };
  }

  createCharacter(obj) {
    let ex = null;
    if (obj.type in this.playerTypes) {
      ex = new this.playerTypes[obj.type](obj.level);
    } else {
      ex = new this.rivalTypes[obj.type](obj.level);
    }
    ex.id = obj.id;
    ex.health = obj.health;
    ex.attack = obj.attack;
    ex.defence = obj.defence;
    ex.distance = obj.distance;
    ex.attackDistance = obj.attackDistance;
    return ex;
  }

  createPosCharacter(obj) {
    const curCharacter = (obj.character.type in this.playerTypes)
      ? this.playerTeam.characters.find((el) => el.id === obj.character.id)
      : this.rivalTeam.characters.find((el) => el.id === obj.character.id);
    const ex = new PositionedCharacter(curCharacter, obj.position);
    return ex;
  }

  static from(obj) {
    const gameState = new GameState();
    gameState.score = obj.score;
    gameState.gameRound = obj.gameRound;
    gameState.playerTurn = true;
    gameState.playerAlive = obj.playerAlive;
    gameState.rivalAlive = obj.rivalAlive;
    gameState.selectedIndex = obj.selectedIndex;
    gameState.playerTeam = new Team(Array.from(obj.playerTeam.characters).map((el) => gameState.createCharacter(el)));
    gameState.rivalTeam = new Team(Array.from(obj.rivalTeam.characters).map((el) => gameState.createCharacter(el)));
    gameState.positionedCharacters = Array.from(obj.positionedCharacters).map((el) => gameState.createPosCharacter(el));

    return gameState;
  }
}
