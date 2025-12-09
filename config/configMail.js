import nodemailer from "nodemailer";
import { tempPass } from "../controllers/authController.js";
import { userModel } from "../models/user.model.js";


export const mailSend = async (doc) => {
  try {

    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: process.env.ETHEREAL_USERNAME,
        pass: process.env.ETHEREAL_PASSWORD,
      },
    });

    // Send a mail
    const info = await transporter.sendMail({
      from: "saifulcseian@gmail.com",
      to: doc.email,
      subject: "Registered Successfully",
      html: `<p>Now, you can login with these credientials</p><br>
                    <p>Username: ${doc.email}</p>
                    <p>Password: ${tempPass} </p>
                `,
    });
    if (!info) {
      throw new Error("Failed to send email");
    }
    console.log("Message sent: %s", doc.email);
  } catch (error) {
    console.error(" Email sending error: ", error);
// Delete the user document if email sending fails
    try {
      await userModel.findByIdAndDelete(doc._id);
      console.log("User document deleted due to email failure: ", doc._id);
    } catch (deleteError) {
      console.error("Error deleting user document: ", deleteError);
    }
    throw error;
  }
};
