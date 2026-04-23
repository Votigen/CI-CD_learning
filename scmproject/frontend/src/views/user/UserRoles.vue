<template>
    <div class="user-roles">
        <el-card>
            <template #header>
                <div class="card-header">
                    <span>角色权限管理</span>
                    <div class="header-actions">
                        <el-button @click="refreshData" :loading="loading">
                            <el-icon>
                                <Refresh />
                            </el-icon>
                            刷新
                        </el-button>
                    </div>
                </div>
            </template>

            <!-- 角色统计 -->
            <div class="role-stats">
                <el-row :gutter="20">
                    <el-col :span="6" v-for="stat in roleStats" :key="stat.role">
                        <el-card shadow="hover" class="stat-card">
                            <div class="stat-content">
                                <div class="stat-number">{{ stat.count }}</div>
                                <div class="stat-label">{{ stat.label }}</div>
                                <el-tag :type="stat.type" size="small">{{ stat.roleName }}</el-tag>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>
            </div>

            <!-- 角色权限配置 -->
            <div class="permission-config">
                <h3>角色权限配置</h3>
                <el-table :data="rolePermissions" style="width: 100%" v-loading="loading">
                    <el-table-column prop="role" label="角色" width="120">
                        <template #default="scope">
                            <el-tag :type="getRoleType(scope.row.role)" effect="dark">
                                {{ getRoleName(scope.row.role) }}
                            </el-tag>
                        </template>
                    </el-table-column>

                    <el-table-column prop="description" label="角色描述" width="200" />

                    <el-table-column label="菜单权限">
                        <template #default="scope">
                            <div class="permission-tags">
                                <el-tag v-for="menu in scope.row.menus" :key="menu" size="small" class="permission-tag">
                                    {{ getMenuName(menu) }}
                                </el-tag>
                            </div>
                        </template>
                    </el-table-column>

                    <el-table-column label="操作权限">
                        <template #default="scope">
                            <div class="permission-tags">
                                <el-tag v-for="action in scope.row.actions" :key="action" size="small" type="info"
                                    class="permission-tag">
                                    {{ getActionName(action) }}
                                </el-tag>
                            </div>
                        </template>
                    </el-table-column>

                    <!-- <el-table-column label="操作" width="120" align="center">
                        <template #default="scope">
                            <el-button size="small" type="primary" @click="handleEditRole(scope.row)"
                                :disabled="scope.row.role === 'admin'">
                                编辑
                            </el-button>
                        </template>
                    </el-table-column> -->
                </el-table>
            </div>

            <!-- 用户角色分配 -->
            <div class="user-role-assignment">
                <h3>用户角色分配</h3>
                <div class="assignment-header">
                    <el-input v-model="userSearchKeyword" placeholder="搜索用户" style="width: 300px" clearable
                        @clear="filterUsers" @keyup.enter="filterUsers">
                        <template #append>
                            <el-button :icon="Search" @click="filterUsers" />
                        </template>
                    </el-input>

                    <el-select v-model="userRoleFilter" placeholder="按角色筛选" clearable @change="filterUsers"
                        style="width: 150px">
                        <el-option label="全部角色" value="" />
                        <el-option v-for="role in availableRoles" :key="role.value" :label="role.label"
                            :value="role.value" />
                    </el-select>
                </div>

                <el-table :data="filteredUsers" style="width: 100%" v-loading="loading">
                    <el-table-column prop="uid" label="ID" width="80" align="center" />
                    <el-table-column prop="username" label="用户名" min-width="120" />
                    <el-table-column prop="phone" label="手机号" width="150" />
                    <el-table-column prop="company" label="公司" min-width="150" show-overflow-tooltip />
                    <el-table-column prop="role" label="当前角色" width="120">
                        <template #default="scope">
                            <el-tag :type="getRoleType(scope.row.role)">
                                {{ getRoleName(scope.row.role) }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="新角色" width="180">
                        <template #default="scope">
                            <el-select v-model="scope.row.newRole" placeholder="选择角色" size="small"
                                @change="handleRoleChange(scope.row)"
                                :disabled="scope.row.role === 'admin' && !isCurrentUserAdmin">
                                <el-option v-for="role in availableRoles" :key="role.value" :label="role.label"
                                    :value="role.value" />
                            </el-select>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="100" align="center">
                        <template #default="scope">
                            <el-button size="small" type="success" @click="handleSaveRole(scope.row)"
                                :disabled="!scope.row.newRole || scope.row.newRole === scope.row.role"
                                :loading="scope.row.saving">
                                保存
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>

                <!-- 空状态 -->
                <div v-if="filteredUsers.length === 0 && !loading" class="empty-state">
                    <el-empty description="暂无用户数据或未找到匹配的用户" />
                </div>
            </div>
        </el-card>

        <!-- 编辑角色权限对话框 -->
        <el-dialog v-model="roleDialogVisible" :title="`编辑 ${editingRole ? getRoleName(editingRole.role) : ''} 权限`"
            width="600px" :before-close="handleRoleDialogClose">
            <div v-if="editingRole" class="role-edit-form">
                <el-form label-width="100px">
                    <el-form-item label="角色名称">
                        <el-tag :type="getRoleType(editingRole.role)" size="large">
                            {{ getRoleName(editingRole.role) }}
                        </el-tag>
                    </el-form-item>

                    <el-form-item label="角色描述">
                        <el-input v-model="editingRole.description" />
                    </el-form-item>

                    <el-form-item label="菜单权限">
                        <el-checkbox-group v-model="editingRole.menus">
                            <div class="permission-checkbox-group">
                                <el-checkbox v-for="menu in allMenus" :key="menu.value" :label="menu.value"
                                    :disabled="menu.required">
                                    {{ menu.label }}
                                    <el-tag v-if="menu.required" size="small" type="info">必需</el-tag>
                                </el-checkbox>
                            </div>
                        </el-checkbox-group>
                    </el-form-item>

                    <el-form-item label="操作权限">
                        <el-checkbox-group v-model="editingRole.actions">
                            <div class="permission-checkbox-group">
                                <el-checkbox v-for="action in allActions" :key="action.value" :label="action.value">
                                    {{ action.label }}
                                </el-checkbox>
                            </div>
                        </el-checkbox-group>
                    </el-form-item>
                </el-form>
            </div>

            <template #footer>
                <el-button @click="handleRoleDialogClose">取消</el-button>
                <el-button type="primary" @click="handleSaveRolePermissions">
                    保存权限
                </el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { getUsers, updateUser } from '@/api/user'

// Store
const userStore = useUserStore()

// 响应式数据
const loading = ref(false)
const roleDialogVisible = ref(false)
const userSearchKeyword = ref('')
const userRoleFilter = ref('')

const users = ref([])
const editingRole = ref(null)

// 可用的角色选项
const availableRoles = [
    { value: 'admin', label: '管理员' },
    { value: 'purchase_manager', label: '采购经理' },
    { value: 'warehouse_manager', label: '仓库管理员' },
    { value: 'user', label: '普通用户' }
]

// 所有菜单权限
const allMenus = [
    { value: '/dashboard', label: '仪表盘', required: true },
    { value: '/user/list', label: '用户管理', required: false },
    { value: '/user/roles', label: '角色权限', required: false },
    { value: '/inventory/products', label: '商品库存', required: false },
    { value: '/inventory/alerts', label: '库存预警', required: false },
    { value: '/order/create', label: '创建订单', required: false },
    { value: '/order/purchase', label: '采购订单', required: false },
    { value: '/order/sale', label: '销售订单', required: false },
    { value: '/order/approval', label: '订单审批', required: false },
    { value: '/reports', label: '报表统计', required: false }
]

// 所有操作权限
const allActions = [
    { value: 'user:view', label: '查看用户' },
    { value: 'user:create', label: '创建用户' },
    { value: 'user:edit', label: '编辑用户' },
    { value: 'user:delete', label: '删除用户' },
    { value: 'inventory:view', label: '查看库存' },
    { value: 'inventory:manage', label: '管理库存' },
    { value: 'order:create', label: '创建订单' },
    { value: 'order:view', label: '查看订单' },
    { value: 'order:approve', label: '审批订单' },
    { value: 'order:confirm', label: '确认订单' },
    { value: 'report:view', label: '查看报表' }
]

// 角色权限配置（这里可以后续从后端获取）
const rolePermissions = ref([
    {
        role: 'admin',
        description: '系统超级管理员，拥有所有权限',
        menus: allMenus.map(m => m.value),
        actions: allActions.map(a => a.value)
    },
    {
        role: 'purchase_manager',
        description: '采购管理人员，负责采购审批',
        menus: ['/dashboard', '/order/approval', '/order/purchase', '/inventory/products', '/reports'],
        actions: ['order:approve', 'order:view', 'order:create', 'inventory:view', 'report:view']
    },
    {
        role: 'warehouse_manager',
        description: '仓库管理人员，负责库存管理',
        menus: ['/dashboard', '/inventory/products', '/inventory/alerts', '/order/purchase'],
        actions: ['inventory:manage', 'order:confirm', 'order:view', 'inventory:view']
    },
    {
        role: 'user',
        description: '普通用户，基础操作权限',
        menus: ['/dashboard', '/order/create', '/order/purchase', '/order/sale'],
        actions: ['order:create', 'order:view']
    }
])

// 计算属性
const isCurrentUserAdmin = computed(() => userStore.userRole === 'admin')

// 角色统计
const roleStats = computed(() => {
    const stats = {}

    // 初始化统计
    availableRoles.forEach(role => {
        stats[role.value] = {
            role: role.value,
            roleName: role.label,
            count: 0,
            label: `${role.label}数量`,
            type: getRoleType(role.value)
        }
    })

    // 统计用户数量
    users.value.forEach(user => {
        if (stats[user.role]) {
            stats[user.role].count++
        }
    })

    return Object.values(stats)
})

// 筛选后的用户列表
const filteredUsers = computed(() => {
    let filtered = users.value

    // 关键词搜索
    if (userSearchKeyword.value) {
        const keyword = userSearchKeyword.value.toLowerCase()
        filtered = filtered.filter(user =>
            user.username.toLowerCase().includes(keyword) ||
            user.phone.includes(userSearchKeyword.value) ||
            (user.company && user.company.toLowerCase().includes(keyword))
        )
    }

    // 角色筛选
    if (userRoleFilter.value) {
        filtered = filtered.filter(user => user.role === userRoleFilter.value)
    }

    return filtered
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

const getMenuName = (menu) => {
    const menuObj = allMenus.find(m => m.value === menu)
    return menuObj ? menuObj.label : menu
}

const getActionName = (action) => {
    const actionObj = allActions.find(a => a.value === action)
    return actionObj ? actionObj.label : action
}

// 加载用户数据
const loadUsers = async () => {
    loading.value = true
    try {
        const response = await getUsers()
        users.value = response.map(user => ({
            ...user,
            newRole: user.role,
            saving: false
        }))
    } catch (error) {
        ElMessage.error('加载用户数据失败: ' + (error.message || '未知错误'))
    } finally {
        loading.value = false
    }
}

// 刷新数据
const refreshData = async () => {
    await loadUsers()
    ElMessage.success('数据已刷新')
}

// 筛选用户
const filterUsers = () => {
    // 计算属性自动处理筛选逻辑
}

// 处理角色变更
const handleRoleChange = (user) => {
    console.log(`用户 ${user.username} 角色变更为: ${user.newRole}`)
}

// 保存用户角色
const handleSaveRole = async (user) => {
    if (!user.newRole || user.newRole === user.role) {
        ElMessage.warning('请选择新的角色')
        return
    }

    try {
        user.saving = true

        await updateUser(user.uid, {
            role: user.newRole
        })

        // 更新本地数据
        user.role = user.newRole
        ElMessage.success(`用户 ${user.username} 角色已更新为 ${getRoleName(user.newRole)}`)
    } catch (error) {
        ElMessage.error('更新角色失败: ' + (error.message || '未知错误'))
        // 恢复原角色
        user.newRole = user.role
    } finally {
        user.saving = false
    }
}

// 编辑角色权限
const handleEditRole = (role) => {
    editingRole.value = JSON.parse(JSON.stringify(role))
    roleDialogVisible.value = true
}

// 关闭角色编辑对话框
const handleRoleDialogClose = () => {
    roleDialogVisible.value = false
    editingRole.value = null
}

// 保存角色权限
const handleSaveRolePermissions = () => {
    if (!editingRole.value) return

    // 这里应该调用后端 API 保存权限配置
    // 现在先模拟保存
    const index = rolePermissions.value.findIndex(r => r.role === editingRole.value.role)
    if (index !== -1) {
        rolePermissions.value[index] = editingRole.value
    }

    ElMessage.success('角色权限已更新')
    handleRoleDialogClose()
}

// 生命周期
onMounted(() => {
    loadUsers()
})
</script>

<style scoped>
.user-roles {
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

/* 角色统计样式 */
.role-stats {
    margin-bottom: 30px;
}

.stat-card {
    border-radius: 8px;
}

.stat-content {
    text-align: center;
    padding: 20px 0;
}

.stat-number {
    font-size: 32px;
    font-weight: bold;
    color: #409eff;
    margin-bottom: 8px;
}

.stat-label {
    font-size: 14px;
    color: #666;
    margin-bottom: 8px;
}

/* 权限配置样式 */
.permission-config {
    margin-bottom: 30px;
}

.permission-config h3,
.user-role-assignment h3 {
    margin-bottom: 16px;
    color: #303133;
    font-weight: 600;
}

.permission-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.permission-tag {
    margin: 2px;
}

/* 用户角色分配样式 */
.assignment-header {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    align-items: center;
}

.empty-state {
    padding: 40px 0;
    text-align: center;
}

/* 权限编辑表单样式 */
.permission-checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-height: 300px;
    overflow-y: auto;
    padding: 12px;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
}

.permission-checkbox-group .el-checkbox {
    margin-right: 0;
    padding: 4px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .role-stats .el-col {
        margin-bottom: 16px;
    }

    .assignment-header {
        flex-direction: column;
        align-items: stretch;
    }

    .assignment-header .el-input,
    .assignment-header .el-select {
        width: 100% !important;
    }
}
</style>