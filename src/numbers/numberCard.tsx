import React from 'react';

type NumberCardProps = {
  n: number;
  used: boolean;
  onNumberClick: () => void;
};

const NumberCard: React.FC<NumberCardProps> = ({n, used, onNumberClick}) => {
  
  return (
    <div>
      <button className={'card ' + (!used ? 'active': 'disabled') } onClick={onNumberClick} disabled={used} >
        {n}
      </button>
    </div>
  );
};

export default NumberCard;
