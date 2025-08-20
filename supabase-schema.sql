-- Supabase Database Schema for Dulce Luna Cakes
-- Run these commands in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create cake_requests table
CREATE TABLE IF NOT EXISTS cake_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    event_date DATE,
    event_type VARCHAR(100),
    event_address TEXT,
    event_city VARCHAR(100),
    event_zip VARCHAR(20),
    cake_size VARCHAR(100),
    cake_flavor VARCHAR(100),
    frosting_type VARCHAR(100),
    cake_filling VARCHAR(100),
    design_description TEXT,
    color_scheme VARCHAR(255),
    special_requests TEXT,
    budget_range VARCHAR(100),
    additional_notes TEXT,
    reference_image_url VARCHAR(500),
    request_delivery BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gallery_images table
CREATE TABLE IF NOT EXISTS gallery_images (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    order_index INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index_content table (for homepage content management)
CREATE TABLE IF NOT EXISTS index_content (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- 'hero', 'featured', 'about'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_cake_requests_updated_at 
    BEFORE UPDATE ON cake_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gallery_images_updated_at 
    BEFORE UPDATE ON gallery_images 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at 
    BEFORE UPDATE ON admin_users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_index_content_updated_at 
    BEFORE UPDATE ON index_content 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cake_requests_status ON cake_requests(status);
CREATE INDEX IF NOT EXISTS idx_cake_requests_created_at ON cake_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_cake_requests_email ON cake_requests(email);

CREATE INDEX IF NOT EXISTS idx_gallery_images_order ON gallery_images(order_index);
CREATE INDEX IF NOT EXISTS idx_gallery_images_featured ON gallery_images(is_featured);

CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

CREATE INDEX IF NOT EXISTS idx_index_content_type ON index_content(type);
CREATE INDEX IF NOT EXISTS idx_index_content_order ON index_content(order_index);

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE cake_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE index_content ENABLE ROW LEVEL SECURITY;

-- Cake requests policies
-- Anyone can insert (submit requests)
CREATE POLICY "Anyone can submit cake requests" ON cake_requests
    FOR INSERT WITH CHECK (true);

-- Only authenticated users can view/update/delete
CREATE POLICY "Admins can manage cake requests" ON cake_requests
    FOR ALL USING (auth.role() = 'authenticated');

-- Gallery images policies
-- Anyone can view gallery images
CREATE POLICY "Anyone can view gallery images" ON gallery_images
    FOR SELECT USING (true);

-- Only authenticated users can manage gallery
CREATE POLICY "Admins can manage gallery images" ON gallery_images
    FOR ALL USING (auth.role() = 'authenticated');

-- Admin users policies
-- Only authenticated users can access admin_users
CREATE POLICY "Admins can manage admin users" ON admin_users
    FOR ALL USING (auth.role() = 'authenticated');

-- Index content policies
-- Anyone can view index content
CREATE POLICY "Anyone can view index content" ON index_content
    FOR SELECT USING (true);

-- Only authenticated users can manage content
CREATE POLICY "Admins can manage index content" ON index_content
    FOR ALL USING (auth.role() = 'authenticated');

-- Insert sample data
-- Gallery images sample data
INSERT INTO gallery_images (title, description, image_url, order_index) VALUES
('Chocolate Floral Tier', 'Elegant three-tier chocolate cake with buttercream flowers and gold accents. Perfect for special celebrations.', 'images/gallery/ChocolateFloralTier.jpg', 1),
('Unicorn Birthday Magic', 'Whimsical unicorn-themed birthday cake with rainbow layers, buttercream mane, and edible glitter.', 'images/gallery/UnicornBirthdayMagic.jpg', 2),
('Rustic Wedding Cake', 'Three-tier semi-naked wedding cake with fresh berries, eucalyptus, and rustic charm.', 'images/gallery/RusticWeddingCake.jpg', 3),
('Princess Birthday Cake', 'Royal pink princess castle cake with towers, flags, and edible pearls for a magical celebration.', 'images/gallery/PrincessBirthdayCake.jpg', 4),
('Red Velvet Elegance', 'Classic red velvet cake with cream cheese frosting and elegant white chocolate decorations.', 'images/gallery/RedVelvetElegance.jpg', 5),
('Garden Party Cake', 'Fresh floral garden party cake with buttercream flowers and natural greenery accents.', 'images/gallery/GardenPartyCake.jpg', 6);

-- Index content sample data
INSERT INTO index_content (type, title, description, image_url, order_index) VALUES
('hero', 'Custom Cakes That Capture Your Sweetest Moments', 'Creatively Delicious', 'images/index/Hero.avif', 1),
('featured', 'Chocolate Floral Tier', 'Elegant three-tier chocolate cake with buttercream flowers and gold accents. Perfect for weddings and special celebrations.', 'images/index/ChocolateFloralTier.avif', 1),
('featured', 'Unicorn Birthday Magic', 'Whimsical unicorn-themed birthday cake with rainbow layers, buttercream mane, and edible glitter. Every child''s dream come true.', 'images/index/UnicornBirthdayMagic.avif', 2),
('featured', 'Rustic Wedding Cake', 'Three-tier semi-naked wedding cake with fresh berries, eucalyptus, and rustic charm. Perfect for outdoor and vintage-themed weddings.', 'images/index/RusticWeddingCake.avif', 3),
('about', 'Meet the Baker', 'Hi, I''m Luna! I''ve been crafting custom cakes for over 5 years, turning your sweetest dreams into delicious reality.', 'images/index/Nomi.jpg', 1);

-- Create admin user (you'll need to create this user in Supabase Auth first)
-- This is a placeholder - you'll need to update with actual user ID from Supabase Auth
-- INSERT INTO admin_users (email, name, role) VALUES
-- ('omarg005@gmail.com', 'Omar Garcia', 'super_admin');
