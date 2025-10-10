/**
 * Calculate the duration between two timestamps
 * @param startTime - Start timestamp in ISO format
 * @param endTime - End timestamp in ISO format
 * @returns Formatted duration string (e.g., "2h 30m")
 */
export const calculateDuration = (startTime: string, endTime: string): string => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffMs = end.getTime() - start.getTime();
  
  if (diffMs < 0) return "0m";
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours === 0) {
    return `${minutes.toString()}m`;
  }
  
  return `${hours.toString()}h ${minutes.toString()}m`;
};

/**
 * Format a date to a human-readable string
 * @param isoDate - ISO format date string
 * @returns Formatted date string
 */
export const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Format a time to a human-readable string
 * @param isoDate - ISO format date string
 * @returns Formatted time string
 */
export const formatTime = (isoDate: string): string => {
  const date = new Date(isoDate);
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
};
