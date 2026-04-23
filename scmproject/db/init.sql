/*
Navicat Premium Dump SQL - FIXED for MariaDB 11.7.2

Source Server         : Mysql
Source Server Type    : MySQL
Source Server Version : 110702 (11.7.2-MariaDB)
Source Host           : localhost:3306
Source Schema         : scmproject

Target Server Type    : MySQL
Target Server Version : 110702 (11.7.2-MariaDB)
File Encoding         : 65001

Date: 23/11/2025 15:38:59 — Fixed on 2025-11-24
*/

SET NAMES utf8mb4;

SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for contacts
-- ----------------------------
DROP TABLE IF EXISTS `contacts`;

CREATE TABLE `contacts` (
    `id` int NOT NULL AUTO_INCREMENT,
    `user_id` int NOT NULL,
    `contact_id` int NOT NULL,
    `created_at` datetime NULL DEFAULT current_timestamp,
    PRIMARY KEY (`id`) USING BTREE,
    UNIQUE INDEX `unique_contact` (
        `user_id` ASC,
        `contact_id` ASC
    ) USING BTREE,
    INDEX `contact_id` (`contact_id` ASC) USING BTREE,
    CONSTRAINT `contacts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`uid`) ON DELETE CASCADE ON UPDATE RESTRICT,
    CONSTRAINT `contacts_ibfk_2` FOREIGN KEY (`contact_id`) REFERENCES `users` (`uid`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 22 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_uca1400_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of contacts
-- ----------------------------
INSERT INTO `contacts` VALUES ( 1, 1, 2, '2025-09-16 09:48:17' );

INSERT INTO `contacts` VALUES ( 2, 5, 1, '2025-09-16 10:18:56' );

INSERT INTO `contacts` VALUES ( 3, 5, 2, '2025-09-16 10:19:10' );

INSERT INTO `contacts` VALUES ( 4, 5, 3, '2025-09-16 10:19:16' );

INSERT INTO `contacts` VALUES ( 5, 5, 4, '2025-09-16 10:19:22' );

INSERT INTO `contacts` VALUES ( 6, 19, 20, '2025-10-09 09:16:11' );

INSERT INTO `contacts` VALUES ( 8, 19, 1, '2025-10-13 13:26:02' );

INSERT INTO `contacts` VALUES ( 9, 19, 3, '2025-10-13 13:26:14' );

INSERT INTO `contacts` VALUES ( 14, 19, 5, '2025-10-15 17:23:52' );

INSERT INTO `contacts` VALUES ( 15, 5, 19, '2025-10-15 17:23:52' );

INSERT INTO `contacts` VALUES ( 16, 19, 22, '2025-10-15 17:23:55' );

INSERT INTO `contacts` VALUES ( 17, 22, 19, '2025-10-15 17:23:55' );

INSERT INTO `contacts` VALUES ( 18, 19, 2, '2025-10-16 08:36:05' );

INSERT INTO `contacts` VALUES ( 19, 2, 19, '2025-10-16 08:36:05' );

INSERT INTO `contacts` VALUES ( 20, 19, 4, '2025-10-16 08:41:56' );

INSERT INTO `contacts` VALUES ( 21, 4, 19, '2025-10-16 08:41:56' );

-- ----------------------------
-- Table structure for inventory
-- ----------------------------
DROP TABLE IF EXISTS `inventory`;

CREATE TABLE `inventory` (
    `product_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
    `product_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
    `quantity` int NOT NULL DEFAULT 0,
    `alert_threshold` int NOT NULL DEFAULT 5,
    `company` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NULL DEFAULT NULL COMMENT '所属公司',
    PRIMARY KEY (`product_id`) USING BTREE,
    INDEX `idx_inventory_company` (`company` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_uca1400_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of inventory
-- ----------------------------
INSERT INTO `inventory` VALUES ( '1', 'iphone 18', 102, 5, 'CCIT' );

INSERT INTO `inventory` VALUES ( '101', '无线蓝牙耳机', 50, 10, 'CCIT' );

INSERT INTO
    `inventory`
VALUES (
        '2',
        'Huawei Mate70',
        7,
        5,
        'CCIT'
    );

INSERT INTO `inventory` VALUES ( '3', 'Redmi K80pro', 1, 5, 'CCIT' );

INSERT INTO `inventory` VALUES ('4', 'Honor 90', 0, 5, 'CCIT');

-- ----------------------------
-- Table structure for orders
-- ----------------------------
DROP TABLE IF EXISTS `orders`;

CREATE TABLE `orders` (
    `order_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp,
    `creator_uid` int NOT NULL,
    `customer_uid` int NOT NULL,
    `title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
    `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NULL,
    `quantity` int NULL DEFAULT NULL COMMENT '产品数量',
    `unit_price` decimal(10, 2) NULL DEFAULT NULL COMMENT '产品单价',
    `product_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NULL DEFAULT NULL,
    `duration_days` int NULL DEFAULT NULL COMMENT '产品有效期（天）',
    `order_status` enum(
        'draft',
        'pending_approval',
        'approved',
        'rejected',
        'confirmed',
        'processing',
        'completed',
        'cancelled'
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NULL DEFAULT NULL,
    `order_type` enum('purchase', 'sale', 'other') CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NULL DEFAULT 'purchase',
    PRIMARY KEY (`order_id`) USING BTREE,
    INDEX `fk_orders_creator` (`creator_uid` ASC) USING BTREE,
    INDEX `fk_customer_uid` (`customer_uid` ASC) USING BTREE,
    INDEX `fk_orders_product` (`product_id` ASC) USING BTREE,
    CONSTRAINT `fk_orders_creator` FOREIGN KEY (`creator_uid`) REFERENCES `users` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_orders_customer` FOREIGN KEY (`customer_uid`) REFERENCES `users` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_orders_product` FOREIGN KEY (`product_id`) REFERENCES `inventory` (`product_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_uca1400_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of orders
-- ----------------------------
INSERT INTO
    `orders`
VALUES (
        '1',
        '2025-09-16 10:45:34',
        5,
        1,
        'title',
        'tips',
        10,
        122.00,
        '1',
        13,
        'draft',
        'purchase'
    );

INSERT INTO
    `orders`
VALUES (
        '2',
        '2025-09-16 10:46:05',
        5,
        2,
        'title',
        'tips',
        20,
        222.00,
        '2',
        2,
        'completed',
        'purchase'
    );

INSERT INTO
    `orders`
VALUES (
        '2e1857ce-c9c1-4d49-9757-74ef95fe30b0',
        '2025-10-10 08:48:38',
        19,
        1,
        'test3',
        '1',
        1,
        1.00,
        '1',
        1,
        'approved',
        'purchase'
    );

INSERT INTO
    `orders`
VALUES (
        '2f4f75a9-14c7-4105-896f-5b9f8e2a30b5',
        '2025-10-10 08:32:00',
        19,
        2,
        '购买笔记本电脑',
        '高端游戏本订单',
        2,
        5999.00,
        '1',
        7,
        'rejected',
        'purchase'
    );

INSERT INTO
    `orders`
VALUES (
        '34c85684-0d8a-481e-a527-beb69402b324',
        '2025-10-10 08:40:53',
        19,
        1,
        'test2',
        '1',
        1,
        1.00,
        '1',
        1,
        'approved',
        'purchase'
    );

INSERT INTO
    `orders`
VALUES (
        '36d50cb0-de3b-4030-8c20-37b04d93e9ba',
        '2025-10-10 08:51:09',
        19,
        1,
        'test3',
        '2',
        2,
        2.00,
        '2',
        13,
        'approved',
        'purchase'
    );

INSERT INTO
    `orders`
VALUES (
        '4',
        '2025-09-18 09:31:11',
        2,
        5,
        'title',
        'tips',
        40,
        442.00,
        '2',
        3,
        'processing',
        'purchase'
    );

INSERT INTO
    `orders`
VALUES (
        '40191ebf-aaf8-11f0-9a74-00e04c8e8fdc',
        '2025-10-17 09:25:58',
        19,
        2,
        '创建订单',
        '1',
        1,
        1.00,
        '1',
        1,
        'approved',
        'purchase'
    );

INSERT INTO
    `orders`
VALUES (
        '4602873e-c06c-11f0-99d0-a4f93358357b',
        '2025-11-13 16:39:31',
        19,
        1,
        'aa',
        'aa',
        1,
        NULL,
        '1',
        30,
        'pending_approval',
        'purchase'
    );

INSERT INTO
    `orders`
VALUES (
        '4a2c39a9-215d-4933-81dc-493884b7e80a',
        '2025-10-14 10:20:48',
        19,
        1,
        'iphone18*10',
        'iphone18*10',
        10,
        10000.00,
        '1',
        1,
        'approved',
        'purchase'
    );

INSERT INTO
    `orders`
VALUES (
        '5',
        '2025-10-06 16:49:47',
        19,
        20,
        'title',
        'tips',
        6,
        112.00,
        '1',
        3,
        'approved',
        'purchase'
    );

INSERT INTO
    `orders`
VALUES (
        '5bc308fd-8a2c-4eee-8fbd-624bae196558',
        '2025-10-10 08:37:25',
        19,
        1,
        'test2',
        '1',
        1,
        1.00,
        '1',
        1,
        'pending_approval',
        'purchase'
    );

INSERT INTO
    `orders`
VALUES (
        '731190fa-a4bc-4ee0-b33d-051a9157b1df',
        '2025-10-10 12:18:37',
        19,
        20,
        '234',
        '234',
        1,
        1.00,
        '1',
        1,
        'approved',
        'purchase'
    );

INSERT INTO
    `orders`
VALUES (
        '75a927c6-1ff0-43b4-95fe-eda5e39be207',
        '2025-10-10 11:08:37',
        19,
        20,
        '1',
        '1',
        1,
        1.00,
        '1',
        1,
        'pending_approval',
        'purchase'
    );

INSERT INTO
    `orders`
VALUES (
        '82385b50-e50b-477b-876e-9006983b414b',
        '2025-10-15 17:35:28',
        19,
        22,
        '11111',
        '1',
        1,
        1.00,
        '101',
        1,
        'pending_approval',
        'purchase'
    );

INSERT INTO
    `orders`
VALUES (
        '880465a9-a61b-450b-91ae-d08a2e3012a9',
        '2025-10-10 11:11:59',
        19,
        20,
        '采购订单',
        '123',
        1,
        1.00,
        '1',
        1,
        'pending_approval',
        'purchase'
    );

INSERT INTO
    `orders`
VALUES (
        'd63e08e5-afb6-11f0-a287-00e04c8e8fdc',
        '2025-10-23 10:20:16',
        19,
        1,
        'it管理端创建订单测试',
        '1',
        1,
        2.00,
        '1',
        30,
        'pending_approval',
        'purchase'
    );

INSERT INTO
    `orders`
VALUES (
        'e826c7ad-4ca6-49db-894e-ab2580ba215e',
        '2025-10-10 07:57:15',
        19,
        2,
        '购买笔记本电脑',
        '高端游戏本订单',
        2,
        5999.00,
        '1',
        7,
        'pending_approval',
        'purchase'
    );

INSERT INTO
    `orders`
VALUES (
        'f1a3951e-b4f8-4a46-9fce-c31ba62fc3ea',
        '2025-10-13 13:35:21',
        19,
        3,
        '1',
        '1',
        1,
        1.00,
        '101',
        1,
        'pending_approval',
        'purchase'
    );

INSERT INTO
    `orders`
VALUES (
        'f274866e-dd93-41c4-bbcc-e9f38e1511f9',
        '2025-10-10 14:55:04',
        19,
        20,
        '1',
        '1',
        1,
        1.00,
        '1',
        1,
        'pending_approval',
        'purchase'
    );

INSERT INTO
    `orders`
VALUES (
        'f67467c5-aff0-11f0-a287-00e04c8e8fdc',
        '2025-10-23 17:16:17',
        19,
        1,
        '1',
        '1',
        1,
        NULL,
        '1',
        30,
        'pending_approval',
        'purchase'
    );

INSERT INTO
    `orders`
VALUES (
        'ORD001',
        '2025-09-10 08:57:08',
        1,
        2,
        '采购订单 - 蓝牙耳机',
        '首批采购50个蓝牙耳机',
        50,
        199.00,
        '101',
        10,
        'processing',
        'purchase'
    );

INSERT INTO
    `orders`
VALUES (
        'ORD002',
        '2025-09-16 14:15:34',
        5,
        2,
        'title',
        'tips',
        10,
        112.00,
        '2',
        1,
        'cancelled',
        'purchase'
    );

-- ----------------------------
-- Table structure for product_details
-- ----------------------------
DROP TABLE IF EXISTS `product_details`;

CREATE TABLE `product_details` (
    `detail_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
    `product_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
    `order_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
    `quantity` int NOT NULL,
    `reference_price` decimal(10, 2) NULL DEFAULT NULL,
    `cost_price` decimal(10, 2) NULL DEFAULT NULL,
    PRIMARY KEY (`detail_id`) USING BTREE,
    INDEX `product_id` (`product_id` ASC) USING BTREE,
    INDEX `order_id` (`order_id` ASC) USING BTREE,
    CONSTRAINT `product_details_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `inventory` (`product_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT `product_details_ibfk_2` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_uca1400_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of product_details
-- ----------------------------
INSERT INTO
    `product_details`
VALUES (
        1,
        '101',
        'ORD001',
        50,
        199.99,
        150.00
    );

INSERT INTO
    `product_details`
VALUES (
        2,
        '1',
        '1',
        50,
        2000.00,
        13231.00
    );

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
    `uid` int NOT NULL AUTO_INCREMENT,
    `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
    `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NULL DEFAULT NULL,
    `password` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
    `avatar_url` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NULL,
    `bio` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NULL,
    `company` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NULL DEFAULT NULL,
    `friends` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NULL,
    `role` enum(
        'admin',
        'purchase_manager',
        'warehouse_manager',
        'user'
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL DEFAULT 'user',
    PRIMARY KEY (`uid`) USING BTREE,
    UNIQUE INDEX `username` (`username` ASC) USING BTREE,
    UNIQUE INDEX `phone` (`phone` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 23 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_uca1400_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO
    `users`
VALUES (
        1,
        'AAA可乐批发张总',
        '17372178290',
        '$10$1mseTEacjYiupprI9tRtFOk2uFa0adlS.OMd64Old/GR.xsqloBma',
        NULL,
        '微软工程师',
        'MS',
        NULL,
        'user'
    );

INSERT INTO
    `users`
VALUES (
        2,
        'AAA五金批发李四',
        '17372178291',
        '$10$1mseTEacjYiupprI9tRtFOk2uFa0adlS.OMd64Old/GR.xsqloBma',
        NULL,
        '华为工程师',
        'company',
        NULL,
        'user'
    );

INSERT INTO
    `users`
VALUES (
        3,
        'AAA电器批发王五',
        '17372178292',
        '$10$1mseTEacjYiupprI9tRtFOk2uFa0adlS.OMd64Old/GR.xsqloBma',
        NULL,
        '小米工程师',
        'MJ',
        NULL,
        'user'
    );

INSERT INTO
    `users`
VALUES (
        4,
        'AAA家具批发赵六',
        '17372178293',
        '$10$1mseTEacjYiupprI9tRtFOk2uFa0adlS.OMd64Old/GR.xsqloBma',
        NULL,
        '阿里工程师',
        'FOMO',
        NULL,
        'user'
    );

INSERT INTO
    `users`
VALUES (
        5,
        'AAA水泥批发杜七',
        '17372178294',
        '$10$1mseTEacjYiupprI9tRtFOk2uFa0adlS.OMd64Old/GR.xsqloBma',
        NULL,
        '水泥供应商',
        'GRC',
        '',
        'user'
    );

INSERT INTO
    `users`
VALUES (
        19,
        'adminasda',
        '17372178295',
        '$2b$10$1mseTEacjYiupprI9tRtFOk2uFa0adlS.OMd64Old/GR.xsqloBma',
        NULL,
        '测试账户asdasd',
        'CCIT',
        NULL,
        'admin'
    );

INSERT INTO
    `users`
VALUES (
        20,
        '测试账户2',
        '17372178296',
        '$2b$10$Oge9d5sxiGjhCENDwElMJOg80H9pBLcAo3y9Y0uorAlSAmyUb1RPW',
        NULL,
        '测试账户',
        'CCIT',
        NULL,
        'user'
    );

INSERT INTO
    `users`
VALUES (
        22,
        '测试账户3',
        '17372178297',
        '$2b$10$gkWI8EMLKJOKuT8dDMJtPeDo5IixoBJDOGxbJaGIAXDWhXc3imAza',
        NULL,
        '测试账户',
        'CCIT',
        NULL,
        'user'
    );

SET FOREIGN_KEY_CHECKS = 1;