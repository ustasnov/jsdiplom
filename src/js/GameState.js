/* eslint-disable max-len */

import Bowman from './Bowman';
import Swordsman from './Swordsman';
import Magician from './Magician';
import Vampire from './Vampire';
import Undead from './Undead';
import Daemon from './Daemon';
import PositionedCharacter from './PositionedCharacter';

export default class GameState {
  static from(object) {
    const gameState = {
      playerTeam: object.playerTeam,
      rivalTeam: object.rivalTeam,
      score: object.score,
      gameRound: object.gameRound,
      playerTurn: true,
      playerAlive: object.playerAlive,
      rivalAlive: object.rivalAlive,
      characters: object.characters,
      selectedIndex: object.selectedIndex,
    };

    const characterTypesMap = {
      bowman: Bowman,
      swordsman: Swordsman,
      magician: Magician,
      vampire: Vampire,
      undead: Undead,
      daemon: Daemon,
    };

    const playerTypes = ['bowman', 'swordsman', 'magician'];

    function createCharacter(obj) {
      const ex = new characterTypesMap[obj.type](obj.level);
      ex.id = obj.id;
      ex.health = obj.health;
      ex.attack = obj.attack;
      ex.defence = obj.defence;
      ex.distance = obj.distance;
      ex.attackDistance = obj.attackDistance;
      return ex;
    }

    function createPosCharacter(obj) {
      const curCharacter = (playerTypes.indexOf(obj.character.type) > -1)
        ? gameState.playerTeam.characters.find((el) => el.id === obj.character.id)
        : gameState.rivalTeam.characters.find((el) => el.id === obj.character.id);
      const ex = new PositionedCharacter(curCharacter, obj.position);
      return ex;
    }

    gameState.playerTeam.characters = Array.from(gameState.playerTeam.characters).map((el) => createCharacter(el));
    gameState.rivalTeam.characters = Array.from(gameState.rivalTeam.characters).map((el) => createCharacter(el));
    gameState.characters = Array.from(gameState.characters).map((el) => createPosCharacter(el));

    return gameState;
  }
}
