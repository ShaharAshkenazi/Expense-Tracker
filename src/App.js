// src/App.js

// Import necessary libraries and components
import React, { useState } from 'react';
import ExpenseForm from './ExpenseForm';
import Report from './Report'; // Import the Report component
import './App.css'; // Import styles
import PaidIcon from '@mui/icons-material/Paid';

// Define the main App component
const App = () => {
  // State to manage current page
  const [currentPage, setCurrentPage] = useState('Home');

  // Function to handle adding expense (placeholder)
  const handleAddExpense = (expense) => {
    console.log('New Expense:', expense);
  };

  // Function to render different pages based on current page state
  const renderPage = () => {
    switch (currentPage) {
      case 'Home':
        return <ExpenseForm onAddExpense={handleAddExpense} />;
      case 'Report':
        return <Report />;
      // Add other cases for additional pages
      default:
        return null;
    }
  };

  // Render the App component
  return (
    <div className="app-container">
      <header>
        {/* Navigation bar */}
        <nav>
          <div className="logo-container">
            {/* Logo with icon and text */}
            <h1 className="logo-text"><PaidIcon />Expense<span>Tracker</span></h1>
          </div>
          {/* Navigation links */}
          <ul className="nav-links">
            {/* Set the current page based on user selection */}
            <li onClick={() => setCurrentPage('Home')}>Home</li>
            <li onClick={() => setCurrentPage('Report')}>Report</li>
            
            
          </ul>
        </nav>
      </header>
      <main>
        {/* Render the current page */}
        <div className="content-container">{renderPage()}</div>
      </main>
    </div>
  );
};

// Export the App component
export default App;
