// Test the memory extraction patterns
const testMessage = 'Hi, I want to know about my career. My date of birth is 15th August 1990, time of birth is 10:30 AM, place of birth is Mumbai, India';

console.log('Testing extraction on message:', testMessage);
console.log('---');

const msg = testMessage.toLowerCase();
const original = testMessage;
const memories = [];

// Date of Birth
if (msg.includes('birth') || msg.includes('born') || msg.includes('dob') || msg.includes('birthday')) {
    const dobPatterns = [
        /(?:date of birth|dob|birth date)[:\s]+(?:is\s+)?([0-9]{1,2}(?:st|nd|rd|th)?\s*(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s*[0-9]{2,4})/i,
        /(?:date of birth|dob|birth date)[:\s]+(?:is\s+)?([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4})/i,
        /born\s+(?:on\s+)?([0-9]{1,2}(?:st|nd|rd|th)?\s*(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s*[0-9]{2,4})/i,
        /born\s+(?:on\s+)?([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4})/i,
        /(?:birthday|bday)[:\s]+(?:is\s+)?([0-9]{1,2}(?:st|nd|rd|th)?\s*(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s*(?:[0-9]{2,4})?)/i,
    ];
    for (const pattern of dobPatterns) {
        const match = original.match(pattern);
        if (match && match[1]) {
            memories.push({ fact: `Date of Birth: ${match[1].trim()}`, category: 'birth_details' });
            console.log('✅ DOB MATCH:', match[1]);
            break;
        }
    }
    if (!memories.find(m => m.fact.includes('Date of Birth'))) {
        console.log('❌ DOB: No match found');
    }
}

// Time of Birth
if (msg.includes('time') && (msg.includes('birth') || msg.includes('born'))) {
    const tobPatterns = [
        /(?:time of birth|birth time)[:\s]+(?:is\s+)?([0-9]{1,2}[:\.]?[0-9]{0,2}\s*(?:am|pm|AM|PM)?)/i,
        /born\s+(?:at\s+)?([0-9]{1,2}[:\.]?[0-9]{0,2}\s*(?:am|pm|AM|PM))/i,
    ];
    for (const pattern of tobPatterns) {
        const match = original.match(pattern);
        if (match && match[1]) {
            memories.push({ fact: `Time of Birth: ${match[1].trim()}`, category: 'birth_details' });
            console.log('✅ TOB MATCH:', match[1]);
            break;
        }
    }
    if (!memories.find(m => m.fact.includes('Time of Birth'))) {
        console.log('❌ TOB: No match found');
    }
} else {
    console.log('❌ TOB: Condition not met (time + birth keywords)');
}

// Place of Birth
if (msg.includes('place') && (msg.includes('birth') || msg.includes('born'))) {
    const pobPatterns = [
        /(?:place of birth|birth place|birthplace)[:\s]+(?:is\s+)?([A-Z][a-zA-Z\s,]+?)(?:\.|!|$|\s+(?:and|my|i|the|at|on))/i,
        /born\s+(?:in|at)\s+([A-Z][a-zA-Z\s,]+?)(?:\.|!|$|\s+(?:and|my|i|the|at|on|time))/i,
    ];
    for (const pattern of pobPatterns) {
        const match = original.match(pattern);
        if (match && match[1] && match[1].trim().length > 2) {
            memories.push({ fact: `Place of Birth: ${match[1].trim()}`, category: 'birth_details' });
            console.log('✅ POB MATCH:', match[1]);
            break;
        }
    }
    if (!memories.find(m => m.fact.includes('Place of Birth'))) {
        console.log('❌ POB: No match found');
    }
} else {
    console.log('❌ POB: Condition not met (place + birth keywords)');
}

console.log('\n--- EXTRACTED MEMORIES ---');
console.log(JSON.stringify(memories, null, 2));
