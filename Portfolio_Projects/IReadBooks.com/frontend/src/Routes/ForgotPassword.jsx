import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BookAds from "./BookAds";
import "../ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    const gmailToLowerCase = email.toLowerCase();

    if (!validateEmail(gmailToLowerCase)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    console.log("Sending email:", gmailToLowerCase);

    try {
      await axios.post("http://localhost:8080/api/auth/forgot-password", {
        email: gmailToLowerCase,
      });

      setMessage("A reset link has been sent to the email linked to your account !");
      setEmail("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const cancelForm = () => {
    navigate(-1);
  }

  return (
    <div className="forgotPasswordContainer">
       <BookAds />
      <img className="surprisedDog" src="surprised-dog.jpg" alt="surprised-dog"></img>
      <h2 className="forgotPasswordH2">Forgot Password ?</h2>
      <h3 className="forgotPasswordH3">Don't worry , we got you covered !</h3>
      {message && <p className="messageGreen">{message}</p>}
      {error && <p className="errorRed">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="typeEmailDiv">
        <input
          type="email"
          className="typeEmail"
          placeholder="Enter your registered email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        </div>
        <div className="forgotPasswordButtonDiv">
        <button className="forgotPasswordButton" type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
        </div>
      </form>
      <button className="cancelButton" onClick={cancelForm}>Cancel</button>
    </div>
  );
};

export default ForgotPassword;
