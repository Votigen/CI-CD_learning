<template>
    <div class="purchase-orders">
        <el-card>
            <template #header>
                <div class="card-header">
                    <span>采购订单</span>
                    <el-button @click="refreshData" :loading="loading">
                        <el-icon>
                            <Refresh />
                        </el-icon>
                        刷新
                    </el-button>
                </div>
            </template>

            <!-- 采购订单列表 -->
            <el-table :data="tableData" v-loading="loading" empty-text="暂无采购订单" :key="tableKey">
                <el-table-column prop="order_id" label="订单ID" width="280" />
                <el-table-column prop="title" label="订单标题" min-width="150" />
                <el-table-column prop="creator_uid" label="创建人ID" width="100" />
                <el-table-column prop="customer_uid" label="供应商ID" width="100" />
                <el-table-column prop="quantity" label="数量" width="80" />
                <el-table-column prop="unit_price" label="单价" width="100">
                    <template #default="{ row }">
                        ¥{{ row.unit_price }}
                    </template>
                </el-table-column>
                <el-table-column prop="duration_days" label="有效期(天)" width="100" />
                <el-table-column prop="order_status" label="状态" width="120">
                    <template #default="{ row }">
                        <el-tag :type="getStatusTag(row.order_status)">
                            {{ getStatusText(row.order_status) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="order_type" label="订单类型" width="100">
                    <template #default="{ row }">
                        <el-tag :type="row.order_type === 'purchase' ? 'primary' : 'success'">
                            {{ row.order_type === 'purchase' ? '采购' : '销售' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="created_at" label="创建时间" width="180">
                    <template #default="{ row }">
                        {{ formatDate(row.created_at) }}
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination-container" v-if="pagination.total > 0">
                <el-pagination v-model:current-page="queryParams.page" v-model:page-size="queryParams.limit"
                    :total="pagination.total" :page-sizes="[10, 20, 50, 100]"
                    layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
                    @current-change="handleCurrentChange" />
            </div>
        </el-card>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { getPurchaseOrders } from '@/api/order' 

const loading = ref(false)
const tableData = ref([])
const tableKey = ref(0)

// 查询参数
const queryParams = reactive({
    page: 1,
    limit: 10,
    keyword: '',
    status: ''
})

// 分页信息
const pagination = reactive({
    total: 0,
    current_page: 1,
    total_pages: 0
})

// 获取采购订单列表
const fetchPurchaseOrders = async () => {
    loading.value = true
    try {
        const response = await getPurchaseOrders(queryParams)
        console.log('采购订单API响应:', response)

        // 根据你的后端响应结构处理数据
        if (response && response.success) {
            tableData.value = response.data.orders || []
            pagination.total = response.data.pagination.total
            pagination.current_page = response.data.pagination.current_page
            pagination.total_pages = response.data.pagination.total_pages
        } else {
            tableData.value = []
        }

        tableKey.value += 1

    } catch (error) {
        console.error('获取采购订单失败:', error)
        ElMessage.error('获取采购订单失败')
        tableData.value = []
    } finally {
        loading.value = false
    }
}

// 刷新数据
const refreshData = () => {
    queryParams.page = 1
    fetchPurchaseOrders()
}

// 分页大小改变
const handleSizeChange = (size) => {
    queryParams.limit = size
    queryParams.page = 1
    fetchPurchaseOrders()
}

// 当前页改变
const handleCurrentChange = (page) => {
    queryParams.page = page
    fetchPurchaseOrders()
}

// 状态标签
const getStatusTag = (status) => {
    const map = {
        draft: 'info',
        pending_approval: 'warning',
        approved: 'success',
        rejected: 'danger',
        confirmed: '',
        processing: 'primary',
        completed: 'success',
        cancelled: 'info'
    }
    return map[status] || 'info'
}

const getStatusText = (status) => {
    const map = {
        draft: '草稿',
        pending_approval: '待审批',
        approved: '已批准',
        rejected: '已驳回',
        confirmed: '已确认',
        processing: '处理中',
        completed: '已完成',
        cancelled: '已取消'
    }
    return map[status] || status
}

// 格式化日期
const formatDate = (dateString) => {
    if (!dateString) return ''
    try {
        return new Date(dateString).toLocaleString('zh-CN')
    } catch (error) {
        return dateString
    }
}

onMounted(() => {
    fetchPurchaseOrders()
})
</script>

<style scoped>
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.purchase-orders {
    padding: 20px;
}

.pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
}
</style>