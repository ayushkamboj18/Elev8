import { Route, Routes } from 'react-router-dom'
import './App.css'
import IndexPage from './pages/IndexPage'
import RegisterPage from './pages/RegisterPage'
import Layout from './Layout'
import LoginPage from './pages/LoginPage'
import axios from 'axios'
import { UserContextProvider } from './UserContext'
import UserAccountPage from './pages/UserAccountPage'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import AddEvent from './pages/AddEvent'
import EventPage from './pages/EventPage'
import CalendarView from './pages/CalendarView'
import OrderSummary from './pages/OrderSummary'
import PaymentSummary from './pages/PaymentSummary'
import TicketPage from './pages/TicketPage'
import NotFoundPage from './pages/NotFoundPage';
import AboutSection from './pages/AboutSection'
import { useState,useContext } from 'react'
import { UserContext } from './UserContext'
import UserAccountPageEdit from './pages/UserAccountPageEdit'


axios.defaults.baseURL = 'http://localhost:4000/';
axios.defaults.withCredentials=true;


function App() {
  const user1 = JSON.parse(localStorage.getItem("user"));
  const {user,setUser}=useContext(UserContext);
  //setUser({user1});
  console.log("User : ",user);
  
  return (
    <UserContextProvider> 
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<IndexPage />} />
          <Route path="/useraccount" element={<UserAccountPage />} />
          {user1?.role === "admin" && <Route path="/createEvent" element={<AddEvent />} />}
          <Route path="/event/:id" element={<EventPage />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/wallet" element={<TicketPage />} />
          <Route path="/event/:id/ordersummary" element={<OrderSummary />} />
          <Route path="/aboutPage" element={<AboutSection />} />
          <Route path="/userEdit" element={<UserAccountPageEdit></UserAccountPageEdit>}></Route>
          

        </Route>

        
        {!user1&&<Route path="/register" element={<RegisterPage />} />}
        {!user1&&<Route path="/login" element={<LoginPage />} />}
        {/* <Route path="/forgotpassword" element={<ForgotPassword />} /> */}
        {/* <Route path="/resetpassword" element={<ResetPassword />} /> */}
        <Route path="/event/:id/ordersummary/paymentsummary" element={<PaymentSummary />} />

        {/* Fallback route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </UserContextProvider>
  );
}

export default App;