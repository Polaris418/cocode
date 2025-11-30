# 🚀 CoCode VPS 部署指南

这是一个将 CoCode 部署到 LA VPS 服务器的完整指南。

## 📋 前提条件

- 一台 VPS 服务器（Ubuntu 20.04/22.04 推荐）
- SSH 访问权限
- 域名（可选，但推荐用于 HTTPS）
- Node.js 18+ 

## 🔧 第一步：服务器初始化

### 1.1 SSH 连接到服务器

```bash
ssh root@your-vps-ip
```

### 1.2 更新系统并安装依赖

```bash
# 更新系统
apt update && apt upgrade -y

# 安装 Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# 验证安装
node -v  # 应显示 v18.x.x
npm -v

# 安装 PM2（进程管理器）
npm install -g pm2

# 安装 Nginx（反向代理）
apt install -y nginx

# 安装 Git
apt install -y git
```

## 📦 第二步：部署后端（WebSocket 服务器）

### 2.1 创建应用目录并上传代码

```bash
# 创建应用目录
mkdir -p /var/www/cocode
cd /var/www/cocode

# 方式一：从 Git 克隆（如果你有 Git 仓库）
# git clone your-repo-url .

# 方式二：使用 SCP 上传（从本地机器执行）
# scp -r cocode-backend root@your-vps-ip:/var/www/cocode/
# scp -r cocode-frontend root@your-vps-ip:/var/www/cocode/
```

### 2.2 安装后端依赖

```bash
cd /var/www/cocode/cocode-backend
npm install
```

### 2.3 创建后端环境变量文件

```bash
cat > /var/www/cocode/cocode-backend/.env << 'EOF'
PORT=1234
NODE_ENV=production
# 允许的前端来源（用逗号分隔）
# 如果有域名，添加 https://yourdomain.com
ALLOWED_ORIGINS=http://your-vps-ip,https://yourdomain.com
EOF
```

### 2.4 使用 PM2 启动后端

```bash
cd /var/www/cocode/cocode-backend
pm2 start src/server.js --name cocode-backend
pm2 save
pm2 startup  # 设置开机自启
```

验证后端运行:
```bash
pm2 status
pm2 logs cocode-backend
```

## 🎨 第三步：构建并部署前端

### 3.1 在本地构建前端

在你的本地开发机器上：

```powershell
cd cocode-frontend

# 修改 .env.production 文件，设置你的 VPS IP 或域名
# 编辑内容见下方

# 构建生产版本
npm run build
```

### 3.2 修改 `.env.production`

```env
# 如果没有域名，使用 IP（注意：ws:// 不是 wss://）
VITE_WS_URL=ws://your-vps-ip:1234

# 如果有域名并配置了 SSL，使用 wss://
# VITE_WS_URL=wss://yourdomain.com/ws

# Piston API（代码执行）
VITE_PISTON_API_URL=https://emkc.org/api/v2/piston
```

### 3.3 上传前端构建文件到 VPS

```powershell
# 从本地执行 SCP 上传
scp -r dist/* root@your-vps-ip:/var/www/cocode/frontend/
```

或在 VPS 上：
```bash
mkdir -p /var/www/cocode/frontend
# 然后上传 dist 目录的内容到这里
```

## 🌐 第四步：配置 Nginx

### 4.1 创建 Nginx 配置文件

```bash
cat > /etc/nginx/sites-available/cocode << 'EOF'
# 前端静态文件服务
server {
    listen 80;
    server_name your-vps-ip;  # 替换为你的 IP 或域名

    # 前端静态文件
    root /var/www/cocode/frontend;
    index index.html;

    # 处理 SPA 路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 启用 gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
}

# WebSocket 代理（可选，如果你想通过 80 端口访问 WebSocket）
server {
    listen 80;
    server_name ws.your-vps-ip;  # 或使用 ws 子域名

    location / {
        proxy_pass http://127.0.0.1:1234;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 86400;
    }
}
EOF
```

### 4.2 启用配置

```bash
# 创建软链接
ln -s /etc/nginx/sites-available/cocode /etc/nginx/sites-enabled/

# 删除默认配置（可选）
rm /etc/nginx/sites-enabled/default

# 测试配置
nginx -t

# 重载 Nginx
systemctl reload nginx
```

## 🔥 第五步：配置防火墙

```bash
# 使用 UFW
ufw allow 22/tcp     # SSH
ufw allow 80/tcp     # HTTP
ufw allow 443/tcp    # HTTPS（如果使用 SSL）
ufw allow 1234/tcp   # WebSocket 直接访问（如果不使用 Nginx 代理）
ufw enable
ufw status
```

## 🔒 第六步（可选）：配置 HTTPS/SSL

如果你有域名，强烈建议配置 SSL：

```bash
# 安装 Certbot
apt install -y certbot python3-certbot-nginx

# 获取证书（替换 yourdomain.com）
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 证书会自动续期，可以测试：
certbot renew --dry-run
```

配置 SSL 后，更新前端的 `.env.production`：
```env
VITE_WS_URL=wss://yourdomain.com/ws
```

并更新 Nginx 配置以支持 WSS。

## ✅ 第七步：验证部署

### 7.1 检查服务状态

```bash
# 检查 PM2
pm2 status

# 检查 Nginx
systemctl status nginx

# 查看后端日志
pm2 logs cocode-backend
```

### 7.2 测试访问

1. **访问前端**: 打开浏览器，访问 `http://your-vps-ip`
2. **检查 WebSocket**: 打开浏览器控制台，确认没有 WebSocket 连接错误
3. **测试协作**: 在两个浏览器标签打开同一个房间 URL，测试实时同步

## 🔧 常见问题排查

### WebSocket 连接失败

```bash
# 检查后端是否运行
pm2 status
pm2 logs cocode-backend

# 检查端口是否监听
netstat -tlnp | grep 1234

# 检查防火墙
ufw status
```

### Nginx 502 错误

```bash
# 检查 Nginx 错误日志
tail -f /var/log/nginx/error.log

# 检查后端是否运行
pm2 status
```

### 前端加载但无法连接

1. 检查浏览器控制台的 WebSocket 错误
2. 确认 `.env.production` 中的 `VITE_WS_URL` 正确
3. 确认防火墙允许 WebSocket 端口

## 📊 监控和维护

```bash
# 查看实时日志
pm2 logs cocode-backend --lines 100

# 查看服务器资源使用
pm2 monit

# 重启服务
pm2 restart cocode-backend

# 更新代码后重新部署
cd /var/www/cocode/cocode-backend
git pull  # 如果使用 git
npm install
pm2 restart cocode-backend
```

## 🚀 快速命令参考

```bash
# 启动所有服务
pm2 start all && systemctl start nginx

# 停止所有服务  
pm2 stop all && systemctl stop nginx

# 重启所有服务
pm2 restart all && systemctl restart nginx

# 查看状态
pm2 status && systemctl status nginx
```

---

## 📝 部署清单

- [ ] VPS 已准备好（Ubuntu 20.04/22.04）
- [ ] 已安装 Node.js 18+
- [ ] 已安装 PM2
- [ ] 已安装 Nginx
- [ ] 已上传后端代码
- [ ] 已配置后端环境变量
- [ ] 后端通过 PM2 运行
- [ ] 已构建前端（使用正确的 .env.production）
- [ ] 已上传前端到 /var/www/cocode/frontend
- [ ] 已配置 Nginx
- [ ] 已配置防火墙
- [ ] 已测试访问和协作功能
- [ ] （可选）已配置 SSL

祝部署顺利！🎉
