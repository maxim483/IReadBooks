import React, { useState } from "react";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import "../SignUpForm.css";

const SignUpForm = ({ onSubmit }) => {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState(""); 
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const goBackHome = () => {
        navigate(-1);
    }

    const togglePassword = () => {
        setShowPassword(!showPassword);
    }

    const toggleConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }

        const userData = { username, email, password };  // Include username
        onSubmit(userData);
    };

    return (
        <div className="signUpContainer">
            <div className="signUpMessage">Sign Up or if you already have an account <a href="" onClick={goBackHome} className="backToSignIn"> sign in</a></div>
            <form onSubmit={handleSubmit}>
                <div className="signUpEmail">
                <input
                    id="signUpEmail"
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                </div>
                <div className="signUpUsername">
                    <input
                        id="signUpUsername"
                        type="text"
                        placeholder="Choose a username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="passwordDiv">
                <input 
                    id="signUpPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <span className="passwordToggleIcon" onClick={togglePassword}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
                </div>
                <div className="confirmPasswordDiv">
                <input
                    id="signUpPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
                <span className="confirmPasswordToggleIcon" onClick={toggleConfirmPassword}>
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
                </div>
                   <div className="signUpButtonDiv">
                    <button type="submit" className="signUpButton">Sign Up</button>
                </div>
            </form>
            
            {message && <p>{message}</p>}
        </div>
    
    );
};

export default SignUpForm;




