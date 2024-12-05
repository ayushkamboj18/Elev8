'use client'

import { useContext } from "react"
import { UserContext } from "../UserContext"
import { Navigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Edit, User, Shield } from 'lucide-react'

export default function UserAccountPage() {
  const { user } = useContext(UserContext)

  // Redirect to login if user is not logged in
  if (!user) {
    return <Navigate to="/login" />
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-300 via-blue-200 to-blue-400">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md"
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Account</h1>
          <Link to="/userEdit">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out flex items-center"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Details
            </motion.button>
          </Link>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Welcome,</p>
              <p className="text-lg font-semibold text-gray-800">{user.name}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 p-3 rounded-full">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Your role</p>
              <p className="text-lg font-semibold text-gray-800 capitalize">{user.role}</p>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-8 p-6 bg-gray-50 rounded-xl"
        >
          {user.role === "admin" ? (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Admin Section</h2>
              <p className="text-gray-600">You have access to administrative features. Manage your team and oversee operations with ease.</p>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">User Section</h2>
              <p className="text-gray-600">Thank you for being a valued user. Explore our features and make the most of your account.</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}

