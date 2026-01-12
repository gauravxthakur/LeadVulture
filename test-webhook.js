// Test script to verify webhook connectivity
// Run this in your browser console or as a separate test file

async function testWebhook() {
  const webhookUrl = 'https://n8n-xzythodg.ap-southeast-1.clawcloudrun.com/webhook-test/d27ef1ce-4b63-4b45-8a2e-06b178b31e18';
  
  console.log('Testing webhook URL:', webhookUrl);
  
  // Test 1: Basic connectivity with GET
  try {
    console.log('Test 1: GET request...');
    const getResponse = await fetch(webhookUrl, { method: 'GET' });
    console.log('GET response status:', getResponse.status);
    const getText = await getResponse.text();
    console.log('GET response body:', getText);
  } catch (error) {
    console.error('GET request failed:', error);
  }
  
  // Test 2: POST with simple data
  try {
    console.log('Test 2: POST request...');
    const postResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [{ test: 'hello' }] })
    });
    console.log('POST response status:', postResponse.status);
    const postText = await postResponse.text();
    console.log('POST response body:', postText);
  } catch (error) {
    console.error('POST request failed:', error);
  }
  
  // Test 3: Check if domain is reachable
  try {
    console.log('Test 3: Domain reachability...');
    const domainTest = await fetch('https://n8n-xzythodg.ap-southeast-1.clawcloudrun.com/');
    console.log('Domain test status:', domainTest.status);
  } catch (error) {
    console.error('Domain not reachable:', error);
  }
}

// Run the test
testWebhook();
