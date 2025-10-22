-- Adicionar coluna date_project
ALTER TABLE projects ADD COLUMN date_project DATE;

-- Tornar campos opcionais
ALTER TABLE projects ALTER COLUMN repo DROP NOT NULL;
ALTER TABLE projects ALTER COLUMN page DROP NOT NULL;
ALTER TABLE projects ALTER COLUMN img DROP NOT NULL;
