# API Portfolio

API para portfólio desenvolvida com Node.js, Fastify, TypeScript, Zod e PostgreSQL.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **Fastify** - Framework web rápido e eficiente
- **TypeScript** - Superset do JavaScript com tipagem estática
- **Zod** - Validação de schemas
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação com tokens
- **bcryptjs** - Hash de senhas
- **Cloudinary** - Upload e gerenciamento de imagens

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL 12+
- npm ou yarn

## 🛠️ Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp env.example .env
```

4. Configure o arquivo `.env` com suas credenciais:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/portfolio_db"
JWT_SECRET="your-super-secret-jwt-key-here"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
PORT=3333
NODE_ENV="development"
```

5. Execute as migrações do banco de dados:
```bash
# Conecte ao PostgreSQL e execute o arquivo migrations.sql
psql -U username -d portfolio_db -f src/database/migrations.sql
```

## 🚀 Executando

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```

## 📚 Endpoints

### Autenticação

#### POST /auth/login
Login do usuário
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### POST /auth/logout
Logout do usuário

#### GET /auth/me
Retorna dados do usuário logado (requer autenticação)

### Projetos

#### GET /products
Retorna todos os projetos

#### GET /products/featured
Retorna apenas projetos em destaque

#### GET /products/search?q=query
Busca projetos por título ou descrição

#### GET /products/:slug
Retorna projeto específico por slug

### Upload

#### POST /upload/image
Upload de uma única imagem para o Cloudinary (requer autenticação)

**Query Parameters:**
- `folder` (opcional): Pasta no Cloudinary (padrão: 'portfolio')
- `width` (opcional): Largura da imagem
- `height` (opcional): Altura da imagem
- `crop` (opcional): Tipo de crop ('fill', 'fit', 'scale', 'crop', 'thumb')
- `quality` (opcional): Qualidade ('auto', 'best', 'good', 'eco', 'low')
- `format` (opcional): Formato ('auto', 'jpg', 'png', 'webp', 'gif')

#### POST /upload/images
Upload de múltiplas imagens para o Cloudinary (requer autenticação)

**Query Parameters:** Mesmos parâmetros do upload único

#### GET /upload/info
Informações sobre o serviço de upload (requer autenticação)

## 🔐 Autenticação

A API usa autenticação baseada em cookies JWT. Após o login, o token é armazenado em um cookie HTTP-only.

## 🗄️ Estrutura do Banco

### Tabelas
- `users` - Usuários do sistema
- `projects` - Projetos do portfólio
- `technologies` - Tecnologias utilizadas
- `project_technologies` - Relacionamento projetos-tecnologias
- `project_images` - Imagens dos projetos

## 📁 Estrutura do Projeto

```
src/
├── database/
│   ├── connection.ts      # Conexão com PostgreSQL
│   └── migrations.sql     # Scripts de migração
├── middleware/
│   └── auth.ts           # Middleware de autenticação
├── routes/
│   ├── auth.ts           # Rotas de autenticação
│   ├── projects.ts       # Rotas de projetos
│   └── upload.ts         # Rotas de upload
├── schemas/
│   ├── auth.ts           # Schemas de validação de auth
│   ├── projects.ts       # Schemas de validação de projetos
│   └── upload.ts         # Schemas de validação de upload
├── types/
│   └── index.ts          # Tipos TypeScript
├── utils/
│   ├── jwt.ts            # Utilitários JWT
│   ├── password.ts       # Utilitários de senha
│   └── upload.ts         # Utilitários de upload
├── config/
│   └── cloudinary.ts     # Configuração do Cloudinary
└── server.ts             # Servidor principal
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Executa em modo desenvolvimento
- `npm run build` - Compila TypeScript
- `npm start` - Executa versão compilada

## 🌐 CORS

A API está configurada para aceitar requisições do frontend em:
- Desenvolvimento: `http://localhost:3000`
- Produção: `https://sandrofernandes-dev.vercel.app`
