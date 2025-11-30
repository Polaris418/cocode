# 🔒 CoCode 安全部署指南

## ⚠️ 部署前必读

### 已修复的安全问题

1. **✅ 连接速率限制** - 每个 IP 最多 10 个连接
2. **✅ Origin 验证** - 生产环境只允许指定域名
3. **✅ 房间名清理** - 防止目录遍历攻击
4. **✅ 错误处理** - 完善的错误日志

---

## 🚀 部署步骤

### 1. 服务器准备

```bash
# 安装 Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PM2
sudo npm install -g pm2

# 安装 Nginx
sudo apt-get install -y nginx

# 安装 Certbot (SSL证书)
sudo apt-get install -y certbot python3-certbot-nginx
```

### 2. 克隆项目

```bash
cd /var/www
git clone your-repo-url cocode
cd cocode
```

### 3. 配置环境变量

**后端 (`cocode-backend/.env`)**:
```env
NODE_ENV=production
PORT=1234
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

**前端 (`cocode-frontend/.env.production`)**:
```env
VITE_WS_URL=wss://yourdomain.com/ws
VITE_PISTON_API_URL=https://emkc.org/api/v2/piston
```

### 4. 构建前端

```bash
cd cocode-frontend
npm install
npm run build
# 构建产物在 dist/ 目录
```

### 5. 启动后端

```bash
cd cocode-backend
npm install

# 使用 PM2 启动
pm2 start ../ecosystem.config.cjs --env production
pm2 save
pm2 startup
```

### 6. 配置 Nginx

```bash
# 复制配置文件
sudo cp nginx.conf.example /etc/nginx/sites-available/cocode

# 编辑配置，替换 yourdomain.com 为你的域名
sudo nano /etc/nginx/sites-available/cocode

# 启用站点
sudo ln -s /etc/nginx/sites-available/cocode /etc/nginx/sites-enabled/

# 复制前端构建文件
sudo mkdir -p /var/www/cocode/dist
sudo cp -r cocode-frontend/dist/* /var/www/cocode/dist/

# 测试 Nginx 配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 7. 配置 SSL 证书

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 🔐 安全检查清单

- [ ] 更新 `ALLOWED_ORIGINS` 为你的实际域名
- [ ] 更新 `VITE_WS_URL` 为 `wss://` 开头的 WebSocket 地址
- [ ] 确保防火墙只开放 80, 443 端口
- [ ] 确保后端端口 1234 **不对外开放**（通过 Nginx 代理访问）
- [ ] 配置 SSL 证书
- [ ] 设置自动备份
- [ ] 监控服务器资源使用

---

## 🛡️ 防火墙配置

```bash
# 只允许 HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp  # SSH
sudo ufw enable

# 确保 1234 端口不对外开放（只允许本地）
# 默认 ufw deny incoming，所以不需要额外操作
```

---

## 📊 监控命令

```bash
# 查看后端状态
pm2 status
pm2 logs cocode-backend

# 查看 Nginx 日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# 重启服务
pm2 restart cocode-backend
sudo systemctl restart nginx
```

---

## ⚡ 性能优化

### 1. 内存限制
PM2 配置已设置 500MB 内存限制自动重启

### 2. 启用 Gzip
Nginx 配置已包含 Gzip 压缩

### 3. 静态资源缓存
Nginx 配置已设置静态资源 1 年缓存

---

## 🆘 故障排除

### WebSocket 连接失败
1. 检查 Nginx WebSocket 代理配置
2. 确认 `wss://` URL 正确
3. 查看后端日志：`pm2 logs cocode-backend`

### 502 Bad Gateway
1. 检查后端是否运行：`pm2 status`
2. 重启后端：`pm2 restart cocode-backend`

### SSL 证书问题
1. 检查证书是否过期：`sudo certbot certificates`
2. 更新证书：`sudo certbot renew`
