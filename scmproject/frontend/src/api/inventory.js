// src/api/inventory.js
import request from '@/utils/request'

// 获取所有库存
export const getInventory = () => {
    return request.get('/inventory/inventory')
}

// 获取库存详情
export const getInventoryDetail = (id) => {
    return request.get(`/inventory/inventory/${id}`)
}

// 创建库存
export const createInventory = (inventoryData) => {
    return request.post('/inventory/inventory', inventoryData)
}

// 更新库存
export const updateInventory = (id, inventoryData) => {
    return request.put(`/inventory/inventory/${id}`, inventoryData)
}

// 删除库存
export const deleteInventory = (id) => {
    return request.delete(`/inventory/inventory/${id}`)
}