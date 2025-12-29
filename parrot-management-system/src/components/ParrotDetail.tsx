import { useEffect, useState } from 'react';
import { Descriptions, Tag, Image, Empty, Upload, Button, message, Timeline, Popconfirm, List, Space, Tooltip } from 'antd';
import { UploadOutlined, CopyOutlined, DownloadOutlined, ShareAltOutlined, HeartOutlined, DeleteOutlined, LinkOutlined } from '@ant-design/icons';
import type { Parrot, Photo } from '../types/parrot';
import { useParrot } from '../context/ParrotContext';
import { ParrotService } from '../services/parrotService';
import { ShareService, type ShareLink } from '../services/shareService';
import { calculateAge } from '../utils/dateUtils';
import { api } from '../services/api';

// 格式化日期时间
const formatDateTime = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch {
    return dateStr;
  }
};

interface ParrotDetailProps {
  parrot: Parrot;
}

const ParrotDetail = ({ parrot }: ParrotDetailProps) => {
  const { uploadParrotPhotos } = useParrot();
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [mateInfo, setMateInfo] = useState<any>(null);
  const [saleInfo, setSaleInfo] = useState<any>(null);
  const [salesTimeline, setSalesTimeline] = useState<any[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [loadingShareLinks, setLoadingShareLinks] = useState(false);
  const [generatingLink, setGeneratingLink] = useState(false);

  const statusMap: Record<string, string> = {
    'available': '待售',
    'sold': '已售',
    'returned': '退货',
    'breeding': '种鸟',
  };

  const statusColors: Record<string, string> = {
    'available': 'blue',
    'sold': 'green',
    'returned': 'red',
    'breeding': 'purple',
  };

  useEffect(() => {
    fetchPhotos();
    fetchMateInfo();
    fetchShareLinks();
    if (parrot.status === 'sold' || parrot.status === 'returned') {
      fetchSaleInfo();
    }
    fetchSalesTimeline();
  }, [parrot.id]);

  const fetchShareLinks = async () => {
    setLoadingShareLinks(true);
    try {
      const response = await ShareService.getShareLinks(parrot.id);
      setShareLinks(response.items || []);
    } catch (error) {
      console.error('获取分享链接失败:', error);
    } finally {
      setLoadingShareLinks(false);
    }
  };

  const handleGenerateShareLink = async () => {
    setGeneratingLink(true);
    try {
      const result = await ShareService.generateShareLink(parrot.id);
      // 复制到剪贴板
      await navigator.clipboard.writeText(result.url);
      message.success('分享链接已生成并复制到剪贴板！');
      // 刷新链接列表
      await fetchShareLinks();
    } catch (error: any) {
      console.error('生成分享链接失败:', error);
      message.error('生成分享链接失败，请重试');
    } finally {
      setGeneratingLink(false);
    }
  };

  const handleCopyShareLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      message.success('链接已复制到剪贴板');
    } catch (error) {
      message.error('复制失败，请手动复制');
    }
  };

  const handleDeleteShareLink = async (token: string) => {
    try {
      await ShareService.deleteShareLink(token);
      message.success('分享链接已删除');
      await fetchShareLinks();
    } catch (error) {
      console.error('删除分享链接失败:', error);
      message.error('删除失败，请重试');
    }
  };

  const fetchMateInfo = async () => {
    try {
      const response = await api.get(`/parrots/${parrot.id}/mate`);
      setMateInfo(response);
    } catch (error) {
      console.error('获取配偶信息失败:', error);
    }
  };

  const fetchSaleInfo = async () => {
    try {
      const response = await api.get(`/parrots/${parrot.id}/sale-info`);
      setSaleInfo(response);
    } catch (error) {
      console.error('获取销售信息失败:', error);
      // 如果没有销售信息，设置默认值
      setSaleInfo({
        seller: '-',
        buyer_name: '-',
        sale_price: parrot.price,
        contact: '-',
        follow_up_status: 'pending',
        notes: '-'
      });
    }
  };

  const fetchSalesTimeline = async () => {
    setLoadingTimeline(true);
    try {
      const response: any = await api.get(`/parrots/${parrot.id}/sales-timeline`);
      setSalesTimeline(response.timeline || []);
    } catch (error) {
      console.error('获取销售流程时间线失败:', error);
      setSalesTimeline([]);
    } finally {
      setLoadingTimeline(false);
    }
  };

  const calculatePairingDuration = (pairedAt: string | null) => {
    if (!pairedAt) return '-';
    const pairedDate = new Date(pairedAt);
    const now = new Date();
    const diffMs = now.getTime() - pairedDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffYears > 0) {
      return `${diffYears}年${diffMonths % 12}个月`;
    } else if (diffMonths > 0) {
      return `${diffMonths}个月${diffDays % 30}天`;
    } else {
      return `${diffDays}天`;
    }
  };

  const fetchPhotos = async () => {
    setLoadingPhotos(true);
    try {
      const response = await ParrotService.getPhotos(parrot.id);
      if (response.success && response.data) {
        setPhotos(response.data);
      }
    } catch (error) {
      console.error('获取照片失败:', error);
    } finally {
      setLoadingPhotos(false);
    }
  };

  const handleUpload = async (file: File) => {
    // 限制：已售出的和已退货的鹦鹉不能再上传照片和视频
    if (parrot.status === 'sold' || parrot.status === 'returned') {
      message.error('该鹦鹉已售出或已退货，不能上传新的照片和视频');
      return false;
    }

    // 文件大小限制：500MB
    const MAX_FILE_SIZE = 500 * 1024 * 1024;

    if (file.size > MAX_FILE_SIZE) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      message.error(`文件过大！当前文件大小为 ${fileSizeMB}MB，最大允许 500MB`);
      return false;
    }

    // 检查文件类型
    // const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/x-matroska'];
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const allowedExts = ['png', 'jpg', 'jpeg', 'gif', 'mp4', 'mov', 'avi', 'mkv', 'webm'];

    if (!allowedExts.includes(fileExt || '')) {
      message.error(`不支持的文件格式！支持的格式：${allowedExts.join(', ')}`);
      return false;
    }

    setUploading(true);
    try {
      await uploadParrotPhotos(parrot.id, [file]);
      message.success('上传成功');
      await fetchPhotos();
    } catch (error: any) {
      // 检查是否是文件大小相关的错误
      if (error?.response?.status === 413 || error?.message?.includes('too large') || error?.message?.includes('size')) {
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        message.error(`上传失败：文件过大（${fileSizeMB}MB），请压缩后重试`);
      } else if (error?.response?.status === 422) {
        message.error('上传失败：文件格式不正确');
      } else {
        message.error('上传失败，请检查网络连接后重试');
      }
      console.error('上传错误:', error);
    } finally {
      setUploading(false);
    }
    return false;
  };

  const handleDeletePhoto = async (photoId: number) => {
    try {
      await api.delete(`/photos/${photoId}`);
      message.success('删除成功');
      await fetchPhotos();
    } catch (error) {
      console.error('删除照片失败:', error);
      message.error('删除失败，请重试');
    }
  };

  const handleCopyInfo = async () => {
    const statusText = statusMap[parrot.status] || parrot.status;
    const baseUrl = window.location.origin;

    let infoText = `【鹦鹉详细信息】\n\n`;
    infoText += `品种：${parrot.breed}\n`;
    infoText += `性别：${parrot.gender}\n`;
    infoText += `价格：¥${Number(parrot.price).toFixed(2)}\n`;
    infoText += `出生日期：${parrot.birth_date || '-'}\n`;
    infoText += `年龄：${calculateAge(parrot.birth_date)}\n`;
    infoText += `圈号：${parrot.ring_number || '-'}\n`;
    infoText += `状态：${statusText}\n`;
    infoText += `健康备注：${parrot.health_notes || '-'}\n\n`;

    if (photos.length > 0) {
      infoText += `【照片和视频】(${photos.length}个)\n\n`;
      photos.forEach((photo, index) => {
        const fileType = photo.file_type === 'video' ? '视频' : '照片';
        infoText += `${fileType} ${index + 1}: ${baseUrl}/uploads/${photo.file_path}\n`;
      });
    }

    try {
      await navigator.clipboard.writeText(infoText);
      message.success('信息已复制到剪贴板');
    } catch (error) {
      message.error('复制失败，请手动复制');
    }
  };

  // const handleExportInfo = () => {
  //   const statusText = statusMap[parrot.status] || parrot.status;
  //   const baseUrl = window.location.origin;

  //   let exportText = `【鹦鹉详细信息】\n\n`;
  //   exportText += `品种：${parrot.breed}\n`;
  //   exportText += `性别：${parrot.gender}\n`;
  //   exportText += `价格：¥${Number(parrot.price).toFixed(2)}\n`;
  //   exportText += `出生日期：${parrot.birth_date || '-'}\n`;
  //   exportText += `年龄：${calculateAge(parrot.birth_date)}\n`;
  //   exportText += `圈号：${parrot.ring_number || '-'}\n`;
  //   exportText += `状态：${statusText}\n`;
  //   exportText += `健康备注：${parrot.health_notes || '-'}\n\n`;

  //   if (photos.length > 0) {
  //     exportText += `【照片和视频】(${photos.length}个)\n\n`;
  //     photos.forEach((photo, index) => {
  //       const fileType = photo.file_type === 'video' ? '视频' : '照片';
  //       exportText += `${fileType} ${index + 1}: ${baseUrl}/uploads/${photo.file_path}\n`;
  //     });
  //   }

  //   exportText += `\n导出时间：${new Date().toLocaleString('zh-CN')}`;

  //   // Create and download text file
  //   const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
  //   const url = URL.createObjectURL(blob);
  //   const link = document.createElement('a');
  //   link.href = url;
  //   link.download = `鹦鹉信息_${parrot.breed}_${parrot.ring_number || parrot.id}.txt`;
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  //   URL.revokeObjectURL(url);
  // };

  // 打包下载所有文件
  const handleDownloadAll = async () => {
    if (photos.length === 0) {
      message.warning('没有可下载的照片或视频');
      return;
    }

    message.loading('正在准备下载...', 0);

    // 逐个下载文件
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const url = `/uploads/${photo.file_path}`;

      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${parrot.breed}_${i + 1}_${photo.file_name}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);

        // 延迟一下避免浏览器阻止多个下载
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('下载失败:', error);
      }
    }

    message.destroy();
    message.success(`已下载 ${photos.length} 个文件，可直接上传到闲鱼、小红书等平台`);
  };

  return (
    <div>
      <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <Button icon={<CopyOutlined />} onClick={handleCopyInfo}>
          复制文字
        </Button>
        <Button 
          icon={<ShareAltOutlined />} 
          onClick={handleGenerateShareLink} 
          type="primary"
          loading={generatingLink}
        >
          生成分享链接
        </Button>
        <Button icon={<DownloadOutlined />} onClick={handleDownloadAll}>
          下载全部文件
        </Button>
      </div>

      {/* 分享链接列表 */}
      {shareLinks.length > 0 && (
        <div style={{ 
          marginBottom: '16px', 
          padding: '12px', 
          background: '#f6ffed', 
          border: '1px solid #b7eb8f',
          borderRadius: '8px' 
        }}>
          <div style={{ marginBottom: '8px', fontWeight: 500, color: '#52c41a' }}>
            <LinkOutlined /> 已生成的分享链接 ({shareLinks.length})
          </div>
          <List
            size="small"
            dataSource={shareLinks}
            loading={loadingShareLinks}
            renderItem={(link) => (
              <List.Item
                actions={[
                  <Tooltip title="复制链接" key="copy">
                    <Button 
                      type="link" 
                      size="small" 
                      icon={<CopyOutlined />}
                      onClick={() => handleCopyShareLink(link.url)}
                    />
                  </Tooltip>,
                  <Popconfirm
                    key="delete"
                    title="确认删除"
                    description="删除后该链接将无法访问"
                    onConfirm={() => handleDeleteShareLink(link.token)}
                    okText="确认"
                    cancelText="取消"
                  >
                    <Tooltip title="删除链接">
                      <Button 
                        type="link" 
                        size="small" 
                        danger
                        icon={<DeleteOutlined />}
                      />
                    </Tooltip>
                  </Popconfirm>
                ]}
              >
                <Space direction="vertical" size={0} style={{ flex: 1 }}>
                  <span style={{ 
                    fontSize: '12px', 
                    color: '#666',
                    wordBreak: 'break-all'
                  }}>
                    {link.url}
                  </span>
                  <span style={{ fontSize: '11px', color: '#999' }}>
                    剩余 {link.remaining_days} 天有效
                  </span>
                </Space>
              </List.Item>
            )}
          />
        </div>
      )}

      <Descriptions bordered column={2}>
        <Descriptions.Item label="圈号">{parrot.ring_number || '-'}</Descriptions.Item>
        <Descriptions.Item label="品种">{parrot.breed}</Descriptions.Item>
        <Descriptions.Item label="性别">{parrot.gender}</Descriptions.Item>
        <Descriptions.Item label="价格">¥{Number(parrot.price).toFixed(2)}</Descriptions.Item>
        <Descriptions.Item label="出生日期">{parrot.birth_date || '-'}</Descriptions.Item>
        <Descriptions.Item label="年龄">{calculateAge(parrot.birth_date)}</Descriptions.Item>
        <Descriptions.Item label="状态">
          <Tag color={statusColors[parrot.status] || 'default'}>{statusMap[parrot.status] || parrot.status}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="照片数量">{parrot.photo_count}</Descriptions.Item>
        <Descriptions.Item label="创建时间">{formatDateTime(parrot.created_at)}</Descriptions.Item>
        <Descriptions.Item label="更新时间">{formatDateTime(parrot.updated_at)}</Descriptions.Item>

        {/* 配偶信息 */}
        {mateInfo?.has_mate && mateInfo.mate && (
          <>
            <Descriptions.Item label="配偶" span={2}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HeartOutlined style={{ color: '#ff4d4f' }} />
                <span>{mateInfo.mate.breed} (圈号: {mateInfo.mate.ring_number || '无'})</span>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="配对时间">
              {formatDateTime(mateInfo.paired_at)}
            </Descriptions.Item>
            <Descriptions.Item label="配对时长">
              {calculatePairingDuration(mateInfo.paired_at)}
            </Descriptions.Item>
          </>
        )}

        {/* 销售信息 */}
        {(parrot.status === 'sold' || parrot.status === 'returned') && saleInfo && (
          <>
            <Descriptions.Item label="售卖人" span={2}>
              {saleInfo.seller || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="购买者" span={2}>
              {saleInfo.buyer_name || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="出售价格">
              ¥{Number(saleInfo.sale_price || 0).toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label="联系方式">
              {saleInfo.contact || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="回访状态" span={2}>
              <Tag color={
                saleInfo.follow_up_status === 'completed' ? 'green' :
                saleInfo.follow_up_status === 'no_contact' ? 'red' : 'blue'
              }>
                {saleInfo.follow_up_status === 'completed' ? '已回访' :
                 saleInfo.follow_up_status === 'no_contact' ? '无法联系' : '待回访'}
              </Tag>
            </Descriptions.Item>
            {saleInfo.notes && saleInfo.notes !== '-' && (
              <Descriptions.Item label="备注" span={2}>
                {saleInfo.notes}
              </Descriptions.Item>
            )}
          </>
        )}

        <Descriptions.Item label="健康备注" span={2}>
          {parrot.health_notes || '-'}
        </Descriptions.Item>
      </Descriptions>

      {/* 销售流程时间线 */}
      <div style={{ marginTop: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0' }}>销售流程</h3>
        {loadingTimeline ? (
          <div>加载中...</div>
        ) : (
          <Timeline
            mode="left"
            items={(salesTimeline.length > 0 ? salesTimeline : [
              // 如果没有时间线数据，显示基础信息
              {
                event: '出生',
                date: parrot.birth_date || parrot.created_at,
                description: parrot.birth_date ? '鹦鹉出生' : '出生日期未记录',
                type: 'birth'
              },
              {
                event: '录入系统',
                date: parrot.created_at,
                description: '鹦鹉信息录入系统',
                type: 'system'
              }
            ]).map((item: any) => {
              let color = 'blue';
              let dot = undefined;

              switch (item.type) {
                case 'birth':
                  color = 'cyan';
                  break;
                case 'system':
                  color = 'gray';
                  break;
                case 'sale':
                  color = 'green';
                  dot = <HeartOutlined style={{ fontSize: 16 }} />;
                  break;
                case 'return':
                  color = 'red';
                  break;
                case 'follow_up':
                  color = 'blue';
                  break;
              }

              // 将回访状态转换为中文
              let description = item.description;
              if (item.type === 'follow_up' && item.details) {
                const statusMap: Record<string, string> = {
                  'pending': '待回访',
                  'completed': '已回访',
                  'no_contact': '无法联系'
                };
                const statusText = statusMap[item.details.follow_up_status] || item.details.follow_up_status;
                description = `回访状态: ${statusText}, 备注: ${item.details.notes || '无'}`;
              } else if (item.type === 'follow_up') {
                // 如果没有details，从description中提取状态
                const statusMap: Record<string, string> = {
                  'pending': '待回访',
                  'completed': '已回访',
                  'no_contact': '无法联系'
                };
                // 尝试从description中提取英文状态并转换为中文
                Object.keys(statusMap).forEach(enStatus => {
                  if (item.description.includes(enStatus)) {
                    description = item.description.replace(enStatus, statusMap[enStatus]);
                  }
                });
              }

              return {
                color,
                dot,
                children: (
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                      {item.event} - {formatDateTime(item.date)}
                    </div>
                    <div style={{ color: '#666', fontSize: '14px' }}>
                      {description}
                    </div>
                  </div>
                ),
              };
            })}
          />
        )}
      </div>

      <div style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0 }}>照片和视频</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#999' }}>
              支持格式：png, jpg, gif, mp4, mov, avi, mkv, webm | 最大 500MB
            </p>
          </div>
          <Upload
            beforeUpload={handleUpload}
            showUploadList={false}
            accept="image/*,video/*"
            disabled={parrot.status === 'sold' || parrot.status === 'returned'}
          >
            <Button
              icon={<UploadOutlined />}
              loading={uploading}
              disabled={parrot.status === 'sold' || parrot.status === 'returned'}
              title={parrot.status === 'sold' || parrot.status === 'returned' ? '已售出或已退货的鹦鹉不能上传新照片和视频' : ''}
            >
              上传照片/视频
            </Button>
          </Upload>
        </div>

        {loadingPhotos ? (
          <div>加载中...</div>
        ) : photos && photos.length > 0 ? (
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {photos.map((photo) => (
              <div 
                key={photo.id} 
                style={{ 
                  position: 'relative', 
                  width: '150px', 
                  height: '150px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  backgroundColor: '#f5f5f5',
                }}
              >
                {photo.file_type === 'video' ? (
                  <video
                    width="150"
                    height="150"
                    controls
                    style={{ 
                      width: '150px',
                      height: '150px',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                    src={`/uploads/${photo.file_path}`}
                  >
                    您的浏览器不支持视频播放
                  </video>
                ) : (
                  <Image
                    width={150}
                    height={150}
                    src={`/uploads/${photo.file_path}`}
                    alt={photo.file_name}
                    style={{ 
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                )}
                {/* 删除按钮 */}
                <Popconfirm
                  title="确认删除"
                  description="确定要删除这张照片/视频吗？删除后无法恢复。"
                  onConfirm={() => handleDeletePhoto(photo.id)}
                  okText="确认"
                  cancelText="取消"
                >
                  <Button
                    type="primary"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      opacity: 0.8,
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title="删除"
                  />
                </Popconfirm>
              </div>
            ))}
          </div>
        ) : (
          <Empty description="暂无照片和视频" />
        )}
      </div>
    </div>
  );
};

export default ParrotDetail;
