function green(text) {
  process.stdout.write(`\x1b[32m${text}\x1b[0m\n`);
}

function red(text) {
  process.stdout.write(`\x1b[31m${text}\x1b[0m\n`);
}

function noBreak(text) {
  process.stdout.write(text);
}

module.exports = {
  green,
  red,
  noBreak,
};
