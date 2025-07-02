import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import LeaveAComment from "./LeaveAComment";
import BookAds from "./BookAds";
import "../UserComments.css";

const UserComments = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [comments, setComments] = useState([]);
  const [isUser, setIsUser] = useState(false);
  const [notUser, setNotUser] = useState("");
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

    const fetchComments = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/comments/${id}/all`, {
          withCredentials: true,
        });
        setComments(res.data);
      } catch (err) {
        console.error("Failed to fetch comments:", err);
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
    fetchComments();
    fetchBook();
    checkAuth();
  }, [id]);



  const LeaveACommentForm = async (book) => {
    if (!book || !book.id) {
      console.error("Invalid book object:", book);
      return;
    }

    try {
      const res = await axios.get("http://localhost:8080/api/check-user", {
        withCredentials: true,
      });

      if (res.data.isUser) {
        navigate(`/leave-a-comment/${book.id}`);


      } else {
        setNotUser("You must be logged in to leave a comment.")
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      alert("Something went wrong.");
    }
  };

  const cancelGoBack = () => {
    navigate(-1);
  }

  const average = book?.averageRating ? Number(book.averageRating) : 0;
  const roundedRating = Math.round(average * 2) / 2;
  

  return (
    <div>
      <div className="commentSection">
        <BookAds />
  
        {book ? (
          <>
            <h3 className="bookTitle">{book.book_title}</h3>
            {book.image && (
              <img src={book.image} alt="Book cover" className="bookCover" />
            )}
  
            <div className="averageRating">
              <div className="starDisplay">
                {[1, 2, 3, 4, 5].map((star) => {
                  let className = "star empty";
                  const average = Number(book.averageRating || 0);
                  const roundedRating = Math.round(average * 2) / 2;
  
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
                <span className="ratingNumber">
                  {Number(book.averageRating || 0).toFixed(1)}
                </span>
              </div>
            </div>
  
           <div className="commentsList">
              <h4 className="userCommentsH4">User Comments</h4>
              {comments.length > 0 ? (
                comments.map((c, index) => (
                  <div key={index} className="comment">
                    <strong className="username">
                      {c.username || "Verified User"}{" "}
                    </strong>
                    <div className="starDisplay">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`fa fa-star ${
                            star <= c.rating ? "checked" : "unchecked"
                          }`}
                        ></span>
                      ))}
                    </div>
                    {c.comment}
                    <br />
                    <small className="createdAt">
                      {new Date(c.created_at).toLocaleString()}
                    </small>
                  </div>
                   
                ))
              ) : (
                <p className="noComments">
                  No comments yet. Be the first one to leave a comment!
                </p>
              )}
            </div>
  
            <button
              className="leaveACommentButton"
              onClick={() => LeaveACommentForm(book)}
            >
              Leave a comment
            </button>
            <button className="goBackButton" onClick={cancelGoBack}>Cancel</button>
            <div className="notUser">{notUser}</div>
          </>
        ) : (
          <p>Loading book data...</p>
        )}
      </div>
    </div>
  );
  
};

export default UserComments;
