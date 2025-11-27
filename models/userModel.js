// import mongoose from "mongoose";
// import bcrypt from "bcryptjs";

// const userSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: [true, "Name is required"],
//       trim: true,
//     },
//     username: {
//       type: String,
//       unique: true,
//       sparse: true,
//       trim: true,
//       lowercase: true,
//     },
//     email: {
//       type: String,
//       required: [true, "Email is required"],
//       unique: true,
//       lowercase: true,
//       match: [/.+@.+\..+/, "Please enter a valid email"],
//     },
//     password: {
//       type: String,
//       required: [true, "Password is required"],
//       minlength: 8,
//       select: false,
//     },
//     role: {
//       type: String,
//       enum: ["user", "admin"],
//       default: "user",
//     },
//     mobile: String,
//     image: {
//       url: {
//         type: String,
//       },
//       key: {
//         type: String,
//       },
//     },

//     firebaseUid : {
//       type: String,
//     },

//     purpose: String,
//     address: {
//       street1: String,
//       street2: String,
//       city: String,
//       state: String,
//       zip: String,
//       country: String,
//     },
//     isVerified: {
//       type: Boolean,
//       default: false,
//     },
//     status: {
//       type: String,
//       enum: ["active", "suspended"],
//       default: "active",
//     },
//     otp: String,
//     otpExpires: Date,
//     resetToken: String,
//     resetExpires: Date,
//   },
//   {
//     timestamps: true,
//   }
// );

// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   this.password = await bcrypt.hash(this.password, 12);
//   next();
// });

// export default mongoose.model("User", userSchema);

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/.+@.+\..+/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: function () {
        return !this.firebaseUid;
      },
      minlength: 8,
      select: false,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    mobile: String,

    image: {
      url: String,
      key: String,
    },

    // ⭐ IMPORTANT — ADD THIS
    provider: {
      type: String,
      enum: ["email", "google", "facebook", "apple"],
      default: "email",
    },

    firebaseUid: { type: String },

    purpose: String,

    address: {
      street1: String,
      street2: String,
      city: String,
      state: String,
      zip: String,
      country: String,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },

    otp: String,
    otpExpires: Date,

    resetToken: String,
    resetExpires: Date,
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.password) return next();
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

export default mongoose.model("User", userSchema);

