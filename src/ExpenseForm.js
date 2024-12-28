// Import necessary libraries and styles
import React, { useState, useEffect } from 'react';
import './ExpenseForm.css'; // Import the CSS file for styling
import { idb } from './idb.js'; // Import your IndexedDB utility

// Utility function to get the current date in 'YYYY-MM-DD' format
function getCurrentDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Main ExpenseForm component
const ExpenseForm = ({ onAddExpense }) => {
  // State for managing form inputs
  const [newExpense, setNewExpense] = useState({
    sum: '',
    category: 'FOOD',
    description: '',
    date: getCurrentDate(),
  });

  // State for error and success messages
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // useEffect to open IndexedDB when the component mounts
  useEffect(() => {
    idb.openCostsDB('dbName', 1)
      .then(() => console.log('Database opened successfully'))
      .catch((error) => console.error('Error opening database:', error));
  }, []); // Empty dependency array ensures this effect runs once when the component mounts

  // Function to handle input changes in the form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExpense((prevExpense) => ({
      ...prevExpense,
      [name]: value,
    }));
  };

  // Function to handle adding expense
  const handleAddExpense = async () => {
    try {
      // Validation checks
      if (!newExpense.sum || !newExpense.description) {
        setError('Please fill in all required fields.');
        return;
      }

      if (newExpense.sum < 0) {
        setError('Please enter a non-negative sum.');
        return;
      }

      // Add the expense to IndexedDB
      await idb.addCost(newExpense);

      // Reset form and show success message
      setNewExpense({
        sum: '',
        category: 'FOOD',
        description: '',
        date: getCurrentDate(),
      });
      setSuccess('Expense added successfully!');
      setError('');
    } catch (error) {
      console.error('Error adding expense to IndexedDB:', error);
      setError('Error adding expense. Please try again.');
      setSuccess('');
    }
  };

  // Render the ExpenseForm component
  return (
    <div className="expense-form-container">
      <form className="expense-form">
        {/* Input fields for expense details */}
        <div className="form-group">
          <label htmlFor="sum">Sum:</label>
          <input
            type="number"
            id="sum"
            name="sum"
            value={newExpense.sum}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="category">Category:</label>
          <select
            id="category"
            name="category"
            value={newExpense.category}
            onChange={handleInputChange}
          >
            {/* Options for expense categories */}
            <option value="FOOD">Food</option>
            <option value="HEALTH">Health</option>
            <option value="EDUCATION">Education</option>
            <option value="TRAVEL">Travel</option>
            <option value="HOUSING">Housing</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <input
            type="text"
            id="description"
            name="description"
            value={newExpense.description}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="date">Date:</label>
          <input
            type="date"
            id="date"
            name="date"
            value={newExpense.date}
            onChange={handleInputChange}
          />
        </div>
        {/* Button to add expense */}
        <button type="button" onClick={handleAddExpense}>
          Add Expense
        </button>
        {/* Display error and success messages */}
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
      </form>
    </div>
  );
};

// Export the ExpenseForm component
export default ExpenseForm;
