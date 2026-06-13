'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ComposedChart, Line,
  TooltipProps
} from 'recharts'
import {
  Cpu, CheckCircle2, AlertTriangle, Package,
  Box, TestTube2, TrendingUp, Activity,
  Zap, Shield, BarChart3, Target,
  ArrowUpRight, ArrowDownRight, Clock, Database,
  Factory, Wrench, Layers, AlertCircle, Siren,
  Badge, Search, Plus, FileText, Upload,
  LayoutDashboard, ClipboardList, FlaskConical, BarChart2,
  Truck, ChevronRight, XCircle, CheckCircle, Save, X,
  BatteryCharging, Thermometer, Users, UserX, Trash2,
  History, UserPlus, Wifi, WifiOff, Timer, Printer, QrCode, ScanBarcode, FileUp, FileSpreadsheet,
  ClipboardCheck, PackageCheck, Fingerprint, Cog, Grid3X3, Eye, Settings, Pencil, ChevronDown, Lock, LogOut,
  BookOpen, Download, FolderPlus, File, MoreVertical, FolderOpen
} from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogClose
} from '@/components/ui/dialog'

/* ================================================================
   数据定义
   ================================================================ */

const timeOptions = [
  { key: 'today', label: '今日' },
  { key: 'yesterday', label: '昨日' },
  { key: 'thisWeek', label: '本周' },
  { key: 'lastWeek', label: '上周' },
  { key: 'thisMonth', label: '本月' },
  { key: 'lastMonth', label: '上月' },
  { key: 'thisYear', label: '今年' },
  { key: 'lastYear', label: '去年' },
]

const navItems = [
  { key: 'dashboard', label: '数据看板', icon: LayoutDashboard },
  { key: 'material', label: '物料台账', icon: ClipboardList },
  { key: 'workOrder', label: '生产工单', icon: ClipboardCheck },
  { key: 'labelPrint', label: '标签打印', icon: Printer },
  { key: 'semiTest', label: 'PCB测试', icon: FlaskConical },
  { key: 'cellPackTest', label: '电芯派克', icon: BatteryCharging },
  { key: 'assembly', label: '成品组装', icon: Wrench },
  { key: 'newSemiTest', label: '半成品测试', icon: TestTube2 },
  { key: 'productTest', label: '成品测试', icon: BarChart2 },
  { key: 'agingTest', label: '老化测试', icon: Thermometer },
  { key: 'packaging', label: '设备装箱', icon: Truck },
  { key: 'documentLibrary', label: '资料库', icon: BookOpen },
  { key: 'personnel', label: '人员管理', icon: Users },
]

/* 工段与菜单项的映射关系 - 登录后根据选择的工段过滤侧边栏菜单 */
const SECTION_NAV_MAP: Record<string, string[]> = {
  'PCB测试': ['semiTest', 'workOrder', 'documentLibrary'],
  '半成品测试': ['newSemiTest', 'workOrder', 'documentLibrary'],
  '成品测试': ['productTest', 'workOrder', 'documentLibrary'],
  '物料管理': ['material', 'workOrder', 'documentLibrary'],
  '老化测试': ['agingTest', 'workOrder', 'documentLibrary'],
  '设备装箱': ['packaging', 'workOrder', 'documentLibrary'],
  '电芯派克': ['cellPackTest', 'workOrder', 'documentLibrary'],
  '系统管理': ['dashboard', 'personnel', 'workOrder', 'documentLibrary'],
}

/* 工段选项列表 */
const LOGIN_SECTION_OPTIONS = ['PCB测试', '半成品测试', '成品测试', '物料管理', '老化测试', '设备装箱', '电芯派克', '系统管理']

/* 模拟用户数据 */
const LOGIN_USERS = [
  { account: 'admin', password: 'admin123', name: '总管理员', role: '总管理员', sections: ['系统管理', 'PCB测试', '半成品测试', '成品测试', '物料管理', '老化测试', '设备装箱', '电芯派克'], isSuperAdmin: true },
  { account: 'zhangsan', password: '123456', name: '张三', role: '生产管理员', sections: ['系统管理', 'PCB测试', '成品测试', '物料管理', '老化测试', '设备装箱', '电芯派克', '半成品测试'] },
  { account: 'lisi', password: '123456', name: '李四', role: '操作员', sections: ['PCB测试', '半成品测试'] },
  { account: 'wangwu', password: '123456', name: '王五', role: '操作员', sections: ['成品测试'] },
  { account: 'zhaoliu', password: '123456', name: '赵六', role: '查看者', sections: ['物料管理', '半成品测试'] },
  { account: 'qianqi', password: '123456', name: '钱七', role: '操作员', sections: ['老化测试'] },
  { account: 'sunba', password: '123456', name: '孙八', role: '查看者', sections: ['设备装箱'] },
  { account: 'zhoujiu', password: '123456', name: '周九', role: '管理员', sections: ['系统管理', '物料管理'] },
  { account: 'wushi', password: '123456', name: '吴十', role: '操作员', sections: ['电芯派克', '老化测试'] },
]

interface KPICard {
  title: string; value: number; unit: string; trend?: string; trendType?: 'up' | 'down' | 'neutral'
  target?: number; status?: 'pass' | 'fail' | 'normal'; icon: React.ComponentType<{ className?: string }>
  color: string; shadowCls: string; decimals?: number; category: string
}

const kpiData: KPICard[] = [
  { title: '机柜产出', value: 2845, unit: '台', trend: '+5.2%', trendType: 'up', icon: Cpu, color: '#0891b2', shadowCls: 'shadow-cyan', category: '机柜' },
  { title: '机柜合格率', value: 98, unit: '%', target: 98, status: 'pass', icon: CheckCircle2, color: '#059669', shadowCls: 'shadow-green', category: '机柜' },
  { title: '单宝产出', value: 2845, unit: '个', trend: '+5.2%', trendType: 'up', icon: Zap, color: '#7c3aed', shadowCls: 'shadow-purple', category: '单宝' },
  { title: '单宝合格率', value: 98, unit: '%', target: 98, status: 'pass', icon: Shield, color: '#059669', shadowCls: 'shadow-green', category: '单宝' },
  { title: '物料到货批次', value: 96, unit: '批', icon: Package, color: '#d97706', shadowCls: 'shadow-amber', category: '物料' },
  { title: '物料合格率', value: 96.2, unit: '%', trend: '-0.3%', trendType: 'down', icon: Target, color: '#e11d48', shadowCls: 'shadow-rose', decimals: 1, category: '物料' },
  { title: '半成品测试', value: 1000, unit: '台', trend: '+5.2%', trendType: 'up', icon: TestTube2, color: '#0891b2', shadowCls: 'shadow-cyan', category: '半成品' },
  { title: '半成品通过率', value: 98, unit: '%', target: 98, status: 'pass', icon: CheckCircle2, color: '#059669', shadowCls: 'shadow-green', category: '半成品' },
  { title: '成品测试', value: 1000, unit: '台', trend: '+5.2%', trendType: 'up', icon: Activity, color: '#7c3aed', shadowCls: 'shadow-purple', category: '成品' },
  { title: '成品通过率', value: 98, unit: '%', target: 98, status: 'pass', icon: CheckCircle2, color: '#059669', shadowCls: 'shadow-green', category: '成品' },
  { title: '已装总箱数', value: 15600, unit: '箱', icon: Box, color: '#d97706', shadowCls: 'shadow-amber', category: '装箱' },
  { title: '已装总单宝数', value: 15600, unit: '个', icon: Database, color: '#0891b2', shadowCls: 'shadow-cyan', category: '装箱' },
]

const anomalyItems = [
  { label: '机柜异常率', value: 2, unit: '%', level: 'warning' as const },
  { label: '单宝异常率', value: 2, unit: '%', level: 'warning' as const },
  { label: '物料异常率', value: 3.8, unit: '%', level: 'danger' as const },
  { label: '半成品异常率', value: 2, unit: '%', level: 'warning' as const },
  { label: '成品异常率', value: 2, unit: '%', level: 'warning' as const },
]

const trendData = [
  { time: '08:00', semiTest: 400, finishedProduct: 350, cabinetOutput: 380 },
  { time: '10:00', semiTest: 850, finishedProduct: 800, cabinetOutput: 820 },
  { time: '12:00', semiTest: 1300, finishedProduct: 1250, cabinetOutput: 1280 },
  { time: '14:00', semiTest: 1900, finishedProduct: 1800, cabinetOutput: 1850 },
  { time: '16:00', semiTest: 2400, finishedProduct: 2350, cabinetOutput: 2380 },
  { time: '18:00', semiTest: 2900, finishedProduct: 2845, cabinetOutput: 2845 },
]
const testingPieData = [
  { name: '准许入库', value: 2845, color: '#059669' },
  { name: '异常隔离', value: 41, color: '#e11d48' },
]
const supplierData = [
  { name: '宁德新能源', rate: 99.8, fill: '#059669' },
  { name: '立讯精密', rate: 99.5, fill: '#0891b2' },
  { name: '外壳厂商', rate: 98.2, fill: '#7c3aed' },
  { name: '线材辅料', rate: 85.5, fill: '#e11d48' },
]
const defectData = [
  { name: '过放测试', count: 18, fill: '#e11d48' },
  { name: '内阻超标', count: 12, fill: '#d97706' },
  { name: '自耗电异常', count: 6, fill: '#7c3aed' },
  { name: '温度异常', count: 3, fill: '#0891b2' },
  { name: '短路', count: 2, fill: '#059669' },
]
const materialPieData = [
  { name: '电芯(合格)', value: 5000, color: '#059669' },
  { name: '保护板(合格)', value: 2000, color: '#0891b2' },
  { name: 'PCB(合格)', value: 2000, color: '#7c3aed' },
  { name: '外壳(合格)', value: 2000, color: '#d97706' },
  { name: '线材(不合格)', value: 2000, color: '#e11d48' },
  { name: '辅料(不合格)', value: 2000, color: '#dc2626' },
]
const radarData = [
  { dimension: '物料质量', value: 96.2, fullMark: 100 },
  { dimension: '半成品合格', value: 98, fullMark: 100 },
  { dimension: '成品合格', value: 98, fullMark: 100 },
  { dimension: '机柜合格', value: 98, fullMark: 100 },
  { dimension: '单宝合格', value: 98, fullMark: 100 },
  { dimension: '装箱达标', value: 100, fullMark: 100 },
]
const gaugeData = [
  { name: '物料合格', value: 96.2, fill: '#d97706' },
  { name: '半成品', value: 98, fill: '#0891b2' },
  { name: '成品', value: 98, fill: '#059669' },
  { name: '机柜', value: 98, fill: '#7c3aed' },
]
const weeklyData = [
  { day: '周一', output: 420, pass: 412, fail: 8 },
  { day: '周二', output: 450, pass: 441, fail: 9 },
  { day: '周三', output: 480, pass: 472, fail: 8 },
  { day: '周四', output: 460, pass: 450, fail: 10 },
  { day: '周五', output: 510, pass: 502, fail: 8 },
  { day: '周六', output: 380, pass: 373, fail: 7 },
  { day: '周日', output: 145, pass: 142, fail: 3 },
]
const packagingData = [
  { name: '已装箱', value: 15600, color: '#0891b2' },
  { name: '已装机柜', value: 15600, color: '#7c3aed' },
  { name: '已装单宝', value: 15600, color: '#059669' },
]

/* 物料台账数据 */
const materialData = [
  { batch: 'B20231024-CELL-01', name: '电芯', supplier: '宁德新能源', supplierId: 'SUP-ND-001', storageLocation: 'A区-01号仓', brandName: '宁德时代', spec: '10000mAh 聚合物', qty: 5000, startCode: '0001', endCode: '5000', boundOrderQty: 3200, completedQty: 2800, result: '合格' as const, arrival: '2023-10-24 09:30', testDate: '2023-10-25 09:31' },
  { batch: 'B20231024-PCB-02', name: '保护板', supplier: '立讯精密', supplierId: 'SUP-LX-002', storageLocation: 'B区-03号仓', brandName: '立讯', spec: 'V2.1 主控板', qty: 2000, startCode: '0001', endCode: '2000', boundOrderQty: 1500, completedQty: 1200, result: '合格' as const, arrival: '2023-10-24 11:15', testDate: '2023-10-25 09:32' },
  { batch: 'B20231024-PCB-03', name: 'PCB', supplier: '立讯精密', supplierId: 'SUP-LX-002', storageLocation: 'B区-05号仓', brandName: '立讯', spec: '0.6mm', qty: 2000, startCode: '0001', endCode: '2000', boundOrderQty: 1800, completedQty: 1600, result: '合格' as const, arrival: '2023-10-24 11:15', testDate: '2023-10-25 09:33' },
  { batch: 'B20231024-PCB-04', name: '外壳', supplier: '立讯精密', supplierId: 'SUP-LX-002', storageLocation: 'C区-02号仓', brandName: '立讯', spec: '--', qty: 2000, startCode: '0001', endCode: '2000', boundOrderQty: 1000, completedQty: 850, result: '合格' as const, arrival: '2023-10-24 11:15', testDate: '2023-10-25 09:34' },
  { batch: 'B20231024-PCB-05', name: '线材', supplier: '立讯精密', supplierId: 'SUP-LX-003', storageLocation: 'D区-01号仓', brandName: '远东', spec: '--', qty: 2000, startCode: '0001', endCode: '2000', boundOrderQty: 0, completedQty: 0, result: '不合格' as const, arrival: '2023-10-24 11:15', testDate: '2023-10-25 09:35' },
  { batch: 'B20231024-PCB-06', name: '辅料', supplier: '立讯精密', supplierId: 'SUP-LX-003', storageLocation: 'D区-04号仓', brandName: '远东', spec: '--', qty: 2000, startCode: '0001', endCode: '2000', boundOrderQty: 0, completedQty: 0, result: '不合格' as const, arrival: '2023-10-24 11:15', testDate: '2023-10-25 09:36' },
  { batch: 'B20231024-CELL-07', name: '电芯', supplier: '赣锋锂业', supplierId: 'SUP-GF-004', storageLocation: 'A区-02号仓', brandName: '赣锋', spec: '20000mAh 聚合物', qty: 3000, startCode: '0001', endCode: '3000', boundOrderQty: 0, completedQty: 0, result: '待测试' as const, arrival: '2023-10-25 08:20', testDate: '' },
  { batch: 'B20231024-PCB-08', name: '连接器', supplier: '中航光电', supplierId: 'SUP-ZH-005', storageLocation: 'B区-06号仓', brandName: '中航', spec: 'Type-C 2.0', qty: 4000, startCode: '0001', endCode: '4000', boundOrderQty: 0, completedQty: 0, result: '待测试' as const, arrival: '2023-10-25 10:45', testDate: '' },
  { batch: 'B20231024-PCB-09', name: '热敏电阻', supplier: '华工正源', supplierId: 'SUP-HG-006', storageLocation: 'C区-04号仓', brandName: '华工', spec: 'NTC 10K', qty: 1500, startCode: '0001', endCode: '1500', boundOrderQty: 0, completedQty: 0, result: '待测试' as const, arrival: '2023-10-25 14:10', testDate: '' },
]

/* 半成品/成品测试数据 */
const testRecords = [
  { sn: 'SN8839201992', pcb: 'PCB-8893-X', cell: 'CELL-8893-X', operator: '工号: A012', time: '14:22:31', result: 'pass', productModel: 'PB-10000mAh-A', overcharge: '4.22V', overcurrent: '2.1A' },
  { sn: 'SN8839201993', pcb: 'PCB-8894-X', cell: 'CELL-8894-X', operator: '工号: B011', time: '14:23:05', result: 'fail', productModel: 'PB-10000mAh-A', overcharge: '4.35V', overcurrent: '3.2A' },
  { sn: 'SN8839201994', pcb: 'PCB-8895-X', cell: 'CELL-8895-X', operator: '工号: A013', time: '14:25:12', result: 'pass', productModel: 'PB-20000mAh-B', overcharge: '4.20V', overcurrent: '1.8A' },
  { sn: 'SN8839201995', pcb: 'PCB-8896-X', cell: 'CELL-8896-X', operator: '工号: C009', time: '14:28:33', result: 'pass', productModel: 'PB-20000mAh-B', overcharge: '4.23V', overcurrent: '2.0A' },
  { sn: 'SN8839201996', pcb: 'PCB-8897-X', cell: 'CELL-8897-X', operator: '工号: B012', time: '14:30:41', result: 'fail', productModel: 'PB-10000mAh-A', overcharge: '4.38V', overcurrent: '3.5A' },
  { sn: 'SN8839201997', pcb: 'PCB-8898-X', cell: 'CELL-8898-X', operator: '工号: A014', time: '14:32:55', result: 'pass', productModel: 'PB-20000mAh-B', overcharge: '4.21V', overcurrent: '1.9A' },
]

/* 电芯派克 - 正在测试数据 */
const cellPackTestingData = [
  { sn: 'CP-20260511-001', voltage: 3.72, current: 2.15, temperature: 32.5, progress: 68, elapsed: '12:35', testItem: '充放电循环测试' },
  { sn: 'CP-20260511-002', voltage: 3.85, current: 1.80, temperature: 28.3, progress: 42, elapsed: '07:20', testItem: '容量检测' },
  { sn: 'CP-20260511-003', voltage: 3.68, current: 2.50, temperature: 35.1, progress: 85, elapsed: '18:42', testItem: '内阻测试' },
]

/* 电芯派克 - 已完成数据 */
const cellPackCompletedData = [
  { sn: 'CP-20260510-011', voltage: 3.82, temperature: 30.2, result: 'pass', duration: '25:18', testTime: '2026-05-10 09:15', brand: '亿纬锂能', model: '1260110', type: '软包', productModel: 'PB-10000mAh-A', workOrder: 'WO-2026-0501' },
  { sn: 'CP-20260510-012', voltage: 3.45, temperature: 42.8, result: 'fail', duration: '18:33', testTime: '2026-05-10 09:42', brand: '赣锋锂业', model: '126280', type: '软包', productModel: 'PB-10000mAh-A', workOrder: 'WO-2026-0501' },
  { sn: 'CP-20260510-013', voltage: 3.80, temperature: 29.5, result: 'pass', duration: '24:05', testTime: '2026-05-10 10:08', brand: '沃能锂能', model: '115792', type: '软包', productModel: 'PB-20000mAh-B', workOrder: 'WO-2026-0502' },
  { sn: 'CP-20260510-014', voltage: 3.78, temperature: 31.0, result: 'pass', duration: '22:47', testTime: '2026-05-10 10:35', brand: '鹏辉锂能', model: '1260110', type: '软包', productModel: 'PB-20000mAh-B', workOrder: 'WO-2026-0502' },
  { sn: 'CP-20260510-015', voltage: 3.50, temperature: 40.1, result: 'fail', duration: '15:22', testTime: '2026-05-10 11:00', brand: '亿纬锂能', model: '126280', type: '软包', productModel: 'PB-10000mAh-A', workOrder: 'WO-2026-0501' },
  { sn: 'CP-20260510-016', voltage: 3.81, temperature: 28.7, result: 'pass', duration: '26:10', testTime: '2026-05-10 11:28', brand: '赣锋锂业', model: '115792', type: '软包', productModel: 'PB-20000mAh-B', workOrder: 'WO-2026-0502' },
]

/* 半成品 - 正在测试数据 */
const semiTestingData = [
  { sn: 'SN8839201998', testItem: '过充保护测试', progress: 72, elapsed: '08:15' },
  { sn: 'SN8839201999', testItem: '内阻检测', progress: 45, elapsed: '05:30' },
]

/* 成品 - 正在测试数据 */
const productTestingData = [
  { sn: 'SN8839202001', testItem: '满充容量测试', progress: 58, elapsed: '10:22' },
  { sn: 'SN8839202002', testItem: 'BMS通信检测', progress: 90, elapsed: '15:08' },
  { sn: 'SN8839202003', testItem: '自耗电测试', progress: 33, elapsed: '04:45' },
]

/* 老化测试 - 正在测试数据 */
const agingTestingData = [
  { sn: 'AG-20260511-001', temperature: 55.2, voltage: 3.72, loss: 2.3, qualified: true, progress: 65, elapsed: '32:15', workOrder: 'WO-2026-0501', rackId: 'RACK-A01' },
  { sn: 'AG-20260511-002', temperature: 62.8, voltage: 3.45, loss: 5.8, qualified: false, progress: 48, elapsed: '24:30', workOrder: 'WO-2026-0501', rackId: 'RACK-A01' },
  { sn: 'AG-20260511-003', temperature: 53.1, voltage: 3.78, loss: 1.8, qualified: true, progress: 82, elapsed: '40:05', workOrder: 'WO-2026-0502', rackId: 'RACK-A02' },
]

/* 老化测试 - 已完成数据 */
const agingCompletedData = [
  { sn: 'AG-20260510-011', temperature: 54.3, voltage: 3.75, loss: 2.1, result: '合格', duration: '48:30', testTime: '2026-05-10 08:15', charge: '3.85V', discharge: '3.20V', workOrder: 'WO-2026-0501', rackId: 'RACK-A01' },
  { sn: 'AG-20260510-012', temperature: 68.5, voltage: 3.32, loss: 7.2, result: '不合格', duration: '35:18', testTime: '2026-05-10 09:05', charge: '3.85V', discharge: '3.20V', workOrder: 'WO-2026-0501', rackId: 'RACK-A01' },
  { sn: 'AG-20260510-013', temperature: 52.8, voltage: 3.80, loss: 1.5, result: '合格', duration: '50:22', testTime: '2026-05-10 09:58', charge: '3.82V', discharge: '3.15V', workOrder: 'WO-2026-0502', rackId: 'RACK-A02' },
  { sn: 'AG-20260510-014', temperature: 55.1, voltage: 3.70, loss: 2.8, result: '合格', duration: '46:15', testTime: '2026-05-10 10:48', charge: '3.82V', discharge: '3.15V', workOrder: 'WO-2026-0502', rackId: 'RACK-A02' },
  { sn: 'AG-20260510-015', temperature: 70.2, voltage: 3.28, loss: 8.5, result: '不合格', duration: '30:42', testTime: '2026-05-10 11:35', charge: '3.95V', discharge: '2.60V', workOrder: 'WO-2026-0501', rackId: 'RACK-B01' },
  { sn: 'AG-20260510-016', temperature: 53.5, voltage: 3.76, loss: 1.9, result: '合格', duration: '49:08', testTime: '2026-05-10 12:25', charge: '3.83V', discharge: '3.18V', workOrder: 'WO-2026-0502', rackId: 'RACK-B01' },
]

/* 人员管理数据 */
const personnelData = [
  { id: 1, name: '张三', account: 'zhangsan', role: 'admin', phone: '138****1001', status: '正常', section: ['系统管理'] },
  { id: 2, name: '李四', account: 'lisi', role: 'operator', phone: '139****2002', status: '正常', section: ['半成品测试', '成品测试'] },
  { id: 3, name: '王五', account: 'wangwu', role: 'operator', phone: '137****3003', status: '正常', section: ['成品测试'] },
  { id: 4, name: '赵六', account: 'zhaoliu', role: 'viewer', phone: '136****4004', status: '正常', section: ['物料管理', '半成品测试'] },
  { id: 5, name: '钱七', account: 'qianqi', role: 'operator', phone: '135****5005', status: '禁用', section: ['老化测试'] },
  { id: 6, name: '孙八', account: 'sunba', role: 'viewer', phone: '134****6006', status: '正常', section: ['设备装箱'] },
  { id: 7, name: '周九', account: 'zhoujiu', role: 'admin', phone: '133****7007', status: '正常', section: ['系统管理', '物料管理'] },
  { id: 8, name: '吴十', account: 'wushi', role: 'operator', phone: '132****8008', status: '正常', section: ['电芯派克', '老化测试'] },
]

/* 操作日志数据 */
const operationLogData: Record<number, Array<{ time: string; action: string; detail: string }>> = {
  1: [
    { time: '2026-05-11 08:30', action: '登录系统', detail: '管理员张三登录MES系统' },
    { time: '2026-05-10 14:22', action: '修改配置', detail: '修改半成品测试参数阈值' },
    { time: '2026-05-10 09:15', action: '审核数据', detail: '审核物料台账批次B20231024-CELL-01' },
    { time: '2026-05-09 16:40', action: '导出报表', detail: '导出本周产量统计报表' },
  ],
  2: [
    { time: '2026-05-11 07:55', action: '登录系统', detail: '操作员李四登录MES系统' },
    { time: '2026-05-10 15:10', action: '录入数据', detail: '录入半成品测试记录SN8839201992' },
    { time: '2026-05-10 10:30', action: '录入数据', detail: '录入物料台账批次数据' },
  ],
  3: [
    { time: '2026-05-11 08:10', action: '登录系统', detail: '操作员王五登录MES系统' },
    { time: '2026-05-10 11:20', action: '录入数据', detail: '录入成品测试记录' },
    { time: '2026-05-09 14:55', action: '录入数据', detail: '录入老化测试数据' },
  ],
  4: [
    { time: '2026-05-10 09:00', action: '登录系统', detail: '查看者赵六登录MES系统' },
    { time: '2026-05-09 13:30', action: '查看数据', detail: '查看数据看板统计信息' },
  ],
  5: [
    { time: '2026-05-08 10:20', action: '登录系统', detail: '操作员钱七登录MES系统' },
    { time: '2026-05-07 16:00', action: '录入数据', detail: '录入装箱数据' },
  ],
  6: [
    { time: '2026-05-10 08:45', action: '登录系统', detail: '查看者孙八登录MES系统' },
    { time: '2026-05-09 11:15', action: '查看数据', detail: '查看物料台账列表' },
  ],
  7: [
    { time: '2026-05-11 08:00', action: '登录系统', detail: '管理员周九登录MES系统' },
    { time: '2026-05-10 17:30', action: '修改配置', detail: '修改成品测试参数配置' },
    { time: '2026-05-10 12:00', action: '审核数据', detail: '审核装箱数据BOX-20231024-001' },
    { time: '2026-05-09 15:20', action: '用户管理', detail: '禁用操作员钱七账号' },
  ],
  8: [
    { time: '2026-05-10 07:50', action: '登录系统', detail: '操作员吴十登录MES系统' },
    { time: '2026-05-09 16:30', action: '录入数据', detail: '录入电芯派克数据' },
    { time: '2026-05-09 09:45', action: '录入数据', detail: '录入老化测试记录' },
  ],
}

/* 装箱数据 */
const packagingRecords = [
  { batch: 'BOX-20231024-001', count: 50, cert3c: '202001090729XXXX', oidStatus: '已同步备案', operator: '张三', date: '2026/04/26', workOrder: 'WO-2026-0501', model: 'PB-10000mAh-A', subs: ['SN-SUB-8839201901', 'SN-SUB-8839201902', 'SN-SUB-8839201903', 'SN-SUB-8839201904', 'SN-SUB-8839201905', 'SN-SUB-8839201906'] },
  { batch: 'BOX-20231024-002', count: 50, cert3c: '202001090729XXXY', oidStatus: '已同步备案', operator: '李四', date: '2026/04/27', workOrder: 'WO-2026-0502', model: 'PB-20000mAh-B', subs: ['SN-SUB-8839201911', 'SN-SUB-8839201912', 'SN-SUB-8839201913', 'SN-SUB-8839201914'] },
]

/* 成品组装 - 电芯与电路板组装数据 */
const cellPcbAssemblyData = [
  { id: 'ASM-CP-001', cellSn: 'CELL-20260510-001', pcbSn: 'PCB-20260510-001', time: '2026-05-10 08:30', operator: '张三', status: '已组装', testStatus: '已测试', testResult: '合格' },
  { id: 'ASM-CP-002', cellSn: 'CELL-20260510-002', pcbSn: 'PCB-20260510-002', time: '2026-05-10 08:45', operator: '李四', status: '已组装', testStatus: '已测试', testResult: '合格' },
  { id: 'ASM-CP-003', cellSn: 'CELL-20260511-003', pcbSn: 'PCB-20260511-003', time: '2026-05-11 09:10', operator: '张三', status: '已组装', testStatus: '已测试', testResult: '不合格' },
  { id: 'ASM-CP-004', cellSn: 'CELL-20260511-004', pcbSn: 'PCB-20260511-004', time: '', operator: '', status: '待组装', testStatus: '未测试', testResult: '' },
  { id: 'ASM-CP-005', cellSn: 'CELL-20260511-005', pcbSn: 'PCB-20260511-005', time: '', operator: '', status: '待组装', testStatus: '未测试', testResult: '' },
]

