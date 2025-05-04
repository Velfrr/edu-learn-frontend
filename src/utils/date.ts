import { format, formatDistance } from 'date-fns';

export const formatDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    return format(date, 'MMM d, yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateStr;
  }
};

export const formatDateTime = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    return format(date, 'MMM d, yyyy h:mm a');
  } catch (error) {
    console.error('Error formatting date/time:', error);
    return dateStr;
  }
};

export const timeAgo = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    return formatDistance(date, new Date(), { addSuffix: true });
  } catch (error) {
    console.error('Error calculating time ago:', error);
    return dateStr;
  }
};
