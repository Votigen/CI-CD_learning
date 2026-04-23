<template>
    <div class="inventory-alerts">
        <el-card>
            <template #header>
                <div class="card-header">
                    <span>库存预警</span>
                    <el-button @click="refreshData" :loading="loading">
                        <el-icon>
                            <Refresh />
                        </el-icon>
                        刷新
                    </el-button>
                </div>
            </template>

            <!-- 预警统计 -->
            <div class="alert-stats">
                <el-row :gutter="20">
                    <el-col :span="8">
                        <el-card shadow="hover" class="stat-card danger">
                            <div class="stat-content">
                                <div class="stat-number">{{ outOfStockCount }}</div>
                                <div class="stat-label">缺货商品</div>
                                <el-tag type="danger" size="small">紧急</el-tag>
                            </div>
                        </el-card>
                    </el-col>
                    <el-col :span="8">
                        <el-card shadow="hover" class="stat-card warning">
                            <div class="stat-content">
                                <div class="stat-number">{{ lowStockCount }}</div>
                                <div class="stat-label">库存不足</div>
                                <el-tag type="warning" size="small">警告</el-tag>
                            </div>
                        </el-card>
                    </el-col>
                    <el-col :span="8">
                        <el-card shadow="hover" class="stat-card normal">
                            <div class="stat-content">
                                <div class="stat-number">{{ normalStockCount }}</div>
                                <div class="stat-label">库存正常</div>
                                <el-tag type="success" size="small">正常</el-tag>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>
            </div>

            <!-- 预警商品列表 -->
            <div class="alert-list">
                <h3>需关注商品</h3>

                <!-- 缺货商品 -->
                <el-alert v-if="outOfStockItems.length > 0" title="缺货商品（库存为0）" type="error" :closable="false" show-icon
                    style="margin-bottom: 16px;" />
                <el-table v-if="outOfStockItems.length > 0" :data="outOfStockItems"
                    style="width: 100%; margin-bottom: 24px;" stripe>
                    <el-table-column prop="product_name" label="商品名称" />
                    <el-table-column prop="product_id" label="商品ID" width="120" />
                    <el-table-column label="当前库存" width="100" align="center">
                        <template #default="scope">
                            <span class="out-of-stock">{{ scope.row.quantity }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="alert_threshold" label="预警阈值" width="100" align="center" />
                    <el-table-column label="操作" width="120" align="center">
                        <template #default="scope">
                            <el-button size="small" type="primary" @click="handleRestock(scope.row)">
                                补货
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>

                <!-- 库存不足商品 -->
                <el-alert v-if="lowStockItems.length > 0" title="库存不足商品" type="warning" :closable="false" show-icon
                    style="margin-bottom: 16px;" />
                <el-table v-if="lowStockItems.length > 0" :data="lowStockItems" style="width: 100%" stripe>
                    <el-table-column prop="product_name" label="商品名称" />
                    <el-table-column prop="product_id" label="商品ID" width="120" />
                    <el-table-column label="当前库存" width="100" align="center">
                        <template #default="scope">
                            <span class="low-stock">{{ scope.row.quantity }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="alert_threshold" label="预警阈值" width="100" align="center" />
                    <el-table-column label="差额" width="100" align="center">
                        <template #default="scope">
                            <span class="deficit">
                                {{ scope.row.alert_threshold - scope.row.quantity }}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="120" align="center">
                        <template #default="scope">
                            <el-button size="small" type="warning" @click="handleRestock(scope.row)">
                                补货
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>

                <!-- 无预警提示 -->
                <div v-if="outOfStockItems.length === 0 && lowStockItems.length === 0" class="no-alerts">
                    <el-result icon="success" title="暂无库存预警" sub-title="所有商品库存状态正常" />
                </div>
            </div>
        </el-card>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { getInventory, updateInventory } from '@/api/inventory'

// 响应式数据
const loading = ref(false)
const inventoryList = ref([])

// 计算属性
const outOfStockItems = computed(() =>
    inventoryList.value.filter(item => item.quantity === 0)
)

const lowStockItems = computed(() =>
    inventoryList.value.filter(item =>
        item.quantity > 0 && item.quantity <= item.alert_threshold
    )
)

const normalStockItems = computed(() =>
    inventoryList.value.filter(item => item.quantity > item.alert_threshold)
)

const outOfStockCount = computed(() => outOfStockItems.value.length)
const lowStockCount = computed(() => lowStockItems.value.length)
const normalStockCount = computed(() => normalStockItems.value.length)

// 方法
const loadInventory = async () => {
    loading.value = true
    try {
        const response = await getInventory()
        inventoryList.value = response.data || response
    } catch (error) {
        ElMessage.error('加载库存数据失败: ' + (error.message || '未知错误'))
    } finally {
        loading.value = false
    }
}

const refreshData = async () => {
    await loadInventory()
    ElMessage.success('数据已刷新')
}

const handleRestock = (item) => {
    ElMessageBox.prompt(`请输入 ${item.product_name} 的补货数量`, '补货操作', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^[1-9]\d*$/,
        inputErrorMessage: '请输入有效的数量'
    }).then(async ({ value }) => {
        const newQuantity = parseInt(value)

        try {
            await updateInventory(item.id, {
                quantity: item.quantity + newQuantity
            })

            ElMessage.success(`成功补货 ${newQuantity} 件`)
            await loadInventory()
        } catch (error) {
            ElMessage.error('补货失败: ' + (error.message || '未知错误'))
        }
    }).catch(() => {
        // 用户取消
    })
}

// 生命周期
onMounted(() => {
    loadInventory()
})
</script>

<style scoped>
.alert-stats {
    margin-bottom: 30px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.stat-card {
    border-radius: 8px;
    border-left: 4px solid #e4e7ed;
}

.stat-card.danger {
    border-left-color: #f56c6c;
}

.stat-card.warning {
    border-left-color: #e6a23c;
}

.stat-card.normal {
    border-left-color: #67c23a;
}

.stat-content {
    text-align: center;
    padding: 20px 0;
}

.stat-number {
    font-size: 32px;
    font-weight: bold;
    margin-bottom: 8px;
}

.stat-card.danger .stat-number {
    color: #f56c6c;
}

.stat-card.warning .stat-number {
    color: #e6a23c;
}

.stat-card.normal .stat-number {
    color: #67c23a;
}

.stat-label {
    font-size: 14px;
    color: #666;
    margin-bottom: 8px;
}

.alert-list h3 {
    margin-bottom: 16px;
    color: #303133;
    font-weight: 600;
}

.out-of-stock {
    color: #f56c6c;
    font-weight: bold;
}

.low-stock {
    color: #e6a23c;
    font-weight: bold;
}

.deficit {
    color: #f56c6c;
    font-weight: bold;
}

.no-alerts {
    padding: 40px 0;
    text-align: center;
}
</style>