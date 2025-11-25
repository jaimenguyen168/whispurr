export const formatTime = (timestamp?: number) => {
  if (!timestamp) return "";

  const now = new Date();
  const messageDate = new Date(timestamp);
  const diffInMs = now.getTime() - messageDate.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  if (diffInHours < 24) {
    // Same day - show time
    return messageDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
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
