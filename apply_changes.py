#!/usr/bin/env python3
"""
Website Changes Application Script
This script applies changes from the admin panel to the actual website files.
"""

import json
import os
import shutil
import re
from datetime import datetime
from pathlib import Path

def main():
    print("=== Website Changes Application Script ===")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Check if changes file exists
    changes_file = "website_changes.json"
    if not os.path.exists(changes_file):
        print(f"❌ Error: {changes_file} not found!")
        print("Please download the changes file from the admin panel first.")
        return
    
    # Load changes data
    try:
        with open(changes_file, 'r', encoding='utf-8') as f:
            changes_data = json.load(f)
        print(f"✅ Loaded changes data for page: {changes_data.get('page', 'unknown')}")
    except Exception as e:
        print(f"❌ Error loading changes file: {e}")
        return
    
    # Create backup directory
    backup_dir = f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    os.makedirs(backup_dir, exist_ok=True)
    print(f"📁 Created backup directory: {backup_dir}")
    
    # Apply changes based on page type
    page = changes_data.get('page', '')
    
    if page == 'gallery':
        apply_gallery_changes(changes_data, backup_dir)
    elif page in ['index', 'about']:
        apply_page_changes(changes_data, backup_dir)
    else:
        print(f"❌ Unknown page type: {page}")
        return
    
    print("✅ All changes applied successfully!")
    print(f"📁 Backup files saved in: {backup_dir}")
    print("🔄 Please refresh your browser to see the changes.")

def apply_gallery_changes(changes_data, backup_dir):
    """Apply changes to gallery page and data"""
    print("\n--- Applying Gallery Changes ---")
    
    # Update gallery_data.json
    gallery_data_file = "images/gallery/gallery_data.json"
    if changes_data.get('updatedGalleryData'):
        # Backup original file
        if os.path.exists(gallery_data_file):
            backup_file = os.path.join(backup_dir, "gallery_data.json")
            shutil.copy2(gallery_data_file, backup_file)
            print(f"📋 Backed up: {gallery_data_file}")
        
        # Write updated gallery data
        os.makedirs(os.path.dirname(gallery_data_file), exist_ok=True)
        with open(gallery_data_file, 'w', encoding='utf-8') as f:
            json.dump(changes_data['updatedGalleryData'], f, indent=2, ensure_ascii=False)
        print(f"✅ Updated: {gallery_data_file}")
    
    # Update gallery.html
    update_gallery_html(changes_data, backup_dir)
    
    # Handle image uploads
    handle_image_uploads(changes_data, backup_dir)

def apply_page_changes(changes_data, backup_dir):
    """Apply changes to index or about pages"""
    print(f"\n--- Applying {changes_data.get('page', '').title()} Page Changes ---")
    
    page_file = f"{changes_data.get('page', 'index')}.html"
    
    # Backup original file
    if os.path.exists(page_file):
        backup_file = os.path.join(backup_dir, page_file)
        shutil.copy2(page_file, backup_file)
        print(f"📋 Backed up: {page_file}")
    
    # Update HTML content
    update_html_content(page_file, changes_data.get('changes', {}))
    print(f"✅ Updated: {page_file}")
    
    # Handle image uploads
    handle_image_uploads(changes_data, backup_dir)

def update_gallery_html(changes_data, backup_dir):
    """Update gallery.html with new titles and descriptions"""
    gallery_html_file = "gallery.html"
    
    if not os.path.exists(gallery_html_file):
        print(f"⚠️  Warning: {gallery_html_file} not found, skipping HTML update")
        return
    
    # Backup original file
    backup_file = os.path.join(backup_dir, gallery_html_file)
    shutil.copy2(gallery_html_file, backup_file)
    print(f"📋 Backed up: {gallery_html_file}")
    
    # Read current HTML
    with open(gallery_html_file, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    # Update gallery items
    changes = changes_data.get('changes', {})
    for image_id, change in changes.items():
        # Find the gallery item by image path
        image_path = change.get('originalImage', '')
        if image_path:
            # Update title and description in HTML
            html_content = update_gallery_item(html_content, image_path, change)
    
    # Write updated HTML
    with open(gallery_html_file, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"✅ Updated: {gallery_html_file}")

def update_gallery_item(html_content, image_path, change):
    """Update a specific gallery item in the HTML"""
    # Find the gallery item containing this image
    pattern = rf'(<div class="gallery-item">[^<]*<img[^>]*src="[^"]*{re.escape(image_path)}"[^>]*>[^<]*<div class="gallery-item-info">[^<]*<h3>)[^<]*(</h3>[^<]*<p>)[^<]*(</p>)'
    
    def replace_item(match):
        prefix = match.group(1)
        title = change.get('newTitle', '')
        middle = match.group(2)
        description = change.get('newDescription', '')
        suffix = match.group(3)
        return f"{prefix}{title}{middle}{description}{suffix}"
    
    return re.sub(pattern, replace_item, html_content, flags=re.DOTALL)

def update_html_content(page_file, changes):
    """Update HTML content for index/about pages"""
    with open(page_file, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    for image_id, change in changes.items():
        target_elements = change.get('targetElements', {})
        
        # Update title
        if 'title' in target_elements and change.get('newTitle'):
            selector = target_elements['title']
            html_content = update_html_element(html_content, selector, change['newTitle'])
        
        # Update description
        if 'description' in target_elements and change.get('newDescription'):
            selector = target_elements['description']
            html_content = update_html_element(html_content, selector, change['newDescription'])
    
    with open(page_file, 'w', encoding='utf-8') as f:
        f.write(html_content)

def update_html_element(html_content, selector, new_content):
    """Update a specific HTML element based on CSS selector"""
    # Simple implementation - in a real scenario, you'd use a proper HTML parser
    # This is a basic approach that works for simple cases
    
    if selector.startswith('.'):
        # Class selector
        class_name = selector[1:]
        pattern = rf'(<[^>]*class="[^"]*{re.escape(class_name)}[^"]*"[^>]*>)[^<]*(</[^>]*>)'
        
        def replace_content(match):
            tag_start = match.group(1)
            tag_end = match.group(2)
            return f"{tag_start}{new_content}{tag_end}"
        
        return re.sub(pattern, replace_content, html_content)
    
    return html_content

def handle_image_uploads(changes_data, backup_dir):
    """Handle new image uploads"""
    new_images = changes_data.get('newImages', [])
    
    if not new_images:
        print("📷 No new images to upload")
        return
    
    print(f"\n--- Handling {len(new_images)} Image Upload(s) ---")
    
    for image_info in new_images:
        target_path = image_info.get('targetPath', '')
        if target_path:
            # Create directory if it doesn't exist
            os.makedirs(os.path.dirname(target_path), exist_ok=True)
            
            # Backup original file if it exists
            if os.path.exists(target_path):
                backup_file = os.path.join(backup_dir, os.path.basename(target_path))
                shutil.copy2(target_path, backup_file)
                print(f"📋 Backed up: {target_path}")
            
            # Note: In a real implementation, you'd need to handle the actual file upload
            # For now, we'll just note that the file needs to be manually replaced
            print(f"⚠️  Note: Please manually replace {target_path} with the new image file")

if __name__ == "__main__":
    main() 