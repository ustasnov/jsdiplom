import Bowman from './Bowman';
import Swordsman from './Swordsman';
import Magician from './Magician';
import Vampire from './Vampire';
import Undead from './Undead';
import Daemon from './Daemon';
import { characterGenerator } from './generators';

const characterTypes = {
  'bowman': Bowman,
  'swordsman': Swordsman,
  'magician': Magician,
  'vampire': Vampire,
  'undead': Undead,
  'daemon': Daemon
}

export default class Team {
  constructor(id = 0) {
    this.id = id;
    this.characters = [];
  }

  has(character) {
    return Array.from(this.characters).includes(character);
  }

  increaseCharactersLevel() {
    Array.from(this.characters).forEach((el) => el.increaseLevel(el.level + 1))
  }

  static create(id, playerTypes, maxLevel, characterCount) {
    const team = new Team(id);
    const playerGenerator = characterGenerator(playerTypes, maxLevel);
    for (let i = 0; i < characterCount; i += 1) {
      const character = playerGenerator.next().value;
      character.teamId = id;
      character.id = i;
      team.characters.push(character);
    }
    return team;
  }

  static restoreCharacter(obj) {
    const character = new characterTypes[obj.type](1);
    Object.assign(character, obj);
    return character;
  }

  static restore(obj) {
    const team = new Team(obj.id)
    team.characters = Array.from(obj.characters).map((el) => Team.restoreCharacter(el));
    return team;
  }
}
