import { useEffect, useState } from 'react';
import { Descriptions, Tag, Image, Empty, Upload, Button, message, Timeline, Popconfirm } from 'antd';
import { UploadOutlined, CopyOutlined, DownloadOutlined, Html5Outlined, HeartOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Parrot, Photo } from '../types/parrot';
import { useParrot } from '../context/ParrotContext';
import { ParrotService } from '../services/parrotService';
import { calculateAge } from '../utils/dateUtils';
import { api } from '../services/api';

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
    if (parrot.status === 'sold' || parrot.status === 'returned') {
      fetchSaleInfo();
    }
    fetchSalesTimeline();
  }, [parrot.id]);

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

  // 生成HTML展示页面（包含图片和视频的完整展示）
  const handleExportHTML = async () => {
    const statusText = statusMap[parrot.status] || parrot.status;
    const baseUrl = window.location.origin;

    // 将图片转换为Base64以便离线查看
    const convertToBase64 = async (url: string): Promise<string> => {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } catch {
        return url; // 如果转换失败，返回原URL
      }
    };

    message.loading('正在生成HTML文件，请稍候...', 0);

    // 转换所有图片为Base64
    const mediaItems = await Promise.all(
      photos.map(async (photo) => {
        const url = `${baseUrl}/uploads/${photo.file_path}`;
        if (photo.file_type === 'image') {
          const base64 = await convertToBase64(url);
          return { ...photo, base64, originalUrl: url };
        }
        return { ...photo, base64: null, originalUrl: url };
      })
    );

    message.destroy();

    const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${parrot.breed} - 鹦鹉详情</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 { font-size: 28px; margin-bottom: 10px; }
        .header .price { font-size: 32px; font-weight: bold; }
        .info-section {
            padding: 30px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 30px;
        }
        .info-item {
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
        }
        .info-item label {
            display: block;
            font-size: 12px;
            color: #666;
            margin-bottom: 5px;
        }
        .info-item value {
            display: block;
            font-size: 16px;
            font-weight: 500;
            color: #333;
        }
        .status-tag {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 14px;
            font-weight: 500;
        }
        .status-available { background: #e6f7ff; color: #1890ff; }
        .status-sold { background: #f6ffed; color: #52c41a; }
        .status-breeding { background: #f9f0ff; color: #722ed1; }
        .status-returned { background: #fff2f0; color: #ff4d4f; }
        .media-section {
            padding: 0 30px 30px;
        }
        .media-section h2 {
            font-size: 18px;
            margin-bottom: 20px;
            color: #333;
        }
        .media-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 15px;
        }
        .media-item {
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .media-item img {
            width: 100%;
            height: 200px;
            object-fit: cover;
            display: block;
        }
        .media-item video {
            width: 100%;
            height: 200px;
            object-fit: cover;
            display: block;
            background: #000;
        }
        .footer {
            text-align: center;
            padding: 20px;
            background: #f8f9fa;
            color: #999;
            font-size: 12px;
        }
        .notes {
            padding: 15px;
            background: #fffbe6;
            border-radius: 8px;
            margin-top: 20px;
        }
        .notes label {
            font-size: 12px;
            color: #666;
        }
        .notes p {
            margin-top: 5px;
            color: #333;
        }
        .tip {
            background: #e6f7ff;
            border: 1px solid #91d5ff;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 30px;
            font-size: 14px;
            color: #1890ff;
        }
        @media (max-width: 600px) {
            .info-grid { grid-template-columns: 1fr; }
            .media-grid { grid-template-columns: repeat(2, 1fr); }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${parrot.breed}</h1>
            <div class="price">¥${Number(parrot.price).toFixed(2)}</div>
        </div>

        <div class="info-section">
            <div class="info-grid">
                <div class="info-item">
                    <label>圈号</label>
                    <value>${parrot.ring_number || '-'}</value>
                </div>
                <div class="info-item">
                    <label>性别</label>
                    <value>${parrot.gender}</value>
                </div>
                <div class="info-item">
                    <label>年龄</label>
                    <value>${calculateAge(parrot.birth_date)}</value>
                </div>
                <div class="info-item">
                    <label>出生日期</label>
                    <value>${parrot.birth_date || '-'}</value>
                </div>
                <div class="info-item">
                    <label>状态</label>
                    <value><span class="status-tag status-${parrot.status}">${statusText}</span></value>
                </div>
                <div class="info-item">
                    <label>媒体数量</label>
                    <value>${photos.length} 个</value>
                </div>
            </div>

            ${parrot.health_notes ? `
            <div class="notes">
                <label>健康备注</label>
                <p>${parrot.health_notes}</p>
            </div>
            ` : ''}
        </div>

        <div class="tip">
            💡 提示：长按图片可以保存到手机相册，方便发送到微信、闲鱼、小红书等平台
        </div>

        ${mediaItems.length > 0 ? `
        <div class="media-section">
            <h2>照片和视频 (${mediaItems.length})</h2>
            <div class="media-grid">
                ${mediaItems.map((item, index) =>
                    item.file_type === 'video'
                        ? `<div class="media-item">
                            <video controls src="${item.originalUrl}">
                                您的浏览器不支持视频播放
                            </video>
                           </div>`
                        : `<div class="media-item">
                            <img src="${item.base64 || item.originalUrl}" alt="照片 ${index + 1}" />
                           </div>`
                ).join('')}
            </div>
        </div>
        ` : ''}

        <div class="footer">
            生成时间：${new Date().toLocaleString('zh-CN')}
        </div>
    </div>
</body>
</html>`;

    // 下载HTML文件
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `鹦鹉展示_${parrot.breed}_${parrot.ring_number || parrot.id}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    message.success('HTML展示页面已生成！用浏览器打开后可长按图片保存');
  };

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
        <Button icon={<Html5Outlined />} onClick={handleExportHTML} type="primary">
          生成展示页
        </Button>
        <Button icon={<DownloadOutlined />} onClick={handleDownloadAll}>
          下载全部文件
        </Button>
      </div>

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
        <Descriptions.Item label="创建时间">{parrot.created_at}</Descriptions.Item>
        <Descriptions.Item label="更新时间">{parrot.updated_at}</Descriptions.Item>

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
              {mateInfo.paired_at ? new Date(mateInfo.paired_at).toLocaleString('zh-CN') : '-'}
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
                      {item.event} - {item.date ? new Date(item.date).toLocaleString('zh-CN') : '未知'}
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
              <div key={photo.id} style={{ position: 'relative', width: '200px', height: '200px' }}>
                {photo.file_type === 'video' ? (
                  <video
                    width="200"
                    height="200"
                    controls
                    style={{ objectFit: 'cover', borderRadius: '8px' }}
                    src={`/uploads/${photo.file_path}`}
                  >
                    您的浏览器不支持视频播放
                  </video>
                ) : (
                  <Image
                    width={200}
                    height={200}
                    src={`/uploads/${photo.file_path}`}
                    alt={photo.file_name}
                    style={{ objectFit: 'cover', borderRadius: '8px' }}
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
                      opacity: 0.7,
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
