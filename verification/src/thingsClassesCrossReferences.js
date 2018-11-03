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

const randomCrossReference = (classes: Array<ThingClass>): Array<ThingClass> => {
  const source = randomArrayItem(classes);
  const sourceNotContained = c => c.class !== source.class;
  const allOtherClasses = classes.filter(sourceNotContained);
  const target = randomArrayItem(allOtherClasses);
  return classes.map((c) => {
    if (c.class === source.class) {
      return addReferenceToOtherThingClass(source, target);
    }
    return c;
  });
};

const randomCrossReferences = (amount: number, classes: Array<ThingClass>) => {
  let assignedClasses = classes;
  for (let i = 0; i < amount; i += 1) {
    assignedClasses = randomCrossReference(assignedClasses);
  }
  return assignedClasses;
};

module.exports = {
  randomCrossReferences,
};