/* 成品组装 - 半成品与外壳组装数据 */
const semiShellAssemblyData = [
  { id: 'ASM-SS-001', cellSn: 'ASM-CP-001', pcbSn: 'SHELL-20260510-001', shellSn: 'PB-10000mAh-A', time: '2026-05-10 09:30', operator: '张三', status: '已组装', testStatus: '已测试', testResult: '合格' },
  { id: 'ASM-SS-002', cellSn: 'ASM-CP-002', pcbSn: 'SHELL-20260510-002', shellSn: 'PB-10000mAh-A', time: '2026-05-10 09:50', operator: '王五', status: '已组装', testStatus: '已测试', testResult: '合格' },
  { id: 'ASM-SS-003', cellSn: 'ASM-CP-003', pcbSn: 'SHELL-20260511-003', shellSn: 'PB-20000mAh-B', time: '2026-05-11 10:15', operator: '李四', status: '已组装', testStatus: '已测试', testResult: '不合格' },
  { id: 'ASM-SS-004', cellSn: 'ASM-CP-004', pcbSn: 'SHELL-20260511-004', shellSn: 'PB-20000mAh-B', time: '', operator: '', status: '待组装', testStatus: '未测试', testResult: '' },
]

/* 生产工单数据 */
const WORK_ORDERS = [
  { id: 'WO-2026-0501', productModel: 'PB-10000mAh-A', planQty: 500, completedQty: 320, priority: '高', status: '进行中', creator: '张三', assignee: '李四', createTime: '2026-05-08 09:00',
    materials: [
      { batch: 'B20231024-CELL-01', name: '电芯', storageLocation: 'A区-01号仓', spec: '10000mAh 聚合物', qty: 5000, useQty: 2500, startCode: 'SN-CELL-0001', endCode: 'SN-CELL-5000' },
      { batch: 'B20231024-PCB-02', name: '保护板', storageLocation: 'B区-03号仓', spec: 'V2.1 主控板', qty: 2000, useQty: 800, startCode: 'SN-PCB-0001', endCode: 'SN-PCB-2000' },
      { batch: 'B20231024-PCB-03', name: 'PCB', storageLocation: 'B区-05号仓', spec: '0.6mm', qty: 2000, useQty: 600, startCode: 'SN-PCB03-0001', endCode: 'SN-PCB03-2000' },
    ] },
  { id: 'WO-2026-0502', productModel: 'PB-20000mAh-B', planQty: 300, completedQty: 300, priority: '中', status: '已完成', creator: '李四', assignee: '王五', createTime: '2026-05-06 14:30',
    materials: [
      { batch: 'B20231024-CELL-01', name: '电芯', storageLocation: 'A区-01号仓', spec: '10000mAh 聚合物', qty: 5000, useQty: 1500, startCode: 'SN-CELL-0001', endCode: 'SN-CELL-5000' },
      { batch: 'B20231024-PCB-04', name: '外壳', storageLocation: 'C区-02号仓', spec: '--', qty: 2000, useQty: 400, startCode: 'SN-SHELL-0001', endCode: 'SN-SHELL-2000' },
    ] },
  { id: 'WO-2026-0503', productModel: 'PB-10000mAh-A', planQty: 200, completedQty: 0, priority: '低', status: '待接收', creator: '王五', assignee: '', createTime: '2026-05-11 10:00',
    materials: [
      { batch: 'B20231024-CELL-07', name: '电芯', storageLocation: 'A区-02号仓', spec: '20000mAh 聚合物', qty: 3000, useQty: 200, startCode: 'SN-CELL07-0001', endCode: 'SN-CELL07-3000' },
    ] },
  { id: 'WO-2026-0504', productModel: 'PB-20000mAh-B', planQty: 400, completedQty: 150, priority: '高', status: '进行中', creator: '张三', assignee: '赵六', createTime: '2026-05-10 08:00',
    materials: [
      { batch: 'B20231024-PCB-08', name: '连接器', storageLocation: 'B区-06号仓', spec: 'Type-C 2.0', qty: 4000, useQty: 500, startCode: 'SN-CONN-0001', endCode: 'SN-CONN-4000' },
      { batch: 'B20231024-PCB-02', name: '保护板', storageLocation: 'B区-03号仓', spec: 'V2.1 主控板', qty: 2000, useQty: 600, startCode: 'SN-PCB-0001', endCode: 'SN-PCB-2000' },
      { batch: 'B20231024-PCB-09', name: '热敏电阻', storageLocation: 'C区-04号仓', spec: 'NTC 10K', qty: 1500, useQty: 500, startCode: 'SN-NTC-0001', endCode: 'SN-NTC-1500' },
    ] },
  { id: 'WO-2026-0505', productModel: 'PB-10000mAh-A', planQty: 100, completedQty: 100, priority: '中', status: '已完成', creator: '赵六', assignee: '张三', createTime: '2026-05-05 16:00',
    materials: [
      { batch: 'B20231024-PCB-03', name: 'PCB', storageLocation: 'B区-05号仓', spec: '0.6mm', qty: 2000, useQty: 200, startCode: 'SN-PCB03-0001', endCode: 'SN-PCB03-2000' },
      { batch: 'B20231024-PCB-04', name: '外壳', storageLocation: 'C区-02号仓', spec: '--', qty: 2000, useQty: 150, startCode: 'SN-SHELL-0001', endCode: 'SN-SHELL-2000' },
    ] },
]

/* 老化测试架数据 */
const racks = ['RACK-A01', 'RACK-A02', 'RACK-B01']

/* 员工统计数据 */
const EMPLOYEE_STATS: Record<number, {
  operations: number; reviews: number; dataEntries: number; lastLogin: string;
  section: string[];
  sectionData: { label: string; value: string | number; unit: string; color: string }[];
}> = {
  1: { operations: 156, reviews: 42, dataEntries: 89, lastLogin: '2026-05-12 08:30', section: ['系统管理'],
    sectionData: [
      { label: '系统配置次数', value: 28, unit: '次', color: '#0891b2' },
      { label: '审核操作数', value: 42, unit: '次', color: '#059669' },
      { label: '数据录入', value: 89, unit: '条', color: '#7c3aed' },
      { label: '管理效率', value: '98.5', unit: '%', color: '#d97706' },
    ] },
  2: { operations: 234, reviews: 12, dataEntries: 156, lastLogin: '2026-05-12 07:55', section: ['半成品测试', '成品测试'],
    sectionData: [
      { label: '测试总数量', value: 234, unit: '台', color: '#0891b2' },
      { label: '通过数量', value: 218, unit: '台', color: '#059669' },
      { label: '异常数量', value: 16, unit: '台', color: '#e11d48' },
      { label: '通过率', value: '93.2', unit: '%', color: '#7c3aed' },
    ] },
  3: { operations: 198, reviews: 8, dataEntries: 145, lastLogin: '2026-05-12 08:10', section: ['成品测试'],
    sectionData: [
      { label: '测试总数量', value: 198, unit: '台', color: '#0891b2' },
      { label: '通过数量', value: 186, unit: '台', color: '#059669' },
      { label: '异常数量', value: 12, unit: '台', color: '#e11d48' },
      { label: '通过率', value: '93.9', unit: '%', color: '#7c3aed' },
    ] },
  4: { operations: 67, reviews: 0, dataEntries: 210, lastLogin: '2026-05-11 09:00', section: ['物料管理', '半成品测试'],
    sectionData: [
      { label: '入库批次', value: 45, unit: '批', color: '#0891b2' },
      { label: '出库批次', value: 38, unit: '批', color: '#059669' },
      { label: '库存预警', value: 3, unit: '项', color: '#e11d48' },
      { label: '数据录入', value: 210, unit: '条', color: '#7c3aed' },
    ] },
  5: { operations: 112, reviews: 0, dataEntries: 88, lastLogin: '2026-05-08 10:20', section: ['老化测试'],
    sectionData: [
      { label: '测试总数量', value: 112, unit: '台', color: '#0891b2' },
      { label: '合格数量', value: 98, unit: '台', color: '#059669' },
      { label: '不合格数量', value: 14, unit: '台', color: '#e11d48' },
      { label: '合格率', value: '87.5', unit: '%', color: '#d97706' },
    ] },
  6: { operations: 45, reviews: 0, dataEntries: 23, lastLogin: '2026-05-11 08:45', section: ['设备装箱'],
    sectionData: [
      { label: '装箱总数', value: 45, unit: '箱', color: '#0891b2' },
      { label: '备案同步', value: 43, unit: '次', color: '#059669' },
      { label: '待备案', value: 2, unit: '次', color: '#d97706' },
      { label: '数据录入', value: 23, unit: '条', color: '#7c3aed' },
    ] },
  7: { operations: 134, reviews: 38, dataEntries: 72, lastLogin: '2026-05-12 08:00', section: ['系统管理', '物料管理'],
    sectionData: [
      { label: '系统配置次数', value: 22, unit: '次', color: '#0891b2' },
      { label: '审核操作数', value: 38, unit: '次', color: '#059669' },
      { label: '数据录入', value: 72, unit: '条', color: '#7c3aed' },
      { label: '管理效率', value: '97.1', unit: '%', color: '#d97706' },
    ] },
  8: { operations: 178, reviews: 5, dataEntries: 132, lastLogin: '2026-05-11 07:50', section: ['电芯派克', '老化测试'],
    sectionData: [
      { label: '测试总数量', value: 178, unit: '个', color: '#0891b2' },
      { label: '合格数量', value: 165, unit: '个', color: '#059669' },
      { label: '异常数量', value: 13, unit: '个', color: '#e11d48' },
      { label: '合格率', value: '92.7', unit: '%', color: '#7c3aed' },
    ] },
}

/* 权限配置数据 */
const ROLE_PERMISSIONS: Record<string, { label: string; permissions: { key: string; label: string; allowed: boolean }[] }> = {
  admin: { label: '管理员', permissions: [
    { key: 'dashboard', label: '数据看板', allowed: true },
    { key: 'material', label: '物料台账', allowed: true },
    { key: 'semiTest', label: '半成品测试', allowed: true },
    { key: 'productTest', label: '成品测试', allowed: true },
    { key: 'cellPackTest', label: '电芯派克', allowed: true },
    { key: 'agingTest', label: '老化测试', allowed: true },
    { key: 'assembly', label: '成品组装', allowed: true },
    { key: 'workOrder', label: '生产工单', allowed: true },
    { key: 'packaging', label: '设备装箱', allowed: true },
    { key: 'labelPrint', label: '标签打印', allowed: true },
    { key: 'personnel', label: '人员管理', allowed: true },
    { key: 'systemConfig', label: '系统配置', allowed: true },
  ] },
  operator: { label: '操作员', permissions: [
    { key: 'dashboard', label: '数据看板', allowed: true },
    { key: 'material', label: '物料台账', allowed: true },
    { key: 'semiTest', label: '半成品测试', allowed: true },
    { key: 'productTest', label: '成品测试', allowed: true },
    { key: 'cellPackTest', label: '电芯派克', allowed: true },
    { key: 'agingTest', label: '老化测试', allowed: true },
    { key: 'assembly', label: '成品组装', allowed: true },
    { key: 'workOrder', label: '生产工单', allowed: true },
    { key: 'packaging', label: '设备装箱', allowed: true },
    { key: 'labelPrint', label: '标签打印', allowed: true },
    { key: 'personnel', label: '人员管理', allowed: false },
    { key: 'systemConfig', label: '系统配置', allowed: false },
  ] },
  viewer: { label: '查看者', permissions: [
    { key: 'dashboard', label: '数据看板', allowed: true },
    { key: 'material', label: '物料台账', allowed: true },
    { key: 'semiTest', label: '半成品测试', allowed: true },
    { key: 'productTest', label: '成品测试', allowed: true },
    { key: 'cellPackTest', label: '电芯派克', allowed: true },
    { key: 'agingTest', label: '老化测试', allowed: true },
    { key: 'assembly', label: '成品组装', allowed: true },
    { key: 'workOrder', label: '生产工单', allowed: true },
    { key: 'packaging', label: '设备装箱', allowed: true },
    { key: 'labelPrint', label: '标签打印', allowed: false },
    { key: 'personnel', label: '人员管理', allowed: false },
    { key: 'systemConfig', label: '系统配置', allowed: false },
  ] },
}

/* 所有权限模块列表（用于新增标签时勾选） */
const ALL_PERMISSIONS = [
  { key: 'dashboard', label: '数据看板' },
  { key: 'material', label: '物料台账' },
  { key: 'semiTest', label: '半成品测试' },
  { key: 'productTest', label: '成品测试' },
  { key: 'cellPackTest', label: '电芯派克' },
  { key: 'agingTest', label: '老化测试' },
  { key: 'assembly', label: '成品组装' },
  { key: 'workOrder', label: '生产工单' },
  { key: 'packaging', label: '设备装箱' },
  { key: 'labelPrint', label: '标签打印' },
  { key: 'personnel', label: '人员管理' },
  { key: 'systemConfig', label: '系统配置' },
]


/* ================================================================
   通用组件
   ================================================================ */

function useAnimatedNumber(target: number, duration = 1500, decimals = 0) {
  const [current, setCurrent] = useState(0)
  const startTime = useRef<number | null>(null)
  const rafId = useRef<number | null>(null)
  const prevTarget = useRef(target)

  useEffect(() => {
    startTime.current = null
    const startValue = prevTarget.current === target ? current : prevTarget.current
    prevTarget.current = target
    const animate = (ts: number) => {
      if (!startTime.current) startTime.current = ts
      const p = Math.min((ts - startTime.current) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setCurrent(Number((startValue + (target - startValue) * eased).toFixed(decimals)))
      if (p < 1) rafId.current = requestAnimationFrame(animate)
    }
    rafId.current = requestAnimationFrame(animate)
    return () => { if (rafId.current) cancelAnimationFrame(rafId.current) }
  }, [target, duration, decimals])
  return current
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  return (
    <div className="custom-tooltip" style={{ padding: '10px 14px', borderRadius: 10 }}>
      {label && <div style={{ color: '#475569', marginBottom: 6, fontSize: 12, fontWeight: 600 }}>{label}</div>}
      {payload.map((e, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <div style={{ width: 8, height: 8, borderRadius: 3, backgroundColor: e.color || '#0891b2' }} />
          <span style={{ color: '#64748b', fontSize: 12 }}>{e.name}:</span>
          <span style={{ color: '#1e293b', fontSize: 12, fontWeight: 700 }}>{typeof e.value === 'number' ? e.value.toLocaleString() : e.value}</span>
        </div>
      ))}
    </div>
  )
}

function KPICardComponent({ data, index }: { data: KPICard; index: number }) {
  const av = useAnimatedNumber(data.value, 1800, data.decimals || 0)
  const Icon = data.icon
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5, ease: 'easeOut' }}
      className={`dash-card ${data.shadowCls} p-4 transition-all duration-300 hover:scale-[1.03] cursor-default group`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: `${data.color}12` }}>
          <Icon className="w-5 h-5" style={{ color: data.color }} />
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 font-medium">{data.category}</span>
          {data.trend && (
            <div className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${data.trendType === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
              {data.trendType === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{data.trend}
            </div>
          )}
          {data.status && (
            <div className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${data.status === 'pass' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
              {data.status === 'pass' ? '✓ 达标' : '✕ 异常'}
            </div>
          )}
        </div>
      </div>
      <div className="text-2xl font-bold tracking-tight" style={{ color: data.color }}>
        {av.toLocaleString()}<span className="text-sm font-normal text-slate-400 ml-1">{data.unit}</span>
      </div>
      <div className="text-xs text-slate-500 mt-1">{data.title}</div>
      {data.target && (
        <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5">
          <div className="h-1.5 rounded-full transition-all duration-1000" style={{ width: `${Math.min((data.value / data.target) * 100, 100)}%`, backgroundColor: data.color }} />
        </div>
      )}
    </motion.div>
  )
}

function ChartCard({ title, icon, children, delay = 0, className = '' }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; delay?: number; className?: string
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5, ease: 'easeOut' }}
      className={`dash-card p-5 ${className}`}>
      <div className="flex items-center gap-2 mb-4">{icon}<h3 className="text-sm font-semibold text-slate-700">{title}</h3></div>
      {children}
    </motion.div>
  )
}

