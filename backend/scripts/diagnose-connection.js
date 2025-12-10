#!/usr/bin/env node

/**
 * MongoDB Connection Diagnostic Tool
 * Helps diagnose connection issues with MongoDB Atlas
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const dns = require('dns').promises;
const { execSync } = require('child_process');

const MONGODB_URI = process.env.MONGODB_URI;

console.log('🔍 MongoDB Connection Diagnostic Tool\n');
console.log('='.repeat(60));

// 1. Check if MONGODB_URI is set
console.log('\n1️⃣  Checking MONGODB_URI...');
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set in .env file');
  process.exit(1);
}
console.log('✅ MONGODB_URI is set');
const maskedUri = MONGODB_URI.replace(/:[^:@]+@/, ':****@');
console.log(`   URI: ${maskedUri}`);

// 2. Check connection string format
console.log('\n2️⃣  Checking connection string format...');
if (!MONGODB_URI.startsWith('mongodb://') && !MONGODB_URI.startsWith('mongodb+srv://')) {
  console.error('❌ Invalid connection string format');
  console.error('   Must start with mongodb:// or mongodb+srv://');
  process.exit(1);
}
console.log('✅ Connection string format is valid');

// Extract hostname from connection string
let hostname;
try {
  if (MONGODB_URI.includes('mongodb+srv://')) {
    // Extract from mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/...
    const match = MONGODB_URI.match(/mongodb\+srv:\/\/[^@]+@([^/]+)/);
    if (match) {
      hostname = match[1];
    }
  } else {
    // Extract from mongodb://user:pass@host:port/...
    const match = MONGODB_URI.match(/mongodb:\/\/[^@]+@([^/]+)/);
    if (match) {
      hostname = match[1].split(':')[0];
    }
  }
} catch (error) {
  console.error('❌ Could not extract hostname from connection string');
  process.exit(1);
}

if (!hostname) {
  console.error('❌ Could not extract hostname from connection string');
  process.exit(1);
}

console.log(`   Hostname: ${hostname}`);

// 3. Test DNS resolution
console.log('\n3️⃣  Testing DNS resolution...');
async function testDNS() {
  try {
    if (hostname.includes('mongodb.net')) {
      // Test SRV record lookup
      const srvHost = `_mongodb._tcp.${hostname}`;
      console.log(`   Testing SRV record: ${srvHost}`);
      try {
        const addresses = await dns.resolveSrv(srvHost);
        console.log('✅ SRV record resolved successfully');
        console.log(`   Found ${addresses.length} server(s):`);
        addresses.forEach((addr, i) => {
          console.log(`   ${i + 1}. ${addr.name}:${addr.port} (priority: ${addr.priority}, weight: ${addr.weight})`);
        });
      } catch (srvError) {
        console.error('❌ SRV record resolution failed');
        console.error(`   Error: ${srvError.message}`);
        console.error('   This is likely the cause of your connection issue!');
        
        // Try regular DNS lookup as fallback
        console.log(`\n   Trying regular DNS lookup for: ${hostname}`);
        try {
          const addresses = await dns.resolve4(hostname);
          console.log('✅ Regular DNS lookup succeeded');
          console.log(`   IP addresses: ${addresses.join(', ')}`);
          console.log('   💡 Consider using standard connection string instead of SRV');
        } catch (dnsError) {
          console.error('❌ Regular DNS lookup also failed');
          console.error(`   Error: ${dnsError.message}`);
        }
      }
    } else {
      // Regular hostname lookup
      try {
        const addresses = await dns.resolve4(hostname);
        console.log('✅ DNS resolution successful');
        console.log(`   IP addresses: ${addresses.join(', ')}`);
      } catch (dnsError) {
        console.error('❌ DNS resolution failed');
        console.error(`   Error: ${dnsError.message}`);
      }
    }
  } catch (error) {
    console.error('❌ DNS test failed:', error.message);
  }
}

// 4. Test internet connectivity
console.log('\n4️⃣  Testing internet connectivity...');
try {
  execSync('ping -c 1 8.8.8.8', { stdio: 'ignore' });
  console.log('✅ Internet connectivity OK');
} catch (error) {
  console.error('❌ Internet connectivity test failed');
  console.error('   Cannot reach 8.8.8.8 (Google DNS)');
}

// 5. Test MongoDB Atlas connectivity
console.log('\n5️⃣  Testing MongoDB Atlas connectivity...');
if (hostname.includes('mongodb.net')) {
  try {
    execSync(`ping -c 1 ${hostname}`, { stdio: 'ignore', timeout: 5000 });
    console.log('✅ Can reach MongoDB Atlas hostname');
  } catch (error) {
    console.error('❌ Cannot reach MongoDB Atlas hostname');
    console.error('   This might be normal - MongoDB Atlas may not respond to ping');
  }
}

// Run DNS test
testDNS().then(() => {
  console.log('\n' + '='.repeat(60));
  console.log('\n📋 Summary & Recommendations:\n');
  
  console.log('If DNS resolution failed:');
  console.log('  1. Check your internet connection');
  console.log('  2. Check DNS settings (try: nslookup ' + hostname + ')');
  console.log('  3. Check firewall/VPN settings');
  console.log('  4. Try using a different DNS server (8.8.8.8 or 1.1.1.1)');
  console.log('  5. If using SRV, try standard connection string from MongoDB Atlas');
  console.log('\nIf DNS resolution succeeded but connection still fails:');
  console.log('  1. Check MongoDB Atlas Network Access (IP whitelist)');
  console.log('  2. Verify database user credentials');
  console.log('  3. Check if cluster is running (not paused)');
  console.log('  4. Try connecting from MongoDB Compass to verify credentials');
  console.log('\n');
});

