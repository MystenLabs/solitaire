export function formatTimestamp(timestamp: number): string {
    const date = new Date(
      typeof timestamp === "string" ? Number(timestamp) : timestamp
    );
  
    const dateOptions: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short", // 'short' will give you abbreviated month names
      day: "numeric",
      timeZone: "UTC",
    };
  
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "UTC",
    };
  
    const formattedDate = new Intl.DateTimeFormat("en-US", dateOptions).format(
      date
    );
    const formattedTime = new Intl.DateTimeFormat("en-US", timeOptions).format(
      date
    );
    return `${formattedDate} ${formattedTime} UTC`;
  }