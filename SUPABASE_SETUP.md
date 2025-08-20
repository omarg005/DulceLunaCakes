# Supabase Setup Guide for Dulce Luna Cakes

This guide will walk you through setting up Supabase for your Dulce Luna Cakes project hosted on Vercel.

## 🚀 Step 1: Create Supabase Project

1. **Go to [Supabase Dashboard](https://app.supabase.com/)**
2. **Click "New project"**
3. **Choose your organization** (or create one)
4. **Enter project details:**
   - Name: `dulce-luna-cakes`
   - Database Password: Generate a strong password (save this!)
   - Region: Choose closest to your users (e.g., US East, US West)
5. **Click "Create new project"**
6. **Wait for setup to complete** (takes ~2 minutes)

## 📊 Step 2: Set Up Database Schema

1. **Go to SQL Editor** in your Supabase dashboard
2. **Copy the entire contents** of `supabase-schema.sql`
3. **Paste and run** the SQL script
4. **Verify tables were created** in the Table Editor

### Tables Created:
- `cake_requests` - Form submissions
- `gallery_images` - Gallery content
- `admin_users` - Admin user management
- `index_content` - Homepage content

## 🔐 Step 3: Configure Authentication

### Enable Email Authentication:
1. Go to **Authentication > Settings** in Supabase
2. **Enable Email provider** (should be enabled by default)
3. **Set Site URL** to your domain:
   - Development: `http://localhost:3001`
   - Production: `https://your-vercel-domain.com`

### Create Admin User:
1. Go to **Authentication > Users**
2. **Click "Add user"**
3. **Enter admin details:**
   - Email: `omarg005@gmail.com`
   - Password: Choose a secure password
   - Email confirmed: ✅ Check this
4. **Click "Add user"**

## 🔑 Step 4: Get API Keys

1. **Go to Settings > API** in your Supabase dashboard
2. **Copy these values:**
   - Project URL
   - `anon` `public` key
   - `service_role` `secret` key

## 🌐 Step 5: Configure Environment Variables

### For Local Development:
Create `.env.local` in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Email Configuration
RESEND_API_KEY=your-resend-api-key
ADMIN_EMAIL=omarg005@gmail.com

# App Configuration
NODE_ENV=development
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

### For Vercel Deployment:
1. Go to your **Vercel dashboard**
2. Select your **project**
3. Go to **Settings > Environment Variables**
4. Add all the variables above
5. Set for **Production**, **Preview**, and **Development**

## 🛡️ Step 6: Configure Row Level Security

The SQL script already sets up RLS policies, but here's what they do:

### Cake Requests:
- ✅ **Anyone can submit** requests (INSERT)
- 🔒 **Only admins can view/manage** (SELECT, UPDATE, DELETE)

### Gallery Images:
- ✅ **Anyone can view** (SELECT)
- 🔒 **Only admins can manage** (INSERT, UPDATE, DELETE)

### Admin Users:
- 🔒 **Only authenticated users** can access

### Index Content:
- ✅ **Anyone can view** (SELECT)
- 🔒 **Only admins can manage** (INSERT, UPDATE, DELETE)

## 📁 Step 7: Set Up Storage (Optional)

1. **Go to Storage** in Supabase dashboard
2. **Create bucket**: `cake-images`
3. **Set bucket to public** for easy image access
4. **Configure policies** for file uploads

## 🧪 Step 8: Test the Setup

### Test Database Connection:
1. **Start your development server**:
   ```bash
   npm start
   ```

2. **Open browser console** on your site
3. **Run this test**:
   ```javascript
   // This will test if Supabase is connected
   fetch('/api/test-supabase')
   ```

### Test Form Submission:
1. **Go to the request page**
2. **Fill out and submit** a test cake request
3. **Check Supabase dashboard** > Table Editor > `cake_requests`
4. **Verify the data** appears in the table

### Test Admin Login:
1. **Go to the admin panel**
2. **Try logging in** with your admin credentials
3. **Check if you can view** submitted requests

## 🔧 Step 9: Update Application Code

The following files have been prepared for Supabase integration:

- ✅ `lib/supabase.js` - Supabase client configuration
- ✅ `services/database.js` - Database service layer
- ✅ `supabase-schema.sql` - Database schema

### Next Steps:
1. **Update form submission** to use Supabase
2. **Replace admin authentication** with Supabase Auth
3. **Migrate image storage** to Supabase Storage

## 🚨 Troubleshooting

### Common Issues:

**1. "Invalid API Key" Error:**
- Check environment variables are set correctly
- Restart development server after adding `.env.local`
- Verify API keys in Supabase dashboard

**2. "Row Level Security" Errors:**
- Check if user is authenticated for admin operations
- Verify RLS policies are set up correctly
- Test with service role key for debugging

**3. "Connection Failed" Error:**
- Check project URL format
- Verify project is not paused in Supabase
- Check network/firewall settings

**4. Environment Variables Not Working:**
- Restart development server
- Check `.env.local` file location
- Verify variable names match exactly

### Getting Help:
1. **Check browser console** for error messages
2. **Check Supabase logs** in dashboard
3. **Verify environment variables** in Vercel dashboard
4. **Test with curl** or Postman for API issues

## 🎯 What's Next?

After basic setup:

1. **✅ Database Migration** - Move from in-memory to Supabase
2. **🔐 Authentication Update** - Replace basic auth with Supabase Auth
3. **📁 File Storage** - Move images to Supabase Storage
4. **⚡ Real-time Features** - Live admin panel updates
5. **📧 Edge Functions** - Server-side email logic

## 🏆 Benefits You'll Get:

- **🔄 Persistent Data** - No more lost requests on restart
- **⚡ Real-time Updates** - Live admin panel
- **🛡️ Security** - Row-level security built-in
- **📊 PostgreSQL** - Powerful database with SQL
- **🚀 Scalability** - Handles growth automatically
- **🔍 Admin Dashboard** - Built-in data browser
- **📈 Analytics** - Usage statistics included

Your Supabase integration is ready! 🎉

## 📞 Support

If you need help:
- **Supabase Docs**: https://supabase.com/docs
- **Discord Community**: https://discord.supabase.com
- **Check the troubleshooting section** above

---

**Ready to migrate your data? Let's continue with the next steps!** 🚀

## 📁 Bonus: Supabase Storage Setup

For cloud image storage with CDN delivery:

### 1. Create Storage Bucket:
- Go to **Storage** in your Supabase dashboard
- Create bucket: `cake-images` (public, 10MB limit, `image/*` types)

### 2. Configure Storage Policies:
```sql
-- Public read access
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'cake-images');

-- Admin upload/manage access
CREATE POLICY "Admin can manage" ON storage.objects
  FOR ALL USING (bucket_id = 'cake-images' AND auth.role() = 'authenticated');
```

### 3. Test Storage:
Visit: `http://localhost:3002/api/test-storage`
