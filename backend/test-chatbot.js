// Test script for Medical-Grade Chatbot
const { processMessage } = require('./utils/chatbotIntelligence');

console.log('\n🧪 TESTING MEDICAL-GRADE CHATBOT\n');
console.log('='.repeat(70));

const testMessages = [
  'Hello',
  'I\'m bleeding from a cut',
  'Someone got burned',
  'I have chest pain',
  'When is the doctor available?',
  'How do I book an appointment?',
  'I have a fever',
  'Someone is choking',
  'Thank you for your help'
];

testMessages.forEach((message, index) => {
  console.log(`\n📝 Test ${index + 1}: "${message}"`);
  console.log('-'.repeat(70));
  
  const response = processMessage(message);
  
  if (response.success) {
    console.log(`✅ Intent: ${response.intent}`);
    console.log(`⚠️  Priority: ${response.priority}`);
    console.log(`🚨 Urgency: ${response.urgency ? 'YES' : 'NO'}`);
    console.log(`\n💬 Response:\n${response.reply.substring(0, 300)}...`);
  } else {
    console.log(`❌ Error: ${response.error}`);
  }
  
  console.log('='.repeat(70));
});

console.log('\n✅ All tests completed!\n');
