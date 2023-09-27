/* eslint-disable max-len */
import { roundToInt } from './utils';

/**
 * Базовый класс, от которого наследуются классы персонажей
 * @property level - уровень персонажа, от 1 до 4
 * @property attack - показатель атаки
 * @property defence - показатель защиты
 * @property health - здоровье персонажа
 * @property type - строка с одним из допустимых значений:
 * swordsman
 * bowman
 * magician
 * daemon
 * undead
 * vampire
 */
export default class Character {
  constructor(level, type = 'generic') {
    this.level = level;
    this.attack = 0;
    this.defence = 0;
    this.health = 50;
    this.type = type;
    this.id = -1;
    // TODO: выбросите исключение, если кто-то использует "new Character()"
    if (new.target.name === 'Character') {
      throw new Error('You cannot instantiate this class!');
    }
  }

  getTooltip() {
    return `🎖 ${this.level} ⚔ ${this.attack} 🛡 ${this.defence} ❤ ${this.health}`;
  }

  increaseLevel(newLevel) {
    for (let i = this.level; i < newLevel; i += 1) {
      if (this.health > 1) {
        this.attack = Math.max(this.attack, roundToInt((80 + this.health) * (this.attack / 100)));
        this.defence = Math.max(this.defence, roundToInt((80 + this.health) * (this.defence / 100)));
        this.level += 1;
      }
      this.health = Math.min(this.health + 80, 100);
    }
  }
}
