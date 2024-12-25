import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [loading, setLoading] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL + "/api/items";

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const response = await fetch(apiUrl);
        const data = await response.json();
        setItems(data);
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const addItem = async (e) => {
    e.preventDefault();

    if (!newItem) return;

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newItem }),
      });

      if (response.ok) {
        const newItemFromServer = await response.json();
        setItems([...items, newItemFromServer]);
        setNewItem("");
      } else {
        console.error("Failed to add item");
      }
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  return (
    <div className="App">
      <h1>Items List</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id}>{item.name}</li>
          ))}
        </ul>
      )}

      <form onSubmit={addItem}>
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add a new item"
        />
        <button type="submit">Add</button>
      </form>
    </div>
  );
}

export default App;
