import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, Modal, message, Input, Select, Tooltip } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;

// 模拟雏鸟数据
const mockChicks = [
  {
    id: 1,
    incubationId: 2,
    hatchDate: '2024-11-16',
    breed: '虎皮',
    gender: '公',
    ringNumber: 'CP001',
    weight: 15.5,
    healthStatus: '健康',
    parentIds: [3, 4],
    notes: '非常活泼',
  },
  {
    id: 2,
    incubationId: 2,
    hatchDate: '2024-11-16',
    breed: '虎皮',
    gender: '母',
    ringNumber: 'CP002',
    weight: 14.8,
    healthStatus: '健康',
    parentIds: [3, 4],
    notes: '稍显安静',
  },
  {
    id: 3,
    incubationId: 2,
    hatchDate: '2024-11-16',
    breed: '虎皮',
    gender: '公',
    ringNumber: 'CP003',
    weight: 15.2,
    healthStatus: '轻微感冒',
    parentIds: [3, 4],
    notes: '需要额外关注',
  },
];

const ChickManagementPage: React.FC = () => {
  const [chicks, setChicks] = useState(mockChicks);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedChick, setSelectedChick] = useState<any>(null);

  const handleAddChick = () => {
    message.info('添加雏鸟记录功能开发中...');
  };

  const handleViewChick = (chick: any) => {
    setSelectedChick(chick);
    setModalVisible(true);
  };

  const handleEditChick = (chick: any) => {
    message.info('编辑雏鸟记录功能开发中...');
  };

  const handleDeleteChick = (chick: any) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条雏鸟记录吗？',
      centered: true,
      onOk: () => {
        message.success('删除成功');
      },
    });
  };

  const getGenderText = (gender: string) => {
    switch (gender) {
      case '公':
        return '公';
      case '母':
        return '母';
      default:
        return gender;
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case '健康':
        return 'green';
      case '轻微感冒':
        return 'orange';
      case '生病':
        return 'red';
      default:
        return 'default';
    }
  };

  const columns: ColumnsType<any> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: '孵化记录ID',
      dataIndex: 'incubationId',
      key: 'incubationId',
      width: 100,
    },
    {
      title: '出壳日期',
      dataIndex: 'hatchDate',
      key: 'hatchDate',
      width: 100,
    },
    {
      title: '品种',
      dataIndex: 'breed',
      key: 'breed',
      width: 100,
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      width: 80,
      render: (gender) => getGenderText(gender),
    },
    {
      title: '圈号',
      dataIndex: 'ringNumber',
      key: 'ringNumber',
      width: 100,
    },
    {
      title: '体重(g)',
      dataIndex: 'weight',
      key: 'weight',
      width: 80,
    },
    {
      title: '健康状况',
      dataIndex: 'healthStatus',
      key: 'healthStatus',
      width: 100,
      render: (status) => (
        <Tag color={getHealthStatusColor(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: '父母ID',
      dataIndex: 'parentIds',
      key: 'parentIds',
      width: 100,
      render: (ids: number[]) => ids.join(', '),
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
      width: 280,
      render: (_, record) => (
        <Space size={4}>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewChick(record)}
            style={{ padding: '0 4px' }}
          >
            查看
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditChick(record)}
            style={{ padding: '0 4px' }}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteChick(record)}
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
        title="雏鸟管理"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddChick}
          >
            添加雏鸟
          </Button>
        }
      >
        {/* 筛选区域 */}
        <div style={{ marginBottom: '16px', padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
          <Space wrap>
            <Input placeholder="搜索圈号..." style={{ width: 200 }} />
            <Select placeholder="品种" style={{ width: 150 }} allowClear>
              <Option value="玄凤">玄凤</Option>
              <Option value="虎皮">虎皮</Option>
              <Option value="牡丹">牡丹</Option>
            </Select>
            <Select placeholder="性别" style={{ width: 120 }} allowClear>
              <Option value="公">公</Option>
              <Option value="母">母</Option>
            </Select>
            <Select placeholder="健康状况" style={{ width: 150 }} allowClear>
              <Option value="健康">健康</Option>
              <Option value="轻微感冒">轻微感冒</Option>
              <Option value="生病">生病</Option>
            </Select>
            <Button type="primary">搜索</Button>
            <Button>重置</Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={chicks}
          rowKey="id"
          loading={loading}
          pagination={{
            total: chicks.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      {/* 查看详情模态框 */}
      <Modal
        title="雏鸟详情"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedChick && (
          <div style={{ padding: '16px 0' }}>
            <p><strong>ID:</strong> {selectedChick.id}</p>
            <p><strong>孵化记录ID:</strong> {selectedChick.incubationId}</p>
            <p><strong>出壳日期:</strong> {selectedChick.hatchDate}</p>
            <p><strong>品种:</strong> {selectedChick.breed}</p>
            <p><strong>性别:</strong> {getGenderText(selectedChick.gender)}</p>
            <p><strong>圈号:</strong> {selectedChick.ringNumber}</p>
            <p><strong>体重:</strong> {selectedChick.weight}g</p>
            <p><strong>健康状况:</strong> <Tag color={getHealthStatusColor(selectedChick.healthStatus)}>{selectedChick.healthStatus}</Tag></p>
            <p><strong>父母ID:</strong> {selectedChick.parentIds.join(', ')}</p>
            {selectedChick.notes && (
              <div style={{ marginTop: '16px' }}>
                <p><strong>备注:</strong></p>
                <p>{selectedChick.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ChickManagementPage;
