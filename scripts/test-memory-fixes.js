#!/usr/bin/env node
// Test both: 1. Birth details extraction 2. Name false positive prevention

console.log('🧪 TESTING MEMORY EXTRACTION FIXES\n');

const skipWords = [
    'not', 'from', 'here', 'just', 'very', 'really', 'so', 'too',
    'learning', 'having', 'feeling', 'looking', 'trying', 'going', 'doing', 'working',
    'thinking', 'wondering', 'hoping', 'waiting', 'getting', 'making', 'taking', 'coming',
    'asking', 'telling', 'saying', 'seeing', 'being', 'starting', 'struggling',
    'confused', 'married', 'sad', 'happy', 'worried', 'scared', 'excited', 'tired',
    'interested', 'curious', 'concerned', 'stressed', 'anxious', 'afraid', 'alone',
    'new', 'old', 'young', 'single', 'divorced', 'pregnant', 'sick',
    'student', 'developer', 'engineer', 'doctor', 'teacher', 'manager',
    'years'
];

// Test cases
const testCases = [
    {
        msg: 'I am learning about astrology',
        expected: { nameExtracted: false },
        desc: 'Should NOT extract "learning" as name'
    },
    {
        msg: 'I am having trouble with my career',
        expected: { nameExtracted: false },
        desc: 'Should NOT extract "having" as name'
    },
    {
        msg: 'I am confused about my future',
        expected: { nameExtracted: false },
        desc: 'Should NOT extract "confused" as name'
    },
    {
        msg: 'I am married with 2 kids',
        expected: { nameExtracted: false },
        desc: 'Should NOT extract "married" as name'
    },
    {
        msg: 'My name is Gaurav',
        expected: { nameExtracted: true, name: 'Gaurav' },
        desc: 'Should extract "Gaurav" as name'
    },
    {
        msg: 'Hi, I am Rahul',
        expected: { nameExtracted: true, name: 'Rahul' },
        desc: 'Should extract "Rahul" as name'
    },
    {
        msg: 'My date of birth is 15th August 1990, time of birth is 10:30 AM, place of birth is Mumbai',
        expected: { dob: true, tob: true, pob: true },
        desc: 'Should extract all birth details'
    },
];

// Run tests
let passed = 0;
let failed = 0;

for (const test of testCases) {
    const msg = test.msg.toLowerCase();
    const original = test.msg;
    const memories = [];

    // Name detection (with fix)
    const namePatterns = [
        /my name is\s+([A-Za-z]+)/i,
        /(?:i'm|i am)\s+([A-Z][a-z]+)(?:\s|,|\.|\\!|$)/,
    ];
    for (const pattern of namePatterns) {
        const match = original.match(pattern);
        if (match && match[1] && match[1].length > 1) {
            const name = match[1];
            if (!skipWords.includes(name.toLowerCase())) {
                memories.push({ fact: `User's name is ${name}`, category: 'name' });
            }
            break;
        }
    }

    // DOB detection
    if (msg.includes('birth') || msg.includes('born') || msg.includes('dob')) {
        const dobPatterns = [
            /(?:date of birth|dob|birth date)[:\s]+(?:is\s+)?([0-9]{1,2}(?:st|nd|rd|th)?\s*(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s*[0-9]{2,4})/i,
        ];
        for (const pattern of dobPatterns) {
            const match = original.match(pattern);
            if (match && match[1]) {
                memories.push({ fact: `Date of Birth: ${match[1].trim()}`, category: 'birth_details' });
                break;
            }
        }
    }

    // TOB detection
    if (msg.includes('time') && (msg.includes('birth') || msg.includes('born'))) {
        const tobPatterns = [
            /(?:time of birth|birth time)[:\s]+(?:is\s+)?([0-9]{1,2}[:\.]?[0-9]{0,2}\s*(?:am|pm|AM|PM)?)/i,
        ];
        for (const pattern of tobPatterns) {
            const match = original.match(pattern);
            if (match && match[1]) {
                memories.push({ fact: `Time of Birth: ${match[1].trim()}`, category: 'birth_details' });
                break;
            }
        }
    }

    // POB detection
    if (msg.includes('place') && (msg.includes('birth') || msg.includes('born'))) {
        const pobPatterns = [
            /(?:place of birth|birth place|birthplace)[:\s]+(?:is\s+)?([A-Z][a-zA-Z\s,]+?)(?:\.|!|$|\s+(?:and|my|i|the|at|on))/i,
        ];
        for (const pattern of pobPatterns) {
            const match = original.match(pattern);
            if (match && match[1] && match[1].trim().length > 2) {
                memories.push({ fact: `Place of Birth: ${match[1].trim()}`, category: 'birth_details' });
                break;
            }
        }
    }

    // Validate test
    const nameMemory = memories.find(m => m.fact.includes("User's name"));
    const hasName = !!nameMemory;
    const dobMemory = memories.find(m => m.fact.includes('Date of Birth'));
    const tobMemory = memories.find(m => m.fact.includes('Time of Birth'));
    const pobMemory = memories.find(m => m.fact.includes('Place of Birth'));

    let testPassed = true;
    if (test.expected.nameExtracted !== undefined) {
        if (test.expected.nameExtracted !== hasName) testPassed = false;
        if (test.expected.name && nameMemory && !nameMemory.fact.includes(test.expected.name)) testPassed = false;
    }
    if (test.expected.dob !== undefined && test.expected.dob !== !!dobMemory) testPassed = false;
    if (test.expected.tob !== undefined && test.expected.tob !== !!tobMemory) testPassed = false;
    if (test.expected.pob !== undefined && test.expected.pob !== !!pobMemory) testPassed = false;

    if (testPassed) {
        console.log(`✅ PASS: ${test.desc}`);
        passed++;
    } else {
        console.log(`❌ FAIL: ${test.desc}`);
        console.log(`   Input: "${test.msg}"`);
        console.log(`   Extracted:`, memories.map(m => m.fact));
        failed++;
    }
}

console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
