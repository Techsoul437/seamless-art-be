import mongoose from "mongoose";

const invoiceCounterSchema = new mongoose.Schema({
  count: {
    type: Number,
    default: 1,
  },
});

export default mongoose.model("InvoiceCounter", invoiceCounterSchema);
