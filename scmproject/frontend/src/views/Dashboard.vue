<template>
    <div class="dashboard">
        <!-- 统计卡片 -->
        <el-row :gutter="20">
            <el-col :span="6">
                <el-card class="stat-card" shadow="hover">
                    <div class="stat-content">
                        <div class="stat-icon" style="background-color: #409eff;">
                            <el-icon>
                                <User />
                            </el-icon>
                        </div>
                        <div class="stat-info">
                            <div class="stat-value">
                                <template v-if="loadingStatistics">
                                    <el-skeleton :rows="1" width="60px" />
                                </template>
                                <template v-else>{{ statistics.totalUsers || 0 }}</template>
                            </div>
                            <div class="stat-label">总用户数</div>
                        </div>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card class="stat-card" shadow="hover">
                    <div class="stat-content">
                        <div class="stat-icon" style="background-color: #67c23a;">
                            <el-icon>
                                <Box />
                            </el-icon>
                        </div>
                        <div class="stat-info">
                            <div class="stat-value">
                                <template v-if="loadingStatistics">
                                    <el-skeleton :rows="1" width="60px" />
                                </template>
                                <template v-else>{{ statistics.totalProducts || 0 }}</template>
                            </div>
                            <div class="stat-label">商品总数</div>
                        </div>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card class="stat-card" shadow="hover">
                    <div class="stat-content">
                        <div class="stat-icon" style="background-color: #e6a23c;">
                            <el-icon>
                                <Document />
                            </el-icon>
                        </div>
                        <div class="stat-info">
                            <div class="stat-value">
                                <template v-if="loadingStatistics">
                                    <el-skeleton :rows="1" width="60px" />
                                </template>
                                <template v-else>{{ statistics.pendingOrders || 0 }}</template>
                            </div>
                            <div class="stat-label">待审批订单</div>
                        </div>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card class="stat-card" shadow="hover">
                    <div class="stat-content">
                        <div class="stat-icon" style="background-color: #f56c6c;">
                            <el-icon>
                                <Warning />
                            </el-icon>
                        </div>
                        <div class="stat-info">
                            <div class="stat-value">
                                <template v-if="loadingStatistics">
                                    <el-skeleton :rows="1" width="60px" />
                                </template>
                                <template v-else>{{ statistics.lowStockProducts || 0 }}</template>
                            </div>
                            <div class="stat-label">库存预警</div>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 图表区域 -->
        <el-row :gutter="20" style="margin-top: 20px;">
            <el-col :span="12">
                <el-card>
                    <template #header>
                        <div class="card-header"><span>订单统计</span></div>
                    </template>
                    <div id="orderChart" style="height: 300px;"></div>
                </el-card>
            </el-col>
            <el-col :span="12">
                <el-card>
                    <template #header>
                        <div class="card-header"><span>库存分布</span></div>
                    </template>
                    <div id="inventoryChart" style="height: 300px;"></div>
                </el-card>
            </el-col>
        </el-row>

        <el-row :gutter="20" style="margin-top: 20px;">
            <el-col :span="12">
                <el-card>
                    <template #header>
                        <div class="card-header"><span>最近活动</span></div>
                    </template>
                    <el-timeline>
                        <el-timeline-item v-for="(activity, index) in activities" :key="index"
                            :timestamp="activity.timestamp" :type="activity.type" :icon="activity.icon">
                            {{ activity.content }}
                        </el-timeline-item>
                    </el-timeline>
                </el-card>
            </el-col>
            <el-col :span="12">
                <el-card>
                    <template #header>
                        <div class="card-header"><span>快速操作</span></div>
                    </template>
                    <div class="quick-actions-grid">
                        <el-button type="primary" @click="navigateTo('/order/create')" class="action-btn">
                            <el-icon class="action-icon">
                                <DocumentAdd />
                            </el-icon>
                            <span class="action-text">创建订单</span>
                        </el-button>
                        <el-button type="success" @click="navigateTo('/inventory/products')" class="action-btn">
                            <el-icon class="action-icon">
                                <Box />
                            </el-icon>
                            <span class="action-text">库存管理</span>
                        </el-button>
                        <el-button type="warning" @click="navigateTo('/order/approval')" class="action-btn">
                            <el-icon class="action-icon">
                                <Finished />
                            </el-icon>
                            <span class="action-text">订单审批</span>
                        </el-button>
                        <el-button type="info" @click="navigateTo('/reports')" class="action-btn">
                            <el-icon class="action-icon">
                                <DataAnalysis />
                            </el-icon>
                            <span class="action-text">查看报表</span>
                        </el-button>
                    </div>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>
