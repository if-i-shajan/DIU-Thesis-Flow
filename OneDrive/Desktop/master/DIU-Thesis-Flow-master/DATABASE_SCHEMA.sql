-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USER PROFILES TABLE
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) CHECK (role IN ('student', 'supervisor', 'admin')) DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SUPERVISORS TABLE
CREATE TABLE IF NOT EXISTS supervisors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE UNIQUE,
  department VARCHAR(100) NOT NULL,
  research_area VARCHAR(255) NOT NULL,
  experience INT DEFAULT 0,
  contact_email VARCHAR(255),
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STUDENTS TABLE
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE UNIQUE,
  department VARCHAR(100) NOT NULL,
  group_id VARCHAR(50),
  enrollment_number VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PROJECTS TABLE
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  video_link TEXT,
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  supervisor_id UUID REFERENCES supervisors(id),
  status VARCHAR(50) CHECK (status IN ('available', 'assigned', 'archived')) DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SUPERVISOR REQUESTS TABLE
CREATE TABLE IF NOT EXISTS supervisor_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  supervisor_id UUID NOT NULL REFERENCES supervisors(id) ON DELETE CASCADE,
  status VARCHAR(50) CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, supervisor_id)
);

-- NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type VARCHAR(50) CHECK (type IN ('request', 'accepted', 'rejected', 'info', 'request_update')) DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_supervisors_department ON supervisors(department);
CREATE INDEX IF NOT EXISTS idx_students_department ON students(department);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_supervisor_id ON projects(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_supervisor_requests_student_id ON supervisor_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_supervisor_requests_supervisor_id ON supervisor_requests(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_supervisor_requests_status ON supervisor_requests(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE supervisors ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE supervisor_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Helper function for admin checks without recursive RLS lookups
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_profiles
    WHERE id = user_uuid AND role = 'admin'
  );
$$;

-- POLICIES FOR user_profiles
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admin can view all profiles"
  ON user_profiles FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- POLICIES FOR supervisors
CREATE POLICY "Everyone can view supervisors"
  ON supervisors FOR SELECT
  USING (TRUE);

CREATE POLICY "Supervisors can update their own profile"
  ON supervisors FOR UPDATE
  USING (
    auth.uid() = user_id
  );

CREATE POLICY "Admins can manage supervisors"
  ON supervisors FOR ALL
  USING (is_admin(auth.uid()));

-- POLICIES FOR students
CREATE POLICY "Students can view their own profile"
  ON students FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Supervisors can view assigned students"
  ON students FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM supervisor_requests
      WHERE supervisor_id IN (
        SELECT id FROM supervisors WHERE user_id = auth.uid()
      )
      AND student_id = user_id
      AND status = 'accepted'
    )
  );

CREATE POLICY "Admins can view all students"
  ON students FOR SELECT
  USING (is_admin(auth.uid()));

-- POLICIES FOR projects
CREATE POLICY "Everyone can view projects"
  ON projects FOR SELECT
  USING (TRUE);

CREATE POLICY "Supervisors and Admins can create projects"
  ON projects FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('supervisor', 'admin')
    )
  );

CREATE POLICY "Project creators can update their projects"
  ON projects FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Admins can manage all projects"
  ON projects FOR ALL
  USING (is_admin(auth.uid()));

-- POLICIES FOR supervisor_requests
CREATE POLICY "Students can view their own requests"
  ON supervisor_requests FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Supervisors can view requests sent to them"
  ON supervisor_requests FOR SELECT
  USING (
    supervisor_id IN (
      SELECT id FROM supervisors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Students can create requests"
  ON supervisor_requests FOR INSERT
  WITH CHECK (
    student_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM students WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Supervisors can update request status"
  ON supervisor_requests FOR UPDATE
  USING (
    supervisor_id IN (
      SELECT id FROM supervisors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all requests"
  ON supervisor_requests FOR ALL
  USING (is_admin(auth.uid()));

-- POLICIES FOR notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  USING (user_id = auth.uid());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supervisors_updated_at
BEFORE UPDATE ON supervisors
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at
BEFORE UPDATE ON students
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supervisor_requests_updated_at
BEFORE UPDATE ON supervisor_requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at
BEFORE UPDATE ON notifications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
