import { useState } from "react";
import { useEventShare } from "../hooks/useEventShare";
import {
  FiShare2,
  FiFacebook,
  FiTwitter,
  FiShare,
  FiCopy,
} from "react-icons/fi";
import toast from "react-hot-toast";

interface EventShareComponentProps {
  eventId: string;
  eventTitle: string;
}

export const EventShareComponent: React.FC<EventShareComponentProps> = ({
  eventId,
}) => {
  const { createShare, loading } = useEventShare();
  const [shareLinks, setShareLinks] = useState<{
    [key: string]: string;
  }>({});

  const platforms = [
    { name: "facebook", label: "Facebook", icon: FiFacebook },
    { name: "twitter", label: "Twitter", icon: FiTwitter },
    { name: "whatsapp", label: "WhatsApp", icon: FiShare },
  ];

  const handleShare = async (platform: string) => {
    try {
      const result = await createShare(eventId, platform);
      if (result) {
        setShareLinks((prev) => ({
          ...prev,
          [platform]: result.shareUrl,
        }));

        // Open share URL if available
        if (result.shareUrl) {
          window.open(result.shareUrl, "_blank", "width=600,height=400");
        }
      }
    } catch (error) {
      console.error(`Failed to share on ${platform}:`, error);
    }
  };

  const copyToClipboard = async (platform: string) => {
    const link = shareLinks[platform];
    if (link) {
      try {
        await navigator.clipboard.writeText(link);
        toast.success("Share link copied!");
      } catch (error) {
        toast.error("Failed to copy link");
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <FiShare2 className="text-blue-600" />
          Share Event
        </h3>
      </div>

      {/* Share Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {platforms.map((platform) => {
          const IconComponent = platform.icon;
          return (
            <button
              key={platform.name}
              onClick={() => handleShare(platform.name)}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IconComponent className="w-5 h-5" />
              <span className="font-semibold text-gray-700">
                {platform.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Share Links Display */}
      {Object.keys(shareLinks).length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600 font-semibold mb-3">Share Links</p>
          {Object.entries(shareLinks).map(([platform]) => (
            <div
              key={platform}
              className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
            >
              <span className="text-sm text-gray-600 capitalize font-medium">
                {platform}
              </span>
              <button
                onClick={() => copyToClipboard(platform)}
                className="flex items-center gap-2 px-3 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
              >
                <FiCopy className="w-4 h-4" />
                Copy
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Share Tip */}
      <p className="mt-4 text-xs text-gray-500 italic">
        💡 Tip: Share on multiple platforms to reach more people and increase
        ticket sales!
      </p>
    </div>
  );
};
