# Deploy lên server bằng GitHub (pull + Docker Compose)

> Mặc định hướng dẫn dùng mô hình: **GitHub Actions -> SSH -> server pull repo -> chạy `docker compose up -d --build`**.

---

## Deploy lên máy dev trước

Khuyến nghị deploy lên máy dev để kiểm tra trước khi lên production.

### Cách 1: Deploy thủ công (nhanh, không cần GitHub Actions)

Trên máy dev (hoặc SSH vào máy dev):

```bash
# 1. Cài Docker nếu chưa có
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker "$USER"
# Đăng xuất / đăng nhập lại để áp dụng docker group

# 2. Tạo thư mục (dùng path riêng cho dev)
sudo mkdir -p /opt/mrthue-dev
sudo chown -R "$USER":"$USER" /opt/mrthue-dev
cd /opt/mrthue-dev

# 3. Clone repo
git clone "https://github.com/<YOUR_GITHUB_USER>/<YOUR_REPO>.git" .

# 4. Tạo backend/.env (thay <DEV_IP> = IP hoặc domain máy dev)
cat > backend/.env << 'EOF'
APP_NAME=MrThue API
APP_ENV=dev
APP_HOST=0.0.0.0
APP_PORT=8000
DATABASE_URL=mysql+pymysql://mrthue:mrthue_password@mysql:3306/mrthue
FRONTEND_ORIGIN=http://<DEV_IP>:3000
ADMIN_API_KEY=<CHUOI_BAT_KY_DEV>
JWT_SECRET_KEY=<JWT_SECRET_DEV_KHAC_PROD>
JWT_EXPIRE_MINUTES=10080
EOF

# 5. Build và chạy (NEXT_PUBLIC_API_BASE_URL = URL API mà trình duyệt gọi, thường :8000)
export NEXT_PUBLIC_API_BASE_URL="http://<DEV_IP>:8000"
export BACKEND_URL="http://backend:8000"
export MRTHUE_ADMIN_KEY="<CHUOI_BAT_KY_DEV>"
docker compose up -d --build

# 6. Truy cập: Frontend http://<DEV_IP>:3000 — Backend API http://<DEV_IP>:8000
# 7. Kiểm tra
curl -sSf http://localhost:8000/health
curl -sSf http://localhost:3000/
```

**Quan trọng:** Trước bước 5, mở `backend/.env` và thay `<DEV_IP>`, `<CHUOI_BAT_KY_DEV>`, `<JWT_SECRET_DEV_KHAC_PROD>` bằng giá trị thật.

**Cập nhật sau mỗi lần sửa code:**

```bash
cd /opt/mrthue-dev
git pull origin main
export NEXT_PUBLIC_API_BASE_URL="http://<DEV_IP>:8000"
export BACKEND_URL="http://backend:8000"
export MRTHUE_ADMIN_KEY="<CHUOI_BAT_KY_DEV>"
docker compose up -d --build
```

(Thay `<DEV_IP>` bằng IP thật của máy dev, ví dụ `192.168.1.50`.)

> **Lưu ý:** `DATABASE_URL` dùng `mysql:3306` vì Docker Compose khởi chạy container MySQL nội bộ. Nếu máy dev đã chạy MySQL sẵn và muốn dùng, cần chỉnh `docker-compose.yml` (bỏ service mysql, trỏ `DATABASE_URL` sang host).

### Cách 2: GitHub Actions deploy branch `dev` lên máy dev

Tạo secrets riêng cho dev: `SSH_HOST_DEV`, `SSH_USER_DEV`, `SSH_PRIVATE_KEY_DEV`, `DEPLOY_PATH_DEV=/opt/mrthue-dev`, v.v.

Workflow trigger `push` branch `dev` → SSH vào máy dev → pull → `docker compose up -d --build`.

Có thể mở rộng `/.github/workflows/deploy.yml` với job `deploy-dev` chạy khi push `dev`.

---

## 1) Chuẩn bị GitHub repo (trên máy local của bạn)

```bash
cd "/Users/brianho/Documents/Programming/MrThue"
git init
git add -A
git commit -m "chore: initial deploy version"
git branch -M main
git remote add origin "https://github.com/<YOUR_GITHUB_USER>/<YOUR_REPO>.git"
git push -u origin main
```

## 2) Chuẩn bị server (VPS/VM) có SSH

