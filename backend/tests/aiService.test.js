const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { detectEmergency, sanitizeInput, sanitizeResponse } = require('../services/aiService');

describe('aiService', () => {
  it('detects emergencies without flagging routine questions', () => {
    assert.equal(detectEmergency('My friend is choking'), true);
    assert.equal(detectEmergency('I have chest pain'), true);
    assert.equal(detectEmergency('When are my blood test results ready?'), false);
    assert.equal(detectEmergency('Can I book a haircut-time appointment?'), false);
  });

  it('strips markup and enforces length', () => {
    assert.equal(sanitizeInput('  <b>hello</b>  '), 'hello');
    assert.throws(() => sanitizeInput('   '));
    assert.throws(() => sanitizeInput('x'.repeat(1001)));
  });

  it('always appends a disclaimer and emergency banner', () => {
    const reply = sanitizeResponse('Apply pressure to the wound.', true);
    assert.match(reply, /⚠️/);
    assert.match(reply, /call \d+/);
  });
});
