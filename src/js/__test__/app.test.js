/* eslint-disable max-len */
/* eslint-disable func-names */

import {
  calcTileType, calcHealthLevel, calculateCellsForMove, calculateCellsForAttack,
} from '../utils';
import Character from '../Character';
import Bowman from '../Bowman';
import Swordsman from '../Swordsman';
import Magician from '../Magician';
import Undead from '../Undead';
import Daemon from '../Daemon';
import Vampire from '../Vampire';
import Team from '../Team';
import Cell from '../Cell';
import PositionedCharacter from '../PositionedCharacter';
import GameStateService from '../GameStateService';

beforeEach(() => {
  jest.resetAllMocks();
});

jest.mock('../GameStateService', () => function (storage) {
  return {
    load: () => {
      if (storage) {
        return JSON.parse(storage);
      }
      throw new Error('Invalid state');
    },
  };
});

// utils functions test

test('shuld return correct title type by index', () => {
  const borderSize = 8;
  const maxIndex = borderSize - 1;
  const sourceArr = [];
  const destArr = [];

  for (let row = 0; row < borderSize; row += 1) {
    for (let col = 0; col < borderSize; col += 1) {
      let tileType = 'center';
      if (row === 0) {
        if (col === 0) {
          tileType = 'top-left';
        } else if (col === maxIndex) {
          tileType = 'top-right';
        } else {
          tileType = 'top';
        }
      } else if (row === maxIndex) {
        if (col === 0) {
          tileType = 'bottom-left';
        } else if (col === maxIndex) {
          tileType = 'bottom-right';
        } else {
          tileType = 'bottom';
        }
      } else if (col === 0) {
        tileType = 'left';
      } else if (col === maxIndex) {
        tileType = 'right';
      }
      sourceArr.push(tileType);
    }
  }

  for (let i = 0; i < borderSize * borderSize; i += 1) {
    destArr.push(calcTileType(i, borderSize));
  }

  expect(sourceArr).toEqual(destArr);
});

test('calcHealthLevel function shuld return correct health level', () => {
  const destArray = ['critical', 'normal', 'high'];
  const sourceArr = [calcHealthLevel(14), calcHealthLevel(16), calcHealthLevel(50)];

  expect(sourceArr).toEqual(destArray);
});

test('shuld getCellsForMove function return array with correct cells indexes', () => {
  const sourceArray = [28, 26, 19, 35, 20, 18, 34, 36, 29, 25, 11, 43, 13, 9,
    41, 45, 30, 24, 3, 51, 6, 0, 48, 54, 31, 59, 63];
  const posCharacter = new PositionedCharacter(new Swordsman(1), 27);
  const destArray = calculateCellsForMove(posCharacter, 8);

  expect(sourceArray).toEqual(destArray);
});

test('shuld getCellsForMove function return array with correct cells indexes', () => {
  const sourceArray = [45, 43, 36, 52, 37, 35, 51, 53, 46, 42, 28, 60, 30, 26,
    58, 62, 47, 41, 20, 23, 17, 40, 12, 8];
  const posCharacter = new PositionedCharacter(new Swordsman(1), 44);
  const destArray = calculateCellsForMove(posCharacter, 8);

  expect(sourceArray).toEqual(destArray);
});

test('shuld getCellsForAttack function return array with correct cells indexes', () => {
  const sourceArray = [0, 1, 2, 3, 8, 9, 10, 11, 16, 17, 18, 19, 24, 25, 26, 27];
  const posCharacter = new PositionedCharacter(new Bowman(1), 9);
  const destArray = calculateCellsForAttack(posCharacter, 8);

  expect(sourceArray).toEqual(destArray);
});

test('shuld getCellsForAttack function return array with correct cells indexes', () => {
  const sourceArray = [36, 37, 38, 39, 44, 45, 46, 47, 52, 53, 54, 55, 60, 61, 62, 63];
  const posCharacter = new PositionedCharacter(new Bowman(1), 54);
  const destArray = calculateCellsForAttack(posCharacter, 8);

  expect(sourceArray).toEqual(destArray);
});

// Team test

test('shuld create team', () => {
  const destArray = [new Bowman(2), new Swordsman(1), new Magician(2)];
  const team = new Team();
  team.characters = destArray;

  expect(team.characters).toEqual(destArray);
});

test('should check if there is a character on the team', () => {
  const destArray = [new Bowman(2), new Swordsman(1), new Magician(2)];
  const team = new Team();
  team.characters = destArray;

  expect(team.has(destArray[0])).toBeTruthy();
});

test('should check if a character is missing from the team', () => {
  const destArray = [new Bowman(2), new Swordsman(1), new Magician(2)];
  const team = new Team();
  team.characters = destArray;

  expect(team.has(new Vampire(1))).not.toBeTruthy();
});

test('should check character level increase', () => {
  const sourceArray = [new Bowman(1), new Swordsman(1), new Magician(1)];
  const team = new Team();
  team.characters = sourceArray;
  team.increaseCharactersLevel();

  expect(team.characters[0].level).toBe(2);
});

// generators functions test

test('shuld generate team with correct count of characters', () => {
  const characterCount = 4;
  const allowedTypes = [Bowman, Swordsman, Magician];
  const team = Team.create(0, allowedTypes, 2, characterCount);

  expect(team.characters.length).toBe(characterCount);
});

