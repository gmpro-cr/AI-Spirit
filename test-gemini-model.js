import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = 'AIzaSyCt65UaAtDpwP5P6sKfmbttXAoqQLw9d_0'
const genAI = new GoogleGenerativeAI(apiKey)

async function listModels() {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.0-pro' })
        // There isn't a direct listModels method on the instance in the JS SDK easily accessible without using the model manager, 
        // but let's try a simple generation to see if it works with a different model name.

        console.log('Testing gemini-1.0-pro...')
        const result = await model.generateContent('Hello')
        console.log('Success:', result.response.text())
    } catch (error) {
        console.error('Error:', error.message)
    }
}

listModels()
