'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, DollarSign, ImageIcon, AlertCircle } from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'

export default function AddEvent() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    owner: "",
    title: "",
    description: "",
    organizedBy: "",
    eventDate: "",
    eventTime: "",
    location: "",
    ticketPrice: 0,
    image: null,
    likes: 0,
  })

  const user = JSON.parse(localStorage.getItem("user"))

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      toast.error("Access Denied. Redirecting...", {
        icon: '🚫',
        duration: 3000,
      })
      setTimeout(() => navigate("/"), 3000)
    } else if (formData.owner !== user.name) {
      setFormData((prevState) => ({ ...prevState, owner: user.name }))
    }
  }, [user, navigate, formData.owner])

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    setFormData((prevState) => ({ ...prevState, image: file }))
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target

    if (files) {
      setFormData((prevState) => ({ ...prevState, [name]: files[0] }))
    } else {
      setFormData((prevState) => ({ ...prevState, [name]: value }))
    }
  }

  const validateFields = () => {
    const titleRegex = /^[A-Za-z](?:[A-Za-z0-9\s]{3,98}[A-Za-z0-9])?$/
    const descriptionRegex = /^[A-Za-z0-9][A-Za-z0-9\s.,'!?()]{9,499}$/
    const nameRegex = /^[A-Za-z][A-Za-z0-9\s.,'!?()]{3,49}$/
    const locationRegex = /^[A-Za-z][A-Za-z0-9\s.,'!?()]{5,100}$/

    if (!titleRegex.test(formData.title)) {
      toast.error("Title should be 5-100 characters long and contain only alphanumeric characters and spaces.")
      return false
    }

    if (!descriptionRegex.test(formData.description)) {
      toast.error("Description should be 10-500 characters long.")
      return false
    }

    if (!nameRegex.test(formData.organizedBy)) {
      toast.error("Organizer name should be 3-50 alphabetic characters.")
      return false
    }

    if (!locationRegex.test(formData.location)) {
      toast.error("Location should be 5-100 characters long and contain valid characters.")
      return false
    }

    if (formData.ticketPrice < 0||formData.ticketPrice > 100000000|| isNaN(formData.ticketPrice)) {
      toast.error("Ticket price must be a non-negative numberand less than 1Cr")
      return false
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const eventDate = new Date(formData.eventDate)
    const maxDate = new Date(today)
    maxDate.setFullYear(maxDate.getFullYear() + 10)

    if (eventDate < today || eventDate > maxDate) {
      toast.error("Event date must be between today and 10 years from now.")
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateFields()) return

    const formDataWithImage = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      formDataWithImage.append(key, value)
    })

    try {
      const response = await axios.post("/createEvent", formDataWithImage, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      toast.success("Event posted successfully", {
        icon: '🎉',
        duration: 3000,
      })
      setTimeout(() => navigate("/"), 1500)
    } catch (error) {
      console.error("Error in posting event:", error)
      toast.error("Error in posting Event", {
        icon: '❌',
        duration: 3000,
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden"
      >
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-8">Post an Event</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="title"
                    id="title"
                    required
                    className="p-2 border-2 border-indigo-500 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm  rounded-md"
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="organizedBy" className="block text-sm font-medium text-gray-700">
                  Organized By <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="organizedBy"
                    id="organizedBy"
                    required
                    className="p-2 border-2 border-indigo-500 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm  rounded-md"
                    value={formData.organizedBy}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    required
                    className="p-2 border-2 border-indigo-500 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm  rounded-md"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700">
                  Event Date <span className="text-red-500">*</span>
                </label>
                <div className="p-2 border-2 mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-700" />
                  </div>
                  <input
                    type="date"
                    name="eventDate"
                    id="eventDate"
                    required
                    className="p-2 border-2 border-indigo-500 focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm  rounded-md"
                    value={formData.eventDate}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="eventTime" className="block text-sm font-medium text-gray-700">
                  Event Time <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="time"
                    name="eventTime"
                    id="eventTime"
                    required
                    className="p-2 border-2 border-indigo-500 focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm  rounded-md"
                    value={formData.eventTime}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="location"
                    id="location"
                    required
                    className="p-2 border-2 border-indigo-500 focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm  rounded-md"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Please cross-check your location
                </p>
              </div>

              <div>
                <label htmlFor="ticketPrice" className="block text-sm font-medium text-gray-700">
                  Ticket Price <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    Rs.
                  </div>
                  <input
                    type="number"
                    name="ticketPrice"
                    id="ticketPrice"
                    required
                    className="p-2 border-2 border-indigo-500 focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm  rounded-md"
                    value={formData.ticketPrice}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                  Image <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ImageIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="file"
                    name="image"
                    id="image"
                    required
                    className="p-2 border-2 border-indigo-500 focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm  rounded-md"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>
            </div>

            <div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Post Event
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

