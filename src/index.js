// Import React and ReactDOM libraries
import React from 'react';
import ReactDOM from 'react-dom';

// Import the main App component
import App from './App';

// Render the App component into the root element in the HTML document
ReactDOM.render(
  // Enable React Strict Mode for additional development checks
  <React.StrictMode>
    {/* Render the App component */}
    <App />
  </React.StrictMode>,
  // Specify the root element where the React app will be mounted
  document.getElementById('root')
);
