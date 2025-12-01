// import express from "express";
// import { createPaymentIntent } from "../../controllers/paymentController.js";

// const router = express.Router();

// router.post("/create-payment-intent", createPaymentIntent);

// export default router;



import express from "express";
import { createOrder, verifyPayment } from "../../controllers/paymentController.js";

const router = express.Router();

router.post("/order", createOrder);
router.post("/verify", verifyPayment);

export default router;
