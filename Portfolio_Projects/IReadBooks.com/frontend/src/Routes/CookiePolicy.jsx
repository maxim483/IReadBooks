import React, { useState, useEffect } from "react";
import "../CookiePolicy.css";

const CookiePolicy = () => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const hasClosed = localStorage.getItem('cookie_policy_closed');
        if (!hasClosed) {
            setVisible(true);
        }
    }, []);

    const handleClose = () => {
        localStorage.setItem('cookie_policy_closed', 'true');
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div className="cookie-policy-container">
            <button className="close-button" onClick={handleClose}>×</button>
            <div className="cookie-policy-content">
                <h1>Cookie Policy</h1>
                <p>Last updated: 06/04/2025</p>
                <h2>1. What Are Cookies?</h2>
                <p>
                    Cookies are small text files stored in your browser by websites you visit. They help websites remember information about your visit, like your login status or preferences.
                </p>
                <h2>2. How We Use Cookies</h2>
                <p>
                    We use cookies solely for the purpose of keeping users logged in and maintaining secure sessions while using our site. These are known as "essential" or "strictly necessary" cookies.
                </p>
                <h2>3. Types of Cookies We Use</h2>
                <ul>
                    <li><strong>Session Cookies:</strong> These cookies are temporary and are erased when you close your browser. They are used to maintain your login session.</li>
                    <li><strong>Authentication Cookies:</strong> These help verify your identity while you are logged in and are required for accessing secure areas of the site.</li>
                </ul>
                <h2>4. Managing Cookies</h2>
                <p>
                    As these cookies are essential for the operation of the site, they cannot be disabled through the cookie settings. You can choose to disable cookies in your browser settings, but doing so may prevent you from logging in or using parts of the site.
                </p>
                <h2>5. Third-Party Cookies</h2>
                <p>
                    We do not use any third-party cookies for advertising, analytics, or tracking at this time.
                </p>

                <h2>6. Changes to This Policy</h2>
                <p>
                    We may update this Cookie Policy from time to time. Please revisit this page regularly to stay informed about our use of cookies.
                </p>
                <h2>7. Contact Us</h2>
                <p className="contactUs">
                    If you have any questions about our use of cookies, please contact us at: <a href="booksiread88@gmail.com" className='companyEmail'>booksiread88@gmail.com</a>
                </p>
            </div>
        </div>
    );
}

export default CookiePolicy;
