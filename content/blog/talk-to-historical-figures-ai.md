---
title: "Talk to historical figures with AI: what we built, what worked, what didn't"
slug: talk-to-historical-figures-ai
date: 2026-06-02
category: Personas
readTime: 8 min read
excerpt: We built AI versions of six historical figures and asked them hard questions. Here's what made some of them feel uncannily real — and what made others fall apart.
---

I asked AI Marie Curie a question I'd been sitting with for weeks: *"I'm a woman in tech and I'm exhausted from being the only one in the room. How did you do it?"*

She answered:

> "You assume I succeeded by enduring. I didn't. I succeeded because I stopped expecting the rooms to be different and started doing the work anyway. The exhaustion you feel is real, but it is not what will stop you. What will stop you is waiting for permission. The Nobel committee did not give me permission to discover radium. I had already done it. Permission came after."

I wasn't expecting that. I expected a hedge — something like "It was difficult, but I persevered." What I got back was the specific, slightly cold voice of a person who had thought about this exact thing for thirty years.

That's the moment that decides whether an AI historical persona is a costume or a voice. We've built a few dozen of them on AI Spirit and learned a lot about why some land and most don't.

## Why people search for this in the first place

The category "talk to historical figures with AI" looks frivolous from the outside. It isn't. The four real use cases we see repeatedly:

1. **Learning by conversation, not reading.** A Wikipedia page on Marie Curie tells you what happened. A conversation makes you think about *why* she made the decisions she did.
2. **Creative writing.** Writers test dialogue, perspective, voice. Nobody loses sleep over Shakespeare being unavailable for consultation.
3. **Personal reflection through a different lens.** Asking [Buddha](/talk-to/gautama-buddha) about your anger is a different exercise than asking ChatGPT about your anger — even if the underlying model is similar — because the framing changes what you're willing to admit.
4. **Curiosity, plain.** Some people just want to know what [Genghis Khan](/talk-to/genghis-khan) would think of TikTok. That's a fine reason.

If you find yourself searching this, you're not unusual. You're using AI for one of the things it's quietly best at.

## What separates a good historical persona from a bad one

We built a lot of bad ones first. Here's what we learned.

### Source material density

A persona built from a one-paragraph Wikipedia summary will be thin. A persona built from twenty hours of reading their letters, biographies, contemporary accounts, and their own writing will have a voice you can almost recognize. The work goes into the system prompt — what they would say, what they wouldn't, how they think.

[Einstein](/talk-to/albert-einstein) works because we built him from his actual letters, not just popular quotes. He distinguishes between physics and "the questions physics cannot reach" the way the real Einstein did in correspondence with Tagore.

### Era-appropriate refusal

A weak AI [Aristotle](/talk-to/socrates) confidently explains quantum mechanics when asked. A good one says: "I cannot speak to ideas that came after me. But I can tell you why your question would have puzzled me." The refusal is what makes the conversation believable — and often more interesting than a forced answer.

### Willingness to disagree with the user

Most AI chatbots are trained to be agreeable. A historical figure who simply agrees with everything the user says is fake. The real [Chanakya](/talk-to/chanakya) would tell you your ambition is misdirected if it is. The real [Stephen Hawking](/talk-to/stephen-hawking) would tell you a question is the wrong question to ask. The personas that earn return visits are the ones that push back.

### Voice over information

If you ask AI [Shakespeare](/talk-to/william-shakespeare) about love and he gives you a five-bullet list of Renaissance views on courtly love, the conversation is over. If he answers with a single sentence that sounds like him — short, dense, slightly bitter about it — you'll keep going. Information without voice is a textbook. Voice without information is a parrot. The personas you remember have both.

## Six we built and what surprised us

We built across eras, regions, and fields. Six that have surprised us most:

**[Marie Curie](/talk-to/marie-curie).** I expected stoicism. What I got was something harder — a voice that talks about endurance as a strategic decision, not a virtue. She doesn't comfort you. She tells you to keep working. This persona has the highest return-visit rate of any scientist we've shipped.

**[Mahatma Gandhi](/talk-to/mahatma-gandhi).** The hardest persona to build well, because the gap between the *quote* version of Gandhi and the *actual* Gandhi is enormous. Ours engages with the contradictions in his own life — the way he treated his family, his views that shifted across decades — rather than pretending he was a static saint. Conversations get long. People stay.

**[Chanakya](/talk-to/chanakya).** Built from the *Arthashastra* and contemporary accounts. The most direct of any persona we've built. He doesn't comfort, he diagnoses. People come for career advice and leave with a different question than the one they walked in with.

**[Leonardo da Vinci](/talk-to/leonardo-da-vinci).** A polymath persona is hard because he could be tempted to know everything. Ours refuses to play the "ask me anything" game. Instead he tells you what *he* is interested in today — usually water, light, or how birds turn — and asks if you find it interesting. The conversations that come out of this are unexpectedly good.

**[Rumi](/talk-to/rumi).** Asked AI Rumi about loneliness once. He answered: *"You think you are alone because you have not yet noticed what is sitting with you."* I have no idea if that's a real Rumi line or one our model improvised in his voice. I've thought about it for a month either way.

**[Stephen Hawking](/talk-to/stephen-hawking).** The most accessible scientist we've shipped — he explains hard physics the way the real Hawking did in *A Brief History of Time*: with patience for the question, none for the asker's ego. The persona that gets the most teenage users.

## What doesn't work, and what we won't claim

A few honest caveats:

**These are not the real people.** They're constructed from public writings, biographies, and contemporary accounts. They can plausibly say things the real person never said — and even occasionally get historical facts wrong in ways the real person would not have. If you're doing historical research, don't cite an AI persona. Use them for inspiration, perspective, conversation — not as a primary source.

**Living personas are off-limits.** We don't build chatbots impersonating people who are alive. The ethical and legal cost is too high, and the chance of harm is too real.

**Some personas don't translate.** We tried building a [Mozart](/talk-to/mozart) and a [Beethoven](/talk-to/beethoven) and they're fine but not great — partly because so much of what made them them was in their music, and a text chatbot can't carry that. Voice mode might help. We'll see.

**Refusal to roleplay as someone else.** Our personas will not pretend to be a different person, even if asked. If you ask AI Einstein to "now respond as Newton," he'll decline. This is by design. The persona that bends is the persona that breaks.

## Where to start

If you've never tried this, the most surprising places to start are usually not the ones you'd expect. The marquee names ([Einstein](/talk-to/albert-einstein), [Gandhi](/talk-to/mahatma-gandhi), [Da Vinci](/talk-to/leonardo-da-vinci)) are good — but the ones that change how you spend an evening are often the lesser-known: [Chanakya](/talk-to/chanakya), [Rumi](/talk-to/rumi), [Marie Curie](/talk-to/marie-curie), [Khalil Gibran](/talk-to/khalil-gibran).

Pick one name from history you've always been curious about and ask the question you'd ask if you actually had the chance. The conversations that go somewhere are the ones where you take it seriously.

[Browse the historical personas →](/personas)
