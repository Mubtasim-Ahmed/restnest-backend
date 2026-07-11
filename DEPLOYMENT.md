# RentNest - Deployment Guide

Complete guide for deploying RentNest backend to production.

---

## 🚀 Deployment Platforms

### Option 1: Deploy to Render

1. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub account

2. **Connect Repository**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the RentNest repository

3. **Configure Environment**
   - **Name**: rentnest-api
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

4. **Set Environment Variables**
   ```
   PORT=5000
   MONGODB_URI=<your_mongodb_uri>
   JWT_SECRET=<strong_random_key>
   STRIPE_SECRET_KEY=<your_stripe_key>
   SSLCOMMERZ_STORE_ID=<your_sslcommerz_id>
   SSLCOMMERZ_STORE_PASSWORD=<your_sslcommerz_password>
   NODE_ENV=production
   ```

5. **Deploy**
   - Render will auto-deploy on every push to main branch

---

### Option 2: Deploy to Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create App**
   ```bash
   heroku create rentnest-api
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set MONGODB_URI=<mongodb_uri>
   heroku config:set JWT_SECRET=<strong_key>
   heroku config:set STRIPE_SECRET_KEY=<key>
   heroku config:set NODE_ENV=production
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

---

### Option 3: Deploy to DigitalOcean (VPS)

1. **Create Droplet**
   - Choose Ubuntu 22.04 LTS
   - Select $4/month (1GB RAM)

2. **Connect via SSH**
   ```bash
   ssh root@<droplet_ip>
   ```

3. **Setup Environment**
   ```bash
   # Update system
   apt update && apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   apt install -y nodejs
   
   # Install MongoDB
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
   apt update
   apt install -y mongodb-org
   
   # Start MongoDB
   systemctl start mongod
   systemctl enable mongod
   
   # Install PM2
   npm install -g pm2
   ```

4. **Deploy Application**
   ```bash
   cd /var/www
   git clone <your_repo_url>
   cd rentnest
   npm install
   
   # Create .env file
   nano .env
   # Add your environment variables
   
   # Start with PM2
   pm2 start server.js --name "rentnest"
   pm2 startup
   pm2 save
   ```

5. **Setup Reverse Proxy (Nginx)**
   ```bash
   apt install -y nginx
   
   # Create config file
   nano /etc/nginx/sites-available/rentnest
   ```

   ```nginx
   server {
     listen 80;
     server_name your_domain.com;
     
     location / {
       proxy_pass http://localhost:5000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```

   ```bash
   # Enable site
   ln -s /etc/nginx/sites-available/rentnest /etc/nginx/sites-enabled/
   
   # Test config
   nginx -t
   
   # Restart Nginx
   systemctl restart nginx
   ```

6. **Setup SSL (Let's Encrypt)**
   ```bash
   apt install -y certbot python3-certbot-nginx
   certbot --nginx -d your_domain.com
   ```

---

## 🔒 Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT secret
- [ ] Enable HTTPS/SSL
- [ ] Setup database backups
- [ ] Configure CORS properly
- [ ] Implement rate limiting
- [ ] Setup monitoring and logging
- [ ] Configure payment gateways with live keys
- [ ] Test all payment flows
- [ ] Setup database indexes
- [ ] Enable database authentication
- [ ] Configure firewall rules
- [ ] Setup domain and DNS
- [ ] Enable API logging
- [ ] Configure error monitoring (Sentry)

---

## 📊 Production Environment Variables

```
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/rentnest

# JWT
JWT_SECRET=generate-a-strong-random-key-32-characters
JWT_EXPIRE=7d

# Stripe (Live Keys)
STRIPE_PUBLIC_KEY=pk_live_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx

# SSLCommerz (Live Keys)
SSLCOMMERZ_STORE_ID=your_live_store_id
SSLCOMMERZ_STORE_PASSWORD=your_live_store_password
SSLCOMMERZ_API_URL=https://securepay.sslcommerz.com

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Frontend URL
FRONTEND_URL=https://rentnest.com
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run tests
        run: npm test
      
      - name: Deploy to Render
        env:
          RENDER_API_KEY: ${{ secrets.RENDER_API_KEY }}
        run: |
          # Add deployment commands
```

---

## 📈 Scaling Considerations

1. **Database**: Use MongoDB Atlas for managed hosting
2. **Caching**: Implement Redis for session caching
3. **CDN**: Use CloudFlare for static assets
4. **Load Balancing**: Configure load balancer for multiple instances
5. **Monitoring**: Setup DataDog or New Relic
6. **Logging**: Use ELK stack for centralized logging

---

## 🆘 Troubleshooting

### Issue: CORS Errors
```javascript
// Ensure CORS is configured properly in app.js
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

### Issue: MongoDB Connection Timeout
```javascript
// Add connection options
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});
```

### Issue: Payment Integration Not Working
- Verify API keys are correct
- Check webhook URLs are publicly accessible
- Ensure payment callbacks are whitelisted

---
