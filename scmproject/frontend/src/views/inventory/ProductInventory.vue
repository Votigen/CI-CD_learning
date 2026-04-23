<template>
    <div class="product-inventory">
        <el-card>
            <template #header>
                <div class="card-header">
                    <span>商品库存管理</span>
                    <el-button type="primary" @click="handleCreate">
                        <el-icon>
                            <Plus />
                        </el-icon>
                        新增商品
                    </el-button>
                </div>
            </template>

            <!-- 搜索区域 -->
            <div class="search-container">
                <el-input v-model="searchKeyword" placeholder="搜索商品名称" style="width: 300px" clearable
                    @clear="handleSearch" @keyup.enter="handleSearch">
                    <template #append>
                        <el-button :icon="Search" @click="handleSearch" />
                    </template>
                </el-input>

                <el-button @click="resetSearch">
                    <el-icon>
                        <RefreshRight />
                    </el-icon>
                    重置
                </el-button>

                <div class="search-result">
                    共 {{ filteredInventory.length }} 个商品
                    <span v-if="hasLowStock" class="low-stock-warning">
                        （其中 <strong>{{ lowStockCount }}</strong> 个商品库存不足）
                    </span>
                </div>
            </div>

            <!-- 库存表格 -->
            <el-table :data="filteredInventory" v-loading="loading" style="width: 100%" stripe border>
                <el-table-column prop="product_id" label="商品ID" width="120" />
                <el-table-column prop="product_name" label="商品名称" min-width="180" />
                <el-table-column prop="quantity" label="当前库存" width="120" align="center">
                    <template #default="scope">
                        <span :class="{ 'low-stock': scope.row.quantity <= scope.row.alert_threshold }">
                            {{ scope.row.quantity }}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column prop="alert_threshold" label="预警阈值" width="120" align="center" />
                <el-table-column label="库存状态" width="120" align="center">
                    <template #default="scope">
                        <el-tag :type="getStockStatusType(scope.row)" effect="light">
                            {{ getStockStatus(scope.row) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="uid" label="负责人ID" width="100" align="center" />
                <el-table-column label="操作" width="180" align="center" fixed="right">
                    <template #default="scope">
                        <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
                        <el-button size="small" type="danger" @click="handleDelete(scope.row)">
                            删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 空状态 -->
            <div v-if="filteredInventory.length === 0 && !loading" class="empty-state">
                <el-empty description="暂无库存数据">
                    <el-button @click="handleCreate">添加第一个商品</el-button>
                </el-empty>
            </div>
        </el-card>

        <!-- 新增/编辑库存对话框 -->
        <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" :before-close="handleClose">
            <el-form ref="inventoryFormRef" :model="inventoryForm" :rules="inventoryRules" label-width="100px">
                <el-form-item label="商品ID" prop="product_id">
                    <el-input v-model="inventoryForm.product_id" placeholder="请输入商品ID" />
                </el-form-item>

                <el-form-item label="商品名称" prop="product_name">
                    <el-input v-model="inventoryForm.product_name" placeholder="请输入商品名称" />
                </el-form-item>

                <el-form-item label="当前库存" prop="quantity">
                    <el-input-number v-model="inventoryForm.quantity" :min="0" :max="99999" controls-position="right"
                        style="width: 100%" />
                </el-form-item>

                <el-form-item label="预警阈值" prop="alert_threshold">
                    <el-input-number v-model="inventoryForm.alert_threshold" :min="1" :max="1000"
                        controls-position="right" style="width: 100%" />
                </el-form-item>

                <el-form-item label="负责人ID" prop="uid">
                    <el-input v-model="inventoryForm.uid" placeholder="请输入负责人用户ID" type="number" />
                </el-form-item>
            </el-form>

            <template #footer>
                <el-button @click="handleClose">取消</el-button>
                <el-button type="primary" :loading="submitting" @click="handleSubmit">
                    确定
                </el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, RefreshRight } from '@element-plus/icons-vue'
import { getInventory, createInventory, updateInventory, deleteInventory } from '@/api/inventory'

// 响应式数据
const loading = ref(false)
const dialogVisible = ref(false)
const submitting = ref(false)
const searchKeyword = ref('')

const inventoryList = ref([])

// 计算属性
const filteredInventory = computed(() => {
    if (!searchKeyword.value) {
        return inventoryList.value
    }

    const keyword = searchKeyword.value.toLowerCase()
    return inventoryList.value.filter(item =>
        item.product_name.toLowerCase().includes(keyword) ||
        item.product_id.toLowerCase().includes(keyword)
    )
})

const hasLowStock = computed(() => lowStockCount.value > 0)
const lowStockCount = computed(() =>
    inventoryList.value.filter(item => item.quantity <= item.alert_threshold).length
)

const dialogTitle = computed(() => inventoryForm.id ? '编辑库存' : '新增库存')

// 表单数据
const inventoryFormRef = ref()
const inventoryForm = reactive({
    product_id: '',
    product_name: '',
    quantity: 0,
    alert_threshold: 5,
    uid: 1
})

// 表单验证规则
const inventoryRules = reactive({
    product_id: [
        { required: true, message: '请输入商品ID', trigger: 'blur' }
    ],
    product_name: [
        { required: true, message: '请输入商品名称', trigger: 'blur' }
    ],
    quantity: [
        { required: true, message: '请输入库存数量', trigger: 'blur' }
    ],
    alert_threshold: [
        { required: true, message: '请输入预警阈值', trigger: 'blur' }
    ],
    uid: [
        { required: true, message: '请输入负责人ID', trigger: 'blur' }
    ]
})

// 方法
const getStockStatus = (item) => {
    if (item.quantity === 0) {
        return '缺货'
    } else if (item.quantity <= item.alert_threshold) {
        return '库存不足'
    } else {
        return '库存正常'
    }
}

const getStockStatusType = (item) => {
    if (item.quantity === 0) {
        return 'danger'
    } else if (item.quantity <= item.alert_threshold) {
        return 'warning'
    } else {
        return 'success'
    }
}

// 加载库存数据
const loadInventory = async () => {
    loading.value = true
    try {
        const response = await getInventory()
        // 根据您的接口返回结构调整
        inventoryList.value = response.data || response
        ElMessage.success('库存数据加载成功')
    } catch (error) {
        ElMessage.error('加载库存数据失败: ' + (error.message || '未知错误'))
    } finally {
        loading.value = false
    }
}

// 搜索
const handleSearch = () => {
    // 搜索逻辑由 computed 属性处理
}

// 重置搜索
const resetSearch = () => {
    searchKeyword.value = ''
    ElMessage.info('搜索条件已重置')
}

// 打开新增对话框
const handleCreate = () => {
    Object.assign(inventoryForm, {
        id: undefined,
        product_id: '',
        product_name: '',
        quantity: 0,
        alert_threshold: 5,
        uid: 1
    })
    dialogVisible.value = true
}

// 打开编辑对话框
const handleEdit = (item) => {
    Object.assign(inventoryForm, {
        id: item.id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        alert_threshold: item.alert_threshold,
        uid: item.uid
    })
    dialogVisible.value = true
}

// 关闭对话框
const handleClose = () => {
    dialogVisible.value = false
    inventoryFormRef.value?.resetFields()
}

// 提交表单
const handleSubmit = async () => {
    if (!inventoryFormRef.value) return

    try {
        const valid = await inventoryFormRef.value.validate()
        if (!valid) return

        submitting.value = true

        if (inventoryForm.id) {
            // 编辑库存
            await updateInventory(inventoryForm.id, inventoryForm)
            ElMessage.success('库存更新成功')
        } else {
            // 新增库存
            await createInventory(inventoryForm)
            ElMessage.success('库存创建成功')
        }

        handleClose()
        await loadInventory()
    } catch (error) {
        ElMessage.error('操作失败: ' + (error.message || '未知错误'))
    } finally {
        submitting.value = false
    }
}

// 删除库存
const handleDelete = async (item) => {
    try {
        await ElMessageBox.confirm(
            `确定要删除商品 "${item.product_name}" 的库存记录吗？`,
            '删除确认',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }
        )

        await deleteInventory(item.id)
        ElMessage.success('库存记录删除成功')
        await loadInventory()
    } catch (error) {
        if (error !== 'cancel') {
            ElMessage.error('删除失败: ' + (error.message || '未知错误'))
        }
    }
}

// 生命周期
onMounted(() => {
    loadInventory()
})
</script>

<style scoped>
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.search-container {
    margin-bottom: 20px;
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
}

.search-result {
    margin-left: auto;
    color: #666;
    font-size: 14px;
}

.low-stock-warning {
    color: #e6a23c;
}

.low-stock {
    color: #f56c6c;
    font-weight: bold;
}

.empty-state {
    padding: 40px 0;
    text-align: center;
}

:deep(.el-table .low-stock) {
    color: #f56c6c;
    font-weight: bold;
}
</style>