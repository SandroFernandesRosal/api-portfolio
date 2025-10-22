-- Make repo and page columns nullable in projects table
ALTER TABLE projects ALTER COLUMN repo DROP NOT NULL;
ALTER TABLE projects ALTER COLUMN page DROP NOT NULL;

-- Add comments to explain the columns are now optional
COMMENT ON COLUMN projects.repo IS 'URL do repositório GitHub (opcional)';
COMMENT ON COLUMN projects.page IS 'URL da página do projeto (opcional)';
