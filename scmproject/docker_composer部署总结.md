## 项目总结

### 一、技术栈与环境

- **前端**：Vue 3 + Vite（构建工具）
- **后端**：Node.js + Express
- **数据库**：MariaDB（替代 MongoDB）
- **容器化**：Docker Compose（WSL 环境）
- **Web 服务器**：Nginx（托管前端静态文件）

### 二、项目结构

text

```
scmproject/
├── docker-compose.yml          # 编排文件
├── frontend/
│   ├── Dockerfile              # Vue 构建镜像（多阶段）
│   ├── package.json
│   └── ... (Vue 源码)
├── backend/
│   ├── Dockerfile              # Express 镜像
│   ├── package.json
│   └── ... (Express 源码)
└── db/
    └── init.sql                # MariaDB 初始化脚本
```

### 三、关键配置文件

#### 1. `docker-compose.yml`（核心）

- **服务**：`mariadb`、`backend`、`frontend`
- **网络**：自定义 `scm-network` 桥接网络，实现容器间通信
- **数据持久化**：`mariadb_data` 卷保存数据库文件
- **环境变量**：统一设置数据库连接、JWT 密钥等
- **端口映射**：
  - MariaDB: `3306:3306`
  - 后端: `5000:5000`
  - 前端: `80:80`（主机访问）

#### 2. `backend/Dockerfile`

dockerfile

```
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["node", "src/config/server.js"]
```

#### 3. `frontend/Dockerfile`（最终正确版本）

dockerfile

```
# 构建阶段：使用 Node 20（Vite 7 要求 ≥20.19）
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 生产阶段：Nginx 托管
FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 四、主要遇到的问题及解决方案

| 问题                                         | 原因                              | 解决                                   |
| -------------------------------------------- | --------------------------------- | -------------------------------------- |
| `npm ci` 失败                                | 缺少 `package-lock.json` 或不匹配 | 改用 `npm install`                     |
| 前端构建失败 `crypto.hash is not a function` | Node 18 不支持 Vite 7 所需 API    | 升级到 `node:20-alpine`                |
| Vite 要求 Node 版本 ≥20.19                   | Vite 7 的新要求                   | 明确使用 Node 20 镜像                  |
| Docker 缓存导致旧命令仍然执行                | 未清理构建缓存                    | 使用 `docker compose build --no-cache` |

### 五、常用运维命令

bash

```
# 首次构建并启动（清理缓存）
docker compose build --no-cache
docker compose up -d

# 查看日志
docker compose logs -f [服务名]

# 停止所有服务
docker compose down

# 停止并删除数据卷（重置数据库）
docker compose down -v

# 仅重建前端
docker compose build --no-cache frontend
docker compose up -d frontend
```

### 六、访问与测试

- **前端**：`http://localhost`（或映射的其他端口）
- **后端 API**：`http://localhost:5000`
- **数据库**：主机 `localhost:3306`，用户名 `scmuser`，密码 `scmpass`，数据库 `scmproject`

### 七、注意事项

1. 确保后端代码中**移除了所有 MongoDB 依赖**，只使用 MariaDB/MySQL 驱动（如 `mysql2`）。
2. 如果前端需要调用后端 API，在 Vue 代码中配置代理或使用环境变量 `VITE_API_BASE_URL`（Vite 环境变量以 `VITE_` 开头）。
3. 生产环境下，JWT 密钥等敏感信息应使用 Docker secrets 或 `.env` 文件管理，避免硬编码在 `docker-compose.yml` 中。
4. 若需修改环境变量，编辑 `docker-compose.yml` 后执行 `docker compose up -d` 即可生效。

------

您已成功在 WSL 中通过 Docker Compose 运行了完整的 Vue + Express + MariaDB 项目。后续可基于此模板继续开发或部署到生产环境。如有其他问题，欢迎随时交流！