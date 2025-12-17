import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, Modal, message, Input, Select, DatePicker, Row, Col, Form } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import moment from 'moment';
import { useParrot } from '../../context/ParrotContext';

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
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [form] = Form.useForm();
  const { parrots, updateStatus, fetchParrots } = useParrot();

  const handleAddIncubation = () => {
    setAddModalVisible(true);
    form.resetFields();
  };

  const handleSubmitIncubation = async (values: any) => {
    try {
      // 计算预计孵化日期（开始日期+21天）
      const startDate = values.startDate.format('YYYY-MM-DD');
      const expectedDate = values.startDate.clone().add(21, 'days').format('YYYY-MM-DD');

      // 通过圈号查找父鸟和母鸟信息
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

      const newRecord = {
        id: incubationRecords.length + 1,
        motherId: mother.id,
        fatherId: father.id,
        motherRingNumber: values.motherRingNumber,
        fatherRingNumber: values.fatherRingNumber,
        motherBreed: mother?.breed || '未知',
        fatherBreed: father?.breed || '未知',
        startDate: startDate,
        expectedHatchDate: expectedDate,
        actualHatchDate: null,
        eggsCount: values.eggsCount,
        hatchedCount: 0,
        status: 'incubating',
        notes: values.notes || '',
      };

      setIncubationRecords([...incubationRecords, newRecord]);

      // 更新鹦鹉状态为孵化中
      await updateStatus(father.id, 'incubating');
      await updateStatus(mother.id, 'incubating');

      message.success('添加孵化记录成功！');
      setAddModalVisible(false);
      form.resetFields();

      // 刷新鹦鹉列表
      fetchParrots();
    } catch (error) {
      console.error('添加孵化记录失败:', error);
      message.error('添加孵化记录失败，请重试');
    }
  };

  const handleUpdateIncubation = async (values: any) => {
    try {
      if (!editingRecord) return;

      // 计算预计孵化日期（如果开始日期改变了）
      let expectedDate = editingRecord.expectedHatchDate;
      if (values.startDate) {
        expectedDate = values.startDate.clone().add(21, 'days').format('YYYY-MM-DD');
      }

      // 通过圈号查找父鸟和母鸟信息
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

      const updatedRecord = {
        ...editingRecord,
        motherId: mother.id,
        fatherId: father.id,
        motherRingNumber: values.motherRingNumber,
        fatherRingNumber: values.fatherRingNumber,
        motherBreed: mother?.breed || editingRecord.motherBreed,
        fatherBreed: father?.breed || editingRecord.fatherBreed,
        startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : editingRecord.startDate,
        expectedHatchDate: expectedDate,
        eggsCount: values.eggsCount,
        status: values.status,
        actualHatchDate: values.actualHatchDate ? values.actualHatchDate.format('YYYY-MM-DD') : null,
        hatchedCount: values.hatchedCount,
        notes: values.notes || '',
      };

      const updatedRecords = incubationRecords.map(r => r.id === editingRecord.id ? updatedRecord : r);
      setIncubationRecords(updatedRecords);

      // 如果状态从孵化中变为其他状态，更新鹦鹉状态为breeding
      if (editingRecord.status === 'incubating' && values.status !== 'incubating') {
        await updateStatus(father.id, 'breeding');
        await updateStatus(mother.id, 'breeding');
      }

      message.success('更新孵化记录成功！');
      setEditModalVisible(false);
      setEditingRecord(null);
      form.resetFields();

      // 刷新鹦鹉列表
      fetchParrots();
    } catch (error) {
      console.error('更新孵化记录失败:', error);
      message.error('更新孵化记录失败，请重试');
    }
  };

  const handleViewRecord = (record: any) => {
    setSelectedRecord(record);
    setModalVisible(true);
  };

  const handleEditRecord = (record: any) => {
    setEditingRecord(record);
    form.setFieldsValue({
      fatherRingNumber: record.fatherRingNumber || record.fatherId,
      motherRingNumber: record.motherRingNumber || record.motherId,
      startDate: moment(record.startDate),
      eggsCount: record.eggsCount,
      status: record.status,
      actualHatchDate: record.actualHatchDate ? moment(record.actualHatchDate) : null,
      hatchedCount: record.hatchedCount,
      notes: record.notes,
    });
    setEditModalVisible(true);
  };

  const handleDeleteRecord = (record: any) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条孵化记录吗？',
      centered: true,
      onOk: async () => {
        setIncubationRecords(incubationRecords.filter(r => r.id !== record.id));

        // 通过圈号查找鹦鹉并更新状态
        const father = parrots.find(p => p.ring_number === (record.fatherRingNumber || record.fatherId));
        const mother = parrots.find(p => p.ring_number === (record.motherRingNumber || record.motherId));

        if (father) {
          await updateStatus(father.id, 'breeding');
        }
        if (mother) {
          await updateStatus(mother.id, 'breeding');
        }

        message.success('删除成功');

        // 刷新鹦鹉列表
        fetchParrots();
      },
    });
  };

  // 获取已配对且状态为breeding的鹦鹉作为候选父母
  const getPairedParrots = () => {
    return parrots.filter(p => p.mate_id && p.status === 'breeding');
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
      render: (text, record) => `${text} (圈号: ${record.fatherRingNumber || record.fatherId})`,
    },
    {
      title: '母鸟',
      dataIndex: 'motherBreed',
      key: 'motherBreed',
      render: (text, record) => `${text} (圈号: ${record.motherRingNumber || record.motherId})`,
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
                <p><strong>父鸟:</strong> {selectedRecord.fatherBreed} (圈号: {selectedRecord.fatherRingNumber || selectedRecord.fatherId})</p>
                <p><strong>母鸟:</strong> {selectedRecord.motherBreed} (圈号: {selectedRecord.motherRingNumber || selectedRecord.motherId})</p>
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

      {/* 添加孵化记录模态框 */}
      <Modal
        title="添加孵化记录"
        open={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitIncubation}
          initialValues={{
            status: 'incubating',
            startDate: moment(),
            eggsCount: 2,
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              label="父亲圈号"
              name="fatherRingNumber"
              rules={[{ required: true, message: '请输入父亲圈号' }]}
            >
              <Select placeholder="请选择父亲" showSearch optionFilterProp="children">
                {getPairedParrots()
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
              rules={[{ required: true, message: '请输入母亲圈号' }]}
            >
              <Select placeholder="请选择母亲" showSearch optionFilterProp="children">
                {getPairedParrots()
                  .filter(p => p.gender === '母')
                  .map(parrot => (
                    <Option key={parrot.id} value={parrot.ring_number}>
                      {parrot.breed} (圈号: {parrot.ring_number || '无'})
                    </Option>
                  ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="开始日期"
              name="startDate"
              rules={[{ required: true, message: '请选择开始日期' }]}
            >
              <DatePicker style={{ width: '100%' }} placeholder="请选择开始日期" />
            </Form.Item>

            <Form.Item
              label="蛋数量"
              name="eggsCount"
              rules={[{ required: true, message: '请输入蛋数量' }]}
            >
              <Input type="number" placeholder="请输入蛋数量" min="1" max="10" />
            </Form.Item>
          </div>

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
                添加记录
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑孵化记录模态框 */}
      <Modal
        title="编辑孵化记录"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingRecord(null);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateIncubation}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              label="父亲圈号"
              name="fatherRingNumber"
              rules={[{ required: true, message: '请输入父亲圈号' }]}
            >
              <Select placeholder="请选择父亲" showSearch optionFilterProp="children">
                {getPairedParrots()
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
              rules={[{ required: true, message: '请输入母亲圈号' }]}
            >
              <Select placeholder="请选择母亲" showSearch optionFilterProp="children">
                {getPairedParrots()
                  .filter(p => p.gender === '母')
                  .map(parrot => (
                    <Option key={parrot.id} value={parrot.ring_number}>
                      {parrot.breed} (圈号: {parrot.ring_number || '无'})
                    </Option>
                  ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="开始日期"
              name="startDate"
            >
              <DatePicker style={{ width: '100%' }} placeholder="请选择开始日期" />
            </Form.Item>

            <Form.Item
              label="蛋数量"
              name="eggsCount"
              rules={[{ required: true, message: '请输入蛋数量' }]}
            >
              <Input type="number" placeholder="请输入蛋数量" min="1" max="10" />
            </Form.Item>

            <Form.Item
              label="状态"
              name="status"
              rules={[{ required: true, message: '请选择状态' }]}
            >
              <Select placeholder="请选择状态">
                <Option value="incubating">孵化中</Option>
                <Option value="hatched">已孵化</Option>
                <Option value="failed">孵化失败</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="实际孵化日期"
              name="actualHatchDate"
            >
              <DatePicker style={{ width: '100%' }} placeholder="请选择实际孵化日期" />
            </Form.Item>

            <Form.Item
              label="成功孵化数"
              name="hatchedCount"
            >
              <Input type="number" placeholder="请输入成功孵化数" min="0" />
            </Form.Item>
          </div>

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
                setEditingRecord(null);
                form.resetFields();
              }}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                更新记录
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default IncubationListPage;
