import Team from './Team';

export function randomInteger(min, max) {
  const rand = min + Math.random() * (max + 1 - min);
  return Math.floor(rand);
}

/**
 * Формирует экземпляр персонажа из массива allowedTypes со
 * случайным уровнем от 1 до maxLevel
 *
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @returns генератор, который при каждом вызове
 * возвращает новый экземпляр класса персонажа
 *
 */
export function* characterGenerator(allowedTypes, maxLevel) {
  while (true) {
    const typeId = randomInteger(0, allowedTypes.length - 1);
    const level = randomInteger(1, maxLevel);
    const character = new allowedTypes[typeId](1);
    character.increaseLevel(level);
    yield character;
  }
}

/**
 * Формирует массив персонажей на основе characterGenerator
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @param characterCount количество персонажей, которое нужно сформировать
 * @returns экземпляр Team, хранящий экземпляры персонажей.
 * Количество персонажей в команде - characterCount
 * */
export function generateTeam(allowedTypes, maxLevel, characterCount) {
  const playerGenerator = characterGenerator(allowedTypes, maxLevel);
  const characters = [];
  for (let i = 0; i < characterCount; i += 1) {
    const character = playerGenerator.next().value;
    character.id = i;
    characters.push(character);
  }
  return new Team(characters);
}