<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import {
    User, Box, Document, Warning, DocumentAdd, Finished, DataAnalysis
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, ElSkeleton } from 'element-plus'

const router = useRouter()
const statistics = ref({
    totalUsers: 0,
    totalProducts: 0,
    pendingOrders: 0,
    lowStockProducts: 0
})
const loadingStatistics = ref(false)
const loadingCharts = ref(false)
const activities = ref([
    { content: '新采购订单创建成功', timestamp: '2024-01-15 14:00', type: 'primary', icon: 'DocumentAdd' },
    { content: '库存预警：商品A库存不足', timestamp: '2024-01-15 13:30', type: 'warning', icon: 'Warning' },
    { content: '销售订单审批通过', timestamp: '2024-01-15 12:00', type: 'success', icon: 'Finished' },
    { content: '新用户注册成功', timestamp: '2024-01-15 11:20', type: 'info', icon: 'User' }
])
let orderChart = null
let inventoryChart = null

// Token 相关函数（保持不变）
const isTokenExpired = (token) => {
    try {
        if (!token) return true;
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));
        const expTime = payload.exp * 1000;
        const currentTime = Date.now();
        return currentTime > expTime;
    } catch (error) {
        console.error('Token解析错误:', error);
        return true;
    }
}

const getToken = () => {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (token) {
        const expired = isTokenExpired(token);
        console.log('🔐 Token 状态:', expired ? '已过期' : '有效');
        if (expired) {
            console.log('❌ Token 已过期，需要重新登录');
            return null;
        }
    } else {
        console.log('❌ 未找到 Token');
    }
    return token;
}

const clearTokenAndRedirect = async (message = '登录已过期，请重新登录') => {
    localStorage.removeItem('access_token');
    sessionStorage.removeItem('access_token');
    await ElMessageBox.alert(message, '提示', {
        confirmButtonText: '重新登录',
        type: 'warning'
    });
    router.push('/login');
}

