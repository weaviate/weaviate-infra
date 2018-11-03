const { thingFromClass } = require('./ontology');

const words = ['word1', 'word2', 'word3'];
const makeThingClass = properties => ({
  class: 'Enrollment',
  description: 'No description on this auto-generated thing',
  properties,
});

describe('creating a random Thing based on a specific ontology', () => {
  describe('without properties', () => {
    const ThingClass = makeThingClass([]);

    it('references the correct class', () => {
      expect(thingFromClass(ThingClass, words).class).toEqual('Enrollment');
    });
  });

  describe('with a single string property', () => {
    const ThingClass = makeThingClass([{
      name: 'title',
      '@dataType': ['string'],
      description: '',
    }]);

    it('sets the tile property', () => {
      const thing = thingFromClass(ThingClass);
      expect(thing.title).not.toBeUndefined();
      expect(thing.title).not.toBe('');
    });
  });

  describe('with a single number property', () => {
    const ThingClass = makeThingClass([{
      name: 'amount',
      '@dataType': ['number'],
      description: '',
    }]);

    it('sets the amount prop correctly', () => {
      const thing = thingFromClass(ThingClass);
      expect(thing.amount).not.toBeUndefined();
      expect(thing.amount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('with a single bool property', () => {
    const ThingClass = makeThingClass([{
      name: 'awesome',
      '@dataType': ['boolean'],
      description: '',
    }]);

    it('sets the awesome prop correctly', () => {
      const thing = thingFromClass(ThingClass);
      expect(thing.awesome).not.toBeUndefined();
      expect(thing.awesome == true || thing.awesome == false).toBeTruthy();
    });
  });

  describe('with multiple properties', () => {
    const ThingClass = makeThingClass([{
      name: 'awesome',
      '@dataType': ['boolean'],
      description: '',
    }, {
      name: 'amount',
      '@dataType': ['number'],
      description: '',
    }, {
      name: 'title',
      '@dataType': ['string'],
      description: '',
    }]);

    it('sets all the props correctly', () => {
      const thing = thingFromClass(ThingClass);
      expect(thing.awesome).not.toBeUndefined();
      expect(thing.awesome == true || thing.awesome == false).toBeTruthy();
      expect(thing.amount).not.toBeUndefined();
      expect(thing.amount).toBeGreaterThanOrEqual(0);
      expect(thing.title).not.toBeUndefined();
      expect(thing.title).not.toBe('');
    });
  });
});
