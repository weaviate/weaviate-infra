const { primitiveDataTypes } = require('./ontology');

const firstDataTypeIsNotAPrimitiveType = prop => primitiveDataTypes.indexOf(prop['@dataType'][0]) === -1;

const getReferenceProps = classToPopulate => classToPopulate
  .properties.filter(firstDataTypeIsNotAPrimitiveType);

const getRandomThingOfClass = (matchingClassName, vertices) => {
  const allMatchingVertices = vertices.filter(v => v.class === matchingClassName);
  return allMatchingVertices[Math.floor(Math.random() * allMatchingVertices.length)];
};

const populateCrossReferencesOnVertices = (vertices, classToPopulate) => (vertex) => {
  if (vertex.class !== classToPopulate.class) {
    return {
      thingVertex: vertex,
      newReferences: [],
    };
  }

  const referenceProps = getReferenceProps(classToPopulate);

  const newReferences = referenceProps.reduce((acc, cur) => {
    if (vertex[cur.name] !== undefined) {
      // if this particular cross-reference already exists
      // don't overwrite it.
      return acc;
    }

    const target = getRandomThingOfClass(cur['@dataType'][0], vertices);
    if (!target) {
      // there is no guarantuee that a vertex exists for every
      // thingClass since we randomly chose the classes. If we have a
      // relatively small amount of desired vertices but a relatively
      // large number of desired thingClasses, this becomes increasingly
      // likely

      return acc;
    }

    return {
      ...acc,
      [cur.name]: {
        $cref: target.uuid,
        type: 'Thing',
        locationUrl: 'http://localhost:8080',
      },
    };
  }, {});

  return {
    thingVertex: {
      ...vertex,
      ...newReferences,
    },
    newReferences: Object.keys(newReferences).map(propertyName => ({
      thingId: vertex.uuid,
      propertyName,
      body: newReferences[propertyName],
    })),
  };
};

function randomlyFillCrossReferences(vertices, classToPopulate) {
  let newReferences = [];
  const updatedVertices = vertices.map((vertex) => {
    const result = populateCrossReferencesOnVertices(vertices, classToPopulate)(vertex);
    newReferences = [...newReferences, ...result.newReferences];
    return result.thingVertex;
  });

  return { vertices: updatedVertices, newReferences };
}

module.exports = {
  randomlyFillCrossReferences,
};