### Cài Docker + Docker Compose plugin

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker "$USER"
docker --version
docker compose version
```

### Tạo thư mục deploy

```bash
sudo mkdir -p /opt/mrthue
sudo chown -R "$USER":"$USER" /opt/mrthue
```

## 3) Tạo GitHub Secrets

Trong GitHub repo -> `Settings` -> `Secrets and variables` -> `Actions` -> `New repository secret`, tạo các biến:

```text
SSH_HOST
SSH_USER
SSH_PRIVATE_KEY
DEPLOY_PATH=/opt/mrthue
BACKEND_ADMIN_API_KEY
BACKEND_JWT_SECRET_KEY
BACKEND_JWT_EXPIRE_MINUTES (optional, ví dụ 10080)
FRONTEND_NEXT_PUBLIC_API_BASE_URL (optional, ví dụ https://mrthue.com hoặc http://<SERVER_IP>)
```

## 4) Tạo GitHub Actions workflow

Tạo file:
`/.github/workflows/deploy.yml`

Nội dung (chỉ là template lệnh):

```yaml
name: deploy
on:
  push:
    branches: [ "main" ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy via SSH
        uses: webfactory/ssh-agent@v0.9.0
        with:
          ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}
      - name: Run remote commands
        env:
          DEPLOY_PATH: ${{ secrets.DEPLOY_PATH }}
          SSH_HOST: ${{ secrets.SSH_HOST }}
          SSH_USER: ${{ secrets.SSH_USER }}
          BACKEND_ADMIN_API_KEY: ${{ secrets.BACKEND_ADMIN_API_KEY }}
          BACKEND_JWT_SECRET_KEY: ${{ secrets.BACKEND_JWT_SECRET_KEY }}
          BACKEND_JWT_EXPIRE_MINUTES: ${{ secrets.BACKEND_JWT_EXPIRE_MINUTES || '10080' }}
          NEXT_PUBLIC_API_BASE_URL: ${{ secrets.FRONTEND_NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000' }}
        run: |
          ssh -o StrictHostKeyChecking=no "$SSH_USER@$SSH_HOST" "\
            set -euo pipefail; \
            cd \"$DEPLOY_PATH\" || mkdir -p \"$DEPLOY_PATH\"; \
            if [ ! -d .git ]; then \
              git clone \"https://github.com/${{ github.repository }}.git\" \"$DEPLOY_PATH\"; \
            fi; \
            cd \"$DEPLOY_PATH\"; \
            git fetch --all; \
            git checkout main || true; \
            git pull origin main; \
cat > backend/.env <<'EOF'\n\
APP_NAME=MrThue API\n\
APP_ENV=prod\n\
APP_HOST=0.0.0.0\n\
APP_PORT=8000\n\
DATABASE_URL=mysql+pymysql://mrthue:mrthue_password@mysql:3306/mrthue\n\
FRONTEND_ORIGIN=${NEXT_PUBLIC_API_BASE_URL}\n\
ADMIN_API_KEY=$BACKEND_ADMIN_API_KEY\n\
JWT_SECRET_KEY=$BACKEND_JWT_SECRET_KEY\n\
JWT_EXPIRE_MINUTES=$BACKEND_JWT_EXPIRE_MINUTES\n\
EOF\n\
            # Env cho docker-compose (để Dockerfile build đúng NEXT_PUBLIC_API_BASE_URL)\n\
            export NEXT_PUBLIC_API_BASE_URL=\"${NEXT_PUBLIC_API_BASE_URL}\"; \
            export BACKEND_URL=\"http://backend:8000\"; \
            export MRTHUE_ADMIN_KEY=\"$BACKEND_ADMIN_API_KEY\"; \
            docker compose up -d --build; \
          "
```

## 5) Kiểm tra sau deploy

```bash
# Backend
curl -sSf http://localhost:8000/health

# Frontend
curl -sSf http://localhost:3000/
```

## 6) Lưu ý quan trọng

```text
- Không commit các file chứa secret (ví dụ backend/.env) lên GitHub.
- Docker Compose đã được chỉnh để:
  - không map port MySQL ra host (giảm xung đột với MySQL host/Ubuntu đã chạy sẵn)
  - dùng `backend/.env` thay vì `.env.example` để lấy secrets
- Trong template workflow trên, mình tạo `backend/.env` để bạn có chỗ chứa secret.
```

## 7) (Khuyến nghị) Cấu hình Nginx reverse proxy

Nếu bạn muốn truy cập bằng domain và không phụ thuộc cổng `3000/8000`, dùng Nginx để proxy:

1. Tạo file config:

```bash
sudo nano /etc/nginx/sites-available/mrthue.conf
```

2. Dán template:

```nginx
server {
  listen 80;
  server_name <YOUR_DOMAIN>;

  client_max_body_size 20m;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location /api/ {
    proxy_pass http://127.0.0.1:8000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

3. Kích hoạt & reload:

```bash
sudo ln -s /etc/nginx/sites-available/mrthue.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

4. Khi dùng domain, đảm bảo:
- `FRONTEND_NEXT_PUBLIC_API_BASE_URL` trong GitHub Secrets = `http(s)://<YOUR_DOMAIN>`
- `backend/.env` sinh ra từ workflow sẽ set `FRONTEND_ORIGIN` đúng domain đó.

