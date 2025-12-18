import moment from 'moment';
import 'moment/locale/zh-cn';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

// 设置中文国际化
moment.locale('zh-cn');
dayjs.locale('zh-cn');

export { moment, dayjs };
