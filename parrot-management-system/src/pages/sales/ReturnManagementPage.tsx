import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Tag, Modal, message, Input, Row, Col, Statistic, Skeleton } from 'antd';
import { EyeOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { ParrotService } from '../../services/parrotService';
import type { SalesHistoryRecord } from '../../types/parrot';

const ReturnManagementPage: React.FC = () => {
  const [returnRecords, setReturnRecords] = useState<SalesHistoryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<SalesHistoryRecord | null>(null);
  const [statistics, setStatistics] = useState<{ return_count: number; return_rate: number } | null>(null);
  const [statisticsLoading, setStatisticsLoading] = useState(false);

  // 筛选条件
  const [filters, setFilters] = useState({
    keyword: '',
    page: 1,
    pageSize: 10,
  });
  const [total, setTotal] = useState(0);

  // 获取退货记录列表
  const fetchReturnRecords = async () => {
    try {
      setLoading(true);
      const response = await ParrotService.getSalesHistory({
        ...filters,
        has_return: true, // 只获取有退货记录的
      });
      setReturnRecords(response.data.items);
      setTotal(response.data.total);
    } catch (error: any) {
      console.error('Error fetching return records:', error);
      const errorMsg = error?.response?.data?.detail || error?.message || '获取退货记录失败';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // 获取统计数据
  const fetchStatistics = async () => {
    try {
      setStatisticsLoading(true);
      const response = await ParrotService.getReturnStatistics();
      setStatistics(response.data);
    } catch (error: any) {
      console.error('Error fetching statistics:', error);
      const errorMsg = error?.response?.data?.detail || error?.message || '获取统计数据失败';
      message.error(errorMsg);
    } finally {
      setStatisticsLoading(false);
    }
  };

  useEffect(() => {
    fetchReturnRecords();
    fetchStatistics();
  }, [filters]);

  const handleViewRecord = (record: SalesHistoryRecord) => {
    setSelectedRecord(record);
    setModalVisible(true);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const handleRefresh = () => {
    fetchReturnRecords();
    fetchStatistics();
  };

  const columns: ColumnsType<SalesHistoryRecord> = [
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
      title: '销售信息',
      key: 'saleInfo',
      render: (_, record) => (
        <div>
          <div>客户: {record.buyer_name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            价格: ¥{Number(record.sale_price).toFixed(2)}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            销售日期: {new Date(record.sale_date).toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      title: '退货信息',
      key: 'returnInfo',
      render: (_, record) => (
        <div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            退货日期: {record.return_date ? new Date(record.return_date).toLocaleDateString() : '-'}
          </div>
          <div style={{ marginTop: '4px' }}>
            <Tag color="var(--status-returned)">已退货</Tag>
          </div>
        </div>
      ),
    },
    {
      title: '退货原因',
      dataIndex: 'return_reason',
      key: 'return_reason',
      ellipsis: true,
      render: (reason) => reason || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
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
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="退货管理"
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
              刷新
            </Button>
          </Space>
        }
      >
        {/* 筛选区域 */}
        <div style={{ marginBottom: '16px', padding: '16px', background: 'var(--morandi-cloud)', borderRadius: '8px' }}>
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Input
                placeholder="搜索客户姓名或圈号"
                prefix={<SearchOutlined />}
                value={filters.keyword}
                onChange={(e) => handleFilterChange('keyword', e.target.value || undefined)}
                allowClear
              />
            </Col>
            <Col span={4}>
              <Button type="primary" icon={<SearchOutlined />} onClick={() => fetchReturnRecords()}>
                搜索
              </Button>
            </Col>
          </Row>
        </div>

        {/* 统计卡片 */}
        <div style={{ marginBottom: '16px' }}>
          <Row gutter={16}>
            <Col span={8}>
              <Card>
                {statisticsLoading ? (
                  <Skeleton active paragraph={{ rows: 1 }} />
                ) : (
                  <Statistic
                    title="退货数量"
                    value={statistics?.return_count || 0}
                    suffix="只"
                    valueStyle={{ color: 'var(--status-returned)' }}
                  />
                )}
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                {statisticsLoading ? (
                  <Skeleton active paragraph={{ rows: 1 }} />
                ) : (
                  <Statistic
                    title="退货率"
                    value={statistics?.return_rate || 0}
                    precision={2}
                    suffix="%"
                    valueStyle={{ color: 'var(--status-returned)' }}
                  />
                )}
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                {statisticsLoading ? (
                  <Skeleton active paragraph={{ rows: 1 }} />
                ) : (
                  <Statistic
                    title="状态"
                    value="正常"
                    valueStyle={{ color: 'var(--status-available)' }}
                  />
                )}
              </Card>
            </Col>
          </Row>
        </div>

        <Table
          columns={columns}
          dataSource={returnRecords}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
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
        title="退货记录详情"
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
              </Col>
              <Col span={12}>
                <h3 style={{ marginBottom: '12px', color: 'var(--morandi-slate)' }}>退货信息</h3>
                <p><strong>退货日期:</strong> {selectedRecord.return_date ? new Date(selectedRecord.return_date).toLocaleDateString() : '-'}</p>
                <p>
                  <strong>退货状态:</strong> <Tag color="var(--status-returned)">已退货</Tag>
                </p>
              </Col>
              <Col span={24}>
                {selectedRecord.return_reason && (
                  <div>
                    <h3 style={{ marginBottom: '12px', color: 'var(--morandi-slate)' }}>退货原因</h3>
                    <p style={{ padding: '12px', background: 'var(--morandi-cloud)', borderRadius: '4px' }}>
                      {selectedRecord.return_reason}
                    </p>
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

export default ReturnManagementPage;
