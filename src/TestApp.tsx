import React from 'react';

const TestApp: React.FC = () => {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f0f0f0', 
      fontFamily: 'Arial, sans-serif',
      color: '#333'
    }}>
      <h1 style={{ color: 'red' }}>Test Application</h1>
      <p>If you can see this, React is working correctly!</p>
      <button 
        style={{ 
          padding: '10px 15px', 
          backgroundColor: 'red', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer'
        }}
        onClick={() => alert('Button clicked!')}
      >
        Click Me
      </button>
    </div>
  );
};

export default TestApp; 