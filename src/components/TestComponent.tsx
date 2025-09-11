import React from 'react';

const TestComponent: React.FC = () => {
  console.log('TestComponent rendering...');
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f0f9ff', 
      padding: '20px',
      color: '#1e40af',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>Test Component</h1>
      <p>If you can see this, the basic React rendering is working.</p>
      <div style={{ 
        backgroundColor: '#3b82f6', 
        color: 'white', 
        padding: '10px', 
        borderRadius: '5px',
        margin: '10px 0'
      }}>
        This is a test div with inline styles.
      </div>
    </div>
  );
};

export default TestComponent;
