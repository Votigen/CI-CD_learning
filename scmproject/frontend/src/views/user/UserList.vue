<template>
    <div class="user-list">
        <el-card>
            <template #header>
                <div class="card-header">
                    <span>用户管理</span>
                    <div class="header-actions">
                        <el-button @click="refreshUsers" :loading="loading">
                            <el-icon>
                                <Refresh />
                            </el-icon>
                            刷新
                        </el-button>
                        <el-button type="primary" @click="handleCreate">
                            <el-icon>
                                <Plus />
                            </el-icon>
                            新增用户
                        </el-button>
                    </div>
                </div>
            </template>

            <!-- 搜索和筛选区域 -->
            <div class="search-container">
                <el-input v-model="searchKeyword" placeholder="搜索用户名、手机号或公司" style="width: 300px" clearable
                    @clear="handleSearch" @keyup.enter="handleSearch" @input="handleSearch">
                    <template #append>
                        <el-button :icon="Search" @click="handleSearch" />
                    </template>
                </el-input>

                <el-select v-model="roleFilter" placeholder="按角色筛选" clearable @change="handleSearch"
                    style="width: 150px">
                    <el-option label="全部角色" value="" />
                    <el-option label="管理员" value="admin" />
                    <el-option label="采购经理" value="purchase_manager" />
                    <el-option label="仓库管理员" value="warehouse_manager" />
                    <el-option label="普通用户" value="user" />
                </el-select>

                <el-button @click="resetSearch" :disabled="!hasSearchCondition">
                    <el-icon>
                        <RefreshRight />
                    </el-icon>
                    重置
                </el-button>

                <div class="search-result">
                    共找到 {{ filteredUserList.length }} 个用户
                    <span v-if="hasSearchCondition" class="search-tips">
                        (筛选条件:
                        <span v-if="searchKeyword">关键词"{{ searchKeyword }}"</span>
                        <span v-if="searchKeyword && roleFilter">, </span>
                        <span v-if="roleFilter">角色"{{ getRoleName(roleFilter) }}"</span>
                        )
                    </span>
                </div>
            </div>

            <!-- 用户表格 -->
            <el-table :data="filteredUserList" v-loading="loading" style="width: 100%"
                :default-sort="{ prop: 'uid', order: 'ascending' }" stripe border>
                <el-table-column prop="uid" label="ID" width="80" sortable align="center" />

                <el-table-column prop="username" label="用户名" min-width="120" sortable />

                <el-table-column prop="phone" label="手机号" width="150" />

                <el-table-column prop="company" label="公司" min-width="150" show-overflow-tooltip />

                <el-table-column prop="role" label="角色" width="120" sortable>
                    <template #default="scope">
                        <el-tag :type="getRoleType(scope.row.role)" effect="dark">
                            {{ getRoleName(scope.row.role) }}
                        </el-tag>
                    </template>
                </el-table-column>

                <el-table-column prop="bio" label="简介" min-width="200" show-overflow-tooltip />

                <el-table-column label="操作" width="220" fixed="right" align="center">
                    <template #default="scope">
                        <el-button size="small" type="primary" @click="handleEdit(scope.row)"
                            :disabled="scope.row.role === 'admin' && !isCurrentUserAdmin">
                            <el-icon>
                                <Edit />
                            </el-icon>
                            编辑
                        </el-button>
                        <el-button size="small" type="danger" @click="handleDelete(scope.row)"
                            :disabled="scope.row.uid === currentUserId || scope.row.role === 'admin'">
                            <el-icon>
                                <Delete />
                            </el-icon>
                            删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 空状态提示 -->
            <div v-if="filteredUserList.length === 0 && !loading" class="empty-state">
                <el-empty :description="hasSearchCondition ? '未找到匹配的用户' : '暂无用户数据'">
                    <template v-if="hasSearchCondition">
                        <el-button @click="resetSearch">清除筛选条件</el-button>
                    </template>
                    <template v-else>
                        <el-button @click="handleCreate">创建第一个用户</el-button>
                    </template>
                </el-empty>
            </div>
        </el-card>

        <!-- 新增/编辑用户对话框 -->
        <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" :before-close="handleClose"
            :close-on-click-modal="false">
            <el-form ref="userFormRef" :model="userForm" :rules="userRules" label-width="100px" status-icon>
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="userForm.username" placeholder="请输入用户名（3-50个字符）" maxlength="50"
                        show-word-limit />
                </el-form-item>

                <el-form-item label="手机号" prop="phone">
                    <el-input v-model="userForm.phone" placeholder="请输入11位手机号" maxlength="11" />
                </el-form-item>

                <el-form-item label="密码" prop="password" v-if="isCreate">
                    <el-input v-model="userForm.password" type="password" placeholder="请输入密码（至少6位）" show-password />
                </el-form-item>

                <el-form-item label="角色" prop="role">
                    <el-select v-model="userForm.role" placeholder="请选择角色" style="width: 100%">
                        <el-option label="管理员" value="admin" />
                        <el-option label="采购经理" value="purchase_manager" />
                        <el-option label="仓库管理员" value="warehouse_manager" />
                        <el-option label="普通用户" value="user" />
                    </el-select>
                </el-form-item>

                <el-form-item label="公司" prop="company">
                    <el-input v-model="userForm.company" placeholder="请输入公司名称" maxlength="100" show-word-limit />
                </el-form-item>

                <el-form-item label="简介" prop="bio">
                    <el-input v-model="userForm.bio" type="textarea" :rows="3" placeholder="请输入用户简介" maxlength="500"
                        show-word-limit resize="none" />
                </el-form-item>
            </el-form>

            <template #footer>
                <el-button @click="handleClose" :disabled="submitting">取消</el-button>
                <el-button type="primary" :loading="submitting" @click="handleSubmit">
                    {{ submitting ? '提交中...' : '确定' }}
                </el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
    Search,
    Plus,
    Refresh,
    RefreshRight,
    Edit,
    Delete
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { getUsers, createUser, updateUser, deleteUser } from '@/api/user'

