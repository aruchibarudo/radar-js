## Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Environment Files

```bash
# For development environment
cp .env.example .env.development

# For production environment
cp .env.example .env.production
```

### 3. Configure the Environment Variables

- `PUBLIC_URL`: Public URL for assets and routes (optional)
- `API_BASE_URL`: The URL of your backend API for development
- `API_AUTH_TOKEN`: Auth bearer token in the `Authorization` header
- `MIN_RU_RADARS`: Minimum number of Russian radars to be highlighted in a quadrant
- `PORT`: Port for the Webpack Dev Server
- `CERT_PATH` and `KEY_PATH`: Paths to your SSL certificate and key for HTTPS development

### 4. Generate locally-trusted development certificates
Using this [instruction](https://github.com/FiloSottile/mkcert)

### 5. Running the Application
`npm run dev`

### 6. Build the Application
`npm run build:prod`
