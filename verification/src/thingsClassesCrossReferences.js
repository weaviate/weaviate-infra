// @flow

import type { ThingOrActionClass, Property } from './ontology';

const crossReferenceProperty = (target: ThingOrActionClass): Property => ({
  name: `in${target.class}`,
  '@dataType': [target.class],
  description: `A reference to the class '${target.class}'.`,
});

const addReferenceToOtherClass = (
  source: ThingOrActionClass, target: ThingOrActionClass,
): ThingOrActionClass => ({
  ...source,
  properties: [
    ...source.properties,
    crossReferenceProperty(target),
  ],
});

function randomArrayItem<T>(list: Array<T>): T {
  return list[Math.floor(Math.random() * list.length)];
}

type NewReference = {
  className: string, // source
  body: Property, // target
}

type RandomCrossReferenceResult = {
  schemaClasses: Array<ThingOrActionClass>,
  newReference: NewReference,
}

type RandomCrossReferencesResult = {
  schemaClasses: Array<ThingOrActionClass>,
  newReferences: Array<NewReference>,
}

const randomCrossReference = (classes: Array<ThingOrActionClass>): RandomCrossReferenceResult => {
  const source = randomArrayItem(classes);
  const sourceNotContained = c => c.class !== source.class;
  const allOtherClasses = classes.filter(sourceNotContained);
  const target = randomArrayItem(allOtherClasses);
  const schemaClasses = classes.map((c) => {
    if (c.class === source.class) {
      return addReferenceToOtherClass(source, target);
    }
    return c;
  });
  const newReference = {
    body: crossReferenceProperty(target),
    className: source.class,
  };

  return { schemaClasses, newReference };
};

const randomCrossReferences = (
  amount: number, classes: Array<ThingOrActionClass>,
): RandomCrossReferencesResult => {
  let schemaClasses = classes;
  const newReferences = [];
  for (let i = 0; i < amount; i += 1) {
    const result = randomCrossReference(schemaClasses);
    // eslint-disable-next-line prefer-destructuring
    schemaClasses = result.schemaClasses;
    newReferences.push(result.newReference);
  }
  return { schemaClasses, newReferences };
};

module.exports = {
  randomCrossReferences,
};
