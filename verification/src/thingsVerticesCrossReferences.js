const { primitiveDataTypes } = require('./ontology');

const firstDataTypeIsNotAPrimitiveType = prop => primitiveDataTypes.indexOf(prop['@dataType'][0]) === -1;

const getReferenceProps = classToPopulate => classToPopulate
  .properties.filter(firstDataTypeIsNotAPrimitiveType);

const getRandomThingOfClass = (matchingClassName, vertices) => {
  const allMatchingVertices = vertices.filter(v => v.class === matchingClassName);
  return allMatchingVertices[Math.floor(Math.random() * allMatchingVertices.length)];
};

const populateCrossReferencesOnVertices = (vertices, classToPopulate) => (vertex) => {
  if (vertex.class !== classToPopulate.class) return vertex;

  const referenceProps = getReferenceProps(classToPopulate);

  const newReferences = referenceProps.reduce((acc, cur) => {
    if (vertex[cur.name] !== undefined) {
      // if this particular cross-reference already exists
      // don't overwrite it.
      return acc;
    }

    return {
      ...acc,
      [cur.name]: { uuid: (getRandomThingOfClass(cur['@dataType'][0], vertices) || {}).uuid },
    };
  }, {});

  return {
    ...vertex,
    ...newReferences,
  };
};

function randomlyFillCrossReferences(vertices, classToPopulate) {
  return vertices.map(populateCrossReferencesOnVertices(vertices, classToPopulate));
}

module.exports = {
  randomlyFillCrossReferences,
};
