import React, { useState, useEffect, useRef } from 'react';
import { idb } from './idb';
import './Report.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

function Report() {
  // State variables for user inputs, data, and calculations
  const [yearUserInput, setYearUserInput] = useState('');
  const [monthUserInput, setMonthUserInput] = useState('');
  const [data, setData] = useState([]);
  const [totalSum, setTotalSum] = useState(0);
  const [maxCategorySum, setMaxCategorySum] = useState(0);
  const [maxCategory, setMaxCategory] = useState('');
  const [showData, setShowData] = useState([]);
  const pdfRef = useRef();

  // Function to retrieve values from the IndexedDB
  const getValuesFromDB = async () => {
    try {
      const result = await idb.getAllItems();
      setData(result);
      setShowData(result);
    } catch (error) {
      console.error('Error getting data from DB:', error);
    }
  };

  // Effect to initialize the database and load data on component mount
  useEffect(() => {
    const initializeDB = async () => {
      try {
        if (!idb.db) {
          await new Promise((resolve) => {
            idb.openCostsDB('costsdb', 1).then(() => {
              resolve();
            });
          });
        }
        await getValuesFromDB();
      } catch (error) {
        console.error('Error initializing DB:', error);
      }
    };
    initializeDB();
  }, []);

  // Function to handle button click for filtering data
  const handleClick = (event, yearUserInput, monthUserInput) => {
    event.preventDefault();

    // Validate user inputs
    if (!yearUserInput || !monthUserInput) {
      alert('Please fill in the required details.');
      return;
    }

    // Validate month input
    const month = parseInt(monthUserInput, 10);
    if (isNaN(month) || month < 1 || month > 12) {
      alert('Invalid month. Please enter a valid month (1-12).');
      return;
    }

    // Filter data based on user inputs
    const selectedFilterData = showData.filter((item) => {
      const startDate = item.date;
      const selectedDate = new Date(`${yearUserInput}-${monthUserInput.padStart(2, '0')}-01`);
      const nextMonth = new Date(selectedDate);
      nextMonth.setMonth(selectedDate.getMonth() + 1);

      return startDate >= selectedDate.toISOString() && startDate < nextMonth.toISOString();
    });

    // Update data based on filtering
    if (selectedFilterData.length === 0) {
      alert('No data found for the selected year and month.');
      setMaxCategorySum(0);
      setMaxCategory('');
      setData(showData);
    } else {
      setData(selectedFilterData);
    }

    // Calculate and set max category sum and category
    const categorySum = {};
    selectedFilterData.forEach((item) => {
      const category = item.category;
      const sum = parseFloat(item.sum);

      if (categorySum[category]) {
        categorySum[category] += sum;
      } else {
        categorySum[category] = sum;
      }
    });

    let maxSum = 0;
    let maxCategory = '';
    for (const category in categorySum) {
      if (categorySum[category] > maxSum) {
        maxSum = categorySum[category];
        maxCategory = category;
      }
    }

    setMaxCategorySum(maxSum);
    setMaxCategory(maxCategory);
  };

  // Effect to recalculate total sum when data changes
  useEffect(() => {
    let total = 0;
    data.forEach((item) => {
      total += parseFloat(item.sum);
    });
    setTotalSum(total);
  }, [data]);

  // Function to download a PDF of the report
  const downloadPDF = (event) => {
    event.preventDefault();

    // Use html2canvas and jsPDF to generate and download PDF
    const input = pdfRef.current;

    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL('img/png');
      const pdf = new jsPDF('p', 'mm', 'a4', true);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

      try {
        pdf.save('myData.pdf');
      } catch (error) {
        console.error('Error saving PDF:', error);
      }
    });
  };

  // Function to clear the entire database
  const clearDatabase = async () => {
    try {
      await idb.clearDatabase();
      setData([]);
      setTotalSum(0);
      setMaxCategorySum(0);
      setMaxCategory('');
      alert('Database cleared successfully.');
    } catch (error) {
      console.error('Error clearing database:', error);
      alert('Error clearing database. Please try again.');
    }
  };

  // Render the component
  return (
    <section id="report-table" className="py">
      <div className="container" ref={pdfRef}>
        {/* Search and filter form */}
        <div className="search-and-category">
          <form id="report-form">
            <h2 className="l-heading">
              <span className="text-primary">Search</span> By Time
            </h2>
            <div className="form-group">
              <label>
                Enter Year{' '}
                <input
                  name="years"
                  id="years"
                  type="text"
                  value={yearUserInput}
                  onChange={(e) => setYearUserInput(e.target.value)}
                />
              </label>
            </div>
            <div className="form-group">
              <label>
                Enter Month{' '}
                <input
                  name="months"
                  id="months"
                  type="text"
                  value={monthUserInput}
                  onChange={(e) => setMonthUserInput(e.target.value)}
                />
              </label>
            </div>
            <button className="add-btn" onClick={(event) => handleClick(event, yearUserInput, monthUserInput)}>
              Search
            </button>
            <span className="button-spacing"></span>
            <button className="download-report" title="Download PDF" onClick={downloadPDF}>
              Download PDF
            </button>
            <span className="button-spacing"></span>
            <button className="clear-database" onClick={clearDatabase}>
              Clear Database
            </button>
          </form>
          {/* Display max category sum information */}
          <div className="max-category-sum">
            Most Expend Category: <span>{maxCategory}</span> | With total max Sum of:{' '}
            <span>{maxCategorySum.toLocaleString('en-US')}</span>
          </div>
        </div>
        {/* Table to display report data */}
        <table className="value-of-table" id="value-of-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Sum</th>
              <th>Description</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((item, index) => (
                <tr key={index}>
                  <td>{item.category}</td>
                  <td>{item.sum}</td>
                  <td className={item.description.length > 20 ? 'small-text' : ''}>
                    {item.description}
                  </td>
                  <td>{item.date ? new Date(item.date).toLocaleDateString() : ''}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No data to display</td>
              </tr>
            )}
          </tbody>
        </table>
        {/* Display total sum of the report */}
        <table className="total-sum">
          <thead>
            <tr>
              <th>TOTAL SUM: {totalSum.toLocaleString('en-US')}</th>
            </tr>
          </thead>
        </table>
      </div>
    </section>
  );
}

export default Report;
