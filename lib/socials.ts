type SocialPlatformKey =
  | "instagram"
  | "facebook"
  | "linkedin"
  | "x"
  | "tiktok"
  | "youtube"
  | "website";

type SocialPlatformDefinition = {
  /** Canonical display label — also the datalist suggestion text. */
  label: string;
  /** Alternate spellings that should resolve to this platform. */
  aliases: string[];
  /** Build the target URL from a handle with any leading "@" already stripped. */
  buildUrl: (handle: string) => string;
};

// Add a new platform here — its label and aliases automatically flow into
// both the datalist suggestions and the platform-matching lookup below.
const SOCIAL_PLATFORMS: Record<SocialPlatformKey, SocialPlatformDefinition> = {
  instagram: {
    label: "Instagram",
    aliases: ["instagram", "ig"],
    buildUrl: (handle) => `https://instagram.com/${handle}`,
  },
  facebook: {
    label: "Facebook",
    aliases: ["facebook", "fb"],
    buildUrl: (handle) => `https://facebook.com/${handle}`,
  },
  linkedin: {
    label: "LinkedIn",
    aliases: ["linkedin"],
    buildUrl: (handle) => `https://linkedin.com/company/${handle}`,
  },
  x: {
    label: "X (Twitter)",
    aliases: ["x", "twitter", "x (twitter)"],
    buildUrl: (handle) => `https://x.com/${handle}`,
  },
  tiktok: {
    label: "TikTok",
    aliases: ["tiktok"],
    buildUrl: (handle) => `https://tiktok.com/@${handle}`,
  },
  youtube: {
    label: "YouTube",
    aliases: ["youtube", "yt"],
    buildUrl: (handle) => `https://youtube.com/@${handle}`,
  },
  website: {
    label: "Website",
    aliases: ["website", "web", "site"],
    buildUrl: (handle) => (/^https?:\/\//i.test(handle) ? handle : `https://${handle}`),
  },
};

/** Lowercase, alphanumeric-only key so minor variations (spacing, punctuation, case) still match. */
function normalize(text: string) {
  return text.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

const ALIAS_TO_KEY: Record<string, SocialPlatformKey> = Object.fromEntries(
  (Object.entries(SOCIAL_PLATFORMS) as [SocialPlatformKey, SocialPlatformDefinition][]).flatMap(
    ([key, def]) => def.aliases.map((alias) => [normalize(alias), key])
  )
);

/** Suggested platform names for the add/edit sponsor form's datalist. */
export const SOCIAL_PLATFORM_SUGGESTIONS: string[] = Object.values(SOCIAL_PLATFORMS).map(
  (def) => def.label
);

function resolveSocialPlatform(platform: string): SocialPlatformDefinition | null {
  const key = ALIAS_TO_KEY[normalize(platform)];
  return key ? SOCIAL_PLATFORMS[key] : null;
}

/**
 * Builds the clickable URL for a social handle, or null if the platform
 * doesn't match a known template (caller should render plain text instead).
 */
export function getSocialHandleUrl(platform: string, handle: string): string | null {
  const def = resolveSocialPlatform(platform);
  if (!def) return null;

  const cleanedHandle = handle.trim().replace(/^@/, "");
  if (!cleanedHandle) return null;

  return def.buildUrl(cleanedHandle);
}
