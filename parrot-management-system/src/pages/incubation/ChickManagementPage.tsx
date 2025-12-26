import React, { useState, useEffect, useMemo } from 'react';
import { Card, Table, Button, Space, Tag, Modal, Input, Select } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useParrot } from '../../context/ParrotContext';

const { Option } = Select;

const ChickManagementPage: React.FC = () => {
  const { parrots, loading, fetchParrots } = useParrot();
  
  // 筛选出生日期小于6个月的鹦鹉作为雏鸟
  const chicks = useMemo(() => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    return parrots.filter(p => {
      if (!p.birth_date) return false;
      const birthDate = new Date(p.birth_date);
      return birthDate > sixMonthsAgo;
    }).map(p => ({
      id: p.id,
      hatchDate: p.birth_date,
      breed: p.breed,
      gender: p.gender,
      ringNumber: p.ring_number || '-',
      status: p.status,
      healthNotes: p.health_notes || '-',
    }));
  }, [parrots]);

  // 页面加载时获取数据
  useEffect(() => {
    fetchParrots();
  }, []);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedChick, setSelectedChick] = useState<any>(null);
  
  // 筛选状态
  const [searchText, setSearchText] = useState('');
  const [breedFilter, setBreedFilter] = useState<string | undefined>();
  const [genderFilter, setGenderFilter] = useState<string | undefined>();

  // 筛选后的数据
  const filteredChicks = useMemo(() => {
    return chicks.filter(chick => {
      if (searchText && !chick.ringNumber?.toLowerCase().includes(searchText.toLowerCase())) {
        return false;
      }
      if (breedFilter && chick.breed !== breedFilter) {
        return false;
      }
      if (genderFilter && chick.gender !== genderFilter) {
        return false;
      }
      return true;
    });
  }, [chicks, searchText, breedFilter, genderFilter]);

  const handleReset = () => {
    setSearchText('');
    setBreedFilter(undefined);
    setGenderFilter(undefined);
  };

  const handleViewChick = (chick: any) => {
    setSelectedChick(chick);
    setModalVisible(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'green';
      case 'sold':
        return 'red';
      case 'breeding':
        return 'blue';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return '可售';
      case 'sold':
        return '已售';
      case 'breeding':
        return '繁殖中';
      case 'paired':
        return '已配对';
      default:
        return status;
    }
  };

  // 获取所有品种
  const breeds = useMemo(() => {
    const breedSet = new Set(chicks.map(c => c.breed));
    return Array.from(breedSet);
  }, [chicks]);

  const columns: ColumnsType<any> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: '出生日期',
      dataIndex: 'hatchDate',
      key: 'hatchDate',
      width: 120,
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
    },
    {
      title: '圈号',
      dataIndex: 'ringNumber',
      key: 'ringNumber',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '健康备注',
      dataIndex: 'healthNotes',
      key: 'healthNotes',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
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
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="雏鸟管理"
        extra={
          <span style={{ color: '#888', fontSize: '14px' }}>
            显示出生日期小于6个月的鹦鹉
          </span>
        }
      >
        {/* 筛选区域 */}
        <div style={{ marginBottom: '16px', padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
          <Space wrap>
            <Input 
              placeholder="搜索圈号..." 
              style={{ width: 200 }} 
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Select 
              placeholder="品种" 
              style={{ width: 150 }} 
              allowClear
              value={breedFilter}
              onChange={setBreedFilter}
            >
              {breeds.map(breed => (
                <Option key={breed} value={breed}>{breed}</Option>
              ))}
            </Select>
            <Select 
              placeholder="性别" 
              style={{ width: 120 }} 
              allowClear
              value={genderFilter}
              onChange={setGenderFilter}
            >
              <Option value="公">公</Option>
              <Option value="母">母</Option>
              <Option value="未验卡">未验卡</Option>
            </Select>
            <Button onClick={handleReset}>重置</Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredChicks}
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredChicks.length,
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
            <p><strong>出生日期:</strong> {selectedChick.hatchDate}</p>
            <p><strong>品种:</strong> {selectedChick.breed}</p>
            <p><strong>性别:</strong> {selectedChick.gender}</p>
            <p><strong>圈号:</strong> {selectedChick.ringNumber}</p>
            <p><strong>状态:</strong> <Tag color={getStatusColor(selectedChick.status)}>{getStatusText(selectedChick.status)}</Tag></p>
            <p><strong>健康备注:</strong> {selectedChick.healthNotes}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ChickManagementPage;
