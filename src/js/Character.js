/* eslint-disable max-len */
import { roundToInt } from './utils';

export default class Character {
  constructor(level, type = 'generic', teamId = 0) {
    this.level = level;
    this.teamId = teamId;
    this.attack = 0;
    this.defence = 0;
    this.health = 50;
    this.type = type;
    this.id = -1;
    if (new.target.name === 'Character') {
      throw new Error('You cannot instantiate this class!');
    }
  }

  getTooltip() {
    return `🎖 ${this.level} ⚔ ${this.attack} 🛡 ${this.defence} ❤ ${this.health}`;
  }

  increaseLevel(newLevel) {
    for (let i = this.level; i < newLevel; i += 1) {
      this.attack = Math.max(this.attack, roundToInt((80 + this.health) * (this.attack / 100)));
      this.defence = Math.max(this.defence, roundToInt((80 + this.health) * (this.defence / 100)));
      this.level += 1;
      this.health = Math.min(this.health + 80, 100);
    }
  }
}
