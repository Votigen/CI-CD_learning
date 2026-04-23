<template>
    <div class="create-order">
        <el-card>
            <template #header>
                <div class="card-header">
                    <span>创建订单</span>
                </div>
            </template>

            <!-- 创建订单表单 -->
            <el-form :model="form" label-width="120px" :disabled="loading">
                <el-form-item label="订单类型">
                    <el-radio-group v-model="form.order_type">
                        <el-radio label="purchase">采购订单</el-radio>
                        <el-radio label="sale">销售订单</el-radio>
                    </el-radio-group>
                </el-form-item>

                <el-form-item label="订单标题" required>
                    <el-input v-model="form.title" placeholder="请输入订单标题" />
                </el-form-item>

                <el-form-item label="订单描述">
                    <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入订单描述" />
                </el-form-item>

                <el-form-item label="产品ID">
                    <el-input v-model="form.product_id" placeholder="请输入产品ID" />
                </el-form-item>

                <el-form-item label="供应商/客户ID">
                    <el-input v-model="form.supplier_uid" placeholder="请输入供应商/客户ID" />
                </el-form-item>

                <el-form-item label="数量" required>
                    <el-input-number v-model="form.quantity" :min="1" />
                </el-form-item>

                <el-form-item label="单价" required>
                    <el-input-number v-model="form.unit_price" :min="0" :precision="2" />
                </el-form-item>

                <el-form-item label="有效期(天)">
                    <el-input-number v-model="form.duration_days" :min="1" />
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="handleSubmit" :loading="loading">
                        创建订单
                    </el-button>
                    <el-button @click="handleReset">重置</el-button>
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { createOrder } from '@/api/order'

const loading = ref(false)

// 表单数据
const form = reactive({
    order_type: 'purchase',
    title: '',
    description: '',
    product_id: '',
    supplier_uid: '', // 根据订单类型，这个字段代表供应商ID或客户ID
    quantity: 1,
    unit_price: 0,
    duration_days: 30
})

// 提交表单
const handleSubmit = async () => {
    if (!form.title) {
        ElMessage.warning('请输入订单标题')
        return
    }

    if (!form.product_id) {
        ElMessage.warning('请输入产品ID')
        return
    }

    if (!form.supplier_uid) {
        ElMessage.warning('请输入供应商/客户ID')
        return
    }

    loading.value = true
    try {
        const requestData = {
            ...form,
            // 根据接口文档，采购订单使用 supplier_uid
            supplier_uid: form.supplier_uid
        }

        const response = await createOrder(requestData)
        ElMessage.success(response.message || '订单创建成功')
        handleReset()
    } catch (error) {
        ElMessage.error('订单创建失败')
        console.error('订单创建失败:', error)
    } finally {
        loading.value = false
    }
}

// 重置表单
const handleReset = () => {
    Object.assign(form, {
        order_type: 'purchase',
        title: '',
        description: '',
        product_id: '',
        supplier_uid: '',
        quantity: 1,
        unit_price: 0,
        duration_days: 30
    })
}

onMounted(() => {
    // 这里可以初始化一些数据，比如获取当前用户ID等
})
</script>

<style scoped>
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.create-order {
    padding: 20px;
}
</style>