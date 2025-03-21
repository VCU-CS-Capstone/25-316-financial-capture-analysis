import React, { useState } from "react";

const ExpenseCategoryModal = ({ onConfirm }) => {
  const [category, setCategory] = useState("");

  const categories = [
    "Restaurant",
    "Entertainment",
    "Gas",
    "Utilities",
    "Grocery",
    "Other",
    "Housing",
    "Clothing",
    "Travel",
    "Insurance",
    "Healthcare/Medical",
    "Education",
    "Subscriptions",
    "Transportation",
    "Gifts/Donations",
    "Childcare",
    "Personal Care",
    "Pets",
    "Electronics",
    "Cleaning Supplies",
  ];

  const handleConfirm = () => {
    if (category) {
      onConfirm(category);
    } else {
      alert("Please select an expense category before confirming!");
    }
  };

  return (
    <div className="modal">
      <h2>Upload Receipt</h2>
      <p>Review the extracted details below and select an expense category:</p>
      <form>
        <label htmlFor="category">Expense Category:</label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="" disabled>
            Select Category
          </option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </form>
      <button onClick={handleConfirm} disabled={!category}>
        Confirm
      </button>
    </div>
  );
};

export default ExpenseCategoryModal;
