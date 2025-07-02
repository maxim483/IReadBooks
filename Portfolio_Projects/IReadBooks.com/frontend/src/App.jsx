import React from 'react';
import {BrowserRouter as Router,Routes,Route} from "react-router-dom";
import "./App.css";
import Home from "./Routes/Home.jsx";
import PastBooks from "./Routes/PastBooks.jsx";
import PresentBooks from "./Routes/PresentBooks.jsx";
import FutureBooks from "./Routes/FutureBooks.jsx";
import ForgotPassword from "./Routes/ForgotPassword.jsx";
import ResetPassword from "./Routes/ResetPassword.jsx";
import UserComments from './Routes/UserComments.jsx';
import LeaveAComment from './Routes/LeaveAComment.jsx';
import CookiePolicy from './Routes/CookiePolicy.jsx';

function App() {
 
  return ( 
    <div>
   <Router>
    <Routes>
    <Route  path="/" element={<Home />} />
    <Route path='/cookiePolicy' element={<CookiePolicy />} />
    <Route  path="/pastBooks" element={<PastBooks />} />
    <Route  path="/presentBooks" element={<PresentBooks />} />
    <Route  path="/futureBooks" element={<FutureBooks />} />
    <Route path='/comments' element={<PresentBooks/>} />
    <Route path="/comments/:id" element={<UserComments />} />
    <Route path="/leave-a-comment/:id" element={<LeaveAComment />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password/:token" element={<ResetPassword />} />
    </Routes>
   </Router>
   </div>
  )
}

export default App;



   