function SectionCard({ title, icon, children, action }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; action?: React.ReactNode
}) {
  return (
    <div className="dash-card p-0 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">{icon}<h3 className="text-base font-semibold text-slate-700">{title}</h3></div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}


/* ================================================================
   页面组件
   ================================================================ */

/* ---------- 1. 数据看板 ---------- */
function DashboardPage() {
  const [activeTime, setActiveTime] = useState('today')
  return (
    <div className="space-y-5">
      {/* 时间选择器 */}
      <div className="flex justify-end">
        <div className="flex items-center bg-white rounded-lg p-0.5 border border-slate-200 shadow-sm">
          {timeOptions.map(opt => (
            <button key={opt.key} onClick={() => setActiveTime(opt.key)}
              className={`px-3 py-1.5 text-xs rounded-md transition-all ${activeTime === opt.key ? 'bg-cyan-600 text-white font-semibold shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {kpiData.map((k, i) => <KPICardComponent key={k.title} data={k} index={i} />)}
        </div>
      </section>

      {/* 异常率 */}
      <motion.section initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="dash-card p-4">
        <div className="flex items-center gap-3 mb-3">
          <Siren className="w-4 h-4 text-rose-500" />
          <h3 className="text-sm font-semibold text-slate-700">异常率监控</h3>
          <div className="flex-1 h-px bg-gradient-to-r from-rose-200 to-transparent" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {anomalyItems.map((item, idx) => (
            <motion.div key={item.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + idx * 0.05 }}
              className={`relative flex items-center justify-between p-3 rounded-lg border transition-all hover:scale-[1.02] ${item.level === 'danger' ? 'bg-rose-50/80 border-rose-200 hover:border-rose-300' : 'bg-amber-50/80 border-amber-200 hover:border-amber-300'}`}>
              <div className="flex items-center gap-2">
                <AlertCircle className={`w-3.5 h-3.5 ${item.level === 'danger' ? 'text-rose-500' : 'text-amber-500'}`} />
                <span className="text-xs text-slate-600">{item.label}</span>
              </div>
              <span className={`text-sm font-bold ${item.level === 'danger' ? 'text-rose-600' : 'text-amber-600'}`}>{item.value}{item.unit}</span>
              {item.level === 'danger' && <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />}
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* 图表第一行 */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <ChartCard title="今日生产与测试趋势监控" icon={<TrendingUp className="w-4 h-4 text-cyan-600" />} delay={0.5} className="lg:col-span-3">
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0891b2" stopOpacity={0.2} /><stop offset="95%" stopColor="#0891b2" stopOpacity={0} /></linearGradient>
                  <linearGradient id="gG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#059669" stopOpacity={0.2} /><stop offset="95%" stopColor="#059669" stopOpacity={0} /></linearGradient>
                  <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15} /><stop offset="95%" stopColor="#7c3aed" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#e2e8f0' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} formatter={(v: string) => <span style={{ color: '#64748b' }}>{v}</span>} />
                <Area type="monotone" dataKey="semiTest" name="半成品测试量" stroke="#0891b2" strokeWidth={2} fill="url(#gC)" dot={{ r: 3, fill: '#0891b2', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 5 }} />
                <Area type="monotone" dataKey="finishedProduct" name="成品入库量" stroke="#059669" strokeWidth={2} fill="url(#gG)" dot={{ r: 3, fill: '#059669', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 5 }} />
                <Area type="monotone" dataKey="cabinetOutput" name="机柜产出量" stroke="#7c3aed" strokeWidth={2} fill="url(#gP)" dot={{ r: 3, fill: '#7c3aed', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
        <ChartCard title="成品测试结果占比" icon={<BarChart3 className="w-4 h-4 text-emerald-600" />} delay={0.55} className="lg:col-span-2">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={testingPieData} cx="50%" cy="45%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                  {testingPieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} formatter={(v: string) => <span style={{ color: '#64748b' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center -mt-2 mb-1"><div className="text-center"><div className="text-2xl font-bold text-emerald-600">98.6%</div><div className="text-[10px] text-slate-400">综合通过率</div></div></div>
        </ChartCard>
      </section>

      {/* 图表第二行 */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="核心供应商物料合格率对比" icon={<Wrench className="w-4 h-4 text-violet-600" />} delay={0.6}>
          <div className="h-[300px]"><ResponsiveContainer><BarChart data={supplierData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
            <XAxis type="number" domain={[80, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#e2e8f0' }} tickFormatter={v => `${v}%`} />
            <YAxis type="category" dataKey="name" tick={{ fill: '#475569', fontSize: 12 }} axisLine={{ stroke: '#e2e8f0' }} width={80} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="rate" name="合格率" radius={[0, 6, 6, 0]} barSize={22} label={{ position: 'right', fill: '#64748b', fontSize: 11, formatter: (v: number) => `${v}%` }}>
              {supplierData.map((e, i) => <Cell key={i} fill={e.fill} />)}
            </Bar>
          </BarChart></ResponsiveContainer></div>
        </ChartCard>
        <ChartCard title="异常隔离原因分析 (Top 5)" icon={<AlertTriangle className="w-4 h-4 text-rose-500" />} delay={0.65}>
          <div className="h-[300px]"><ResponsiveContainer><BarChart data={defectData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#e2e8f0' }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#e2e8f0' }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" name="异常频次" radius={[6, 6, 0, 0]} barSize={36} label={{ position: 'top', fill: '#64748b', fontSize: 11 }}>
              {defectData.map((e, i) => <Cell key={i} fill={e.fill} />)}
            </Bar>
          </BarChart></ResponsiveContainer></div>
        </ChartCard>
      </section>

      {/* 图表第三行 */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <ChartCard title="物料到货质量分布" icon={<Package className="w-4 h-4 text-amber-600" />} delay={0.7}>
          <div className="h-[280px]"><ResponsiveContainer><PieChart>
            <Pie data={materialPieData} cx="50%" cy="42%" outerRadius={80} innerRadius={35} paddingAngle={2} dataKey="value" stroke="none">
              {materialPieData.map((e, i) => <Cell key={i} fill={e.color} />)}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 10, paddingTop: 4 }} formatter={(v: string) => <span style={{ color: '#64748b' }}>{v}</span>} />
          </PieChart></ResponsiveContainer></div>
          <div className="mt-2 pt-3 border-t border-slate-100 grid grid-cols-2 gap-3">
            <div className="text-center"><div className="text-lg font-bold text-emerald-600">11,000</div><div className="text-[10px] text-slate-400">合格数量</div></div>
            <div className="text-center"><div className="text-lg font-bold text-rose-600">4,000</div><div className="text-[10px] text-slate-400">不合格数量</div></div>
          </div>
        </ChartCard>
        <ChartCard title="全流程质量雷达图" icon={<Shield className="w-4 h-4 text-cyan-600" />} delay={0.75}>
          <div className="h-[320px]"><ResponsiveContainer><RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="dimension" tick={{ fill: '#64748b', fontSize: 10 }} />
            <PolarRadiusAxis angle={90} domain={[80, 100]} tick={{ fill: '#94a3b8', fontSize: 9 }} axisLine={false} />
            <Radar name="合格率" dataKey="value" stroke="#0891b2" fill="#0891b2" fillOpacity={0.15} strokeWidth={2} dot={{ r: 3, fill: '#0891b2', stroke: '#fff', strokeWidth: 1 }} />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart></ResponsiveContainer></div>
        </ChartCard>
        <ChartCard title="各阶段合格率仪表盘" icon={<Target className="w-4 h-4 text-emerald-600" />} delay={0.8}>
          <div className="h-[320px]"><ResponsiveContainer><RadialBarChart cx="50%" cy="50%" innerRadius="25%" outerRadius="85%" data={gaugeData} startAngle={180} endAngle={0}>
            <RadialBar dataKey="value" background={{ fill: '#f1f5f9' }} cornerRadius={6}>
              {gaugeData.map((e, i) => <Cell key={i} fill={e.fill} />)}
            </RadialBar>
            <Legend wrapperStyle={{ fontSize: 10 }} iconSize={8} layout="horizontal" verticalAlign="bottom" formatter={(v: string) => <span style={{ color: '#64748b' }}>{v}</span>} />
            <Tooltip content={<CustomTooltip />} />
          </RadialBarChart></ResponsiveContainer></div>
        </ChartCard>
      </section>

      {/* 图表第四行 */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <ChartCard title="本周产量与合格/异常对比" icon={<Layers className="w-4 h-4 text-violet-600" />} delay={0.85} className="lg:col-span-3">
          <div className="h-[300px]"><ResponsiveContainer><ComposedChart data={weeklyData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <defs>
              <linearGradient id="bG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#059669" stopOpacity={0.9} /><stop offset="95%" stopColor="#059669" stopOpacity={0.5} /></linearGradient>
              <linearGradient id="bR" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#e11d48" stopOpacity={0.9} /><stop offset="95%" stopColor="#e11d48" stopOpacity={0.5} /></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#e2e8f0' }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#e2e8f0' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} formatter={(v: string) => <span style={{ color: '#64748b' }}>{v}</span>} />
            <Bar dataKey="pass" name="合格" fill="url(#bG)" radius={[3, 3, 0, 0]} barSize={18} />
            <Bar dataKey="fail" name="异常" fill="url(#bR)" radius={[3, 3, 0, 0]} barSize={18} />
            <Line type="monotone" dataKey="output" name="总产出" stroke="#0891b2" strokeWidth={2} dot={{ r: 4, fill: '#0891b2', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 6 }} />
          </ComposedChart></ResponsiveContainer></div>
        </ChartCard>
        <ChartCard title="装箱与备案汇总" icon={<Box className="w-4 h-4 text-amber-600" />} delay={0.9} className="lg:col-span-2">
          <div className="h-[240px]"><ResponsiveContainer><PieChart>
            <Pie data={packagingData} cx="50%" cy="45%" outerRadius={80} innerRadius={45} paddingAngle={4} dataKey="value" stroke="none">
              {packagingData.map((e, i) => <Cell key={i} fill={e.color} />)}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} formatter={(v: string) => <span style={{ color: '#64748b' }}>{v}</span>} />
          </PieChart></ResponsiveContainer></div>
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 rounded-lg bg-cyan-50 border border-cyan-100"><div className="text-lg font-bold text-cyan-700">15,600</div><div className="text-[10px] text-slate-400">已装机柜数</div></div>
              <div className="text-center p-2 rounded-lg bg-emerald-50 border border-emerald-100"><div className="text-lg font-bold text-emerald-700">100%</div><div className="text-[10px] text-slate-400">OID备案率</div></div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5"><div className="h-1.5 rounded-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-violet-500" style={{ width: '100%' }} /></div>
          </div>
        </ChartCard>
      </section>
    </div>
  )
}

/* ---------- 2. 物料台账 ---------- */
function MaterialPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [materialEntryOpen, setMaterialEntryOpen] = useState(false)
  const [materialEntryMode, setMaterialEntryMode] = useState<'form' | 'upload'>('form')
  const [testReportOpen, setTestReportOpen] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState<typeof materialData[0] | null>(null)
  /* 物料测试弹窗 */
  const [materialTestOpen, setMaterialTestOpen] = useState(false)
  const [materialTestResult, setMaterialTestResult] = useState<'合格' | '不合格' | ''>('')
  const [materialTesterName, setMaterialTesterName] = useState('')
  const [materialTesterId, setMaterialTesterId] = useState('')
  const filtered = materialData.filter(m =>
    m.name.includes(searchTerm) || m.batch.includes(searchTerm) || m.supplier.includes(searchTerm)
  )
  return (
    <div className="space-y-5">
      <SectionCard title="物料台账列表" icon={<ClipboardList className="w-5 h-5 text-cyan-600" />}
        action={
          <button onClick={() => setMaterialEntryOpen(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-700 transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> 物料录入
          </button>
        }
      >
        {/* 搜索 + 统计 */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="搜索物料名称 / 批次码 / 供应商" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all w-72" />
          </div>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-slate-300" /><span className="text-slate-500">总批次: <strong className="text-slate-700">{materialData.length}</strong></span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span className="text-slate-500">合格: <strong className="text-emerald-600">{materialData.filter(m => m.result === '合格').length}</strong></span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-500" /><span className="text-slate-500">不合格: <strong className="text-rose-600">{materialData.filter(m => m.result === '不合格').length}</strong></span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-400" /><span className="text-slate-500">待测试: <strong className="text-amber-600">{materialData.filter(m => m.result === '待测试').length}</strong></span></div>
          </div>
        </div>
        {/* 表格 */}
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="data-table">
            <thead>
              <tr><th>物料批次码</th><th>物料名称</th><th>供应商</th><th>供应商编号</th><th>品牌名称</th><th>存放位置</th><th>规格</th><th>到货数量</th><th>绑定工单数量</th><th>完成生产数量</th><th>物料开始编码</th><th>物料结束编码</th><th>测试结果</th><th>到货日期</th><th>测试日期</th><th>操作</th></tr>
            </thead>
            <tbody>
              {filtered.map((m, i) => (
                <tr key={i}>
                  <td className="font-mono text-xs text-slate-600">{m.batch}</td>
                  <td className="font-semibold">{m.name}</td>
                  <td>{m.supplier}</td>
                  <td className="font-mono text-xs text-cyan-600">{m.supplierId}</td>
                  <td className="font-medium text-slate-700">{m.brandName}</td>
                  <td><span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">{m.storageLocation}</span></td>
                  <td className="text-slate-500">{m.spec}</td>
                  <td className="font-semibold">{m.qty.toLocaleString()}</td>
                  <td className="font-semibold text-blue-600">{m.boundOrderQty.toLocaleString()}</td>
                  <td className="font-semibold text-emerald-600">{m.completedQty.toLocaleString()}</td>
                  <td className="font-mono text-xs text-slate-600">{m.startCode}</td>
                  <td className="font-mono text-xs text-slate-600">{m.endCode}</td>
                  <td>
                    {m.result === '合格' && <span className="badge-pass"><CheckCircle2 className="w-3 h-3" />合格</span>}
                    {m.result === '不合格' && <span className="badge-fail"><XCircle className="w-3 h-3" />不合格</span>}
                    {m.result === '待测试' && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200"><Clock className="w-3 h-3" />待测试</span>}
                  </td>
                  <td className="text-xs text-slate-500 whitespace-nowrap">{m.arrival}</td>
                  <td className="text-xs text-slate-500 whitespace-nowrap">{m.testDate || '--'}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      {m.result === '待测试' && (
                        <button onClick={() => { setSelectedMaterial(m); setMaterialTestOpen(true) }} className="flex items-center gap-1 text-amber-600 hover:text-amber-700 text-xs font-medium"><FlaskConical className="w-3.5 h-3.5" />测试</button>
                      )}
                      {m.result !== '待测试' && (
                        <button onClick={() => { setSelectedMaterial(m); setTestReportOpen(true) }} className="flex items-center gap-1 text-cyan-600 hover:text-cyan-700 text-xs font-medium"><FileText className="w-3.5 h-3.5" />测试报告</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* 物料录入弹窗 */}
      <Dialog open={materialEntryOpen} onOpenChange={setMaterialEntryOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800">
              <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center">
                <Plus className="w-4 h-4 text-cyan-600" />
              </div>
              物料录入
            </DialogTitle>
            <DialogDescription className="text-slate-500">请填写物料基本信息并提交入库</DialogDescription>
          </DialogHeader>
          {/* 切换按钮 */}
          <div className="flex items-center bg-slate-100 rounded-lg p-1 mb-2">
            <button
              onClick={() => setMaterialEntryMode('form')}
              className={`flex items-center gap-1.5 flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${materialEntryMode === 'form' ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              表单填写
            </button>
            <button
              onClick={() => setMaterialEntryMode('upload')}
              className={`flex items-center gap-1.5 flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${materialEntryMode === 'upload' ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <FileUp className="w-4 h-4" />
              上传文件
            </button>
          </div>
          {/* 表单填写模式 */}
          {materialEntryMode === 'form' && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">物料名称 <span className="text-rose-500">*</span></label>
                <input type="text" placeholder="例如：电芯" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">供应商 <span className="text-rose-500">*</span></label>
                <input type="text" placeholder="例如：宁德新能源" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">供应商编号 <span className="text-rose-500">*</span></label>
                <input type="text" placeholder="例如：SUP-001" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">规格型号</label>
                <input type="text" placeholder="例如：10000mAh 聚合物" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">到货数量 <span className="text-rose-500">*</span></label>
                <input type="number" placeholder="0" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">物料批次码</label>
                <input type="text" placeholder="系统自动生成" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all bg-slate-50" readOnly />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">到货日期</label>
                <input type="datetime-local" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">物料编码前缀 <span className="text-rose-500">*</span></label>
                <input type="text" placeholder="例如：MAT-CEL-" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">物料开始编码 <span className="text-rose-500">*</span></label>
                <input type="text" placeholder="例如：0001" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">物料结束编码 <span className="text-rose-500">*</span></label>
                <input type="text" placeholder="例如：0500" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all" />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-xs font-semibold text-slate-700">存放位置 <span className="text-rose-500">*</span></label>
                <input type="text" placeholder="例如：A区-03货架-02层" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all" />
              </div>
            </div>
          )}
          {/* 上传文件模式 */}
          {materialEntryMode === 'upload' && (
            <div className="py-4">
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-cyan-400 hover:bg-cyan-50/30 transition-all cursor-pointer group">
                <div className="w-14 h-14 rounded-full bg-cyan-50 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-7 h-7 text-cyan-500" />
                </div>
                <p className="text-sm font-semibold text-slate-700 mb-1">点击或拖拽文件到此区域上传</p>
                <p className="text-xs text-slate-400 mb-3">支持 .xlsx, .xls, .csv 格式，单次最多上传5个文件</p>
                <button className="px-4 py-2 rounded-lg bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-700 transition-colors shadow-sm">
                  选择文件
                </button>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">物料清单_20260511.xlsx</p>
                      <p className="text-xs text-slate-400">128 KB - 上传成功</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-medium">已上传</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <button className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">取消</button>
            </DialogClose>
            <button onClick={() => setMaterialEntryOpen(false)} className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-700 transition-colors shadow-sm">
              <Save className="w-4 h-4" /> {materialEntryMode === 'form' ? '提交录入' : '确认上传'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 物料测试弹窗 */}
      <Dialog open={materialTestOpen} onOpenChange={setMaterialTestOpen}>
        <DialogContent className="sm:max-w-[520px] bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <FlaskConical className="w-4 h-4 text-amber-600" />
              </div>
              物料测试
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              {selectedMaterial && (
                <span>当前物料：{selectedMaterial.name}（{selectedMaterial.batch}）</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            {/* 测试结果选择 */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">测试结果 <span className="text-rose-500">*</span></label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMaterialTestResult('合格')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${materialTestResult === '合格' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                >
                  <CheckCircle2 className={`w-5 h-5 ${materialTestResult === '合格' ? 'text-emerald-500' : 'text-slate-300'}`} />
                  <span className={`text-sm font-semibold ${materialTestResult === '合格' ? 'text-emerald-700' : 'text-slate-400'}`}>合格</span>
                </button>
                <button
                  onClick={() => setMaterialTestResult('不合格')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${materialTestResult === '不合格' ? 'border-rose-500 bg-rose-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                >
                  <XCircle className={`w-5 h-5 ${materialTestResult === '不合格' ? 'text-rose-500' : 'text-slate-300'}`} />
                  <span className={`text-sm font-semibold ${materialTestResult === '不合格' ? 'text-rose-700' : 'text-slate-400'}`}>不合格</span>
                </button>
              </div>
            </div>
            {/* 测试员工姓名 */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">测试员工姓名 <span className="text-rose-500">*</span></label>
              <input
                type="text"
                value={materialTesterName}
                onChange={e => setMaterialTesterName(e.target.value)}
                placeholder="请输入测试员工姓名"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all"
              />
            </div>
            {/* 工号 */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">测试员工工号 <span className="text-rose-500">*</span></label>
              <input
                type="text"
                value={materialTesterId}
                onChange={e => setMaterialTesterId(e.target.value)}
                placeholder="请输入测试员工工号"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all"
              />
            </div>
            {/* 上传测试报告 */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">上传测试报告</label>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-cyan-400 hover:bg-cyan-50/30 transition-all cursor-pointer group">
                <div className="w-12 h-12 rounded-full bg-cyan-50 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6 text-cyan-500" />
                </div>
                <p className="text-sm font-medium text-slate-600 mb-1">点击或拖拽文件到此区域上传</p>
                <p className="text-xs text-slate-400">支持 .pdf, .xlsx, .docx, .jpg, .png 格式</p>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <button onClick={() => { setMaterialTestResult(''); setMaterialTesterName(''); setMaterialTesterId('') }} className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">取消</button>
            </DialogClose>
            <button
              onClick={() => {
                if (!materialTestResult || !materialTesterName.trim() || !materialTesterId.trim()) return
                setMaterialTestOpen(false)
                setMaterialTestResult('')
                setMaterialTesterName('')
                setMaterialTesterId('')
              }}
              disabled={!materialTestResult || !materialTesterName.trim() || !materialTesterId.trim()}
              className={`px-5 py-2 rounded-lg text-sm font-medium text-white transition-colors shadow-sm ${materialTestResult && materialTesterName.trim() && materialTesterId.trim() ? 'bg-amber-600 hover:bg-amber-700' : 'bg-slate-300 cursor-not-allowed'}`}
            >
              确认提交
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 物料测试报告弹窗 */}
      <Dialog open={testReportOpen} onOpenChange={setTestReportOpen}>
        <DialogContent className="sm:max-w-[650px] bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <FileText className="w-4 h-4 text-emerald-600" />
              </div>
              物料测试报告
            </DialogTitle>
            <DialogDescription className="text-slate-500">物料来料检验报告详情</DialogDescription>
          </DialogHeader>
          {selectedMaterial && (
            <div className="py-4 space-y-4">
              {/* 基本信息 */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-2"><div className="w-1 h-4 rounded-full bg-cyan-500" />基本信息</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2"><span className="text-slate-500 w-16">批次码:</span><span className="font-mono font-semibold text-slate-700">{selectedMaterial.batch}</span></div>
                  <div className="flex items-center gap-2"><span className="text-slate-500 w-16">物料名称:</span><span className="font-semibold text-slate-700">{selectedMaterial.name}</span></div>
                  <div className="flex items-center gap-2"><span className="text-slate-500 w-16">供应商:</span><span className="text-slate-700">{selectedMaterial.supplier}</span></div>
                  <div className="flex items-center gap-2"><span className="text-slate-500 w-16">规格:</span><span className="text-slate-700">{selectedMaterial.spec}</span></div>
                  <div className="flex items-center gap-2"><span className="text-slate-500 w-16">到货数量:</span><span className="font-semibold text-slate-700">{selectedMaterial.qty.toLocaleString()}</span></div>
                  <div className="flex items-center gap-2"><span className="text-slate-500 w-16">状态:</span><span className="badge-tested">{selectedMaterial.status}</span></div>
                </div>
              </div>
              {/* 测试结果 */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-2"><div className="w-1 h-4 rounded-full bg-emerald-500" />测试结果</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2"><span className="text-slate-500 w-16">测试结果:</span><span className={selectedMaterial.result === '合格' ? 'badge-pass' : 'badge-fail'}>{selectedMaterial.result === '合格' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}{selectedMaterial.result}</span></div>
                  <div className="flex items-center gap-2"><span className="text-slate-500 w-16">到货日期:</span><span className="text-slate-700">{selectedMaterial.arrival}</span></div>
                  <div className="flex items-center gap-2"><span className="text-slate-500 w-16">测试日期:</span><span className="text-slate-700">{selectedMaterial.testDate}</span></div>
                  <div className="flex items-center gap-2"><span className="text-slate-500 w-16">检验员:</span><span className="text-slate-700">A012</span></div>
                </div>
              </div>
              {/* 检验项目明细 */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-2"><div className="w-1 h-4 rounded-full bg-violet-500" />检验项目明细</h4>
                <table className="w-full text-xs">
                  <thead><tr className="border-b border-slate-200"><th className="text-left py-2 text-slate-500 font-semibold">检验项目</th><th className="text-left py-2 text-slate-500 font-semibold">标准值</th><th className="text-left py-2 text-slate-500 font-semibold">实测值</th><th className="text-left py-2 text-slate-500 font-semibold">结果</th></tr></thead>
                  <tbody>
                    <tr className="border-b border-slate-100"><td className="py-2 text-slate-700">外观检查</td><td className="py-2 text-slate-500">无缺陷</td><td className="py-2 text-slate-700">合格</td><td className="py-2"><span className="badge-pass"><CheckCircle2 className="w-2.5 h-2.5" />合格</span></td></tr>
                    <tr className="border-b border-slate-100"><td className="py-2 text-slate-700">尺寸检测</td><td className="py-2 text-slate-500">公差 ±0.1mm</td><td className="py-2 text-slate-700">±0.05mm</td><td className="py-2"><span className="badge-pass"><CheckCircle2 className="w-2.5 h-2.5" />合格</span></td></tr>
                    <tr className="border-b border-slate-100"><td className="py-2 text-slate-700">电性能测试</td><td className="py-2 text-slate-500">内阻 ≤50mΩ</td><td className="py-2 text-slate-700">{selectedMaterial.result === '合格' ? '35mΩ' : '68mΩ'}</td><td className="py-2"><span className={selectedMaterial.result === '合格' ? 'badge-pass' : 'badge-fail'}>{selectedMaterial.result === '合格' ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}{selectedMaterial.result === '合格' ? '合格' : '不合格'}</span></td></tr>
                    <tr><td className="py-2 text-slate-700">耐压测试</td><td className="py-2 text-slate-500">≥500V</td><td className="py-2 text-slate-700">550V</td><td className="py-2"><span className="badge-pass"><CheckCircle2 className="w-2.5 h-2.5" />合格</span></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <button className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">关闭</button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ---------- 3. 半成品测试 ---------- */
function SemiTestPage() {
  const passCount = testRecords.filter(r => r.result === 'pass').length
  const failCount = testRecords.filter(r => r.result === 'fail').length
  const [testReportOpen, setTestReportOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<typeof testRecords[0] | null>(null)
  const [connected, setConnected] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const filteredRecords = testRecords.filter(r =>
    r.pcb.includes(searchTerm) || r.sn.includes(searchTerm) || r.productModel.includes(searchTerm) || r.operator.includes(searchTerm)
  )
  return (
    <div className="space-y-5">
      {/* 连接状态 */}
      <div className={`connection-banner ${connected ? 'connected' : 'disconnected'}`}>
        <div className={`connection-dot ${connected ? 'connected' : 'disconnected'}`} />
        <span>{connected ? '测试机已连接' : '测试机未连接'}</span>
        {connected ? <Wifi className="w-4 h-4 ml-1" /> : <WifiOff className="w-4 h-4 ml-1" />}
        <button onClick={() => setConnected(!connected)} className="ml-auto text-xs px-3 py-1 rounded-lg border border-current/20 hover:bg-white/50 transition-colors">
          {connected ? '断开模拟' : '重连模拟'}
        </button>
      </div>
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '测试总数', value: testRecords.length, unit: '台', color: '#0891b2', bg: 'bg-cyan-50', icon: TestTube2 },
          { label: '通过数量', value: passCount, unit: '台', color: '#059669', bg: 'bg-emerald-50', icon: CheckCircle2 },
          { label: '异常数量', value: failCount, unit: '台', color: '#e11d48', bg: 'bg-rose-50', icon: XCircle },
          { label: '通过率', value: Math.round(passCount / testRecords.length * 100), unit: '%', color: '#7c3aed', bg: 'bg-violet-50', icon: Target },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className={`dash-card p-4 flex items-center gap-4`}>
            <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center`}>
              <s.icon className="w-6 h-6" style={{ color: s.color }} />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}<span className="text-sm font-normal text-slate-400 ml-0.5">{s.unit}</span></div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>
      {/* 正在测试 */}
      <SectionCard title="正在测试" icon={<Activity className="w-5 h-5 text-cyan-600" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {semiTestingData.map((item, i) => (
            <motion.div key={item.sn} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="testing-item-card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center">
                    <TestTube2 className="w-4 h-4 text-cyan-600" />
                  </div>
                  <div>
                    <div className="font-mono font-semibold text-sm text-slate-700">{item.sn}</div>
                    <div className="text-xs text-slate-500">{item.testItem}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Timer className="w-3.5 h-3.5 text-cyan-500" />
                  <span className="font-mono">{item.elapsed}</span>
                </div>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: `${item.progress}%`, background: `linear-gradient(90deg, #0891b2, #06b6d4)` }} />
              </div>
              <div className="flex justify-between mt-1.5 text-[10px] text-slate-400">
                <span>测试进度</span>
                <span className="font-semibold text-cyan-600">{item.progress}%</span>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionCard>
      {/* 搜索 */}
      <SectionCard title="已完成测试记录" icon={<FlaskConical className="w-5 h-5 text-cyan-600" />}>
        <div className="mb-4">
          <div className="relative inline-block">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="搜索主板二维码 / SN码 / 成品型号 / 操作员" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all w-80" />
          </div>
        </div>
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="data-table">
            <thead><tr><th>主板二维码</th><th>成品型号</th><th>过充</th><th>过流</th><th>操作员</th><th>测试时间</th><th>测试结果</th><th>操作</th></tr></thead>
            <tbody>
              {filteredRecords.map((r, i) => (
                <tr key={i}>
                  <td className="font-mono text-xs text-slate-500">{r.pcb}</td>
                  <td className="text-slate-700 font-medium">{r.productModel}</td>
                  <td className={r.overcharge > '4.25V' ? 'text-rose-600 font-semibold' : 'text-slate-600'}>{r.overcharge}</td>
                  <td className={r.overcurrent > '2.5A' ? 'text-rose-600 font-semibold' : 'text-slate-600'}>{r.overcurrent}</td>
                  <td className="text-slate-600">{r.operator}</td>
                  <td className="text-slate-500">{r.time}</td>
                  <td><span className={r.result === 'pass' ? 'badge-pass' : 'badge-fail'}>{r.result === 'pass' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}{r.result === 'pass' ? '准许入库' : '异常隔离'}</span></td>
                  <td><button onClick={() => { setSelectedRecord(r); setTestReportOpen(true) }} className="flex items-center gap-1 text-cyan-600 hover:text-cyan-700 text-xs font-medium"><FileText className="w-3.5 h-3.5" />测试报告</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* 半成品测试报告弹窗 */}
      <Dialog open={testReportOpen} onOpenChange={setTestReportOpen}>
        <DialogContent className="sm:max-w-[650px] bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800">
              <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center">
                <FileText className="w-4 h-4 text-cyan-600" />
              </div>
              半成品测试报告
            </DialogTitle>
            <DialogDescription className="text-slate-500">半成品出厂检测报告详情</DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="py-4 space-y-4">
              {/* 设备信息 */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-2"><div className="w-1 h-4 rounded-full bg-cyan-500" />设备信息</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2"><span className="text-slate-500 w-20">主板二维码:</span><span className="font-mono text-slate-700">{selectedRecord.pcb}</span></div>
                  <div className="flex items-center gap-2"><span className="text-slate-500 w-20">成品型号:</span><span className="text-slate-700 font-medium">{selectedRecord.productModel}</span></div>
                  <div className="flex items-center gap-2"><span className="text-slate-500 w-20">操作员:</span><span className="text-slate-700">{selectedRecord.operator}</span></div>
                  <div className="flex items-center gap-2"><span className="text-slate-500 w-20">测试时间:</span><span className="text-slate-700">{selectedRecord.time}</span></div>
                  <div className="flex items-center gap-2"><span className="text-slate-500 w-20">测试结果:</span><span className={selectedRecord.result === 'pass' ? 'badge-pass' : 'badge-fail'}>{selectedRecord.result === 'pass' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}{selectedRecord.result === 'pass' ? '准许入库' : '异常隔离'}</span></div>
                </div>
              </div>
              {/* 测试项明细 */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-2"><div className="w-1 h-4 rounded-full bg-emerald-500" />测试项明细</h4>
                <table className="w-full text-xs">
                  <thead><tr className="border-b border-slate-200"><th className="text-left py-2 text-slate-500 font-semibold">测试项目</th><th className="text-left py-2 text-slate-500 font-semibold">标准值</th><th className="text-left py-2 text-slate-500 font-semibold">实测值</th><th className="text-left py-2 text-slate-500 font-semibold">结果</th></tr></thead>
                  <tbody>
                    <tr className="border-b border-slate-100"><td className="py-2 text-slate-700">过充保护</td><td className="py-2 text-slate-500">4.25V ±0.05V</td><td className="py-2 text-slate-700">{selectedRecord.overcharge}</td><td className="py-2"><span className={selectedRecord.overcharge <= '4.25V' ? 'badge-pass' : 'badge-fail'}>{selectedRecord.overcharge <= '4.25V' ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}{selectedRecord.overcharge <= '4.25V' ? '合格' : '不合格'}</span></td></tr>
                    <tr className="border-b border-slate-100"><td className="py-2 text-slate-700">过流保护</td><td className="py-2 text-slate-500">≤2.5A</td><td className="py-2 text-slate-700">{selectedRecord.overcurrent}</td><td className="py-2"><span className={selectedRecord.overcurrent <= '2.5A' ? 'badge-pass' : 'badge-fail'}>{selectedRecord.overcurrent <= '2.5A' ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}{selectedRecord.overcurrent <= '2.5A' ? '合格' : '不合格'}</span></td></tr>
                    <tr className="border-b border-slate-100"><td className="py-2 text-slate-700">过放保护</td><td className="py-2 text-slate-500">2.40V ±0.05V</td><td className="py-2 text-slate-700">{selectedRecord.result === 'pass' ? '2.42V' : '2.10V'}</td><td className="py-2"><span className={selectedRecord.result === 'pass' ? 'badge-pass' : 'badge-fail'}>{selectedRecord.result === 'pass' ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}{selectedRecord.result === 'pass' ? '合格' : '不合格'}</span></td></tr>
                    <tr className="border-b border-slate-100"><td className="py-2 text-slate-700">短路保护</td><td className="py-2 text-slate-500">≤10ms 断开</td><td className="py-2 text-slate-700">8ms</td><td className="py-2"><span className="badge-pass"><CheckCircle2 className="w-2.5 h-2.5" />合格</span></td></tr>
                    <tr><td className="py-2 text-slate-700">内阻测试</td><td className="py-2 text-slate-500">≤50mΩ</td><td className="py-2 text-slate-700">{selectedRecord.result === 'pass' ? '32mΩ' : '78mΩ'}</td><td className="py-2"><span className={selectedRecord.result === 'pass' ? 'badge-pass' : 'badge-fail'}>{selectedRecord.result === 'pass' ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}{selectedRecord.result === 'pass' ? '合格' : '不合格'}</span></td></tr>
                  </tbody>
                </table>
              </div>
              {/* 综合判定 */}
              <div className={`rounded-lg p-4 border ${selectedRecord.result === 'pass' ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                <div className="flex items-center gap-3">
                  {selectedRecord.result === 'pass' ? <CheckCircle2 className="w-6 h-6 text-emerald-600" /> : <XCircle className="w-6 h-6 text-rose-600" />}
                  <div>
                    <div className={`text-sm font-bold ${selectedRecord.result === 'pass' ? 'text-emerald-700' : 'text-rose-700'}`}>{selectedRecord.result === 'pass' ? '综合判定：合格' : '综合判定：不合格'}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{selectedRecord.result === 'pass' ? '所有测试项目均在标准范围内，准许入库' : '存在测试项目超出标准范围，需异常隔离处理'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <button className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">关闭</button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ---------- 4. 成品测试 ---------- */
function ProductTestPage() {
  const passCount = testRecords.filter(r => r.result === 'pass').length
  const failCount = testRecords.filter(r => r.result === 'fail').length
  const [testReportOpen, setTestReportOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<typeof testRecords[0] | null>(null)
  const [connected, setConnected] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const filteredRecords = testRecords.filter(r =>
    r.pcb.includes(searchTerm) || r.sn.includes(searchTerm) || r.productModel.includes(searchTerm) || r.operator.includes(searchTerm)
  )
  return (
    <div className="space-y-5">
      {/* 连接状态 */}
      <div className={`connection-banner ${connected ? 'connected' : 'disconnected'}`}>
        <div className={`connection-dot ${connected ? 'connected' : 'disconnected'}`} />
        <span>{connected ? '测试机已连接' : '测试机未连接'}</span>
        {connected ? <Wifi className="w-4 h-4 ml-1" /> : <WifiOff className="w-4 h-4 ml-1" />}
        <button onClick={() => setConnected(!connected)} className="ml-auto text-xs px-3 py-1 rounded-lg border border-current/20 hover:bg-white/50 transition-colors">
          {connected ? '断开模拟' : '重连模拟'}
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '测试总数', value: testRecords.length, unit: '台', color: '#0891b2', bg: 'bg-cyan-50', icon: Activity },
          { label: '通过数量', value: passCount, unit: '台', color: '#059669', bg: 'bg-emerald-50', icon: CheckCircle2 },
          { label: '异常数量', value: failCount, unit: '台', color: '#e11d48', bg: 'bg-rose-50', icon: XCircle },
          { label: '通过率', value: Math.round(passCount / testRecords.length * 100), unit: '%', color: '#7c3aed', bg: 'bg-violet-50', icon: Target },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="dash-card p-4 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center`}>
              <s.icon className="w-6 h-6" style={{ color: s.color }} />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}<span className="text-sm font-normal text-slate-400 ml-0.5">{s.unit}</span></div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>
      {/* 正在测试 */}
      <SectionCard title="正在测试" icon={<Activity className="w-5 h-5 text-violet-600" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {productTestingData.map((item, i) => (
            <motion.div key={item.sn} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="testing-item-card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-violet-600" />
                  </div>
                  <div>
                    <div className="font-mono font-semibold text-sm text-slate-700">{item.sn}</div>
                    <div className="text-xs text-slate-500">{item.testItem}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Timer className="w-3.5 h-3.5 text-violet-500" />
                  <span className="font-mono">{item.elapsed}</span>
                </div>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: `${item.progress}%`, background: `linear-gradient(90deg, #7c3aed, #a78bfa)` }} />
              </div>
              <div className="flex justify-between mt-1.5 text-[10px] text-slate-400">
                <span>测试进度</span>
                <span className="font-semibold text-violet-600">{item.progress}%</span>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="已完成测试记录" icon={<BarChart2 className="w-5 h-5 text-violet-600" />}>
        <div className="mb-4">
          <div className="relative inline-block">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="搜索主板二维码 / SN码 / 成品型号" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all w-72" />
          </div>
        </div>
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="data-table">
            <thead><tr><th>机柜 SN 码</th><th>主板二维码</th><th>电芯二维码</th><th>操作员</th><th>测试时间</th><th>测试结果</th><th>操作</th></tr></thead>
            <tbody>
              {filteredRecords.map((r, i) => (
                <tr key={i}>
                  <td className="font-mono font-semibold text-slate-700">{r.sn}</td>
                  <td className="font-mono text-xs text-slate-500">{r.pcb}</td>
                  <td className="font-mono text-xs text-slate-500">{r.cell}</td>
                  <td className="text-slate-600">{r.operator}</td>
                  <td className="text-slate-500">{r.time}</td>
                  <td><span className={r.result === 'pass' ? 'badge-pass' : 'badge-fail'}>{r.result === 'pass' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}{r.result === 'pass' ? '准许入库' : '异常隔离'}</span></td>
                  <td><button onClick={() => { setSelectedRecord(r); setTestReportOpen(true) }} className="flex items-center gap-1 text-cyan-600 hover:text-cyan-700 text-xs font-medium"><FileText className="w-3.5 h-3.5" />测试报告</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* 成品测试报告弹窗 */}
      <Dialog open={testReportOpen} onOpenChange={setTestReportOpen}>
        <DialogContent className="sm:max-w-[650px] bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800">
              <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                <FileText className="w-4 h-4 text-violet-600" />
              </div>
              成品测试报告
            </DialogTitle>
            <DialogDescription className="text-slate-500">成品出厂检测报告详情</DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="py-4 space-y-4">
              {/* 设备信息 */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-2"><div className="w-1 h-4 rounded-full bg-violet-500" />设备信息</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2"><span className="text-slate-500 w-20">机柜SN码:</span><span className="font-mono font-semibold text-slate-700">{selectedRecord.sn}</span></div>
                  <div className="flex items-center gap-2"><span className="text-slate-500 w-20">主板二维码:</span><span className="font-mono text-slate-700">{selectedRecord.pcb}</span></div>
                  <div className="flex items-center gap-2"><span className="text-slate-500 w-20">电芯二维码:</span><span className="font-mono text-slate-700">{selectedRecord.cell}</span></div>
                  <div className="flex items-center gap-2"><span className="text-slate-500 w-20">操作员:</span><span className="text-slate-700">{selectedRecord.operator}</span></div>
                  <div className="flex items-center gap-2"><span className="text-slate-500 w-20">测试时间:</span><span className="text-slate-700">{selectedRecord.time}</span></div>
                  <div className="flex items-center gap-2"><span className="text-slate-500 w-20">测试结果:</span><span className={selectedRecord.result === 'pass' ? 'badge-pass' : 'badge-fail'}>{selectedRecord.result === 'pass' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}{selectedRecord.result === 'pass' ? '准许入库' : '异常隔离'}</span></div>
                </div>
              </div>
              {/* 测试项明细 */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-2"><div className="w-1 h-4 rounded-full bg-emerald-500" />测试项明细</h4>
                <table className="w-full text-xs">
                  <thead><tr className="border-b border-slate-200"><th className="text-left py-2 text-slate-500 font-semibold">测试项目</th><th className="text-left py-2 text-slate-500 font-semibold">标准值</th><th className="text-left py-2 text-slate-500 font-semibold">实测值</th><th className="text-left py-2 text-slate-500 font-semibold">结果</th></tr></thead>
                  <tbody>
                    <tr className="border-b border-slate-100"><td className="py-2 text-slate-700">满充容量</td><td className="py-2 text-slate-500">≥10000mAh</td><td className="py-2 text-slate-700">{selectedRecord.result === 'pass' ? '10250mAh' : '9600mAh'}</td><td className="py-2"><span className={selectedRecord.result === 'pass' ? 'badge-pass' : 'badge-fail'}>{selectedRecord.result === 'pass' ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}{selectedRecord.result === 'pass' ? '合格' : '不合格'}</span></td></tr>
                    <tr className="border-b border-slate-100"><td className="py-2 text-slate-700">循环寿命</td><td className="py-2 text-slate-500">≥500次</td><td className="py-2 text-slate-700">520次</td><td className="py-2"><span className="badge-pass"><CheckCircle2 className="w-2.5 h-2.5" />合格</span></td></tr>
                    <tr className="border-b border-slate-100"><td className="py-2 text-slate-700">自耗电测试</td><td className="py-2 text-slate-500">≤3%/月</td><td className="py-2 text-slate-700">{selectedRecord.result === 'pass' ? '2.1%' : '5.8%'}</td><td className="py-2"><span className={selectedRecord.result === 'pass' ? 'badge-pass' : 'badge-fail'}>{selectedRecord.result === 'pass' ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}{selectedRecord.result === 'pass' ? '合格' : '不合格'}</span></td></tr>
                    <tr className="border-b border-slate-100"><td className="py-2 text-slate-700">温升测试</td><td className="py-2 text-slate-500">≤10°C</td><td className="py-2 text-slate-700">7°C</td><td className="py-2"><span className="badge-pass"><CheckCircle2 className="w-2.5 h-2.5" />合格</span></td></tr>
                    <tr><td className="py-2 text-slate-700">BMS通信</td><td className="py-2 text-slate-500">正常响应</td><td className="py-2 text-slate-700">正常</td><td className="py-2"><span className="badge-pass"><CheckCircle2 className="w-2.5 h-2.5" />合格</span></td></tr>
                  </tbody>
                </table>
              </div>
              {/* 综合判定 */}
              <div className={`rounded-lg p-4 border ${selectedRecord.result === 'pass' ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                <div className="flex items-center gap-3">
                  {selectedRecord.result === 'pass' ? <CheckCircle2 className="w-6 h-6 text-emerald-600" /> : <XCircle className="w-6 h-6 text-rose-600" />}
                  <div>
                    <div className={`text-sm font-bold ${selectedRecord.result === 'pass' ? 'text-emerald-700' : 'text-rose-700'}`}>{selectedRecord.result === 'pass' ? '综合判定：合格' : '综合判定：不合格'}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{selectedRecord.result === 'pass' ? '所有成品检测项目均在标准范围内，准许入库' : '存在检测项目超出标准范围，需异常隔离处理'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <button className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">关闭</button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ---------- 5. 设备装箱 ---------- */
function PackagingPage() {
  const [expandedRow, setExpandedRow] = useState<number | null>(null)
  const [dataEntryOpen, setDataEntryOpen] = useState(false)
  return (
    <div className="space-y-5">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: '已装总箱数', value: 15600, unit: '箱', color: '#d97706', bg: 'bg-amber-50', icon: Box },
          { label: '已装机柜数', value: 15600, unit: '台', color: '#0891b2', bg: 'bg-cyan-50', icon: Database },
          { label: 'OID 备案率', value: 100, unit: '%', color: '#059669', bg: 'bg-emerald-50', icon: Shield },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="dash-card p-4 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center`}>
              <s.icon className="w-6 h-6" style={{ color: s.color }} />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value.toLocaleString()}<span className="text-sm font-normal text-slate-400 ml-0.5">{s.unit}</span></div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>
      {/* 表格 */}
      <SectionCard title="出厂备案与装箱关联" icon={<Truck className="w-5 h-5 text-amber-600" />}
        action={<button onClick={() => setDataEntryOpen(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-700 transition-colors shadow-sm"><Plus className="w-4 h-4" /> 数据录入</button>}
      >
        <div className="mb-4">
          <div className="relative inline-block">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="装箱批次码 / 设备编号" className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all w-64" />
          </div>
        </div>
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="data-table">
            <thead><tr><th>外箱批次码</th><th>包含单品数量</th><th>3C 认证编号</th><th>OID 监管状态</th><th>操作员</th><th>装箱日期</th><th>生产单编号</th><th>型号</th><th>操作</th></tr></thead>
            <tbody>
              {packagingRecords.map((r, i) => (
                <>
                  <tr key={i}>
                    <td className="font-mono font-semibold text-slate-700">{r.batch}</td>
                    <td className="font-semibold">{r.count} 台</td>
                    <td className="font-mono text-xs text-slate-500">{r.cert3c}</td>
                    <td><span className="badge-synced"><CheckCircle2 className="w-3 h-3" />{r.oidStatus}</span></td>
                    <td>{r.operator}</td>
                    <td className="text-slate-500">{r.date}</td>
                    <td className="font-mono text-xs text-cyan-600">{r.workOrder}</td>
                    <td className="text-slate-700">{r.model}</td>
                    <td><button onClick={() => setExpandedRow(expandedRow === i ? null : i)}
                      className="flex items-center gap-1 text-cyan-600 hover:text-cyan-700 text-xs font-medium">
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${expandedRow === i ? 'rotate-90' : ''}`} />子件编号
                    </button></td>
                  </tr>
                  {expandedRow === i && (
                    <tr key={`sub-${i}`}>
                      <td colSpan={9} className="bg-slate-50/60 px-8 py-3">
                        <div className="text-xs text-slate-500 mb-2 font-medium">子件编号列表 ({r.subs.length} 件)</div>
                        <div className="flex flex-wrap gap-2">
                          {r.subs.map((sub, si) => (
                            <span key={si} className="px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-mono text-slate-600 shadow-sm">{sub}</span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* 数据录入弹窗 */}
      <Dialog open={dataEntryOpen} onOpenChange={setDataEntryOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <Plus className="w-4 h-4 text-amber-600" />
              </div>
              装箱数据录入
            </DialogTitle>
            <DialogDescription className="text-slate-500">请填写装箱关联信息并提交备案</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">外箱批次码 <span className="text-rose-500">*</span></label>
              <input type="text" placeholder="例如：BOX-20231024-003" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">包含单品数量 <span className="text-rose-500">*</span></label>
              <input type="number" placeholder="0" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">3C 认证编号</label>
              <input type="text" placeholder="例如：202001090729XXXX" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">OID 监管状态</label>
              <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all bg-white">
                <option>待同步备案</option>
                <option>已同步备案</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">操作员</label>
              <input type="text" placeholder="当前登录用户" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all bg-slate-50" readOnly />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">装箱日期</label>
              <input type="datetime-local" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all" />
            </div>
          </div>
          <div className="space-y-2 pb-2">
            <label className="text-xs font-semibold text-slate-700">子件编号（多个编号用逗号分隔）</label>
            <textarea rows={3} placeholder="SN-SUB-8839201901, SN-SUB-8839201902, ..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all resize-none" />
          </div>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <button className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">取消</button>
            </DialogClose>
            <button onClick={() => setDataEntryOpen(false)} className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-700 transition-colors shadow-sm">
              <Save className="w-4 h-4" /> 提交录入
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


/* ---------- 6. 电芯派克 ---------- */
function CellPackTestPage() {
  const [connected, setConnected] = useState(true)
  const [testReportOpen, setTestReportOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<typeof cellPackCompletedData[0] | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const filteredCompleted = cellPackCompletedData.filter(r =>
    r.sn.includes(searchTerm) || r.brand.includes(searchTerm) || r.productModel.includes(searchTerm) || r.workOrder.includes(searchTerm)
  )
  return (
    <div className="space-y-5">
      {/* 连接状态 */}
      <div className={`connection-banner ${connected ? 'connected' : 'disconnected'}`}>
        <div className={`connection-dot ${connected ? 'connected' : 'disconnected'}`} />
        <span>{connected ? '派克测试机已连接' : '派克测试机未连接'}</span>
        {connected ? <Wifi className="w-4 h-4 ml-1" /> : <WifiOff className="w-4 h-4 ml-1" />}
        <button onClick={() => setConnected(!connected)} className="ml-auto text-xs px-3 py-1 rounded-lg border border-current/20 hover:bg-white/50 transition-colors">
          {connected ? '断开模拟' : '重连模拟'}
        </button>
      </div>
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '正在测试', value: cellPackTestingData.length, unit: '个', color: '#0891b2', bg: 'bg-cyan-50', icon: BatteryCharging },
          { label: '已完成测试', value: cellPackCompletedData.length, unit: '个', color: '#059669', bg: 'bg-emerald-50', icon: CheckCircle2 },
          { label: '合格数量', value: cellPackCompletedData.filter(r => r.result === 'pass').length, unit: '个', color: '#7c3aed', bg: 'bg-violet-50', icon: Target },
          { label: '异常数量', value: cellPackCompletedData.filter(r => r.result === 'fail').length, unit: '个', color: '#e11d48', bg: 'bg-rose-50', icon: XCircle },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="dash-card p-4 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center`}>
              <s.icon className="w-6 h-6" style={{ color: s.color }} />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}<span className="text-sm font-normal text-slate-400 ml-0.5">{s.unit}</span></div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>
      {/* 正在测试 */}
      <SectionCard title="正在测试" icon={<BatteryCharging className="w-5 h-5 text-cyan-600" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cellPackTestingData.map((item, i) => (
            <motion.div key={item.sn} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} className="testing-item-card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center">
                    <BatteryCharging className="w-4 h-4 text-cyan-600" />
                  </div>
                  <div>
                    <div className="font-mono font-semibold text-sm text-slate-700">{item.sn}</div>
                    <div className="text-xs text-slate-500">{item.testItem}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Timer className="w-3.5 h-3.5 text-cyan-500" />
                  <span className="font-mono">{item.elapsed}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="text-center p-2 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500 mb-0.5">电压</div>
                  <div className="text-sm font-bold text-cyan-600">{item.voltage}V</div>
                </div>
                <div className="text-center p-2 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500 mb-0.5">电流</div>
                  <div className="text-sm font-bold text-violet-600">{item.current}A</div>
                </div>
                <div className="text-center p-2 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500 mb-0.5">温度</div>
                  <div className={`text-sm font-bold ${item.temperature > 35 ? 'text-rose-600' : 'text-emerald-600'}`}>{item.temperature}°C</div>
                </div>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: `${item.progress}%`, background: `linear-gradient(90deg, #0891b2, #06b6d4)` }} />
              </div>
              <div className="flex justify-between mt-1.5 text-[10px] text-slate-400">
                <span>测试进度</span>
                <span className="font-semibold text-cyan-600">{item.progress}%</span>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionCard>
      {/* 已完成测试 */}
      <SectionCard title="已完成测试记录" icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}>
        <div className="mb-4">
          <div className="relative inline-block">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="搜索SN码 / 品牌 / 成品型号 / 工单" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all w-80" />
          </div>
        </div>
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="data-table">
            <thead><tr><th>电芯 SN 码</th><th>电压</th><th>温度</th><th>测试结果</th><th>测试时长</th><th>测试时间</th><th>品牌</th><th>型号</th><th>类型</th><th>成品型号</th><th>生产工单编号</th><th>操作</th></tr></thead>
            <tbody>
              {filteredCompleted.map((r, i) => (
                <tr key={i}>
                  <td className="font-mono font-semibold text-slate-700">{r.sn}</td>
                  <td className="font-semibold" style={{ color: r.voltage >= 3.7 ? '#059669' : '#e11d48' }}>{r.voltage}V</td>
                  <td className={r.temperature > 38 ? 'text-rose-600 font-semibold' : 'text-slate-600'}>{r.temperature}°C</td>
                  <td><span className={r.result === 'pass' ? 'badge-pass' : 'badge-fail'}>{r.result === 'pass' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}{r.result === 'pass' ? '合格' : '不合格'}</span></td>
                  <td className="text-slate-500 font-mono text-xs">{r.duration}</td>
                  <td className="text-slate-500 text-xs whitespace-nowrap">{r.testTime}</td>
                  <td className="text-slate-700">{r.brand}</td>
                  <td className="font-mono text-xs text-slate-500">{r.model}</td>
                  <td><span className="text-xs px-2 py-0.5 rounded font-medium bg-violet-50 text-violet-700">{r.type}</span></td>
                  <td className="text-slate-700 font-medium">{r.productModel}</td>
                  <td className="font-mono text-xs text-cyan-600">{r.workOrder}</td>
                  <td><button onClick={() => { setSelectedRecord(r); setTestReportOpen(true) }} className="flex items-center gap-1 text-cyan-600 hover:text-cyan-700 text-xs font-medium"><FileText className="w-3.5 h-3.5" />测试报告</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
      {/* 测试报告弹窗 */}
      <Dialog open={testReportOpen} onOpenChange={setTestReportOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800">
              <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center">
                <FileText className="w-4 h-4 text-cyan-600" />
              </div>
              电芯派克测试报告
            </DialogTitle>
            <DialogDescription className="text-slate-500">电芯派克检测报告详情</DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="py-4 space-y-4">
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-2"><div className="w-1 h-4 rounded-full bg-cyan-500" />基本信息</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2"><span className="text-slate-500 w-16">SN码:</span><span className="font-mono font-semibold text-slate-700">{selectedRecord.sn}</span></div>
                  <div className="flex items-center gap-2"><span className="text-slate-500 w-16">电压:</span><span className="font-semibold text-slate-700">{selectedRecord.voltage}V</span></div>
                  <div className="flex items-center gap-2"><span className="text-slate-500 w-16">温度:</span><span className="text-slate-700">{selectedRecord.temperature}°C</span></div>
                  <div className="flex items-center gap-2"><span className="text-slate-500 w-16">品牌:</span><span className="text-slate-700">{selectedRecord.brand}</span></div>
                  <div className="flex items-center gap-2"><span className="text-slate-500 w-16">型号:</span><span className="text-slate-700">{selectedRecord.model}</span></div>
                  <div className="flex items-center gap-2"><span className="text-slate-500 w-16">类型:</span><span className="text-slate-700">{selectedRecord.type}</span></div>
                  <div className="flex items-center gap-2"><span className="text-slate-500 w-16">成品型号:</span><span className="text-slate-700">{selectedRecord.productModel}</span></div>
                  <div className="flex items-center gap-2"><span className="text-slate-500 w-16">工单编号:</span><span className="font-mono text-cyan-600">{selectedRecord.workOrder}</span></div>
                  <div className="flex items-center gap-2"><span className="text-slate-500 w-16">测试时长:</span><span className="text-slate-700">{selectedRecord.duration}</span></div>
                  <div className="flex items-center gap-2"><span className="text-slate-500 w-16">测试时间:</span><span className="text-slate-700">{selectedRecord.testTime}</span></div>
                  <div className="flex items-center gap-2"><span className="text-slate-500 w-16">测试结果:</span><span className={selectedRecord.result === 'pass' ? 'badge-pass' : 'badge-fail'}>{selectedRecord.result === 'pass' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}{selectedRecord.result === 'pass' ? '合格' : '不合格'}</span></div>
                </div>
              </div>
              <div className={`rounded-lg p-4 border ${selectedRecord.result === 'pass' ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                <div className="flex items-center gap-3">
                  {selectedRecord.result === 'pass' ? <CheckCircle2 className="w-6 h-6 text-emerald-600" /> : <XCircle className="w-6 h-6 text-rose-600" />}
                  <div>
                    <div className={`text-sm font-bold ${selectedRecord.result === 'pass' ? 'text-emerald-700' : 'text-rose-700'}`}>{selectedRecord.result === 'pass' ? '综合判定：合格' : '综合判定：不合格'}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{selectedRecord.result === 'pass' ? '所有检测项目均在标准范围内' : '存在检测项目超出标准范围，需异常隔离'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <button className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">关闭</button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ---------- 7. 老化测试 ---------- */
function AgingTestPage() {
  const [connected, setConnected] = useState(true)
  const [testReportOpen, setTestReportOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<typeof agingCompletedData[0] | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const filteredCompleted = agingCompletedData.filter(r =>
    r.sn.includes(searchTerm) || r.workOrder.includes(searchTerm) || r.rackId.includes(searchTerm)
  )
  // Calculate rack stats
  const rackStats = racks.map(rackId => {
    const rackCompleted = agingCompletedData.filter(r => r.rackId === rackId)
    const rackTesting = agingTestingData.filter(r => r.rackId === rackId)
    const passCount = rackCompleted.filter(r => r.result === '合格').length
    const failCount = rackCompleted.filter(r => r.result === '不合格').length
    const total = rackCompleted.length
    const isConnected = connected && (rackTesting.length > 0 || rackCompleted.length > 0)
    return { rackId, passCount, failCount, total, rackTesting, isConnected }
  })
  return (
    <div className="space-y-5">
      {/* 连接状态 */}
      <div className={`connection-banner ${connected ? 'connected' : 'disconnected'}`}>
        <div className={`connection-dot ${connected ? 'connected' : 'disconnected'}`} />
        <span>{connected ? '老化测试机已连接' : '老化测试机未连接'}</span>
        {connected ? <Wifi className="w-4 h-4 ml-1" /> : <WifiOff className="w-4 h-4 ml-1" />}
        <button onClick={() => setConnected(!connected)} className="ml-auto text-xs px-3 py-1 rounded-lg border border-current/20 hover:bg-white/50 transition-colors">
          {connected ? '断开模拟' : '重连模拟'}
        </button>
      </div>
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '正在测试', value: agingTestingData.length, unit: '台', color: '#0891b2', bg: 'bg-cyan-50', icon: Thermometer },
          { label: '已完成测试', value: agingCompletedData.length, unit: '台', color: '#059669', bg: 'bg-emerald-50', icon: CheckCircle2 },
          { label: '合格数量', value: agingCompletedData.filter(r => r.result === '合格').length, unit: '台', color: '#7c3aed', bg: 'bg-violet-50', icon: Target },
          { label: '不合格数量', value: agingCompletedData.filter(r => r.result === '不合格').length, unit: '台', color: '#e11d48', bg: 'bg-rose-50', icon: XCircle },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="dash-card p-4 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center`}>
              <s.icon className="w-6 h-6" style={{ color: s.color }} />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}<span className="text-sm font-normal text-slate-400 ml-0.5">{s.unit}</span></div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>
      {/* 老化测试架概览 */}
      <SectionCard title="老化测试架概览" icon={<Grid3X3 className="w-5 h-5 text-amber-600" />}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rackStats.map((rack, i) => (
            <motion.div key={rack.rackId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="dash-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Thermometer className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="font-semibold text-slate-700">{rack.rackId}</div>
                </div>
                <div className="flex items-center gap-1.5">
                  {rack.isConnected ? <Wifi className="w-3.5 h-3.5 text-emerald-500" /> : <WifiOff className="w-3.5 h-3.5 text-slate-400" />}
                  <span className={`text-xs font-medium ${rack.isConnected ? 'text-emerald-600' : 'text-slate-400'}`}>{rack.isConnected ? '已连接' : '未连接'}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="text-center p-2 bg-emerald-50 rounded-lg">
                  <div className="text-lg font-bold text-emerald-600">{rack.passCount}</div>
                  <div className="text-[10px] text-slate-500">合格</div>
                </div>
                <div className="text-center p-2 bg-rose-50 rounded-lg">
                  <div className="text-lg font-bold text-rose-600">{rack.failCount}</div>
                  <div className="text-[10px] text-slate-500">不合格</div>
                </div>
              </div>
              {rack.total > 0 && (
                <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                  <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${(rack.passCount / rack.total) * 100}%` }} />
                </div>
              )}
              <div className="text-xs text-slate-500">
                通过率: {rack.total > 0 ? Math.round((rack.passCount / rack.total) * 100) : 0}%
              </div>
              {rack.rackTesting.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-100">
                  <div className="text-[10px] text-slate-400 mb-1">正在测试设备:</div>
                  {rack.rackTesting.map(item => (
                    <div key={item.sn} className="py-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-slate-600">{item.sn}</span>
                        <span className="text-amber-600 font-medium">{item.progress}%</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] mt-0.5">
                        <span className="text-slate-400">工单:</span>
                        <span className="font-mono text-cyan-600">{item.workOrder}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </SectionCard>
      {/* 已完成老化测试 */}
      <SectionCard title="已完成老化测试记录" icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}>
        <div className="mb-4">
          <div className="relative inline-block">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="搜索SN码 / 工单编号 / 测试架编号" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all w-80" />
          </div>
        </div>
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="data-table">
            <thead><tr><th>设备 SN 码</th><th>温度</th><th>电压</th><th>损耗</th><th>充电</th><th>放电</th><th>测试结果</th><th>测试时长</th><th>测试时间</th><th>生产单编号</th><th>测试架编号</th><th>操作</th></tr></thead>
            <tbody>
              {filteredCompleted.map((r, i) => (
                <tr key={i}>
                  <td className="font-mono font-semibold text-slate-700">{r.sn}</td>
                  <td className={r.temperature > 60 ? 'text-rose-600 font-semibold' : 'text-slate-600'}>{r.temperature}°C</td>
                  <td className={r.voltage < 3.5 ? 'text-rose-600 font-semibold' : 'text-slate-600'}>{r.voltage}V</td>
                  <td className={r.loss > 5 ? 'text-rose-600 font-semibold' : 'text-amber-600 font-semibold'}>{r.loss}%</td>
                  <td className="text-slate-600">{r.charge}</td>
                  <td className="text-slate-600">{r.discharge}</td>
                  <td><span className={r.result === '合格' ? 'badge-pass' : 'badge-fail'}>{r.result === '合格' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}{r.result}</span></td>
                  <td className="text-slate-500 font-mono text-xs">{r.duration}</td>
                  <td className="text-slate-500 text-xs whitespace-nowrap">{r.testTime}</td>
                  <td className="font-mono text-xs text-cyan-600">{r.workOrder}</td>
                  <td><span className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">{r.rackId}</span></td>
                  <td><button onClick={() => { setSelectedRecord(r); setTestReportOpen(true) }} className="flex items-center gap-1 text-cyan-600 hover:text-cyan-700 text-xs font-medium"><FileText className="w-3.5 h-3.5" />测试报告</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
      {/* 老化测试报告弹窗 */}
      <Dialog open={testReportOpen} onOpenChange={setTestReportOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <FileText className="w-4 h-4 text-amber-600" />
              </div>
              老化测试报告
            </DialogTitle>
            <DialogDescription className="text-slate-500">设备老化检测报告详情</DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="py-4 space-y-4">
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-2"><div className="w-1 h-4 rounded-full bg-amber-500" />设备信息</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2"><span className="text-slate-500 w-16">SN码:</span><span className="font-mono font-semibold text-slate-700">{selectedRecord.sn}</span></div>
                  <div className="flex items-center gap-2"><span className="text-slate-500 w-16">温度:</span><span className="text-slate-700">{selectedRecord.temperature}°C</span></div>
                  <div className="flex items-center gap-2"><span className="text-slate-500 w-16">电压:</span><span className="text-slate-700">{selectedRecord.voltage}V</span></div>
                  <div className="flex items-center gap-2"><span className="text-slate-500 w-16">损耗:</span><span className="text-slate-700">{selectedRecord.loss}%</span></div>
                  <div className="flex items-center gap-2"><span className="text-slate-500 w-16">充电:</span><span className="text-slate-700">{selectedRecord.charge}</span></div>
                  <div className="flex items-center gap-2"><span className="text-slate-500 w-16">放电:</span><span className="text-slate-700">{selectedRecord.discharge}</span></div>
                  <div className="flex items-center gap-2"><span className="text-slate-500 w-16">测试时长:</span><span className="text-slate-700">{selectedRecord.duration}</span></div>
                  <div className="flex items-center gap-2"><span className="text-slate-500 w-16">测试架:</span><span className="font-mono text-amber-600">{selectedRecord.rackId}</span></div>
                  <div className="flex items-center gap-2"><span className="text-slate-500 w-16">工单编号:</span><span className="font-mono text-cyan-600">{selectedRecord.workOrder}</span></div>
                  <div className="flex items-center gap-2"><span className="text-slate-500 w-16">测试结果:</span><span className={selectedRecord.result === '合格' ? 'badge-pass' : 'badge-fail'}>{selectedRecord.result === '合格' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}{selectedRecord.result}</span></div>
                </div>
              </div>
              <div className={`rounded-lg p-4 border ${selectedRecord.result === '合格' ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                <div className="flex items-center gap-3">
                  {selectedRecord.result === '合格' ? <CheckCircle2 className="w-6 h-6 text-emerald-600" /> : <XCircle className="w-6 h-6 text-rose-600" />}
                  <div>
                    <div className={`text-sm font-bold ${selectedRecord.result === '合格' ? 'text-emerald-700' : 'text-rose-700'}`}>{selectedRecord.result === '合格' ? '综合判定：合格' : '综合判定：不合格'}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{selectedRecord.result === '合格' ? '老化测试各项指标均在标准范围内' : '老化测试存在指标超出标准范围'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <button className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">关闭</button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ---------- 8. 人员管理 ---------- */
function PersonnelPage() {
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false)
  const [logOpen, setLogOpen] = useState(false)
  const [empDataOpen, setEmpDataOpen] = useState(false)
  const [editEmployeeOpen, setEditEmployeeOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<typeof personnelData[0] | null>(null)

  /* 工段选项列表 */
  const sectionOptions = ['系统管理', '半成品测试', '成品测试', '物料管理', '老化测试', '设备装箱', '电芯派克']

  /* 添加员工 - 工段多选 */
  const [addSections, setAddSections] = useState<string[]>([])
  const [addSectionDropdown, setAddSectionDropdown] = useState(false)

  /* 编辑员工 - 工段多选 */
  const [editSections, setEditSections] = useState<string[]>([])
  const [editSectionDropdown, setEditSectionDropdown] = useState(false)
  const [editName, setEditName] = useState('')
  const [editAccount, setEditAccount] = useState('')
  const [editRole, setEditRole] = useState('operator')
  const [editPhone, setEditPhone] = useState('')
  const [editPermOverrides, setEditPermOverrides] = useState<Record<string, boolean>>({})

  /* 权限标签配置 - 可编辑状态 */
  const [permConfig, setPermConfig] = useState<Record<string, { label: string; permissions: { key: string; label: string; allowed: boolean }[] }>>(JSON.parse(JSON.stringify(ROLE_PERMISSIONS)))

  /* 新增标签弹窗 */
  const [addTagOpen, setAddTagOpen] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagPermissions, setNewTagPermissions] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    ALL_PERMISSIONS.forEach(p => { init[p.key] = false })
    return init
  })

  /* 添加员工时选择的权限标签 */
  const [addRole, setAddRole] = useState('operator')
  /* 添加员工时具体权限的可编辑副本 */
  const [addPermOverrides, setAddPermOverrides] = useState<Record<string, boolean>>({})

  const roleMap: Record<string, { label: string; cls: string }> = {
    admin: { label: '管理员', cls: 'badge-admin' },
    operator: { label: '操作员', cls: 'badge-operator' },
    viewer: { label: '查看者', cls: 'badge-viewer' },
  }

  /* 当选择权限标签时，重置权限覆盖为该标签的默认权限 */
  const handleAddRoleChange = (role: string) => {
    setAddRole(role)
    const defaults: Record<string, boolean> = {}
    permConfig[role]?.permissions.forEach(p => { defaults[p.key] = p.allowed })
    setAddPermOverrides(defaults)
  }

  /* 初始化添加员工权限 */
  const openAddEmployee = () => {
    setAddRole('operator')
    setAddSections([])
    setAddSectionDropdown(false)
    const defaults: Record<string, boolean> = {}
    permConfig['operator']?.permissions.forEach(p => { defaults[p.key] = p.allowed })
    setAddPermOverrides(defaults)
    setAddEmployeeOpen(true)
  }

  /* 初始化编辑员工 */
  const openEditEmployee = (emp: typeof personnelData[0]) => {
    setSelectedEmployee(emp)
    setEditName(emp.name)
    setEditAccount(emp.account)
    setEditRole(emp.role)
    setEditPhone(emp.phone)
    setEditSections([...emp.section])
    setEditSectionDropdown(false)
    const defaults: Record<string, boolean> = {}
    permConfig[emp.role]?.permissions.forEach(p => { defaults[p.key] = p.allowed })
    setEditPermOverrides(defaults)
    setEditEmployeeOpen(true)
  }

  /* 权限配置 - 切换某个角色某个模块的权限 */
  const togglePermConfig = (roleKey: string, permKey: string) => {
    setPermConfig(prev => {
      const updated = JSON.parse(JSON.stringify(prev))
      const perm = updated[roleKey]?.permissions.find((p: { key: string }) => p.key === permKey)
      if (perm) perm.allowed = !perm.allowed
      return updated
    })
  }

  /* 添加员工 - 切换某个权限 */
  const toggleAddPerm = (permKey: string) => {
    setAddPermOverrides(prev => ({ ...prev, [permKey]: !prev[permKey] }))
  }

  /* 编辑员工 - 切换某个权限 */
  const toggleEditPerm = (permKey: string) => {
    setEditPermOverrides(prev => ({ ...prev, [permKey]: !prev[permKey] }))
  }

  /* 编辑员工 - 切换权限标签 */
  const handleEditRoleChange = (role: string) => {
    setEditRole(role)
    const defaults: Record<string, boolean> = {}
    permConfig[role]?.permissions.forEach(p => { defaults[p.key] = p.allowed })
    setEditPermOverrides(defaults)
  }

  /* 工段多选 - 添加 */
  const toggleSection = (section: string, mode: 'add' | 'edit') => {
    if (mode === 'add') {
      setAddSections(prev =>
        prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
      )
    } else {
      setEditSections(prev =>
        prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
      )
    }
  }

  /* 移除已选工段标签 */
  const removeSection = (section: string, mode: 'add' | 'edit') => {
    if (mode === 'add') {
      setAddSections(prev => prev.filter(s => s !== section))
    } else {
      setEditSections(prev => prev.filter(s => s !== section))
    }
  }

  /* 新增标签 - 切换权限勾选 */
  const toggleNewTagPerm = (permKey: string) => {
    setNewTagPermissions(prev => ({ ...prev, [permKey]: !prev[permKey] }))
  }

  /* 新增标签 - 确认添加 */
  const confirmAddTag = () => {
    if (!newTagName.trim()) return
    const tagKey = 'tag_' + Date.now()
    const permissions = ALL_PERMISSIONS.map(p => ({
      key: p.key,
      label: p.label,
      allowed: newTagPermissions[p.key] ?? false,
    }))
    setPermConfig(prev => ({
      ...prev,
      [tagKey]: { label: newTagName.trim(), permissions },
    }))
    setAddTagOpen(false)
    setNewTagName('')
    const init: Record<string, boolean> = {}
    ALL_PERMISSIONS.forEach(p => { init[p.key] = false })
    setNewTagPermissions(init)
  }

  /* 新增标签 - 打开弹窗 */
  const openAddTag = () => {
    setNewTagName('')
    const init: Record<string, boolean> = {}
    ALL_PERMISSIONS.forEach(p => { init[p.key] = false })
    setNewTagPermissions(init)
    setAddTagOpen(true)
  }

  return (
    <div className="space-y-5">
      <SectionCard title="人员管理列表" icon={<Users className="w-5 h-5 text-cyan-600" />}
        action={
          <button onClick={openAddEmployee} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-700 transition-colors shadow-sm">
            <UserPlus className="w-4 h-4" /> 添加员工
          </button>
        }
      >
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="data-table">
            <thead><tr><th>员工姓名</th><th>账号</th><th>权限</th><th>工段</th><th>手机号</th><th>账号状态</th><th>操作</th></tr></thead>
            <tbody>
              {personnelData.map((p) => (
                <tr key={p.id}>
                  <td className="font-semibold text-slate-700">{p.name}</td>
                  <td className="font-mono text-xs text-slate-600">{p.account}</td>
                  <td><span className={roleMap[p.role].cls}>{roleMap[p.role].label}</span></td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {p.section.map(s => (
                        <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 font-medium border border-cyan-100">{s}</span>
                      ))}
                    </div>
                  </td>
                  <td className="text-slate-600">{p.phone}</td>
                  <td><span className={p.status === '正常' ? 'badge-pass' : 'badge-disabled'}>{p.status}</span></td>
                  <td>
                    <div className="flex items-center gap-3">
                      <button onClick={() => openEditEmployee(p)} className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs font-medium"><Pencil className="w-3.5 h-3.5" />资料修改</button>
                      <button className="flex items-center gap-1 text-rose-600 hover:text-rose-700 text-xs font-medium"><Trash2 className="w-3.5 h-3.5" />删除</button>
                      <button className="flex items-center gap-1 text-amber-600 hover:text-amber-700 text-xs font-medium"><UserX className="w-3.5 h-3.5" />禁用</button>
                      <button onClick={() => { setSelectedEmployee(p); setLogOpen(true) }} className="flex items-center gap-1 text-cyan-600 hover:text-cyan-700 text-xs font-medium"><History className="w-3.5 h-3.5" />操作日志</button>
                      <button onClick={() => { setSelectedEmployee(p); setEmpDataOpen(true) }} className="flex items-center gap-1 text-violet-600 hover:text-violet-700 text-xs font-medium"><Eye className="w-3.5 h-3.5" />数据查看</button>
                      <button className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-xs font-medium"><Cog className="w-3.5 h-3.5" />权限详情</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* 权限标签配置 - 独立区域 */}
      <SectionCard title="权限标签配置" icon={<Cog className="w-5 h-5 text-emerald-600" />}
        action={
          <div className="flex items-center gap-2">
            <button onClick={openAddTag} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-700 transition-colors shadow-sm">
              <Plus className="w-4 h-4" /> 新增标签
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm">
              <Save className="w-4 h-4" /> 保存配置
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {Object.entries(permConfig).map(([roleKey, role]) => {
            const isCustom = roleKey.startsWith('tag_')
            const colorMap: Record<string, { bg: string; iconBg: string; icon: string; text: string }> = {
              admin: { bg: '', iconBg: 'bg-rose-50', icon: 'text-rose-600', text: 'text-rose-700' },
              operator: { bg: '', iconBg: 'bg-cyan-50', icon: 'text-cyan-600', text: 'text-cyan-700' },
              viewer: { bg: '', iconBg: 'bg-amber-50', icon: 'text-amber-600', text: 'text-amber-700' },
            }
            const color = isCustom
              ? { bg: '', iconBg: 'bg-violet-50', icon: 'text-violet-600', text: 'text-violet-700' }
              : colorMap[roleKey] ?? { bg: '', iconBg: 'bg-slate-50', icon: 'text-slate-600', text: 'text-slate-700' }
            return (
            <div key={roleKey} className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color.iconBg}`}>
                    <Cog className={`w-4 h-4 ${color.icon}`} />
                  </div>
                  <div>
                    <span className={`text-sm font-bold ${color.text}`}>{role.label}</span>
                    <span className="text-[10px] text-slate-400 ml-2">已开启 {role.permissions.filter(p => p.allowed).length} / {role.permissions.length} 项权限</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400">点击权限项可切换开启/关闭</span>
                </div>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2 p-4">
                {role.permissions.map(perm => (
                  <button key={perm.key} onClick={() => togglePermConfig(roleKey, perm.key)}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all text-left ${perm.allowed ? 'bg-emerald-50 border-emerald-200 hover:border-emerald-300' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                    {perm.allowed
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      : <XCircle className="w-4 h-4 text-slate-300 flex-shrink-0" />}
                    <span className={`text-xs font-medium ${perm.allowed ? 'text-emerald-700' : 'text-slate-400'}`}>{perm.label}</span>
                  </button>
                ))}
              </div>
            </div>
            )
          })}
        </div>
      </SectionCard>

      {/* 新增标签弹窗 */}
      <Dialog open={addTagOpen} onOpenChange={setAddTagOpen}>
        <DialogContent className="sm:max-w-[520px] bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800">
              <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center">
                <Plus className="w-4 h-4 text-cyan-600" />
              </div>
              新增权限标签
            </DialogTitle>
            <DialogDescription className="text-slate-500">输入标签名称并勾选需要配置的权限模块</DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            {/* 标签名称 */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">标签名称 <span className="text-rose-500">*</span></label>
              <input
                type="text"
                value={newTagName}
                onChange={e => setNewTagName(e.target.value)}
                placeholder="请输入标签名称，如：质检员"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all"
              />
            </div>
            {/* 权限勾选 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">配置权限</label>
                <span className="text-[10px] text-slate-400">已勾选 {Object.values(newTagPermissions).filter(Boolean).length} / {ALL_PERMISSIONS.length} 项权限</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {ALL_PERMISSIONS.map(perm => (
                  <button
                    key={perm.key}
                    onClick={() => toggleNewTagPerm(perm.key)}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all text-left ${newTagPermissions[perm.key] ? 'bg-cyan-50 border-cyan-200 hover:border-cyan-300' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                  >
                    {newTagPermissions[perm.key]
                      ? <CheckCircle2 className="w-4 h-4 text-cyan-500 flex-shrink-0" />
                      : <XCircle className="w-4 h-4 text-slate-300 flex-shrink-0" />}
                    <span className={`text-xs font-medium ${newTagPermissions[perm.key] ? 'text-cyan-700' : 'text-slate-400'}`}>{perm.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <button className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">取消</button>
            </DialogClose>
            <button
              onClick={confirmAddTag}
              disabled={!newTagName.trim()}
              className={`px-5 py-2 rounded-lg text-sm font-medium text-white transition-colors shadow-sm ${newTagName.trim() ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-slate-300 cursor-not-allowed'}`}
            >
              确认添加
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 添加员工弹窗 */}
      <Dialog open={addEmployeeOpen} onOpenChange={setAddEmployeeOpen}>
        <DialogContent className="sm:max-w-[620px] bg-white max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800">
              <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-cyan-600" />
              </div>
              添加员工
            </DialogTitle>
            <DialogDescription className="text-slate-500">请填写新员工信息，选择权限标签后可自定义调整具体权限</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">员工姓名 <span className="text-rose-500">*</span></label>
              <input type="text" placeholder="请输入姓名" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">账号 <span className="text-rose-500">*</span></label>
              <input type="text" placeholder="请输入账号" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">权限标签 <span className="text-rose-500">*</span></label>
              <select value={addRole} onChange={e => handleAddRoleChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all bg-white">
                <option value="operator">操作员</option>
                <option value="viewer">查看者</option>
                <option value="admin">管理员</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">工段 <span className="text-rose-500">*</span></label>
              <div className="relative">
                <div className="w-full min-h-[38px] px-3 py-2 border border-slate-200 rounded-lg text-sm flex flex-wrap gap-1.5 items-center cursor-pointer hover:border-cyan-400 transition-all" onClick={() => setAddSectionDropdown(!addSectionDropdown)}>
                  {addSections.length === 0 && <span className="text-slate-400">请选择工段</span>}
                  {addSections.map(s => (
                    <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 text-xs font-medium border border-cyan-100">
                      {s}
                      <span onClick={e => { e.stopPropagation(); removeSection(s, 'add') }} className="cursor-pointer hover:text-rose-500 transition-colors"><X className="w-3 h-3" /></span>
                    </span>
                  ))}
                  <ChevronDown className={`w-4 h-4 text-slate-400 ml-auto transition-transform ${addSectionDropdown ? 'rotate-180' : ''}`} />
                </div>
                {addSectionDropdown && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 max-h-48 overflow-y-auto">
                    {sectionOptions.map(opt => (
                      <div key={opt} onClick={() => toggleSection(opt, 'add')}
                        className={`px-3 py-2 text-sm cursor-pointer flex items-center gap-2 transition-colors ${addSections.includes(opt) ? 'bg-cyan-50 text-cyan-700' : 'text-slate-700 hover:bg-slate-50'}`}>
                        <span className={`w-4 h-4 rounded border flex items-center justify-center ${addSections.includes(opt) ? 'bg-cyan-600 border-cyan-600' : 'border-slate-300'}`}>
                          {addSections.includes(opt) && <CheckCircle2 className="w-3 h-3 text-white" />}
                        </span>
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2 col-span-2">
              <label className="text-xs font-semibold text-slate-700">手机号 <span className="text-rose-500">*</span></label>
              <input type="tel" placeholder="请输入手机号" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all" />
            </div>
          </div>

          {/* 权限标签对应的详细权限 - 可修改 */}
          <div className="mt-2 p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Cog className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-700">权限详情</span>
              </div>
              <span className="text-[10px] text-slate-400">基于「{permConfig[addRole]?.label}」标签，可自定义修改</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {permConfig[addRole]?.permissions.map(perm => {
                const isAllowed = addPermOverrides[perm.key] ?? perm.allowed
                const isModified = addPermOverrides[perm.key] !== undefined && addPermOverrides[perm.key] !== perm.allowed
                return (
                  <label key={perm.key} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${isAllowed ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'} ${isModified ? 'ring-1 ring-amber-300' : ''}`}>
                    <input type="checkbox" checked={isAllowed} onChange={() => toggleAddPerm(perm.key)}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                    <span className={`text-xs font-medium ${isAllowed ? 'text-emerald-700' : 'text-slate-400'}`}>{perm.label}</span>
                    {isModified && <span className="text-[9px] text-amber-600 font-bold ml-auto">已修改</span>}
                  </label>
                )
              })}
            </div>
          </div>

          <DialogFooter className="gap-2 mt-4">
            <DialogClose asChild>
              <button className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">取消</button>
            </DialogClose>
            <button onClick={() => setAddEmployeeOpen(false)} className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-700 transition-colors shadow-sm">
              <Save className="w-4 h-4" /> 确认添加
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 资料修改弹窗 */}
      <Dialog open={editEmployeeOpen} onOpenChange={setEditEmployeeOpen}>
        <DialogContent className="sm:max-w-[620px] bg-white max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Pencil className="w-4 h-4 text-blue-600" />
              </div>
              资料修改 - {selectedEmployee?.name}
            </DialogTitle>
            <DialogDescription className="text-slate-500">修改员工信息，调整权限标签后可自定义调整具体权限</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">员工姓名 <span className="text-rose-500">*</span></label>
              <input type="text" value={editName} onChange={e => setEditName(e.target.value)} placeholder="请输入姓名" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">账号 <span className="text-rose-500">*</span></label>
              <input type="text" value={editAccount} onChange={e => setEditAccount(e.target.value)} placeholder="请输入账号" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">权限标签 <span className="text-rose-500">*</span></label>
              <select value={editRole} onChange={e => handleEditRoleChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-white">
                <option value="operator">操作员</option>
                <option value="viewer">查看者</option>
                <option value="admin">管理员</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">工段 <span className="text-rose-500">*</span></label>
              <div className="relative">
                <div className="w-full min-h-[38px] px-3 py-2 border border-slate-200 rounded-lg text-sm flex flex-wrap gap-1.5 items-center cursor-pointer hover:border-blue-400 transition-all" onClick={() => setEditSectionDropdown(!editSectionDropdown)}>
                  {editSections.length === 0 && <span className="text-slate-400">请选择工段</span>}
                  {editSections.map(s => (
                    <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                      {s}
                      <span onClick={e => { e.stopPropagation(); removeSection(s, 'edit') }} className="cursor-pointer hover:text-rose-500 transition-colors"><X className="w-3 h-3" /></span>
                    </span>
                  ))}
                  <ChevronDown className={`w-4 h-4 text-slate-400 ml-auto transition-transform ${editSectionDropdown ? 'rotate-180' : ''}`} />
                </div>
                {editSectionDropdown && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 max-h-48 overflow-y-auto">
                    {sectionOptions.map(opt => (
                      <div key={opt} onClick={() => toggleSection(opt, 'edit')}
                        className={`px-3 py-2 text-sm cursor-pointer flex items-center gap-2 transition-colors ${editSections.includes(opt) ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}>
                        <span className={`w-4 h-4 rounded border flex items-center justify-center ${editSections.includes(opt) ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                          {editSections.includes(opt) && <CheckCircle2 className="w-3 h-3 text-white" />}
                        </span>
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2 col-span-2">
              <label className="text-xs font-semibold text-slate-700">手机号 <span className="text-rose-500">*</span></label>
              <input type="tel" value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="请输入手机号" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
            </div>
          </div>

          {/* 权限标签对应的详细权限 - 可修改 */}
          <div className="mt-2 p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Cog className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-700">权限详情</span>
              </div>
              <span className="text-[10px] text-slate-400">基于「{permConfig[editRole]?.label}」标签，可自定义修改</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {permConfig[editRole]?.permissions.map(perm => {
                const isAllowed = editPermOverrides[perm.key] ?? perm.allowed
                const isModified = editPermOverrides[perm.key] !== undefined && editPermOverrides[perm.key] !== perm.allowed
                return (
                  <label key={perm.key} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${isAllowed ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'} ${isModified ? 'ring-1 ring-amber-300' : ''}`}>
                    <input type="checkbox" checked={isAllowed} onChange={() => toggleEditPerm(perm.key)}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                    <span className={`text-xs font-medium ${isAllowed ? 'text-emerald-700' : 'text-slate-400'}`}>{perm.label}</span>
                    {isModified && <span className="text-[9px] text-amber-600 font-bold ml-auto">已修改</span>}
                  </label>
                )
              })}
            </div>
          </div>

          <DialogFooter className="gap-2 mt-4">
            <DialogClose asChild>
              <button className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">取消</button>
            </DialogClose>
            <button onClick={() => setEditEmployeeOpen(false)} className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
              <Save className="w-4 h-4" /> 确认修改
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 操作日志弹窗 */}
      <Dialog open={logOpen} onOpenChange={setLogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800">
              <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                <History className="w-4 h-4 text-violet-600" />
              </div>
              操作日志 - {selectedEmployee?.name}
            </DialogTitle>
            <DialogDescription className="text-slate-500">该员工的系统操作记录</DialogDescription>
          </DialogHeader>
          {selectedEmployee && (
            <div className="py-4">
              {operationLogData[selectedEmployee.id]?.length ? (
                <div className="space-y-3">
                  {operationLogData[selectedEmployee.id].map((log, i) => (
                    <div key={i} className="flex gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                        <History className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-700">{log.action}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{log.time}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">{log.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 text-sm">暂无操作记录</div>
              )}
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <button className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">关闭</button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 员工数据查看弹窗 */}
      <Dialog open={empDataOpen} onOpenChange={setEmpDataOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800">
              <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                <Eye className="w-4 h-4 text-violet-600" />
              </div>
              数据查看 - {selectedEmployee?.name}
            </DialogTitle>
            <DialogDescription className="text-slate-500">该员工的工段数据概览</DialogDescription>
          </DialogHeader>
          {selectedEmployee && EMPLOYEE_STATS[selectedEmployee.id] && (
            <div className="py-4 space-y-4">
              {/* 工段信息 */}
              <div className="flex items-center gap-3 p-3 bg-cyan-50 rounded-lg border border-cyan-100">
                <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center">
                  <Fingerprint className="w-4 h-4 text-cyan-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-700">{selectedEmployee.name}</div>
                  <div className="text-xs text-slate-500">工段: <span className="text-cyan-700 font-medium">{EMPLOYEE_STATS[selectedEmployee.id].section.join('、')}</span> · 最近登录: {EMPLOYEE_STATS[selectedEmployee.id].lastLogin}</div>
                </div>
              </div>
              {/* 工段专属数据 */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-2"><div className="w-1 h-4 rounded-full bg-cyan-500" />工段数据</h4>
                <div className="grid grid-cols-2 gap-3">
                  {EMPLOYEE_STATS[selectedEmployee.id].sectionData.map((d, i) => (
                    <div key={i} className="p-3 bg-white rounded-lg border border-slate-100">
                      <div className="text-xs text-slate-500 mb-1">{d.label}</div>
                      <div className="text-lg font-bold" style={{ color: d.color }}>{d.value}<span className="text-xs font-normal text-slate-400 ml-0.5">{d.unit}</span></div>
                    </div>
                  ))}
                </div>
              </div>
              {/* 通用统计 */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-2"><div className="w-1 h-4 rounded-full bg-emerald-500" />通用统计</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-white rounded-lg border border-slate-100">
                    <div className="text-lg font-bold text-cyan-600">{EMPLOYEE_STATS[selectedEmployee.id].operations}</div>
                    <div className="text-[10px] text-slate-500">操作次数</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border border-slate-100">
                    <div className="text-lg font-bold text-emerald-600">{EMPLOYEE_STATS[selectedEmployee.id].reviews}</div>
                    <div className="text-[10px] text-slate-500">审核次数</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border border-slate-100">
                    <div className="text-lg font-bold text-violet-600">{EMPLOYEE_STATS[selectedEmployee.id].dataEntries}</div>
                    <div className="text-[10px] text-slate-500">数据录入</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <button className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">关闭</button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


/* ---------- 9. 标签打印 ---------- */

/* 标签打印 - OID条码数据 */
const oidLabelData = [
  { id: 'OID-CN-2026-8839201901', sn: 'SN8839201901', barcode: '6901234567890', oidCode: '2.49.800.810001.2026.8839201901', productName: 'PB-10000mAh-A', spec: 'NP-100A', batch: 'BOX-20231024-001', date: '2026-05-10 09:15', workOrder: 'WO-2026-0501', status: '已打印' as const },
  { id: 'OID-CN-2026-8839201902', sn: 'SN8839201902', barcode: '6901234567891', oidCode: '2.49.800.810001.2026.8839201902', productName: 'PB-10000mAh-A', spec: 'NP-100A', batch: 'BOX-20231024-001', date: '2026-05-10 09:16', workOrder: 'WO-2026-0501', status: '已打印' as const },
  { id: 'OID-CN-2026-8839201903', sn: 'SN8839201903', barcode: '6901234567892', oidCode: '2.49.800.810001.2026.8839201903', productName: 'PB-10000mAh-A', spec: 'NP-100A', batch: 'BOX-20231024-001', date: '', workOrder: 'WO-2026-0501', status: '待打印' as const },
  { id: 'OID-CN-2026-8839201904', sn: 'SN8839201904', barcode: '6901234567893', oidCode: '2.49.800.810001.2026.8839201904', productName: 'PB-10000mAh-A', spec: 'NP-100A', batch: 'BOX-20231024-002', date: '2026-05-11 14:20', workOrder: 'WO-2026-0501', status: '已打印' as const },
  { id: 'OID-CN-2026-8839201905', sn: 'SN8839201905', barcode: '6901234567894', oidCode: '2.49.800.810001.2026.8839201905', productName: 'PB-10000mAh-A', spec: 'NP-100A', batch: 'BOX-20231024-002', date: '2026-05-11 14:21', workOrder: 'WO-2026-0502', status: '已打印' as const },
  { id: 'OID-CN-2026-8839201906', sn: 'SN8839201906', barcode: '6901234567895', oidCode: '2.49.800.810001.2026.8839201906', productName: 'PB-20000mAh-B', spec: 'NP-200B', batch: 'BOX-20231024-002', date: '', workOrder: 'WO-2026-0502', status: '待打印' as const },
  { id: 'OID-CN-2026-8839201907', sn: 'SN8839201907', barcode: '6901234567896', oidCode: '2.49.800.810001.2026.8839201907', productName: 'PB-20000mAh-B', spec: 'NP-200B', batch: 'BOX-20231024-003', date: '', workOrder: 'WO-2026-0502', status: '待打印' as const },
  { id: 'OID-CN-2026-8839201908', sn: 'SN8839201908', barcode: '6901234567897', oidCode: '2.49.800.810001.2026.8839201908', productName: 'PB-20000mAh-B', spec: 'NP-200B', batch: 'BOX-20231024-003', date: '', workOrder: 'WO-2026-0504', status: '待打印' as const },
  { id: 'OID-CN-2026-8839201909', sn: 'SN8839201909', barcode: '6901234567898', oidCode: '2.49.800.810001.2026.8839201909', productName: 'PB-10000mAh-A', spec: 'NP-100A', batch: 'BOX-20231024-003', date: '', workOrder: 'WO-2026-0504', status: '待打印' as const },
]

/* 标签打印 - 外箱编码数据 */
const boxLabelData = [
  { id: 'BOX-CN-2026-6001', boxCode: 'BOX6901234567901', productName: 'PB-10000mAh-A', spec: 'NP-100A', batch: 'BOX-20231024-001', date: '2026-05-10 10:00', workOrder: 'WO-2026-0501', qty: 50, cert3c: '202001090729XXXX', status: '已打印' as const },
  { id: 'BOX-CN-2026-6002', boxCode: 'BOX6901234567902', productName: 'PB-10000mAh-A', spec: 'NP-100A', batch: 'BOX-20231024-002', date: '2026-05-11 15:00', workOrder: 'WO-2026-0501', qty: 50, cert3c: '202001090729XXXY', status: '已打印' as const },
  { id: 'BOX-CN-2026-6003', boxCode: 'BOX6901234567903', productName: 'PB-20000mAh-B', spec: 'NP-200B', batch: 'BOX-20231024-002', date: '', workOrder: 'WO-2026-0502', qty: 50, cert3c: '202001090729XXXX', status: '待打印' as const },
  { id: 'BOX-CN-2026-6004', boxCode: 'BOX6901234567904', productName: 'PB-20000mAh-B', spec: 'NP-200B', batch: 'BOX-20231024-003', date: '', workOrder: 'WO-2026-0504', qty: 50, cert3c: '202001090729XXXY', status: '待打印' as const },
]

/* 标签打印 - 模拟条形码SVG组件 */
function SimulatedBarcode({ value, width = 180, height = 50 }: { value: string; width?: number; height?: number }) {
  const barHeight = height - 16 // 条纹高度留出底部数字空间
  const textY = height - 2 // 数字位置
  const bars: { x: number; w: number }[] = []
  let x = 0
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i)
    const pattern = code.toString(2).padStart(8, '0')
    for (let j = 0; j < pattern.length; j++) {
      if (pattern[j] === '1') {
        bars.push({ x, w: 1.5 })
        x += 2.5
      } else {
        x += 1.2
      }
    }
    if (i % 3 === 2) x += 2
  }
  const totalWidth = x
  return (
    <svg width={width} height={height} viewBox={`0 0 ${totalWidth} ${height}`} className="mx-auto">
      {bars.map((b, i) => (
        <rect key={i} x={b.x} y={2} width={b.w} height={barHeight} fill="#1e293b" />
      ))}
      <text x={totalWidth / 2} y={textY} textAnchor="middle" className="font-mono" fontSize={8} fill="#64748b">{value}</text>
    </svg>
  )
}

/* 标签打印 - 高质量静态二维码SVG组件（标准QR Code样式，25x25模块，纯黑尖角） */
function SimulatedQRCode({ size = 64 }: { size?: number }) {
  const cells = 25
  const quietZone = 2 // 静区宽度
  const totalCells = cells + quietZone * 2
  const totalSize = size
  const actualCellSize = totalSize / totalCells

  // 确定性伪随机函数
  const pseudoRandom = (r: number, c: number) => {
    const hash = ((r * 37 + c * 13 + 11) * 2654435761) >>> 0
    return (hash % 100) > 42
  }

  // 生成25x25二维码矩阵
  const matrix: boolean[][] = []
  for (let r = 0; r < cells; r++) {
    matrix[r] = []
    for (let c = 0; c < cells; c++) {
      // 三个7x7定位图案（Finder Patterns）
      const inTL = r < 7 && c < 7
      const inTR = r < 7 && c >= cells - 7
      const inBL = r >= cells - 7 && c < 7

      if (inTL || inTR || inBL) {
        const lr = inTL ? r : inTR ? r : r - (cells - 7)
        const lc = inTL ? c : inTR ? c - (cells - 7) : c
        const isOuterBorder = lr === 0 || lr === 6 || lc === 0 || lc === 6
        const isInnerBlock = lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4
        matrix[r][c] = isOuterBorder || isInnerBlock
      }
      // 分隔带（Separator）- 定位图案周围1格白色
      else if (
        (r === 7 && c <= 7) || (r <= 7 && c === 7) ||
        (r === 7 && c >= cells - 8) || (r <= 7 && c === cells - 8) ||
        (r === cells - 8 && c <= 7) || (r >= cells - 8 && c === 7)
      ) {
        matrix[r][c] = false
      }
      // 时序图案（Timing Patterns）
      else if (r === 6 && c > 7 && c < cells - 8) {
        matrix[r][c] = c % 2 === 0
      } else if (c === 6 && r > 7 && r < cells - 8) {
        matrix[r][c] = r % 2 === 0
      }
      // 对齐图案（Alignment Pattern）- 中心在(18,18)
      else if (r >= 16 && r <= 20 && c >= 16 && c <= 20) {
        const ar = r - 16
        const ac = c - 16
        const isOuter = ar === 0 || ar === 4 || ac === 0 || ac === 4
        const isCenter = ar === 2 && ac === 2
        matrix[r][c] = isOuter || isCenter
      }
      // 数据区域
      else {
        matrix[r][c] = pseudoRandom(r, c)
      }
    }
  }

  return (
    <svg width={totalSize} height={totalSize} viewBox={`0 0 ${totalSize} ${totalSize}`} className="mx-auto" style={{ imageRendering: 'pixelated' }}>
      <rect width={totalSize} height={totalSize} fill="white" />
      {matrix.map((row, r) => row.map((cell, c) => cell ? (
        <rect key={`${r}-${c}`} x={(c + quietZone) * actualCellSize} y={(r + quietZone) * actualCellSize} width={actualCellSize} height={actualCellSize} fill="#000000" />
      ) : null))}
    </svg>
  )
}

function LabelPrintPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'printed' | 'pending'>('all')
  const [printPreviewOpen, setPrintPreviewOpen] = useState(false)
  const [previewItem, setPreviewItem] = useState<typeof oidLabelData[0] | typeof boxLabelData[0] | null>(null)
  const [exportOpen, setExportOpen] = useState(false)
  const [exportStart, setExportStart] = useState(1)
  const [exportEnd, setExportEnd] = useState(9)
  const [generateBoxOpen, setGenerateBoxOpen] = useState(false)
  const [labelType, setLabelType] = useState<'oid' | 'box'>('oid')
  const [exportType, setExportType] = useState<'oid' | 'box'>('oid')

  // 根据标签类型切换数据
  const currentData = labelType === 'oid' ? oidLabelData : boxLabelData
  const printed = currentData.filter(d => d.status === '已打印').length
  const pending = currentData.filter(d => d.status === '待打印').length

  const filteredData = currentData.filter((d) => {
    const matchSearch = searchTerm === '' ||
      d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ('sn' in d && d.sn?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      ('oidCode' in d && d.oidCode?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      ('boxCode' in d && d.boxCode?.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchStatus = filterStatus === 'all' ||
      (filterStatus === 'printed' && d.status === '已打印') ||
      (filterStatus === 'pending' && d.status === '待打印')
    return matchSearch && matchStatus
  })

  // 导出相关 - 根据选择的标签类型计算
  const exportData = exportType === 'oid' ? oidLabelData : boxLabelData
  const exportCount = Math.max(0, Math.min(exportEnd, exportData.length) - Math.max(exportStart, 1) + 1)
  const exportMaxSeq = exportData.length

  // 色值 - 与HTML标签打印页面保持一致
  const primary = '#0891b2'
  const primaryHover = '#0e7490'
  const greenColor = '#059669'
  const orangeColor = '#d97706'
  const textDark = '#1e293b'
  const textGray = '#475569'
  const textLight = '#94a3b8'
  const borderColor = '#e2e8f0'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {/* ① OID平台说明 - 与HTML label-oid-info完全一致 */}
      <div className="label-oid-info">
        <div className="label-oid-icon">
          <Fingerprint style={{ width: '20px', height: '20px', color: '#0891b2' }} />
        </div>
        <div className="label-oid-text">
          <h4>国家OID平台唯一标识码</h4>
          <p>所有条形码与二维码均从国家OID（Object Identifier）平台获取，确保每个充电宝产品的唯一溯源标识。标识码将印刷于产品外壳用于全生命周期追溯。</p>
        </div>
      </div>

      {/* ② 搜索与筛选区域 - 增加OID/外箱切换和生成外箱编码按钮 */}
      <div className="label-search-row">
        <div className="label-search-box">
          <Search className="search-icon" style={{ width: '13px', height: '13px' }} />
          <input
            type="text"
            placeholder={labelType === 'oid' ? '搜索序列号、产品型号、OID码...' : '搜索箱号、产品型号、外箱编码...'}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        {/* OID编码 / 外箱编码 切换 */}
        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '6px', padding: '2px', border: `1px solid ${borderColor}` }}>
          <button
            className={`label-filter-btn ${labelType === 'oid' ? 'active' : ''}`}
            onClick={() => { setLabelType('oid'); setFilterStatus('all'); setSearchTerm('') }}
            style={labelType === 'oid' ? {} : { background: 'transparent', color: textGray, border: 'none', boxShadow: 'none' }}
          >
            <QrCode style={{ width: '11px', height: '11px' }} /> OID编码
          </button>
          <button
            className={`label-filter-btn ${labelType === 'box' ? 'active' : ''}`}
            onClick={() => { setLabelType('box'); setFilterStatus('all'); setSearchTerm('') }}
            style={labelType === 'box' ? {} : { background: 'transparent', color: textGray, border: 'none', boxShadow: 'none' }}
          >
            <Box style={{ width: '11px', height: '11px' }} /> 外箱编码
          </button>
        </div>
        <button
          className={`label-filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
          onClick={() => setFilterStatus('all')}
        >
          <Grid3X3 style={{ width: '11px', height: '11px' }} /> 全部
        </button>
        <button
          className={`label-filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
          onClick={() => setFilterStatus('pending')}
        >
          <Clock style={{ width: '11px', height: '11px' }} /> 待打印 ({pending})
        </button>
        <button
          className={`label-filter-btn ${filterStatus === 'printed' ? 'active' : ''}`}
          onClick={() => setFilterStatus('printed')}
        >
          <CheckCircle style={{ width: '11px', height: '11px' }} /> 已打印 ({printed})
        </button>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          {labelType === 'box' && (
            <button className="label-batch-btn label-batch-btn-outline" onClick={() => setGenerateBoxOpen(true)} style={{ borderColor: orangeColor, color: orangeColor }}>
              <Plus style={{ width: '12px', height: '12px' }} /> 生成外箱编码
            </button>
          )}
          <button className="label-batch-btn label-batch-btn-primary">
            <Printer style={{ width: '12px', height: '12px' }} /> 批量打印待打印标签
          </button>
          <button className="label-batch-btn label-batch-btn-outline" onClick={() => { setExportType(labelType); setExportStart(1); setExportEnd((labelType === 'oid' ? oidLabelData : boxLabelData).length); setExportOpen(true) }}>
            <FileSpreadsheet style={{ width: '12px', height: '12px' }} /> 导出
          </button>
          <button className="label-batch-btn label-batch-btn-outline">
            <Database style={{ width: '12px', height: '12px' }} /> 从OID平台同步
          </button>
        </div>
      </div>

      {/* ③ 统计卡片 - 与HTML stat-grid c3完全一致 */}
      <div className="label-stat-grid">
        <div className="label-stat-card">
          <div className="label-stat-icon" style={{ background: 'rgba(8,145,178,.08)', color: '#0891b2' }}>
            <QrCode style={{ width: '22px', height: '22px' }} />
          </div>
          <div>
            <div className="label-stat-value" style={{ color: '#0891b2' }}>{currentData.length}<span className="label-stat-value-unit">个</span></div>
            <div className="label-stat-label">{labelType === 'oid' ? 'OID标签总数' : '外箱标签总数'}</div>
          </div>
        </div>
        <div className="label-stat-card">
          <div className="label-stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
            <CheckCircle2 style={{ width: '22px', height: '22px' }} />
          </div>
          <div>
            <div className="label-stat-value" style={{ color: '#059669' }}>{printed}<span className="label-stat-value-unit">个</span></div>
            <div className="label-stat-label">已打印</div>
          </div>
        </div>
        <div className="label-stat-card">
          <div className="label-stat-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
            <Clock style={{ width: '22px', height: '22px' }} />
          </div>
          <div>
            <div className="label-stat-value" style={{ color: '#d97706' }}>{pending}<span className="label-stat-value-unit">个</span></div>
            <div className="label-stat-label">待打印</div>
          </div>
        </div>
      </div>

      {/* ④ 标签卡片区域 - 增加序号 */}
      <div className="label-grid">
        {filteredData.map((d, idx) => {
          const seqNum = currentData.indexOf(d) + 1 // 序号基于完整数据中的位置
          const isOid = labelType === 'oid'
          const barcodeValue = isOid ? (d as typeof oidLabelData[0]).barcode : (d as typeof boxLabelData[0]).boxCode
          return (
            <div key={d.id} className={`label-card label-animate-in`} style={{ animationDelay: `${(idx % 8) * 0.05 + 0.2}s` }}>
              {/* 序号 - 左上角 */}
              <div style={{ position: 'absolute', top: '12px', left: '12px', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(8,145,178,.08)', color: '#0891b2', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(8,145,178,.15)' }}>
                {seqNum}
              </div>
              {/* 状态徽标 - 绝对定位右上角 */}
              <div className={`label-card-badge ${d.status === '已打印' ? 'printed' : 'pending'}`}>
                {d.status}
              </div>

              {/* SN序列号/箱号 - 居中 */}
              <div className="label-sn">{d.id}</div>

              {/* 条形码 - 居中 */}
              <div className="label-barcode-wrap">
                <SimulatedBarcode value={barcodeValue} width={180} height={55} />
              </div>

              {/* 二维码 - 居中 */}
              <div className="label-qrcode-wrap">
                <SimulatedQRCode size={100} />
              </div>

              {/* 产品信息 - 居中 label-meta风格 */}
              <div className="label-meta">
                <div>产品型号: <span>{d.productName}</span></div>
                <div>规格代码: <span>{d.spec}</span></div>
                {isOid ? (
                  <>
                    <div>OID编码: <span className="oid-code">{(d as typeof oidLabelData[0]).oidCode}</span></div>
                    <div>所属箱号: <span>{d.batch}</span></div>
                  </>
                ) : (
                  <>
                    <div>3C认证: <span>{(d as typeof boxLabelData[0]).cert3c}</span></div>
                    <div>每箱数量: <span>{(d as typeof boxLabelData[0]).qty}个</span></div>
                  </>
                )}
                {d.date && <div>打印时间: <span>{d.date}</span></div>}
              </div>

              {/* 操作按钮 - 居中 */}
              <div className="label-actions">
                <button className="label-btn label-btn-primary">
                  <Printer style={{ width: '11px', height: '11px' }} /> 打印
                </button>
                <button className="label-btn label-btn-outline" onClick={() => { setPreviewItem(d); setPrintPreviewOpen(true) }}>
                  <FileUp style={{ width: '11px', height: '11px' }} /> 下载
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* 标签预览弹窗 */}
      <Dialog open={printPreviewOpen} onOpenChange={setPrintPreviewOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: textDark }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${primary}15` }}>
                <QrCode className="w-4 h-4" style={{ color: primary }} />
              </div>
              标签预览
            </DialogTitle>
            <DialogDescription style={{ color: textLight }}>{labelType === 'oid' ? '国家OID平台唯一标识标签预览' : '外箱编码标签预览'}</DialogDescription>
          </DialogHeader>
          {previewItem && (
            <div className="py-4">
              <div className="border-2 border-slate-100 rounded-xl p-6 bg-white">
                <div className="text-center mb-4">
                  <h4 className="text-lg font-bold" style={{ color: textDark }}>{previewItem.productName}</h4>
                  <p className="text-sm mt-1" style={{ color: textLight }}>规格: {previewItem.spec}</p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <p className="text-xs font-semibold mb-2" style={{ color: textGray }}>条形码 (Barcode)</p>
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                      <SimulatedBarcode value={'barcode' in previewItem ? previewItem.barcode : previewItem.boxCode} width={180} height={58} />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold mb-2" style={{ color: textGray }}>二维码 (QR Code)</p>
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 flex items-center justify-center">
                      <SimulatedQRCode size={80} />
                    </div>
                    <p className="font-mono text-[10px] mt-1 break-all" style={{ color: textLight }}>{previewItem.id}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  {'sn' in previewItem && <div className="flex justify-between"><span style={{ color: textLight }}>SN码:</span><span className="font-mono font-semibold" style={{ color: textDark }}>{previewItem.sn}</span></div>}
                  <div className="flex justify-between"><span style={{ color: textLight }}>条形码:</span><span className="font-mono" style={{ color: textDark }}>{'barcode' in previewItem ? previewItem.barcode : previewItem.boxCode}</span></div>
                  <div className="flex justify-between"><span style={{ color: textLight }}>批次:</span><span className="font-mono" style={{ color: textDark }}>{previewItem.batch}</span></div>
                  <div className="flex justify-between"><span style={{ color: textLight }}>日期:</span><span style={{ color: textDark }}>{previewItem.date || '—'}</span></div>
                  <div className="flex justify-between"><span style={{ color: textLight }}>工单:</span><span className="font-mono" style={{ color: primary }}>{previewItem.workOrder}</span></div>
                  {'oidCode' in previewItem && <div className="flex justify-between col-span-2"><span style={{ color: textLight }}>OID:</span><span className="font-mono text-[10px]" style={{ color: primary }}>{previewItem.oidCode}</span></div>}
                  {'cert3c' in previewItem && <div className="flex justify-between col-span-2"><span style={{ color: textLight }}>3C认证:</span><span className="font-mono text-[10px]" style={{ color: primary }}>{previewItem.cert3c}</span></div>}
                </div>
              </div>
              <p className="text-xs text-center mt-3" style={{ color: textLight }}>标签尺寸: 60mm x 40mm | 此标签将印刷于充电宝外壳</p>
            </div>
          )}
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <button className="px-4 py-2 rounded-lg border text-sm transition-colors" style={{ borderColor, color: textGray }}>关闭</button>
            </DialogClose>
            <button onClick={() => setPrintPreviewOpen(false)}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-white text-sm font-medium transition-colors shadow-sm"
              style={{ background: primary }}
              onMouseEnter={e => { e.currentTarget.style.background = primaryHover }}
              onMouseLeave={e => { e.currentTarget.style.background = primary }}
            >
              <Printer className="w-4 h-4" /> 打印标签
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 导出弹窗 - 增加标签类型选择 */}
      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: textDark }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${primary}15` }}>
                <FileSpreadsheet className="w-4 h-4" style={{ color: primary }} />
              </div>
              导出标签
            </DialogTitle>
            <DialogDescription style={{ color: textLight }}>选择标签类型和序号范围进行导出</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {/* 标签类型选择 */}
            <div className="space-y-2">
              <label className="text-sm font-semibold" style={{ color: textDark }}>标签类型</label>
              <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '3px', border: `1px solid ${borderColor}` }}>
                <button
                  onClick={() => { setExportType('oid'); setExportStart(1); setExportEnd(oidLabelData.length) }}
                  style={{
                    flex: 1, padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                    background: exportType === 'oid' ? primary : 'transparent',
                    color: exportType === 'oid' ? '#fff' : textGray,
                    border: 'none', cursor: 'pointer', transition: 'all .2s',
                    boxShadow: exportType === 'oid' ? '0 2px 6px rgba(8,145,178,.25)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                  }}
                >
                  <QrCode style={{ width: '13px', height: '13px' }} /> OID编码标签
                </button>
                <button
                  onClick={() => { setExportType('box'); setExportStart(1); setExportEnd(boxLabelData.length) }}
                  style={{
                    flex: 1, padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                    background: exportType === 'box' ? orangeColor : 'transparent',
                    color: exportType === 'box' ? '#fff' : textGray,
                    border: 'none', cursor: 'pointer', transition: 'all .2s',
                    boxShadow: exportType === 'box' ? '0 2px 6px rgba(217,119,6,.25)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                  }}
                >
                  <Box style={{ width: '13px', height: '13px' }} /> 外箱编码标签
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold" style={{ color: textDark }}>起始序号</label>
                <input type="number" min={1} max={exportMaxSeq} value={exportStart} onChange={e => setExportStart(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all" style={{ border: `1px solid ${borderColor}` }} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold" style={{ color: textDark }}>结束序号</label>
                <input type="number" min={1} max={exportMaxSeq} value={exportEnd} onChange={e => setExportEnd(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all" style={{ border: `1px solid ${borderColor}` }} />
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: exportType === 'oid' ? '#f0f9ff' : '#fffbeb', border: `1px solid ${exportType === 'oid' ? '#bae6fd' : '#fde68a'}` }}>
              <span className="text-sm" style={{ color: textGray }}>本次导出数量</span>
              <span className="text-2xl font-bold" style={{ color: exportType === 'oid' ? primary : orangeColor }}>{exportCount}<span className="text-xs font-normal ml-1" style={{ color: textLight }}>个</span></span>
            </div>
            <div className="text-xs" style={{ color: textLight }}>
              当前{exportType === 'oid' ? 'OID编码' : '外箱编码'}标签总数: <span className="font-semibold" style={{ color: textGray }}>{exportMaxSeq}</span> 个
            </div>
          </div>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <button className="px-4 py-2 rounded-lg border text-sm transition-colors" style={{ borderColor, color: textGray }}>取消</button>
            </DialogClose>
            <button onClick={() => setExportOpen(false)}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-white text-sm font-medium transition-colors shadow-sm"
              style={{ background: primary }}>
              <FileSpreadsheet className="w-4 h-4" /> 确认导出
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 生成外箱编码弹窗 */}
      <Dialog open={generateBoxOpen} onOpenChange={setGenerateBoxOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: textDark }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${orangeColor}15` }}>
                <Box className="w-4 h-4" style={{ color: orangeColor }} />
              </div>
              生成外箱编码
            </DialogTitle>
            <DialogDescription style={{ color: textLight }}>根据产品批次生成外箱编码标签</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold" style={{ color: textDark }}>关联批次号 <span style={{ color: '#ef4444' }}>*</span></label>
              <select className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all bg-white" style={{ border: `1px solid ${borderColor}` }}>
                <option>BOX-20231024-001</option>
                <option>BOX-20231024-002</option>
                <option>BOX-20231024-003</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold" style={{ color: textDark }}>产品型号 <span style={{ color: '#ef4444' }}>*</span></label>
              <select className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all bg-white" style={{ border: `1px solid ${borderColor}` }}>
                <option>PB-10000mAh-A</option>
                <option>PB-20000mAh-B</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold" style={{ color: textDark }}>每箱数量</label>
                <input type="number" defaultValue={50} className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all" style={{ border: `1px solid ${borderColor}` }} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold" style={{ color: textDark }}>生成箱数</label>
                <input type="number" defaultValue={1} className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all" style={{ border: `1px solid ${borderColor}` }} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold" style={{ color: textDark }}>3C认证编号</label>
              <input type="text" defaultValue="202001090729XXXX" className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all" style={{ border: `1px solid ${borderColor}` }} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: '#fffbeb', border: `1px solid #fde68a` }}>
              <span className="text-sm" style={{ color: textGray }}>预计生成外箱编码</span>
              <span className="text-2xl font-bold" style={{ color: orangeColor }}>1<span className="text-xs font-normal ml-1" style={{ color: textLight }}>个</span></span>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <button className="px-4 py-2 rounded-lg border text-sm transition-colors" style={{ borderColor, color: textGray }}>取消</button>
            </DialogClose>
            <button onClick={() => setGenerateBoxOpen(false)}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-white text-sm font-medium transition-colors shadow-sm"
              style={{ background: orangeColor }}>
              <Box className="w-4 h-4" /> 生成编码
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
/* ---------- 10. 成品组装 ---------- */
function AssemblyPage() {
  const [activeTab, setActiveTab] = useState<'cellPcb' | 'semiShell'>('cellPcb')
  const [searchTerm, setSearchTerm] = useState('')
  const [addAssemblyOpen, setAddAssemblyOpen] = useState(false)
  const filteredCellPcb = cellPcbAssemblyData.filter(d =>
    d.id.includes(searchTerm) || d.cellSn.includes(searchTerm) || d.pcbSn.includes(searchTerm) || d.operator.includes(searchTerm)
  )
  const filteredSemiShell = semiShellAssemblyData.filter(d =>
    d.id.includes(searchTerm) || d.cellSn.includes(searchTerm) || d.pcbSn.includes(searchTerm) || d.shellSn.includes(searchTerm) || d.operator.includes(searchTerm)
  )
  return (
    <div className="space-y-5">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '电芯PCB组装', value: cellPcbAssemblyData.length, unit: '条', color: '#0891b2', bg: 'bg-cyan-50', icon: Wrench },
          { label: '半成品外壳组装', value: semiShellAssemblyData.length, unit: '条', color: '#7c3aed', bg: 'bg-violet-50', icon: Layers },
          { label: '已完成', value: cellPcbAssemblyData.filter(d => d.status === '已组装').length + semiShellAssemblyData.filter(d => d.status === '已组装').length, unit: '条', color: '#059669', bg: 'bg-emerald-50', icon: CheckCircle2 },
          { label: '待组装', value: cellPcbAssemblyData.filter(d => d.status === '待组装').length + semiShellAssemblyData.filter(d => d.status === '待组装').length, unit: '条', color: '#d97706', bg: 'bg-amber-50', icon: Clock },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="dash-card p-4 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center`}>
              <s.icon className="w-6 h-6" style={{ color: s.color }} />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}<span className="text-sm font-normal text-slate-400 ml-0.5">{s.unit}</span></div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>
      {/* Tab切换 */}
      <SectionCard title="成品组装管理" icon={<Wrench className="w-5 h-5 text-cyan-600" />}
        action={
          <button onClick={() => setAddAssemblyOpen(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-700 transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> 新增组装
          </button>
        }
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center bg-slate-100 rounded-lg p-1">
            <button onClick={() => { setActiveTab('cellPcb'); setSearchTerm('') }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'cellPcb' ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              电芯与电路板组装
            </button>
            <button onClick={() => { setActiveTab('semiShell'); setSearchTerm('') }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'semiShell' ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              半成品与外壳组装
            </button>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="搜索编号 / 操作员" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all w-60" />
          </div>
        </div>
        {activeTab === 'cellPcb' ? (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="data-table">
              <thead><tr><th>组装编号</th><th>电芯SN码</th><th>PCB SN码</th><th>组装时间</th><th>操作员</th><th>状态</th><th>测试状态</th><th>测试结果</th></tr></thead>
              <tbody>
                {filteredCellPcb.map((r, i) => (
                  <tr key={i}>
                    <td className="font-mono text-xs text-cyan-600 font-semibold">{r.id}</td>
                    <td className="font-mono text-xs text-slate-600">{r.cellSn}</td>
                    <td className="font-mono text-xs text-slate-600">{r.pcbSn}</td>
                    <td className="text-slate-500 text-xs whitespace-nowrap">{r.time || '-'}</td>
                    <td className="text-slate-600">{r.operator || '-'}</td>
                    <td><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.status === '已组装' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{r.status}</span></td>
                    <td><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.testStatus === '已测试' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>{r.testStatus}</span></td>
                    <td>{r.testResult ? <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.testResult === '合格' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{r.testResult}</span> : <span className="text-xs text-slate-300">-</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="data-table">
              <thead><tr><th>组装编号</th><th>电芯SN码</th><th>PCB SN码</th><th>外壳SN码</th><th>组装时间</th><th>操作员</th><th>状态</th><th>测试状态</th><th>测试结果</th></tr></thead>
              <tbody>
                {filteredSemiShell.map((r, i) => (
                  <tr key={i}>
                    <td className="font-mono text-xs text-cyan-600 font-semibold">{r.id}</td>
                    <td className="font-mono text-xs text-slate-600">{r.cellSn}</td>
                    <td className="font-mono text-xs text-slate-600">{r.pcbSn}</td>
                    <td className="text-slate-700 font-medium">{r.shellSn}</td>
                    <td className="text-slate-500 text-xs whitespace-nowrap">{r.time || '-'}</td>
                    <td className="text-slate-600">{r.operator || '-'}</td>
                    <td><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.status === '已组装' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{r.status}</span></td>
                    <td><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.testStatus === '已测试' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>{r.testStatus}</span></td>
                    <td>{r.testResult ? <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.testResult === '合格' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{r.testResult}</span> : <span className="text-xs text-slate-300">-</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* 新增组装弹窗 */}
      <Dialog open={addAssemblyOpen} onOpenChange={setAddAssemblyOpen}>
        <DialogContent className="sm:max-w-[560px] bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800">
              <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center">
                <Plus className="w-4 h-4 text-cyan-600" />
              </div>
              新增组装
            </DialogTitle>
            <DialogDescription className="text-slate-500">请按照操作步骤完成组装</DialogDescription>
          </DialogHeader>

          {/* 操作步骤指示 */}
          <div className="px-1 pt-2 pb-1">
            <div className="flex items-center gap-0">
              {/* 步骤1 */}
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-cyan-600 text-white flex items-center justify-center text-sm font-bold shadow-md shadow-cyan-200">1</div>
                <div>
                  <div className="text-xs font-bold text-cyan-700">第一步</div>
                  <div className="text-[11px] text-slate-500 leading-tight">电芯与电路板组装</div>
                </div>
              </div>
              {/* 连接线 */}
              <div className="flex-1 h-0.5 bg-gradient-to-r from-cyan-400 to-violet-400 mx-3 rounded-full" />
              {/* 步骤2 */}
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-violet-600 text-white flex items-center justify-center text-sm font-bold shadow-md shadow-violet-200">2</div>
                <div>
                  <div className="text-xs font-bold text-violet-700">第二步</div>
                  <div className="text-[11px] text-slate-500 leading-tight">半成品与外壳组装</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">组装类型</label>
              <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all bg-white">
                <option>电芯与电路板组装</option>
                <option>半成品与外壳组装</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">操作员</label>
              <input type="text" placeholder="当前登录用户" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all bg-slate-50" readOnly />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">电芯SN码</label>
              <input type="text" placeholder="请扫描或输入" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">PCB SN码</label>
              <input type="text" placeholder="请扫描或输入" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <button className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">取消</button>
            </DialogClose>
            <button onClick={() => setAddAssemblyOpen(false)} className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-700 transition-colors shadow-sm">
              <Save className="w-4 h-4" /> 确认组装
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ---------- 11. 生产工单 ---------- */
function WorkOrderPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [createMode, setCreateMode] = useState<'fill' | 'import'>('fill')
  const [importFile, setImportFile] = useState<string | null>(null)
  /* 工单物料 */
  const [selectedMatBatch, setSelectedMatBatch] = useState('')
  const [matUseQty, setMatUseQty] = useState('')
  const [orderMaterials, setOrderMaterials] = useState<Array<{ batch: string; name: string; storageLocation: string; spec: string; qty: number; startCode: string; endCode: string; useQty: number }>>([])
  const [matSearchOpen, setMatSearchOpen] = useState(false)
  const [matSearchTerm, setMatSearchTerm] = useState('')
  /* 工单详情 */
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<typeof WORK_ORDERS[0] | null>(null)
  /* 选择工单确认弹窗 */
  const [selectConfirmOpen, setSelectConfirmOpen] = useState(false)
  /* 解绑工单确认弹窗 */
  const [unbindConfirmOpen, setUnbindConfirmOpen] = useState(false)

  const openCreateDialog = () => {
    setCreateMode('fill')
    setImportFile(null)
    setSelectedMatBatch('')
    setMatUseQty('')
    setOrderMaterials([])
    setMatSearchOpen(false)
    setMatSearchTerm('')
    setCreateOpen(true)
  }

  /* 工单物料 - 添加 */
  const addMaterialToOrder = () => {
    if (!selectedMatBatch || !matUseQty || Number(matUseQty) <= 0) return
    const mat = materialData.find(m => m.batch === selectedMatBatch)
    if (!mat) return
    if (Number(matUseQty) > mat.qty) return
    setOrderMaterials(prev => {
      if (prev.some(m => m.batch === selectedMatBatch)) return prev
      return [...prev, { batch: mat.batch, name: mat.name, storageLocation: mat.storageLocation, spec: mat.spec, qty: mat.qty, startCode: mat.startCode, endCode: mat.endCode, useQty: Number(matUseQty) }]
    })
    setSelectedMatBatch('')
    setMatUseQty('')
  }

  /* 工单物料 - 删除 */
  const removeMaterialFromOrder = (batch: string) => {
    setOrderMaterials(prev => prev.filter(m => m.batch !== batch))
  }

  return (
    <div className="space-y-5">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '工单总数', value: WORK_ORDERS.length, unit: '个', color: '#0891b2', bg: 'bg-cyan-50', icon: ClipboardCheck },
          { label: '进行中', value: WORK_ORDERS.filter(w => w.status === '进行中').length, unit: '个', color: '#7c3aed', bg: 'bg-violet-50', icon: Activity },
          { label: '已完成', value: WORK_ORDERS.filter(w => w.status === '已完成').length, unit: '个', color: '#059669', bg: 'bg-emerald-50', icon: CheckCircle2 },
          { label: '待接收', value: WORK_ORDERS.filter(w => w.status === '待接收').length, unit: '个', color: '#d97706', bg: 'bg-amber-50', icon: Clock },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="dash-card p-4 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center`}>
              <s.icon className="w-6 h-6" style={{ color: s.color }} />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}<span className="text-sm font-normal text-slate-400 ml-0.5">{s.unit}</span></div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>
      <SectionCard title="生产工单列表" icon={<ClipboardCheck className="w-5 h-5 text-cyan-600" />}
        action={
          <button onClick={openCreateDialog} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-700 transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> 创建生产工单
          </button>
        }
      >
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="data-table">
            <thead><tr><th>工单编号</th><th>成品型号</th><th>计划数量</th><th>完成数量</th><th>完成进度</th><th>优先级</th><th>状态</th><th>创建人</th><th>选择人</th><th>创建时间</th><th>操作</th></tr></thead>
            <tbody>
              {WORK_ORDERS.map((w, i) => (
                <tr key={i}>
                  <td className="font-mono text-xs text-cyan-600 font-semibold">{w.id}</td>
                  <td className="text-slate-700 font-medium">{w.productModel}</td>
                  <td className="font-semibold">{w.planQty}</td>
                  <td className="font-semibold">{w.completedQty}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 rounded-full h-2 max-w-[100px]">
                        <div className="h-2 rounded-full transition-all" style={{ width: `${(w.completedQty / w.planQty) * 100}%`, backgroundColor: w.completedQty === w.planQty ? '#059669' : w.completedQty > 0 ? '#0891b2' : '#d97706' }} />
                      </div>
                      <span className="text-xs text-slate-500 font-medium">{Math.round((w.completedQty / w.planQty) * 100)}%</span>
                    </div>
                  </td>
                  <td><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${w.priority === '高' ? 'bg-rose-50 text-rose-600' : w.priority === '中' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-600'}`}>{w.priority}</span></td>
                  <td><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${w.status === '已完成' ? 'bg-emerald-50 text-emerald-600' : w.status === '进行中' ? 'bg-violet-50 text-violet-600' : 'bg-amber-50 text-amber-600'}`}>{w.status}</span></td>
                  <td className="text-slate-600">{w.creator}</td>
                  <td>
                    {w.assignee ? (
                      <span className="inline-flex items-center gap-1 text-xs text-violet-700 font-medium"><UserPlus className="w-3 h-3" />{w.assignee}</span>
                    ) : (
                      <span className="text-xs text-slate-400">--</span>
                    )}
                  </td>
                  <td className="text-slate-500 text-xs whitespace-nowrap">{w.createTime}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setSelectedOrder(w); setDetailOpen(true) }} className="flex items-center gap-1 text-cyan-600 hover:text-cyan-700 text-xs font-medium"><Eye className="w-3.5 h-3.5" />详情</button>
                      <button onClick={() => { setSelectedOrder(w); setSelectConfirmOpen(true) }} className="flex items-center gap-1 text-violet-600 hover:text-violet-700 text-xs font-medium"><UserPlus className="w-3.5 h-3.5" />选择</button>
                      <button onClick={() => { setSelectedOrder(w); setUnbindConfirmOpen(true) }} className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-xs font-medium"><CheckCircle className="w-3.5 h-3.5" />完成</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* 工单详情弹窗 */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-[700px] bg-white p-0 overflow-hidden">
          {/* 顶部渐变横幅 */}
          <div className="relative bg-gradient-to-r from-cyan-600 via-cyan-500 to-teal-500 px-6 pt-6 pb-8">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-2 right-8 w-32 h-32 rounded-full border-4 border-white/30" />
              <div className="absolute bottom-0 right-24 w-20 h-20 rounded-full border-2 border-white/20" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <ClipboardCheck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">工单详情</h3>
                    <p className="text-cyan-100 text-xs mt-0.5">Work Order Detail</p>
                  </div>
                </div>
                {selectedOrder && (
                  <span className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm ${selectedOrder.status === '已完成' ? 'bg-emerald-400/30 text-emerald-100 border border-emerald-300/30' : selectedOrder.status === '进行中' ? 'bg-violet-400/30 text-violet-100 border border-violet-300/30' : 'bg-amber-400/30 text-amber-100 border border-amber-300/30'}`}>{selectedOrder.status}</span>
                )}
              </div>
              {selectedOrder && (
                <div className="flex items-center gap-4">
                  <span className="font-mono text-2xl font-bold text-white tracking-wide">{selectedOrder.id}</span>
                  <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${selectedOrder.priority === '高' ? 'bg-rose-400/30 text-rose-100 border border-rose-300/30' : selectedOrder.priority === '中' ? 'bg-amber-300/30 text-amber-100 border border-amber-200/30' : 'bg-white/20 text-white/80 border border-white/20'}`}>{selectedOrder.priority}优先级</span>
                </div>
              )}
            </div>
          </div>

          {selectedOrder && (
            <div className="px-6 pb-6 space-y-5">
              {/* 进度概览 - 卡片式 */}
              <div className="grid grid-cols-3 gap-3 -mt-5 relative z-20">
                <div className="bg-white rounded-xl shadow-md shadow-slate-200/60 border border-slate-100 p-4 text-center">
                  <div className="w-9 h-9 rounded-lg bg-cyan-50 flex items-center justify-center mx-auto mb-2">
                    <Target className="w-4.5 h-4.5 text-cyan-600" />
                  </div>
                  <p className="text-xl font-bold text-slate-800">{selectedOrder.planQty}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">计划数量</p>
                </div>
                <div className="bg-white rounded-xl shadow-md shadow-slate-200/60 border border-slate-100 p-4 text-center">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
                  </div>
                  <p className="text-xl font-bold text-emerald-600">{selectedOrder.completedQty}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">完成数量</p>
                </div>
                <div className="bg-white rounded-xl shadow-md shadow-slate-200/60 border border-slate-100 p-4 text-center">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center mx-auto mb-2">
                    <Clock className="w-4.5 h-4.5 text-amber-600" />
                  </div>
                  <p className="text-xl font-bold text-amber-600">{selectedOrder.planQty - selectedOrder.completedQty}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">剩余数量</p>
                </div>
              </div>

              {/* 完成进度条 */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-600">完成进度</span>
                  <span className="text-sm font-bold" style={{ color: selectedOrder.completedQty === selectedOrder.planQty ? '#059669' : selectedOrder.completedQty > 0 ? '#0891b2' : '#d97706' }}>
                    {Math.round((selectedOrder.completedQty / selectedOrder.planQty) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-slate-200/80 rounded-full h-2.5 overflow-hidden">
                  <div className="h-2.5 rounded-full transition-all duration-500" style={{ width: `${(selectedOrder.completedQty / selectedOrder.planQty) * 100}%`, background: selectedOrder.completedQty === selectedOrder.planQty ? 'linear-gradient(90deg, #059669, #34d399)' : selectedOrder.completedQty > 0 ? 'linear-gradient(90deg, #0891b2, #22d3ee)' : 'linear-gradient(90deg, #d97706, #fbbf24)' }} />
                </div>
                <div className="flex items-center justify-between mt-1.5 text-[10px] text-slate-400">
                  <span>0</span>
                  <span>{selectedOrder.planQty}</span>
                </div>
              </div>

              {/* 详细信息 */}
              <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                <div className="px-4 py-2.5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-600">基本信息</span>
                </div>
                <div className="divide-y divide-slate-50">
                  <div className="flex items-center px-4 py-3">
                    <div className="w-7 h-7 rounded-md bg-cyan-50 flex items-center justify-center mr-3">
                      <FileText className="w-3.5 h-3.5 text-cyan-500" />
                    </div>
                    <span className="text-sm text-slate-500 w-20">成品型号</span>
                    <span className="text-sm font-semibold text-slate-800">{selectedOrder.productModel}</span>
                  </div>
                  <div className="flex items-center px-4 py-3">
                    <div className="w-7 h-7 rounded-md bg-violet-50 flex items-center justify-center mr-3">
                      <Users className="w-3.5 h-3.5 text-violet-500" />
                    </div>
                    <span className="text-sm text-slate-500 w-20">创建人</span>
                    <span className="text-sm font-semibold text-slate-800">{selectedOrder.creator}</span>
                  </div>
                  <div className="flex items-center px-4 py-3">
                    <div className="w-7 h-7 rounded-md bg-indigo-50 flex items-center justify-center mr-3">
                      <UserPlus className="w-3.5 h-3.5 text-indigo-500" />
                    </div>
                    <span className="text-sm text-slate-500 w-20">选择人</span>
                    <span className="text-sm font-semibold text-slate-800">{selectedOrder.assignee || '--'}</span>
                  </div>
                  <div className="flex items-center px-4 py-3">
                    <div className="w-7 h-7 rounded-md bg-blue-50 flex items-center justify-center mr-3">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                    <span className="text-sm text-slate-500 w-20">创建时间</span>
                    <span className="text-sm text-slate-700">{selectedOrder.createTime}</span>
                  </div>
                </div>
              </div>

              {/* 物料信息 */}
              <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                <div className="px-4 py-2.5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">物料信息</span>
                  <span className="text-[10px] text-slate-400">共 {selectedOrder.materials.length} 项物料</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-4 py-2 text-left text-[11px] font-semibold text-slate-500">物料批次码</th>
                        <th className="px-4 py-2 text-left text-[11px] font-semibold text-slate-500">物料名称</th>
                        <th className="px-4 py-2 text-left text-[11px] font-semibold text-slate-500">存放位置</th>
                        <th className="px-4 py-2 text-left text-[11px] font-semibold text-slate-500">规格</th>
                        <th className="px-4 py-2 text-left text-[11px] font-semibold text-slate-500">开始编码</th>
                        <th className="px-4 py-2 text-left text-[11px] font-semibold text-slate-500">结束编码</th>
                        <th className="px-4 py-2 text-right text-[11px] font-semibold text-slate-500">库存数量</th>
                        <th className="px-4 py-2 text-right text-[11px] font-semibold text-slate-500">使用数量</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {selectedOrder.materials.map((mat, mi) => (
                        <tr key={mi} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-2.5 font-mono text-xs text-cyan-600">{mat.batch}</td>
                          <td className="px-4 py-2.5 text-slate-700 font-medium">{mat.name}</td>
                          <td className="px-4 py-2.5"><span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">{mat.storageLocation}</span></td>
                          <td className="px-4 py-2.5 text-slate-500 text-xs">{mat.spec}</td>
                          <td className="px-4 py-2.5 font-mono text-xs text-emerald-600">{mat.startCode}</td>
                          <td className="px-4 py-2.5 font-mono text-xs text-amber-600">{mat.endCode}</td>
                          <td className="px-4 py-2.5 text-right text-slate-600 font-medium">{mat.qty.toLocaleString()}</td>
                          <td className="px-4 py-2.5 text-right font-semibold text-cyan-600">{mat.useQty.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50/30 border-t border-slate-100">
                        <td colSpan={6} className="px-4 py-2 text-xs text-slate-500 font-semibold text-right">合计</td>
                        <td className="px-4 py-2 text-right text-xs text-slate-600 font-bold">{selectedOrder.materials.reduce((s, m) => s + m.qty, 0).toLocaleString()}</td>
                        <td className="px-4 py-2 text-right text-xs text-cyan-600 font-bold">{selectedOrder.materials.reduce((s, m) => s + m.useQty, 0).toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}
          <div className="px-6 pb-5">
            <DialogClose asChild>
              <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-slate-100 to-slate-50 text-sm font-semibold text-slate-600 hover:from-slate-200 hover:to-slate-100 transition-all border border-slate-200">关闭</button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>

      {/* 选择工单确认弹窗 */}
      <Dialog open={selectConfirmOpen} onOpenChange={setSelectConfirmOpen}>
        <DialogContent className="sm:max-w-[440px] bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800">
              <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-violet-600" />
              </div>
              选择工单确认
            </DialogTitle>
            <DialogDescription className="text-slate-500">请确认是否选择此生产工单</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-violet-50/60 border border-violet-100 rounded-xl p-4">
              <p className="text-sm text-slate-700 leading-relaxed">
                是否确认选择此生产工单？选择后工单将与您形成绑定关系，解绑前其他人无权选择此工单。
              </p>
            </div>
            {selectedOrder && (
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <span className="font-mono text-cyan-600 font-semibold">{selectedOrder.id}</span>
                <span>·</span>
                <span>{selectedOrder.productModel}</span>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <button className="px-5 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">取消</button>
            </DialogClose>
            <button onClick={() => setSelectConfirmOpen(false)} className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors shadow-sm">
              <UserPlus className="w-4 h-4" />确认选择
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 解绑工单确认弹窗 */}
      <Dialog open={unbindConfirmOpen} onOpenChange={setUnbindConfirmOpen}>
        <DialogContent className="sm:max-w-[440px] bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
              完成解绑确认
            </DialogTitle>
            <DialogDescription className="text-slate-500">请确认是否解绑此生产工单</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-4">
              <p className="text-sm text-slate-700 leading-relaxed">
                是否确认解绑？解绑后工单将与您脱离绑定关系。
              </p>
            </div>
            {selectedOrder && (
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <span className="font-mono text-cyan-600 font-semibold">{selectedOrder.id}</span>
                <span>·</span>
                <span>{selectedOrder.productModel}</span>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <button className="px-5 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">取消</button>
            </DialogClose>
            <button onClick={() => setUnbindConfirmOpen(false)} className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm">
              <CheckCircle className="w-4 h-4" />确认解绑
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 创建工单弹窗 */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[720px] bg-white max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800">
              <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center">
                <Plus className="w-4 h-4 text-cyan-600" />
              </div>
              创建生产工单
            </DialogTitle>
            <DialogDescription className="text-slate-500">选择填写工单或导入工单来创建</DialogDescription>
          </DialogHeader>

          {/* 切换按钮 */}
          <div className="flex p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setCreateMode('fill')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
                createMode === 'fill'
                  ? 'bg-white text-cyan-700 shadow-sm border border-cyan-100'
                  : 'text-slate-500 hover:text-slate-700 border border-transparent'
              }`}
            >
              <FileText className="w-4 h-4" />
              填写工单
            </button>
            <button
              onClick={() => setCreateMode('import')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
                createMode === 'import'
                  ? 'bg-white text-cyan-700 shadow-sm border border-cyan-100'
                  : 'text-slate-500 hover:text-slate-700 border border-transparent'
              }`}
            >
              <Upload className="w-4 h-4" />
              导入工单
            </button>
          </div>

          {/* 填写工单表单 */}
          {createMode === 'fill' && (
            <div className="space-y-5 py-4">
              {/* 基本信息表单 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">成品型号 <span className="text-rose-500">*</span></label>
                  <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all bg-white">
                    <option>PB-10000mAh-A</option>
                    <option>PB-20000mAh-B</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">计划数量 <span className="text-rose-500">*</span></label>
                  <input type="number" placeholder="0" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">优先级</label>
                  <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all bg-white">
                    <option>高</option>
                    <option>中</option>
                    <option>低</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">创建人</label>
                  <input type="text" placeholder="当前登录用户" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all bg-slate-50" readOnly />
                </div>
              </div>

              {/* 物料选择区域 */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-cyan-50 flex items-center justify-center">
                        <Package className="w-3.5 h-3.5 text-cyan-600" />
                      </div>
                      <span className="text-sm font-bold text-slate-700">物料选择</span>
                    </div>
                    <span className="text-[10px] text-slate-400">选择物料并输入使用数量后点击添加</span>
                  </div>
                </div>
                {/* 选择物料 + 使用数量 + 添加按钮 */}
                <div className="px-4 py-3 flex items-end gap-3 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex-1 space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">选择物料</label>
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        readOnly
                        placeholder="点击搜索物料..."
                        value={selectedMatBatch ? (() => { const m = materialData.find(md => md.batch === selectedMatBatch); return m ? `${m.batch} - ${m.name}` : '' })() : ''}
                        onClick={() => setMatSearchOpen(true)}
                        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all bg-white cursor-pointer"
                      />
                      {/* 搜索弹层 */}
                      {matSearchOpen && (
                        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                          <div className="p-2 border-b border-slate-100">
                            <div className="relative">
                              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                              <input
                                type="text"
                                autoFocus
                                value={matSearchTerm}
                                onChange={e => setMatSearchTerm(e.target.value)}
                                placeholder="搜索批次码 / 名称 / 供应商..."
                                className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-md text-sm outline-none focus:border-cyan-400 transition-all"
                              />
                            </div>
                          </div>
                          <div className="max-h-48 overflow-y-auto">
                            {materialData
                              .filter(m => !orderMaterials.some(om => om.batch === m.batch))
                              .filter(m => {
                                if (!matSearchTerm.trim()) return true
                                const term = matSearchTerm.toLowerCase()
                                return m.batch.toLowerCase().includes(term)
                                  || m.name.toLowerCase().includes(term)
                                  || m.supplier.toLowerCase().includes(term)
                                  || m.brandName.toLowerCase().includes(term)
                              })
                              .length === 0 && (
                                <div className="px-4 py-6 text-center text-xs text-slate-400">未找到匹配物料</div>
                              )}
                            {materialData
                              .filter(m => !orderMaterials.some(om => om.batch === m.batch))
                              .filter(m => {
                                if (!matSearchTerm.trim()) return true
                                const term = matSearchTerm.toLowerCase()
                                return m.batch.toLowerCase().includes(term)
                                  || m.name.toLowerCase().includes(term)
                                  || m.supplier.toLowerCase().includes(term)
                                  || m.brandName.toLowerCase().includes(term)
                              })
                              .map(m => (
                                <div
                                  key={m.batch}
                                  onClick={() => { setSelectedMatBatch(m.batch); setMatSearchOpen(false); setMatSearchTerm('') }}
                                  className={`px-3 py-2.5 cursor-pointer transition-colors border-b border-slate-50 last:border-0 ${selectedMatBatch === m.batch ? 'bg-cyan-50' : 'hover:bg-slate-50'}`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-xs text-cyan-600">{m.batch}</span>
                                      <span className="text-sm font-medium text-slate-700">{m.name}</span>
                                    </div>
                                    <span className="text-xs text-slate-400">库存: {m.qty}</span>
                                  </div>
                                  <div className="flex items-center gap-3 mt-0.5">
                                    <span className="text-[10px] text-slate-400">{m.supplier}</span>
                                    <span className="text-[10px] text-slate-400">{m.spec}</span>
                                    <span className="text-[10px] text-slate-400">编码: {m.startCode} ~ {m.endCode}</span>
                                  </div>
                                </div>
                              ))}
                          </div>
                          <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[10px] text-slate-400">点击物料项选中，支持按批次码/名称/供应商搜索</span>
                            <button onClick={() => { setMatSearchOpen(false); setMatSearchTerm('') }} className="text-xs text-slate-500 hover:text-slate-700 font-medium">关闭</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="w-28 space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">使用数量</label>
                    <input type="number" value={matUseQty} onChange={e => setMatUseQty(e.target.value)} placeholder="0" min="1" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all" />
                  </div>
                  <button onClick={addMaterialToOrder} disabled={!selectedMatBatch || !matUseQty || Number(matUseQty) <= 0} className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors whitespace-nowrap ${selectedMatBatch && matUseQty && Number(matUseQty) > 0 ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-slate-300 cursor-not-allowed'}`}>
                    <Plus className="w-4 h-4 inline-block -mt-0.5" /> 添加
                  </button>
                </div>

                {/* 物料列表表格 */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50/80">
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">物料批次码</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">物料名称</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">存放位置</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">规格</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">数量</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">开始编码</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">结束编码</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">使用数量</th>
                        <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderMaterials.length === 0 && (
                        <tr>
                          <td colSpan={9} className="px-4 py-8 text-center text-xs text-slate-400">暂未添加物料，请从上方选择物料并添加</td>
                        </tr>
                      )}
                      {orderMaterials.map(m => (
                        <tr key={m.batch} className="border-t border-slate-100 hover:bg-cyan-50/30 transition-colors">
                          <td className="px-4 py-2.5 font-mono text-xs text-cyan-600">{m.batch}</td>
                          <td className="px-4 py-2.5 font-medium text-slate-700">{m.name}</td>
                          <td className="px-4 py-2.5"><span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">{m.storageLocation}</span></td>
                          <td className="px-4 py-2.5 text-slate-500">{m.spec}</td>
                          <td className="px-4 py-2.5 font-semibold text-slate-700">{m.qty.toLocaleString()}</td>
                          <td className="px-4 py-2.5 font-mono text-xs text-slate-600">{m.startCode}</td>
                          <td className="px-4 py-2.5 font-mono text-xs text-slate-600">{m.endCode}</td>
                          <td className="px-4 py-2.5 font-semibold text-cyan-600">{m.useQty.toLocaleString()}</td>
                          <td className="px-4 py-2.5 text-center">
                            <button onClick={() => removeMaterialFromOrder(m.batch)} className="text-rose-500 hover:text-rose-600 transition-colors" title="删除">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {orderMaterials.length > 0 && (
                  <div className="px-4 py-2.5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">已添加 <strong className="text-slate-700">{orderMaterials.length}</strong> 项物料</span>
                    <span className="text-xs text-slate-500">使用数量合计: <strong className="text-cyan-600">{orderMaterials.reduce((s, m) => s + m.useQty, 0).toLocaleString()}</strong></span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 导入工单 */}
          {createMode === 'import' && (
            <div className="py-4">
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center gap-4 hover:border-cyan-300 hover:bg-cyan-50/30 transition-all cursor-pointer"
                onClick={() => setImportFile(importFile ? null : 'workorder_template.xlsx')}
              >
                <div className="w-14 h-14 rounded-2xl bg-cyan-50 flex items-center justify-center">
                  <Upload className="w-7 h-7 text-cyan-500" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-700">点击上传工单文件</p>
                  <p className="text-xs text-slate-400 mt-1">支持 .xlsx、.xls、.csv 格式，单次最多导入 500 条</p>
                </div>
                {importFile && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-700">{importFile}</span>
                    <button onClick={e => { e.stopPropagation(); setImportFile(null) }} className="ml-2 text-slate-400 hover:text-rose-500 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-700">
                    <p className="font-semibold mb-1">导入说明</p>
                    <ul className="space-y-0.5 text-amber-600 list-disc list-inside">
                      <li>请按照模板格式填写工单数据，避免格式错误</li>
                      <li>成品型号必须为系统中已存在的型号</li>
                      <li>导入后系统会自动校验数据，校验失败的行会被标红提示</li>
                    </ul>
                  </div>
                </div>
              </div>
              <button className="mt-3 flex items-center gap-1.5 text-xs font-medium text-cyan-600 hover:text-cyan-700 transition-colors">
                <FileText className="w-3.5 h-3.5" /> 下载导入模板
              </button>
            </div>
          )}

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <button className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">取消</button>
            </DialogClose>
            {createMode === 'fill' ? (
              <button onClick={() => setCreateOpen(false)} className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-700 transition-colors shadow-sm">
                <Save className="w-4 h-4" /> 确认创建
              </button>
            ) : (
              <button onClick={() => setCreateOpen(false)} className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-700 transition-colors shadow-sm">
                <Upload className="w-4 h-4" /> 确认导入
              </button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


/* ---------- 12. 资料库 ---------- */
interface DocFile {
  id: string
  name: string
  type: string
  size: string
  uploadTime: string
  uploader: string
}

interface DocCategory {
  id: string
  name: string
  files: DocFile[]
}

const mockDocCategories: DocCategory[] = [
  {
    id: 'cat1', name: '产品规格书',
    files: [
      { id: 'f1', name: 'PB-10000mAh-A 产品规格书.pdf', type: 'pdf', size: '2.4 MB', uploadTime: '2026-05-10 09:30', uploader: '张三' },
      { id: 'f2', name: 'PB-20000mAh-B 产品规格书.pdf', type: 'pdf', size: '3.1 MB', uploadTime: '2026-05-09 14:20', uploader: '李四' },
    ]
  },
  {
    id: 'cat2', name: '测试标准',
    files: [
      { id: 'f3', name: '电芯过充保护测试标准.docx', type: 'docx', size: '1.2 MB', uploadTime: '2026-05-08 10:15', uploader: '王五' },
      { id: 'f4', name: '成品老化测试标准.docx', type: 'docx', size: '890 KB', uploadTime: '2026-05-07 16:40', uploader: '赵六' },
      { id: 'f5', name: 'PCB功能测试标准.pdf', type: 'pdf', size: '1.5 MB', uploadTime: '2026-05-06 11:20', uploader: '张三' },
    ]
  },
  {
    id: 'cat3', name: '作业指导书',
    files: [
      { id: 'f6', name: '成品组装作业指导书.pdf', type: 'pdf', size: '4.2 MB', uploadTime: '2026-05-05 08:45', uploader: '周九' },
    ]
  },
  {
    id: 'cat4', name: '培训资料',
    files: [
      { id: 'f7', name: 'MES系统操作培训.pptx', type: 'pptx', size: '8.6 MB', uploadTime: '2026-05-04 13:30', uploader: '张三' },
      { id: 'f8', name: '安全生产培训手册.pdf', type: 'pdf', size: '5.3 MB', uploadTime: '2026-05-03 09:00', uploader: '李四' },
    ]
  },
]

function getFileIcon(type: string) {
  switch (type) {
    case 'pdf': return { icon: FileText, color: '#e11d48', bg: 'bg-rose-50' }
    case 'docx': return { icon: FileText, color: '#2563eb', bg: 'bg-blue-50' }
    case 'xlsx': return { icon: FileSpreadsheet, color: '#059669', bg: 'bg-emerald-50' }
    case 'pptx': return { icon: FileText, color: '#d97706', bg: 'bg-amber-50' }
    default: return { icon: File, color: '#64748b', bg: 'bg-slate-50' }
  }
}

function DocumentLibraryPage() {
  const [categories, setCategories] = useState<DocCategory[]>(mockDocCategories)
  const [addCategoryOpen, setAddCategoryOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploadCategoryId, setUploadCategoryId] = useState('')
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ categoryId: string; fileId: string; fileName: string } | null>(null)
  const [deleteCategoryOpen, setDeleteCategoryOpen] = useState(false)
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState<{ categoryId: string; categoryName: string } | null>(null)
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(mockDocCategories[0]?.id ?? null)
  const [fileActionMenu, setFileActionMenu] = useState<string | null>(null)
  const [renameCategoryOpen, setRenameCategoryOpen] = useState(false)
  const [renameTarget, setRenameTarget] = useState<{ categoryId: string; currentName: string } | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [uploadFiles, setUploadFiles] = useState<string[]>([])
  const [categoryActionMenu, setCategoryActionMenu] = useState<string | null>(null)

  const activeCategory = categories.find(c => c.id === activeCategoryId)

  /* 添加分类 */
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return
    const newCat: DocCategory = {
      id: `cat_${Date.now()}`,
      name: newCategoryName.trim(),
      files: []
    }
    setCategories(prev => [...prev, newCat])
    setNewCategoryName('')
    setAddCategoryOpen(false)
  }

  /* 重命名分类 */
  const handleRenameCategory = () => {
    if (!renameTarget || !renameValue.trim()) return
    setCategories(prev => prev.map(c =>
      c.id === renameTarget.categoryId ? { ...c, name: renameValue.trim() } : c
    ))
    setRenameTarget(null)
    setRenameValue('')
    setRenameCategoryOpen(false)
  }

  /* 删除分类 */
  const handleDeleteCategory = () => {
    if (!deleteCategoryTarget) return
    setCategories(prev => prev.filter(c => c.id !== deleteCategoryTarget.categoryId))
    if (activeCategoryId === deleteCategoryTarget.categoryId) {
      const remaining = categories.filter(c => c.id !== deleteCategoryTarget.categoryId)
      setActiveCategoryId(remaining.length > 0 ? remaining[0].id : null)
    }
    setDeleteCategoryTarget(null)
    setDeleteCategoryOpen(false)
  }

  /* 模拟上传文件 */
  const handleUpload = () => {
    if (!uploadCategoryId || uploadFiles.length === 0) return
    const newFiles: DocFile[] = uploadFiles.map((name, i) => ({
      id: `f_${Date.now()}_${i}`,
      name,
      type: name.split('.').pop() || 'file',
      size: `${(Math.random() * 10 + 0.5).toFixed(1)} MB`,
      uploadTime: new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      uploader: '当前用户'
    }))
    setCategories(prev => prev.map(c =>
      c.id === uploadCategoryId ? { ...c, files: [...c.files, ...newFiles] } : c
    ))
    setUploadFiles([])
    setUploadOpen(false)
  }

  /* 删除文件 */
  const handleDeleteFile = () => {
    if (!deleteTarget) return
    setCategories(prev => prev.map(c =>
      c.id === deleteTarget.categoryId
        ? { ...c, files: c.files.filter(f => f.id !== deleteTarget.fileId) }
        : c
    ))
    setDeleteTarget(null)
    setDeleteConfirmOpen(false)
  }

  /* 模拟下载文件 */
  const handleDownload = (file: DocFile) => {
    const blob = new Blob([`这是 ${file.name} 的模拟内容`], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    a.click()
    URL.revokeObjectURL(url)
    setFileActionMenu(null)
  }

  /* 模拟打印文件 */
  const handlePrint = (file: DocFile) => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html><head><title>${file.name}</title>
        <style>body{font-family:sans-serif;padding:40px;}h1{color:#1e293b;}</style></head>
        <body><h1>${file.name}</h1><p>文件类型: ${file.type.toUpperCase()}</p>
        <p>文件大小: ${file.size}</p><p>上传时间: ${file.uploadTime}</p>
        <p>上传者: ${file.uploader}</p><hr/><p>[资料库文档模拟打印内容]</p></body></html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
    setFileActionMenu(null)
  }

  const totalFiles = categories.reduce((sum, c) => sum + c.files.length, 0)

  return (
    <div className="space-y-5">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="dash-card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center">
            <FolderOpen className="w-6 h-6 text-cyan-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{categories.length}</div>
            <div className="text-xs text-slate-500">分类总数</div>
          </div>
        </div>
        <div className="dash-card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center">
            <FileText className="w-6 h-6 text-violet-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{totalFiles}</div>
            <div className="text-xs text-slate-500">资料总数</div>
          </div>
        </div>
        <div className="dash-card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Upload className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">
              {categories.reduce((sum, c) => {
                const categorySize = c.files.reduce((acc, f) => acc + parseFloat(f.size), 0)
                return sum + categorySize
              }, 0).toFixed(1)} MB
            </div>
            <div className="text-xs text-slate-500">存储空间</div>
          </div>
        </div>
      </div>

      {/* 主体区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* 左侧分类列表 */}
        <div className="lg:col-span-1 dash-card p-0 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-700">分类列表</h3>
            <button
              onClick={() => { setNewCategoryName(''); setAddCategoryOpen(true) }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-cyan-700 bg-cyan-50 hover:bg-cyan-100 border border-cyan-100 transition-all"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              添加分类
            </button>
          </div>
          <div className="p-2">
            {categories.length === 0 ? (
              <div className="py-12 text-center">
                <FolderOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400">暂无分类</p>
                <p className="text-[11px] text-slate-400">点击上方按钮添加分类</p>
              </div>
            ) : (
              <div className="space-y-1">
                {categories.map(cat => (
                  <div key={cat.id} className="relative group">
                    <button
                      onClick={() => setActiveCategoryId(cat.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all ${
                        activeCategoryId === cat.id
                          ? 'bg-cyan-50 text-cyan-700 font-medium border border-cyan-100'
                          : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FolderOpen className={`w-4 h-4 flex-shrink-0 ${activeCategoryId === cat.id ? 'text-cyan-600' : 'text-slate-400'}`} />
                        <span className="truncate">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">{cat.files.length}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); setCategoryActionMenu(categoryActionMenu === cat.id ? null : cat.id) }}
                          className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-slate-200 transition-all"
                        >
                          <MoreVertical className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                      </div>
                    </button>
                    {categoryActionMenu === cat.id && (
                      <div className="absolute right-0 top-full z-50 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 w-28">
                        <button
                          onClick={() => {
                            setRenameTarget({ categoryId: cat.id, currentName: cat.name })
                            setRenameValue(cat.name)
                            setCategoryActionMenu(null)
                            setRenameCategoryOpen(true)
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50"
                        >
                          <Pencil className="w-3 h-3" /> 重命名
                        </button>
                        <button
                          onClick={() => {
                            setDeleteCategoryTarget({ categoryId: cat.id, categoryName: cat.name })
                            setCategoryActionMenu(null)
                            setDeleteCategoryOpen(true)
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3 h-3" /> 删除分类
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 右侧文件列表 */}
        <div className="lg:col-span-3 dash-card p-0 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-700">
                {activeCategory ? activeCategory.name : '全部资料'}
              </h3>
              {activeCategory && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-600 font-medium">{activeCategory.files.length} 个文件</span>
              )}
            </div>
            {activeCategory && (
              <button
                onClick={() => { setUploadCategoryId(activeCategory.id); setUploadFiles([]); setUploadOpen(true) }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-700 transition-all shadow-sm"
              >
                <Upload className="w-3.5 h-3.5" />
                上传资料
              </button>
            )}
          </div>

          <div className="p-5">
            {!activeCategory ? (
              <div className="py-16 text-center">
                <BookOpen className="w-14 h-14 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">请从左侧选择一个分类查看资料</p>
                <p className="text-xs text-slate-400 mt-1">或创建新分类开始管理资料</p>
              </div>
            ) : activeCategory.files.length === 0 ? (
              <div className="py-16 text-center">
                <FileUp className="w-14 h-14 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">该分类下暂无资料</p>
                <p className="text-xs text-slate-400 mt-1">点击上方"上传资料"按钮添加文件</p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* 文件列表头 */}
                <div className="grid grid-cols-12 gap-3 px-4 py-2 text-[11px] font-semibold text-slate-500 border-b border-slate-100">
                  <div className="col-span-5">文件名</div>
                  <div className="col-span-2">类型</div>
                  <div className="col-span-2">大小</div>
                  <div className="col-span-2">上传时间</div>
                  <div className="col-span-1 text-right">操作</div>
                </div>
                {activeCategory.files.map(file => {
                  const fileIcon = getFileIcon(file.type)
                  const FileIconComp = fileIcon.icon
                  return (
                    <div key={file.id} className="relative group grid grid-cols-12 gap-3 px-4 py-3 rounded-lg hover:bg-slate-50/80 transition-all items-center border border-transparent hover:border-slate-100">
                      <div className="col-span-5 flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-lg ${fileIcon.bg} flex items-center justify-center flex-shrink-0`}>
                          <FileIconComp className="w-4 h-4" style={{ color: fileIcon.color }} />
                        </div>
                        <span className="text-sm text-slate-700 truncate">{file.name}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[11px] px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-600 uppercase">{file.type}</span>
                      </div>
                      <div className="col-span-2 text-xs text-slate-500">{file.size}</div>
                      <div className="col-span-2 text-xs text-slate-500">{file.uploadTime}</div>
                      <div className="col-span-1 flex justify-end">
                        <button
                          onClick={() => setFileActionMenu(fileActionMenu === file.id ? null : file.id)}
                          className="p-1.5 rounded-lg hover:bg-slate-200 transition-all"
                        >
                          <MoreVertical className="w-4 h-4 text-slate-400" />
                        </button>
                      </div>
                      {fileActionMenu === file.id && (
                        <div className="absolute right-4 top-full z-50 mt-0 bg-white border border-slate-200 rounded-lg shadow-lg py-1 w-32">
                          <button
                            onClick={() => handleDownload(file)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50"
                          >
                            <Download className="w-3.5 h-3.5 text-cyan-600" /> 下载
                          </button>
                          <button
                            onClick={() => handlePrint(file)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50"
                          >
                            <Printer className="w-3.5 h-3.5 text-violet-600" /> 打印
                          </button>
                          <button
                            onClick={() => {
                              setDeleteTarget({ categoryId: activeCategory.id, fileId: file.id, fileName: file.name })
                              setFileActionMenu(null)
                              setDeleteConfirmOpen(true)
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> 删除
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 添加分类弹窗 */}
      <Dialog open={addCategoryOpen} onOpenChange={setAddCategoryOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>添加分类</DialogTitle>
            <DialogDescription>输入新分类名称，创建后可在其中上传资料文件</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-xs font-semibold text-slate-700 mb-2 block">分类名称</label>
            <input
              value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value)}
              placeholder="请输入分类名称"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all"
              onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <button className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition-all">取消</button>
            </DialogClose>
            <button
              onClick={handleAddCategory}
              disabled={!newCategoryName.trim()}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              确认添加
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 重命名分类弹窗 */}
      <Dialog open={renameCategoryOpen} onOpenChange={setRenameCategoryOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>重命名分类</DialogTitle>
            <DialogDescription>修改分类名称</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-xs font-semibold text-slate-700 mb-2 block">分类名称</label>
            <input
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              placeholder="请输入新名称"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all"
              onKeyDown={e => e.key === 'Enter' && handleRenameCategory()}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <button className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition-all">取消</button>
            </DialogClose>
            <button
              onClick={handleRenameCategory}
              disabled={!renameValue.trim()}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              确认修改
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 上传资料弹窗 */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>上传资料</DialogTitle>
            <DialogDescription>选择文件上传到当前分类：{categories.find(c => c.id === uploadCategoryId)?.name}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div
              className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-cyan-300 hover:bg-cyan-50/20 transition-all cursor-pointer"
              onClick={() => {
                /* 模拟文件选择 */
                const mockFileNames = ['操作手册_V2.1.pdf', '测试报告_2026.xlsx', '工艺流程图.docx', '设备参数配置表.pdf', '质量检测标准.pptx']
                const randomName = mockFileNames[Math.floor(Math.random() * mockFileNames.length)]
                if (!uploadFiles.includes(randomName)) {
                  setUploadFiles(prev => [...prev, randomName])
                }
              }}
            >
              <Upload className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">点击此处选择文件上传</p>
              <p className="text-[11px] text-slate-400 mt-1">支持 PDF、Word、Excel、PPT 等格式，单个文件不超过 50MB</p>
            </div>
            {uploadFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold text-slate-700">待上传文件 ({uploadFiles.length})</p>
                {uploadFiles.map((name, i) => {
                  const ext = name.split('.').pop() || 'file'
                  const fileIconInfo = getFileIcon(ext)
                  const FIcon = fileIconInfo.icon
                  return (
                    <div key={i} className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2 min-w-0">
                        <FIcon className="w-4 h-4 flex-shrink-0" style={{ color: fileIconInfo.color }} />
                        <span className="text-xs text-slate-700 truncate">{name}</span>
                      </div>
                      <button
                        onClick={() => setUploadFiles(prev => prev.filter((_, idx) => idx !== i))}
                        className="p-1 rounded hover:bg-slate-200 transition-all flex-shrink-0"
                      >
                        <X className="w-3 h-3 text-slate-400" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <button className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition-all">取消</button>
            </DialogClose>
            <button
              onClick={handleUpload}
              disabled={uploadFiles.length === 0}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              确认上传 ({uploadFiles.length})
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除文件确认弹窗 */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>确定要删除文件「{deleteTarget?.fileName}」吗？删除后不可恢复。</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <button className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition-all">取消</button>
            </DialogClose>
            <button
              onClick={handleDeleteFile}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 transition-all"
            >
              确认删除
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除分类确认弹窗 */}
      <Dialog open={deleteCategoryOpen} onOpenChange={setDeleteCategoryOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>确认删除分类</DialogTitle>
            <DialogDescription>
              确定要删除分类「{deleteCategoryTarget?.categoryName}」吗？该分类下的所有资料也将被删除，且不可恢复。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <button className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition-all">取消</button>
            </DialogClose>
            <button
              onClick={handleDeleteCategory}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 transition-all"
            >
              确认删除
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


/* ================================================================
   主布局
   ================================================================ */

export default function Dashboard() {
  const [activePage, setActivePage] = useState('dashboard')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewPage, setPreviewPage] = useState('dashboard')
  const previewRef = useRef<HTMLDivElement>(null)

  /* 登录状态 */
  const [loggedIn, setLoggedIn] = useState(false)
  const [loginAccount, setLoginAccount] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginSection, setLoginSection] = useState('')
  const [loginSectionDropdown, setLoginSectionDropdown] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [currentUser, setCurrentUser] = useState<typeof LOGIN_USERS[0] | null>(null)
  const [currentSection, setCurrentSection] = useState('')

  /* 根据当前登录工段过滤侧边栏菜单 - 总管理员可看全部 */
  const filteredNavItems = loggedIn && currentUser?.isSuperAdmin
    ? navItems
    : loggedIn
      ? navItems.filter(item => {
          const allowedKeys = SECTION_NAV_MAP[currentSection] || ['workOrder']
          return allowedKeys.includes(item.key)
        })
      : navItems

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const formatTime = useCallback((d: Date) => d.toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }), [])

  const pageTitle = filteredNavItems.find(n => n.key === activePage)?.label || (loggedIn ? currentSection : '数据看板')

  /* 根据当前输入的账号和密码查找匹配用户（用于登录页面动态显示工段） */
  const matchedLoginUser = LOGIN_USERS.find(u => u.account === loginAccount && u.password === loginPassword) ?? null
  const isSuperAdminAccount = matchedLoginUser?.isSuperAdmin ?? false
  /* 当前账号可用的工段列表（仅账号密码均正确时才显示） */
  const availableSections = matchedLoginUser && !matchedLoginUser.isSuperAdmin ? LOGIN_SECTION_OPTIONS.filter(opt => matchedLoginUser.sections.includes(opt)) : []

  /* 登录处理 */
  const handleLogin = () => {
    setLoginError('')
    const user = LOGIN_USERS.find(u => u.account === loginAccount && u.password === loginPassword)
    if (!user) {
      setLoginError('账号或密码错误')
      return
    }
    // 总管理员不需要选择工段，直接登录
    if (user.isSuperAdmin) {
      setCurrentUser(user)
      setCurrentSection('全部')
      setLoggedIn(true)
      setActivePage('dashboard')
      return
    }
    if (!loginSection) {
      setLoginError('请选择工段')
      return
    }
    if (!user.sections.includes(loginSection)) {
      setLoginError('该账号无此工段权限')
      return
    }
    setCurrentUser(user)
    setCurrentSection(loginSection)
    setLoggedIn(true)
    const allowedKeys = SECTION_NAV_MAP[loginSection] || ['workOrder']
    setActivePage(allowedKeys[0])
  }

  /* 登出处理 */
  const handleLogout = () => {
    setLoggedIn(false)
    setCurrentUser(null)
    setCurrentSection('')
    setLoginAccount('')
    setLoginPassword('')
    setLoginSection('')
    setLoginError('')
    setActivePage('dashboard')
  }

  /* ========== 登录页面 ========== */
  if (!loggedIn) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900 overflow-hidden">
        {/* 左侧装饰区域 */}
        <div className="hidden lg:flex flex-1 flex-col justify-center items-center px-16 relative">
          {/* 背景装饰 */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-400/5 rounded-full blur-3xl" />
          </div>
          {/* Logo和标题 */}
          <div className="relative z-10 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-2xl shadow-cyan-500/30 mx-auto mb-8">
              <Factory className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">MES 生产溯源管理系统</h1>
            <p className="text-cyan-300/70 text-lg mb-2">Manufacturing Execution System</p>
            <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed mt-6">面向制造业的全流程生产溯源管理平台，覆盖物料管理、质量检测、成品组装、设备装箱等核心业务场景</p>
            {/* 特性标签 */}
            <div className="flex flex-wrap gap-3 justify-center mt-8">
              {['全流程追溯', '实时监控', '质量管控', '智能分析'].map(tag => (
                <span key={tag} className="px-4 py-1.5 rounded-full text-xs font-medium bg-white/5 text-cyan-300/80 border border-cyan-400/20 backdrop-blur-sm">{tag}</span>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧登录表单 */}
        <div className="flex-1 flex items-center justify-center px-8 lg:px-16 relative">
          <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-sm" />
          <div className="w-full max-w-md relative z-10">
            {/* 移动端 Logo */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <Factory className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">MES 溯源系统</div>
                <div className="text-[10px] text-slate-400 tracking-wider">PRODUCTION TRACEABILITY</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 p-8">
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-xl bg-cyan-50 flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-7 h-7 text-cyan-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">账号登录</h2>
                <p className="text-sm text-slate-400 mt-1">请输入账号密码{isSuperAdminAccount ? '' : '并选择工段'}</p>
              </div>

              <div className="space-y-5">
                {/* 账号 */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">账号</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <Users className="w-4 h-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      value={loginAccount}
                      onChange={e => { setLoginAccount(e.target.value); setLoginError(''); setLoginSection('') }}
                      placeholder="请输入账号"
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all"
                      onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    />
                  </div>
                </div>

                {/* 密码 */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">密码</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <Lock className="w-4 h-4 text-slate-400" />
                    </div>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={e => { setLoginPassword(e.target.value); setLoginError(''); setLoginSection('') }}
                      placeholder="请输入密码"
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all"
                      onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    />
                  </div>
                </div>

                {/* 总管理员提示 / 工段选择 */}
                {isSuperAdminAccount ? (
                  <div className="flex items-center gap-3 p-3.5 bg-gradient-to-r from-violet-50 to-cyan-50 border border-violet-200 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-violet-700">总管理员</div>
                      <div className="text-xs text-slate-500">登录后可查看全部工段内容</div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700">选择工段 <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setLoginSectionDropdown(!loginSectionDropdown)}
                        className={`w-full px-4 py-3 border rounded-xl text-sm text-left flex items-center justify-between transition-all ${loginSection ? 'border-cyan-200 bg-cyan-50/30 text-slate-700' : 'border-slate-200 text-slate-400 hover:border-cyan-300'}`}
                      >
                        <span>{loginSection || '请选择工段'}</span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${loginSectionDropdown ? 'rotate-180' : ''}`} />
                      </button>
                      {loginSectionDropdown && (
                        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg py-1 max-h-56 overflow-y-auto">
                          {availableSections.length === 0 && (
                            <div className="px-4 py-3 text-sm text-slate-400 text-center">请先输入正确的账号和密码</div>
                          )}
                          {availableSections
                            .map(opt => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => { setLoginSection(opt); setLoginSectionDropdown(false); setLoginError('') }}
                                className={`w-full px-4 py-2.5 text-sm text-left flex items-center gap-3 transition-colors ${
                                  loginSection === opt
                                    ? 'bg-cyan-50 text-cyan-700 font-medium'
                                    : 'text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                                  loginSection === opt ? 'bg-cyan-600 border-cyan-600' : 'border-slate-300'
                                }`}>
                                  {loginSection === opt && <CheckCircle2 className="w-3 h-3 text-white" />}
                                </span>
                                <span>{opt}</span>
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 错误提示 */}
                {loginError && (
                  <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                    <span className="text-sm text-rose-600">{loginError}</span>
                  </div>
                )}

                {/* 登录按钮 */}
                <button
                  onClick={handleLogin}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 text-white text-sm font-semibold hover:from-cyan-700 hover:to-cyan-600 transition-all shadow-lg shadow-cyan-500/25 active:scale-[0.98]"
                >
                  登 录
                </button>
              </div>

              {/* 底部提示 */}
              {/* <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-400">总管理员：admin / admin123（可查看全部内容）</p>
                <p className="text-xs text-slate-400 mt-1">普通账号：zhangsan / 123456、lisi / 123456 等</p>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ========== 主界面（已登录） ========== */
  return (
    <div className="flex h-screen bg-[#f0f4f8] overflow-hidden">
      {/* ========== 侧边栏 ========== */}
      <aside className="w-56 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col shadow-sm">
        {/* Logo */}
        <div className="h-14 flex items-center gap-3 px-5 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-600 to-violet-600 flex items-center justify-center shadow-md shadow-cyan-600/20">
            <Factory className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-xs font-bold tracking-wide shimmer-text">MES 溯源工作台</div>
            <div className="text-[8px] text-slate-400 tracking-wider">PRODUCTION TRACEABILITY</div>
          </div>
        </div>
        {/* 当前工段标识 */}
        <div className="px-4 py-2 border-b border-slate-100">
          {currentUser?.isSuperAdmin ? (
            <div className="flex items-center gap-2 px-2 py-1.5 bg-gradient-to-r from-violet-50 to-cyan-50 rounded-lg border border-violet-200">
              <Shield className="w-3.5 h-3.5 text-violet-600" />
              <span className="text-[11px] font-semibold text-violet-700 truncate">总管理员 · 全部工段</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-2 py-1.5 bg-cyan-50 rounded-lg border border-cyan-100">
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              <span className="text-[11px] font-semibold text-cyan-700 truncate">{currentSection}</span>
            </div>
          )}
        </div>
        {/* 导航 */}
        <nav className="flex-1 py-3 px-3 space-y-1">
          {filteredNavItems.map(item => {
            const isActive = activePage === item.key
            return (
              <button key={item.key} onClick={() => setActivePage(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-50 text-cyan-700 shadow-sm border border-cyan-100'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 border border-transparent'
                }`}>
                <item.icon className={`w-4.5 h-4.5 ${isActive ? 'text-cyan-600' : 'text-slate-400'}`} />
                {item.label}
                {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-cyan-400" />}
              </button>
            )
          })}
        </nav>
        {/* 底部 - 退出登录 */}
        <div className="px-3 py-3 border-t border-slate-100">
          <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all border border-transparent hover:border-rose-100">
            <LogOut className="w-4 h-4" />
            退出登录
          </button>
        </div>
      </aside>

      {/* ========== 主内容区 ========== */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部栏 */}
        <header className="h-14 flex items-center justify-between px-6 bg-white/80 border-b border-slate-200/80 flex-shrink-0" style={{ backdropFilter: 'blur(16px)' }}>
          <h2 className="text-base font-semibold text-slate-700">{pageTitle}</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5 text-cyan-600" />
              <span className="font-mono tabular-nums">{formatTime(currentTime)}</span>
            </div>
            <button
              onClick={() => setPreviewOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-cyan-700 bg-cyan-50 hover:bg-cyan-100 border border-cyan-100 transition-all hover:shadow-sm"
            >
              <Eye className="w-3.5 h-3.5" />
              项目预览
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white shadow-md shadow-violet-500/20">{currentUser?.name?.[0] || 'U'}</div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-700">{currentUser?.name || '用户'}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium border ${currentUser?.isSuperAdmin ? 'bg-violet-50 text-violet-700 border-violet-100' : 'bg-cyan-50 text-cyan-700 border-cyan-100'}`}>{currentUser?.role || ''}</span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <Badge className="w-3 h-3 text-slate-400" />
                  <span className="text-[11px] text-slate-400">工段: {currentUser?.isSuperAdmin ? '全部' : currentSection}</span>
                </div>
              </div>
              <button onClick={handleLogout} className="ml-3 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600 border border-transparent hover:border-rose-100 transition-all" title="退出登录">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </header>

        {/* 页面内容 */}
        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div key={activePage} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
              {activePage === 'dashboard' && <DashboardPage />}
              {activePage === 'material' && <MaterialPage />}
              {activePage === 'semiTest' && <SemiTestPage />}
              {activePage === 'newSemiTest' && <ProductTestPage />}
              {activePage === 'productTest' && <ProductTestPage />}
              {activePage === 'cellPackTest' && <CellPackTestPage />}
              {activePage === 'agingTest' && <AgingTestPage />}
              {activePage === 'assembly' && <AssemblyPage />}
              {activePage === 'workOrder' && <WorkOrderPage />}
              {activePage === 'packaging' && <PackagingPage />}
              {activePage === 'labelPrint' && <LabelPrintPage />}
              {activePage === 'personnel' && <PersonnelPage />}
              {activePage === 'documentLibrary' && <DocumentLibraryPage />}
            </motion.div>
          </AnimatePresence>

          {/* 底部 */}
          <footer className="mt-6 pb-3 flex items-center justify-between text-[10px] text-slate-400 px-1">
            <span>MES 生产溯源管理系统 v2.0</span>
            <span>综合数据看板</span>
          </footer>
        </main>
      </div>

      {/* ========== 项目预览弹窗 ========== */}
      <Dialog open={previewOpen} onOpenChange={(open) => {
        setPreviewOpen(open)
        if (open) setPreviewPage(activePage)
      }}>
        <DialogContent showCloseButton={false} className="max-w-[90vw] p-0 overflow-hidden" style={{ height: '85vh', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
          {/* 弹窗头部 */}
          <div style={{ background: 'linear-gradient(135deg, #0891b2 0%, #7c3aed 100%)', padding: '14px 24px', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Factory style={{ width: '20px', height: '20px', color: '#fff' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>MES 生产溯源管理系统 · 页面预览</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginTop: '1px' }}>点击模块标签切换预览 · 点击「前往此页」跳转到对应模块</div>
              </div>
              <button onClick={() => setPreviewOpen(false)} style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}>
                <X style={{ width: '14px', height: '14px', color: '#fff' }} />
              </button>
            </div>
          </div>

          {/* 模块导航标签栏 */}
          <div style={{ padding: '10px 20px', borderBottom: '1px solid #e2e8f0', background: '#fff', flexShrink: 0, overflowX: 'auto' }}>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {filteredNavItems.map(item => {
                const Icon = item.icon
                const isActive = previewPage === item.key
                return (
                  <button
                    key={item.key}
                    onClick={() => setPreviewPage(item.key)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '5px',
                      padding: '6px 12px', borderRadius: '8px',
                      border: `1px solid ${isActive ? '#0891b2' : '#e2e8f0'}`,
                      background: isActive ? '#ecfeff' : '#f8fafc',
                      cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
                    }}
                  >
                    <Icon style={{ width: '13px', height: '13px', color: isActive ? '#0891b2' : '#94a3b8' }} />
                    <span style={{ fontSize: '12px', fontWeight: isActive ? 600 : 400, color: isActive ? '#0891b2' : '#64748b' }}>{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 页面预览区域 */}
          <div style={{ flex: 1, overflow: 'hidden', position: 'relative', background: '#f0f4f8' }}>
            {/* 预览标题栏 */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye style={{ width: '14px', height: '14px', color: '#0891b2' }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                  {filteredNavItems.find(n => n.key === previewPage)?.label || currentSection}
                </span>
                <span style={{ fontSize: '10px', color: '#94a3b8', padding: '2px 6px', borderRadius: '4px', background: '#f1f5f9' }}>实时预览</span>
              </div>
              <button
                onClick={() => { setActivePage(previewPage); setPreviewOpen(false) }}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 14px', borderRadius: '6px', background: '#0891b2', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600, transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#0e7490'}
                onMouseLeave={e => e.currentTarget.style.background = '#0891b2'}
              >
                前往此页
                <ChevronRight style={{ width: '12px', height: '12px' }} />
              </button>
            </div>

            {/* 实际页面内容渲染区 - 缩放预览 */}
            <div ref={previewRef} style={{ width: '100%', height: '100%', overflow: 'auto', paddingTop: '44px' }}>
              <div style={{ minHeight: '100%', background: '#f0f4f8', padding: '16px' }}>
                <AnimatePresence mode="wait">
                  <motion.div key={previewPage} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                    {previewPage === 'dashboard' && <DashboardPage />}
                    {previewPage === 'material' && <MaterialPage />}
                    {previewPage === 'semiTest' && <SemiTestPage />}
                    {previewPage === 'newSemiTest' && <ProductTestPage />}
                    {previewPage === 'productTest' && <ProductTestPage />}
                    {previewPage === 'cellPackTest' && <CellPackTestPage />}
                    {previewPage === 'agingTest' && <AgingTestPage />}
                    {previewPage === 'assembly' && <AssemblyPage />}
                    {previewPage === 'workOrder' && <WorkOrderPage />}
                    {previewPage === 'packaging' && <PackagingPage />}
                    {previewPage === 'labelPrint' && <LabelPrintPage />}
                    {previewPage === 'personnel' && <PersonnelPage />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* 底部信息栏 */}
          <div style={{ padding: '8px 20px', borderTop: '1px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>v2.0.0</span>
              <div style={{ width: '1px', height: '12px', background: '#e2e8f0' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                <span style={{ fontSize: '11px', color: '#64748b' }}>系统运行正常</span>
              </div>
              <div style={{ width: '1px', height: '12px', background: '#e2e8f0' }} />
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>{filteredNavItems.length} 个功能模块</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {['Next.js', 'React', 'TypeScript', 'Tailwind', 'Recharts'].map(tag => (
                <span key={tag} style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: '#f1f5f9', color: '#64748b', fontWeight: 500 }}>{tag}</span>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
