const nodemailer = require("nodemailer");

/**
 * Send an email using nodemailer
 * @param {string} to - Recipient's email address
 * @param {string} subject - Email subject
 * @param {string} text - Plain text email content
 * @param {string} html - HTML email content
 * @returns {Promise<Object>} - Response from email service
 */
const sendEmail = async (to, subject, text, html) => {
  try {
    // Create a transporter using environment variables
    // For development/testing, you can use a service like Gmail, Sendgrid, or Mailtrap
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email options
    const mailOptions = {
      from: `TweetWave <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

module.exports = sendEmail;
