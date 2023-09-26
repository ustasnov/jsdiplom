import Bowman from './Bowman';
import Swordsman from './Swordsman';
import Magician from './Magician';
import Vampire from './Vampire';
import Undead from './Undead';
import Daemon from './Daemon';
import PositionedCharacter from './PositionedCharacter';

export default class GameState {
  static from(object) {
    const characterTypesMap = {
      'bowman': Bowman,
      'swordsman': Swordsman,
      'magician': Magician,
      'vampire': Vampire,
      'undead': Undead,
      'daemon': Daemon
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
      const curCharacter = (playerTypes.indexOf(obj.character.type) > -1) ?
        object.playerTeam.characters.find((el) => el.id === obj.character.id) :
        object.rivalTeam.characters.find((el) => el.id === obj.character.id);
      const ex = new PositionedCharacter(curCharacter, obj.position);
      return ex;
    }

    object.playerTeam.characters = Array.from(object.playerTeam.characters).map((el) => el = createCharacter(el));
    object.rivalTeam.characters = Array.from(object.rivalTeam.characters).map((el) => el = createCharacter(el));
    object.characters = Array.from(object.characters).map((el) => el = createPosCharacter(el));

    return object;
  }
}
