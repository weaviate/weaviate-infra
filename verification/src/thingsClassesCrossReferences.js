// @flow

import type { ThingClass, Property } from './ontology';

const crossReferenceProperty = (target: ThingClass): Property => ({
  name: `in${target.class}`,
  '@dataType': [target.class],
  description: `A reference to the thing class '${target.class}'.`,
});

const addReferenceToOtherThingClass = (source: ThingClass, target: ThingClass): ThingClass => ({
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
  thingClasses: Array<ThingClass>,
  newReference: NewReference,
}

type RandomCrossReferencesResult = {
  thingClasses: Array<ThingClass>,
  newReferences: Array<NewReference>,
}

const randomCrossReference = (classes: Array<ThingClass>): RandomCrossReferenceResult => {
  const source = randomArrayItem(classes);
  const sourceNotContained = c => c.class !== source.class;
  const allOtherClasses = classes.filter(sourceNotContained);
  const target = randomArrayItem(allOtherClasses);
  const thingClasses = classes.map((c) => {
    if (c.class === source.class) {
      return addReferenceToOtherThingClass(source, target);
    }
    return c;
  });
  const newReference = {
    body: crossReferenceProperty(target),
    className: source.class,
  };

  return { thingClasses, newReference };
};

const randomCrossReferences = (
  amount: number, classes: Array<ThingClass>,
): RandomCrossReferencesResult => {
  let thingClasses = classes;
  const newReferences = [];
  for (let i = 0; i < amount; i += 1) {
    const result = randomCrossReference(thingClasses);
    // eslint-disable-next-line prefer-destructuring
    thingClasses = result.thingClasses;
    newReferences.push(result.newReference);
  }
  return { thingClasses, newReferences };
};

module.exports = {
  randomCrossReferences,
};
