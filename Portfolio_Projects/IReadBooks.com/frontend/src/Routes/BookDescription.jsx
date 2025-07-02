import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../BookDescription.css";

const BookDescription = ({ item, hideDescription, updateDescription }) => {
  const [description, setDescription] = useState(item.book_description || '');

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const submitDescription = async () => {
    try {
      const response = await axios.put(`http://localhost:8080/books/${item.id}/description`, {
        description,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      if (response.status === 200) {
        updateDescription(item.id, description); 
        hideDescription(); 
      }
    } catch (error) {
      console.error("Error updating description:", error);
      alert('Failed to update the description. Please try again.');
    }
  };

  return (
    <div className="newDescription">
      <div className="descriptionInputDiv">
        <textarea
          className="descriptionInput"
          value={description}
          onChange={handleDescriptionChange}
        />
      </div>
      <div className="descriptionButtons">
        <button className="submitDescription" onClick={submitDescription}>
          Submit
        </button>
        <button className="cancelDescription" onClick={hideDescription}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default BookDescription;

