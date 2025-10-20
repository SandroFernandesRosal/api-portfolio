-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create technologies table
CREATE TABLE IF NOT EXISTS technologies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  img VARCHAR(500) NOT NULL,
  video VARCHAR(500),
  repo VARCHAR(500) NOT NULL,
  page VARCHAR(500) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create project_technologies junction table
CREATE TABLE IF NOT EXISTS project_technologies (
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  technology_id INTEGER REFERENCES technologies(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, technology_id)
);

-- Create project_images table
CREATE TABLE IF NOT EXISTS project_images (
  id SERIAL PRIMARY KEY,
  url VARCHAR(500) NOT NULL,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Insert default technologies
INSERT INTO technologies (name) VALUES 
  ('HTML'), ('CSS'), ('JS'), ('TS'), ('React'), ('Next'), ('Tailwind'),
  ('Angular'), ('Node.js'), ('API'), ('Styled Components'), ('Prisma'),
  ('MySQL'), ('PostgreSQL'), ('Supabase'), ('OpenAI'), ('Z-API'),
  ('Scrum'), ('Kanban'), ('Zustand')
ON CONFLICT (name) DO NOTHING;

-- Sample projects will be inserted via seed script
