import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, Modal, message, Input, Select, Form, DatePicker } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import moment from 'moment';
import { useParrot } from '../../context/ParrotContext';

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
  const [loading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedChick, setSelectedChick] = useState<any>(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingChick, setEditingChick] = useState<any>(null);
  const [form] = Form.useForm();
  const { parrots } = useParrot();

  const handleAddChick = () => {
    setAddModalVisible(true);
    form.resetFields();
  };

  const handleSubmitChick = async (values: any) => {
    try {
      // 通过圈号查找父母鸟
      const father = parrots.find(p => p.ring_number === values.fatherRingNumber);
      const mother = parrots.find(p => p.ring_number === values.motherRingNumber);

      if (!father) {
        message.error('未找到对应圈号的公鸟');
        return;
      }
      if (!mother) {
        message.error('未找到对应圈号的母鸟');
        return;
      }

      // 生成新的雏鸟记录
      const newChick = {
        id: chicks.length + 1,
        incubationId: values.incubationId || 1,
        hatchDate: values.hatchDate?.format('YYYY-MM-DD') || new Date().toISOString().split('T')[0],
        breed: values.breed,
        gender: values.gender,
        ringNumber: values.ringNumber,
        weight: values.weight,
        healthStatus: values.healthStatus,
        parentIds: [father.id, mother.id],
        parentRingNumbers: [values.fatherRingNumber, values.motherRingNumber],
        notes: values.notes || '',
      };

      setChicks([...chicks, newChick]);
      message.success('添加雏鸟成功！');
      setAddModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('添加雏鸟失败:', error);
      message.error('添加雏鸟失败，请重试');
    }
  };

  const handleUpdateChick = async (values: any) => {
    try {
      if (!editingChick) return;

      // 通过圈号查找父母鸟
      const father = parrots.find(p => p.ring_number === values.fatherRingNumber);
      const mother = parrots.find(p => p.ring_number === values.motherRingNumber);

      if (!father) {
        message.error('未找到对应圈号的公鸟');
        return;
      }
      if (!mother) {
        message.error('未找到对应圈号的母鸟');
        return;
      }

      // 更新雏鸟记录
      const updatedChick = {
        ...editingChick,
        incubationId: values.incubationId || editingChick.incubationId,
        hatchDate: values.hatchDate?.format('YYYY-MM-DD') || editingChick.hatchDate,
        breed: values.breed,
        gender: values.gender,
        ringNumber: values.ringNumber,
        weight: values.weight,
        healthStatus: values.healthStatus,
        parentIds: [father.id, mother.id],
        parentRingNumbers: [values.fatherRingNumber, values.motherRingNumber],
        notes: values.notes || '',
      };

      const updatedChicks = chicks.map(c => c.id === editingChick.id ? updatedChick : c);
      setChicks(updatedChicks);
      message.success('更新雏鸟成功！');
      setEditModalVisible(false);
      setEditingChick(null);
      form.resetFields();
    } catch (error) {
      console.error('更新雏鸟失败:', error);
      message.error('更新雏鸟失败，请重试');
    }
  };

  // 获取所有大于4个月的鹦鹉作为父母候选
  const getAllParrotsAsParents = () => {
    const fourMonthsAgo = new Date();
    fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);

    return parrots.filter(p => {
      if (!p.birth_date) return false;
      const birthDate = new Date(p.birth_date);
      return birthDate <= fourMonthsAgo;
    });
  };

  const handleViewChick = (chick: any) => {
    setSelectedChick(chick);
    setModalVisible(true);
  };

  const handleEditChick = (chick: any) => {
    setEditingChick(chick);
    form.setFieldsValue({
      breed: chick.breed,
      gender: chick.gender,
      ringNumber: chick.ringNumber,
      weight: chick.weight,
      healthStatus: chick.healthStatus,
      hatchDate: moment(chick.hatchDate),
      fatherRingNumber: chick.parentRingNumbers?.[0] || chick.parentIds?.[0],
      motherRingNumber: chick.parentRingNumbers?.[1] || chick.parentIds?.[1],
      incubationId: chick.incubationId,
      notes: chick.notes,
    });
    setEditModalVisible(true);
  };

  const handleDeleteChick = (chick: any) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条雏鸟记录吗？',
      centered: true,
      onOk: () => {
        setChicks(chicks.filter(c => c.id !== chick.id));
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
      title: '父母圈号',
      key: 'parentRingNumbers',
      width: 150,
      render: (record: any) => {
        if (record.parentRingNumbers) {
          return record.parentRingNumbers.join(', ');
        }
        // 如果没有圈号数据，则显示ID
        return record.parentIds.join(', ');
      },
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
            <p><strong>父母圈号:</strong> {selectedChick.parentRingNumbers?.join(', ') || selectedChick.parentIds.join(', ')}</p>
            {selectedChick.notes && (
              <div style={{ marginTop: '16px' }}>
                <p><strong>备注:</strong></p>
                <p>{selectedChick.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* 添加雏鸟模态框 */}
      <Modal
        title="添加雏鸟"
        open={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitChick}
          initialValues={{
            healthStatus: '健康',
            hatchDate: moment(),
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              label="品种"
              name="breed"
              rules={[{ required: true, message: '请输入品种' }]}
            >
              <Input placeholder="请输入品种" />
            </Form.Item>

            <Form.Item
              label="性别"
              name="gender"
              rules={[{ required: true, message: '请选择性别' }]}
            >
              <Select placeholder="请选择性别">
                <Option value="公">公</Option>
                <Option value="母">母</Option>
                <Option value="未验卡">未验卡</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="圈号"
              name="ringNumber"
              rules={[{ required: true, message: '请输入圈号' }]}
            >
              <Input placeholder="请输入圈号" />
            </Form.Item>

            <Form.Item
              label="体重(g)"
              name="weight"
              rules={[{ required: true, message: '请输入体重' }]}
            >
              <Input type="number" placeholder="请输入体重" min="0" step="0.1" />
            </Form.Item>

            <Form.Item
              label="健康状况"
              name="healthStatus"
              rules={[{ required: true, message: '请选择健康状况' }]}
            >
              <Select placeholder="请选择健康状况">
                <Option value="健康">健康</Option>
                <Option value="轻微感冒">轻微感冒</Option>
                <Option value="生病">生病</Option>
                <Option value="其他">其他</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="出壳日期"
              name="hatchDate"
              rules={[{ required: true, message: '请选择出壳日期' }]}
            >
              <DatePicker style={{ width: '100%' }} placeholder="请选择出壳日期" />
            </Form.Item>

            <Form.Item
              label="父亲圈号"
              name="fatherRingNumber"
              rules={[{ required: true, message: '请选择父亲' }]}
            >
              <Select placeholder="请选择父亲" showSearch optionFilterProp="children">
                {getAllParrotsAsParents()
                  .filter(p => p.gender === '公')
                  .map(parrot => (
                    <Option key={parrot.id} value={parrot.ring_number}>
                      {parrot.breed} (圈号: {parrot.ring_number || '无'})
                    </Option>
                  ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="母亲圈号"
              name="motherRingNumber"
              rules={[{ required: true, message: '请选择母亲' }]}
            >
              <Select placeholder="请选择母亲" showSearch optionFilterProp="children">
                {getAllParrotsAsParents()
                  .filter(p => p.gender === '母')
                  .map(parrot => (
                    <Option key={parrot.id} value={parrot.ring_number}>
                      {parrot.breed} (圈号: {parrot.ring_number || '无'})
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            label="孵化记录ID"
            name="incubationId"
          >
            <Input type="number" placeholder="请输入孵化记录ID（可选）" />
          </Form.Item>

          <Form.Item
            label="备注"
            name="notes"
          >
            <Input.TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setAddModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                添加雏鸟
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑雏鸟模态框 */}
      <Modal
        title="编辑雏鸟"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingChick(null);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateChick}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              label="品种"
              name="breed"
              rules={[{ required: true, message: '请输入品种' }]}
            >
              <Input placeholder="请输入品种" />
            </Form.Item>

            <Form.Item
              label="性别"
              name="gender"
              rules={[{ required: true, message: '请选择性别' }]}
            >
              <Select placeholder="请选择性别">
                <Option value="公">公</Option>
                <Option value="母">母</Option>
                <Option value="未验卡">未验卡</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="圈号"
              name="ringNumber"
              rules={[{ required: true, message: '请输入圈号' }]}
            >
              <Input placeholder="请输入圈号" />
            </Form.Item>

            <Form.Item
              label="体重(g)"
              name="weight"
              rules={[{ required: true, message: '请输入体重' }]}
            >
              <Input type="number" placeholder="请输入体重" min="0" step="0.1" />
            </Form.Item>

            <Form.Item
              label="健康状况"
              name="healthStatus"
              rules={[{ required: true, message: '请选择健康状况' }]}
            >
              <Select placeholder="请选择健康状况">
                <Option value="健康">健康</Option>
                <Option value="轻微感冒">轻微感冒</Option>
                <Option value="生病">生病</Option>
                <Option value="其他">其他</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="出壳日期"
              name="hatchDate"
              rules={[{ required: true, message: '请选择出壳日期' }]}
            >
              <DatePicker style={{ width: '100%' }} placeholder="请选择出壳日期" />
            </Form.Item>

            <Form.Item
              label="父亲圈号"
              name="fatherRingNumber"
              rules={[{ required: true, message: '请选择父亲' }]}
            >
              <Select placeholder="请选择父亲" showSearch optionFilterProp="children">
                {getAllParrotsAsParents()
                  .filter(p => p.gender === '公')
                  .map(parrot => (
                    <Option key={parrot.id} value={parrot.ring_number}>
                      {parrot.breed} (圈号: {parrot.ring_number || '无'})
                    </Option>
                  ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="母亲圈号"
              name="motherRingNumber"
              rules={[{ required: true, message: '请选择母亲' }]}
            >
              <Select placeholder="请选择母亲" showSearch optionFilterProp="children">
                {getAllParrotsAsParents()
                  .filter(p => p.gender === '母')
                  .map(parrot => (
                    <Option key={parrot.id} value={parrot.ring_number}>
                      {parrot.breed} (圈号: {parrot.ring_number || '无'})
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            label="孵化记录ID"
            name="incubationId"
          >
            <Input type="number" placeholder="请输入孵化记录ID（可选）" />
          </Form.Item>

          <Form.Item
            label="备注"
            name="notes"
          >
            <Input.TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setEditModalVisible(false);
                setEditingChick(null);
                form.resetFields();
              }}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                更新雏鸟
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ChickManagementPage;
