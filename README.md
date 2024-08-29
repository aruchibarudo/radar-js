## Development Setup

### 1. Create Environment Files

```bash
# For development environment
cp .env.example .env.development

# For production environment
cp .env.example .env.production
```

### 2. Configure the Environment Variables

- `API_BASE_URL`: The URL of your backend API for development
- `API_AUTH_TOKEN`: Auth bearer token in the `Authorization` header
- `MIN_RU_RADARS`: Minimum number of Russian radars to be highlighted in a quadrant
- `PORT`: Port for the Webpack Dev Server
- `CERT_PATH` and `KEY_PATH`: Paths to your SSL certificate and key for HTTPS development

### 3. Generate locally-trusted development certificates
Using this [instruction](https://github.com/FiloSottile/mkcert)

### 4. Running the Application
`npm run dev`

### 5. Build the Application
`npm run build:prod`
