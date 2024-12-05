import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { IoMdArrowBack } from "react-icons/io";
import { UserContext } from "../UserContext";
import Qrcode from "qrcode";
import Notiflix from "notiflix";

export default function PaymentSummary() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  //!Adding a default state for ticket-----------------------------
  const defaultTicketState = {
    userid: user ? user._id : "",
    eventid: "",
    ticketDetails: {
      name: user ? user.name : "",
      email: user ? user.email : "",
      eventname: "",
      eventdate: "",
      eventtime: "",
      ticketprice: "",
      qr: "",
      contactNo: "", // Add this field for contact number
    },
  };

  //! add default state to the ticket details state
  const [ticketDetails, setTicketDetails] = useState(defaultTicketState);

  const [redirect, setRedirect] = useState("");

  useEffect(() => {
    if (!id) {
      return;
    }
    axios
      .get(`/event/${id}/ordersummary/paymentsummary`)
      .then((response) => {
        setEvent(response.data);

        setTicketDetails((prevTicketDetails) => ({
          ...prevTicketDetails,
          eventid: response.data._id,
          //!capturing event details from backend for ticket----------------------
          ticketDetails: {
            ...prevTicketDetails.ticketDetails,
            eventname: response.data.title,
            eventdate: response.data.eventDate.split("T")[0],
            eventtime: response.data.eventTime,
            ticketprice: response.data.ticketPrice,
          },
        }));
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
        Notiflix.Notify.failure("Error In Fetching Event");
      });
  }, [id]);

  //! Getting user details using useeffect and setting to new ticket details with previous details
  useEffect(() => {
    setTicketDetails((prevTicketDetails) => ({
      ...prevTicketDetails,
      userid: user ? user._id : "",
      ticketDetails: {
        ...prevTicketDetails.ticketDetails,
        name: user ? user.name : "",
        email: user ? user.email : "",
      },
    }));
  }, [user]);

  if (!event) return "";

  const handleChangeDetails = (e) => {
    const { name, value } = e.target;
    setTicketDetails((prevTicketDetails) => ({
      ...prevTicketDetails,
      ticketDetails: {
        ...prevTicketDetails.ticketDetails,
        [name]: value,
      },
    }));
  };

  //! creating a ticket ------------------------------
  const createTicket = async () => {

    //! Validate contact number (should be 10 digits and not start with 0)
    const contactNo = ticketDetails.ticketDetails.contactNo;
    const phonePattern = /^[1-9][0-9]{9}$/; // Pattern for 10-digit number not starting with 0

    if (!phonePattern.test(contactNo)) {
      Notiflix.Notify.failure(
        "Please enter a valid 10-digit contact number that doesn't start with 0."
      );
      return;
    }

    //!adding a ticket qr code to booking ----------------------
    try {
      const existingTicketResponse = await axios.get(
        `/tickets/check?userid=${ticketDetails.userid}&eventid=${ticketDetails.eventid}`
      );

      if (existingTicketResponse.data.message) {        
        Notiflix.Notify.failure("Oops Can't create duplicate tickets");
        return;
      }



      const qrCode = await generateQRCode(
        ticketDetails.ticketDetails.eventname,
        ticketDetails.ticketDetails.name
      );

      //!updating the ticket details qr with previous details ------------------
      const updatedTicketDetails = {
        ...ticketDetails,
        ticketDetails: {
          ...ticketDetails.ticketDetails,
          qr: qrCode,
        },
      };

      //!posting the details to backend ----------------------------
      const response = await axios.post(`/tickets`, updatedTicketDetails);
      setRedirect(true);
      console.log("Success creating ticket", updatedTicketDetails);
      Notiflix.Notify.success("Successfully created ticket");
    } catch (error) {
      Notiflix.Notify.failure("Error creating ticket");
      console.error("Error creating ticket:", error);
    }
  };

  //! Helper function to generate QR code ------------------------------
  async function generateQRCode(name, eventName) {
    try {
      const qrCodeData = await Qrcode.toDataURL(
        `welcome to the \nEvent Name: ${name} \n Name: ${eventName} \n ${ticketDetails.e} ,Thank you for joining our event`
      );
      return qrCodeData;
    } catch (error) {
      Notiflix.Notify.failure("Error generating QR code");
      console.error("Error generating QR code:", error);
      return null;
    }
  }

  if (redirect) {
    return <Navigate to={"/wallet"} />;
  }

  const handlePayment = async () => {
    try {
      const existingTicketResponse = await axios.get(
        `/tickets/check?userid=${ticketDetails.userid}&eventid=${ticketDetails.eventid}`
      );

      if (existingTicketResponse.data.message) {        
        Notiflix.Notify.failure("Oops Can't create duplicate tickets");
        return;
      }

      const orderResponse = await fetch(
        "http://localhost:4000/create-payment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            complaintId: id,
          }),
        }
      );
      console.log(orderResponse);
      if (!orderResponse.ok) {
        throw new Error("Failed to create order");
      }

      const { id: order_id, amount, currency } = await orderResponse.json();

      const options = {
        key: "rzp_test_9pvIQ4B6FWjGWz",
        amount,
        currency,
        order_id,
        name: "Elev8",
        description: "Service Payment",
        handler: async function (response) {
          const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
            response;

          try {
            const verifyResponse = await fetch(
              "http://localhost:4000/verify-payment",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id,
                  razorpay_payment_id,
                  razorpay_signature,
                }),
              }
            );

            if (!verifyResponse.ok) {
              throw new Error("Payment verification failed");
            }

            const result = await verifyResponse.json();

            if (result.message === "Payment verified successfully") {
              // Only mark as successful if the verification was successful
              // const successResponse = await fetch("http://localhost:4000/payment-succes", {
              //   method: "POST",
              //   headers: { "Content-Type": "application/json" },
              //   body: JSON.stringify({
              //     razorpay_order_id, // Send order id for final processing
              //   }),
              // });

              // if (result) {
              Notiflix.Notify.success("Payment successful!");
              try {
                await createTicket({
                  preventDefault: () => {}, // Simulate the event object
                });
              } catch (error) {
                console.error("Error creating ticket after payment:", error);
              }
              navigate("/wallet");
            } else {
              Notiflix.Notify.failure("Failed to mark payment as successful.");
            }
          } catch (error) {
            console.error("Error during payment handling:", error);
          }
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Error during payment:", error);
    }
  };

  const handleFormSubmit = () => {
    const { name, email, contactNo } = ticketDetails.ticketDetails;
  
    // Check if all fields are filled
    if (!name || !email || !contactNo) {
      Notiflix.Notify.failure("Please fill out all fields.");
      return;
    }
  
    // Validate the contact number pattern
    const phonePattern = /^[6-9][0-9]{9}$/;
    if (!phonePattern.test(contactNo)) {
      Notiflix.Notify.failure("Please enter a valid 10-digit contact number starting with 6-9.");
      return;
    }
  
    // Call the payment
    handlePayment();
  };
  

  return (
    <>
      {/* Back Button */}
      <div className="mt-8 ml-12">
        <Link to={"/event/" + event._id + "/ordersummary"}>
          <button
            className="
            flex 
            items-center 
            gap-2
            p-3 
            bg-gray-100 
            text-blue-700
            font-bold
            rounded-md
            shadow-md
            hover:bg-gray-200
            transition
            duration-200"
          >
            <IoMdArrowBack className="w-6 h-6" />
            Back
          </button>
        </Link>
      </div>

      {/* Main Content Area */}
      {/* Main Content Area */}
      <div className="flex flex-wrap justify-center mt-8">
        {/* Details Form */}
        <div className="bg-white shadow-lg rounded-lg p-8 w-full md:w-2/3 lg:w-2/5 mx-4">
          <form
            onSubmit={(e) => {
              e.preventDefault(); // Prevent page reload
              handleFormSubmit(); // Call your form submission logic
            }}
          >
            {/* Your Details Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Your Details</h2>
              <input
                type="text"
                name="name"
                readOnly
                onChange={handleChangeDetails}
                placeholder={user.name}
                className="input-field w-full h-12 bg-gray-200 border border-gray-300 rounded-md p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                required
              />
              <input
                type="email"
                name="email"
                onChange={handleChangeDetails}
                placeholder={user.email}
                readOnly
                className="input-field w-full h-12 bg-gray-200 border border-gray-300 rounded-md p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                required
              />
              <input
                type="tel"
                name="contactNo"
                value={ticketDetails.ticketDetails.contactNo}
                onChange={handleChangeDetails}
                placeholder="Contact No"
                pattern="^[6-9][0-9]{9}$" // Validate for 10-digit number starting with 6-9
                required
                className="input-field w-full h-12 border border-gray-300 rounded-md p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* Submit Button */}
            <div className="mt-8">
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-md shadow-md hover:bg-blue-700"
              >
                Confirm and Book
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}