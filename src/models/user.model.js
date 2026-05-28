const mongoose = require("mongoose");
const sendmail = require("../services/mail.service");


const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    passwordHash: {
      type: String,
      select: false,
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    avatar: {
      type: String,
      default: "https://ik.imagekit.io/uosvj5zwr3/pngtree-user-profile-icon-image-vector-png-image_12640450.png",
    },

    authProvider: {
      type: String,
      enum: ["local", "google", "both"],
      default: "local",
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    refreshTokenHash: {
      type: String,
      select: false,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

//User get a mail after registration
userSchema.post("save", async function (docs) {
  console.log("docs-->", docs);

  await sendmail({
    to: docs.email,
    subject: "User registered successfully",
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 30px;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; padding: 30px; border: 1px solid #e5e7eb;">
          
          <h2 style="color: #111827; margin-bottom: 10px;">
            Welcome, ${docs.name || "User"} 🎉
          </h2>

          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            Your account has been registered successfully.
          </p>

          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            You can now log in and start using your account.
          </p>

          <div style="margin: 25px 0;">
            <a href="${process.env.CLIENT_URL || "http://localhost:3000"}/login"
               style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 6px; display: inline-block; font-size: 15px;">
              Login Now
            </a>
          </div>

          <p style="font-size: 14px; color: #6b7280; line-height: 1.5;">
            If you did not create this account, you can ignore this email.
          </p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;" />

          <p style="font-size: 13px; color: #9ca3af; text-align: center;">
            © ${new Date().getFullYear()} Rohit ka app. All rights reserved.
          </p>
        </div>
      </div>
    `,
  });
});

let User = mongoose.model("User", userSchema);
module.exports = User;