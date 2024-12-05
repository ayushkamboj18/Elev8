/* eslint-disable no-empty */
import { Link, Navigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import Notiflix from "notiflix";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false); // State for toggling password visibility
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false); // State for toggling confirm password visibility
  const [role] = useState("user"); // Default role is 'user'
  const [redirect, setRedirect] = useState(false);

  async function registerUser(ev) {
    ev.preventDefault();

    // Regex for name validation: Name must start with a letter, only letters and spaces allowed, minimum 2 characters
    const nameRegex = /^[A-Za-z][A-Za-z\s]*$/;
    if (!nameRegex.test(name)) {
      Notiflix.Notify.warning("Name must start with a letter and contain only letters and spaces.");
      return;
    }

    // Regex for Gmail validation: Email must start with a letter, valid Gmail format
    const emailRegex = /^[a-zA-Z][a-zA-Z0-9._%+-]*@gmail\.com$/;
    if (!emailRegex.test(email)) {
      Notiflix.Notify.warning("Email must be a valid Gmail address and start with a letter.");
      return;
    }

    // Regex for password validation: Minimum 8 characters, at least one uppercase letter, one lowercase letter, one number, and one special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      Notiflix.Notify.warning(
        "Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special character."
      );
      return;
    }

    if (password !== confirmPassword) {
      Notiflix.Notify.warning("Passwords do not match.");
      return;
    }

    try {
      await axios.post('/register', {
        name,
        email,
        password,
        role, // Include role in the registration payload
      });
      Notiflix.Notify.success("User is Registered successfully");
      setRedirect(true);
    } catch (e) {
      Notiflix.Notify.failure("User registration failed");
    }
}

  

  if (redirect) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex w-full h-full lg:-ml-24 px-10 py-10 justify-between place-items-center mt-12">
      <div className="hidden lg:flex flex-col right-box">
        <div className="flex flex-col gap-3">
          <div className="text-3xl font-black">Welcome to</div>
          <div>
            <img src="../src/assets/logo.png" alt="" className="w-48" />
          </div>
        </div>
        <div className="ml-48 w-80 mt-6">
          <img src="../src/assets/signuppic.svg" alt="" className="w-full" />
        </div>
      </div>

      {/* card */}
      <div className="bg-white w-full sm:w-full md:w-1/2 lg:w-1/3 px-7 py-7 rounded-xl shadow-2xl shadow-blue-500 flex justify-center items-center">
        <form
          className="flex flex-col w-full items-center space-y-6"
          onSubmit={registerUser}
        >
          <h1 className="font-extrabold mb-5 text-primarydark text-3xl">
            Sign Up
          </h1>

          {/* Name */}
          <div className="flex items-center w-full px-4 py-2 border rounded-lg shadow-sm bg-gray-50 space-x-3">
            <input
              type="text"
              placeholder="Name"
              className="w-full bg-transparent outline-none"
              value={name}
              onChange={(ev) => setName(ev.target.value)}
            />
          </div>

          {/* Email */}
          <div className="flex items-center w-full px-4 py-2 border rounded-lg shadow-sm bg-gray-50 space-x-3">
            <input
              type="email"
              placeholder="Email"
              className="w-full bg-transparent outline-none"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
            />
          </div>

          {/* Password */}
          <div className="flex items-center w-full px-4 py-2 border rounded-lg shadow-sm bg-gray-50 space-x-3">
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="Password"
              className="w-full bg-transparent outline-none"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
            />
            <button
              type="button"
              onClick={() => setPasswordVisible(!passwordVisible)}
              className="text-gray-500"
            >
              {passwordVisible ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.98 8.194a11.993 11.993 0 016.688-2.267c5.525 0 10.22 3.446 12.332 8.073a11.994 11.994 0 01-6.633 2.267 11.993 11.993 0 01-6.688-2.267"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.98 8.194a11.993 11.993 0 016.688-2.267c5.525 0 10.22 3.446 12.332 8.073a11.994 11.994 0 01-6.633 2.267 11.993 11.993 0 01-6.688-2.267"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="flex items-center w-full px-4 py-2 border rounded-lg shadow-sm bg-gray-50 space-x-3">
            <input
              type={confirmPasswordVisible ? "text" : "password"}
              placeholder="Confirm Password"
              className="w-full bg-transparent outline-none"
              value={confirmPassword}
              onChange={(ev) => setConfirmPassword(ev.target.value)}
            />
            <button
              type="button"
              onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
              className="text-gray-500"
            >
              {confirmPasswordVisible ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.98 8.194a11.993 11.993 0 016.688-2.267c5.525 0 10.22 3.446 12.332 8.073a11.994 11.994 0 01-6.633 2.267 11.993 11.993 0 01-6.688-2.267"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.98 8.194a11.993 11.993 0 016.688-2.267c5.525 0 10.22 3.446 12.332 8.073a11.994 11.994 0 01-6.633 2.267 11.993 11.993 0 01-6.688-2.267"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                  />
                </svg>
              )}
            </button>
          </div>

          <div className="w-full py-4 flex justify-between space-x-4">
            <button
              type="button"
              onClick={() => (window.location.href = "/")}
              className="w-1/2 py-2 rounded-lg text-white font-bold bg-gray-500 hover:bg-gray-700 transition duration-300"
            >
              ⬅ Back
            </button>
            <button
              type="submit"
              className="w-1/2 py-2 rounded-lg text-white font-bold bg-primary hover:bg-primarydark transition duration-300"
            >
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
