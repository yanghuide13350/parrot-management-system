import { useEffect, useState } from 'react';
import { Card, Row, Col, Space, Tag, Empty } from 'antd';
import {
  ShoppingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons';
import { Line, Column } from '@ant-design/charts';
import { useParrot } from '../context/ParrotContext';
import { useNavigate } from 'react-router-dom';
import type { MonthlySales, MonthlySalesData } from '../types/parrot';
import { api } from '../services/api';

const Dashboard = () => {
  const { statistics, fetchStatistics, updateFilters } = useParrot();
  const navigate = useNavigate();
  const [monthlySales, setMonthlySales] = useState<MonthlySalesData[]>([]);
  const [loadingChart, setLoadingChart] = useState(false);
  const [chartType, setChartType] = useState<'line' | 'column'>('line');

  useEffect(() => {
    // Reset filters when entering dashboard
    updateFilters({});
    fetchStatistics();
    fetchMonthlySales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMonthlySales = async () => {
    setLoadingChart(true);
    try {
      const response = await api.get<MonthlySales>('/statistics/monthly-sales');
      setMonthlySales(response.monthly_sales || []);
    } catch (error) {
      console.error('获取月度销售数据失败:', error);
    } finally {
      setLoadingChart(false);
    }
  };

  const handleCardClick = (type: string, value?: string) => {
    const params: any = {};

    if (type === 'available') {
      params.status = 'available';
    } else if (type === 'sold') {
      params.status = 'sold';
    } else if (type === 'returned') {
      params.status = 'returned';
    } else if (type === 'breed' && value) {
      params.breed = value;
    }

    // 传递筛选参数到列表页
    navigate('/parrots', { state: { filters: params } });
  };

  // 计算总销售额
  const totalRevenue = statistics?.total_revenue || 0;

  // 计算环比增长
  const calculateGrowth = () => {
    if (monthlySales.length < 2) return 0;
    const lastMonth = monthlySales[monthlySales.length - 1].revenue;
    const prevMonth = monthlySales[monthlySales.length - 2].revenue;
    if (prevMonth === 0) return lastMonth > 0 ? 100 : 0;
    return Number(((lastMonth - prevMonth) / prevMonth * 100).toFixed(1));
  };
  const monthOverMonthGrowth = calculateGrowth();

  // 图表配置
  const lineConfig = {
    data: monthlySales,
    xField: 'month_name',
    yField: 'revenue',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 2000,
      },
    },
    point: {
      size: 5,
      shape: 'diamond',
      style: {
        fill: 'white',
        stroke: '#9CAF88',
        lineWidth: 2,
      },
    },
    color: '#9CAF88',
    yAxis: {
      label: {
        formatter: (v: any) => `¥${Number(v).toLocaleString()}`,
      },
    },
  
  };

  const columnConfig = {
    data: monthlySales,
    xField: 'month_name',
    yField: 'count',
    color: '#C8A6A2',
    animation: {
      appear: {
        animation: 'grow-in-x',
        duration: 1500,
      },
    },
    columnWidthRatio: 0.6,
    label: {
      position: 'top' as const,
    },
    yAxis: {
      label: {
        formatter: (v: any) => `${v}只`,
      },
    },
   
  };

  return (
    <div style={{ padding: '32px', background: '#F5F2ED', minHeight: '100vh' }}>
      {/* 标题区域 */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 600, color: '#2C2A28', marginBottom: '8px', letterSpacing: '-0.5px' }}>
          鹦鹉管理系统
        </h1>
        <p style={{ margin: 0, fontSize: '14px', color: '#6D7A8D' }}>
          数据概览 · {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* 核心指标卡片 */}
      <Row gutter={[20, 20]} style={{ marginBottom: '32px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            onClick={() => handleCardClick('total')}
            style={{
              borderRadius: '12px',
              background: '#FBF9F6',
              border: '1px solid #eee',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              height: '120px',
            }}
            styles={{ body: { padding: '24px', height: '100%' } }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
              <div>
                <div style={{ fontSize: '13px', color: '#6D7A8D', marginBottom: '12px', fontWeight: 500 }}>
                  总鹦鹉数
                </div>
                <div style={{ fontSize: '32px', fontWeight: 600, color: '#2C2A28', lineHeight: 1 }}>
                  {statistics?.total_parrots || 0}
                </div>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(156, 175, 136, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                color: '#9CAF88'
              }}>
                <ShoppingOutlined />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            onClick={() => handleCardClick('available')}
            style={{
              borderRadius: '12px',
              background: '#FBF9F6',
              border: '1px solid #eee',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              height: '120px',
            }}
            styles={{ body: { padding: '24px', height: '100%' } }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
              <div>
                <div style={{ fontSize: '13px', color: '#6D7A8D', marginBottom: '12px', fontWeight: 500 }}>
                  在售鹦鹉
                </div>
                <div style={{ fontSize: '32px', fontWeight: 600, color: '#2C2A28', lineHeight: 1 }}>
                  {statistics?.available_parrots || 0}
                </div>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(156, 175, 136, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                color: '#9CAF88'
              }}>
                <CheckCircleOutlined />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            onClick={() => handleCardClick('sold')}
            style={{
              borderRadius: '12px',
              background: '#FBF9F6',
              border: '1px solid #eee',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              height: '120px',
            }}
            styles={{ body: { padding: '24px', height: '100%' } }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
              <div>
                <div style={{ fontSize: '13px', color: '#6D7A8D', marginBottom: '12px', fontWeight: 500 }}>
                  已售鹦鹉
                </div>
                <div style={{ fontSize: '32px', fontWeight: 600, color: '#2C2A28', lineHeight: 1 }}>
                  {statistics?.sold_parrots || 0}
                </div>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(200, 166, 162, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                color: '#C8A6A2'
              }}>
                <CloseCircleOutlined />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              borderRadius: '12px',
              background: '#FBF9F6',
              border: '1px solid #eee',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              height: '120px',
            }}
            styles={{ body: { padding: '24px', height: '100%' } }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
              <div>
                <div style={{ fontSize: '13px', color: '#6D7A8D', marginBottom: '8px', fontWeight: 500 }}>
                  总销售额
                </div>
                <div style={{ fontSize: '26px', fontWeight: 600, color: '#2C2A28', lineHeight: 1 }}>
                  ¥{totalRevenue.toLocaleString()}
                </div>
                <div style={{ fontSize: '12px', marginTop: '6px' }}>
                  <Space size={4}>
                    {monthOverMonthGrowth >= 0 ? (
                      <RiseOutlined style={{ color: '#9CAF88', fontSize: '12px' }} />
                    ) : (
                      <FallOutlined style={{ color: '#BEB5A2', fontSize: '12px' }} />
                    )}
                    <span style={{ color: monthOverMonthGrowth >= 0 ? '#9CAF88' : '#BEB5A2', fontSize: '12px' }}>
                      {monthOverMonthGrowth >= 0 ? '+' : ''}{monthOverMonthGrowth}%
                    </span>
                  </Space>
                </div>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(109, 122, 141, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                color: '#6D7A8D'
              }}>
                <DollarOutlined />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 月度销售趋势图表 */}
      <Card
        style={{
          borderRadius: '12px',
          marginBottom: '24px',
          border: '1px solid #eee',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '16px', fontWeight: 600, color: '#2C2A28' }}>月度销售趋势</span>
            <Space size={8}>
              <Tag
                color={chartType === 'line' ? '#9CAF88' : undefined}
                style={{
                  cursor: 'pointer',
                  borderRadius: '4px',
                  border: chartType === 'line' ? 'none' : '1px solid #9A9591',
                  color: chartType === 'line' ? '#fff' : '#2C2A28'
                }}
                onClick={() => setChartType('line')}
              >
                销售额
              </Tag>
              <Tag
                color={chartType === 'column' ? '#C8A6A2' : undefined}
                style={{
                  cursor: 'pointer',
                  borderRadius: '4px',
                  border: chartType === 'column' ? 'none' : '1px solid #9A9591',
                  color: chartType === 'column' ? '#fff' : '#2C2A28'
                }}
                onClick={() => setChartType('column')}
              >
                销售量
              </Tag>
            </Space>
          </div>
        }
        styles={{
          header: { border: 'none', paddingBottom: 0 },
          body: { padding: '24px' }
        }}
      >
        {loadingChart ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6D7A8D' }}>加载中...</div>
        ) : monthlySales.length > 0 ? (
          <div style={{ minHeight: '320px' }}>
            {chartType === 'line' ? (
              <Line {...lineConfig} height={300} />
            ) : (
              <Column {...columnConfig} height={300} />
            )}
          </div>
        ) : (
          <Empty description="暂无销售数据" />
        )}
      </Card>

      {/* 品种统计 */}
      {statistics?.breed_counts && Object.keys(statistics.breed_counts).length > 0 && (
        <Card
          style={{
            borderRadius: '12px',
            border: '1px solid #eee',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
          title={
            <span style={{ fontSize: '16px', fontWeight: 600, color: '#2C2A28' }}>品种分布</span>
          }
          styles={{
            header: { border: 'none', paddingBottom: 0 },
            body: { padding: '24px' }
          }}
        >
          <Row gutter={[16, 16]}>
            {Object.entries(statistics.breed_counts)
              .sort(([, a], [, b]) => b - a)
              .map(([breed, count]) => {
                const total = statistics?.total_parrots || 1;
                const percentage = ((count / total) * 100).toFixed(1);

                return (
                  <Col xs={24} sm={12} md={8} lg={6} key={breed}>
                    <div
                      onClick={() => handleCardClick('breed', breed)}
                      style={{
                        padding: '16px 20px',
                        borderRadius: '8px',
                        background: '#E6D4D1',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        border: '1px solid transparent',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#D9C5C1';
                        e.currentTarget.style.borderColor = '#C8A6A2';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#E6D4D1';
                        e.currentTarget.style.borderColor = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 500, color: '#2C2A28', marginBottom: '4px' }}>
                            {breed}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6D7A8D' }}>
                            {percentage}%
                          </div>
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: 600, color: '#2C2A28' }}>
                          {count}
                        </div>
                      </div>
                    </div>
                  </Col>
                );
              })}
          </Row>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
