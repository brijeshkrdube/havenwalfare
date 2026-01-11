# HavenWelfare - Ubuntu VPS Deployment Guide

## 📋 Prerequisites
- Ubuntu 22.04 LTS VPS (DigitalOcean, Vultr, Linode, AWS EC2, etc.)
- Domain name pointed to your server IP
- SSH access to your server

## 💰 Recommended VPS Specs
| Provider | Plan | Cost | Specs |
|----------|------|------|-------|
| DigitalOcean | Basic Droplet | $6/month | 1GB RAM, 1 CPU |
| Vultr | Cloud Compute | $5/month | 1GB RAM, 1 CPU |
| Linode | Nanode | $5/month | 1GB RAM, 1 CPU |

---

## 🔐 STEP 1: Initial Server Setup

### 1.1 Connect to Your Server
```bash
ssh root@YOUR_SERVER_IP
```

### 1.2 Update System
```bash
apt update && apt upgrade -y
```

### 1.3 Create a Non-Root User
```bash
adduser havenwelfare
usermod -aG sudo havenwelfare
```

### 1.4 Setup SSH for New User
```bash
rsync --archive --chown=havenwelfare:havenwelfare ~/.ssh /home/havenwelfare
```

### 1.5 Setup Firewall
```bash
ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw enable
```

### 1.6 Switch to New User
```bash
su - havenwelfare
```

---

## 📦 STEP 2: Install Dependencies

### 2.1 Install Python 3.11
```bash
sudo apt install -y software-properties-common
sudo add-apt-repository -y ppa:deadsnakes/ppa
sudo apt update
sudo apt install -y python3.11 python3.11-venv python3.11-dev python3-pip
```

