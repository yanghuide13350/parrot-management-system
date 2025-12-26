import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Tag, Modal, message, Input, Select, DatePicker, Row, Col, Form } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import moment from 'moment';
import { useParrot } from '../../context/ParrotContext';
import { IncubationService } from '../../services/incubationService';
import type {
  IncubationRecord,
  IncubationRecordCreate,
  IncubationRecordUpdate,
  IncubationFilterParams,
} from '../../services/incubationService';

const { Option } = Select;
const { RangePicker } = DatePicker;

const IncubationListPage: React.FC = () => {
  const [incubationRecords, setIncubationRecords] = useState<IncubationRecord[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<IncubationRecord | null>(null);
  const [filterParams, setFilterParams] = useState<IncubationFilterParams>({});
  const [form] = Form.useForm();
  const { parrots, loading: parrotsLoading, fetchParrots } = useParrot();

  // 获取孵化记录列表
  const fetchIncubationRecords = async (params?: IncubationFilterParams) => {
    try {
      const response = await IncubationService.getIncubationRecords(params);
      if (response.success) {
        setIncubationRecords(response.data.items);
      }
    } catch (error) {
      console.error('获取孵化记录失败:', error);
      message.error('获取孵化记录失败');
    }
  };

  // 页面加载时获取数据
  useEffect(() => {
    // 并行获取鹦鹉数据和孵化记录数据
    fetchParrots();
    fetchIncubationRecords(filterParams);
  }, []);

  // 筛选表单状态和处理函数
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<any>(null);

  const handleSearch = () => {
    const params: IncubationFilterParams = {};

    if (statusFilter) {
      params.status = statusFilter;
    }

    if (dateRange && dateRange.length === 2) {
      params.start_date_from = dateRange[0].format('YYYY-MM-DD');
      params.start_date_to = dateRange[1].format('YYYY-MM-DD');
    }

    if (searchText) {
      // 搜索父鸟或母鸟的圈号（使用 mother_ring_number 以匹配相同值的 OR 逻辑）
      params.father_ring_number = searchText;
      params.mother_ring_number = searchText;
    }

    setFilterParams(params);
    fetchIncubationRecords(params);
  };

  const handleReset = () => {
    setSearchText('');
    setStatusFilter(undefined);
    setDateRange(null);
    setFilterParams({});
    fetchIncubationRecords();
  };

  // 注意：移除了会导致无限循环的 useEffect
  // 鹦鹉数据已在页面加载时获取，无需重复获取

  const handleAddIncubation = () => {
    setAddModalVisible(true);
    form.resetFields();
  };

  // 父亲选择后自动带出母亲圈号
  const handleFatherChange = (fatherRingNumber: string) => {
    // 如果选择的是"未知"，则母亲也设为"未知"
    if (fatherRingNumber === 'unknown') {
      form.setFieldsValue({ motherRingNumber: 'unknown' });
      return;
    }

    // 根据父亲圈号查找鹦鹉对象
    const father = parrots.find(p => p.ring_number === fatherRingNumber);

    // 检查是否已配对（mate_id存在）
    if (father?.mate_id) {
      // 查找母亲鹦鹉
      const mother = parrots.find(p => p.id === father.mate_id);

      // 自动填充母亲圈号
      if (mother?.ring_number) {
        form.setFieldsValue({ motherRingNumber: mother.ring_number });
        message.success(`已自动填充母亲圈号: ${mother.ring_number}`);
      } else {
        // 找不到母亲圈号，设为未知
        form.setFieldsValue({ motherRingNumber: 'unknown' });
        message.info('未找到配对母亲的圈号，已设为未知');
      }
    } else {
      // 未配对，默认设置母亲为未知
      form.setFieldsValue({ motherRingNumber: 'unknown' });
      message.info('该父亲鹦鹉尚未配对，母亲已设为未知');
    }
  };

  const handleSubmitIncubation = async (values: any) => {
    try {
      // 计算预计孵化日期（开始日期+21天）
      const startDate = values.startDate.format('YYYY-MM-DD');
      const expectedDate = values.startDate.clone().add(21, 'days').format('YYYY-MM-DD');

      // 处理"未知"选项
      let fatherId: number | undefined;
      let motherId: number | undefined;

      if (values.fatherRingNumber !== 'unknown') {
        const father = parrots.find(p => p.ring_number === values.fatherRingNumber);
        if (!father) {
          message.error('未找到对应圈号的公鸟');
          return;
        }
        fatherId = father.id;
      }

      if (values.motherRingNumber !== 'unknown') {
        const mother = parrots.find(p => p.ring_number === values.motherRingNumber);
        if (!mother) {
          message.error('未找到对应圈号的母鸟');
          return;
        }
        motherId = mother.id;
      }

      // 使用API创建孵化记录
      const recordData: IncubationRecordCreate = {
        father_id: fatherId,
        mother_id: motherId,
        start_date: startDate,
        expected_hatch_date: expectedDate,
        eggs_count: values.eggsCount,
        hatched_count: 0,
        status: 'incubating',
        notes: values.notes || '',
      };

      const response = await IncubationService.createIncubationRecord(recordData);
      if (response.success) {
        message.success('添加孵化记录成功！');
        setAddModalVisible(false);
        form.resetFields();
        fetchIncubationRecords();
        fetchParrots();
      }
    } catch (error) {
      console.error('添加孵化记录失败:', error);
      message.error('添加孵化记录失败，请重试');
    }
  };

  const handleUpdateIncubation = async (values: any) => {
    try {
      if (!editingRecord) return;

      // 计算预计孵化日期（如果开始日期改变了）
      let expectedDate = values.startDate
        ? values.startDate.clone().add(21, 'days').format('YYYY-MM-DD')
        : undefined;

      // 处理"未知"选项
      let fatherId: number | undefined;
      let motherId: number | undefined;

      if (values.fatherRingNumber !== 'unknown') {
        const father = parrots.find(p => p.ring_number === values.fatherRingNumber);
        if (!father) {
          message.error('未找到对应圈号的公鸟');
          return;
        }
        fatherId = father.id;
      }

      if (values.motherRingNumber !== 'unknown') {
        const mother = parrots.find(p => p.ring_number === values.motherRingNumber);
        if (!mother) {
          message.error('未找到对应圈号的母鸟');
          return;
        }
        motherId = mother.id;
      }

      // 使用API更新孵化记录
      const updateData: IncubationRecordUpdate = {
        father_id: fatherId,
        mother_id: motherId,
        start_date: values.startDate ? values.startDate.format('YYYY-MM-DD') : undefined,
        expected_hatch_date: expectedDate,
        actual_hatch_date: values.actualHatchDate ? values.actualHatchDate.format('YYYY-MM-DD') : undefined,
        eggs_count: values.eggsCount,
        hatched_count: values.hatchedCount,
        status: values.status,
        notes: values.notes || '',
      };

      const response = await IncubationService.updateIncubationRecord(editingRecord.id, updateData);
      if (response.success) {
        message.success('更新孵化记录成功！');
        setEditModalVisible(false);
        setEditingRecord(null);
        form.resetFields();
        fetchIncubationRecords();
        fetchParrots();
      }
    } catch (error) {
      console.error('更新孵化记录失败:', error);
      message.error('更新孵化记录失败，请重试');
    }
  };

  const handleViewRecord = (record: any) => {
    setSelectedRecord(record);
    setModalVisible(true);
  };

  const handleEditRecord = (record: IncubationRecord) => {
    setEditingRecord(record);
    form.setFieldsValue({
      fatherRingNumber: record.father?.ring_number || 'unknown',
      motherRingNumber: record.mother?.ring_number || 'unknown',
      startDate: moment(record.start_date),
      eggsCount: record.eggs_count,
      status: record.status,
      actualHatchDate: record.actual_hatch_date ? moment(record.actual_hatch_date) : null,
      hatchedCount: record.hatched_count,
      notes: record.notes,
    });
    setEditModalVisible(true);
  };

  const handleDeleteRecord = (record: IncubationRecord) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条孵化记录吗？',
      centered: true,
      onOk: async () => {
        try {
          const response = await IncubationService.deleteIncubationRecord(record.id);
          if (response.success) {
            message.success('删除成功！');
            fetchIncubationRecords();
          }
        } catch (error) {
          console.error('删除孵化记录失败:', error);
          message.error('删除孵化记录失败，请重试');
        }
      },
    });
  };

  // 获取所有大于4个月的鹦鹉作为父母候选（与雏鸟管理保持一致）
  const getAllParrotsAsParents = () => {
    const fourMonthsAgo = new Date();
    fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);

    return parrots.filter(p => {
      // 如果没有出生日期，也允许作为父母候选
      if (!p.birth_date) return true;
      const birthDate = new Date(p.birth_date);
      return birthDate <= fourMonthsAgo;
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

  const columns: ColumnsType<IncubationRecord> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '父鸟',
      key: 'father',
      render: (_, record) => record.father ? `${record.father.breed} (圈号: ${record.father.ring_number || '无'})` : '未知',
    },
    {
      title: '母鸟',
      key: 'mother',
      render: (_, record) => record.mother ? `${record.mother.breed} (圈号: ${record.mother.ring_number || '无'})` : '未知',
    },
    {
      title: '开始日期',
      dataIndex: 'start_date',
      key: 'start_date',
      render: (date) => date,
    },
    {
      title: '预计孵化日期',
      dataIndex: 'expected_hatch_date',
      key: 'expected_hatch_date',
      render: (date) => date,
    },
    {
      title: '实际孵化日期',
      dataIndex: 'actual_hatch_date',
      key: 'actual_hatch_date',
      render: (date) => date || '-',
    },
    {
      title: '蛋数量',
      dataIndex: 'eggs_count',
      key: 'eggs_count',
      width: 100,
    },
    {
      title: '成功孵化数',
      dataIndex: 'hatched_count',
      key: 'hatched_count',
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
            <Input
              placeholder="搜索配对..."
              style={{ width: 200 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
            />
            <Select
              placeholder="状态"
              style={{ width: 150 }}
              allowClear
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="incubating">孵化中</Option>
              <Option value="hatched">已孵化</Option>
              <Option value="failed">孵化失败</Option>
            </Select>
            <RangePicker
              placeholder={['开始日期', '结束日期']}
              value={dateRange}
              onChange={setDateRange}
            />
            <Button type="primary" onClick={handleSearch}>搜索</Button>
            <Button onClick={handleReset}>重置</Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={incubationRecords}
          rowKey="id"
          loading={parrotsLoading}
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
              <Select
                placeholder={parrotsLoading ? "加载中..." : "请选择父亲"}
                showSearch
                optionFilterProp="children"
                onChange={handleFatherChange}
                loading={parrotsLoading}
                disabled={parrotsLoading}
              >
                <Option key="unknown-father" value="unknown">未知</Option>
                {!parrotsLoading && getAllParrotsAsParents()
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
              <Select
                placeholder={parrotsLoading ? "加载中..." : "请选择母亲"}
                showSearch
                optionFilterProp="children"
                loading={parrotsLoading}
                disabled={parrotsLoading}
              >
                <Option key="unknown-mother" value="unknown">未知</Option>
                {!parrotsLoading && getAllParrotsAsParents()
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
              <Select
                placeholder={parrotsLoading ? "加载中..." : "请选择父亲"}
                showSearch
                optionFilterProp="children"
                onChange={handleFatherChange}
                loading={parrotsLoading}
                disabled={parrotsLoading}
              >
                <Option key="unknown-father-edit" value="unknown">未知</Option>
                {!parrotsLoading && getAllParrotsAsParents()
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
              <Select
                placeholder={parrotsLoading ? "加载中..." : "请选择母亲"}
                showSearch
                optionFilterProp="children"
                loading={parrotsLoading}
                disabled={parrotsLoading}
              >
                <Option key="unknown-mother-edit" value="unknown">未知</Option>
                {!parrotsLoading && getAllParrotsAsParents()
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
