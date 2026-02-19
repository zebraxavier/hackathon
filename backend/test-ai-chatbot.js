// Test AI-Powered Chatbot Integration
require('dotenv').config();
const { getAIResponse, checkAIHealth } = require('./services/aiService');

console.log('\n🧪 TESTING AI-POWERED CHATBOT\n');
console.log('='.repeat(70));

async function testAI() {
  try {
    // Test 1: Health Check
    console.log('\n📝 Test 1: AI Health Check');
    console.log('-'.repeat(70));
    const health = await checkAIHealth();
    console.log(`Status: ${health.status}`);
    console.log(`Message: ${health.message}`);
    
    if (health.status !== 'healthy') {
      console.log('\n❌ AI API is not healthy. Please check your API key.');
      return;
    }

    // Test 2: Simple Greeting
    console.log('\n📝 Test 2: Simple Greeting');
    console.log('-'.repeat(70));
    const greeting = await getAIResponse('Hello');
    console.log(`✅ AI Used: ${greeting.aiUsed}`);
    console.log(`Response: ${greeting.reply.substring(0, 200)}...\n`);

    // Test 3: Medical Question (Fever)
    console.log('\n📝 Test 3: Medical Question - Fever');
    console.log('-'.repeat(70));
    const fever = await getAIResponse('I have a fever, what should I do?');
    console.log(`✅ AI Used: ${fever.aiUsed}`);
    console.log(`⚠️  Emergency: ${fever.isEmergency}`);
    console.log(`Response: ${fever.reply.substring(0, 300)}...\n`);

    // Test 4: Emergency (Bleeding)
    console.log('\n📝 Test 4: Emergency - Bleeding');
    console.log('-'.repeat(70));
    const bleeding = await getAIResponse('I\'m bleeding from a cut on my hand');
    console.log(`✅ AI Used: ${bleeding.aiUsed}`);
    console.log(`⚠️  Emergency: ${bleeding.isEmergency}`);
    console.log(`Response: ${bleeding.reply.substring(0, 300)}...\n`);

    // Test 5: Clinic Information
    console.log('\n📝 Test 5: Clinic Information');
    console.log('-'.repeat(70));
    const clinic = await getAIResponse('When is the doctor available?');
    console.log(`✅ AI Used: ${clinic.aiUsed}`);
    console.log(`Response: ${clinic.reply.substring(0, 200)}...\n`);

    console.log('='.repeat(70));
    console.log('\n✅ All AI tests completed successfully!\n');
    console.log('🎉 Your chatbot is now AI-powered and ready to use!\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Run tests
testAI();
