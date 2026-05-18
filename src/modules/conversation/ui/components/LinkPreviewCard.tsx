import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Linking, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { getLinkPreview } from "link-preview-js";

interface PreviewData {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  domain: string;
}

const previewCache = new Map<string, PreviewData | null>();

interface LinkPreviewCardProps {
  url: string;
  isFromOtherUser: boolean;
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

const LinkPreviewCard = ({ url, isFromOtherUser }: LinkPreviewCardProps) => {
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // Serve from cache immediately if available
    if (previewCache.has(url)) {
      const cached = previewCache.get(url);
      if (cached === null) {
        setFailed(true);
      } else {
        setPreview(cached!);
      }
      setLoading(false);
      return;
    }

    setLoading(true);
    setFailed(false);
    setPreview(null);

    getLinkPreview(url, {
      timeout: 5000,
      headers: { "user-agent": "Mozilla/5.0 (compatible; Whispurr/1.0)" },
      resolveDNSHost: async (url: string) => url,
    })
      .then((data: any) => {
        if (cancelled) return;
        const image = data.images?.[0] ?? data.favicons?.[0] ?? null;
        if (!data.title && !image) {
          previewCache.set(url, null);
          setFailed(true);
        } else {
          const result: PreviewData = {
            title: data.title,
            description: data.description,
            image,
            siteName: data.siteName,
            domain: extractDomain(url),
          };
          previewCache.set(url, result);
          setPreview(result);
        }
      })
      .catch(() => {
        if (!cancelled) {
          previewCache.set(url, null);
          setFailed(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [url]);

  if (failed) return null;

  const cardBg = isFromOtherUser
    ? "bg-secondary-100 dark:bg-secondary-600"
    : "bg-white/15";
  const titleColor = isFromOtherUser
    ? "text-secondary-800 dark:text-secondary-50"
    : "text-white";
  const metaColor = isFromOtherUser
    ? "text-secondary-500 dark:text-secondary-300"
    : "text-white/70";

  if (loading) {
    return (
      <View className={`mt-2 rounded-xl overflow-hidden ${cardBg}`}>
        <View className="px-3 py-2 items-center justify-center h-12">
          <ActivityIndicator size="small" color={isFromOtherUser ? "#9CA3AF" : "rgba(255,255,255,0.6)"} />
        </View>
      </View>
    );
  }

  if (!preview) return null;

  return (
    <TouchableOpacity
      className={`mt-2 rounded-xl overflow-hidden ${cardBg}`}
      onPress={() => Linking.openURL(url)}
      activeOpacity={0.8}
    >
      {preview.image && (
        <Image
          source={preview.image}
          style={{ width: "100%", height: 140 }}
          contentFit="cover"
        />
      )}
      <View className="px-3 py-2">
        <Text className={`text-xs font-semibold uppercase tracking-wide mb-0.5 ${metaColor}`}>
          {preview.siteName || preview.domain}
        </Text>
        {preview.title ? (
          <Text className={`text-sm font-semibold leading-tight ${titleColor}`} numberOfLines={2}>
            {preview.title}
          </Text>
        ) : null}
        {preview.description ? (
          <Text className={`text-xs mt-0.5 ${metaColor}`} numberOfLines={2}>
            {preview.description}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

export default LinkPreviewCard;
