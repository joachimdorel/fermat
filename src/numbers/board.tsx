
import React, { useEffect, useMemo, useState } from 'react';
import NumberCard from './numberCard';
import NumberSelector from '../types/numberSelector';
import { Operation } from '../types/operation';
import { realizeCalculation, selectNumbers, /* solver */ } from '../Services/numberServices';

const Board: React.FC = () => {

  const cards = 6;

  const [error, setError] = useState<string>();
  const [targetNumber, setTargetNumber] = useState<number>(0);
  const [selectedNumbers, setSelectedNumbers] = useState<NumberSelector[]>([]);
  const [number1, setNumber1] = useState<number>();
  const [number2, setNumber2] = useState<number>();
  const [operator, setOperator] = useState<string>();
  const [numberFound, setNumberFound] = useState<boolean>(false);
  const [operations, setOperations] = useState<Operation[]>([]);

  let numbersPossible = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 25, 50, 75, 100];

  const newGame = () => {
    setSelectedNumbers(selectNumbers(numbersPossible, cards));
    setTargetNumber(Math.floor(100 + Math.random() * 900));

    setOperations([]);
    setNumberFound(false);
    setNumber1(undefined);
    setNumber2(undefined);
    setOperator(undefined);
  };

  const updateNumbers = () => {
    if (!number1 || !number2 || !operator) {
      setError('Something is missing...');
      return;
    }

    let newNumber = realizeCalculation(number1, number2, operator);
    operations.push({num1: number1, num2: number2, operator: operator, result: newNumber});
    setOperations(operations);
    setNumber1(undefined);
    setNumber2(undefined);
    setOperator(undefined);

    selectedNumbers.push({ val: newNumber, initial: false, used: false });
    setSelectedNumbers(selectedNumbers);

    if (newNumber === targetNumber) {
      setNumberFound(true)
    }
  };

  const numberClicked = (nmb: NumberSelector, index: number) => {

    selectedNumbers[index] = { val: nmb.val, initial: nmb.initial, used: true };
    setSelectedNumbers(selectedNumbers);

    if (!number1) {
      setNumber1(nmb.val);
    } else if (!number2) {
      setNumber2(nmb.val);
    } else {
      setError('Numbers are selected, select an operation.');
    }
  };

  const operatorClicked = (operator: string) => {
    setOperator(operator);
  };

  const removeLastOperation = () => {
    const lastOperation = operations.pop();

    if (!lastOperation) {
      setError("There is no last operation to display");
      return;
    }
    
    selectedNumbers.pop(); // remove the last number added - the result of the last operation
    // update the numbers who had beed used to "used=false" when deleting the last operation
    const selectedNumbersUpdated = selectedNumbers.map((nmb: NumberSelector) => {
      if (nmb.val === lastOperation.num1 || nmb.val === lastOperation.num2) {
        return { used: false, initial: nmb.initial, val: nmb.val };
      };
      return { used: nmb.used, initial: nmb.initial, val: nmb.val };
    }); 
    setSelectedNumbers(selectedNumbersUpdated);
  };

  const clearSelection = () => {
    const selectedNumbersUpdated = selectedNumbers.map((nmb: NumberSelector) => {
      if ((nmb.val === number1 || nmb.val === number2) && nmb.used === true) {
        return { val: nmb.val, initial: nmb.initial, used: false };
      }
      return nmb;
    });

    setSelectedNumbers(selectedNumbersUpdated);
    setNumber1(undefined);
    setNumber2(undefined);
    setOperator(undefined);
  };

  // use of a memo to keep the selectedNumbers in memort
  const selectedNumbersMemo = useMemo(() => {
    return selectNumbers([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 25, 50, 75, 100], cards);
  }, []); 

  useEffect(() => {
    setSelectedNumbers(selectedNumbersMemo);
    setTargetNumber(Math.floor(100 + Math.random() * 900));
  }, [selectedNumbersMemo]); // le tableau vide indique que ce useEffect ne sera appelé qu'une seule fois à la montée du composant - la fonction peut être appelée sans le tableau vide

  // when an operation is completely written, it executes immediatly
  useEffect(() => {
    if (number1 && number2 && operator) {
      updateNumbers();
    }
  }, [number1, number2, operator]);

  useEffect(() => {
    // const solvable = solver(selectedNumbers.map((ns: NumberSelector) => ns.val ), targetNumber, false);
  }, [targetNumber]); // cet effet s'exécute à chaque fois que targetNumber est mis à jour

  return (
    <div className='flex items-center flex-col gap-4 mt-3'>
      
      <div className='p-2 font-bold'>{targetNumber}</div>

      <div className='flex inline-flex gap-4'>
        {selectedNumbers.map((nmb: NumberSelector, index: number) => {
          if (!nmb.initial) return;
          return (
            <div key={index}>
              <NumberCard n={nmb.val} used={nmb.used} onNumberClick={() => numberClicked(nmb, index)} />
            </div>
          )
        })}
      </div>

      <div className='flex inline-flex gap-4'>
        <div className='card active' onClick={() => operatorClicked('+')}>+</div>
        <div className='card active' onClick={() => operatorClicked('-')}>-</div>
        <div className='card active' onClick={() => operatorClicked('x')}>x</div>
        <div className='card active' onClick={() => operatorClicked('/')}>/</div>
      </div>

      {numberFound && 
        <div className='flex flex-row'>
          <div className='p-2 m-2'>
            <p>Number found 🎉</p>
          </div>
          <div>
            <button className='border border-solid border-green-900 p-2 m-2 rounded-sm hover:bg-green-900 hover:text-white hover:border-white' onClick={() => newGame()}>New game</button>
          </div>
        </div>
      }
      <div>
        {error && 
          <p>{error}</p>
        }
      </div>

      <div className={'grid grid-rows-' + (operations.length + 2)}> 
        {(number1 || operator || number2) && 
          <div className='grid grid-cols-5 gap-4'>
            <div className='grid col-span-4 grid-cols-5 gap-2 mt-2'>
              {(number1) && 
                <div className='card disabled'>
                  {number1}
                </div>
              }
              {(operator) && 
                <div className='card disabled'>
                  {operator}
                </div>
              }
              {(number2) && 
                <div className='card disabled'>
                  {number2}
                </div>
              }
            </div>

            <div className='col-span-1 h-auto mt-2'>
              <button className='cancel' onClick={() => clearSelection()}>clear</button>
            </div>
          </div>
        }

        <div className='mt-2 border-t border-gray-200'>
          {operations.map((operation: Operation, index: number) => {
            const result = selectedNumbers[cards + index];
            if (!result) return;
            return ( 
              <div className='grid grid-cols-5 gap-4' key={index}>
                  <div className='col-span-4'>
                    <div key={index} className='grid grid-cols-5 gap-2 mt-2'>
                      <div className='card disabled '>{operation.num1}</div>
                      <div className='card disabled '>{operation.operator}</div>
                      <div className='card disabled '>{operation.num2}</div>
                      <div className='card disabled '> = </div>
                      <NumberCard n={result.val} used={result.used} onNumberClick={() => numberClicked(result, cards + index)} />
                  </div>
                </div>
                <div className='col-span-1 h-auto mt-2 justify-self-end'>
                  {((index === operations.length - 1) && !numberFound) && 
                    <button className='cancel' onClick={() => removeLastOperation()}>x</button> 
                  }
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
};

export default Board;
