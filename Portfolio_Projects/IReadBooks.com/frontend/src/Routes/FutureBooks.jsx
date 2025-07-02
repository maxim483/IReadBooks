import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../FutureBooks.css';
import BookDescription from './BookDescription';
import BookAds from './BookAds';
import UserComments from './UserComments';


const FutureBooks = () => {
  const fileInputRef = useRef();
  const [alertMessage,setAlertMessage] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState("");
  const [status, setStatus] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showDescription, setShowDescription] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isButtonVisible, setIsButtonVisible] = useState(true);
  const [isDescription, setIsDescription] = useState(null);
  const [isMarkAsRead, setIsMarkAsRead] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('');
  const [books, setBooks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get('http://localhost:8080/futureBooks')
      .then((response) => {
        console.log("Fetched data:", response.data);
        setData(response.data || []);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to fetch data');
        setLoading(false);
        navigate('/');
      });
  }, [navigate]);

  useEffect(() => {
    if (isFormVisible) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  }, [isFormVisible]);

   useEffect(() => {
        if (alertMessage) {
          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth',
          });
        }
      }, [alertMessage]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/check-admin', {
          withCredentials: true,
        });
        if (response.data.isAdmin) {
          setIsAdmin(true);
        }
        else {
          setIsAdmin(false);
        }
      }
      catch (err) {
        console.error('Auth check failed:', err);
        setIsAdmin(false);
      }
    };

    checkAuth();

  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const goBack = () => {
    navigate(-1);
  };

  const openCommentsForm = async (book) => {
    if (!book || !book.id) {
      console.error("Invalid book object:", book);
      return;
    }
    try {
      navigate(`/comments/${book.id}`, { state: { book } });
    } catch (err) {
      console.log(err);
    }
  };

  const descriptionHover = (bookId) => {
    setIsDescription(bookId);
  };

  const descriptionNoHover = () => {
    setIsDescription(null);
  };

  const showBookDescription = (bookId) => {
    setShowDescription(bookId);
  }

  const hideBookDescription = () => {
    setShowDescription(null);
  }

  const updateDescriptionInFrontend = (bookId, newDescription) => {
    const updatedBooks = data.map((book) =>
      book.id === bookId ? { ...book, book_description: newDescription } : book
    );
    setData(updatedBooks);
  };

  const markAsReadHover = (bookId) => {
    setIsMarkAsRead(bookId);
  };

  const markAsReadNoHover = () => {
    setIsMarkAsRead(null);
  };

  const moveToPresentBooks = async (bookId) => {
    try {
      await axios.post('http://localhost:8080/moveToPresent', { bookId });
      setData(data.filter((book) => book.id !== bookId));
    } catch (error) {
      console.error('Error moving book to past:', error);
      alert('Failed to move the book to Past Books');
    }
  };

  const openForm = () => {
    setIsButtonVisible(false);
    setIsFormVisible(true);
  };

  // const closeForm = () => {
  //   setIsFormVisible(false);
  //   setIsButtonVisible(true);
  // };


  const handleFocusTitle = () => {
    if (title === "") setTitle("");
  };

  const handleBlurTitle = (e) => {
    if (e.target.value.trim() === "") {
      setTitle("");
    }
  };

  const handleFocusDescription = () => {
    if (title === "") setDescription("");
  };

  const handleBlurDescription = (e) => {
    if (e.target.value.trim() === "") {
      setDescription("");
    }
  };

  const handleFocusRating = () => {
    if (title === "") setRating("");
  };

  const handleBlurRating = (e) => {
    if (e.target.value.trim() === "") {
      setRating("");
    }
  };

  const handleFocusStatus = () => {
    if (title === "") setStatus("");
  };

  const handleBlurStatus = (e) => {
    if (e.target.value.trim() === "") {
      setStatus("");
    }
  };


  const sortData = (data, sortBy) => {
    if (!Array.isArray(data)) return [];

    switch (sortBy) {
      case 'titleAsc':
        return [...data].sort((a, b) => a.book_title.localeCompare(b.book_title));
      case 'titleDesc':
        return [...data].sort((a, b) => b.book_title.localeCompare(a.book_title));
      case 'ratingAsc':
        return [...data].sort((a, b) => a.averageRating - b.averageRating);
      case 'ratingDesc':
        return [...data].sort((a, b) => b.averageRating - a.averageRating);
      default:
        return data;
    }
  };

  const sortedData = sortData(data, sortBy);

  const handleSortByTitleAsc = () => setSortBy('titleAsc');
  const handleSortByTitleDesc = () => setSortBy('titleDesc');
  const handleSortByRatingAsc = () => setSortBy('ratingAsc');
  const handleSortByRatingDesc = () => setSortBy('ratingDesc');

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };


  const handleSubmitBook = async () => {
    const file = fileInputRef.current?.files[0];

    if (!file) {
      setAlertMessage('Please upload an image');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result.split(',')[1];

      const payload = {
        title,
        description,
        rating,
        status,
        imageBase64: base64Image
      };

      try {
        const response = await axios.post(
          'http://localhost:8080/admin/add-book',
          payload,
          { withCredentials: true }
        );

        if (response.status === 201) {
          setAlertMessage('Book added successfully');
          window.location.reload();
        } else {
          alert('Failed to add book');
        }
      } catch (err) {
        console.error('Error submitting book:', err);
        setAlertMessage('Error adding book');
      }
    };

    reader.readAsDataURL(file);
  };


  const deleteBook = async (id) => {
    try {
      const res = await axios.delete(`http://localhost:8080/admin/delete-book/${id}`, {
        withCredentials: true,
      });
      console.log(res.data.message);
      setBooks(books.filter((book) => book.id !== id));
      window.location.reload();
    } catch (error) {
      console.error('Error deleting book:', error.response?.data || error.message);
    }
  };


  if (loading) {
    return null;
  }


  return (
    <div className="body">
      <BookAds />
      <div className="goBackDiv">
        <button onClick={goBack} className="goBack">&laquo; previous page</button>
      </div>

      <div className="dropdown" id="sortByTitle">
        <button className="dropbtn">Sort books by title</button>
        <div className="dropdown-content">
          <a href="#" onClick={handleSortByTitleAsc}>From A to Z</a>
          <a href="#" onClick={handleSortByTitleDesc}>From Z to A</a>
        </div>
      </div>

      <div className="dropdown" id="sortByRatings">
        <button className="dropbtn">Sort books by ratings</button>
        <div className="dropdown-content">
          <a href="#" onClick={handleSortByRatingAsc}>From 0 to 5</a>
          <a href="#" onClick={handleSortByRatingDesc}>From 5 to 0</a>
        </div>
      </div>

      <div className="booksContainer">
        {sortedData.length === 0 ? (
          <p>No books available at the moment.</p>
        ) : (
          sortedData.map((item) => (
            <div className="book" key={item.id}>
              <div className="bookContent">
                <div className="bookLeftColumn">
                  <div className="image">
                    <img src={item.image} alt={`Cover image of ${item.book_title}`} />
                  </div>
                  {(() => {
                    const roundedRating = Math.round(item.averageRating * 2) / 2;

                    return (
                      <div className="averageRating">
                        <div className="starDisplay">
                          {[1, 2, 3, 4, 5].map((star) => {
                            let className = "star empty";

                            if (roundedRating >= star) {
                              className = "star full";
                            } else if (roundedRating >= star - 0.5) {
                              className = "star half";
                            }
                            return (
                              <span key={star} className={className}>
                                ★
                              </span>
                            );
                          })}
                          <span className="ratingNumber">{roundedRating.toFixed(1)}</span>
                        </div>
                      </div>
                    );
                  })()
                  }

                  <div className="bookRating">
                    <div className='userCommentsDiv'>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          openCommentsForm(item);
                        }}
                        className="userComments"
                      >
                        user comments
                      </a>
                      <span>{item.comments}</span>


                    </div>
                  </div>
                </div>

                <div className="bookRightColumn">
                  <div className="bookTitle">
                    <strong className='titleStrong'>Title: </strong> {item.book_title}
                  </div>
                  <div className="bookDescription">
                    <a href='#' onClick={() => showBookDescription(item.id)}
                      onMouseEnter={() => descriptionHover(item.id)}
                      onMouseLeave={descriptionNoHover} className='descriptionStrong'>Description: </a>
                    {item.book_description}
                    {isAdmin && showDescription === item.id && (<BookDescription item={item} hideDescription={hideBookDescription} updateDescription={updateDescriptionInFrontend} />)}
                    {isDescription === item.id && (
                      <div className="hoverDescription">For Admin Use Only</div>
                    )}
                  </div>

                  <div className="deleteBookData">
                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          deleteBook(item.id)
                        }}
                        onMouseEnter={() => markAsReadHover(item.id)}
                        onMouseLeave={markAsReadNoHover}
                        className='deleteBookButton'
                      >
                        Delete the book
                      </button>
                    )}
                  </div>

                  <div className="markAsReading">
                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          moveToPresentBooks(item.id)
                        }}
                        onMouseEnter={() => markAsReadHover(item.id)}
                        onMouseLeave={markAsReadNoHover}
                        className='markAsReadingButton'
                      >
                        Mark as reading
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isAdmin && isButtonVisible && (
        <div className='newBook'>
          <button className='addANewBook' onClick={openForm}>Add a new book</button>
        </div>
      )}

      {isFormVisible && (
        <div>
          <table>
            <thead>
              <tr>
                <th>Book Image</th>
                <th>Book Title</th>
                <th>Book Description</th>
                <th>Book Rating</th>
                <th>Book Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className='imageUpload'>
                  Upload the book cover
                  <img className='UploadImage'
                    src='uploadImages.jpg'
                    alt='Upload'
                    onClick={handleImageClick}>
                  </img>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  {previewUrl && (
                    <img className='preview'
                      src={previewUrl}
                      alt="Preview"

                    />
                  )}

                </td>
                <td>
                  <input
                    className='input'
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    type="text"
                    placeholder="Enter book title"
                    onFocus={handleFocusTitle}
                    onBlur={handleBlurTitle}
                  />
                </td>
                <td>
                  <input
                    className='input'
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    type="text"
                    placeholder="Enter book description"
                    onFocus={handleFocusDescription}
                    onBlur={handleBlurDescription}
                  />
                </td>
                <td>
                  <input
                    className='input'
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    type="text"
                    placeholder="Enter book rating"
                    onFocus={handleFocusRating}
                    onBlur={handleBlurRating}
                  />
                </td>
                <td>
                  <input
                    className='input'
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    type="text"
                    placeholder="Enter book status"
                    onFocus={handleFocusStatus}
                    onBlur={handleBlurStatus}
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <div className='submitBook'>
            <button className='submitBookData' onClick={handleSubmitBook}>Submit your book</button>
          </div>
          <div className='alert'>
            {alertMessage}
          </div>
        </div>
      )}
    </div>
  );
};



export default FutureBooks;











