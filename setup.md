# 🚀 Setup da API Portfolio

## 1. Instalação das Dependências

```bash
cd api-portfolio
npm install
```

## 2. Configuração do Banco de Dados

### 2.1 Criar o banco PostgreSQL
```sql
CREATE DATABASE portfolio_db;
```

### 2.2 Configurar variáveis de ambiente
```bash
cp env.example .env
```

Edite o arquivo `.env`:
```env
DATABASE_URL="postgresql://seu_usuario:sua_senha@localhost:5432/portfolio_db"
JWT_SECRET="sua-chave-secreta-super-segura-aqui"
PORT=3333
NODE_ENV="development"
```

### 2.3 Executar migrações
```bash
# Conecte ao PostgreSQL e execute:
psql -U seu_usuario -d portfolio_db -f src/database/migrations.sql
```

## 3. Popular o banco com dados iniciais

```bash
npm run seed
```

## 4. Executar a API

```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

## 5. Testar a API

A API estará rodando em `http://localhost:3333`

### Endpoints disponíveis:

- `GET /health` - Health check
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout  
- `GET /auth/me` - Usuário logado
- `GET /products` - Todos os projetos
- `GET /products/featured` - Projetos em destaque
- `GET /products/search?q=query` - Buscar projetos
- `GET /products/:slug` - Projeto específico

## 6. Criar usuário para teste

Para testar a autenticação, você precisará criar um usuário no banco:

```sql
INSERT INTO users (email, password, name) 
VALUES ('admin@example.com', '$2a$12$hash_da_senha_aqui', 'Admin');
```

**Nota**: A senha precisa ser hasheada com bcrypt. Use uma ferramenta online ou crie um script para gerar o hash.

## 7. Integração com Frontend

No seu frontend Next.js, atualize o arquivo `src/env.ts` para apontar para a nova API:

```typescript
export const env = {
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3333',
}
```

E no `.env.local` do frontend:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3333
```

## 🎯 Próximos Passos

1. ✅ API básica funcionando
2. ✅ Autenticação com JWT e cookies
3. ✅ Rotas de projetos compatíveis com frontend
4. 🔄 Testar integração com frontend
5. 🔄 Deploy da API
6. 🔄 Configurar CORS para produção

