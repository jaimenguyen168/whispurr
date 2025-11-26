export const formatTime = (
  timestamp?: number,
  format: "smart" | "time" = "smart",
) => {
  if (!timestamp) return "";

  const messageDate = new Date(timestamp);

  if (format === "time") {
    // Simple time format
    return messageDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  // Smart format (default)
  const now = new Date();
  const diffInMs = now.getTime() - messageDate.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  if (diffInHours < 24) {
    // Same day - show time
    return messageDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } else if (diffInDays < 7) {
    // This week - show day
    return messageDate.toLocaleDateString([], { weekday: "short" });
  } else {
    // Older - show date
    return messageDate.toLocaleDateString([], {
      month: "2-digit",
      day: "2-digit",
    });
  }
};
