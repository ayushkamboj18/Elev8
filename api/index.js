const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const UserModel = require("./models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const path = require("path");
const Event = require("./models/Event");
const Ticket = require("./models/Ticket");
const Razorpay = require("razorpay");
const crypto = require("crypto");
// const TicketModel = require("./models/Ticket");
const KEY = "rzp_test_9pvIQ4B6FWjGWz";
const SECRET = "3V9LWX8WFJRlRF52FM7cofTq";
const app = express();

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = "bsbsfbrnsftentwnnwn";

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.resolve("./public")));
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173",
  })
);

mongoose.connect(process.env.MONGO_URL).then(() => {
  console.log("Database connected");
});

const razorpay = new Razorpay({
  key_id: KEY,
  key_secret: SECRET,
});

const authenticateToken = (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  jwt.verify(token, jwtSecret, {}, (err, userData) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }

    req.user = userData;
    next();
  });
};

const adminOnly = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user.id);

    if (user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve("./public/uploads"));
  },
  filename: function (req, file, cb) {
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  },
});
const upload = multer({ storage });

// Routes

app.post("/create-payment", async (req, res) => {
  try {
    const { complaintId } = req.body;
    
    // const complaint = await Ticket.find({eventid: complaintId});
    // console.log(complaint);
    // if (!complaint || !complaint.ticketDetails) {
    //   return res.status(404).json({ message: "Complaint or Bill not found" });
    // }
    
    // const bill = complaint.ticketDetails.ticketprice;
    const options = {
      amount: 500 * 100,
      currency: "INR",
      receipt: `receipt_${complaintId}`,
    };
    
    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ message: "Error creating Razorpay order" });
  }
});

app.post("/verify-payment", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const generatedSignature = crypto
      .createHmac("sha256", SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    if (payment.status !== "captured") {
      return res
        .status(400)
        .json({ message: "Payment failed or was not completed" });
    }

    res.status(200).json({ message: "Payment verified successfully" });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ message: "Payment verification failed" });
  }
});

app.post("/payment-succes", async (req, res) => {
  try {
    const { razorpay_order_id } = req.body;

    const complaint = await Complaint.findOne({
      "BillId.razorpay_order_id": razorpay_order_id,
    }).populate("BillId");

    if (!complaint || !complaint.BillId) {
      return res.status(404).json({ message: "Complaint or Bill not found" });
    }

    complaint.status = "accepted";
    complaint.BillId.status = "paid";

    await complaint.save();
    await complaint.BillId.save();

    res.status(200).json({
      message: "Payment successful",
      complaint,
      bill: complaint.BillId,
    });
  } catch (error) {
    console.error("Error handling payment success:", error);
    res.status(500).json({ message: "Failed to update payment status" });
  }
});


app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Kindly fill all details" });
  }

  const existingUser = await UserModel.findOne({ email: email });

  if (existingUser) {
    return res
      .status(400)
      .json({ message: "User already exists, please login" });
  }

  try {
    const userDoc = await UserModel.create({
      name,
      email,
      password: bcrypt.hashSync(password, bcryptSalt),
    });
    res.json(userDoc);
  } catch (e) {
    res.status(422).json(e);
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const userDoc = await UserModel.findOne({ email });
    if (!userDoc) {
      return res.status(404).json({ error: "Email does not match" });
    }

    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (!passOk) {
      return res.status(401).json({ error: "Wrong password" });
    }

    jwt.sign(
      {
        email: userDoc.email,
        id: userDoc._id,
      },
      jwtSecret,
      {},
      (err, token) => {
        if (err) {
          console.error("JWT Error:", err);
          return res.status(500).json({ error: "Failed to generate token" });
        }

        res
          .cookie("token", token, { httpOnly: true, secure: true })
          .json(userDoc);
      }
    );
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post('/editUser',authenticateToken,async(req,res)=>{
  try {
    const {id}=req.user;
    const {name}=req.body;
    const newUser=await UserModel.findByIdAndUpdate(id,{"name":name});
    res.status(200).send({message:"Profile Updated",data:newUser});
  } catch (err) {
    res.status(500).json({ error: "Failed to update Profile data" });
  }

})
app.get("/profile", authenticateToken, async (req, res) => {
  try {
    const { id } = req.user;
    const { name, email, _id, role } = await UserModel.findById(id);
    res.status(200).json({ name, email, _id, role });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile data" });
  }
});

app.post("/logout", (req, res) => {
  res.cookie("token", "").json(true);
});

app.post(
  "/createEvent",
  authenticateToken,
  adminOnly,
  upload.single("image"),
  async (req, res) => {
    try {
      const eventData = req.body;
      eventData.image = req.file ? `/uploads/${req?.file?.filename}` : "";

      const newEvent = new Event(eventData);
      await newEvent.save();
      res.status(201).json(newEvent);
    } catch (error) {
      res.status(500).json({ error: "Failed to save the event to MongoDB" });
    }
  }
);

app.get("/createEvent", async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch events from MongoDB" });
  }
});

app.get("/event/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const event = await Event.findById(id);
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch event from MongoDB" });
  }
});

app.post("/event/:eventId", async (req, res) => {
  const eventId = req.params.eventId;
  try {
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    event.likes += 1;
    const updatedEvent = await event.save();

    res.json(updatedEvent);
  } catch (error) {
    console.error("Error liking the event:", error);
    res.status(500).json({ message: "Server error" });
  }
});


app.delete(
  "/admin/event/:id",
  authenticateToken,
  adminOnly,
  async (req, res) => {
    const { id } = req.params;

    try {
      const event = await Event.findById(id);

      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      await Event.findByIdAndDelete(id);
      res.status(200).json({ message: "Event deleted successfully" });
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ error: "Failed to delete event" });
    }
  }
);

// By Ayush Kamboj //

app.post("/tickets", async (req, res) => {
  try {
    const ticketDetails = req.body;
    const newTicket = new Ticket(ticketDetails);
    await newTicket.save();
    return res.status(201).json({ ticket: newTicket });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return res.status(500).json({ error: "Failed to create ticket" });
  }
});

app.get("/event/:id/ordersummary", async (req, res) => {
  const { id } = req.params;
  try {
    const event = await Event.findById(id);
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch event from MongoDB" });
  }
});

app.get("/event/:id/ordersummary/paymentsummary", async (req, res) => {
  const { id } = req.params;
  try {
    const event = await Event.findById(id);
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch event from MongoDB" });
  }
});

app.get("/tickets/user/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const tickets = await Ticket.find({ userid: userId });
    res.json(tickets);
  } catch (error) {
    console.error("Error fetching user tickets:", error);
    res.status(500).json({ error: "Failed to fetch user tickets" });
  }
});

app.delete("/tickets/:id", async (req, res) => {
  try {
    const ticketId = req.params.id;
    await Ticket.findByIdAndDelete(ticketId);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting ticket:", error);
    res.status(500).json({ error: "Failed to delete ticket" });
  }
});

app.get("/tickets/check", async (req, res) => {
  const { userid, eventid } = req.query;
  // const id = '66d40503b39e7cd6777305da';
  try {
    // Find one ticket that matches the userid and eventid
    const ticket = await Ticket.findOne({ userid, eventid });
    console.log(ticket);
    if (ticket) {
      res.json({ message: "false" });
    } else res.json({ exists: !!ticket });
  } catch (error) {
    console.error("Error checking ticket:", error);
    res.status(500).json({ error: "Failed to check ticket" });
  }
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
