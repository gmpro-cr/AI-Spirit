/**
 * toPlainText feeds the copy button and TTS. Anything it leaves behind gets
 * read aloud as literal punctuation, so the markdown must come out cleanly —
 * including single-asterisk roleplay actions, which the old formatter never
 * handled at all.
 */

import { toPlainText } from '@/lib/plainText'
import { relativeTime, dateGroup } from '@/lib/relativeTime'

describe('toPlainText', () => {
  it('unwraps bold and italics', () => {
    expect(toPlainText('**Beloved**, this is *important*.')).toBe('Beloved, this is important.')
  })

  it('unwraps roleplay actions written with single asterisks', () => {
    expect(toPlainText('*smiles softly* Come, sit.')).toBe('smiles softly Come, sit.')
  })

  it('handles bold-italic and strikethrough', () => {
    expect(toPlainText('***loud*** and ~~gone~~')).toBe('loud and gone')
  })

  it('keeps link text and drops the target', () => {
    expect(toPlainText('See [the docs](https://example.com) now')).toBe('See the docs now')
  })

  it('keeps image alt text', () => {
    expect(toPlainText('![a lotus](/lotus.png)')).toBe('a lotus')
  })

  it('strips headings, quotes and list markers', () => {
    const input = ['## Three things', '', '- one', '- two', '', '> a quote'].join('\n')
    expect(toPlainText(input)).toBe('Three things\n\none\ntwo\n\na quote')
  })

  it('keeps code contents without the fences', () => {
    expect(toPlainText('```js\nconst a = 1\n```')).toBe('const a = 1')
    expect(toPlainText('call `run()` first')).toBe('call run() first')
  })

  it('flattens table rows', () => {
    expect(toPlainText('| a | b |')).toBe('a   b')
  })

  it('is safe on empty and nullish input', () => {
    expect(toPlainText('')).toBe('')
    expect(toPlainText(undefined)).toBe('')
    expect(toPlainText(null)).toBe('')
  })
})

describe('relativeTime', () => {
  const at = (ms) => new Date(Date.now() - ms).toISOString()

  it('reports fresh timestamps as just now', () => {
    expect(relativeTime(at(5 * 1000))).toBe('just now')
  })

  it('reports minutes and hours', () => {
    expect(relativeTime(at(5 * 60 * 1000))).toBe('5m ago')
    expect(relativeTime(at(3 * 60 * 60 * 1000))).toBe('3h ago')
  })

  it('never renders "0m ago" in the sub-minute band', () => {
    // A 45s cutoff used to leave 45-59s flooring to zero minutes.
    for (const seconds of [44, 45, 50, 59]) {
      expect(relativeTime(at(seconds * 1000))).toBe('just now')
    }
    expect(relativeTime(at(61 * 1000))).toBe('1m ago')
  })

  it('returns an empty string for missing or invalid values', () => {
    expect(relativeTime(null)).toBe('')
    expect(relativeTime('not a date')).toBe('')
  })
})

describe('dateGroup', () => {
  const at = (ms) => new Date(Date.now() - ms).toISOString()
  const DAY = 86400000

  it('buckets by recency', () => {
    expect(dateGroup(at(60 * 1000))).toBe('Today')
    expect(dateGroup(at(3 * DAY))).toBe('Previous 7 days')
    expect(dateGroup(at(20 * DAY))).toBe('Previous 30 days')
    expect(dateGroup(at(200 * DAY))).toBe('Earlier')
  })
})
