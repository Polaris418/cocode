# CoCode VPS 部署脚本 (Windows PowerShell)
# 使用方法: .\deploy.ps1 -VpsIp "your-vps-ip" [-Domain "your-domain"]

param(
    [Parameter(Mandatory=$true)]
    [string]$VpsIp,
    
    [Parameter(Mandatory=$false)]
    [string]$Domain = ""
)

Write-Host "🚀 开始部署 CoCode 到 $VpsIp" -ForegroundColor Cyan

# 检查 SSH 是否可用
if (-not (Get-Command ssh -ErrorAction SilentlyContinue)) {
    Write-Host "❌ SSH 未找到，请安装 OpenSSH" -ForegroundColor Red
    exit 1
}

# 检查 SCP 是否可用
if (-not (Get-Command scp -ErrorAction SilentlyContinue)) {
    Write-Host "❌ SCP 未找到，请安装 OpenSSH" -ForegroundColor Red
    exit 1
}

$ProjectRoot = Split-Path -Parent $PSScriptRoot
if (-not $ProjectRoot) { $ProjectRoot = Get-Location }

Write-Host "📁 项目根目录: $ProjectRoot" -ForegroundColor Yellow

# Step 1: 创建远程目录
Write-Host "`n📁 创建远程目录..." -ForegroundColor Green
ssh root@$VpsIp "mkdir -p /var/www/cocode/{frontend,cocode-backend}"

# Step 2: 上传后端代码
Write-Host "`n📤 上传后端代码..." -ForegroundColor Green
scp -r "$ProjectRoot\cocode-backend\*" "root@${VpsIp}:/var/www/cocode/cocode-backend/"

# Step 3: 配置后端环境变量
Write-Host "`n⚙️ 配置后端环境变量..." -ForegroundColor Green
if ($Domain) {
    $Origins = "http://$VpsIp,https://$Domain,http://$Domain"
} else {
    $Origins = "http://$VpsIp"
}

$EnvContent = @"
PORT=1234
NODE_ENV=production
ALLOWED_ORIGINS=$Origins
"@

ssh root@$VpsIp "echo '$EnvContent' > /var/www/cocode/cocode-backend/.env"

# Step 4: 安装后端依赖并启动
Write-Host "`n📦 安装后端依赖并启动..." -ForegroundColor Green
$RemoteScript = @'
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
'@

ssh root@$VpsIp $RemoteScript

# Step 5: 构建前端
Write-Host "`n🔨 构建前端..." -ForegroundColor Green
Push-Location "$ProjectRoot\cocode-frontend"

# 备份原 .env.production
if (Test-Path ".env.production") {
    Copy-Item ".env.production" ".env.production.backup" -Force
}

# 创建新的 .env.production
if ($Domain) {
    $WsUrl = "wss://$Domain/ws"
} else {
    $WsUrl = "ws://${VpsIp}:1234"
}

@"
VITE_WS_URL=$WsUrl
VITE_PISTON_API_URL=https://emkc.org/api/v2/piston
"@ | Out-File -FilePath ".env.production" -Encoding utf8

# 构建
npm run build

Pop-Location

# Step 6: 上传前端构建文件
Write-Host "`n📤 上传前端构建文件..." -ForegroundColor Green
scp -r "$ProjectRoot\cocode-frontend\dist\*" "root@${VpsIp}:/var/www/cocode/frontend/"

# Step 7: 配置 Nginx
Write-Host "`n🌐 配置 Nginx..." -ForegroundColor Green

$ServerName = if ($Domain) { "$VpsIp $Domain" } else { $VpsIp }

$NginxConfig = @"
server {
    listen 80;
    server_name $ServerName;

    root /var/www/cocode/frontend;
    index index.html;

    location / {
        try_files \`$uri \`$uri/ /index.html;
    }

    location /ws {
        proxy_pass http://127.0.0.1:1234;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \`$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \`$host;
        proxy_set_header X-Real-IP \`$remote_addr;
        proxy_set_header X-Forwarded-For \`$proxy_add_x_forwarded_for;
        proxy_read_timeout 86400;
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
}
"@

# 写入配置并启用
ssh root@$VpsIp "echo '$NginxConfig' > /etc/nginx/sites-available/cocode"
ssh root@$VpsIp "ln -sf /etc/nginx/sites-available/cocode /etc/nginx/sites-enabled/"
ssh root@$VpsIp "rm -f /etc/nginx/sites-enabled/default"
ssh root@$VpsIp "nginx -t && systemctl reload nginx"

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "🎉 部署完成!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host "前端访问地址: http://$VpsIp" -ForegroundColor White
if ($Domain) {
    Write-Host "域名访问地址: http://$Domain" -ForegroundColor White
}
Write-Host "WebSocket 地址: $WsUrl" -ForegroundColor White
Write-Host ""
Write-Host "📝 后续步骤:" -ForegroundColor Yellow
Write-Host "1. 确保 VPS 防火墙开放端口 80 和 1234" -ForegroundColor White
Write-Host "2. 如果有域名，建议配置 SSL:" -ForegroundColor White
Write-Host "   ssh root@$VpsIp `"certbot --nginx -d $Domain`"" -ForegroundColor Gray
Write-Host "================================" -ForegroundColor Cyan
