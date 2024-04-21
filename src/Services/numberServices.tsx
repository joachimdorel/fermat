import NumberSelector from "../types/numberSelector";

// solve a grid with the target number
const solver = (numbers: number[], target: number, found: boolean) => {
  let nbrs: number[] = numbers;

  let i = 0;
  let j = i + 1;

  while (i < nbrs.length - 1) {

    j = i + 1;
    while (j < nbrs.length) {
      let max = numbers[i] > numbers[i+1] ? numbers[i] : numbers[i+1];
      let min = numbers[i] < numbers[i+1] ? numbers[i] : numbers[i+1];

      let sum = min + max;
      let dif = max - min;
      let product = max * min;
      let quotien = max / min;

      // test if one of the number is the result
      if (sum === target || dif === target || product === target || quotien === target) {
        found = true;
      }

      const nbrs: number[] = numbers.slice(2);
      let result: string | undefined;

      result = solver(nbrs.concat([sum]), target, found);
      result = solver(nbrs.concat([dif]), target, found);
      result = solver(nbrs.concat([product]), target, found);
      if (quotien % 1 === 0) {
        // do not calculate with the quotien if the quotien is not an integer
        result = solver(nbrs.concat([quotien]), target, found);
      }

      if (result) {
        // does this pass is really useful ? 
        return 'found';
      }

      j += 1;       
    }
    i += 1;

    return 'notfound'
  }
};

//  select an amount of numbers for the game, and return them in a sorted array
const selectNumbers = (possibleNumbers: number[], amount: number): NumberSelector[] => {
  let selectedNumbers = [];

  while (selectedNumbers.length < amount) {
    const numberSelectedIndex = Math.floor(Math.random() * possibleNumbers.length);
    selectedNumbers.push(possibleNumbers.splice(numberSelectedIndex, 1)[0]);
  }

  selectedNumbers = selectedNumbers.sort((a, b) => a - b); // sort the array ascending
  const updatedNumbers = selectedNumbers.map((n: number): NumberSelector => { 
    return {val: n, used: false} 
  });

  return(updatedNumbers);
};

// realize an operation for two numbers and an operator indicated with a string
const realizeCalculation = (number1?: number, number2?: number, operator?: string): number => {
  let newNumber: number = 0;

  if (number1 && number2 && operator) {
    switch (operator) {
      case '+':
        newNumber = number1 + number2;
        break;
      case '-':
        newNumber = number1 - number2;
        break;
      case '*':
        newNumber = number1 * number2;
        break;
      case '/':
        newNumber = number1 / number2;
        break;
      default:
        // TODO manage errors
        // setError('An error happened while calculating...')
        break;
    }
  }

  return newNumber;
};


export { solver, selectNumbers, realizeCalculation };