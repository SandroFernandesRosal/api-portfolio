-- Make img column nullable in projects table
ALTER TABLE projects ALTER COLUMN img DROP NOT NULL;

-- Add comment to explain the column is now optional
COMMENT ON COLUMN projects.img IS 'URL da imagem de capa do projeto (opcional)';
