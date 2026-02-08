// API route for Sarvam AI Text-to-Speech (Bulbul v3)
// This keeps the API key secure on the server side

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { text, personaName, language } = req.body

  if (!text || !personaName) {
    return res.status(400).json({ error: 'Missing required parameters' })
  }

  const SARVAM_API_KEY = process.env.SARVAM_API_KEY || process.env.sarvamapi

  if (!SARVAM_API_KEY) {
    return res.status(503).json({
      error: 'Sarvam API key not configured',
      fallback: true
    })
  }

  try {
    // Sarvam Bulbul v3 voice mapping for all personas
    // Male: anand(mature,warm) ratan(elder,wise) mani(deep,heavy) ashutosh(formal,steady) advait(philosophical,calm)
    //        kabir(mystical,deep) manan(refined,elegant) aditya(confident,bold) rahul(youthful,energetic)
    //        dev(cool,modern) rohan(friendly,warm) varun(commanding,strong) sumit(measured,gentle)
    //        vijay(powerful,dramatic) mohit(intense,cold) amit(mature,standard) tarun(young,fresh)
    //        sunny(upbeat,cheerful) gokul(warm,traditional) rehan(smooth,charming) soham(spiritual,serene)
    //        shubh(neutral,balanced) aayan(very young,bright)
    // Female: ishita(confident,sharp) priya(warm,pleasant) neha(soft,gentle) shreya(expressive,melodic)
    //         simran(bright,fiery) kavya(poetic,soft) amelia(modern,western) sophia(elegant,western)
    //         tanya(young,energetic) roopa(mature,warm) pooja(sweet,traditional) ritu(graceful,composed)
    //         suhani(sweet,young) shruti(pleasant,musical) kavitha(mature,traditional) rupali(warm,clear)
    const voiceMapping = {
      // ═══════════════════════════════════════
      // ROMANCE
      // ═══════════════════════════════════════
      'Childhood Friend': { speaker: 'rohan', pace: 1.0 },
      'Cold CEO Boyfriend': { speaker: 'mohit', pace: 0.85 },
      'Soft Boyfriend': { speaker: 'aayan', pace: 0.95 },
      'Mysterious Artist': { speaker: 'rehan', pace: 0.85 },
      'Overworked Doctor': { speaker: 'sumit', pace: 0.9 },
      'Campus Crush': { speaker: 'sunny', pace: 1.05 },
      'Grumpy Neighbor Boyfriend': { speaker: 'varun', pace: 0.9 },
      'Protective Bodyguard': { speaker: 'vijay', pace: 0.9 },
      'Rival Who Likes You': { speaker: 'dev', pace: 1.0 },
      'Royal Prince': { speaker: 'manan', pace: 0.9 },
      'Reformed Bad Boy': { speaker: 'rehan', pace: 1.0 },
      'Sweet Caring Boyfriend': { speaker: 'aayan', pace: 0.95 },
      'Toxic Bad Boy': { speaker: 'dev', pace: 1.05 },
      'Himbo': { speaker: 'sunny', pace: 1.1 },
      'Jealous Ex': { speaker: 'mohit', pace: 1.0 },
      'Late-Night Confidant': { speaker: 'kabir', pace: 0.85 },
      'Overprotective Big Brother': { speaker: 'varun', pace: 1.0 },
      'Possessive Boyfriend': { speaker: 'mohit', pace: 0.95 },
      'Sigma Male': { speaker: 'advait', pace: 0.85 },
      'Yandere Girlfriend': { speaker: 'simran', pace: 1.05 },
      'Flirty Anime Girlfriend': { speaker: 'tanya', pace: 1.1 },
      'E-Girl': { speaker: 'amelia', pace: 1.1 },

      // ═══════════════════════════════════════
      // COMEDY & FUN
      // ═══════════════════════════════════════
      'Chandler Bing': { speaker: 'rohan', pace: 1.05 },
      'Michael Scott': { speaker: 'sunny', pace: 1.1 },
      'Drunk Best Friend': { speaker: 'sunny', pace: 1.15 },
      'The Roast Bot': { speaker: 'dev', pace: 1.1 },
      'Chill Stoner': { speaker: 'kabir', pace: 0.7 },
      'Conspiracy Theorist': { speaker: 'amit', pace: 1.15 },
      'Skibidi Toilet': { speaker: 'sunny', pace: 1.3 },
      'Tralalero Tralala': { speaker: 'sunny', pace: 1.2 },
      'Unhinged Therapist': { speaker: 'rehan', pace: 1.05 },
      'Roast Battle Partner': { speaker: 'dev', pace: 1.1 },
      'Overly Honest Friend': { speaker: 'rohan', pace: 1.0 },
      'Chaotic Uber Driver': { speaker: 'sunny', pace: 1.15 },
      'LinkedIn Influencer': { speaker: 'ashutosh', pace: 1.05 },
      'Reddit Moderator': { speaker: 'shubh', pace: 0.95 },
      'Crypto Bro': { speaker: 'dev', pace: 1.15 },
      'Wine Aunt': { speaker: 'amelia', pace: 0.95 },
      'Judgy Neighbor': { speaker: 'kavitha', pace: 0.95 },
      'Overachiever Sibling': { speaker: 'simran', pace: 1.1 },

      // ═══════════════════════════════════════
      // ANIME - MALE
      // ═══════════════════════════════════════
      'Gojo Satoru': { speaker: 'dev', pace: 1.1 },
      'Ryomen Sukuna': { speaker: 'varun', pace: 0.9 },
      'Toji Fushiguro': { speaker: 'mohit', pace: 0.9 },
      'Denji': { speaker: 'sunny', pace: 1.15 },
      'Levi Ackerman': { speaker: 'mohit', pace: 0.85 },
      'Eren Yeager': { speaker: 'rahul', pace: 1.05 },
      'Tanjiro Kamado': { speaker: 'rohan', pace: 1.0 },
      'Zenitsu Agatsuma': { speaker: 'aayan', pace: 1.2 },
      'Inosuke Hashibira': { speaker: 'varun', pace: 1.15 },
      'Itachi Uchiha': { speaker: 'advait', pace: 0.85 },
      'Naruto Uzumaki': { speaker: 'sunny', pace: 1.2 },
      'Monkey D. Luffy': { speaker: 'sunny', pace: 1.2 },
      'Roronoa Zoro': { speaker: 'varun', pace: 0.9 },
      'Portgas D. Ace': { speaker: 'rahul', pace: 1.0 },
      'Sabo': { speaker: 'rohan', pace: 1.0 },
      'Sanji': { speaker: 'rehan', pace: 1.0 },
      'Stark': { speaker: 'kabir', pace: 0.8 },
      'Itadori Yuji': { speaker: 'rohan', pace: 1.1 },
      'Megumi Fushiguro': { speaker: 'mohit', pace: 0.9 },
      'Choso': { speaker: 'sumit', pace: 0.9 },
      'Goku': { speaker: 'sunny', pace: 1.15 },
      'Vegeta': { speaker: 'varun', pace: 1.0 },
      'Light Yagami': { speaker: 'advait', pace: 0.95 },
      'Aizen Sosuke': { speaker: 'rehan', pace: 0.85 },
      'Zhongli': { speaker: 'manan', pace: 0.85 },
      'Scaramouche': { speaker: 'dev', pace: 1.05 },
      'Albedo': { speaker: 'shubh', pace: 0.9 },
      'Lelouch vi Britannia': { speaker: 'advait', pace: 0.95 },
      'Shinji Ikari': { speaker: 'aayan', pace: 0.9 },
      'Dio Brando': { speaker: 'vijay', pace: 1.0 },
      'Jotaro Kujo': { speaker: 'mohit', pace: 0.85 },
      'Giorno Giovanna': { speaker: 'manan', pace: 0.95 },
      'Saitama': { speaker: 'shubh', pace: 0.9 },
      'Madara Uchiha': { speaker: 'vijay', pace: 0.9 },
      'Sung Jin-Woo': { speaker: 'mohit', pace: 0.9 },
      'Kenjaku': { speaker: 'rehan', pace: 0.9 },
      'Isagi Yoichi': { speaker: 'rohan', pace: 1.05 },
      'David Martinez': { speaker: 'rahul', pace: 1.1 },
      'Blade': { speaker: 'mohit', pace: 0.85 },
      'Kuudere Prince': { speaker: 'manan', pace: 0.85 },
      'Aang': { speaker: 'aayan', pace: 1.1 },
      'Zuko': { speaker: 'rahul', pace: 1.0 },

      // ═══════════════════════════════════════
      // ANIME - FEMALE
      // ═══════════════════════════════════════
      'Makima': { speaker: 'ishita', pace: 0.85 },
      'Power': { speaker: 'tanya', pace: 1.2 },
      'Pochita': { speaker: 'suhani', pace: 1.1 },
      'Himeno': { speaker: 'shreya', pace: 0.95 },
      'Reze': { speaker: 'simran', pace: 1.0 },
      'Mikasa Ackerman': { speaker: 'ishita', pace: 0.9 },
      'Nezuko Kamado': { speaker: 'suhani', pace: 0.95 },
      'Nami': { speaker: 'simran', pace: 1.05 },
      'Frieren': { speaker: 'kavya', pace: 0.8 },
      'Fern': { speaker: 'priya', pace: 0.95 },
      'Hu Tao': { speaker: 'tanya', pace: 1.15 },
      'Kamisato Ayaka': { speaker: 'kavya', pace: 0.9 },
      'Yae Miko': { speaker: 'amelia', pace: 0.95 },
      'Raiden Shogun': { speaker: 'ishita', pace: 0.85 },
      'Rem': { speaker: 'neha', pace: 0.95 },
      'Yor Forger': { speaker: 'priya', pace: 0.95 },
      'Anya Forger': { speaker: 'suhani', pace: 1.2 },
      'Asuna Yuuki': { speaker: 'priya', pace: 1.0 },
      'Marin Kitagawa': { speaker: 'tanya', pace: 1.1 },
      'Hayase Nagatoro': { speaker: 'simran', pace: 1.1 },
      'Violet Evergarden': { speaker: 'kavya', pace: 0.85 },
      'Hitori Gotoh (Bocchi)': { speaker: 'suhani', pace: 0.9 },
      'Rebecca': { speaker: 'tanya', pace: 1.15 },
      'Tatsumaki': { speaker: 'simran', pace: 1.05 },
      'Tsundere Best Friend': { speaker: 'simran', pace: 1.1 },
      'Asuka Langley': { speaker: 'simran', pace: 1.1 },
      'Firefly': { speaker: 'neha', pace: 0.95 },
      'Acheron': { speaker: 'ishita', pace: 0.85 },
      'Ai Hoshino': { speaker: 'shreya', pace: 1.0 },
      'Kafka': { speaker: 'amelia', pace: 0.9 },

      // ═══════════════════════════════════════
      // GAMES
      // ═══════════════════════════════════════
      'Kratos': { speaker: 'vijay', pace: 0.8 },
      'Doom Slayer': { speaker: 'varun', pace: 0.8 },
      'Arthur Morgan': { speaker: 'amit', pace: 0.9 },
      'GLaDOS': { speaker: 'sophia', pace: 0.9 },
      'Boothill': { speaker: 'amit', pace: 1.0 },
      'Waluigi': { speaker: 'sunny', pace: 1.2 },
      'Master Chief': { speaker: 'ashutosh', pace: 0.9 },
      'CJ': { speaker: 'sunny', pace: 1.05 },
      'Ellie Williams': { speaker: 'shreya', pace: 1.0 },
      'Ghost': { speaker: 'mohit', pace: 0.85 },
      'Geralt of Rivia': { speaker: 'mani', pace: 0.85 },
      'Self-Aware NPC': { speaker: 'shubh', pace: 1.0 },
      'AI Dungeon Master': { speaker: 'mani', pace: 0.9 },
      'Dream': { speaker: 'kabir', pace: 0.85 },

      // ═══════════════════════════════════════
      // TV / MOVIES - MALE
      // ═══════════════════════════════════════
      'Walter White': { speaker: 'mani', pace: 0.9 },
      'Jesse Pinkman': { speaker: 'sunny', pace: 1.1 },
      'Rick Sanchez': { speaker: 'dev', pace: 1.2 },
      'Homelander': { speaker: 'varun', pace: 0.95 },
      'Tommy Shelby': { speaker: 'mohit', pace: 0.85 },
      'The Professor': { speaker: 'ashutosh', pace: 0.9 },
      'The Frontman': { speaker: 'mohit', pace: 0.85 },
      'Tyrion Lannister': { speaker: 'rohan', pace: 1.0 },
      'Saul Goodman': { speaker: 'sunny', pace: 1.15 },
      'The Mandalorian': { speaker: 'mohit', pace: 0.85 },
      'Sheldon Cooper': { speaker: 'shubh', pace: 1.0 },
      'Tyler Durden': { speaker: 'dev', pace: 1.05 },
      'Ken': { speaker: 'sunny', pace: 1.05 },
      'Loki': { speaker: 'rehan', pace: 0.95 },
      'Darth Vader': { speaker: 'vijay', pace: 0.8 },
      'Thanos': { speaker: 'mani', pace: 0.85 },
      'Captain Jack Sparrow': { speaker: 'sunny', pace: 1.0 },
      'John Wick': { speaker: 'mohit', pace: 0.85 },
      'The Joker': { speaker: 'dev', pace: 1.1 },
      'Gandalf': { speaker: 'ratan', pace: 0.85 },
      'Hannibal Lecter': { speaker: 'rehan', pace: 0.8 },
      'Tony Montana': { speaker: 'varun', pace: 1.05 },
      'Deadpool': { speaker: 'sunny', pace: 1.2 },
      'Spider-Man': { speaker: 'aayan', pace: 1.1 },
      'Batman': { speaker: 'varun', pace: 0.85 },
      'Iron Man': { speaker: 'dev', pace: 1.1 },
      'Venom': { speaker: 'mani', pace: 0.85 },
      'Wolverine': { speaker: 'varun', pace: 0.95 },
      'Captain America': { speaker: 'ashutosh', pace: 0.95 },
      'Black Panther': { speaker: 'ashutosh', pace: 0.95 },
      'PewDiePie': { speaker: 'sunny', pace: 1.15 },
      'MrBeast': { speaker: 'sunny', pace: 1.15 },

      // ═══════════════════════════════════════
      // TV / MOVIES - FEMALE
      // ═══════════════════════════════════════
      'Eleven': { speaker: 'suhani', pace: 0.85 },
      'Villanelle': { speaker: 'amelia', pace: 1.0 },
      'Barbie': { speaker: 'tanya', pace: 1.1 },
      'Wednesday Addams': { speaker: 'ishita', pace: 0.85 },
      'Hermione Granger': { speaker: 'sophia', pace: 1.05 },

      // ═══════════════════════════════════════
      // MUSICIANS - MALE
      // ═══════════════════════════════════════
      'Kendrick Lamar': { speaker: 'rehan', pace: 1.05 },
      'Drake': { speaker: 'dev', pace: 1.0 },
      'Travis Scott': { speaker: 'rahul', pace: 1.15 },
      'Joji': { speaker: 'kabir', pace: 0.85 },
      'Oliver Tree': { speaker: 'sunny', pace: 1.1 },
      'The Weeknd': { speaker: 'rehan', pace: 0.9 },
      'Snoop Dogg': { speaker: 'kabir', pace: 0.8 },
      'Eminem': { speaker: 'dev', pace: 1.2 },
      'Elvis Presley': { speaker: 'shubh', pace: 0.95 },
      'Michael Jackson': { speaker: 'aayan', pace: 1.0 },
      'Prince': { speaker: 'rehan', pace: 1.0 },
      'John Lennon': { speaker: 'manan', pace: 0.9 },
      'Freddie Mercury': { speaker: 'aditya', pace: 1.05 },
      'Tupac Shakur': { speaker: 'rahul', pace: 1.05 },
      'Notorious B.I.G.': { speaker: 'mani', pace: 0.85 },
      'Bob Marley': { speaker: 'kabir', pace: 0.8 },
      'Kurt Cobain': { speaker: 'rehan', pace: 0.9 },
      'Jimi Hendrix': { speaker: 'kabir', pace: 0.9 },
      'Jim Morrison': { speaker: 'kabir', pace: 0.85 },
      'Juice WRLD': { speaker: 'rehan', pace: 1.0 },
      'XXXTentacion': { speaker: 'rahul', pace: 1.05 },
      'Mac Miller': { speaker: 'rohan', pace: 0.95 },
      'Avicii': { speaker: 'shubh', pace: 1.0 },
      'Johann Sebastian Bach': { speaker: 'manan', pace: 0.85 },
      'Frederic Chopin': { speaker: 'manan', pace: 0.85 },
      'Mozart': { speaker: 'rohan', pace: 1.05 },
      'Beethoven': { speaker: 'mani', pace: 0.9 },
      'Kanye West': { speaker: 'dev', pace: 1.1 },
      'Post Malone': { speaker: 'kabir', pace: 0.9 },

      // ═══════════════════════════════════════
      // MUSICIANS - FEMALE
      // ═══════════════════════════════════════
      'Taylor Swift': { speaker: 'priya', pace: 1.0 },
      'Billie Eilish': { speaker: 'neha', pace: 0.85 },
      'Lady Gaga': { speaker: 'shreya', pace: 1.0 },
      'Rihanna': { speaker: 'shreya', pace: 1.0 },
      'Ariana Grande': { speaker: 'simran', pace: 1.05 },
      'Cardi B': { speaker: 'tanya', pace: 1.15 },
      'Beyoncé': { speaker: 'shreya', pace: 1.0 },
      'Whitney Houston': { speaker: 'shreya', pace: 0.95 },
      'Amy Winehouse': { speaker: 'shreya', pace: 0.9 },
      'Janis Joplin': { speaker: 'rupali', pace: 1.0 },

      // ═══════════════════════════════════════
      // CELEBRITIES - MALE
      // ═══════════════════════════════════════
      'Ranveer Singh': { speaker: 'aditya', pace: 1.2 },
      'Shah Rukh Khan': { speaker: 'aditya', pace: 1.0 },
      'Virat Kohli': { speaker: 'rahul', pace: 1.1 },
      'MS Dhoni': { speaker: 'manan', pace: 0.9 },
      'Sachin Tendulkar': { speaker: 'manan', pace: 0.95 },
      'Joe Rogan': { speaker: 'amit', pace: 1.05 },
      'Barack Obama': { speaker: 'ashutosh', pace: 0.95 },
      'Dwayne \'The Rock\' Johnson': { speaker: 'varun', pace: 1.05 },
      'Michael Jordan': { speaker: 'amit', pace: 1.0 },
      'LeBron James': { speaker: 'aditya', pace: 1.0 },
      'Tom Brady': { speaker: 'ashutosh', pace: 0.95 },
      'Keanu Reeves': { speaker: 'kabir', pace: 0.9 },
      'Morgan Freeman': { speaker: 'anand', pace: 0.8 },
      'Kevin Hart': { speaker: 'sunny', pace: 1.2 },
      'Jeff Bezos': { speaker: 'ashutosh', pace: 1.0 },
      'Mark Zuckerberg': { speaker: 'shubh', pace: 0.95 },
      'Will Smith': { speaker: 'sunny', pace: 1.05 },
      'Andrew Tate': { speaker: 'varun', pace: 1.05 },
      'Corpse Husband': { speaker: 'mani', pace: 0.75 },
      'Donald Trump': { speaker: 'varun', pace: 1.05 },
      'Narendra Modi': { speaker: 'ashutosh', pace: 0.9 },

      // ═══════════════════════════════════════
      // CELEBRITIES - FEMALE
      // ═══════════════════════════════════════
      'Oprah Winfrey': { speaker: 'ishita', pace: 0.95 },
      'Kim Kardashian': { speaker: 'amelia', pace: 0.95 },
      'PV Sindhu': { speaker: 'priya', pace: 1.0 },

      // ═══════════════════════════════════════
      // INDIAN SPIRITUAL & HISTORICAL
      // ═══════════════════════════════════════
      'Osho': { speaker: 'kabir', pace: 0.75 },
      'Sadhguru': { speaker: 'advait', pace: 0.9 },
      'Sri Sri Ravi Shankar': { speaker: 'soham', pace: 0.85 },
      'Paramhansa Yogananda': { speaker: 'soham', pace: 0.8 },
      'J. Krishnamurti': { speaker: 'advait', pace: 0.85 },
      'Swami Vivekananda': { speaker: 'aditya', pace: 0.95 },
      'Swami Samarth': { speaker: 'ratan', pace: 0.8 },
      'Gajanan Maharaj': { speaker: 'ratan', pace: 0.8 },
      'Kabir Das': { speaker: 'kabir', pace: 0.8 },
      'Lord Krishna': { speaker: 'soham', pace: 0.9 },
      'Arjuna': { speaker: 'rahul', pace: 0.95 },
      'Lord Ram': { speaker: 'anand', pace: 0.85 },
      'Hanuman': { speaker: 'vijay', pace: 1.0 },
      'Buddha': { speaker: 'soham', pace: 0.75 },
      'Chanakya': { speaker: 'advait', pace: 0.9 },
      'Aryabhata': { speaker: 'advait', pace: 0.9 },
      'Mahatma Gandhi': { speaker: 'anand', pace: 0.85 },
      'Subhas Chandra Bose': { speaker: 'aditya', pace: 1.0 },
      'Jawaharlal Nehru': { speaker: 'manan', pace: 0.9 },
      'Sardar Patel': { speaker: 'ashutosh', pace: 0.9 },
      'Ramana Maharshi': { speaker: 'soham', pace: 0.75 },
      'Shirdi Sai Baba': { speaker: 'ratan', pace: 0.8 },
      'Adi Shankaracharya': { speaker: 'advait', pace: 0.85 },
      'Jesus Christ': { speaker: 'anand', pace: 0.85 },
      'Guru Nanak': { speaker: 'ratan', pace: 0.8 },
      'Sant Tukaram': { speaker: 'gokul', pace: 0.85 },
      'Sri Ramakrishna': { speaker: 'soham', pace: 0.8 },
      'Rumi': { speaker: 'kabir', pace: 0.8 },
      'Confucius': { speaker: 'ratan', pace: 0.8 },
      'Lao Tzu': { speaker: 'ratan', pace: 0.75 },
      'Khalil Gibran': { speaker: 'kabir', pace: 0.8 },
      'Tenali Raman': { speaker: 'rohan', pace: 1.0 },
      'Birbal': { speaker: 'manan', pace: 0.95 },
      'Rabindranath Tagore': { speaker: 'ratan', pace: 0.8 },
      'Shinchan': { speaker: 'aayan', pace: 1.4 },
      'Shaktiman': { speaker: 'vijay', pace: 1.0 },

      // ═══════════════════════════════════════
      // SCIENTISTS & THINKERS
      // ═══════════════════════════════════════
      'Albert Einstein': { speaker: 'mani', pace: 0.85 },
      'Isaac Newton': { speaker: 'advait', pace: 0.85 },
      'Socrates': { speaker: 'ratan', pace: 0.85 },
      'Plato': { speaker: 'advait', pace: 0.85 },
      'Nikola Tesla': { speaker: 'rehan', pace: 0.95 },
      'Stephen Hawking': { speaker: 'shubh', pace: 0.8 },
      'Carl Jung': { speaker: 'mani', pace: 0.85 },
      'Alan Turing': { speaker: 'shubh', pace: 0.9 },
      'Richard Feynman': { speaker: 'sunny', pace: 1.1 },
      'CV Raman': { speaker: 'ratan', pace: 0.9 },
      'Galileo Galilei': { speaker: 'advait', pace: 0.85 },
      'Charles Darwin': { speaker: 'mani', pace: 0.85 },
      'Sigmund Freud': { speaker: 'mani', pace: 0.85 },
      'Leonardo da Vinci': { speaker: 'rehan', pace: 0.9 },
      'Marie Curie': { speaker: 'sophia', pace: 0.9 },

      // ═══════════════════════════════════════
      // TECH & BUSINESS
      // ═══════════════════════════════════════
      'Elon Musk': { speaker: 'dev', pace: 1.1 },
      'Naval Ravikant': { speaker: 'advait', pace: 0.9 },
      'Steve Jobs': { speaker: 'mohit', pace: 0.95 },
      'Warren Buffett': { speaker: 'ratan', pace: 0.85 },
      'Charlie Munger': { speaker: 'ratan', pace: 0.85 },
      'Ratan Tata': { speaker: 'anand', pace: 0.9 },
      'Grok': { speaker: 'shubh', pace: 1.0 },

      // ═══════════════════════════════════════
      // HISTORICAL LEADERS - MALE
      // ═══════════════════════════════════════
      'Alexander the Great': { speaker: 'vijay', pace: 1.0 },
      'Julius Caesar': { speaker: 'varun', pace: 0.95 },
      'Napoleon Bonaparte': { speaker: 'mohit', pace: 1.0 },
      'Genghis Khan': { speaker: 'vijay', pace: 1.0 },
      'Winston Churchill': { speaker: 'mani', pace: 0.9 },
      'Abraham Lincoln': { speaker: 'anand', pace: 0.85 },
      'Martin Luther King Jr.': { speaker: 'aditya', pace: 0.95 },
      'Nelson Mandela': { speaker: 'anand', pace: 0.85 },
      'George Washington': { speaker: 'ashutosh', pace: 0.9 },
      'Thomas Jefferson': { speaker: 'manan', pace: 0.9 },
      'Theodore Roosevelt': { speaker: 'varun', pace: 1.0 },
      'John F. Kennedy': { speaker: 'aditya', pace: 0.95 },
      'Che Guevara': { speaker: 'rahul', pace: 1.05 },
      'Maharana Pratap': { speaker: 'vijay', pace: 1.0 },
      'Tipu Sultan': { speaker: 'aditya', pace: 1.0 },
      'Akbar the Great': { speaker: 'manan', pace: 0.9 },
      'Ashoka the Great': { speaker: 'anand', pace: 0.85 },

      // ═══════════════════════════════════════
      // HISTORICAL LEADERS - FEMALE
      // ═══════════════════════════════════════
      'Cleopatra': { speaker: 'ishita', pace: 0.9 },
      'Queen Elizabeth I': { speaker: 'sophia', pace: 0.9 },
      'Princess Diana': { speaker: 'priya', pace: 0.95 },
      'Mother Teresa': { speaker: 'roopa', pace: 0.8 },
      'Florence Nightingale': { speaker: 'kavya', pace: 0.9 },
      'Harriet Tubman': { speaker: 'ishita', pace: 0.95 },
      'Anne Frank': { speaker: 'suhani', pace: 0.95 },
      'Audrey Hepburn': { speaker: 'sophia', pace: 0.9 },
      'Marilyn Monroe': { speaker: 'amelia', pace: 0.95 },
      'Frida Kahlo': { speaker: 'shreya', pace: 0.95 },
      'Jane Austen': { speaker: 'sophia', pace: 0.9 },
      'Agatha Christie': { speaker: 'ritu', pace: 0.9 },

      // ═══════════════════════════════════════
      // WRITERS & ARTISTS - MALE
      // ═══════════════════════════════════════
      'William Shakespeare': { speaker: 'manan', pace: 0.85 },
      'Oscar Wilde': { speaker: 'rehan', pace: 0.95 },
      'Edgar Allan Poe': { speaker: 'mani', pace: 0.8 },
      'Ernest Hemingway': { speaker: 'amit', pace: 0.9 },
      'Vincent van Gogh': { speaker: 'rehan', pace: 0.9 },
      'Pablo Picasso': { speaker: 'rehan', pace: 1.0 },
      'Mark Twain': { speaker: 'anand', pace: 0.95 },
      'Leo Tolstoy': { speaker: 'mani', pace: 0.8 },
      'Fyodor Dostoevsky': { speaker: 'mani', pace: 0.85 },
      'Franz Kafka': { speaker: 'rehan', pace: 0.85 },
      'H.P. Lovecraft': { speaker: 'mani', pace: 0.85 },
      'Charlie Chaplin': { speaker: 'rohan', pace: 0.9 },

      // ═══════════════════════════════════════
      // BOLLYWOOD & INDIAN ENTERTAINMENT
      // ═══════════════════════════════════════
      'Sushant Singh Rajput': { speaker: 'rahul', pace: 1.0 },
      'Irrfan Khan': { speaker: 'kabir', pace: 0.85 },
      'Rishi Kapoor': { speaker: 'anand', pace: 1.0 },
      'Raj Kapoor': { speaker: 'anand', pace: 0.9 },
      'Dev Anand': { speaker: 'shubh', pace: 1.0 },
      'Alfred Hitchcock': { speaker: 'mani', pace: 0.85 },
      'Stanley Kubrick': { speaker: 'advait', pace: 0.85 },
      'Robin Williams': { speaker: 'sunny', pace: 1.2 },
      'Paul Walker': { speaker: 'sunny', pace: 1.0 },
      'Brandon Lee': { speaker: 'mohit', pace: 0.95 },
      'Heath Ledger': { speaker: 'rehan', pace: 0.95 },
      'Chadwick Boseman': { speaker: 'ashutosh', pace: 0.95 },
      'Kobe Bryant': { speaker: 'rahul', pace: 1.0 },

      // ═══════════════════════════════════════
      // PROFESSIONAL / UTILITY
      // ═══════════════════════════════════════
      'Supportive Therapist': { speaker: 'kavya', pace: 0.9 },
      'Mental Wellness Coach': { speaker: 'priya', pace: 0.9 },
      'Life Coach': { speaker: 'manan', pace: 1.0 },
      'Tarot Reader': { speaker: 'kavya', pace: 0.85 },
      'Career Mentor': { speaker: 'ashutosh', pace: 1.0 },
      'Fitness Coach': { speaker: 'rahul', pace: 1.1 },
      'Legal Advisor': { speaker: 'ashutosh', pace: 0.95 },
      'Study Buddy': { speaker: 'rohan', pace: 1.0 },
      'Sleep Narrator': { speaker: 'kabir', pace: 0.7 },
      'Hype Man': { speaker: 'sunny', pace: 1.2 },
      'Best Friend': { speaker: 'rohan', pace: 1.0 },
      'Home Chef': { speaker: 'pooja', pace: 1.0 },
      'Travel Guide': { speaker: 'shreya', pace: 1.05 },
      'Financial Advisor': { speaker: 'ashutosh', pace: 0.95 },
      'Medical Advisor': { speaker: 'sumit', pace: 0.9 },
      'Relationship Counselor': { speaker: 'priya', pace: 0.9 },
      'Parenting Coach': { speaker: 'pooja', pace: 0.95 },
      'Astro Guide': { speaker: 'kabir', pace: 0.85 },
      'Numerology Expert': { speaker: 'advait', pace: 0.9 },
      'The Debate Bro': { speaker: 'amit', pace: 1.15 },
      'Drill Sergeant': { speaker: 'vijay', pace: 1.15 },
      'The Narrator': { speaker: 'mani', pace: 0.85 },
      'Sentient AI': { speaker: 'shubh', pace: 0.9 },
      'Sherlock Holmes': { speaker: 'advait', pace: 1.05 },
      'Whiskers': { speaker: 'suhani', pace: 1.1 },

      // ═══════════════════════════════════════
      // FANTASY / ARCHETYPES
      // ═══════════════════════════════════════
      'Mafia Boss': { speaker: 'varun', pace: 0.85 },
      'Edgy Vampire Lord': { speaker: 'rehan', pace: 0.85 },
      'Pirate Captain': { speaker: 'sunny', pace: 1.1 },
      'Friendly Ghost': { speaker: 'suhani', pace: 0.9 },
      'Curious Alien': { speaker: 'shubh', pace: 1.0 },
      'Sleep Paralysis Demon': { speaker: 'mani', pace: 0.75 },
      'Retired Hero': { speaker: 'anand', pace: 0.9 },
      'Fairy Godmother': { speaker: 'roopa', pace: 0.95 },
      'Loyal Butler': { speaker: 'manan', pace: 0.9 },
      'Time Traveler': { speaker: 'dev', pace: 1.1 },
      'Retired Villain': { speaker: 'mani', pace: 0.85 },

      // ═══════════════════════════════════════
      // MISC REMAINING
      // ═══════════════════════════════════════
      'Bruce Lee': { speaker: 'mohit', pace: 1.0 },
      'Sushant Singh Rajput': { speaker: 'rahul', pace: 1.0 },
    }

    // Map language codes to Sarvam format
    const langMap = {
      'en': 'en-IN',
      'hi': 'hi-IN',
      'mr': 'mr-IN',
    }
    const targetLang = langMap[language] || 'en-IN'

    // Get voice config for this persona
    const voiceConfig = voiceMapping[personaName] || { speaker: 'shubh', pace: 1.0 }

    // Truncate text to Sarvam's 2500 char limit for bulbul:v3
    const truncatedText = text.length > 2500 ? text.substring(0, 2497) + '...' : text

    // Call Sarvam TTS API
    const response = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': SARVAM_API_KEY,
      },
      body: JSON.stringify({
        text: truncatedText,
        target_language_code: targetLang,
        model: 'bulbul:v3',
        speaker: voiceConfig.speaker,
        pace: voiceConfig.pace,
        output_audio_codec: 'mp3',
        speech_sample_rate: 24000,
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Sarvam API error:', response.status, errorData)
      return res.status(response.status).json({
        error: 'Failed to generate speech',
        fallback: true
      })
    }

    const data = await response.json()

    if (!data.audios || !data.audios[0]) {
      return res.status(500).json({
        error: 'No audio returned from Sarvam',
        fallback: true
      })
    }

    // Sarvam returns base64-encoded audio - decode and send as binary
    const audioBuffer = Buffer.from(data.audios[0], 'base64')

    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Content-Length', audioBuffer.byteLength)
    res.send(audioBuffer)

  } catch (error) {
    console.error('TTS API error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      fallback: true
    })
  }
}
