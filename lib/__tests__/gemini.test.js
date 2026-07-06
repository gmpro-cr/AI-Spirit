/**
 * Tests for the reasoning-leak defenses in lib/gemini.js.
 */

import { stripReasoning, looksLikeLeakedReasoning } from '../gemini'

describe('stripReasoning', () => {
  it('removes a complete <think> block', () => {
    const input = '<think>plotting the reply</think>Hello there!'
    expect(stripReasoning(input)).toBe('Hello there!')
  })

  it('removes a complete <reasoning> block regardless of case', () => {
    const input = '<REASONING>internal notes</REASONING>Final answer.'
    expect(stripReasoning(input)).toBe('Final answer.')
  })

  it('drops everything after an unterminated <think> tag', () => {
    const input = 'Final answer.<think>still generating'
    expect(stripReasoning(input)).toBe('Final answer.')
  })

  it('extracts only the harmony "final" channel message', () => {
    const input =
      '<|channel|>analysis<|message|>internal plan<|end|>' +
      '<|channel|>final<|message|>The actual reply<|return|>'
    expect(stripReasoning(input)).toBe('The actual reply')
  })

  it('returns empty string for non-string input', () => {
    expect(stripReasoning(null)).toBe('')
    expect(stripReasoning(undefined)).toBe('')
  })

  it('leaves ordinary text untouched', () => {
    expect(stripReasoning("It's huge, it works, and it's already saving lives!"))
      .toBe("It's huge, it works, and it's already saving lives!")
  })
})

describe('looksLikeLeakedReasoning', () => {
  it('flags real captured untagged reasoning leak (Nemotron, Donald Trump persona)', () => {
    const leaked = `We are in the 18th conversation, and we've had 17 deep conversations before. The user is asking "who are you?" which is a very basic question. According to the rules, for a short question (which this is), I must respond in one sentence only.

As Donald Trump, I should be direct, confident, and use my characteristic style. But wait, the rules say "Greetings = 1 sentence ONLY". This is a greeting-like question, so I must stick to one sentence.

But wait, the background says "47th" so I should use that? Actually, no: the next president after me would be the 46th.`
    expect(looksLikeLeakedReasoning(leaked)).toBe(true)
  })

  it('does not flag a normal short in-character reply', () => {
    expect(looksLikeLeakedReasoning("I'm Donald J. Trump, the 45th and 47th President of the United States.")).toBe(false)
  })

  it('does not flag a normal longer in-character reply', () => {
    const reply = "Let me tell you something, folks — the economy under me was the best economy this country has ever seen. Tremendous jobs, tremendous growth, and everybody said so."
    expect(looksLikeLeakedReasoning(reply)).toBe(false)
  })

  it('flags text that opens with "Let me think"', () => {
    expect(looksLikeLeakedReasoning('Let me think about how to phrase this in character.')).toBe(true)
  })

  it('flags text with two or more self-correction markers even without a reasoning-style opening', () => {
    const text = "It's a good question. But wait, that's not quite right. Actually, no, let me clarify what I mean."
    expect(looksLikeLeakedReasoning(text)).toBe(true)
  })

  it('returns false for empty or non-string input', () => {
    expect(looksLikeLeakedReasoning('')).toBe(false)
    expect(looksLikeLeakedReasoning(null)).toBe(false)
    expect(looksLikeLeakedReasoning(undefined)).toBe(false)
  })
})
