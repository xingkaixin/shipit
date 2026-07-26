import type { ReleaseComposition } from "@/video/release-video"

export function releaseVideoFileName(composition: ReleaseComposition): string {
  const releaseName =
    `${composition.content.productName}-${composition.content.version}`
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
      .replace(/^-+|-+$/g, "")

  return `${releaseName || "shipit-release"}.mp4`
}
