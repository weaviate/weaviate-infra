// @flow

export type Property = {
  name: string,
  '@datatype': Array<string>,
  description: string,

}

export type ThingClass = {
  class: string,
  description: string,
  properties: Array<Property>
}

const allowedPrimitiveDataTypes = ['number', 'string', 'boolean'];

function randomSingleItemFromWords(words: Array<string>) {
  return words[Math.floor(Math.random() * (words.length - 1))];
}

function capitalizeWord(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

// randomProperty creates a property with one of the allowed primitive types
// ignores references for now
function randomProperty(words: Array<string>): Property {
  return {
    name: randomSingleItemFromWords(words).toLowerCase(),
    '@datatype': [randomSingleItemFromWords(allowedPrimitiveDataTypes)],
    description: '',

  };
}

function thingClassFromName(className: string, words: Array<string>): ThingClass {
  return {
    class: capitalizeWord(className),
    description: 'No description on this auto-generated thing',
    properties: [randomProperty(words)],
  };
}


module.exports = { thingClassFromName };
