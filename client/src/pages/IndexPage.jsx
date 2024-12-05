import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BsArrowRightShort } from "react-icons/bs";
// import { BiLike } from "react-icons/bi";
import { AiOutlineDelete } from "react-icons/ai";
import Magicbanner from "./magicBanner/MagicBanner";
import Organiser from "./Organizer/Organizer";
import Notiflix from "notiflix";
import NewsLetter from "./newsLetter/NewsLetter";

export default function IndexPage() {
  const [events, setEvents] = useState([]);
  const user = JSON.parse(localStorage.getItem("user")); // Get user from localStorage

  useEffect(() => {
    axios
      .get("/createEvent")
      .then((response) => {
        setEvents(response.data);
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
        Notiflix.Notify.failure("Error fetching Events");
      });
  }, []);

  const handleLike = async (eventId) => {
    try {
      await axios.post(`/event/${eventId}`);
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event._id === eventId ? { ...event, likes: event.likes + 1 } : event
        )
      );
      Notiflix.Notify.success("Liked");
    } catch (error) {
      console.error("Error liking the event", error);
      Notiflix.Notify.failure("Error liking the event");
    }
  };

  const handleDelete = async (eventId) => {
    if (!user || user.role !== "admin") {
      Notiflix.Notify.failure("Access denied");
      return;
    }
  
    try {
      await axios.delete(`/admin/event/${eventId}`, {
        headers: {
          Authorization: `Bearer ${user.token}`, // Pass token for authentication
        },
      });
  
      setEvents((prevEvents) => prevEvents.filter((event) => event._id !== eventId));
      Notiflix.Notify.success("Event deleted successfully");
    } catch (error) {
      console.error("Error deleting the event:", error);
      Notiflix.Notify.failure("Failed to delete the event");
    }
  };
  

  return (
    <>
      <div className="w-full flex flex-col">
        <div>
          <Magicbanner />
          <Organiser />
        </div>
        <h1 className="text-3xl text-center font-semibold my-10">Upcoming Events</h1>
        <div className="w-full flex justify-center">
          <div className="w-[80%] my-5 grid gap-x-6 gap-y-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:mx-5">
            {events.length > 0 &&
              events.map((event) => {
                const eventDate = new Date(event.eventDate);
                const currentDate = new Date();

                if (eventDate > currentDate || eventDate.toDateString() === currentDate.toDateString()) {
                  return (
                    <div className="bg-white shadow-[inset_0_0px_2px_rgba(0,0,0,0.4)] p-2 rounded-xl relative" key={event._id}>
                      <div className="rounded-tl-[0.75rem] rounded-tr-[0.75rem] rounded-br-[0] rounded-bl-[0] object-fill aspect-16:9 relative">
                        <img
                          src={`http://localhost:4000/${event.image}`}
                          alt="NO IMAGE FOUND"
                          className="h-44 rounded-tl-[0.75rem] rounded-tr-[0.75rem] rounded-br-[0] rounded-bl-[0] object-fill w-full"
                        />

                        {/* Like button overlaps the image */}
                        <div className="absolute bottom-3 right-3 z-10 flex gap-2">
                          {/* <button
                            onClick={() => handleLike(event._id)}
                            className="bg-white p-2 rounded-full shadow-md transition-all hover:text-primary"
                          >
                            <BiLike className="w-6 h-6" />
                          </button> */}

                          {user?.role === "admin" && (
                            <button
                              onClick={() => handleDelete(event._id)}
                              className="bg-red-500 text-white p-2 rounded-full shadow-md transition-all hover:bg-red-700"
                            >
                              <AiOutlineDelete className="w-6 h-6" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="m-2 grid gap-2">
                        <div className="flex justify-between items-center">
                          <h1 className="font-bold text-lg mt-2">{event.title.toUpperCase()}</h1>
                          {/* <div className="flex gap-2 items-center mr-4 text-red-600">
                            <BiLike /> {event.likes}
                          </div> */}
                        </div>

                        <div className="flex text-sm flex-nowrap justify-between text-primarydark font-bold mr-4">
                          <div>
                            {event.eventDate.split("T")[0]}, {event.eventTime}
                          </div>
                          <div>{event.ticketPrice === 0 ? "Free" : "Rs. " + event.ticketPrice}</div>
                        </div>

                        <div className="text-xs flex flex-col flex-wrap truncate-text">{event.description}</div>
                        <div className="flex justify-between items-center my-2 mr-4">
                          <div className="text-sm text-primarydark">
                            Organized By: <br />
                            <span className="font-bold">{event.organizedBy}</span>
                          </div>
                          <div className="text-sm text-primarydark">
                            Created By: <br /> <span className="font-semibold">{event.owner.toUpperCase()}</span>
                          </div>
                        </div>
                        <Link to={"/event/" + event._id} className="flex justify-center">
                          <button className="primary flex items-center gap-2">
                            View info
                            <BsArrowRightShort className="w-6 h-6" />
                          </button>
                        </Link>
                      </div>
                    </div>
                  );
                }
                return null;
              })}
          </div>
        </div>
      </div>
      <div>
        <NewsLetter />
      </div>
    </>
  );
}