// API 函数 - 添加图表数据接口
const api = {
    async getDashboardStatistics() {
        try {
            const token = getToken();
            if (!token) {
                await clearTokenAndRedirect('登录状态已过期，请重新登录');
                return;
            }
            console.log('🚀 发送统计请求...');
            const response = await fetch('http://localhost:5000/api/statistics/dashboard', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('📊 响应状态:', response.status);

            if (!response.ok) {
                let errorDetail = '';
                try {
                    const errorResult = await response.json();
                    errorDetail = errorResult.message || '';
                } catch (e) {
                    errorDetail = await response.text();
                }
                if (response.status === 401 || response.status === 403) {
                    await clearTokenAndRedirect('登录已失效，请重新登录');
                    throw new Error(`认证失败: ${errorDetail}`);
                } else {
                    throw new Error(`请求失败: ${response.status} ${errorDetail}`);
                }
            }

            const result = await response.json();
            console.log('✅ 获取统计数据成功:', result);

            if (result.success) {
                return result.data;
            } else {
                throw new Error(result.message || '获取数据失败');
            }
        } catch (error) {
            console.error('❌ API调用失败:', error);
            throw error;
        }
    },

    async getOrderChartData(range = 'monthly') {
        try {
            const token = getToken();
            if (!token) {
                await clearTokenAndRedirect('登录状态已过期，请重新登录');
                return;
            }

            const response = await fetch(`http://localhost:5000/api/statistics/order-chart?range=${range}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`获取订单图表数据失败: ${response.status}`);
            }

            const result = await response.json();
            if (result.success) {
                return result.data;
            } else {
                throw new Error(result.message || '获取订单图表数据失败');
            }
        } catch (error) {
            console.error('❌ 获取订单图表数据失败:', error);
            throw error;
        }
    },

    async getInventoryChartData() {
        try {
            const token = getToken();
            if (!token) {
                await clearTokenAndRedirect('登录状态已过期，请重新登录');
                return;
            }

            const response = await fetch('http://localhost:5000/api/statistics/inventory-chart', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`获取库存图表数据失败: ${response.status}`);
            }

            const result = await response.json();
            if (result.success) {
                return result.data;
            } else {
                throw new Error(result.message || '获取库存图表数据失败');
            }
        } catch (error) {
            console.error('❌ 获取库存图表数据失败:', error);
            throw error;
        }
    }
}

// 图表初始化 - 修改为动态数据
const initCharts = async () => {
    try {
        loadingCharts.value = true;

        // 获取订单图表数据
        const orderData = await api.getOrderChartData();
        // 获取库存图表数据
        const inventoryData = await api.getInventoryChartData();

        // 初始化订单图表
        const orderChartElement = document.getElementById('orderChart');
        if (orderChartElement) {
            orderChart = echarts.init(orderChartElement)
            const orderOption = {
                tooltip: { trigger: 'axis' },
                legend: {
                    data: ['采购订单', '销售订单'],
                    position: 'top', top: 0, left: 'center',
                    padding: [10, 0, 10, 0], itemWidth: 12, itemHeight: 12, itemGap: 20,
                    textStyle: { fontSize: 12 }
                },
                grid: { left: '3%', right: '4%', bottom: '3%', top: '20%', containLabel: true },
                xAxis: {
                    type: 'category',
                    data: orderData.categories || ['1月', '2月', '3月', '4月', '5月', '6月']
                },
                yAxis: { type: 'value' },
                series: [
                    {
                        name: '采购订单',
                        type: 'line',
                        data: orderData.purchaseOrders || [120, 132, 101, 134, 90, 230],
                        smooth: true
                    },
                    {
                        name: '销售订单',
                        type: 'line',
                        data: orderData.saleOrders || [220, 182, 191, 234, 290, 330],
                        smooth: true
                    }
                ]
            }
            orderChart.setOption(orderOption)
        }

        // 初始化库存图表
        const inventoryChartElement = document.getElementById('inventoryChart');
        if (inventoryChartElement) {
            inventoryChart = echarts.init(inventoryChartElement)
            const inventoryOption = {
                tooltip: { trigger: 'item' },
                legend: { orient: 'vertical', left: 'left' },
                series: [{
                    name: '库存分布',
                    type: 'pie',
                    radius: '50%',
                    data: inventoryData || [
                        { value: 1048, name: '电子产品' },
                        { value: 735, name: '办公用品' },
                        { value: 580, name: '原材料' },
                        { value: 484, name: '成品' },
                        { value: 300, name: '其他' }
                    ],
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }]
            }
            inventoryChart.setOption(inventoryOption)
        }
    } catch (error) {
        console.error('初始化图表失败:', error);
        ElMessage.error('图表数据加载失败');
    } finally {
        loadingCharts.value = false;
    }
}

// 获取统计数据
const fetchStatistics = async () => {
    try {
        console.log('🔄 开始获取统计数据...');
        loadingStatistics.value = true;
        const data = await api.getDashboardStatistics();
        if (data) {
            statistics.value = data;
            ElMessage.success('数据加载成功');
        }
    } catch (error) {
        console.error('获取统计数据失败:', error);
        ElMessage.error('获取统计数据失败');
        statistics.value = {
            totalUsers: 0,
            totalProducts: 0,
            pendingOrders: 0,
            lowStockProducts: 0
        }
    } finally {
        loadingStatistics.value = false;
    }
}

const navigateTo = (path) => {
    router.push(path)
}

const handleResize = () => {
    if (orderChart) orderChart.resize()
    if (inventoryChart) inventoryChart.resize()
}

onMounted(async () => {
    console.log('🏠 Dashboard 组件挂载');
    const token = getToken();
    if (!token) {
        await clearTokenAndRedirect('请先登录');
        return;
    }
    await fetchStatistics();
    nextTick(() => {
        initCharts();
    });
    window.addEventListener('resize', handleResize);
})

onUnmounted(() => {
    if (orderChart) orderChart.dispose()
    if (inventoryChart) inventoryChart.dispose()
    window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.dashboard {
    padding: 20px;
}

.stat-card {
    margin-bottom: 0;
}

.stat-content {
    display: flex;
    align-items: center;
}

.stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
}

.stat-icon .el-icon {
    font-size: 24px;
    color: white;
}

.stat-info {
    flex: 1;
}

.stat-value {
    font-size: 24px;
    font-weight: bold;
    color: #303133;
    margin-bottom: 4px;
}

.stat-label {
    font-size: 14px;
    color: #909399;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.quick-actions-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    padding: 16px;
}

.action-btn {
    height: 90px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
}

.action-icon {
    font-size: 28px;
    margin-bottom: 8px;
}

.action-text {
    font-size: 16px;
    white-space: nowrap;
}
</style>