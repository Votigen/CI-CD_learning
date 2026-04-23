<template>
    <div class="order-approval">
        <el-card>
            <template #header>
                <div class="card-header">
                    <span>订单审批</span>
                    <el-button @click="refreshData" :loading="loading">
                        <el-icon>
                            <Refresh />
                        </el-icon>
                        刷新
                    </el-button>
                </div>
            </template>

            <!-- 待审批订单列表 -->
            <el-table :data="pendingOrders" v-loading="loading" empty-text="暂无待审批订单">
                <el-table-column prop="order_id" label="订单ID" width="280" />
                <el-table-column prop="title" label="订单标题" min-width="150" />
                <el-table-column prop="order_type" label="订单类型" width="100">
                    <template #default="{ row }">
                        <el-tag :type="row.order_type === 'purchase' ? 'primary' : 'success'">
                            {{ row.order_type === 'purchase' ? '采购' : '销售' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="creator_name" label="创建人" width="120" />
                <el-table-column prop="customer_name" label="客户" width="120" />
                <el-table-column prop="product_name" label="产品" width="150" />
                <el-table-column prop="quantity" label="数量" width="80" />
                <el-table-column prop="unit_price" label="单价" width="100">
                    <template #default="{ row }">
                        ¥{{ row.unit_price }}
                    </template>
                </el-table-column>
                <el-table-column prop="duration_days" label="有效期(天)" width="100" />
                <el-table-column prop="created_at" label="创建时间" width="180">
                    <template #default="{ row }">
                        {{ formatDate(row.created_at) }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="200" fixed="right">
                    <template #default="{ row }">
                        <el-button size="small" @click="viewOrderDetail(row)">详情</el-button>
                        <el-button size="small" type="success" @click="handleApprove(row.order_id)">
                            通过
                        </el-button>
                        <el-button size="small" type="danger" @click="handleReject(row.order_id)">
                            驳回
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 订单详情对话框 -->
        <el-dialog v-model="detailDialogVisible" title="订单详情" width="600px">
            <el-descriptions v-if="currentOrder" :column="2" border>
                <el-descriptions-item label="订单ID">{{ currentOrder.order_id }}</el-descriptions-item>
                <el-descriptions-item label="订单标题">{{ currentOrder.title }}</el-descriptions-item>
                <el-descriptions-item label="订单类型">
                    <el-tag :type="currentOrder.order_type === 'purchase' ? 'primary' : 'success'">
                        {{ currentOrder.order_type === 'purchase' ? '采购订单' : '销售订单' }}
                    </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="创建人">{{ currentOrder.creator_name }}</el-descriptions-item>
                <el-descriptions-item label="客户">{{ currentOrder.customer_name }}</el-descriptions-item>
                <el-descriptions-item label="产品">{{ currentOrder.product_name }}</el-descriptions-item>
                <el-descriptions-item label="数量">{{ currentOrder.quantity }}</el-descriptions-item>
                <el-descriptions-item label="单价">¥{{ currentOrder.unit_price }}</el-descriptions-item>
                <el-descriptions-item label="总金额">¥{{ (currentOrder.quantity * currentOrder.unit_price).toFixed(2)
                    }}</el-descriptions-item>
                <el-descriptions-item label="有效期">{{ currentOrder.duration_days }}天</el-descriptions-item>
                <el-descriptions-item label="创建时间">{{ formatDate(currentOrder.created_at) }}</el-descriptions-item>
                <el-descriptions-item label="订单描述" :span="2">
                    {{ currentOrder.description || '无描述' }}
                </el-descriptions-item>
            </el-descriptions>
            <template #footer>
                <el-button @click="detailDialogVisible = false">关闭</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { getPendingApprovalOrders, approveOrder } from '@/api/order'

const loading = ref(false)
const pendingOrders = ref([])
const detailDialogVisible = ref(false)
const currentOrder = ref(null)

// 获取待审批订单列表
const fetchPendingOrders = async () => {
    loading.value = true
    try {
        const response = await getPendingApprovalOrders()
        pendingOrders.value = response.data
    } catch (error) {
        ElMessage.error('获取待审批订单失败')
        console.error('获取待审批订单失败:', error)
    } finally {
        loading.value = false
    }
}

// 刷新数据
const refreshData = () => {
    fetchPendingOrders()
}

// 查看订单详情
const viewOrderDetail = (order) => {
    currentOrder.value = order
    detailDialogVisible.value = true
}

// 审批通过
const handleApprove = async (orderId) => {
    try {
        await ElMessageBox.confirm('确定要通过该订单吗？', '提示', {
            type: 'warning'
        })

        await  (orderId, { action: 'approve' })
        ElMessage.success('审批通过成功')
        fetchPendingOrders()
    } catch (error) {
        if (error !== 'cancel') {
            ElMessage.error('审批操作失败')
        }
    }
}

// 审批驳回
const handleReject = async (orderId) => {
    try {
        await ElMessageBox.confirm('确定要驳回该订单吗？', '提示', {
            type: 'warning'
        })

        await approveOrder(orderId, { action: 'reject' })
        ElMessage.success('订单已驳回')
        fetchPendingOrders()
    } catch (error) {
        if (error !== 'cancel') {
            ElMessage.error('审批操作失败')
        }
    }
}

// 格式化日期
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('zh-CN')
}

onMounted(() => {
    fetchPendingOrders()
})
</script>

<style scoped>
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.order-approval {
    padding: 20px;
}
</style>