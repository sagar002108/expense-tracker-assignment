import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import './index.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    title: '', amount: '', category: '', date: '', description: ''
  });
  
  // FILTER STATES
  const [filter, setFilter] = useState('7days'); 
  const [customMonth, setCustomMonth] = useState(new Date().toISOString().slice(0, 7)); // Default to current YYYY-MM

  const API_URL = "https://expense-tracker-api.onrender.com/api/v1";

  const getExpenses = async () => {
    try {
     
      const res = await axios.get(`${API_URL}/get-incomes`);
      setExpenses(res.data);
    } catch (err) {
      console.error("DB Connection Error:", err);
    }
  };

  useEffect(() => {
    getExpenses();
  }, []);

  const handleInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      
      await axios.post(`${API_URL}/add-income`, formData);
      getExpenses();
      setFormData({ title: '', amount: '', category: '', date: '', description: '' });
    } catch (err) {
      alert("Error adding expense");
    }
  };

  const handleDelete = async (id) => {
    try {
      
      await axios.delete(`${API_URL}/delete-income/${id}`);
      getExpenses();
    } catch (err) {
      console.error(err);
    }
  };

  // --- FILTERING LOGIC ---
  const filteredExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    const today = new Date();

    if (filter === '7days') {
      const dateLimit = new Date();
      dateLimit.setDate(today.getDate() - 7);
      return expenseDate >= dateLimit;
    }
    
    if (filter === '30days') {
      const dateLimit = new Date();
      dateLimit.setDate(today.getDate() - 30);
      return expenseDate >= dateLimit;
    }

    if (filter === 'custom_month') {
      const [year, month] = customMonth.split('-');
      return (
        expenseDate.getFullYear() === parseInt(year) &&
        (expenseDate.getMonth() + 1) === parseInt(month)
      );
    }

    return true; // 'all'
  });

  const totalExpense = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  // --- Chart Data Preparation ---
  const chartDataMap = {};
  filteredExpenses.forEach(exp => {
    const dateStr = new Date(exp.date).toLocaleDateString('en-GB'); 
    chartDataMap[dateStr] = (chartDataMap[dateStr] || 0) + exp.amount;
  });

  const chartData = {
    labels: Object.keys(chartDataMap),
    datasets: [
      {
        label: 'Expenses (฿)',
        data: Object.values(chartDataMap),
        backgroundColor: 'rgba(79, 70, 229, 0.6)', 
        borderColor: 'rgba(79, 70, 229, 1)',
        borderWidth: 1,
      },
    ],
  };

  const categoryStats = {};
  filteredExpenses.forEach(exp => {
    categoryStats[exp.category] = (categoryStats[exp.category] || 0) + exp.amount;
  });

  return (
    <div className="app-container">
      <aside className="sidebar">
        <h2>📊 Tracker</h2>
        <div className="user-profile">
          <div className="avatar">👤</div>
          <p>Admin User</p>
        </div>
        <nav>
          <button className="active">Dashboard</button>
        </nav>
      </aside>

      <main className="main-content">
        <header>
          <h1>Dashboard</h1>
          
          <div className="filter-box">
             {filter === 'custom_month' && (
                <input 
                  type="month" 
                  value={customMonth}
                  onChange={(e) => setCustomMonth(e.target.value)}
                  style={{marginRight: '10px', padding: '8px', border: '1px solid #ddd', borderRadius:'6px'}}
                />
             )}
             
             <select onChange={(e) => setFilter(e.target.value)} value={filter}>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="custom_month">Select Month & Year</option>
                <option value="all">All Time</option>
             </select>
          </div>
        </header>

        <div className="stats-grid">
          <div className="stat-card total">
            <h3>Total Spending</h3>
            <h1>฿ {totalExpense.toLocaleString()}</h1>
            <p>
                {filter === '7days' ? 'Last 7 Days' : 
                 filter === '30days' ? 'Last 30 Days' :
                 filter === 'custom_month' ? `In ${customMonth}` : 'All Time'}
            </p>
          </div>
          <div className="stat-card count">
             <h3>Transactions</h3>
             <h1>{filteredExpenses.length}</h1>
          </div>
           <div className="stat-card category-summary">
             <h3>Top Categories</h3>
             <ul>
                {Object.keys(categoryStats).slice(0, 3).map(cat => (
                  <li key={cat}>
                    <span>{cat}</span> 
                    <strong>฿{categoryStats[cat].toLocaleString()}</strong>
                  </li>
                ))}
                {Object.keys(categoryStats).length === 0 && <li>No data yet</li>}
             </ul>
          </div>
        </div>

        <div className="content-grid">
          <div className="left-column">
            <div className="chart-container">
               <h3>Spending Trends</h3>
               {filteredExpenses.length > 0 ? (
                 <Bar data={chartData} />
               ) : (
                 <p style={{textAlign: 'center', padding: '20px', color:'#888'}}>No expenses found for this period.</p>
               )}
            </div>

            <div className="form-container">
              <h3>Add New Expense</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <input type="text" name="title" value={formData.title} placeholder="Title" onChange={handleInput} required />
                  <input type="number" name="amount" value={formData.amount} placeholder="Amount (฿)" onChange={handleInput} required />
                </div>
                <div className="form-row">
                  <input type="date" name="date" value={formData.date} onChange={handleInput} required />
                  <select name="category" value={formData.category} onChange={handleInput} required>
                    <option value="" disabled>Category</option>
                    <option value="Food">Food</option>
                    <option value="Transport">Transport</option>
                    <option value="Health">Health</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Bills">Bills</option>
                  </select>
                </div>
                <div className="form-row">
                    <input type="text" name="description" value={formData.description} placeholder="Note" onChange={handleInput} />
                    <button type="submit" className="add-btn">+ Add</button>
                </div>
              </form>
            </div>
          </div>

          <div className="right-column">
            <h3>Transaction History</h3>
            <div className="transaction-list">
              {filteredExpenses.map((expense) => (
                <div key={expense._id} className="transaction-item">
                  <div className="t-icon">💸</div>
                  <div className="t-info">
                    <h4>{expense.title}</h4>
                    <small>{new Date(expense.date).toLocaleDateString()} • {expense.category}</small>
                  </div>
                  <div className="t-amount">
                    <span className="minus">-฿{expense.amount.toLocaleString()}</span>
                    <button className="del-btn" onClick={() => handleDelete(expense._id)}>×</button>
                  </div>
                </div>
              ))}
              {filteredExpenses.length === 0 && <p className="no-data" style={{textAlign:'center'}}>No records.</p>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;