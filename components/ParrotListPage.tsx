import React, { useState, useEffect } from 'react';
import {
  Layout,
  Card,
  Row,
  Col,
  Button,
  Select,
  Input,
  Space,
  Tag,
  Badge,
  Typography,
  Statistic,
  Empty,
  Spin,
  message,
  Modal,
  Dropdown,
  Menu,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  CheckOutlined,
  RetweetOutlined,
  ReloadOutlined,
  CameraOutlined,
  AppstoreOutlined,
  BarsOutlined,
  EyeOutlined,
  DownloadOutlined,
  RightOutlined,
  DownOutlined
} from '@ant-design/icons';
import { formatAge } from '../utils/format';
import type { Parrot } from '../types';

const { Header, Content } = Layout;
const { Option } = Select;
const { Title } = Typography;
const { Search } = Input;

interface ParrotListPageProps {
  parrots: Parrot[];
  loading: boolean;
  onAddParrot: () => void;
  onEditParrot: (parrot: Parrot) => void;
  onViewParrot: (parrot: Parrot) => void;
  onSellParrot: (parrot: Parrot) => void;
  onReturnParrot: (parrot: Parrot) => void;
  onLoadParrots: () => void;
}

const ParrotListPage: React.FC<ParrotListPageProps> = ({
  parrots,
  loading,
  onAddParrot,
  onEditParrot,
  onViewParrot,
  onSellParrot,
  onReturnParrot,
  onLoadParrots
}) => {
  const [breedFilter, setBreedFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ageFilter, setAgeFilter] = useState<string>('all');
  const [searchText, setSearchText] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // 统计数据
  const stats = {
    total: parrots.length,
    available: parrots.filter(p => p.status === 'available').length,
    sold: parrots.filter(p => p.status === 'sold').length,
    returned: parrots.filter(p => p.status === 'returned').length
  };

  // 获取所有品种（去重）
  const breeds = Array.from(new Set(parrots.map(p => p.breed)));

  // 筛选数据
  const filteredParrots = parrots.filter(parrot => {
    // 品种筛选
    if (breedFilter !== 'all' && parrot.breed !== breedFilter) {
      return false;
    }

    // 状态筛选
    if (statusFilter !== 'all' && parrot.status !== statusFilter) {
      return false;
    }

    // 年龄筛选
    if (ageFilter !== 'all') {
      const ageInDays = Math.floor(
        (Date.now() - new Date(parrot.birthDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (ageFilter === 'chick' && ageInDays > 30) return false;
      if (ageFilter === 'subadult' && (ageInDays <= 30 || ageInDays > 180)) return false;
      if (ageFilter === 'adult' && ageInDays <= 180) return false;
    }

    // 搜索筛选
    if (searchText) {
      const searchableText = `${parrot.breed} ${parrot.cageNumber} ${parrot.description || ''}`.toLowerCase();
      return searchableText.includes(searchText.toLowerCase());
    }

    return true;
  });

  // 获取状态标签配置
  const getStatusTag = (status: string) => {
    switch (status) {
      case 'available':
        return { color: 'success', text: '未售', icon: '🏷️' };
      case 'sold':
        return { color: 'warning', text: '已售', icon: '✅' };
      case 'returned':
        return { color: 'error', text: '退货', icon: '🔄' };
      default:
        return { color: 'default', text: '未知', icon: '❓' };
    }
  };

  // 获取性别图标
  const getGenderIcon = (gender: string) => {
    switch (gender) {
      case 'male':
        return '♂️';
      case 'female':
        return '♀️';
      default:
        return '⚧️';
    }
  };

  // 鹦鹉卡片渲染
  const renderParrotCard = (parrot: Parrot) => {
    const status = getStatusTag(parrot.status);
    const age = formatAge(parrot.birthDate);

    return (
      <Card
        key={parrot.id}
        hoverable
        style={{ height: '100%' }}
        cover={
          <div
            style={{
              height: 200,
              backgroundColor: '#f5f5f5',
              position: 'relative',
              cursor: 'pointer'
            }}
            onClick={() => onViewParrot(parrot)}
          >
            {parrot.photos && parrot.photos.length > 0 ? (
              <img
                alt={`${parrot.breed}`}
                src={parrot.photos[0]}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 48,
                  color: '#ccc'
                }}
              >
                🦜
              </div>
            )}
            {parrot.photos && parrot.photos.length > 1 && (
              <div
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: 12,
                  fontSize: 12
                }}
              >
                +{parrot.photos.length - 1}
              </div>
            )}
            <div
              style={{
                position: 'absolute',
                top: 8,
                left: 8
              }}
            >
              <Tag color={status.color}>
                {status.icon} {status.text}
              </Tag>
            </div>
          </div>
        }
        actions={[
          <Tooltip title="查看详情">
            <EyeOutlined key="view" onClick={() => onViewParrot(parrot)} />
          </Tooltip>,
          <Tooltip title="编辑">
            <EditOutlined key="edit" onClick={() => onEditParrot(parrot)} />
          </Tooltip>,
          parrot.status === 'available' ? (
            <Tooltip title="标记已售">
              <CheckOutlined key="sell" onClick={() => onSellParrot(parrot)} />
            </Tooltip>
          ) : (
            <Tooltip title="标记退货">
              <RetweetOutlined key="return" onClick={() => onReturnParrot(parrot)} />
            </Tooltip>
          )
        ]}
      >
        <Card.Meta
          title={
            <Space direction="vertical" size={0} style={{ width: '100%' }}>
              <div style={{ fontSize: 16, fontWeight: 'bold' }}>
                {parrot.breed}
              </div>
              <Tag style={{ marginTop: 4 }}>
                {getGenderIcon(parrot.gender)} {parrot.gender === 'male' ? '公' : parrot.gender === 'female' ? '母' : '未知'}
              </Tag>
            </Space>
          }
          description={
            <Space direction="vertical" size={0} style={{ width: '100%', marginTop: 8 }}>
              <div style={{ color: '#f97316', fontWeight: 'bold' }}>
                💰 ¥{parrot.price.toLocaleString()}
              </div>
              {parrot.cageNumber && (
                <div style={{ fontSize: 12, color: '#6b7280' }}>
                  📦 {parrot.cageNumber}号笼
                </div>
              )}
              <div style={{ fontSize: 12, color: '#6b7280' }}>
                📅 {age}
              </div>
            </Space>
          }
        />
      </Card>
    );
  };

  // 移动端列表视图
  const renderParrotListItem = (parrot: Parrot) => {
    const status = getStatusTag(parrot.status);
    const age = formatAge(parrot.birthDate);

    return (
      <div
        key={parrot.id}
        style={{
          backgroundColor: 'white',
          padding: 12,
          marginBottom: 8,
          borderRadius: 8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          display: 'flex'
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            marginRight: 12,
            cursor: 'pointer',
            flexShrink: 0
          }}
          onClick={() => onViewParrot(parrot)}
        >
          {parrot.photos && parrot.photos.length > 0 ? (
            <img
              alt={`${parrot.breed}`}
              src={parrot.photos[0]}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: 8
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f5f5f5',
                borderRadius: 8,
                fontSize: 32
              }}
            >
              🦜
            </div>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: 16 }}>
                {parrot.breed}
              </div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                {getGenderIcon(parrot.gender)} {age}
              </div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                {parrot.cageNumber ? `${parrot.cageNumber}号笼` : '未指定'}
              </div>
            </div>
            <Tag color={status.color} style={{ fontSize: 10 }}>
              {status.icon} {status.text}
            </Tag>
          </div>
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: '#f97316', fontWeight: 'bold' }}>
              ¥{parrot.price.toLocaleString()}
            </div>
            <Space size={4}>
              <Button
                size="small"
                type="text"
                icon={<EyeOutlined />}
                onClick={() => onViewParrot(parrot)}
              />
              <Button
                size="small"
                type="text"
                icon={<EditOutlined />}
                onClick={() => onEditParrot(parrot)}
              />
              {parrot.status === 'available' ? (
                <Button
                  size="small"
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={() => onSellParrot(parrot)}
                >
                  售出
                </Button>
              ) : (
                <Button
                  size="small"
                  type="text"
                  danger
                  icon={<RetweetOutlined />}
                  onClick={() => onReturnParrot(parrot)}
                >
                  退货
                </Button>
              )}
            </Space>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Header
        style={{
          backgroundColor: '#10b981',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: 24, marginRight: 12 }}>🦜</span>
          <Title level={3} style={{ color: 'white', margin: 0 }}>
            鹦鹉管理系统
          </Title>
        </div>
        <Space>
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item key="list" icon={<BarsOutlined />}>
                  列表视图
                </Menu.Item>
                <Menu.Item key="grid" icon={<AppstoreOutlined />}>
                  网格视图
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item key="export" icon={<DownloadOutlined />}>
                  导出数据
                </Menu.Item>
                <Menu.Item key="refresh" icon={<ReloadOutlined />} onClick={onLoadParrots}>
                  刷新数据
                </Menu.Item>
              </Menu>
            }
          >
            <Button type="text" style={{ color: 'white' }}>
              更多 <DownOutlined />
            </Button>
          </Dropdown>
        </Space>
      </Header>

      <Content style={{ padding: 24 }}>
        {/* 统计面板 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={12} sm={12} md={6} lg={6}>
            <Card style={{ textAlign: 'center' }}>
              <Statistic title="总库存" value={stats.total} valueStyle={{ color: '#10b981' }} prefix="🦜" />
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6} lg={6}>
            <Card style={{ textAlign: 'center' }}>
              <Statistic title="未售" value={stats.available} valueStyle={{ color: '#10b981' }} prefix="🏷️" />
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6} lg={6}>
            <Card style={{ textAlign: 'center' }}>
              <Statistic title="已售" value={stats.sold} valueStyle={{ color: '#f97316' }} prefix="✅" />
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6} lg={6}>
            <Card style={{ textAlign: 'center' }}>
              <Statistic title="退货" value={stats.returned} valueStyle={{ color: '#ef4444' }} prefix="🔄" />
            </Card>
          </Col>
        </Row>

        {/* 筛选和搜索区 */}
        <Card style={{ marginBottom: 24 }}>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <div>
              <Input.Group compact>
                <Select
                  style={{ width: '30%' }}
                  placeholder="选择品种"
                  value={breedFilter}
                  onChange={setBreedFilter}
                  allowClear
                  dropdownRender={(menu) => (
                    <div>
                      {menu}
                      <div style={{ padding: '8px 12px', borderTop: '1px solid #f0f0f0' }}>
                        <Button type="text" size="small" style={{ width: '100%' }}>
                          管理品种
                        </Button>
                      </div>
                    </div>
                  )}
                >
                  <Option value="all">全部</Option>
                  {breeds.map(breed => (
                    <Option key={breed} value={breed}>{breed}</Option>
                  ))}
                </Select>
                <Select
                  style={{ width: '25%' }}
                  placeholder="销售状态"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  allowClear
                >
                  <Option value="all">全部</Option>
                  <Option value="available">未售</Option>
                  <Option value="sold">已售</Option>
                  <Option value="returned">退货</Option>
                </Select>
                <Select
                  style={{ width: '25%' }}
                  placeholder="年龄段"
                  value={ageFilter}
                  onChange={setAgeFilter}
                  allowClear
                >
                  <Option value="all">全部</Option>
                  <Option value="chick">雏鸟 (0-30天)</Option>
                  <Option value="subadult">亚成体 (1-6月)</Option>
                  <Option value="adult">成鸟 (6月以上)</Option>
                </Select>
              </Input.Group>
            </div>
            <Search
              placeholder="搜索品种、圈号、备注..."
              allowClear
              enterButton={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: '100%' }}
            />
          </Space>
        </Card>

        {/* 操作按钮 */}
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={onAddParrot}
              style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
            >
              新增鹦鹉
            </Button>
            <Button icon={<ReloadOutlined />} onClick={onLoadParrots} loading={loading}>
              刷新
            </Button>
          </Space>
          <Space>
            <ToggleViewMode viewMode={viewMode} onChange={setViewMode} />
          </Space>
        </div>

        {/* 鹦鹉列表 */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
          </div>
        ) : filteredParrots.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Empty
              image={searchText || breedFilter !== 'all' || statusFilter !== 'all' || ageFilter !== 'all' ? undefined : <span style={{ fontSize: 64 }}>🦜</span>}
              description={
                searchText || breedFilter !== 'all' || statusFilter !== 'all' || ageFilter !== 'all'
                  ? '没有符合条件的鹦鹉'
                  : parrots.length === 0
                  ? '还没有鹦鹉信息'
                  : '筛选结果为空'
              }
            >
              {parrots.length === 0 ? (
                <Button
                  type="primary"
                  size="large"
                  icon={<PlusOutlined />}
                  onClick={onAddParrot}
                  style={{ backgroundColor: '#10b981', borderColor: '#10b981', marginTop: 16 }}
                >
                  添加第一批鹦鹉
                </Button>
              ) : (
                <Button onClick={() => {
                  setSearchText('');
                  setBreedFilter('all');
                  setStatusFilter('all');
                  setAgeFilter('all');
                }}>
                  清空筛选条件
                </Button>
              )}
            </Empty>
          </Card>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <Row gutter={[16, 16]}>
                {filteredParrots.map(parrot => (
                  <Col key={parrot.id} xs={24} sm={12} md={8} lg={6}>
                    {renderParrotCard(parrot)}
                  </Col>
                ))}
              </Row>
            ) : (
              <div>
                {filteredParrots.map(parrot => renderParrotListItem(parrot))}
              </div>
            )}
          </>
        )}
      </Content>
    </Layout>
  );
};

// 视图切换组件
const ToggleViewMode: React.FC<{
  viewMode: 'grid' | 'list';
  onChange: (mode: 'grid' | 'list') => void;
}> = ({ viewMode, onChange }) => {
  return (
    <div
      style={{
        display: 'flex',
        backgroundColor: '#f0f0f0',
        borderRadius: 6,
        padding: 2
      }}
    >
      <div
        onClick={() => onChange('grid')}
        style={{
          padding: '6px 12px',
          cursor: 'pointer',
          backgroundColor: viewMode === 'grid' ? 'white' : 'transparent',
          borderRadius: 4,
          color: viewMode === 'grid' ? '#10b981' : '#666'
        }}
      >
        <AppstoreOutlined />
      </div>
      <div
        onClick={() => onChange('list')}
        style={{
          padding: '6px 12px',
          cursor: 'pointer',
          backgroundColor: viewMode === 'list' ? 'white' : 'transparent',
          borderRadius: 4,
          color: viewMode === 'list' ? '#10b981' : '#666'
        }}
      >
        <BarsOutlined />
      </div>
    </div>
  );
};

export default ParrotListPage;