### 2.2 Install Node.js 20
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g yarn
```

### 2.3 Install MongoDB
```bash
# Import MongoDB GPG key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install MongoDB
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify MongoDB is running
sudo systemctl status mongod
```

### 2.4 Install Nginx
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 2.5 Install Certbot (for SSL)
```bash
sudo apt install -y certbot python3-certbot-nginx
```

---

## 📥 STEP 3: Deploy Application

### 3.1 Create App Directory
```bash
sudo mkdir -p /var/www/havenwelfare
sudo chown -R havenwelfare:havenwelfare /var/www/havenwelfare
cd /var/www/havenwelfare
```

### 3.2 Clone Your Repository
```bash
git clone https://github.com/YOUR_USERNAME/havenwelfare.git .
```

Or upload via SCP:
```bash
# From your local machine:
scp -r /path/to/havenwelfare/* havenwelfare@YOUR_SERVER_IP:/var/www/havenwelfare/
```

### 3.3 Setup Backend
```bash
cd /var/www/havenwelfare/backend

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Create uploads directory
mkdir -p uploads
```

### 3.4 Configure Backend Environment
```bash
cat > /var/www/havenwelfare/backend/.env << 'EOF'
MONGO_URL=mongodb://localhost:27017/havenwelfare
DB_NAME=havenwelfare
JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-string
FRONTEND_URL=https://yourdomain.com
EOF
```

### 3.5 Setup Frontend
```bash
cd /var/www/havenwelfare/frontend

# Install dependencies
yarn install

# Create environment file
cat > .env << 'EOF'
REACT_APP_BACKEND_URL=https://yourdomain.com
EOF

# Build frontend
yarn build
```

---

## ⚙️ STEP 4: Configure Systemd Service for Backend

### 4.1 Create Service File
```bash
sudo nano /etc/systemd/system/havenwelfare-backend.service
```

Paste this content:
```ini
[Unit]
Description=HavenWelfare Backend API
After=network.target mongod.service

[Service]
User=havenwelfare
Group=havenwelfare
WorkingDirectory=/var/www/havenwelfare/backend
Environment="PATH=/var/www/havenwelfare/backend/venv/bin"
ExecStart=/var/www/havenwelfare/backend/venv/bin/uvicorn server:app --host 127.0.0.1 --port 8001
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

### 4.2 Start Backend Service
```bash
sudo systemctl daemon-reload
sudo systemctl start havenwelfare-backend
sudo systemctl enable havenwelfare-backend

# Check status
sudo systemctl status havenwelfare-backend
```

---

## 🌐 STEP 5: Configure Nginx

### 5.1 Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/havenwelfare
```

Paste this content (replace `yourdomain.com` with your actual domain):
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend - React static files
    root /var/www/havenwelfare/frontend/build;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # API requests - proxy to backend
    location /api/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 90;
        client_max_body_size 50M;
    }

    # Uploaded files
    location /uploads/ {
        alias /var/www/havenwelfare/backend/uploads/;
    }

    # React Router - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 5.2 Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/havenwelfare /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default site

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## 🔒 STEP 6: Setup SSL (HTTPS)

### 6.1 Get SSL Certificate
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts:
- Enter your email
- Agree to terms
- Choose to redirect HTTP to HTTPS (recommended)

### 6.2 Auto-Renewal
Certbot automatically sets up renewal. Test it:
```bash
sudo certbot renew --dry-run
```

---

## 🗄️ STEP 7: Secure MongoDB (Optional but Recommended)

### 7.1 Create Admin User
```bash
mongosh

# In MongoDB shell:
use admin
db.createUser({
  user: "havenwelfare_admin",
  pwd: "your_secure_password_here",
  roles: [{ role: "userAdminAnyDatabase", db: "admin" }, "readWriteAnyDatabase"]
})
exit
```

### 7.2 Enable Authentication
```bash
sudo nano /etc/mongod.conf
```

Add under `security:`:
```yaml
security:
  authorization: enabled
```

### 7.3 Restart MongoDB
```bash
sudo systemctl restart mongod
```

### 7.4 Update Backend .env
```bash
nano /var/www/havenwelfare/backend/.env
```

Update MONGO_URL:
```
MONGO_URL=mongodb://havenwelfare_admin:your_secure_password_here@localhost:27017/havenwelfare?authSource=admin
```

### 7.5 Restart Backend
```bash
sudo systemctl restart havenwelfare-backend
```

---

## ✅ STEP 8: Verify Deployment

### 8.1 Check All Services
```bash
# Check MongoDB
sudo systemctl status mongod

# Check Backend
sudo systemctl status havenwelfare-backend

# Check Nginx
sudo systemctl status nginx
```

### 8.2 Test API
```bash
curl http://localhost:8001/api/health
```

### 8.3 Test Website
Visit: `https://yourdomain.com`

### 8.4 Test Login
- Email: `brijesh.kr.dube@gmail.com`
- Password: `Haven@9874`

---

## 🔄 STEP 9: Update Deployment (Future Updates)

### 9.1 Pull Latest Code
```bash
cd /var/www/havenwelfare
git pull origin main
```

### 9.2 Update Backend
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart havenwelfare-backend
```

### 9.3 Update Frontend
```bash
cd /var/www/havenwelfare/frontend
yarn install
yarn build
```

---

## 📊 STEP 10: Monitoring & Logs

### View Backend Logs
```bash
sudo journalctl -u havenwelfare-backend -f
```

### View Nginx Access Logs
```bash
sudo tail -f /var/log/nginx/access.log
```

### View Nginx Error Logs
```bash
sudo tail -f /var/log/nginx/error.log
```

### View MongoDB Logs
```bash
sudo tail -f /var/log/mongodb/mongod.log
```

---

## 🔧 Troubleshooting

### Backend Won't Start?
```bash
# Check logs
sudo journalctl -u havenwelfare-backend -n 50

# Test manually
cd /var/www/havenwelfare/backend
source venv/bin/activate
uvicorn server:app --host 127.0.0.1 --port 8001
```

### 502 Bad Gateway?
- Backend might not be running
- Check: `sudo systemctl status havenwelfare-backend`
- Restart: `sudo systemctl restart havenwelfare-backend`

### MongoDB Connection Failed?
```bash
# Check MongoDB status
sudo systemctl status mongod

# Check if listening
sudo netstat -tlnp | grep 27017
```

### Permission Denied?
```bash
sudo chown -R havenwelfare:havenwelfare /var/www/havenwelfare
```

---

## 🛡️ Security Checklist

- [ ] UFW firewall enabled
- [ ] SSH key authentication (disable password auth)
- [ ] MongoDB authentication enabled
- [ ] SSL/HTTPS configured
- [ ] Strong JWT_SECRET set
- [ ] Regular system updates scheduled

### Disable Password Authentication (SSH)
```bash
sudo nano /etc/ssh/sshd_config
# Set: PasswordAuthentication no
sudo systemctl restart sshd
```

### Setup Automatic Updates
```bash
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## 🎉 Done!

Your HavenWelfare app is now live on your VPS!

**Your URLs:**
- Website: `https://yourdomain.com`
- API: `https://yourdomain.com/api/`

**Admin Login:**
- Email: `brijesh.kr.dube@gmail.com`
- Password: `Haven@9874`

---

## 📞 Quick Commands Reference

```bash
# Restart backend
sudo systemctl restart havenwelfare-backend

# Restart Nginx
sudo systemctl restart nginx

# View backend logs
sudo journalctl -u havenwelfare-backend -f

# Check all services
sudo systemctl status havenwelfare-backend mongod nginx
```
