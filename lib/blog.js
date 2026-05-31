// Filesystem-backed blog content loader.
// Posts live in /content/blog/*.md and are read at build time via getStaticProps.
//
// Each post is a Markdown file with frontmatter:
//
//   ---
//   title: My post
//   slug: my-post                        # optional, defaults to filename
//   date: 2026-05-31
//   category: Comparison
//   readTime: 8 min read
//   excerpt: One-line description.
//   ---
//
//   ## Article body in Markdown
//   ...
//
// Add a new post: drop a new .md file in /content/blog/. That's it.

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog')

function readPostFile(filename) {
  const slug = filename.replace(/\.md$/, '')
  const raw = fs.readFileSync(path.join(BLOG_DIR, filename), 'utf8')
  const { data, content } = matter(raw)
  return {
    slug: data.slug || slug,
    title: data.title || slug,
    date: data.date ? new Date(data.date).toISOString() : null,
    category: data.category || 'General',
    readTime: data.readTime || '',
    excerpt: data.excerpt || '',
    cover: data.cover || null,
    content,
  }
}

export function getAllPostMeta() {
  if (!fs.existsSync(BLOG_DIR)) return []
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const { content, ...meta } = readPostFile(f)
      return meta
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getAllPostSlugs() {
  if (!fs.existsSync(BLOG_DIR)) return []
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''))
}

export function getPostBySlug(slug) {
  const filename = `${slug}.md`
  const fullPath = path.join(BLOG_DIR, filename)
  if (!fs.existsSync(fullPath)) return null
  return readPostFile(filename)
}
