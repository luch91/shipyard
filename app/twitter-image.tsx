import { createSocialImage, socialImageSize } from '@/lib/metadata/social-image'

export const alt = 'Shipyard — Deploy Intelligent Contracts on GenLayer'
export const size = socialImageSize
export const contentType = 'image/png'
export const runtime = 'edge'

export default function TwitterImage() {
  return createSocialImage()
}
