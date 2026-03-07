# Testing Notifications (Email & WhatsApp)

This document provides comprehensive instructions on how to test the newly integrated Email (SMTP) and WhatsApp (Twilio) notifications in the Switch2iTech backend.

## 1. Environment Setup

Before testing, verify that your `.env` file is properly configured with your actual credentials.

```env
# Email Configuration (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587   
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=your_email@gmail.com

# WhatsApp Configuration (Twilio)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886 # Use your Twilio number or Sandbox number
```

> **Note for Twilio Sandbox**: If you are using a Twilio Sandbox account, make sure your receiving WhatsApp number has joined the sandbox (by messaging the join code to the Twilio number) before testing.

---

## 2. Testing Scenarios

The notification service is integrated into several authentication flows. You can test these active endpoints using Postman, Insomnia, or cURL.

### A. User Registration (Verification Codes)
When a new user registers, the system generates 6-digit codes and sends them via **Email** and **WhatsApp**.

- **Endpoint**: `POST /api/auth/register`
- **Payload**:
  ```json
  {
      "name": "Test User",
      "email": "test@example.com",
      "password": "password123",
      "phoneNo": "whatsapp:+92XXXXXXXXX",
      "company": "Test Company"
  }
  ```
- **Expected Outcome**: 
  1. An email is sent to the provided address with the email verification code.
  2. A WhatsApp message is sent to the provided `phoneNo` with the phone verification code.
  3. The server responds with `201 Created` and the new user's data.

### B. Standard Login (New Login Alert)
When a user logs in successfully, the system fires off a security notification warning the user about a new login detection.

- **Endpoint**: `POST /api/auth/login`
- **Payload**:
  ```json
  {
      "email": "test@example.com",
      "password": "password123"
  }
  ```
- **Expected Outcome**:
  1. You will receive an Email warning regarding a "New Login Detected".
  2. You will receive a WhatsApp message with the exact same security warning.

### C. OTP Login - Step 1 (Request OTP)
Users can request a One-Time Password (OTP) instead of using a traditional password for login.

- **Endpoint**: `POST /api/auth/request-otp`
- **Payload**:
  ```json
  {
      "identifier": "test@example.com" // Provide either the registered email OR phoneNo
  }
  ```
- **Expected Outcome**:
  1. If the `identifier` matches an email, the OTP is sent via **Email**.
  2. If the `identifier` matches a phone number, the OTP is sent via **WhatsApp**.

## 3. Mock Mode Testing (Graceful Fallback)

If the SMTP or Twilio credentials are removed, incomplete, or missing from the `.env` file, the server will not crash. Instead, the `notificationService` kicks into mock mode and simply logs the operations to the terminal.

To test this:
1. Temporarily comment out your `SMTP_USER` or `TWILIO_ACCOUNT_SID` in `.env`.
2. Restart the server.
3. Trigger any of the endpoints above.
4. **Expected Outcome**: Look at your backend terminal. You should see logs like these instead of actual messages being sent:
   ```
   [Mock Email] To: test@example.com | Subject: Welcome! Verify your Email
   [Mock WhatsApp] To: whatsapp:+92XXXXXXXXX | Message: Hi Test User, welcome...
   ```
   
This feature allows for seamless local development without wasting API quotas or spamming actual inboxes.
