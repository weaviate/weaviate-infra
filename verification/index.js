const fs = require('fs');

const contextionaryFileName = './contextionary.txt';

const readWordsFromFile = () => fs
  .readFileSync(contextionaryFileName, 'utf8')
  .split('\n')
  .map(line => line.split(' ')[0]);

function main() {
  console.log(readWordsFromFile());
}

main();
