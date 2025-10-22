-- Add date_project column to projects table
ALTER TABLE projects ADD COLUMN date_project DATE;

-- Add comment to explain the column purpose
COMMENT ON COLUMN projects.date_project IS 'Data real de criação do projeto (opcional, diferente do created_at que é automático)';
