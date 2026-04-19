-- Sample data for testing and demo purposes
-- Run this AFTER the main schema is set up

-- Insert sample user profiles (password: password123)
INSERT INTO user_profiles (id, email, full_name, role) VALUES
  ('12345678-1234-1234-1234-123456789001', 'student@example.com', 'John Student', 'student'),
  ('12345678-1234-1234-1234-123456789002', 'supervisor@example.com', 'Dr. Jane Supervisor', 'supervisor'),
  ('12345678-1234-1234-1234-123456789003', 'admin@example.com', 'Admin User', 'admin')
ON CONFLICT (id) DO NOTHING;

-- Insert sample supervisors
INSERT INTO supervisors (id, user_id, department, research_area, experience, contact_email) VALUES
  (uuid_generate_v4(), '12345678-1234-1234-1234-123456789002', 'CS', 'Machine Learning & AI', 8, 'jane@university.edu'),
  (uuid_generate_v4(), '12345678-1234-1234-1234-123456789002', 'CS', 'Web Development', 5, 'supervisor2@university.edu')
ON CONFLICT DO NOTHING;

-- Insert sample students
INSERT INTO students (id, user_id, department, group_id, enrollment_number) VALUES
  (uuid_generate_v4(), '12345678-1234-1234-1234-123456789001', 'CS', 'G1', 'STU-2024-001')
ON CONFLICT DO NOTHING;

-- Insert sample projects
INSERT INTO projects (id, title, description, category, video_link, created_by) VALUES
  (uuid_generate_v4(), 'AI-Powered Recommendation Engine', 'Build an intelligent recommendation system using machine learning algorithms', 'AI', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '12345678-1234-1234-1234-123456789002'),
  (uuid_generate_v4(), 'Mobile Health Tracking App', 'Develop a cross-platform mobile app for health and fitness tracking', 'Mobile Development', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '12345678-1234-1234-1234-123456789002'),
  (uuid_generate_v4(), 'Cybersecurity Threat Detection', 'Create a system to detect and mitigate cybersecurity threats in real-time', 'Security', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '12345678-1234-1234-1234-123456789002'),
  (uuid_generate_v4(), 'IoT Smart Home Control', 'Build an IoT system for controlling home appliances remotely', 'IoT', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '12345678-1234-1234-1234-123456789002'),
  (uuid_generate_v4(), 'Cloud-Based File Management System', 'Develop a scalable file storage and management system using cloud technologies', 'Web Development', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '12345678-1234-1234-1234-123456789002')
ON CONFLICT DO NOTHING;
