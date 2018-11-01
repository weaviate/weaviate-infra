const uniqueNumbersBetween = (amount, end, start = 0) => {
  const numbers = [];
  while (numbers.length < amount) {
    const newNumber = Math.floor(Math.random() * (end - start) + start);
    if (numbers.indexOf(newNumber) === -1) numbers.push(newNumber);
  }
  return numbers.sort((a, b) => a - b);
};

module.exports = { uniqueNumbersBetween };
