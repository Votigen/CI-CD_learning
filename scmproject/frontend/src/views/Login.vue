<template>
    <div class="login-container">
        <el-card class="login-box">
            <h2>IT 管理端登录</h2>
            <el-form :model="loginForm" :rules="rules" ref="loginFormRef" label-width="0">
                <el-form-item prop="username">
                    <el-input v-model="loginForm.username" placeholder="请输入手机号" :prefix-icon="User" size="large" />
                </el-form-item>
                <el-form-item prop="password">
                    <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" :prefix-icon="Lock"
                        show-password size="large" @keyup.enter="handleLogin" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" style="width: 100%;" :loading="loading" @click="handleLogin" size="large">
                        {{ loading ? '登录中...' : '登录' }}
                    </el-button>
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const loginFormRef = ref()
const loading = ref(false)

const loginForm = reactive({
    username: '', // 这里实际是手机号
    password: ''
})

const rules = {
    username: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        {
            pattern: /^1[3-9]\d{9}$/,
            message: '请输入正确的手机号格式',
            trigger: 'blur'
        }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
    ]
}

const handleLogin = async () => {
    if (!loginFormRef.value) return

    try {
        const valid = await loginFormRef.value.validate()
        if (!valid) return

        loading.value = true

        // 调用登录，参数会自动转换
        await userStore.login(loginForm)

        ElMessage.success('登录成功')
        router.push('/')

    } catch (error) {
        console.error('登录错误:', error)
        // 显示后端返回的错误信息
        ElMessage.error(error.message || '登录失败，请检查手机号和密码')
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
    width: 400px;
    padding: 40px 30px;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.login-box h2 {
    text-align: center;
    margin-bottom: 30px;
    color: #333;
    font-weight: 600;
}
</style>