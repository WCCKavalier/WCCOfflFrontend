import React, { useState } from 'react';
import './FieldPositionSelector.css';

const fieldingPositions = [
  { label: 'WK', key: 'wicketkeeper', x: '50%', y: '40%' },
  { label: 'Slip', key: 'slip', x: '46%', y: '36%' },
  { label: 'Point', key: 'point', x: '40%', y: '46%' },
  { label: 'Deep Point', key: 'deep-point', x: '27%', y: '47%' },
  { label: 'Cover', key: 'cover', x: '40%', y: '55%' },
  { label: 'Deep Cover', key: 'deep-cover', x: '28%', y: '60%' },
  { label: 'Mid-off', key: 'mid-off', x: '45%', y: '65%' },
  { label: 'Long-off', key: 'long-off', x: '43%', y: '76%' },
  { label: 'Mid-on', key: 'mid-on', x: '55%', y: '65%' },
  { label: 'Long-on', key: 'long-on', x: '60%', y: '75%' },
  { label: 'Mid-wicket', key: 'mid-wicket', x: '63%', y: '55%' },
  { label: 'Deep Mid-wicket', key: 'deep-midwicket', x: '80%', y: '60%' },
  { label: 'Square Leg', key: 'square-leg', x: '63%', y: '46%' },
  { label: 'Deep Square Leg', key: 'deep-square-leg', x: '85%', y: '45%' },
  { label: 'Fine Leg', key: 'fine-leg', x: '70%', y: '35%' },
    { label: 'Third Man', key: 'third-man', x: '30%', y: '35%' },
  { label: 'C & B', key: 'cnb', x: '50%', y: '59%' },
];


const FieldPositionSelector = ({ onSelect }) => {
  const [selected, setSelected] = useState(null);

  const handleClick = (position) => {
    setSelected(position.key);
    onSelect(position.label); // Send full label for clarity
  };

  return (
    <div className="field-container">
      {fieldingPositions.map((pos) => (
        <button
          key={pos.key}
          className={`field-button ${selected === pos.key ? 'selected' : ''}`}
          style={{ left: pos.x, top: pos.y }}
          onClick={() => handleClick(pos)}
        >
          {pos.label}
        </button>
      ))}
    </div>
  );
};

export default FieldPositionSelector;
