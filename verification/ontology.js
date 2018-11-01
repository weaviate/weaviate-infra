// @flow

export type Property = {
  name: string,
  '@datatype': Array<string>,
  description: string,

}

export type Thing = {
  class: string,
  description: string,
  properties: Array<Property>
}

function thingClassFromName(className: string): Thing {
  return {
    class: className,
    description: 'No description on this auto-generated thing',
    properties: [],
  };
}

module.exports = { thingClassFromName };
