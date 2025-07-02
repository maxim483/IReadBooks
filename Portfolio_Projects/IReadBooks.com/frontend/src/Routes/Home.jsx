import React, { useState, useEffect } from "react";
import axios from "axios";
import SignUpForm from "./SignUpForm";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import CookiePolicy from "./CookiePolicy";
import "../Home.css";

const Home = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [loginFormVisible, setLoginFormVisible] = useState(true);
  const [loginMessage, setLoginMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcomeNote, setShowWelcomeNote] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/check-auth', {
          withCredentials: true,
        });

        if (response.data.authenticated) {
          setLoginFormVisible(false);
        } else {
          setLoginFormVisible(true);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        setLoginFormVisible(true);
      }
    };

    checkAuth();
  }, []);


  const goToPastBooks = () => {
    navigate('/pastBooks');
  }

  const goToPresentBooks = () => {
    navigate('/presentBooks');
  }

  const goToFutureBooks = () => {
    navigate('/futureBooks');
  }

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  }

  const toggleFormVisibility = () => {
    setIsFormVisible(!isFormVisible);
  };

  const closeForm = () => {
    setIsFormVisible(false);
  };


  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const emailToLowerCase = email.toLowerCase();

    try {
      const response = await axios.post("http://localhost:8080/login", {
        username: emailToLowerCase,
        password: password,
      }, {
        withCredentials: true
      });
      setLoginMessage(response.data);

      setTimeout(() => {
        setLoginMessage("");
      }, 5000);

      setEmail("");
      setPassword("");
      setLoginFormVisible(false);
      navigate("/");

    } catch (error) {
      const message = error.response?.data?.message || "Login failed.";
      setLoginMessage(message);
      setTimeout(() => setLoginMessage(""), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  
  const handleLogout = async () => {
    try {
      const res = await axios.post("http://localhost:8080/logout", {}, {
        withCredentials: true,
      });

      if (res.status === 200) {
        setLoginMessage(res.data.message || "You have successfully logged out.");
        setLoginFormVisible(true);

        setTimeout(() => {
          setLoginMessage("");
        }, 3000);
      }
    } catch (error) {
      console.error("Logout failed:", error);
      setLoginMessage("Logout failed. Please try again.");
    }
  };

  
  const handleSignUpSubmit = async (userData) => {
    try {
      const response = await axios.post("http://localhost:8080/register", userData);
      alert(response.data);
      setIsFormVisible(false);
    } catch (error) {
      alert(error.response?.data || "Registration failed.");
    }
  };

  return (
    <div className="background">
      {loginFormVisible && (<CookiePolicy />)}
      {!loginFormVisible && (
        <div className="logoutContainer">
          <button className="logoutButton" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}

      <div className="buttonsContainer">
        <button onClick={goToPastBooks} className="readBtn" type="button">Books I have read</button>
        <button onClick={goToPresentBooks} className="readingBtn" type="button">Books I'm reading</button>
        <button onClick={goToFutureBooks} className="yetReadBtn" type="button">Books I'll read</button>
      </div>

      {loginFormVisible ? (
        <div className="loginContainer">
          <h2 className="signInNote">Sign in to enhance your full user experience</h2>


          <form className="formSubmit" onSubmit={handleLoginSubmit}>
            <input
              id="email"
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="off"
            />

            <div className="passwordContainer">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="off"
              />
              <span className="iconPasswordToggle" onClick={togglePassword}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <button type="submit" className="submitButton">Login</button>
          </form>
          <Link to="/forgot-password" className="forgotPassword">Forgot password</Link>

          <div className="signUpDiv">
            Don't have an account?{" "}
            <a href="#" className="signUp" onClick={() => setIsFormVisible(true)}>
              Sign up
            </a>

            {isFormVisible && (<div className="overlay"><SignUpForm onSubmit={handleSignUpSubmit} /></div>)}
          </div>
        </div>
      ) : null}
      {loginMessage && (
        <h1 id="loginMessage" className={`welcomeNote ${showWelcomeNote ? "hidden" : "show"}`}>
          {loginMessage}
        </h1>
      )}

      <div className="slogan">"You can't buy happiness but you can buy books...and that's kind of the same thing !"</div>
    </div>
  );
};

export default Home;
