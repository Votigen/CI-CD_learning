import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/',
    component: MainLayout,
    redirect: '/dashboard',
    children: [
      {
        path: '/order/create',
        name: 'OrderCreate',
        component: () => import('@/views/order/CreateOrder.vue'),
        meta: { title: '创建订单' }
      },
      {
        path: '/order/purchase',
        name: 'OrderPurchase',
        component: () => import('@/views/order/PurchaseOrders.vue'),
        meta: { title: '采购订单' }
      },
      {
        path: '/order/sale',
        name: 'OrderSale',
        component: () => import('@/views/order/SaleOrders.vue'),
        meta: { title: '销售订单' }
      },
      {
        path: '/order/approval',
        name: 'OrderApproval',
        component: () => import('@/views/order/OrderApproval.vue'),
        meta: { title: '订单审批' }
      },
      // 仪表盘
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '仪表盘' }
      },

      // 用户管理
      {
        path: 'user/list',
        name: 'UserList',
        component: () => import('@/views/user/UserList.vue'),
        meta: {
          title: '用户列表',
          roles: ['admin'] // 只有管理员可以访问用户管理
        }
      },
      {
        path: 'user/contacts',
        name: 'UserContacts',
        component: () => import('@/views/user/UserContacts.vue'),
        meta: {
          title: '联系人管理',
          roles: ['admin', 'purchase_manager', 'warehouse_manager']
        }
      },
      {
        path: 'user/roles',
        name: 'UserRoles',
        component: () => import('@/views/user/UserRoles.vue'),
        meta: {
          title: '角色权限管理',
          roles: ['admin'] // 只有管理员可以访问角色管理
        }
      },

      // 库存管理
      {
        path: 'inventory/products',
        name: 'ProductInventory',
        component: () => import('@/views/inventory/ProductInventory.vue'),
        meta: {
          title: '商品库存',
          roles: ['admin', 'purchase_manager', 'warehouse_manager']
        }
      },
      {
        path: 'inventory/alerts',
        name: 'InventoryAlerts',
        component: () => import('@/views/inventory/InventoryAlerts.vue'),
        meta: {
          title: '库存预警',
          roles: ['admin', 'warehouse_manager']
        }
      },

      // 订单管理
      {
        path: 'order/create',
        name: 'CreateOrder',
        component: () => import('@/views/order/CreateOrder.vue'),
        meta: {
          title: '创建订单',
          roles: ['admin', 'purchase_manager', 'user']
        }
      },
      {
        path: 'order/purchase',
        name: 'PurchaseOrders',
        component: () => import('@/views/order/PurchaseOrders.vue'),
        meta: {
          title: '采购订单',
          roles: ['admin', 'purchase_manager', 'warehouse_manager', 'user']
        }
      },
      {
        path: 'order/sale',
        name: 'SaleOrders',
        component: () => import('@/views/order/SaleOrders.vue'),
        meta: {
          title: '销售订单',
          roles: ['admin', 'purchase_manager', 'user']
        }
      },
      {
        path: 'order/approval',
        name: 'OrderApproval',
        component: () => import('@/views/order/OrderApproval.vue'),
        meta: {
          title: '订单审批',
          roles: ['admin', 'purchase_manager'] // 只有管理员和采购经理可以审批
        }
      },

      // 报表统计
      {
        path: 'reports',
        name: 'Reports',
        component: () => import('@/views/reports/Reports.vue'),
        meta: {
          title: '报表统计',
          roles: ['admin', 'purchase_manager', 'warehouse_manager']
        }
      },

      // 个人中心
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/Profile.vue'),
        meta: { title: '个人中心' }
      }
    ]
  },

  // 404 页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫（取消注释并更新）
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  // 如果目标页面不是登录页且用户未登录，重定向到登录页
  if (to.path !== '/login' && !userStore.isLoggedIn) {
    next('/login')
  }
  // 如果用户已登录但访问登录页，重定向到首页
  else if (to.path === '/login' && userStore.isLoggedIn) {
    next('/')
  }
  // 检查页面权限
  else if (to.meta.roles && userStore.isLoggedIn) {
    const userRole = userStore.userRole
    if (to.meta.roles.includes(userRole) || to.meta.roles.includes('*')) {
      next()
    } else {
      // 没有权限，跳转到无权限页面或首页
      ElMessage.error('您没有访问此页面的权限')
      next('/dashboard')
    }
  }
  // 其他情况正常放行
  else {
    next()
  }
})

export default router