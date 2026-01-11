#!/bin/bash

# HavenWelfare Ubuntu VPS Deployment Script
# Run as root: sudo bash deploy.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  HavenWelfare Deployment Script${NC}"
echo -e "${GREEN}========================================${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run as root (sudo bash deploy.sh)${NC}"
    exit 1
fi

# Get configuration from user
read -p "Enter your domain name (e.g., havenwelfare.com): " DOMAIN
read -p "Enter your email (for SSL certificate): " EMAIL
read -p "Enter a secure JWT secret key: " JWT_SECRET
read -p "Enter GitHub repository URL: " GITHUB_REPO

echo -e "\n${YELLOW}Configuration:${NC}"
echo "Domain: $DOMAIN"
echo "Email: $EMAIL"
echo "GitHub: $GITHUB_REPO"
read -p "Is this correct? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ]; then
    echo "Aborted."
    exit 1
fi

echo -e "\n${GREEN}[1/8] Updating system...${NC}"
apt update && apt upgrade -y

echo -e "\n${GREEN}[2/8] Installing dependencies...${NC}"
apt install -y software-properties-common curl git nginx certbot python3-certbot-nginx

# Install Python 3.11
add-apt-repository -y ppa:deadsnakes/ppa
apt update
apt install -y python3.11 python3.11-venv python3.11-dev python3-pip

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g yarn

echo -e "\n${GREEN}[3/8] Installing MongoDB...${NC}"
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt update
apt install -y mongodb-org
systemctl start mongod
systemctl enable mongod

echo -e "\n${GREEN}[4/8] Creating application user...${NC}"
if ! id "havenwelfare" &>/dev/null; then
    useradd -m -s /bin/bash havenwelfare
fi

echo -e "\n${GREEN}[5/8] Cloning repository...${NC}"
mkdir -p /var/www/havenwelfare
cd /var/www/havenwelfare
if [ -d ".git" ]; then
    git pull origin main
else
    git clone $GITHUB_REPO .
fi
chown -R havenwelfare:havenwelfare /var/www/havenwelfare

echo -e "\n${GREEN}[6/8] Setting up backend...${NC}"
cd /var/www/havenwelfare/backend

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
MONGO_URL=mongodb://localhost:27017/havenwelfare
DB_NAME=havenwelfare
JWT_SECRET=$JWT_SECRET
FRONTEND_URL=https://$DOMAIN
EOF

# Create uploads directory
mkdir -p uploads
chown -R havenwelfare:havenwelfare /var/www/havenwelfare

# Create systemd service
cat > /etc/systemd/system/havenwelfare-backend.service << EOF
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
EOF

systemctl daemon-reload
systemctl start havenwelfare-backend
systemctl enable havenwelfare-backend

echo -e "\n${GREEN}[7/8] Setting up frontend...${NC}"
cd /var/www/havenwelfare/frontend

# Create .env file
cat > .env << EOF
REACT_APP_BACKEND_URL=https://$DOMAIN
EOF

# Install dependencies and build
yarn install
yarn build

echo -e "\n${GREEN}[8/8] Configuring Nginx...${NC}"
cat > /etc/nginx/sites-available/havenwelfare << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    root /var/www/havenwelfare/frontend/build;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    location /api/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 90;
        client_max_body_size 50M;
    }

    location /uploads/ {
        alias /var/www/havenwelfare/backend/uploads/;
    }

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

ln -sf /etc/nginx/sites-available/havenwelfare /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

# Setup firewall
ufw allow 'Nginx Full'
ufw allow OpenSSH
echo "y" | ufw enable

echo -e "\n${GREEN}[BONUS] Setting up SSL...${NC}"
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos -m $EMAIL --redirect

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete! 🎉${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\nYour website is now live at: ${YELLOW}https://$DOMAIN${NC}"
echo -e "\nAdmin Login:"
echo -e "  Email: brijesh.kr.dube@gmail.com"
echo -e "  Password: Haven@9874"
echo -e "\n${YELLOW}Quick Commands:${NC}"
echo "  sudo systemctl status havenwelfare-backend  # Check backend"
echo "  sudo journalctl -u havenwelfare-backend -f  # View logs"
echo "  sudo systemctl restart havenwelfare-backend # Restart backend"
