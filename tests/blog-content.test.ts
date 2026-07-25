import { describe, expect, it } from 'vitest'
import {
  BLOG_PILLARS,
  BLOG_POSTS,
  getBlogExample,
  getBlogPost,
  getContextualSiteNexisLinks,
  getRelatedBlogPosts,
} from '../lib/blog/posts'

describe('GenLayer Knowledge Center', () => {
  it('publishes 32 unique articles across all five content pillars', () => {
    const slugs = BLOG_POSTS.map((post) => post.slug)
    const usedPillars = new Set(BLOG_POSTS.map((post) => post.pillar))

    expect(BLOG_POSTS).toHaveLength(32)
    expect(new Set(slugs).size).toBe(slugs.length)
    expect(usedPillars).toEqual(new Set(BLOG_PILLARS))
    expect(slugs.every((slug) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))).toBe(true)
  })

  it('gives every article useful content and limits SiteNexis links to four articles', () => {
    let sitenexisArticleCount = 0
    for (const post of BLOG_POSTS) {
      expect(post.answer.length).toBeGreaterThan(100)
      expect(post.keyPoints).toHaveLength(3)
      expect(post.guidance).toHaveLength(3)
      expect(post.limits).toHaveLength(2)
      expect(post.sources.length).toBeGreaterThanOrEqual(2)
      const contextualLinks = getContextualSiteNexisLinks(post)
      expect(getRelatedBlogPosts(post)).toHaveLength(2)
      if (contextualLinks.length > 0) {
        sitenexisArticleCount += 1
        expect(contextualLinks).toHaveLength(3)
        expect(new Set(contextualLinks.map((link) => link.href)).size).toBe(3)
        expect(contextualLinks.every((link) => link.href.startsWith('https://sitenexis.vercel.app/blog/'))).toBe(true)
      } else {
        expect(contextualLinks).toHaveLength(0)
      }
    }
    expect(sitenexisArticleCount).toBe(4)
    expect(BLOG_POSTS.filter((post) => getBlogExample(post.slug)).length).toBeGreaterThanOrEqual(10)
  })

  it('uses simplified text without em dashes', () => {
    expect(JSON.stringify(BLOG_POSTS)).not.toContain(String.fromCharCode(0x2014))
  })

  it('finds a post by its canonical slug', () => {
    const first = BLOG_POSTS[0]
    expect(getBlogPost(first.slug)).toBe(first)
    expect(getBlogPost('not-a-post')).toBeUndefined()
  })
})
