// src/api/user.js
import request from '@/utils/request'

// 用户登录
export const login = (loginData) => {
    return request.post('/login/login', loginData)
}

export const logout = () => {
    return Promise.resolve({ message: '退出成功' })
}


// 获取所有用户
export const getUsers = () => {
    return request.get('/users/users')
}

// 获取所有用户（排除当前用户）
export const getUsersExcludeCurrent = () => {
    return request.get('/users/users2')
}

// 获取用户详情
export const getUserDetail = (id) => {
    return request.get(`/users/users/${id}`)
}

// 获取用户公开信息
export const getUserPublicInfo = (id) => {
    return request.get(`/users/public/${id}`)
}

// 创建用户（注册）
export const createUser = (userData) => {
    return request.post('/users/register', userData)
}

// 更新用户
export const updateUser = (id, userData) => {
    return request.put(`/users/users/${id}`, userData)
}

// 删除用户
export const deleteUser = (id) => {
    return request.delete(`/users/users/${id}`)
}