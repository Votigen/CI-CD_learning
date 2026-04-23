# API 文档

## 基础信息

- 基础 URL: `/api`
- 认证方式: JWT (Bearer Token)，除登录和注册接口外均需在请求头携带 `Authorization: Bearer {token}`

## 认证接口

### 登录
- **URL**: `/login/login`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "phone": "13800138000",
    "password": "password123"
  }
  ```
- **成功响应** (200):
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

## 用户接口

### 注册用户
- **URL**: `/users/register`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "username": "testuser",
    "phone": "13800138000",
    "password": "password123"
  }
  ```
- **成功响应** (201):
  ```json
  {
    "success": true,
    "message": "用户注册成功",
    "data": {
      "userId": 1,
      "username": "testuser",
      "phone": "13800138000",
      "role": "user"
    }
  }
  ```

### 获取所有用户
- **URL**: `/users/users`
- **方法**: `GET`
- **权限**: 需要认证
- **成功响应** (200):
  ```json
  [
    {
      "uid": 1,
      "username": "testuser",
      "phone": "13800138000",
      "avatar_url": "url",
      "company": "公司名",
      "bio": "个人简介",
      "role": "user"
    }
  ]
  ```

### 获取所有用户（排除当前用户）
- **URL**: `/users/users2`
- **方法**: `GET`
- **权限**: 需要认证
- **成功响应** (200):
  ```json
  {
    "success": true,
    "data": [...],
    "count": 10
  }
  ```

### 获取用户详情
- **URL**: `/users/users/:id`
- **方法**: `GET`
- **权限**: 需要认证
- **成功响应** (200):
  ```json
  {
    "uid": 1,
    "username": "testuser",
    "phone": "13800138000",
    "avatar_url": "url",
    "company": "公司名",
    "bio": "个人简介",
    "role": "user"
  }
  ```

### 获取用户公开信息
- **URL**: `/users/public/:id`
- **方法**: `GET`
- **权限**: 需要认证
- **成功响应** (200):
  ```json
  {
    "uid": 1,
    "username": "testuser",
    "phone": "13800138000",
    "company": "公司名",
    "bio": "个人简介"
  }
  ```

### 更新用户
- **URL**: `/users/users/:id`
- **方法**: `PUT`
- **权限**: 需要认证
- **请求体**:
  ```json
  {
    "username": "newname",
    "phone": "13900139000",
    "avatar_url": "newurl",
    "bio": "新简介",
    "company": "新公司"
  }
  ```
- **成功响应** (200):
  ```json
  {
    "uid": 1,
    "username": "newname",
    "phone": "13900139000",
    "avatar_url": "newurl",
    "bio": "新简介",
    "company": "新公司"
  }
  ```

### 删除用户
- **URL**: `/users/users/:id`
- **方法**: `DELETE`
- **权限**: 需要认证
- **成功响应** (204): 无内容

## 联系人接口

### 获取联系人列表
- **URL**: `/contacts/contacts`
- **方法**: `GET`
- **权限**: 需要认证
- **成功响应** (200):
  ```json
  {
    "success": true,
    "data": [
      {
        "uid": 2,
        "username": "contact1",
        "avatar_url": "url",
        "company": "公司名",
        "bio": "简介",
        "created_at": "2023-01-01T00:00:00.000Z"
      }
    ],
    "count": 1
  }
  ```

### 添加联系人
- **URL**: `/contacts/contacts`
- **方法**: `POST`
- **权限**: 需要认证
- **请求体**:
  ```json
  {
    "contact_id": 2
  }
  ```
- **成功响应** (201):
  ```json
  {
    "success": true,
    "message": "联系人添加成功",
    "data": {...}
  }
  ```

## 产品详情接口

### 创建产品详情
- **URL**: `/product-details/product-details`
- **方法**: `POST`
- **权限**: 需要认证
- **请求体**:
  ```json
  {
    "product_id": "P123",
    "order_id": "O456",
    "quantity": 10,
    "reference_price": 100,
    "cost_price": 80
  }
  ```
- **成功响应** (201):
  ```json
  {
    "id": 1,
    "product_id": "P123",
    "order_id": "O456",
    "quantity": 10,
    "reference_price": 100,
    "cost_price": 80
  }
  ```

### 获取产品详情
- **URL**: `/product-details/product-details/:id`
- **方法**: `GET`
- **权限**: 需要认证
- **成功响应** (200):
  ```json
  {
    "detail_id": 1,
    "product_id": "P123",
    "order_id": "O456",
    "quantity": 10,
    "reference_price": 100,
    "cost_price": 80
  }
  ```

