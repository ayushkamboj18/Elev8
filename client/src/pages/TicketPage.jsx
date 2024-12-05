import { Link } from "react-router-dom";
import { IoMdArrowBack } from "react-icons/io";
import { RiDeleteBinLine } from "react-icons/ri";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { UserContext } from "../UserContext";
import Notiflix from "notiflix";

export default function TicketPage() {
  const { user } = useContext(UserContext);
  const [userTickets, setUserTickets] = useState([]);
  const [focusedQR, setFocusedQR] = useState(null);

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, []);

  const fetchTickets = async () => {
    axios
      .get(`/tickets/user/${user._id}`)
      .then((response) => {
        setUserTickets(response.data);
      })
      .catch((error) => {
        console.error("Error fetching user tickets:", error);
      });
  };

  const deleteTicket = async (ticketId) => {
    try {
      await axios.delete(`/tickets/${ticketId}`);
      fetchTickets();
      Notiflix.Notify.success(`Ticket deleted successfully`);
    } catch (error) {
      console.error("Error deleting ticket:", error);
    }
  };

  return (
    <div className="relative flex flex-col flex-grow">
      <div>
        <Link to="/">
          <button
            className="
              inline-flex 
              mt-12
              gap-2
              p-3 
              ml-12
              bg-gray-100
              justify-center 
              items-center 
              text-blue-700
              font-bold
              rounded-md"
          >
            <IoMdArrowBack className="font-bold w-6 h-6 gap-2" />
            Back
          </button>
        </Link>
      </div>
      <div className="mb-5 flex justify-between place-items-center">
        <div>
          <h1 className="text-3xl ml-12 mt-10">Tickets :</h1>
        </div>
      </div>
      <div
        className={`${
          focusedQR ? "blur-sm" : ""
        } mx-12 grid grid-cols-1 xl:grid-cols-2 gap-5`}
      >
        {userTickets.map((ticket) => (
          <div key={ticket._id} className="relative group p-5">
            <div className="h-56 mt-2 gap-1 p-5 mb-5 bg-gray-100 font-bold rounded-md relative">
              <button
                onClick={() => deleteTicket(ticket._id)}
                className="absolute cursor-pointer right-0 mr-2"
              >
                <RiDeleteBinLine className="h-6 w-10 text-red-700" />
              </button>
              <div className="flex justify-start place-items-center text-sm md:text-base font-normal">
                <div
                  className="h-148 w-148 cursor-pointer"
                  onClick={() => setFocusedQR(ticket.ticketDetails.qr)}
                >
                  <img
                    src={ticket.ticketDetails.qr}
                    alt="QRCode"
                    className="aspect-square object-fill"
                  />
                </div>
                <div className="ml-6 grid grid-cols-2 gap-x-6 gap-y-2">
                  <div>
                    Event Name: <br />
                    <span className="font-extrabold text-primarydark">
                      {ticket.ticketDetails.eventname.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    Date & Time:<br />
                    <span className="font-extrabold text-primarydark">
                      {ticket.ticketDetails.eventdate.toUpperCase().split("T")[0]}
                      , {ticket.ticketDetails.eventtime}
                    </span>
                  </div>
                  <div>
                    Name:{" "}
                    <span className="font-extrabold text-primarydark">
                      {ticket.ticketDetails.name.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    Price:{" "}
                    <span className="font-extrabold text-primarydark">
                      Rs. {ticket.ticketDetails.ticketprice}
                    </span>
                  </div>
                  <div>
                    Email:{" "}
                    <span className="font-extrabold text-primarydark">
                      {ticket.ticketDetails.email}
                    </span>
                  </div>
                  <div>
                    Ticket ID:<br />
                    <span className="font-extrabold text-primarydark">
                      {ticket._id.toString().substring(0, 15)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {focusedQR && (
        <div
          className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50"
          onClick={() => setFocusedQR(null)}
        >
          <img
            src={focusedQR}
            alt="Focused QR Code"
            className="h-96 w-96 object-contain"
          />
        </div>
      )}
    </div>
  );
}