test('shuld generate team with correct type of characters', () => {
  const characterCount = 4;
  const allowedTypes = [Bowman, Swordsman, Magician];
  const team = Team.create(0, allowedTypes, 2, characterCount);

  let correct = true;
  for (let i = 0; i < characterCount; i += 1) {
    if (!(team.characters[i] instanceof Character)) {
      correct = false;
      break;
    }
  }

  expect(correct).toBe(true);
});

test('should check to restore correct team', () => {
  const characterCount = 4;
  const allowedTypes = [Bowman, Swordsman, Magician];
  const sourceTeam = Team.create(0, allowedTypes, 2, characterCount);
  const str = JSON.stringify(sourceTeam);
  const obj = JSON.parse(str);
  const destTeam = Team.restore(obj);

  expect(sourceTeam).toEqual(destTeam);
});

// Cell test

test('shuld create correct cell by index', () => {
  const boardSize = 8;
  const sourceArray = [];
  const destArray = [];
  for (let i = 0; i < boardSize * boardSize; i += 1) {
    sourceArray.push(Cell.byIndex(i, boardSize));
  }
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      destArray.push(new Cell(row, col, boardSize));
    }
  }
  expect(sourceArray).toEqual(destArray);
});

test('shuld cell return correct index', () => {
  const boardSize = 8;
  const sourceArray = [];
  const destArray = [];
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      sourceArray.push(new Cell(row, col, boardSize).index);
    }
  }
  for (let i = 0; i < boardSize * boardSize; i += 1) {
    destArray.push(i);
  }
  expect(sourceArray).toEqual(destArray);
});

// Character test

test('should not instantiate Character class', () => {
  function createCharacter() {
    const character = new Character(1);
    return character;
  }
  expect(createCharacter).toThrow(Error('You cannot instantiate this class!'));
});

// Character descendants test

test.each([
  ['Bowman', 25, 25, Bowman],
  ['Swordsman', 40, 10, Swordsman],
  ['Magician', 10, 40, Magician],
  ['Daemon', 10, 10, Daemon],
  ['Undead', 40, 10, Undead],
  ['Vampire', 25, 25, Vampire],
])(
  ('%s: attack value must be %s, defence value must be %s'),
  (_, attack, defence, TypeClass) => {
    const currentCharacter = new TypeClass(1);
    const sourseObject = { attack: currentCharacter.attack, defence: currentCharacter.defence };
    const destObject = { attack, defence };

    expect(sourseObject).toEqual(destObject);
  },
);

test.each([
  ['Bowman', Bowman],
  ['Swordsman', Swordsman],
  ['Magician', Magician],
  ['Daemon', Daemon],
  ['Undead', Undead],
  ['Vampire', Vampire],
])(
  ('test tooltip for %s'),
  (_, TypeClass) => {
    const currentCharacter = new TypeClass(1);
    const sourseTooltip = currentCharacter.getTooltip();
    const destTooltip = `🎖 ${currentCharacter.level} ⚔ ${currentCharacter.attack} 🛡 ${currentCharacter.defence} ❤ ${currentCharacter.health}`;

    expect(sourseTooltip).toEqual(destTooltip);
  },
);

test.each([
  ['Bowman', 33, 33, 100, Bowman],
  ['Swordsman', 52, 13, 100, Swordsman],
  ['Magician', 13, 52, 100, Magician],
  ['Daemon', 13, 13, 100, Daemon],
  ['Undead', 52, 13, 100, Undead],
  ['Vampire', 33, 33, 100, Vampire],
])(
  ('after increase level %s: attack value must be %s, defence value must be %s, health must be %s'),
  (_, attack, defence, health, TypeClass) => {
    const currentCharacter = new TypeClass(1);
    currentCharacter.increaseLevel(2);
    const sourseObject = { attack: currentCharacter.attack, defence: currentCharacter.defence, health: currentCharacter.health };
    const destObject = { attack, defence, health };

    expect(sourseObject).toEqual(destObject);
  },
);

// PositionedCharacter test

test('character must be instance of Character or its children', () => {
  function createPosCharacter() {
    const posCharacter = new PositionedCharacter(Cell.byIndex(0, 8), 0);
    return posCharacter;
  }
  expect(createPosCharacter).toThrow(Error('character must be instance of Character or its children'));
});

test('should not instantiate Character class', () => {
  function createPosCharacter() {
    const posCharacter = new PositionedCharacter(new Bowman(1), 'pos');
    return posCharacter;
  }
  expect(createPosCharacter).toThrow(Error('position must be a number'));
});

test('should check the restoration of the correct positioned character', () => {
  const allowedTypes = [Bowman];
  const sourceTeam = Team.create(0, allowedTypes, 1, 1);
  const sourceCharacter = new PositionedCharacter(sourceTeam.characters[0], 8);
  const str = JSON.stringify(sourceCharacter);
  const obj = JSON.parse(str);

  expect(sourceCharacter).toEqual(PositionedCharacter.restore(obj, sourceTeam));
});

// GameStateService test with mock

test('shoul call GameStateService load method mock', () => {
  const destObj = { score: '1:0', gameRound: 1 };
  const storage = JSON.stringify(destObj);
  const gameStateService = new GameStateService(storage);
  const sourceObj = gameStateService.load();
  expect(sourceObj).toEqual(destObj);
});

test('shoul GameStateService load method mock throw exception', () => {
  function testMock() {
    const gameStateService = new GameStateService(undefined);
    const sourceObj = gameStateService.load();
    return sourceObj;
  }
  expect(testMock).toThrow(new Error('Invalid state'));
});
