import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import "../ResetPassword.css";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isValidToken, setIsValidToken] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      try {
        const res = await axios.post("http://localhost:8080/api/auth/validate-reset-token", { token });
        if (res.data.valid) {
          setIsValidToken(true);
        } else {
          setError("This reset link is invalid or has expired.");
        }
      } catch {
        setError("This reset link is invalid or has expired.");
      }
    };
    validateToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
      setError("Password must be at least 8 characters, include 1 uppercase letter, 1 number and 1 special character.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:8080/api/auth/reset-password", {
        token,
        password,
      });
      setMessage(res.data.message || "Password reset successfully!");
      setTimeout(() => navigate("/"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Error resetting password.");
    } finally {
      setLoading(false);
    }
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  }

  const toggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  }

  return (
    <div className="reset-password-container">
      <img className="surprisedDog" src="/dog.webp" alt="dog"></img>
      <h2 className="resetPasswordH2">Reset Your Password</h2>
      {message && <p className="messageGreen">{message}</p>}
      {error && <p className="errorRed">{error}</p>}

      {isValidToken ? (
        <form onSubmit={handleSubmit} className="resetPasswordForm">
          <div className="typeNewPassword">
            <input
              className="typeNewPasswordInput"
              type={showPassword ? "text" : "password"}
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            <span className="newPasswordToggleIcon" onClick={togglePassword}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <div className="confirmNewPassword">
            <input
              className="typeNewPasswordInput"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
            <span className="confirmNewPasswordToggleIcon" onClick={toggleConfirmPassword}>
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <button className="resetPasswordButton" type="submit" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      ) : (
        <p className="expiredLink">
          This link is invalid or has expired. Please{" "}
          <a href="/forgot-password" className="requestNewLink">request a new reset link</a>.
        </p>
      )}
    </div>
  );
};

export default ResetPassword;