// Store
const userStore = useUserStore()

// 响应式数据
const loading = ref(false)
const dialogVisible = ref(false)
const submitting = ref(false)
const searchKeyword = ref('')
const roleFilter = ref('')

const userList = ref([])

// 计算属性
const filteredUserList = computed(() => {
    if (!searchKeyword.value && !roleFilter.value) {
        return userList.value
    }

    const keyword = searchKeyword.value.toLowerCase()
    return userList.value.filter(user => {
        // 关键词搜索（用户名、手机号、公司）
        const keywordMatch = !searchKeyword.value ||
            (user.username && user.username.toLowerCase().includes(keyword)) ||
            (user.phone && user.phone.includes(searchKeyword.value)) ||
            (user.company && user.company.toLowerCase().includes(keyword))

        // 角色筛选
        const roleMatch = !roleFilter.value || user.role === roleFilter.value

        return keywordMatch && roleMatch
    })
})

const isCreate = computed(() => !userForm.uid)
const dialogTitle = computed(() => isCreate.value ? '新增用户' : '编辑用户')
const hasSearchCondition = computed(() => searchKeyword.value || roleFilter.value)
const currentUserId = computed(() => userStore.userInfo.userId)
const isCurrentUserAdmin = computed(() => userStore.userRole === 'admin')

// 表单数据
const userFormRef = ref()
const userForm = reactive({
    username: '',
    phone: '',
    password: '',
    role: '',
    company: '',
    bio: ''
})

// 表单验证规则
const userRules = reactive({
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 50, message: '用户名长度在 3 到 50 个字符', trigger: 'blur' }
    ],
    phone: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
    ],
    password: [
        {
            required: true,
            message: '请输入密码',
            trigger: 'blur',
            validator: (rule, value, callback) => {
                if (isCreate.value && (!value || value.length < 6)) {
                    callback(new Error('密码长度至少6个字符'))
                } else {
                    callback()
                }
            }
        }
    ],
    role: [
        { required: true, message: '请选择用户角色', trigger: 'change' }
    ],
    company: [
        { max: 100, message: '公司名称不能超过100个字符', trigger: 'blur' }
    ],
    bio: [
        { max: 500, message: '简介不能超过500个字符', trigger: 'blur' }
    ]
})

// 方法
const getRoleName = (role) => {
    const roleMap = {
        admin: '管理员',
        purchase_manager: '采购经理',
        warehouse_manager: '仓库管理员',
        user: '普通用户'
    }
    return roleMap[role] || role
}

const getRoleType = (role) => {
    const typeMap = {
        admin: 'danger',
        purchase_manager: 'warning',
        warehouse_manager: 'success',
        user: 'info'
    }
    return typeMap[role] || 'info'
}

