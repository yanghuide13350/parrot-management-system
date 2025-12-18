import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Tag, Modal, message, Input, Select, DatePicker, Row, Col, Statistic } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { ParrotService } from '../../services/parrotService';
import type { SaleRecord, SalesStatistics, SalesFilterParams } from '../../types/parrot';

const { Option } = Select;
const { RangePicker } = DatePicker;

// 支付方式标签映射
const paymentMethodLabels: Record<string, string> = {
  cash: '现金',
  transfer: '转账',
  wechat: '微信支付',
  alipay: '支付宝',
  other: '其他',
};

// 回访状态标签映射
const followUpStatusLabels: Record<string, string> = {
  pending: '待回访',
  completed: '已回访',
  no_contact: '无法联系',
};

// 回访状态颜色映射
const followUpStatusColors: Record<string, string> = {
  pending: 'orange',
  completed: 'green',
  no_contact: 'red',
};

const SalesRecordsPage: React.FC = () => {
  const [salesRecords, setSalesRecords] = useState<SaleRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<SaleRecord | null>(null);
  const [statistics, setStatistics] = useState<SalesStatistics | null>(null);

  // 筛选条件
  const [filters, setFilters] = useState<SalesFilterParams>({
    page: 1,
    pageSize: 10,
  });
  const [total, setTotal] = useState(0);

  // 获取销售记录列表
  const fetchSalesRecords = async () => {
    try {
      setLoading(true);
      const response = await ParrotService.getSalesRecords(filters);
      setSalesRecords(response.data.items);
      setTotal(response.data.total);
    } catch (error) {
      message.error('获取销售记录失败');
      console.error('Error fetching sales records:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取统计数据
  const fetchStatistics = async () => {
    try {
      const response = await ParrotService.getSalesStatistics();
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  useEffect(() => {
    fetchSalesRecords();
    fetchStatistics();
  }, [filters]);

  const handleAddSale = () => {
    message.info('添加销售记录功能开发中...');
  };

  const handleViewRecord = (record: SaleRecord) => {
    setSelectedRecord(record);
    setModalVisible(true);
  };

  const handleEditRecord = (_record: SaleRecord) => {
    message.info('编辑销售记录功能开发中...');
  };

  const handleDeleteRecord = (_record: SaleRecord) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条销售记录吗？',
      centered: true,
      onOk: () => {
        message.success('删除成功');
        fetchSalesRecords();
      },
    });
  };

  // 筛选处理
  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // 重置到第一页
    }));
  };

  // 处理日期范围筛选
  const handleDateRangeChange = (_dates: any, dateStrings: [string, string]) => {
    setFilters((prev) => ({
      ...prev,
      start_date: dateStrings[0] || undefined,
      end_date: dateStrings[1] || undefined,
      page: 1,
    }));
  };

  // 刷新数据
  const handleRefresh = () => {
    fetchSalesRecords();
    fetchStatistics();
  };

  const columns: ColumnsType<SaleRecord> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: '鹦鹉信息',
      key: 'parrotInfo',
      render: (_, record) => (
        <div>
          <div>{record.parrot?.breed || '-'}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            圈号: {record.parrot?.ring_number || '-'}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            性别: {record.parrot?.gender || '-'}
          </div>
        </div>
      ),
    },
    {
      title: '客户信息',
      key: 'customerInfo',
      render: (_, record) => (
        <div>
          <div>{record.buyer_name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.contact}</div>
        </div>
      ),
    },
    {
      title: '销售价格',
      dataIndex: 'sale_price',
      key: 'sale_price',
      width: 120,
      render: (price) => `¥${Number(price).toFixed(2)}`,
      sorter: (a, b) => a.sale_price - b.sale_price,
    },
    {
      title: '销售日期',
      dataIndex: 'sale_date',
      key: 'sale_date',
      width: 120,
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.sale_date).getTime() - new Date(b.sale_date).getTime(),
    },
    {
      title: '支付方式',
      dataIndex: 'payment_method',
      key: 'payment_method',
      width: 120,
      render: (method) => (
        <Tag>{paymentMethodLabels[method || 'other'] || method || '-'}</Tag>
      ),
    },
    {
      title: '回访状态',
      dataIndex: 'follow_up_status',
      key: 'follow_up_status',
      width: 100,
      render: (status) => (
        <Tag color={followUpStatusColors[status || 'pending']}>
          {followUpStatusLabels[status || 'pending']}
        </Tag>
      ),
    },
    {
      title: '备注',
      dataIndex: 'sale_notes',
      key: 'sale_notes',
      ellipsis: true,
      render: (notes) => notes || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      fixed: 'right',
      render: (_, record) => (
        <Space size={4}>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewRecord(record)}
            style={{ padding: '0 4px' }}
          >
            查看
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditRecord(record)}
            style={{ padding: '0 4px' }}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteRecord(record)}
            style={{ padding: '0 4px' }}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="销售记录管理"
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
              刷新
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddSale}
            >
              添加销售记录
            </Button>
          </Space>
        }
      >
        {/* 筛选区域 */}
        <div style={{ marginBottom: '16px', padding: '16px', background: 'var(--morandi-cloud)', borderRadius: '8px' }}>
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <Input
                placeholder="搜索客户姓名或圈号"
                prefix={<SearchOutlined />}
                value={filters.keyword}
                onChange={(e) => handleFilterChange('keyword', e.target.value || undefined)}
                allowClear
              />
            </Col>
            <Col span={4}>
              <Select
                placeholder="选择品种"
                style={{ width: '100%' }}
                value={filters.breed}
                onChange={(value) => handleFilterChange('breed', value || undefined)}
                allowClear
              >
                <Option value="玄凤">玄凤</Option>
                <Option value="虎皮">虎皮</Option>
                <Option value="牡丹">牡丹</Option>
              </Select>
            </Col>
            <Col span={4}>
              <Select
                placeholder="支付方式"
                style={{ width: '100%' }}
                value={filters.payment_method}
                onChange={(value) => handleFilterChange('payment_method', value || undefined)}
                allowClear
              >
                <Option value="cash">现金</Option>
                <Option value="transfer">转账</Option>
                <Option value="wechat">微信支付</Option>
                <Option value="alipay">支付宝</Option>
                <Option value="other">其他</Option>
              </Select>
            </Col>
            <Col span={6}>
              <RangePicker
                placeholder={['销售开始日期', '销售结束日期']}
                style={{ width: '100%' }}
                onChange={handleDateRangeChange}
              />
            </Col>
            <Col span={4}>
              <Button type="primary" icon={<SearchOutlined />} onClick={() => fetchSalesRecords()}>
                搜索
              </Button>
            </Col>
          </Row>
        </div>

        {/* 统计卡片 */}
        {statistics && (
          <div style={{ marginBottom: '16px' }}>
            <Row gutter={16}>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="总销售额"
                    value={statistics.total_revenue}
                    precision={2}
                    prefix="¥"
                    valueStyle={{ color: 'var(--status-available)' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="销售数量"
                    value={statistics.total_sales}
                    suffix="只"
                    valueStyle={{ color: 'var(--status-sold)' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="平均价格"
                    value={statistics.average_price}
                    precision={2}
                    prefix="¥"
                    valueStyle={{ color: 'var(--status-breeding)' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="退货率"
                    value={statistics.return_rate}
                    precision={2}
                    suffix="%"
                    valueStyle={{ color: 'var(--status-returned)' }}
                  />
                </Card>
              </Col>
            </Row>
          </div>
        )}

        <Table
          columns={columns}
          dataSource={salesRecords}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{
            current: filters.page,
            pageSize: filters.pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: (page, pageSize) => {
              setFilters((prev) => ({
                ...prev,
                page,
                pageSize,
              }));
            },
          }}
        />
      </Card>

      {/* 查看详情模态框 */}
      <Modal
        title="销售记录详情"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={700}
      >
        {selectedRecord && (
          <div style={{ padding: '16px 0' }}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <h3 style={{ marginBottom: '12px', color: 'var(--morandi-slate)' }}>鹦鹉信息</h3>
                <p><strong>品种:</strong> {selectedRecord.parrot?.breed || '-'}</p>
                <p><strong>圈号:</strong> {selectedRecord.parrot?.ring_number || '-'}</p>
                <p><strong>性别:</strong> {selectedRecord.parrot?.gender || '-'}</p>
              </Col>
              <Col span={12}>
                <h3 style={{ marginBottom: '12px', color: 'var(--morandi-slate)' }}>客户信息</h3>
                <p><strong>客户姓名:</strong> {selectedRecord.buyer_name}</p>
                <p><strong>联系电话:</strong> {selectedRecord.contact}</p>
                <p><strong>售卖人:</strong> {selectedRecord.seller}</p>
              </Col>
              <Col span={12}>
                <h3 style={{ marginBottom: '12px', color: 'var(--morandi-slate)' }}>销售信息</h3>
                <p><strong>销售价格:</strong> ¥{Number(selectedRecord.sale_price).toFixed(2)}</p>
                <p><strong>销售日期:</strong> {new Date(selectedRecord.sale_date).toLocaleDateString()}</p>
                <p><strong>支付方式:</strong> <Tag>{paymentMethodLabels[selectedRecord.payment_method || 'other']}</Tag></p>
                <p><strong>回访状态:</strong> <Tag color={followUpStatusColors[selectedRecord.follow_up_status || 'pending']}>
                  {followUpStatusLabels[selectedRecord.follow_up_status || 'pending']}
                </Tag></p>
              </Col>
              <Col span={12}>
                {selectedRecord.sale_notes && (
                  <div>
                    <h3 style={{ marginBottom: '12px', color: 'var(--morandi-slate)' }}>备注</h3>
                    <p>{selectedRecord.sale_notes}</p>
                  </div>
                )}
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SalesRecordsPage;
