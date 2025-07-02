import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Filter } from 'bad-words'
import BookAds from "./BookAds";
import "../LeaveAComment.css";

const filter = new Filter();

const LeaveAComment = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [comment, setComment] = useState("");
  const [isUser, setIsUser] = useState(false);
  const [rating, setRating] = useState(0);
  const [badWordsAlert, setBadWordsAlert] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/comments/${id}`, {
          withCredentials: true,
        });
        setBook(res.data);
      } catch (err) {
        console.error("Failed to fetch book:", err);
      }
    };

    const checkAuth = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/check-user", {
          withCredentials: true,
        });
        setIsUser(res.data.isUser);
      } catch (err) {
        console.error("Failed to check auth:", err);
        setIsUser(false);
      }
    };

    fetchBook();
    checkAuth();
  }, [id]);

  const submitComment = async () => {

    if (filter.isProfane(comment)) {
      setBadWordsAlert('Please remove inappropriate language');
      return;
    }

    try {
      await axios.post(
        "http://localhost:8080/comments",
        {
          bookId: id,
          comment,
          rating,
        },
        {
          withCredentials: true,
        }
      );

      alert("Comment submitted!");
      setComment("");
      navigate(`/comments/${id}`);
    } catch (err) {
      console.error("Comment submit error:", err);
      if (err.response?.status === 401) {
        alert("You must be logged in to comment.");
      } else {
        alert("Could not submit comment.");
      }
    }
  };

  const goBack = () => {
    navigate(-1);
  }

  return (
    <div className="commentSection">
      <BookAds />
  
      {book ? (
        <>
          <h3 className="bookTitle">{book.book_title}</h3>
          {book.image && (
            <img src={book.image} alt="Book cover" className="bookCover" />
          )}
  
          <div className="ratingInput">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => setRating(star)}
                className={`star ${star <= rating ? "selected" : ""}`}
              >
                ★
              </span>
            ))}
          </div>
  
          {isUser ? (
            <>
              <textarea
                className="textarea"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Leave your comment..."
              />
              <button
                className="submitComment"
                onClick={submitComment}
                disabled={!comment.trim()}
              >
                Submit
              </button>
              <button className="goBackButton" onClick={goBack}>Cancel</button>
            </>
          ) : (
            <p>You must be logged in to leave a comment.</p>
          )}
  
          {badWordsAlert && (
            <p style={{ color: "red" }}>{badWordsAlert}</p>
          )}
        </>
      ) : (
        <p>Loading book details...</p>
      )}
    </div>
  );
}  

export default LeaveAComment;
