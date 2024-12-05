import { useContext, useState } from "react";
import { UserContext } from "../UserContext";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import Notiflix from "notiflix";

export default function UserAccountPageEdit() {
  const [name,setName]=useState("");
  const navigate =useNavigate();
  const { user,setUser } = useContext(UserContext);

  // Redirect to login if user is not logged in
  if (!user) {
    return <Navigate to="/login" />;
  }
 
  async function handleSubmit(e){
    e.preventDefault();

    try {
        const response = await axios.post("/editUser", { name });
        
        console.log("res:::",response.data.data);
        
        setUser((user)=>{
            user.name=response.data.data.name;
        });
        // Check response success
        if (response.status === 200 || response.status === 201) {
          Notiflix.Notify.success("User updated successfully!");
        } else {
          Notiflix.Notify.failure("Failed to update user. Please try again.");
        }

        navigate("/")
        //window.location.reload(true);
        
      } catch (error) {
        // Log and notify error
        console.error("Error while updating user:", error);
        Notiflix.Notify.failure("An error occurred while updating user.");
      }

    
  }

//   const editUser = async (name) => {
    
//   };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <form onSubmit={handleSubmit}>
            <div className="bg-white shadow rounded-lg p-6 w-full max-w-md">
                <h1 className="text-xl font-semibold text-gray-800 mb-4">Edit Account Page</h1>
                <p className="text-gray-700 font-semibold">
                Name:<sup className="text-red-500">*</sup>
                </p>
                <input type="text" name="name" className="border-2 border-blue-600 rounded-md p-2 w-full"
                    onChange={(e)=>{setName(e.target.value)}}
                ></input>

                {user.role === "admin" ? (
                <div className="mt-4">
                    <h2 className="text-lg font-medium text-gray-800">Admin Section</h2>
                    <p className="text-gray-600 text-sm">You have access to administrative features.</p>
                </div>
                ) : (
                <div className="mt-4">
                    <h2 className="text-lg font-medium text-gray-800">User Section</h2>
                    <p className="text-gray-600 text-sm">Thank you for being a valued user.</p>
                </div>
                )}
                <button type="submit" className="text-xl font-semibold text-white p-2 bg-blue-500 rounded-md w-fit cursor-pointer">
                    Edit
                </button>
            </div>

        </form>
    </div>
  );
}
