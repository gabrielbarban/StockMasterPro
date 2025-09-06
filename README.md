# StockMaster Pro - Intelligent Inventory Management System

![StockMaster Pro Logo](https://img.shields.io/badge/StockMaster-Pro-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black?style=for-the-badge&logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)
![MySQL](https://img.shields.io/badge/MySQL-8.0+-blue?style=for-the-badge&logo=mysql)

**Intelligent Control. Real Results.**

StockMaster Pro is a comprehensive inventory management system designed for modern businesses. Built with cutting-edge technologies, it provides real-time stock control, intelligent analytics, and seamless multi-tenant support.

---

## 🏢 **Copyright & Ownership**

**© 2025 Barban Softwares LTDA. All Rights Reserved.**

This software is the exclusive property of **Barban Softwares LTDA**. Unauthorized reproduction, distribution, or modification of this software is strictly prohibited and may result in legal action.

**Website:** [barban.co]

---

## 🚀 **Technology Stack**

### **Frontend**
- **Framework:** Next.js 15.5.2 with React 19
- **Styling:** Tailwind CSS 4.0
- **Icons:** Lucide React
- **Charts:** Recharts
- **State Management:** React Hooks + Context API
- **Authentication:** JWT with automatic token management

### **Backend**
- **Runtime:** Node.js 18+
- **Framework:** Express.js 4.19.2
- **Database:** MySQL 8.0+
- **Authentication:** JWT + bcryptjs
- **Security:** Helmet, CORS, Rate Limiting
- **ORM:** Raw MySQL queries with connection pooling

---

## 📋 **Prerequisites**

Before deploying StockMaster Pro, ensure you have:

- **Node.js 18.0.0+** installed
- **MySQL 8.0+** database server
- **npm 8.0.0+** or **yarn** package manager
- **Git** for version control
- **Domain name** (for production deployment)
- **SSL Certificate** (recommended for production)

---

## 🛠 **Installation & Setup**

### **1. Clone the Repository**

```bash
git clone https://github.com/barbansoftwares/stockmaster-pro.git
cd stockmaster-pro
```

### **2. Database Setup**

#### **Create MySQL Database**

```sql
CREATE DATABASE stockmaster_pro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### **Import Database Schema**

```bash
mysql -u root -p stockmaster_pro < database/schema.sql
```

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start server.js --name stockmaster-backend

# Save PM2 configuration
pm2 save

# Setup auto-restart on system reboot
pm2 startup
```

#### **Using Docker**

Create `Dockerfile` in backend directory:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["node", "server.js"]
```

Build and run:

```bash
docker build -t stockmaster-backend .
docker run -d -p 3001:3001 --name stockmaster-backend stockmaster-backend
```

### **4. Nginx Configuration**

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🎨 **Frontend Deployment**

### **1. Install Dependencies**

```bash
cd frontend
npm install
```

### **2. Environment Configuration**

Create `.env.local` file in the frontend directory:

```bash
# STOCKMASTER PRO - Frontend Configuration

# API Configuration
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api

# Disable telemetry
NEXT_TELEMETRY_DISABLED=1
```

### **3. Build for Production**

```bash
# Build the application
npm run build

# Test the build locally
npm start
```

### **4. Deployment Options**

#### **Vercel (Recommended for Next.js)**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel --prod
```

#### **Using PM2**

```bash
# Build the application
npm run build

# Start with PM2
pm2 start npm --name stockmaster-frontend -- start

# Save PM2 configuration
pm2 save
```

#### **Using Docker**

Create `Dockerfile` in frontend directory:

```dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
```

### **5. Nginx Configuration for Frontend**

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🔐 **Security Configuration**

### **1. Database Security**

```sql
-- Create dedicated user for the application
CREATE USER 'stockmaster'@'localhost' IDENTIFIED BY 'secure_password_here';
GRANT SELECT, INSERT, UPDATE, DELETE ON stockmaster_pro.* TO 'stockmaster'@'localhost';
FLUSH PRIVILEGES;
```

### **2. Firewall Rules**

```bash
# Allow only necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 3306  # MySQL (only from localhost)
sudo ufw enable
```

### **3. SSL Certificate**

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

---

## 📊 **Monitoring & Maintenance**

### **1. Application Monitoring**

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs stockmaster-backend
pm2 logs stockmaster-frontend

# Monitor resources
pm2 monit
```

### **2. Database Backup**

```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u root -p stockmaster_pro > /backups/stockmaster_backup_$DATE.sql

# Add to crontab for daily backups
0 2 * * * /path/to/backup_script.sh
```

### **3. Log Rotation**

```bash
# Configure logrotate for PM2 logs
sudo nano /etc/logrotate.d/pm2

/home/user/.pm2/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    notifempty
    create 644 user user
    postrotate
        pm2 reload all
    endscript
}
```

---

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Database Connection Error**
   ```bash
   # Check MySQL service
   sudo systemctl status mysql
   
   # Restart MySQL
   sudo systemctl restart mysql
   ```

2. **Port Already in Use**
   ```bash
   # Find process using port
   sudo lsof -i :3001
   
   # Kill process
   sudo kill -9 PID
   ```

3. **Permission Issues**
   ```bash
   # Fix file permissions
   sudo chown -R user:user /path/to/app
   chmod -R 755 /path/to/app
   ```


---

## 📄 **License**

This software is proprietary and confidential. It is licensed, not sold. Your use of this software is governed by the terms of the license agreement provided by **Barban Softwares LTDA**.

**© 2025 Barban Softwares LTDA. All Rights Reserved.**