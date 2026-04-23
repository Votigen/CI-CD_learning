import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as apiLogin } from '@/api/user'

export const useUserStore = defineStore('user', () => {
    // State
    const token = ref('')
    const userInfo = ref({})

    // Getter
    const isLoggedIn = computed(() => !!token.value)
    const userName = computed(() => userInfo.value.username || userInfo.value.name || '管理员')
    const userRole = computed(() => userInfo.value.role || '')

    // Actions
    function setToken(newToken) {
        token.value = newToken
        if (newToken) {
            localStorage.setItem('access_token', newToken)
        } else {
            localStorage.removeItem('access_token')
        }
    }

    function setUserInfo(info) {
        userInfo.value = info
    }

    // 登录 action
    async function login(loginData) {
        try {
            const backendLoginData = {
                phone: loginData.username,
                password: loginData.password
            }

            const response = await apiLogin(backendLoginData)

            if (response.token) {
                const userToken = response.token
                setToken(userToken)
                await fetchUserInfoFromToken(userToken)
                return Promise.resolve(response)
            } else {
                return Promise.reject(new Error(response.message || '登录失败'))
            }
        } catch (error) {
            return Promise.reject(error)
        }
    }

    // 从 token 中解析用户信息（JWT）
    function parseUserInfoFromToken(token) {
        try {
            const payload = token.split('.')[1]
            const decoded = JSON.parse(atob(payload))
            return {
                userId: decoded.userId,
                username: decoded.username,
                role: decoded.role
            }
        } catch (error) {
            console.error('解析 token 失败:', error)
            return {
                username: '管理员',
                role: 'admin'
            }
        }
    }

    // 根据 token 获取用户信息
    async function fetchUserInfoFromToken(token) {
        try {
            const userInfoFromToken = parseUserInfoFromToken(token)
            setUserInfo(userInfoFromToken)
        } catch (error) {
            console.error('获取用户信息失败:', error)
            setUserInfo({
                username: '管理员',
                role: 'admin'
            })
        }
    }

    // 退出登录
    async function logout() {
        try {
            // 如果有后端退出接口，可以在这里调用
            // await apiLogout()
        } catch (error) {
            console.error('退出登录时出错:', error)
        } finally {
            // 清除本地状态
            token.value = ''
            userInfo.value = {}
            localStorage.removeItem('access_token')
        }
    }

    // 应用启动时初始化用户信息 - 确保这个函数存在
    async function initUserInfo() {
        const savedToken = localStorage.getItem('access_token')
        if (savedToken) {
            setToken(savedToken)
            await fetchUserInfoFromToken(savedToken)
        }
    }

    return {
        token,
        userInfo,
        isLoggedIn,
        userName,
        userRole,
        setToken,
        setUserInfo,
        login,
        logout,
        initUserInfo, // 确保导出这个函数
    }
})