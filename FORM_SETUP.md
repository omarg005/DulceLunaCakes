# Form Submission System Setup

This guide will help you set up the complete form submission system with email notifications and admin review functionality.

## **Features Implemented:**

✅ **Email notifications** to business owner (omarg005@gmail.com)  
✅ **Customer confirmation emails**  
✅ **Database storage** of all submissions  
✅ **Admin review panel** with status management  
✅ **File upload support** for reference images  
✅ **Status tracking** (pending, reviewed, approved, in-progress, completed, cancelled)  

## **Setup Instructions:**

### **Step 1: Install Dependencies**

```bash
npm install
```

This will install:
- `express` - Web server framework
- `multer` - File upload handling
- `cheerio` - HTML parsing
- `nodemailer` - Email sending
- `cors` - Cross-origin resource sharing

### **Step 2: Configure Email Settings**

**Important:** You need to set up Gmail App Password for email functionality.

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password:**
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. **Update form-server.js:**
   ```javascript
   const transporter = nodemailer.createTransporter({
       service: 'gmail',
       auth: {
           user: 'your-email@gmail.com', // Replace with your Gmail
           pass: 'your-16-digit-app-password' // Replace with your app password
       }
   });
   ```

### **Step 3: Start Both Servers**

You need to run **two servers** simultaneously:

**Terminal 1 - Admin Server (Port 3001):**
```bash
npm start
```

**Terminal 2 - Form Server (Port 3002):**
```bash
node form-server.js
```

### **Step 4: Test the System**

1. **Test Form Submission:**
   - Go to `http://localhost:3001/request.html`
   - Fill out the form and submit
   - Check your email (omarg005@gmail.com) for notification

2. **Test Admin Panel:**
   - Go to `http://localhost:3001/admin.html`
   - Login with: `admin` / `dulceluna2025`
   - Click "Review Requests" tab
   - View and manage submissions

## **How It Works:**

### **Form Submission Flow:**
1. **Customer fills form** on request.html
2. **Form submits** to form-server.js (port 3002)
3. **Server stores** submission in database
4. **Email sent** to business owner with all details
5. **Confirmation email** sent to customer
6. **Success message** shown to customer

### **Admin Review Flow:**
1. **Admin logs in** to admin panel
2. **Views all submissions** in "Review Requests" tab
3. **Updates status** (pending → reviewed → approved → in-progress → completed)
4. **Adds admin notes** for internal tracking
5. **Deletes old requests** when no longer needed

## **Email Templates:**

### **Business Owner Email Includes:**
- Customer contact information
- Event details and date needed
- Cake specifications (size, flavor, frosting)
- Design description and special requests
- Budget information
- Reference image (if uploaded)
- Submission timestamp

### **Customer Confirmation Email Includes:**
- Thank you message
- Request summary
- Next steps explanation
- Request ID for tracking

## **Database Storage:**

Currently using **in-memory storage** (data resets when server restarts). For production, consider:
- **SQLite** for simple setup
- **MongoDB** for more complex data
- **PostgreSQL** for enterprise use

## **File Upload:**

- **Location:** `uploads/reference-images/`
- **Size limit:** 5MB per image
- **Formats:** JPEG, PNG, WebP, AVIF
- **Auto-cleanup:** Files deleted when request is deleted

## **Status Management:**

- **Pending** - New submission (default)
- **Reviewed** - Admin has reviewed
- **Approved** - Request approved
- **In Progress** - Cake being made
- **Completed** - Cake delivered
- **Cancelled** - Request cancelled

## **Security Considerations:**

1. **Change default admin credentials** in admin.js
2. **Use environment variables** for email credentials
3. **Add rate limiting** to prevent spam
4. **Validate file uploads** (already implemented)
5. **Add CSRF protection** for production

## **Troubleshooting:**

### **Email Not Sending:**
- Check Gmail app password is correct
- Verify 2FA is enabled on Gmail
- Check spam folder
- Review server console for errors

### **Form Not Submitting:**
- Ensure form-server.js is running on port 3002
- Check browser console for CORS errors
- Verify all required fields are filled

### **Admin Panel Not Loading Requests:**
- Ensure both servers are running
- Check network tab for API errors
- Verify form-server.js is accessible

## **Production Deployment:**

For production, you'll need to:
1. **Set up a real database** (SQLite, MongoDB, etc.)
2. **Configure environment variables** for credentials
3. **Set up proper hosting** (Heroku, Vercel, AWS, etc.)
4. **Add SSL/HTTPS** for security
5. **Configure domain** and DNS settings

## **Support:**

If you encounter issues:
1. Check both server consoles for error messages
2. Verify all dependencies are installed
3. Ensure ports 3001 and 3002 are available
4. Check email configuration is correct

The system is now fully functional with email notifications, database storage, and admin review capabilities! 