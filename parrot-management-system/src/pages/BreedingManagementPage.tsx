import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Space, Card, Tag, Modal, message, Input, Select, InputNumber } from 'antd';
import { HeartOutlined, EyeOutlined, DeleteOutlined, DisconnectOutlined, SearchOutlined } from '@ant-design/icons';
import { useParrot } from '../context/ParrotContext';
import { api } from '../services/api';
import type { Parrot } from '../types/parrot';
import ParrotDetail from '../components/ParrotDetail';
import { calculateAge } from '../utils/dateUtils';

const { Option } = Select;

const BreedingManagementPage = () => {
  const navigate = useNavigate();
  const {
    parrots,
    loading,
    total,
    page,
    pageSize,
    filters,
    fetchParrots,
    setFilters,
    clearFilters,
    setPage,
    setPageSize,
    // updateStatus,
  } = useParrot();

  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedMaleBreeding, setSelectedMaleBreeding] = useState<Parrot | null>(null);
  const [compatibleFemales, setCompatibleFemales] = useState<Parrot[]>([]);
  const [showFemalesModal, setShowFemalesModal] = useState(false);
  const [selectedParrot, setSelectedParrotLocal] = useState<Parrot | null>(null);
  // 新增：母鸟配对相关状态
  const [selectedFemaleBreeding, setSelectedFemaleBreeding] = useState<Parrot | null>(null);
  const [compatibleMales, setCompatibleMales] = useState<Parrot[]>([]);
  const [showMalesModal, setShowMalesModal] = useState(false);
  // 新增：孵化相关状态
  const [selectedPairedParrot, setSelectedPairedParrot] = useState<Parrot | null>(null);
  const [showIncubationModal, setShowIncubationModal] = useState(false);
  const [eggCount, setEggCount] = useState<number>(2);

  // 查询条件状态
  const [searchText, setSearchText] = useState('');
  const [selectedBreed, setSelectedBreed] = useState<string>();
  const [selectedGender, setSelectedGender] = useState<string>();
  const [pairingStatus, setPairingStatus] = useState<string>();

  // Minimum age for breeding (in days) - 1 year
  // const MIN_BREEDING_AGE_DAYS = 365;

  useEffect(() => {
    // Only show breeding birds while on this page
    setFilters({ status: 'breeding' });
    setIsInitialized(true);

    return () => {
      setIsInitialized(false);
      clearFilters();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }
    fetchParrots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, filters, isInitialized]);

  // 筛选配对状态的辅助函数
  const filterParrotsByPairingStatus = (parrots: Parrot[]) => {
    if (!pairingStatus) {
      return parrots;
    }
    if (pairingStatus === 'paired') {
      return parrots.filter(p => p.mate_id);
    } else if (pairingStatus === 'unpaired') {
      return parrots.filter(p => !p.mate_id);
    }
    return parrots;
  };

  // 监听配对状态变化，自动刷新数据
  useEffect(() => {
    if (isInitialized) {
      // 触发重新渲染
      fetchParrots();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pairingStatus]);

  const handleViewDetail = (parrot: Parrot) => {
    setSelectedParrotLocal(parrot);
    setIsDetailVisible(true);
  };

  // const handlePromoteToBreeding = async (parrot: Parrot) => {
  //   try {
  //     await updateStatus(parrot.id, 'breeding');
  //     message.success(`${parrot.breed}已设置为种鸟`);
  //     fetchParrots();
  //   } catch (error) {
  //     message.error('设置失败');
  //   }
  // };

  const handleViewCompatibleFemales = async (maleParrot: Parrot) => {
    try {
      // Check if male is already paired
      if (maleParrot.mate_id) {
        message.warning('该公鹦鹉已经配对，无法再次配对');
        return;
      }
      // Fetch all eligible females from API (not limited by breed)
      const females = await api.get<Parrot[]>(`/parrots/eligible-females/${maleParrot.id}`);
      setSelectedMaleBreeding(maleParrot);
      setCompatibleFemales(females);
      setShowFemalesModal(true);
    } catch (error) {
      console.error('Failed to fetch eligible females:', error);
      message.error('获取可配对母鸟失败');
    }
  };

  // 新增：为母鸟查找可配对的公鸟
  const handleViewCompatibleMales = async (femaleParrot: Parrot) => {
    try {
      // Check if female is already paired
      if (femaleParrot.mate_id) {
        message.warning('该母鹦鹉已经配对，无法再次配对');
        return;
      }
      // Fetch all breeding parrots with pagination to get all males
      // First, get a larger page size to fetch more breeding birds
      const allBreedingResponse = await api.get('/parrots', {
        params: {
          status: 'breeding',
          size: 1000, // Get a large number to include all breeding birds
        },
      });

      const allBreedingParrots = (allBreedingResponse as any).items || [];
      const eligibleMales = allBreedingParrots.filter(
        (p: Parrot) => p.gender === '公' && !p.mate_id && p.id !== femaleParrot.id
      );

      setSelectedFemaleBreeding(femaleParrot);
      setCompatibleMales(eligibleMales);
      setShowMalesModal(true);
    } catch (error) {
      console.error('Failed to fetch eligible males:', error);
      message.error('获取可配对公鸟失败');
    }
  };

  const handleConfirmPairing = async (female: Parrot) => {
    if (!selectedMaleBreeding) {
      message.error('未选择公鸟');
      return;
    }

    try {
      await api.post('/parrots/pair', {
        male_id: selectedMaleBreeding.id,
        female_id: female.id,
      });

      message.success(`配对成功：${selectedMaleBreeding.breed} (圈号: ${selectedMaleBreeding.ring_number || '无'}) 与 ${female.breed} (圈号: ${female.ring_number || '无'})`);
      setShowFemalesModal(false);
      fetchParrots(); // Refresh the list
    } catch (error: any) {
      console.error('Pairing failed:', error);
      const errMessage = error.response?.data?.detail || error.response?.data?.message || '配对失败';
      message.error(errMessage);
    }
  };

  // 新增：通过母鸟选择的公鸟进行配对
  const handleConfirmPairingFromFemale = async (male: Parrot) => {
    if (!selectedFemaleBreeding) {
      message.error('未选择母鸟');
      return;
    }

    try {
      await api.post('/parrots/pair', {
        male_id: male.id,
        female_id: selectedFemaleBreeding.id,
      });

      message.success(`配对成功：${male.breed} (圈号: ${male.ring_number || '无'}) 与 ${selectedFemaleBreeding.breed} (圈号: ${selectedFemaleBreeding.ring_number || '无'})`);
      setShowMalesModal(false);
      fetchParrots(); // Refresh the list
    } catch (error: any) {
      console.error('Pairing failed:', error);
      const errMessage = error.response?.data?.detail || error.response?.data?.message || '配对失败';
      message.error(errMessage);
    }
  };

  const handleRemoveFromBreeding = async (parrot: Parrot) => {
    const confirmed = window.confirm(
      `确定要将 "${parrot.breed}" (圈号: ${parrot.ring_number || '无'}) 从种鸟状态移除吗？\n\n移除后将变为待售状态。`
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.put(`/parrots/${parrot.id}/status`, { status: 'available' });
      message.success(`已移除种鸟状态：${parrot.breed} (圈号: ${parrot.ring_number || '无'})`);
      fetchParrots(); // Refresh the list
    } catch (error: any) {
      console.error('Failed to remove from breeding:', error);
      const errMessage = error.response?.data?.detail || error.response?.data?.message || '操作失败';
      message.error(errMessage);
    }
  };

  const handleUnpairParrot = async (parrot: Parrot) => {
    const confirmed = window.confirm(
      `确定要取消 "${parrot.breed}" (圈号: ${parrot.ring_number || '无'}) 的配对吗？\n\n取消后两只鹦鹉都可以重新配对。`
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.post(`/parrots/unpair/${parrot.id}`);
      message.success(`已取消配对：${parrot.breed} (圈号: ${parrot.ring_number || '无'})`);
      fetchParrots(); // Refresh the list
    } catch (error: any) {
      console.error('Failed to unpair:', error);
      const errMessage = error.response?.data?.detail || error.response?.data?.message || '取消配对失败';
      message.error(errMessage);
    }
  };

  // 新增：开始孵化
  const handleStartIncubation = (parrot: Parrot) => {
    setSelectedPairedParrot(parrot);
    setEggCount(2); // 默认2个蛋
    setShowIncubationModal(true);
  };

  const handleConfirmIncubation = async () => {
    if (!selectedPairedParrot || !selectedPairedParrot.mate_id) {
      message.error('未选择配对的鹦鹉');
      return;
    }

    try {
      // 更新公鸟和母鸟的状态为孵化中
      await Promise.all([
        api.put(`/parrots/${selectedPairedParrot.id}/status`, { status: 'incubating' }),
        api.put(`/parrots/${selectedPairedParrot.mate_id}/status`, { status: 'incubating' }),
      ]);

      // 这里可以添加创建孵化记录的逻辑
      message.success(`已开始孵化！蛋数量：${eggCount}个`);
      setShowIncubationModal(false);
      setSelectedPairedParrot(null);
      fetchParrots(); // Refresh the list
    } catch (error: any) {
      console.error('Failed to start incubation:', error);
      const errMessage = error.response?.data?.detail || error.response?.data?.message || '开始孵化失败';
      message.error(errMessage);
    }
  };

  const handleViewAllEligible = () => {
    // Navigate to all parrots page with no status filter to see eligible birds
    navigate('/parrots');
  };

  // 查询条件处理函数
  const handleSearch = () => {
    // 构建筛选条件 - 始终筛选种鸟状态
    const searchFilters: any = { status: 'breeding' };

    if (searchText) {
      searchFilters.keyword = searchText;
    }
    if (selectedBreed) {
      searchFilters.breed = selectedBreed;
    }
    if (selectedGender) {
      searchFilters.gender = selectedGender;
    }
    // 配对状态由前端在获取数据后进行筛选

    // 更新筛选条件并重新获取数据
    setFilters(searchFilters);
    setPage(1); // 重置到第一页
  };

  const handleClearFilters = () => {
    setSearchText('');
    setSelectedBreed(undefined);
    setSelectedGender(undefined);
    setPairingStatus(undefined);
    setFilters({ status: 'breeding' });
    setPage(1);
  };

  const columns = [
    {
      title: '圈号',
      dataIndex: 'ring_number',
      key: 'ring_number',
      width: 80,
      render: (val: string | null) => val || '-',
    },
    {
      title: '品种',
      dataIndex: 'breed',
      key: 'breed',
      width: 120,
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      width: 80,
      render: (gender: string) => (
        <Tag color={gender === '公' ? '#0077B6' : '#FB5607'} style={{
          backgroundColor: gender === '公' ? 'rgba(0, 119, 182, 0.1)' : 'rgba(251, 86, 7, 0.1)',
          borderColor: gender === '公' ? '#0077B6' : '#FB5607',
          color: gender === '公' ? '#0077B6' : '#FB5607'
        }}>{gender}</Tag>
      ),
    },
    {
      title: '配对状态',
      key: 'pairing_status',
      width: 80,
      render: (record: Parrot) => {
        if (record.mate_id) {
          return (
            <Tag color="#00BBF9" icon={<HeartOutlined />} style={{
              backgroundColor: 'rgba(0, 187, 249, 0.1)',
              borderColor: '#00BBF9',
              color: '#00BBF9'
            }}>
              已配对
            </Tag>
          );
        }
        return <Tag color="#8D99AE" style={{
          backgroundColor: 'rgba(141, 153, 174, 0.1)',
          borderColor: '#8D99AE',
          color: '#8D99AE'
        }}>未配对</Tag>;
      },
    },
    {
      title: '配偶信息',
      key: 'mate_info',
      width: 120,
      render: (record: Parrot) => {
        if (record.mate_id) {
          // 通过mate_id查找配偶的圈号
          const mate = parrots.find(p => p.id === record.mate_id);
          return <span style={{ color: '#00BBF9', fontSize: '12px' }}>圈号: {mate?.ring_number || record.mate_id}</span>;
        }
        return '-';
      },
    },
    {
      title: '年龄',
      key: 'age',
      width: 120,
      render: (record: Parrot) => calculateAge(record.birth_date),
    },
    {
      title: '出生日期',
      dataIndex: 'birth_date',
      key: 'birth_date',
      width: 120,
      render: (val: string | null) => val || '-',
    },
    {
      title: '照片数',
      dataIndex: 'photo_count',
      key: 'photo_count',
      width: 80,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right' as const,
      width: 260,
      render: (_: any, record: Parrot) => (
        <Space size={4}>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
            style={{ padding: '0 4px' }}
          >
            查看
          </Button>
          {/* 如果未配对且是公鸟，显示配对按钮 */}
          {!record.mate_id && record.gender === '公' && (
            <Button
              type="link"
              size="small"
              icon={<HeartOutlined />}
              onClick={() => handleViewCompatibleFemales(record)}
              style={{ padding: '0 4px' }}
            >
              配对
            </Button>
          )}
          {/* 如果未配对且是母鸟，显示配对按钮 */}
          {!record.mate_id && record.gender === '母' && (
            <Button
              type="link"
              size="small"
              icon={<HeartOutlined />}
              onClick={() => handleViewCompatibleMales(record)}
              style={{ padding: '0 4px', color: '#00BBF9' }}
            >
              配对
            </Button>
          )}
          {/* 如果已配对，显示取消配对按钮 */}
          {record.mate_id && (
            <Button
              type="link"
              size="small"
              icon={<DisconnectOutlined />}
              onClick={() => handleUnpairParrot(record)}
              style={{ padding: '0 4px', color: '#E56B6F' }}
            >
              取消配对
            </Button>
          )}
          {/* 如果已配对且不是孵化中，显示孵化按钮 */}
          {record.mate_id && (
            <Button
              type="link"
              size="small"
              onClick={() => handleStartIncubation(record)}
              style={{ padding: '0 4px', color: '#9B5DE5' }}
            >
              孵化
            </Button>
          )}
          <Button
            type="link"
            size="small"
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleRemoveFromBreeding(record)}
            style={{ padding: '0 4px' }}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const femaleColumns = [
    {
      title: '圈号',
      dataIndex: 'ring_number',
      key: 'ring_number',
      render: (val: string | null) => val || '-',
    },
    {
      title: '品种',
      dataIndex: 'breed',
      key: 'breed',
    },
    {
      title: '年龄',
      key: 'age',
      render: (record: Parrot) => calculateAge(record.birth_date),
    },
    {
      title: '出生日期',
      dataIndex: 'birth_date',
      key: 'birth_date',
      render: (val: string | null) => val || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      render: (_: any, record: Parrot) => (
        <Space size={4}>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setShowFemalesModal(false);
              handleViewDetail(record);
            }}
            style={{ padding: '0 4px' }}
          >
            查看详情
          </Button>
          <Button
            type="primary"
            size="small"
            icon={<HeartOutlined />}
            onClick={() => handleConfirmPairing(record)}
            style={{ padding: '0 4px' }}
          >
            确认配对
          </Button>
        </Space>
      ),
    },
  ];

  // 新增：公鸟列表的列定义
  const maleColumns = [
    {
      title: '圈号',
      dataIndex: 'ring_number',
      key: 'ring_number',
      render: (val: string | null) => val || '-',
    },
    {
      title: '品种',
      dataIndex: 'breed',
      key: 'breed',
    },
    {
      title: '年龄',
      key: 'age',
      render: (record: Parrot) => calculateAge(record.birth_date),
    },
    {
      title: '出生日期',
      dataIndex: 'birth_date',
      key: 'birth_date',
      render: (val: string | null) => val || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      render: (_: any, record: Parrot) => (
        <Space size={4}>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setShowMalesModal(false);
              handleViewDetail(record);
            }}
            style={{ padding: '0 4px' }}
          >
            查看详情
          </Button>
          <Button
            type="primary"
            size="small"
            icon={<HeartOutlined />}
            onClick={() => handleConfirmPairingFromFemale(record)}
            style={{ padding: '0 4px' }}
          >
            确认配对
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* 固定标题栏 */}
      <div style={{
        position: 'sticky',
        top: 64,
        zIndex: 50,
        background: '#F5F2ED',
        margin: '-24px -24px 0 -24px',
        padding: '24px 24px 0 24px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#fff',
          padding: '16px 24px',
          borderRadius: '8px 8px 0 0',
          borderBottom: '1px solid #f0f0f0',
        }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>繁殖管理</h2>
          <Button type="primary" onClick={handleViewAllEligible}>
            查看可设为种鸟的鹦鹉
          </Button>
        </div>
      </div>

      <Card style={{ borderRadius: '0 0 8px 8px' }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space size="middle" wrap>
            <Space.Compact>
              <Input
                placeholder="搜索圈号或品种"
                style={{ width: 200 }}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onPressEnter={handleSearch}
              />
            </Space.Compact>
            <Select
              placeholder="选择品种"
              style={{ width: 150 }}
              allowClear
              value={selectedBreed}
              onChange={setSelectedBreed}
            >
              <Option value="虎皮鹦鹉">虎皮鹦鹉</Option>
              <Option value="玄凤鹦鹉">玄凤鹦鹉</Option>
              <Option value="牡丹鹦鹉">牡丹鹦鹉</Option>
              <Option value="小太阳">小太阳</Option>
              <Option value="和尚鹦鹉">和尚鹦鹉</Option>
              <Option value="凯克鹦鹉">凯克鹦鹉</Option>
            </Select>
            <Select
              placeholder="选择性别"
              style={{ width: 120 }}
              allowClear
              value={selectedGender}
              onChange={setSelectedGender}
            >
              <Option value="公">公</Option>
              <Option value="母">母</Option>
            </Select>
            <Select
              placeholder="配对状态"
              style={{ width: 120 }}
              allowClear
              value={pairingStatus}
              onChange={setPairingStatus}
            >
              <Option value="paired">已配对</Option>
              <Option value="unpaired">未配对</Option>
            </Select>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              查询
            </Button>
            <Button onClick={handleClearFilters}>
              清空
            </Button>
          </Space>
          <Table
            columns={columns}
            dataSource={filterParrotsByPairingStatus(parrots)}
            rowKey="id"
            loading={loading}
            scroll={{ x: 1400 }}
            pagination={{
              current: page,
              pageSize: pageSize,
              total: total,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 只种鸟`,
              onChange: (page, pageSize) => {
                setPage(page);
                setPageSize(pageSize);
              },
            }}
          />
        </Space>
      </Card>

      {/* Parrot Detail Modal */}
      <Modal
        title="鹦鹉详情"
        open={isDetailVisible}
        onCancel={() => setIsDetailVisible(false)}
        footer={null}
        width={900}
        destroyOnHidden
      >
        {selectedParrot && <ParrotDetail parrot={selectedParrot} />}
      </Modal>

      {/* Compatible Females Modal */}
      <Modal
        title={`为 ${selectedMaleBreeding?.breed} (圈号: ${selectedMaleBreeding?.ring_number || '无'}) 查找配对母鸟`}
        open={showFemalesModal}
        onCancel={() => setShowFemalesModal(false)}
        footer={null}
        width={800}
        destroyOnHidden
      >
        {compatibleFemales.length > 0 ? (
          <>
            <p style={{ marginBottom: '16px', color: '#8B8C89' }}>
              找到 {compatibleFemales.length} 只可配对的母鸟（不局限于同品种）：
            </p>
            <Table
              columns={femaleColumns}
              dataSource={compatibleFemales}
              rowKey="id"
              pagination={false}
              scroll={{ x: 600 }}
            />
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#A89994' }}>
            <p>暂无可配对的母鸟</p>
            <p style={{ fontSize: '14px' }}>请先将符合条件的母鸟设置为种鸟</p>
          </div>
        )}
      </Modal>

      {/* 新增：Compatible Males Modal */}
      <Modal
        title={`为 ${selectedFemaleBreeding?.breed} (圈号: ${selectedFemaleBreeding?.ring_number || '无'}) 查找配对公鸟`}
        open={showMalesModal}
        onCancel={() => setShowMalesModal(false)}
        footer={null}
        width={800}
        destroyOnHidden
      >
        {compatibleMales.length > 0 ? (
          <>
            <p style={{ marginBottom: '16px', color: '#8B8C89' }}>
              找到 {compatibleMales.length} 只可配对的公鸟（不局限于同品种）：
            </p>
            <Table
              columns={maleColumns}
              dataSource={compatibleMales}
              rowKey="id"
              pagination={false}
              scroll={{ x: 600 }}
            />
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#A89994' }}>
            <p>暂无可配对的公鸟</p>
            <p style={{ fontSize: '14px' }}>请先将符合条件的公鸟设置为种鸟</p>
          </div>
        )}
      </Modal>

      {/* 新增：孵化配置模态框 */}
      <Modal
        title="配置孵化信息"
        open={showIncubationModal}
        onCancel={() => setShowIncubationModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowIncubationModal(false)}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={handleConfirmIncubation}>
            开始孵化
          </Button>,
        ]}
        width={500}
      >
        {selectedPairedParrot && (
          <div style={{ padding: '16px 0' }}>
            <p style={{ marginBottom: '16px', color: '#8B8C89' }}>
              为配对鹦鹉配置孵化信息：
            </p>
            <div style={{
              background: '#F9F8F6',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '16px'
            }}>
              <p style={{ margin: '4px 0', fontSize: '14px' }}>
                <strong>公鸟：</strong>{selectedPairedParrot.breed} (圈号: {selectedPairedParrot.ring_number || '无'})
              </p>
              <p style={{ margin: '4px 0', fontSize: '14px' }}>
                <strong>母鸟：</strong>
                {parrots.find(p => p.id === selectedPairedParrot.mate_id)?.breed}
                (圈号: {parrots.find(p => p.id === selectedPairedParrot.mate_id)?.ring_number || '无'})
              </p>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                蛋的数量：
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={eggCount}
                onChange={(e) => setEggCount(parseInt(e.target.value) || 2)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #D4D4D8',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
              <p style={{ marginTop: '8px', fontSize: '12px', color: '#A89994' }}>
                建议数量：2-4个蛋
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BreedingManagementPage;
