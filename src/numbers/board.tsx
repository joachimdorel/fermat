
import React, { useEffect, useState } from 'react';
import NumberCard from './numberCard';
import NumberSelector from '../types/numberSelector';
import { Operation } from '../types/operation';
import { selectNumbers, solver } from '../Services/numberServices';

const Board: React.FC = () => {
  const [error, setError] = useState<string>();
  const [targetNumber, setTargetNumber] = useState<number>(0);
  const [selectedNumbers, setSelectedNumbers] = useState<NumberSelector[]>([]);
  const [number1, setNumber1] = useState<number>();
  const [number2, setNumber2] = useState<number>();
  const [operator, setOperator] = useState<string>();
  const [numberFound, setNumberFound] = useState<boolean>(false);
  const [operations, setOperations] = useState<Operation[]>([]);

  let numbersPossible = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 25, 50, 75, 100];

  const calculateOperation = (number1?: number, number2?: number, operator?: string): number => {
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
          setError('An error happened while calculating...')
          break;
      }
    }

    return newNumber;
  };

  const updateNumbers = () => {
    if (!number1 || !number2 || !operator) {
      setError('Something is missing...');
      return;
    }

    let newNumber = calculateOperation(number1, number2, operator);
    operations.push({num1: number1, num2: number2, operator: operator, result: newNumber});
    setOperations(operations);
    setNumber1(undefined);
    setNumber2(undefined);
    setOperator(undefined);


    if (newNumber === targetNumber) {
      setNumberFound(true)
    } else {
      selectedNumbers.push({ val: newNumber, used: false });
      setSelectedNumbers(selectedNumbers);
    }
  };

  const numberClicked = (nmb: NumberSelector, index: number) => {
    selectedNumbers[index] = { val: nmb.val, used: true };
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
    const selectedNumbersUpdated = selectedNumbers.map((n: NumberSelector) => {
      if (n.val === lastOperation.num1 || n.val === lastOperation.num2) {
        return {used: false, val: n.val };
      };
      return { used: n.used, val: n.val };
    }); 
    setSelectedNumbers(selectedNumbersUpdated);
  };

  const newGame = () => {
    setSelectedNumbers(selectNumbers(numbersPossible, 6));
    setTargetNumber(Math.floor(100 + Math.random() * 900));

    setOperations([]);
    setNumberFound(false);
    setNumber1(undefined);
    setNumber2(undefined);
    setOperator(undefined);
  };

  const clearSelection = () => {
    const selectedNumbersUpdated = selectedNumbers.map((sn: NumberSelector) => {
      if ((sn.val === number1 || sn.val === number2) && sn.used === true) {
        return { val: sn.val, used: false };
      }
      return sn;
    });

    setSelectedNumbers(selectedNumbersUpdated);
    setNumber1(undefined);
    setNumber2(undefined);
    setOperator(undefined);
  };

  useEffect(() => {
    setSelectedNumbers(selectNumbers(numbersPossible, 6));
    setTargetNumber(Math.floor(100 + Math.random() * 900));
  }, []); // le tableau vide indique que ce useEffect ne sera appelé qu'une seule fois à la montée du composant

  // when an operation is completely written, it executes immediatly
  useEffect(() => {
    if (number1 && number2 && operator) {
      updateNumbers();
    }
  }, [number1, number2, operator]);

  useEffect(() => {
    const solvable = solver(selectedNumbers.map((ns: NumberSelector) => ns.val ), targetNumber, false);
  }, [targetNumber]); // cet effet s'exécute à chaque fois que targetNumber est mis à jour

  return (
    <div className='flex items-center flex-col gap-4 '>
      
      <div className='p-2'>{targetNumber}</div>
      <div className='flex inline-flex gap-4'>
        {selectedNumbers.map((nmb: NumberSelector, index: number) => {
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
        <div className='card active' onClick={() => operatorClicked('*')}>*</div>
        <div className='card active' onClick={() => operatorClicked('/')}>/</div>
      </div>

      <div className='text-yellow-800'>
        {numberFound && 
          <div>
            <p>Number found 🎉</p>
            <div>
              <button className='border border-solid border-yellow-900 p-2 m-2 rounded-md hover:bg-yellow-900 hover:text-white hover:border-white' onClick={() => newGame()}>New game</button>
            </div>
          </div>
        }
      </div>
      <div>
        {error && 
          <p>{error}</p>
        }
      </div>

      {(number1 || operator || number2) && 
        <div className='flex inline-flex gap-2'>
          <div></div> 
          <div className='flex flex-row gap-4'>
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
          <div className='cancel'>
            <button className='' onClick={() => clearSelection()}>clear</button>
          </div>
        </div>
      }

      <div className=''>
        {operations.map((operation: Operation, index: number) => {
          return (
            <div key={index} className='grid grid-cols-2'>
              <div className='grid grid-cols-5 gap-2'>
                <div className='card disabled mt-2'>{operation.num1}</div>
                <div className='card disabled mt-2'>{operation.operator}</div>
                <div className='card disabled mt-2'>{operation.num2}</div>
                <div className='card disabled mt-2'> = </div>
                <div className='card disabled mt-2'>{operation.result}</div>
              </div>

              <div>
                {
                  (index  === operations.length - 1) ? 
                    <button className='mt-2 text-orange-600 cancel' onClick={() => removeLastOperation()}>x</button> 
                  : 
                    ''
                }
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default Board;
