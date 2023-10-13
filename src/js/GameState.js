/* eslint-disable max-len */

import PositionedCharacter from './PositionedCharacter';
import Team from './Team';

export default class GameState {
  constructor() {
    this.teams = [null, null]
    this.score = [0, 0];
    this.gameRound = 0;
    this.playerTurn = true;
    this.playerAlive = 4;
    this.rivalAlive = 4;
    this.positionedCharacters = [];
    this.selectedIndex = -1;
  }

  static from(obj) {
    const gameState = new GameState();
    gameState.score = obj.score;
    gameState.gameRound = obj.gameRound;
    gameState.playerTurn = true;
    gameState.playerAlive = obj.playerAlive;
    gameState.rivalAlive = obj.rivalAlive;
    gameState.selectedIndex = obj.selectedIndex;
    for (let i = 0; i < gameState.teams.length; i += 1) {
      gameState.teams[i] = Team.restore(obj.teams[i]);
    }
    gameState.positionedCharacters = Array.from(obj.positionedCharacters).map((el) => PositionedCharacter.restore(el, gameState.teams[el.character.teamId]));

    return gameState;
  }
}
