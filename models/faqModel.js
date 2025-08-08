import mongoose from "mongoose";

const faqDepartmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FaqDepartment",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const FaqDepartment =
  mongoose.models.FaqDepartment || mongoose.model("FaqDepartment", faqDepartmentSchema);
const Faq = mongoose.models.Faq || mongoose.model("Faq", faqSchema);

export { FaqDepartment, Faq };
