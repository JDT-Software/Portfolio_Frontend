const express = require('express');
const cors = require('cors');
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

const app = express();

// CORS Configuration
const corsOptions = {
  origin: [
    'https://www.softflair.co.za',
    'https://softflair.co.za',
    'https://jdt-software.github.io',
    'https://portfolio-frontend-eosin-xi.vercel.app',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5500',
    'http://127.0.0.1:5500'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ 
    message: 'Portfolio Backend API is running!',
    timestamp: new Date().toISOString(),
    endpoints: {
      'POST /send-email': 'Send contact form email'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Input validation function
const validateContactForm = (data) => {
  const errors = [];
  
  // Check for both 'name' and 'fullName' to be flexible
  const name = data.fullName || data.name;
  if (!name || name.trim().length < 2) {
    errors.push('Full name must be at least 2 characters long');
  }
  
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Please provide a valid email address');
  }
  
  if (!data.message || data.message.trim().length < 10) {
    errors.push('Message must be at least 10 characters long');
  }
  
  // Sanitize inputs
  const sanitized = {
    fullName: name?.trim().substring(0, 100),
    email: data.email?.trim().toLowerCase().substring(0, 100),
    phone: data.phone?.trim().substring(0, 20) || '',
    subject: data.subject?.trim().substring(0, 200) || '',
    message: data.message?.trim().substring(0, 2000)
  };
  
  return { errors, sanitized };
};

// Email sending endpoint
app.post('/send-email', async (req, res) => {
  try {
    console.log('Received contact form submission:', {
      fullName: req.body.fullName,
      email: req.body.email,
      subject: req.body.subject,
      messageLength: req.body.message?.length
    });

    // Validate input
    const { errors, sanitized } = validateContactForm(req.body);
    
    if (errors.length > 0) {
      console.log('Validation errors:', errors);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }

    // Check if SendGrid API key exists
    if (!process.env.SENDGRID_API_KEY) {
      console.error('SendGrid API key missing');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    // Email content using SendGrid
    const msg = {
      to: 'info@softflair.co.za',
      from: 'info@softflair.co.za', // Must be verified in SendGrid
      replyTo: sanitized.email,
      subject: sanitized.subject || `Portfolio Contact: Message from ${sanitized.fullName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f5f5; border-radius: 10px; overflow: hidden;">
          <!-- Header Section -->
          <div style="background: linear-gradient(270deg, #02d483 10%, #037449 100%); padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #ffffff;">
              New Contact Form Submission
            </h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; color: #ffffff;">
              Someone wants to connect with you!
            </p>
          </div>
          
          <!-- Content Section -->
          <div style="padding: 30px; background-color: #ffffff;">
            <!-- Contact Details Card -->
            <div style="background-color: #f8f9fa; border-left: 5px solid #05de8b; padding: 20px; margin-bottom: 20px; border-radius: 5px;">
              <h3 style="color: #05de8b; font-size: 20px; margin: 0 0 15px 0;">
                Contact Details
              </h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #05de8b; width: 80px;">Name:</td>
                  <td style="padding: 8px 0; color: #333;">${sanitized.fullName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #05de8b;">Email:</td>
                  <td style="padding: 8px 0;">
                    <a href="mailto:${sanitized.email}" style="color: #02d483; text-decoration: none; font-weight: bold;">${sanitized.email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #05de8b;">Phone:</td>
                  <td style="padding: 8px 0; color: #333;">${sanitized.phone || 'Not provided'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #05de8b;">Subject:</td>
                  <td style="padding: 8px 0; color: #333;">${sanitized.subject || 'No subject'}</td>
                </tr>
              </table>
            </div>
            
            <!-- Message Card -->
            <div style="background-color: #f8f9fa; border-left: 5px solid #02d483; padding: 20px; border-radius: 5px;">
              <h3 style="color: #05de8b; font-size: 20px; margin: 0 0 15px 0;">
                Message
              </h3>
              <div style="background-color: #ffffff; padding: 15px; border-radius: 5px; border: 1px solid #e9ecef;">
                <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #333; white-space: pre-wrap;">${sanitized.message}</p>
              </div>
            </div>
          </div>
          
          <!-- Footer Section -->
          <div style="background-color: #0a0a0a; padding: 20px; text-align: center;">
            <p style="margin: 0; font-size: 14px; color: #ffffff;">
              Sent from your Portfolio Contact Form
            </p>
            <p style="margin: 10px 0 0 0; font-size: 14px;">
              <a href="https://www.softflair.co.za" style="color: #05de8b; text-decoration: none; font-weight: bold;">
                Visit Portfolio Website
              </a>
            </p>
            <div style="margin-top: 15px;">
              <span style="color: #05de8b; font-size: 18px; font-weight: bold;">
                SoftFlair - Web Development
              </span>
            </div>
            <div style="margin-top: 10px; font-size: 12px; color: #999;">
              Sent on: ${new Date().toLocaleString()}
            </div>
          </div>
        </div>
      `,
      text: `
New Contact Form Submission

Name: ${sanitized.fullName}
Email: ${sanitized.email}
Phone: ${sanitized.phone || 'Not provided'}
Subject: ${sanitized.subject || 'No subject'}

Message:
${sanitized.message}

Sent on: ${new Date().toLocaleString()}
      `
    };

    // Send email using SendGrid
    await sgMail.send(msg);
    console.log('Email sent successfully via SendGrid');

    res.status(200).json({
      success: true,
      message: 'Email sent successfully!'
    });

  } catch (error) {
    console.error('Error sending email:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to send email. Please try again later.',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📧 Email service: SendGrid`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔐 CORS configured for multiple origins`);
});