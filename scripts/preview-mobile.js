import { chromium, devices } from 'playwright';

async function run() {
  console.log('📱 Launching iPhone Simulator (iPhone 15 Pro Viewport)...');
  console.log('⏳ Connecting to localhost:5173...');
  
  // iPhone 15 Pro is the closest equivalent in standard device descriptors (393x852)
  // This matches the target iPhone 17 Pro dimensions closely.
  const iPhone = devices['iPhone 15 Pro']; 

  const browser = await chromium.launch({
    headless: false, // We want to see it!
    args: ['--window-position=200,50'] // Offset to not block terminal completely
  });

  const context = await browser.newContext({
    ...iPhone,
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
    deviceScaleFactor: 2, // Retain sharpness
    isMobile: true,
    hasTouch: true
  });

  const page = await context.newPage();
  
  try {
    // Try to load the local dev server
    await page.goto('http://localhost:5173');
    console.log('✅ Simulator Ready!'); 
    console.log('🖐  Touch simulation is enabled.');
    console.log('To exit, close the browser window or press Ctrl+C here.');
    
    // Keep alive indefinitely until user closes
    // We monitor the browser close event to exit the process cleanly
    browser.on('disconnected', () => {
        console.log('\n🔌 Simulator closed.');
        process.exit(0);
    });

    // Prevent script from exiting immediately
    await new Promise(() => {}); 
  } catch (e) {
    console.error('\n❌ Failed to load http://localhost:5173');
    console.log('👉 Make sure the dev server is running! (npm run dev)');
    await browser.close();
    process.exit(1);
  }
}

run();
