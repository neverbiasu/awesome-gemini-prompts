import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { spawn, ChildProcess } from 'child_process';
import net from 'net';

const BASE_URL = 'http://localhost:3000';
const OUTPUT_DIR = path.join(process.cwd(), 'docs', 'ui-archive');

async function isPortOpen(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      resolve(false);
    });
    socket.connect(port, 'localhost');
  });
}

async function waitForServer(url: string, timeout = 60000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch (e) {
      // ignore
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  return false;
}

async function archiveUI() {
  // Get version from package.json
  const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8'));
  const version = packageJson.version || 'latest';
  const versionDir = path.join(OUTPUT_DIR, `v${version}`);
  
  if (!fs.existsSync(versionDir)) {
    fs.mkdirSync(versionDir, { recursive: true });
  }

  console.log(`📸 Starting UI Archival for v${version}...`);
  console.log(`   Output Directory: ${versionDir}`);

  let serverProcess: ChildProcess | null = null;
  const isRunning = await isPortOpen(3000);

  if (!isRunning) {
    console.log('🚀 Starting dev server...');
    // Use npm run dev
    serverProcess = spawn('npm', ['run', 'dev'], { stdio: 'inherit', shell: true });
    
    console.log('⏳ Waiting for server to be ready...');
    const ready = await waitForServer(BASE_URL);
    if (!ready) {
      console.error('❌ Server failed to start.');
      if (serverProcess) serverProcess.kill();
      process.exit(1);
    }
  } else {
    console.log('✅ Server is already running.');
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Set viewport for consistent screenshots (Full HD)
  await page.setViewportSize({ width: 1920, height: 1080 });

  const routes = [
    { name: 'landing', path: '/' },
    { name: 'hub-text', path: '/hub?category=text' },
    { name: 'hub-image', path: '/hub?category=image' },
    { name: 'hub-video', path: '/hub?category=video' },
    { name: 'hub-audio', path: '/hub?category=audio' },
  ];

  for (const route of routes) {
    try {
      console.log(`   Capturing ${route.name}...`);
      await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle' });
      
      // Wait a bit for animations/images to settle
      await page.waitForTimeout(3000); 
      
      await page.screenshot({ 
        path: path.join(versionDir, `${route.name}.png`),
        fullPage: true 
      });
    } catch (error: any) {
      console.error(`   ❌ Failed to capture ${route.name}: ${error.message}`);
    }
  }

  await browser.close();
  
  if (serverProcess) {
    console.log('🛑 Stopping dev server...');
    try {
      // Try to kill the process group
      if (serverProcess.pid) {
        process.kill(-serverProcess.pid);
      }
    } catch (e: any) {
      // Ignore ESRCH (process already dead)
      if (e.code !== 'ESRCH') {
        console.error('Error stopping server:', e);
      }
    }
    
    try {
        serverProcess.kill();
    } catch(e) {}
  }
  
  console.log(`✅ UI Archived successfully to ${versionDir}`);
  process.exit(0);
}

archiveUI().catch((err) => {
    console.error(err);
    process.exit(1);
});