### 更新产品详情
- **URL**: `/product-details/product-details/:id`
- **方法**: `PUT`
- **权限**: 需要认证
- **请求体**: 同创建接口
- **成功响应** (200):
  ```json
  {
    "message": "产品详情更新成功"
  }
  ```

### 删除产品详情
- **URL**: `/product-details/product-details/:id`
- **方法**: `DELETE`
- **权限**: 需要认证
- **成功响应** (200):
  ```json
  {
    "message": "产品详情删除成功"
  }
  ```

## 库存接口

### 创建库存
- **URL**: `/inventory/inventory`
- **方法**: `POST`
- **权限**: 需要认证
- **请求体**:
  ```json
  {
    "product_id": "P123",
    "product_name": "产品名",
    "quantity": 100,
    "alert_threshold": 20,
    "company": "公司名"
  }
  ```
- **成功响应** (201):
  ```json
  {
    "product_id": "P123",
    "product_name": "产品名",
    "quantity": 100,
    "alert_threshold": 20,
    "company": "公司名"
  }
  ```

### 获取所有库存
- **URL**: `/inventory/inventory`
- **方法**: `GET`
- **权限**: 需要认证
- **成功响应** (200):
  ```json
  {
    "message": "获取库存列表成功",
    "data": [...]
  }
  ```

### 获取库存详情
- **URL**: `/inventory/inventory/:id`
- **方法**: `GET`
- **权限**: 需要认证
- **成功响应** (200):
  ```json
  {
    "message": "获取库存详情成功",
    "data": {...}
  }
  ```

### 更新库存
- **URL**: `/inventory/inventory/:id`
- **方法**: `PUT`
- **权限**: 需要认证
- **请求体**:
  ```json
  {
    "product_name": "新名称",
    "quantity": 150,
    "alert_threshold": 30
  }
  ```
- **成功响应** (200):
  ```json
  {
    "message": "更新库存成功",
    "data": {...}
  }
  ```

### 删除库存
- **URL**: `/inventory/inventory/:id`
- **方法**: `DELETE`
- **权限**: 需要认证
- **成功响应** (200):
  ```json
  {
    "message": "删除库存成功"
  }
  ```

## 订单接口

### 创建订单
- **URL**: `/orders/orders`
- **方法**: `POST`
- **权限**: 需要认证
- **请求体**: 订单相关信息
- **成功响应** (201): 订单详情

### 获取订单详情
- **URL**: `/orders/orders/:id`
- **方法**: `GET`
- **权限**: 需要认证
- **成功响应** (200): 订单详情

### 获取订单详情(带计算)
- **URL**: `/orders/orderss/:id`
- **方法**: `GET`
- **权限**: 需要认证
- **成功响应** (200): 带计算的订单详情

### 获取我的购买订单
- **URL**: `/orders/buy`
- **方法**: `GET`
- **权限**: 需要认证
- **成功响应** (200): 订单列表

### 更新订单
- **URL**: `/orders/orders/:id`
- **方法**: `PUT`
- **权限**: 需要认证
- **请求体**: 订单更新信息
- **成功响应** (200): 更新结果

### 删除订单
- **URL**: `/orders/orders/:id`
- **方法**: `DELETE`
- **权限**: 需要认证
- **成功响应** (200): 删除结果

### 分页查询购买订单
- **URL**: `/orders/purchase`
- **方法**: `GET`
- **权限**: 需要认证
- **成功响应** (200): 分页订单列表

### 分页查询供应订单
- **URL**: `/orders/supply`
- **方法**: `GET`
- **权限**: 需要认证
- **成功响应** (200): 分页订单列表

### 获取待审核订单
- **URL**: `/orders/approval/pending`
- **方法**: `GET`
- **权限**: 需要认证
- **成功响应** (200): 待审核订单列表

### 审核订单
- **URL**: `/orders/:order_id/approve`
- **方法**: `POST`
- **权限**: 需要认证
- **请求体**: 审核信息
- **成功响应** (200): 审核结果

## 统计接口

### 获取仪表盘统计数据
- **URL**: `/statistics/dashboard`
- **方法**: `GET`
- **权限**: 需要认证
- **成功响应** (200):
  ```json
  {
    "success": true,
    "data": {
      "totalUsers": 100,
      "totalProducts": 50,
      "pendingOrders": 10,
      "lowStockProducts": 5
    }
  }
  ```

### 获取订单统计图表数据
- **URL**: `/statistics/order-chart`
- **方法**: `GET`
- **权限**: 需要认证
- **查询参数**: 
  - `range`: 时间范围 (monthly/quarterly/yearly)
  - `year`: 年份
- **成功响应** (200): 图表数据

### 获取库存统计图表数据
- **URL**: `/statistics/inventory-chart`
- **方法**: `GET`
- **权限**: 需要认证
- **成功响应** (200): 库存分类统计数据