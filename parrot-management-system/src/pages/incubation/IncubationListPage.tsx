import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, Modal, message, Input, Select, DatePicker } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;
const { RangePicker } = DatePicker;

// 模拟孵化记录数据
const mockIncubationRecords = [
  {
    id: 1,
    motherId: 1,
    fatherId: 2,
    motherBreed: '玄凤',
    fatherBreed: '玄凤',
    startDate: '2024-11-01',
    expectedHatchDate: '2024-12-01',
    actualHatchDate: null,
    eggsCount: 3,
    hatchedCount: 0,
    status: 'incubating', // incubating, hatched, failed
    notes: '第一次孵化',
  },
  {
    id: 2,
    motherId: 3,
    fatherId: 4,
    motherBreed: '虎皮',
    fatherBreed: '虎皮',
    startDate: '2024-10-15',
    expectedHatchDate: '2024-11-15',
    actualHatchDate: '2024-11-16',
    eggsCount: 4,
    hatchedCount: 3,
    status: 'hatched',
    notes: '成功孵化3只雏鸟',
  },
];

const IncubationListPage: React.FC = () => {
  const [incubationRecords, setIncubationRecords] = useState(mockIncubationRecords);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  const handleAddIncubation = () => {
    message.info('添加孵化记录功能开发中...');
  };

  const handleViewRecord = (record: any) => {
    setSelectedRecord(record);
    setModalVisible(true);
  };

  const handleEditRecord = (record: any) => {
    message.info('编辑孵化记录功能开发中...');
  };

  const handleDeleteRecord = (record: any) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条孵化记录吗？',
      onOk: () => {
        message.success('删除成功');
      },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'incubating':
        return 'blue';
      case 'hatched':
        return 'green';
      case 'failed':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'incubating':
        return '孵化中';
      case 'hatched':
        return '已孵化';
      case 'failed':
        return '孵化失败';
      default:
        return status;
    }
  };

  const columns: ColumnsType<any> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '父鸟',
      dataIndex: 'fatherBreed',
      key: 'fatherBreed',
      render: (text, record) => `${text} (ID: ${record.fatherId})`,
    },
    {
      title: '母鸟',
      dataIndex: 'motherBreed',
      key: 'motherBreed',
      render: (text, record) => `${text} (ID: ${record.motherId})`,
    },
    {
      title: '开始日期',
      dataIndex: 'startDate',
      key: 'startDate',
    },
    {
      title: '预计孵化日期',
      dataIndex: 'expectedHatchDate',
      key: 'expectedHatchDate',
    },
    {
      title: '实际孵化日期',
      dataIndex: 'actualHatchDate',
      key: 'actualHatchDate',
      render: (date) => date || '-',
    },
    {
      title: '蛋数量',
      dataIndex: 'eggsCount',
      key: 'eggsCount',
      width: 100,
    },
    {
      title: '成功孵化数',
      dataIndex: 'hatchedCount',
      key: 'hatchedCount',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
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
        title="孵化列表"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddIncubation}
          >
            添加孵化记录
          </Button>
        }
      >
        {/* 筛选区域 */}
        <div style={{ marginBottom: '16px', padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
          <Space wrap>
            <Input placeholder="搜索配对..." style={{ width: 200 }} />
            <Select placeholder="状态" style={{ width: 150 }} allowClear>
              <Option value="incubating">孵化中</Option>
              <Option value="hatched">已孵化</Option>
              <Option value="failed">孵化失败</Option>
            </Select>
            <RangePicker placeholder={['开始日期', '结束日期']} />
            <Button type="primary">搜索</Button>
            <Button>重置</Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={incubationRecords}
          rowKey="id"
          loading={loading}
          pagination={{
            total: incubationRecords.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      {/* 查看详情模态框 */}
      <Modal
        title="孵化记录详情"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedRecord && (
          <div style={{ padding: '16px 0' }}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <p><strong>父鸟:</strong> {selectedRecord.fatherBreed} (ID: {selectedRecord.fatherId})</p>
                <p><strong>母鸟:</strong> {selectedRecord.motherBreed} (ID: {selectedRecord.motherId})</p>
                <p><strong>开始日期:</strong> {selectedRecord.startDate}</p>
                <p><strong>预计孵化日期:</strong> {selectedRecord.expectedHatchDate}</p>
              </Col>
              <Col span={12}>
                <p><strong>实际孵化日期:</strong> {selectedRecord.actualHatchDate || '-'}</p>
                <p><strong>蛋数量:</strong> {selectedRecord.eggsCount}</p>
                <p><strong>成功孵化数:</strong> {selectedRecord.hatchedCount}</p>
                <p><strong>状态:</strong> <Tag color={getStatusColor(selectedRecord.status)}>{getStatusText(selectedRecord.status)}</Tag></p>
              </Col>
            </Row>
            {selectedRecord.notes && (
              <div style={{ marginTop: '16px' }}>
                <p><strong>备注:</strong></p>
                <p>{selectedRecord.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default IncubationListPage;
