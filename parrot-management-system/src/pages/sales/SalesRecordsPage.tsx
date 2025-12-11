import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, Modal, message, Input, Select, DatePicker } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;
const { RangePicker } = DatePicker;

// 模拟销售记录数据
const mockSalesRecords = [
  {
    id: 1,
    parrotId: 1,
    parrotBreed: '玄凤',
    ringNumber: 'XF001',
    customerName: '张三',
    customerPhone: '13800138001',
    salePrice: 299.99,
    saleDate: '2024-11-20',
    paymentMethod: '支付宝',
    notes: '客户很满意',
  },
  {
    id: 2,
    parrotId: 2,
    parrotBreed: '虎皮',
    ringNumber: 'HP002',
    customerName: '李四',
    customerPhone: '13800138002',
    salePrice: 199.99,
    saleDate: '2024-11-18',
    paymentMethod: '微信支付',
    notes: '首次购买',
  },
  {
    id: 3,
    parrotId: 3,
    parrotBreed: '牡丹',
    ringNumber: 'MD003',
    customerName: '王五',
    customerPhone: '13800138003',
    salePrice: 399.99,
    saleDate: '2024-11-15',
    paymentMethod: '现金',
    notes: '批量购买',
  },
];

const SalesRecordsPage: React.FC = () => {
  const [salesRecords, setSalesRecords] = useState(mockSalesRecords);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  const handleAddSale = () => {
    message.info('添加销售记录功能开发中...');
  };

  const handleViewRecord = (record: any) => {
    setSelectedRecord(record);
    setModalVisible(true);
  };

  const handleEditRecord = (record: any) => {
    message.info('编辑销售记录功能开发中...');
  };

  const handleDeleteRecord = (record: any) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条销售记录吗？',
      onOk: () => {
        message.success('删除成功');
      },
    });
  };

  const columns: ColumnsType<any> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '鹦鹉信息',
      key: 'parrotInfo',
      render: (_, record) => (
        <div>
          <div>{record.parrotBreed}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>圈号: {record.ringNumber}</div>
        </div>
      ),
    },
    {
      title: '客户信息',
      key: 'customerInfo',
      render: (_, record) => (
        <div>
          <div>{record.customerName}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.customerPhone}</div>
        </div>
      ),
    },
    {
      title: '销售价格',
      dataIndex: 'salePrice',
      key: 'salePrice',
      width: 120,
      render: (price) => `¥${price.toFixed(2)}`,
      sorter: (a, b) => a.salePrice - b.salePrice,
    },
    {
      title: '销售日期',
      dataIndex: 'saleDate',
      key: 'saleDate',
      width: 120,
      sorter: (a, b) => new Date(a.saleDate).getTime() - new Date(b.saleDate).getTime(),
    },
    {
      title: '支付方式',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: 120,
      render: (method) => (
        <Tag color="blue">{method}</Tag>
      ),
    },
    {
      title: '备注',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
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
        title="销售记录"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddSale}
          >
            添加销售记录
          </Button>
        }
      >
        {/* 筛选区域 */}
        <div style={{ marginBottom: '16px', padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
          <Space wrap>
            <Input placeholder="搜索客户..." style={{ width: 200 }} />
            <Input placeholder="搜索圈号..." style={{ width: 200 }} />
            <Select placeholder="支付方式" style={{ width: 150 }} allowClear>
              <Option value="支付宝">支付宝</Option>
              <Option value="微信支付">微信支付</Option>
              <Option value="现金">现金</Option>
              <Option value="银行卡">银行卡</Option>
            </Select>
            <RangePicker placeholder={['销售日期', '销售日期']} />
            <Button type="primary">搜索</Button>
            <Button>重置</Button>
          </Space>
        </div>

        {/* 统计卡片 */}
        <div style={{ marginBottom: '16px' }}>
          <Space size="large">
            <div style={{ padding: '16px 24px', background: '#e6f7ff', borderRadius: '8px' }}>
              <div style={{ fontSize: '14px', color: '#666' }}>总销售额</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                ¥{salesRecords.reduce((sum, record) => sum + record.salePrice, 0).toFixed(2)}
              </div>
            </div>
            <div style={{ padding: '16px 24px', background: '#f6ffed', borderRadius: '8px' }}>
              <div style={{ fontSize: '14px', color: '#666' }}>销售数量</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                {salesRecords.length} 只
              </div>
            </div>
            <div style={{ padding: '16px 24px', background: '#fff7e6', borderRadius: '8px' }}>
              <div style={{ fontSize: '14px', color: '#666' }}>平均价格</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
                ¥{(salesRecords.reduce((sum, record) => sum + record.salePrice, 0) / salesRecords.length).toFixed(2)}
              </div>
            </div>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={salesRecords}
          rowKey="id"
          loading={loading}
          pagination={{
            total: salesRecords.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      {/* 查看详情模态框 */}
      <Modal
        title="销售记录详情"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedRecord && (
          <div style={{ padding: '16px 0' }}>
            <div style={{ marginBottom: '16px' }}>
              <h3>鹦鹉信息</h3>
              <p><strong>品种:</strong> {selectedRecord.parrotBreed}</p>
              <p><strong>圈号:</strong> {selectedRecord.ringNumber}</p>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <h3>客户信息</h3>
              <p><strong>客户姓名:</strong> {selectedRecord.customerName}</p>
              <p><strong>联系电话:</strong> {selectedRecord.customerPhone}</p>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <h3>销售信息</h3>
              <p><strong>销售价格:</strong> ¥{selectedRecord.salePrice}</p>
              <p><strong>销售日期:</strong> {selectedRecord.saleDate}</p>
              <p><strong>支付方式:</strong> <Tag color="blue">{selectedRecord.paymentMethod}</Tag></p>
            </div>
            {selectedRecord.notes && (
              <div>
                <h3>备注</h3>
                <p>{selectedRecord.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SalesRecordsPage;