// 加载用户列表
const loadUsers = async () => {
    loading.value = true
    try {
        const response = await getUsers()
        userList.value = response
        ElMessage.success(`成功加载 ${response.length} 个用户`)
    } catch (error) {
        ElMessage.error('加载用户列表失败: ' + (error.message || '未知错误'))
        console.error('加载用户列表错误:', error)
    } finally {
        loading.value = false
    }
}

// 刷新用户列表
const refreshUsers = async () => {
    await loadUsers()
    ElMessage.info('用户列表已刷新')
}

// 搜索用户
const handleSearch = () => {
    // 搜索逻辑由 computed 属性自动处理
    console.log('搜索条件:', {
        keyword: searchKeyword.value,
        role: roleFilter.value,
        resultCount: filteredUserList.value.length
    })
}

// 重置搜索
const resetSearch = () => {
    searchKeyword.value = ''
    roleFilter.value = ''
    ElMessage.info('搜索条件已重置')
}

// 打开新增对话框
const handleCreate = () => {
    Object.assign(userForm, {
        uid: undefined,
        username: '',
        phone: '',
        password: '',
        role: '',
        company: '',
        bio: ''
    })
    dialogVisible.value = true
}

// 打开编辑对话框
const handleEdit = (user) => {
    Object.assign(userForm, {
        uid: user.uid,
        username: user.username,
        phone: user.phone,
        role: user.role,
        company: user.company || '',
        bio: user.bio || ''
    })
    dialogVisible.value = true
}

// 关闭对话框
const handleClose = () => {
    if (submitting.value) {
        ElMessage.warning('正在提交数据，请稍候...')
        return
    }

    dialogVisible.value = false
    // 延迟重置表单，避免动画冲突
    setTimeout(() => {
        userFormRef.value?.resetFields()
    }, 300)
}

// 提交表单
const handleSubmit = async () => {
    if (!userFormRef.value) return

    try {
        const valid = await userFormRef.value.validate()
        if (!valid) return

        submitting.value = true

        if (isCreate.value) {
            // 新增用户
            await createUser(userForm)
            ElMessage.success('用户创建成功')
        } else {
            // 编辑用户 - 移除密码字段
            const { password, ...updateData } = userForm
            await updateUser(userForm.uid, updateData)
            ElMessage.success('用户更新成功')
        }

        handleClose()
        await loadUsers()
    } catch (error) {
        console.error('提交表单错误:', error)
        ElMessage.error('操作失败: ' + (error.message || '未知错误'))
    } finally {
        submitting.value = false
    }
}

// 删除用户
const handleDelete = async (user) => {
    try {
        await ElMessageBox.confirm(
            `确定要删除用户 "${user.username}" 吗？此操作不可恢复！`,
            '删除确认',
            {
                confirmButtonText: '确定删除',
                cancelButtonText: '取消',
                type: 'warning',
                confirmButtonClass: 'el-button--danger',
                beforeClose: async (action, instance, done) => {
                    if (action === 'confirm') {
                        instance.confirmButtonLoading = true
                        instance.confirmButtonText = '删除中...'

                        try {
                            await deleteUser(user.uid)
                            ElMessage.success('用户删除成功')
                            await loadUsers()
                            done()
                        } catch (error) {
                            ElMessage.error('删除失败: ' + (error.message || '未知错误'))
                            instance.confirmButtonLoading = false
                            instance.confirmButtonText = '确定删除'
                        }
                    } else {
                        done()
                    }
                }
            }
        )
    } catch (error) {
        // 用户取消删除
        if (error !== 'cancel') {
            console.error('删除用户错误:', error)
        }
    }
}

// 生命周期
onMounted(() => {
    loadUsers()
})
</script>

<style scoped>
.user-list {
    padding: 0;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
}

.header-actions {
    display: flex;
    gap: 12px;
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

.search-tips {
    color: #999;
    font-size: 12px;
}

.empty-state {
    padding: 60px 0;
    text-align: center;
}

/* 表格样式优化 */
:deep(.el-table) {
    font-size: 14px;
}

:deep(.el-table .cell) {
    padding: 8px 12px;
}

:deep(.el-table th) {
    background-color: #f5f7fa;
    font-weight: 600;
    color: #303133;
}

/* 操作按钮样式 */
:deep(.el-button--small) {
    padding: 6px 12px;
    font-size: 12px;
}

/* 对话框样式优化 */
:deep(.el-dialog__body) {
    padding: 20px;
}

:deep(.el-form-item__label) {
    font-weight: 500;
}
</style>