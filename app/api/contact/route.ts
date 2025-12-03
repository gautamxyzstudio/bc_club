import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

interface FormData {
  name: string;
  email: string;
  phone: string;
  title: string;
  message: string;
}

export async function POST(req: Request): Promise<NextResponse> {
  const body = await req.json();
  const { name, email, phone, message, title } = body as FormData;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.USER_EMAIL,
      pass: process.env.USER_PASSWORD,
    },
  });

  const recipients = [
    ...(process.env.ADDITIONAL_EMAILS?.split(',') || []),
  ].join(',');

  const htmlTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
      <div style="background-color: #36A0D1; padding: 20px; text-align: center;">
        <img src="https://www.sukhbrar.ca/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.86e8f871.webp&w=3840&q=75" alt="Logo" style="max-width: 200px;" />
      </div>
      <div style="padding: 20px;">
        <h2 style="color: #36A0D1;">New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong></p>
        <p style="background: #f9f9f9; padding: 10px; border-radius: 5px;">${message}</p>
      </div>
      <div style="background-color: #f0f0f0; padding: 10px; text-align: center; color: #555;">
        This message was sent from your website contact form.
      </div>
    </div>
  `;

  const mailOptions = {
    from: email,
    to: recipients,
    subject: title,
    html: htmlTemplate,
  };

  try {
    await transporter.sendMail(mailOptions);
    return NextResponse.json({ message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { message: 'Failed to send email!' },
      { status: 500 }
    );
  }
}
