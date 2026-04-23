<template>
    <el-container class="layout-container">
        <!-- 左侧导航栏 -->
        <el-aside :width="isCollapse ? '64px' : '200px'" class="aside">
            <div class="logo">
                <h2 v-if="!isCollapse">供应链管理系统</h2>
                <h2 v-else>库存</h2>
            </div>

            <!-- 导航菜单 -->
            <!-- 导航菜单部分 -->
            <el-menu :default-active="$route.path" class="el-menu-vertical" :collapse="isCollapse"
                :collapse-transition="false" router unique-opened>

                <el-menu-item index="/dashboard">
                    <el-icon>
                        <Odometer />
                    </el-icon>
                    <span>仪表盘</span>
                </el-menu-item>

                <!-- 用户管理 -->
                <el-sub-menu index="1">
                    <template #title>
                        <el-icon>
                            <User />
                        </el-icon>
                        <span>用户管理</span>
                    </template>
                    <el-menu-item index="/user/list">用户列表</el-menu-item>
                    <el-menu-item index="/user/roles">角色权限</el-menu-item>
                </el-sub-menu>

                <!-- 库存管理 -->
                <el-sub-menu index="2">
                    <template #title>
                        <el-icon>
                            <Box />
                        </el-icon>
                        <span>库存管理</span>
                    </template>
                    <el-menu-item index="/inventory/products">商品库存</el-menu-item>
                    <el-menu-item index="/inventory/alerts">库存预警</el-menu-item>
                </el-sub-menu>

                <!-- 订单管理 -->
                <el-sub-menu index="3">
                    <template #title>
                        <el-icon>
                            <Document />
                        </el-icon>
                        <span>订单管理</span>
                    </template>
                    <el-menu-item index="/order/create">创建订单</el-menu-item>
                    <el-menu-item index="/order/purchase">采购订单</el-menu-item>
                    <el-menu-item index="/order/sale">销售订单</el-menu-item>
                    <el-menu-item index="/order/approval">订单审批</el-menu-item>
                </el-sub-menu>

                <!-- 报表统计 -->
                <el-menu-item index="/reports">
                    <el-icon>
                        <DataAnalysis />
                    </el-icon>
                    <span>报表统计</span>
                </el-menu-item>
            </el-menu>
        </el-aside>

        <el-container>
            <!-- 顶部栏 -->
            <el-header class="header">
                <div class="header-left">
                    <el-button :icon="isCollapse ? Expand : Fold" circle @click="toggleCollapse" />
                    <el-breadcrumb separator="/">
                        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
                        <el-breadcrumb-item>{{ currentRouteName }}</el-breadcrumb-item>
                    </el-breadcrumb>
                </div>
                <div class="header-right">
                    <el-dropdown @command="handleCommand">
                        <span class="user-info">
                            <el-avatar :size="30"
                                src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
                            <span style="margin-left: 8px;">{{ userStore.userName }}</span>
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>
            </el-header>

            <!-- 主内容区 -->
            <el-main class="main">
                <router-view />
            </el-main>
        </el-container>
    </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
// 修正：添加所有需要的图标
import {
    Fold, Expand, Odometer, User, Box, Document, DataAnalysis
} from '@element-plus/icons-vue'

// 使用 Pinia Store
const userStore = useUserStore()

// 状态：菜单是否折叠
const isCollapse = ref(false)
const toggleCollapse = () => {
    isCollapse.value = !isCollapse.value
}

// 路由
const route = useRoute()
const router = useRouter()

// 计算当前路由名称用于面包屑
const currentRouteName = computed(() => {
    return route.meta.title || route.name
})

// 用户下拉菜单操作
const handleCommand = async (command) => {
    if (command === 'logout') {
        // 调用 Pinia store 中的 logout action
        await userStore.logout()
        // 退出后跳转到登录页
        router.push('/login')
    } else if (command === 'profile') {
        router.push('/profile')
    }
}
</script>
<style scoped>
.layout-container {
    height: 100vh;
}

.aside {
    background-color: #304156;
    transition: width 0.3s;
}

.logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    border-bottom: 1px solid #263445;
}

.el-menu-vertical {
    border: none;
    background-color: #304156;
}

.el-menu-vertical:not(.el-menu--collapse) {
    width: 200px;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e6e6e6;
    background-color: #fff;
    padding: 0 20px;
}

.header-left {
    display: flex;
    align-items: center;
}

.header-left .el-breadcrumb {
    margin-left: 16px;
}

.user-info {
    display: flex;
    align-items: center;
    cursor: pointer;
}

.main {
    background-color: #f0f2f5;
    padding: 20px;
}

/* 精简后的菜单样式 */
:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
    color: #bfcbd9 !important;
}

:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
    color: #ffffff !important;
    background-color: #263445 !important;
}

:deep(.el-menu-item.is-active) {
    color: #409eff !important;
    background-color: #263445 !important;
}

:deep(.el-menu--inline) {
    background-color: #1f2d3d !important;
}
</style>