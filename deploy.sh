#!/bin/bash
# CoCode VPS 自动部署脚本
# 使用方法: ./deploy.sh your-vps-ip [your-domain]

set -e

VPS_IP=${1:-""}
DOMAIN=${2:-""}

if [ -z "$VPS_IP" ]; then
    echo "❌ 请提供 VPS IP 地址"
    echo "使用方法: ./deploy.sh your-vps-ip [your-domain]"
    exit 1
fi

echo "🚀 开始部署 CoCode 到 $VPS_IP"

# 创建远程目录
echo "📁 创建远程目录..."
ssh root@$VPS_IP "mkdir -p /var/www/cocode/{frontend,cocode-backend}"

# 上传后端代码
echo "📤 上传后端代码..."
scp -r cocode-backend/* root@$VPS_IP:/var/www/cocode/cocode-backend/

# 创建后端环境变量
echo "⚙️ 配置后端环境变量..."
if [ -n "$DOMAIN" ]; then
    ORIGINS="http://$VPS_IP,https://$DOMAIN,http://$DOMAIN"
else
    ORIGINS="http://$VPS_IP"
fi

ssh root@$VPS_IP "cat > /var/www/cocode/cocode-backend/.env << EOF
PORT=1234
NODE_ENV=production
ALLOWED_ORIGINS=$ORIGINS
EOF"

# 在远程服务器上安装依赖和启动
echo "📦 安装后端依赖并启动..."
ssh root@$VPS_IP << 'REMOTE_SCRIPT'
cd /var/www/cocode/cocode-backend
npm install

# 检查 PM2 是否安装
if ! command -v pm2 &> /dev/null; then
    echo "安装 PM2..."
    npm install -g pm2
fi

# 停止旧实例（如果存在）
pm2 delete cocode-backend 2>/dev/null || true

# 启动新实例
pm2 start src/server.js --name cocode-backend
pm2 save
pm2 startup | tail -1 | bash || true

echo "✅ 后端部署完成"
REMOTE_SCRIPT

# 构建前端
echo "🔨 构建前端..."
cd cocode-frontend

# 备份原 .env.production
cp .env.production .env.production.backup 2>/dev/null || true

# 创建新的 .env.production
if [ -n "$DOMAIN" ]; then
    echo "VITE_WS_URL=wss://$DOMAIN/ws" > .env.production
else
    echo "VITE_WS_URL=ws://$VPS_IP:1234" > .env.production
fi
echo "VITE_PISTON_API_URL=https://emkc.org/api/v2/piston" >> .env.production

npm run build

# 上传前端构建文件
echo "📤 上传前端构建文件..."
scp -r dist/* root@$VPS_IP:/var/www/cocode/frontend/

cd ..

# 配置 Nginx
echo "🌐 配置 Nginx..."
ssh root@$VPS_IP "cat > /etc/nginx/sites-available/cocode << EOF
server {
    listen 80;
    server_name $VPS_IP ${DOMAIN:-""};

    root /var/www/cocode/frontend;
    index index.html;

    location / {
        try_files \\\$uri \\\$uri/ /index.html;
    }

    location /ws {
        proxy_pass http://127.0.0.1:1234;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\\$http_upgrade;
        proxy_set_header Connection \"upgrade\";
        proxy_set_header Host \\\$host;
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
        proxy_read_timeout 86400;
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
}
EOF"

ssh root@$VPS_IP << 'REMOTE_NGINX'
ln -sf /etc/nginx/sites-available/cocode /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
echo "✅ Nginx 配置完成"
REMOTE_NGINX

echo ""
echo "🎉 部署完成!"
echo "================================"
echo "前端访问地址: http://$VPS_IP"
if [ -n "$DOMAIN" ]; then
    echo "域名访问地址: http://$DOMAIN"
fi
echo "WebSocket 地址: ws://$VPS_IP:1234"
echo ""
echo "📝 后续步骤:"
echo "1. 确保防火墙开放端口 80 和 1234"
echo "2. 如果有域名，建议配置 SSL (运行 certbot --nginx)"
echo "================================"
