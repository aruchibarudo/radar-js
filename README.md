## Development Setup

### 1. Create Environment Files

```bash
# For development environment
cp .env.example .env.development

# For production environment
cp .env.example .env.production
```

### 2. Configure the Environment Variables

#### `.env.development`

```ini
API_BASE_URL=https://localhost:8080/api/v1
PORT=8000
CERT_PATH=./cert.pem
KEY_PATH=./key.pem
```

- `API_BASE_URL`: The URL of your backend API for development
- `PORT`: Port for the Webpack Dev Server
- `CERT_PATH` and `KEY_PATH`: Paths to your SSL certificate and key for HTTPS development

#### `.env.production`

```ini
API_BASE_URL=https://your-production-api.com/api/v1
```

### 3. Generate locally-trusted development certificates
Using this [instruction](https://github.com/FiloSottile/mkcert)

### 4. Running the Application
`npm run dev`

### 5. Build the Application
`npm run build:prod`
