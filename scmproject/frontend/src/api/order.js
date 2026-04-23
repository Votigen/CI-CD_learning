// src/api/order.js
import request from '@/utils/request'

// 创建订单
export const createOrder = (data) => {
    return request.post('/orders/orders', data)
}

// 获取我的订单（创建者订单）
export const getOrdersByCreator = () => {
    return request.get('/orders/orders')
}

// 获取购买人订单
export const getOrdersByCustomer = () => {
    return request.get('/orders/buy')
}

// 获取订单详情
export const getOrderDetail = (id) => {
    return request.get(`/orders/orders/${id}`)
}

// 获取订单详情（含计算）
export const getOrderDetailWithCalc = (id) => {
    return request.get(`/orders/orderss/${id}`)
}

// 分页查询购买订单
export const getPurchaseOrders = (params = {}) => {
    return request.get('/orders/purchase', params)
}

// 分页查询供应订单
export const getSupplyOrders = (params = {}) => {
    return request.get('/orders/supply', params)
}

// 获取待审批订单列表
export const getPendingApprovalOrders = () => {
    return request.get('/orders/approval/pending')
}

// 审批订单
export const approveOrder = (orderId, data) => {
    return request.post(`/orders/${orderId}/approve`, data)
}

// 更新订单
export const updateOrder = (id, data) => {
    return request.put(`/orders/orders/${id}`, data)
}

// 删除订单
export const deleteOrder = (id) => {
    return request.delete(`/orders/orders/${id}`)
}

// 导出所有方法
export default {
    createOrder,
    getOrdersByCreator,
    getOrdersByCustomer,
    getOrderDetail,
    getOrderDetailWithCalc,
    getPurchaseOrders,
    getSupplyOrders,
    getPendingApprovalOrders,
    approveOrder,
    updateOrder,
    deleteOrder
}