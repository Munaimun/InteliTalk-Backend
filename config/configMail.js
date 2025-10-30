import nodemailer from "nodemailer";
import { tempPass } from "../controllers/authController.js";


export const mailSend = async (doc) => {
  try {

    let transporter = nodemailer.createTransport({
      host: "smtp.sendgrid.net",
      port: 587,
      secure: false,
      auth: {
        user: process.env.SENDGRID_USERNAME,
        pass: process.env.SENDGRID_PASSWORD,
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
      console.log("Check credientials");
    }
  } catch (error) {
    console.log(error);
  }
};
