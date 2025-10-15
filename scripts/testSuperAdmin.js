#!/usr/bin/env node#!/usr/bin/env node#!/usr/bin/env node



/**

 * Super Admin Testing Script

 * /**/**

 * This script provides comprehensive testing and verification for the super admin system.

 * It tests login credentials, password verification, JWT token generation, and database connectivity. * Super Admin Testing Script * Super Admin System Test Script

 * 

 * Usage: npm run test-superadmin *  *

 * 

 * Features: * This script provides comprehensive testing and verification for the super admin system. * This script provides automated testing for the super admin functionality.

 * - Login credential testing

 * - Password verification validation * It tests login credentials, password verification, JWT token generation, and database connectivity. * It verifies that all endpoints are working correctly and handles error cases.

 * - JWT token generation testing

 * - Database connection verification *  *

 * - Authentication flow testing

 */ * Usage: npm run test-superadmin * Usage:



const readline = require('readline'); *  *   node scripts/testSuperAdmin.js

const chalk = require('chalk');

const bcrypt = require('bcryptjs'); * Features: *   npm run test-superadmin

const jwt = require('jsonwebtoken');

const database = require('../src/config/database'); * - Login credential testing *

const Admin = require('../src/models/Admin');

 * - Password verification validation * Prerequisites:

// Create readline interface

const rl = readline.createInterface({ * - JWT token generation testing * - Server must be running

  input: process.stdin,

  output: process.stdout, * - Database connection verification * - Super admin must be created using createSuperAdmin.js

});

 * - Authentication flow testing * - Environment variables must be configured

/**

 * Promisify readline question */ */

 */

function question(query) {

  return new Promise(resolve => rl.question(query, resolve));

}const readline = require('readline');const axios = require("axios");



/**const chalk = require('chalk');const chalk = require("chalk");

 * Hide input for password (simple implementation)

 */const bcrypt = require('bcryptjs');

function hideInput(query) {

  return new Promise((resolve) => {const jwt = require('jsonwebtoken');// Configuration

    const stdin = process.stdin;

    stdin.resume();const database = require('../src/config/database');const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

    stdin.setEncoding('utf8');

    stdin.setRawMode(true);const Admin = require('../src/models/Admin');const TEST_TIMEOUT = 30000; // 30 seconds



    process.stdout.write(query);

    

    let password = '';// Create readline interface// Test data

    

    const onData = (char) => {const rl = readline.createInterface({const TEST_SUPER_ADMIN = {

      char = char + '';

        input: process.stdin,  email: process.env.TEST_SUPER_ADMIN_EMAIL || "superadmin@example.com",

      switch (char) {

        case '\n':  output: process.stdout,  password: process.env.TEST_SUPER_ADMIN_PASSWORD || "SuperAdmin123!",

        case '\r':

        case '\u0004': // Ctrl+D});};

          stdin.setRawMode(false);

          stdin.removeListener('data', onData);

          process.stdout.write('\n');

          resolve(password);/**const TEST_REGULAR_ADMIN = {

          break;

        case '\u0003': // Ctrl+C * Promisify readline question  email: "testadmin@example.com",

          process.exit();

          break; */  password: "TestAdmin123!",

        case '\u007f': // Backspace

          if (password.length > 0) {function question(query) {  confirmPassword: "TestAdmin123!",

            password = password.slice(0, -1);

            process.stdout.write('\b \b');  return new Promise(resolve => rl.question(query, resolve));};

          }

          break;}

        default:

          password += char;let superAdminToken = null;

          process.stdout.write('*');

          break;/**let createdAdminId = null;

      }

    }; * Hide input for password (simple implementation)

    

    stdin.on('data', onData); *//**

  });

}function hideInput(query) { * Display test banner



/**  return new Promise((resolve) => { */

 * Find super admin with password field included

 */    const stdin = process.stdin;function displayBanner() {

async function findSuperAdminWithPassword() {

  try {    stdin.resume();  console.log(chalk.blue("\n" + "=".repeat(60)));

    return await Admin.findOne({ role: 'superadmin' }).select('+password');

  } catch (error) {    stdin.setEncoding('utf8');  console.log(chalk.blue.bold("        SUPER ADMIN SYSTEM TEST SUITE"));

    console.log(chalk.red("❌ Error finding super admin:"), error.message);

    return null;    stdin.setRawMode(true);  console.log(chalk.blue("=".repeat(60)));

  }

}  console.log(chalk.yellow("🧪 Testing super admin functionality"));



/**    process.stdout.write(query);  console.log(chalk.yellow(`🌐 Base URL: ${BASE_URL}`));

 * Test database connection

 */      console.log(chalk.blue("=".repeat(60) + "\n"));

async function testDatabaseConnection() {

  try {    let password = '';}

    console.log(chalk.blue("🔗 Testing database connection..."));

    await database.connect();    

    console.log(chalk.green("✅ Database connection successful"));

    return true;    const onData = (char) => {/**

  } catch (error) {

    console.log(chalk.red("❌ Database connection failed:"), error.message);      char = char + ''; * HTTP request helper with timeout and error handling

    return false;

  }       */

}

      switch (char) {async function makeRequest(method, url, data = null, headers = {}) {

/**

 * Test super admin existence        case '\n':  try {

 */

async function testSuperAdminExists() {        case '\r':    const config = {

  try {

    console.log(chalk.blue("👤 Checking super admin existence..."));        case '\u0004': // Ctrl+D      method,

    const superAdmin = await Admin.findOne({ role: 'superadmin' });

              stdin.setRawMode(false);      url: `${BASE_URL}${url}`,

    if (superAdmin) {

      console.log(chalk.green("✅ Super admin found"));          stdin.removeListener('data', onData);      timeout: TEST_TIMEOUT,

      console.log(chalk.cyan(`   📧 Email: ${superAdmin.email}`));

      console.log(chalk.cyan(`   🆔 ID: ${superAdmin._id}`));          process.stdout.write('\n');      headers: {

      console.log(chalk.cyan(`   📅 Created: ${superAdmin.createdAt?.toISOString() || 'N/A'}`));

      console.log(chalk.cyan(`   🔄 Updated: ${superAdmin.updatedAt?.toISOString() || 'N/A'}`));          resolve(password);        "Content-Type": "application/json",

      console.log(chalk.cyan(`   ✅ Active: ${superAdmin.isActive ? 'Yes' : 'No'}`));

      return superAdmin;          break;        ...headers,

    } else {

      console.log(chalk.yellow("⚠️  No super admin found in system"));        case '\u0003': // Ctrl+C      },

      return null;

    }          process.exit();    };

  } catch (error) {

    console.log(chalk.red("❌ Error checking super admin:"), error.message);          break;

    return null;

  }        case '\u007f': // Backspace    if (data) {

}

          if (password.length > 0) {      config.data = data;

/**

 * Test password verification            password = password.slice(0, -1);    }

 */

async function testPasswordVerification(superAdmin) {            process.stdout.write('\b \b');

  try {

    console.log(chalk.blue("\n🔒 Testing password verification..."));          }    const response = await axios(config);

    

    // Get password from user          break;    return {

    const password = await hideInput(chalk.cyan("Enter super admin password to test: "));

            default:      success: true,

    if (!password) {

      console.log(chalk.yellow("⚠️  No password provided, skipping verification test"));          password += char;      status: response.status,

      return false;

    }          process.stdout.write('*');      data: response.data,

    

    // Get super admin with password field          break;    };

    const adminWithPassword = await findSuperAdminWithPassword();

    if (!adminWithPassword) {      }  } catch (error) {

      console.log(chalk.red("❌ Could not retrieve super admin with password"));

      return false;    };    return {

    }

              success: false,

    // Test password comparison

    console.log(chalk.blue("🔄 Comparing password..."));    stdin.on('data', onData);      status: error.response?.status || 0,

    const isMatch = await bcrypt.compare(password, adminWithPassword.password);

      });      data: error.response?.data || { error: error.message },

    if (isMatch) {

      console.log(chalk.green("✅ Password verification successful"));}    };

      return true;

    } else {  }

      console.log(chalk.red("❌ Password verification failed"));

      return false;/**}

    }

     * Find super admin with password field included

  } catch (error) {

    console.log(chalk.red("❌ Error testing password verification:"), error.message); *//**

    return false;

  }async function findSuperAdminWithPassword() { * Test server health

}

  try { */

/**

 * Test JWT token generation    return await Admin.findOne({ role: 'superadmin' }).select('+password');async function testServerHealth() {

 */

async function testJWTGeneration(superAdmin) {  } catch (error) {  console.log(chalk.blue("🔍 Testing server health..."));

  try {

    console.log(chalk.blue("\n🎫 Testing JWT token generation..."));    console.log(chalk.red("❌ Error finding super admin:"), error.message);

    

    // Check if JWT_SECRET exists    return null;  const response = await makeRequest("GET", "/health");

    if (!process.env.JWT_SECRET) {

      console.log(chalk.red("❌ JWT_SECRET not found in environment variables"));  }

      return false;

    }}  if (response.success && response.status === 200) {

    

    // Generate token    console.log(chalk.green("✅ Server is healthy"));

    const payload = {

      id: superAdmin._id,/**    return true;

      email: superAdmin.email,

      role: superAdmin.role, * Test database connection  } else {

    };

     */    console.log(chalk.red("❌ Server health check failed"));

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

    async function testDatabaseConnection() {    console.log(chalk.red(`   Status: ${response.status}`));

    console.log(chalk.green("✅ JWT token generated successfully"));

    console.log(chalk.cyan(`   🎫 Token length: ${token.length} characters`));  try {    console.log(chalk.red(`   Error: ${JSON.stringify(response.data)}`));

    console.log(chalk.cyan(`   📝 Token preview: ${token.substring(0, 50)}...`));

        console.log(chalk.blue("🔗 Testing database connection..."));    return false;

    // Test token verification

    console.log(chalk.blue("🔄 Testing token verification..."));    await database.connect();  }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log(chalk.green("✅ Database connection successful"));}

    console.log(chalk.green("✅ JWT token verification successful"));

    console.log(chalk.cyan(`   🆔 Decoded ID: ${decoded.id}`));    return true;

    console.log(chalk.cyan(`   📧 Decoded Email: ${decoded.email}`));

    console.log(chalk.cyan(`   👑 Decoded Role: ${decoded.role}`));  } catch (error) {/**

    

    return true;    console.log(chalk.red("❌ Database connection failed:"), error.message); * Test super admin login

    

  } catch (error) {    return false; */

    console.log(chalk.red("❌ Error testing JWT generation:"), error.message);

    return false;  }async function testSuperAdminLogin() {

  }

}}  console.log(chalk.blue("🔐 Testing super admin login..."));



/**

 * Test authentication flow

 *//**  const response = await makeRequest("POST", "/api/admin/login", {

async function testAuthenticationFlow() {

  try { * Test super admin existence    email: TEST_SUPER_ADMIN.email,

    console.log(chalk.blue("\n🔄 Testing complete authentication flow..."));

     */    password: TEST_SUPER_ADMIN.password,

    // Get credentials

    const email = await question(chalk.cyan("Enter super admin email: "));async function testSuperAdminExists() {  });

    const password = await hideInput(chalk.cyan("Enter super admin password: "));

      try {

    if (!email || !password) {

      console.log(chalk.yellow("⚠️  Email or password not provided"));    console.log(chalk.blue("👤 Checking super admin existence..."));  if (response.success && response.status === 200) {

      return false;

    }    const superAdmin = await Admin.findOne({ role: 'superadmin' });    const { token, admin } = response.data;

    

    // Step 1: Find admin    

    console.log(chalk.blue("1️⃣ Finding admin by email..."));

    const admin = await Admin.findOne({ email, role: 'superadmin' }).select('+password');    if (superAdmin) {    if (admin.role === "superadmin") {

    

    if (!admin) {      console.log(chalk.green("✅ Super admin found"));      superAdminToken = token;

      console.log(chalk.red("❌ Super admin not found with provided email"));

      return false;      console.log(chalk.cyan(`   📧 Email: ${superAdmin.email}`));      console.log(chalk.green("✅ Super admin login successful"));

    }

          console.log(chalk.cyan(`   🆔 ID: ${superAdmin._id}`));      console.log(chalk.cyan(`   Email: ${admin.email}`));

    console.log(chalk.green("✅ Super admin found"));

          console.log(chalk.cyan(`   📅 Created: ${superAdmin.createdAt?.toISOString() || 'N/A'}`));      console.log(chalk.cyan(`   Role: ${admin.role}`));

    // Step 2: Verify password

    console.log(chalk.blue("2️⃣ Verifying password..."));      console.log(chalk.cyan(`   🔄 Updated: ${superAdmin.updatedAt?.toISOString() || 'N/A'}`));      return true;

    const isValidPassword = await bcrypt.compare(password, admin.password);

          console.log(chalk.cyan(`   ✅ Active: ${superAdmin.isActive ? 'Yes' : 'No'}`));    } else {

    if (!isValidPassword) {

      console.log(chalk.red("❌ Invalid password"));      return superAdmin;      console.log(chalk.red("❌ Login successful but role is not superadmin"));

      return false;

    }    } else {      return false;

    

    console.log(chalk.green("✅ Password verified"));      console.log(chalk.yellow("⚠️  No super admin found in system"));    }

    

    // Step 3: Generate JWT      return null;  } else {

    console.log(chalk.blue("3️⃣ Generating JWT token..."));

    const token = jwt.sign(    }    console.log(chalk.red("❌ Super admin login failed"));

      { id: admin._id, email: admin.email, role: admin.role },

      process.env.JWT_SECRET,  } catch (error) {    console.log(chalk.red(`   Status: ${response.status}`));

      { expiresIn: '24h' }

    );    console.log(chalk.red("❌ Error checking super admin:"), error.message);    console.log(chalk.red(`   Error: ${JSON.stringify(response.data)}`));

    

    console.log(chalk.green("✅ JWT token generated"));    return null;    return false;

    

    // Step 4: Verify JWT  }  }

    console.log(chalk.blue("4️⃣ Verifying JWT token..."));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);}}

    

    console.log(chalk.green("✅ Complete authentication flow successful"));

    console.log(chalk.cyan(`   👤 Authenticated as: ${decoded.email}`));

    console.log(chalk.cyan(`   👑 Role: ${decoded.role}`));/**/**

    console.log(chalk.cyan(`   🕒 Token expires in: 24 hours`));

     * Test password verification * Test getting all regular admins

    return true;

     */ */

  } catch (error) {

    console.log(chalk.red("❌ Error in authentication flow:"), error.message);async function testPasswordVerification(superAdmin) {async function testGetAllAdmins() {

    return false;

  }  try {  console.log(chalk.blue("📋 Testing get all regular admins..."));

}

    console.log(chalk.blue("\n🔒 Testing password verification..."));

/**

 * Display test menu      const headers = { Authorization: `Bearer ${superAdminToken}` };

 */

function displayTestMenu() {    // Get password from user  const response = await makeRequest(

  console.log(chalk.magenta.bold("\n👑 SUPER ADMIN TESTING CONSOLE"));

  console.log(chalk.white("═".repeat(80)));    const password = await hideInput(chalk.cyan("Enter super admin password to test: "));    "GET",

  console.log(chalk.cyan("1. 🔗 Test Database Connection"));

  console.log(chalk.cyan("2. 👤 Check Super Admin Existence"));        "/api/superadmin/admins?page=1&limit=5",

  console.log(chalk.cyan("3. 🔒 Test Password Verification"));

  console.log(chalk.cyan("4. 🎫 Test JWT Token Generation"));    if (!password) {    null,

  console.log(chalk.cyan("5. 🔄 Test Complete Authentication Flow"));

  console.log(chalk.cyan("6. 🧪 Run All Tests"));      console.log(chalk.yellow("⚠️  No password provided, skipping verification test"));    headers

  console.log(chalk.cyan("7. 🚪 Exit"));

  console.log(chalk.white("═".repeat(80)));      return false;  );

}

    }

/**

 * Run all tests      if (response.success && response.status === 200) {

 */

async function runAllTests() {    // Get super admin with password field    console.log(chalk.green("✅ Successfully retrieved regular admins"));

  console.log(chalk.magenta.bold("\n🧪 RUNNING ALL TESTS"));

  console.log(chalk.white("═".repeat(50)));    const adminWithPassword = await findSuperAdminWithPassword();    console.log(

  

  let passedTests = 0;    if (!adminWithPassword) {      chalk.cyan(`   Total admins: ${response.data.pagination?.total || 0}`)

  let totalTests = 0;

        console.log(chalk.red("❌ Could not retrieve super admin with password"));    );

  // Test 1: Database Connection

  totalTests++;      return false;    return true;

  if (await testDatabaseConnection()) passedTests++;

      }  } else {

  // Test 2: Super Admin Existence

  totalTests++;        console.log(chalk.red("❌ Failed to get regular admins"));

  const superAdmin = await testSuperAdminExists();

  if (superAdmin) passedTests++;    // Test password comparison    console.log(chalk.red(`   Status: ${response.status}`));

  

  if (superAdmin) {    console.log(chalk.blue("🔄 Comparing password..."));    console.log(chalk.red(`   Error: ${JSON.stringify(response.data)}`));

    // Test 3: Password Verification

    totalTests++;    const isMatch = await bcrypt.compare(password, adminWithPassword.password);    return false;

    if (await testPasswordVerification(superAdmin)) passedTests++;

          }

    // Test 4: JWT Generation

    totalTests++;    if (isMatch) {}

    if (await testJWTGeneration(superAdmin)) passedTests++;

  } else {      console.log(chalk.green("✅ Password verification successful"));

    console.log(chalk.yellow("\n⚠️  Skipping password and JWT tests (no super admin found)"));

  }      return true;/**

  

  // Test 5: Complete Flow    } else { * Test creating new regular admin

  totalTests++;

  if (await testAuthenticationFlow()) passedTests++;      console.log(chalk.red("❌ Password verification failed")); */

  

  // Results      return false;async function testCreateAdmin() {

  console.log(chalk.white("\n" + "═".repeat(50)));

  console.log(chalk.bold(`📊 TEST RESULTS: ${passedTests}/${totalTests} PASSED`));    }  console.log(chalk.blue("👤 Testing create new regular admin..."));

  

  if (passedTests === totalTests) {    

    console.log(chalk.green.bold("✅ ALL TESTS PASSED!"));

  } else {  } catch (error) {  const headers = { Authorization: `Bearer ${superAdminToken}` };

    console.log(chalk.red.bold("❌ SOME TESTS FAILED"));

  }    console.log(chalk.red("❌ Error testing password verification:"), error.message);  const response = await makeRequest(

}

    return false;    "POST",

/**

 * Main function  }    "/api/superadmin/admins",

 */

async function main() {}    TEST_REGULAR_ADMIN,

  try {

    console.log(chalk.magenta.bold("👑 Super Admin Testing System"));    headers

    console.log(chalk.white("═".repeat(50)));

    console.log(chalk.yellow("🔧 This tool helps verify super admin system functionality"));/**  );

    

    // Load environment variables * Test JWT token generation

    require('dotenv').config();

     */  if (response.success && response.status === 201) {

    while (true) {

      displayTestMenu();async function testJWTGeneration(superAdmin) {    createdAdminId = response.data.admin.id;

      const choice = await question(chalk.yellow("❓ Select a test option (1-7): "));

        try {    console.log(chalk.green("✅ Successfully created regular admin"));

      let superAdmin = null;

          console.log(chalk.blue("\n🎫 Testing JWT token generation..."));    console.log(chalk.cyan(`   Email: ${response.data.admin.email}`));

      switch (choice.trim()) {

        case '1':        console.log(chalk.cyan(`   ID: ${createdAdminId}`));

          await testDatabaseConnection();

          break;    // Check if JWT_SECRET exists    return true;

          

        case '2':    if (!process.env.JWT_SECRET) {  } else {

          superAdmin = await testSuperAdminExists();

          break;      console.log(chalk.red("❌ JWT_SECRET not found in environment variables"));    console.log(chalk.red("❌ Failed to create regular admin"));

          

        case '3':      return false;    console.log(chalk.red(`   Status: ${response.status}`));

          // First ensure we have database connection and super admin

          if (!await testDatabaseConnection()) break;    }    console.log(chalk.red(`   Error: ${JSON.stringify(response.data)}`));

          superAdmin = await testSuperAdminExists();

          if (superAdmin) await testPasswordVerification(superAdmin);        return false;

          break;

              // Generate token  }

        case '4':

          // First ensure we have database connection and super admin    const payload = {}

          if (!await testDatabaseConnection()) break;

          superAdmin = await testSuperAdminExists();      id: superAdmin._id,

          if (superAdmin) await testJWTGeneration(superAdmin);

          break;      email: superAdmin.email,/**

          

        case '5':      role: superAdmin.role, * Test revoking admin privileges

          if (!await testDatabaseConnection()) break;

          await testAuthenticationFlow();    }; */

          break;

              async function testRevokeAdmin() {

        case '6':

          await runAllTests();    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });  if (!createdAdminId) {

          break;

                  console.log(chalk.yellow("⚠️  Skipping revoke test - no admin created"));

        case '7':

          console.log(chalk.green("👋 Testing completed. Goodbye!"));    console.log(chalk.green("✅ JWT token generated successfully"));    return true;

          process.exit(0);

          break;    console.log(chalk.cyan(`   🎫 Token length: ${token.length} characters`));  }

          

        default:    console.log(chalk.cyan(`   📝 Token preview: ${token.substring(0, 50)}...`));

          console.log(chalk.red("❌ Invalid option. Please select 1-7."));

          break;      console.log(chalk.blue("🚫 Testing revoke admin privileges..."));

      }

          // Test token verification

      // Ask if user wants to continue

      const continueChoice = await question(    console.log(chalk.blue("🔄 Testing token verification..."));  const headers = { Authorization: `Bearer ${superAdminToken}` };

        chalk.cyan("\n❓ Run another test? (yes/no): ")

      );    const decoded = jwt.verify(token, process.env.JWT_SECRET);  const response = await makeRequest(

      

      if (continueChoice.toLowerCase() !== 'yes' && continueChoice.toLowerCase() !== 'y') {        "PUT",

        console.log(chalk.green("👋 Testing session ended. Goodbye!"));

        break;    console.log(chalk.green("✅ JWT token verification successful"));    `/api/superadmin/admins/${createdAdminId}/revoke`,

      }

    }    console.log(chalk.cyan(`   🆔 Decoded ID: ${decoded.id}`));    null,

    

  } catch (error) {    console.log(chalk.cyan(`   📧 Decoded Email: ${decoded.email}`));    headers

    console.log(chalk.red("❌ Unexpected error:"), error.message);

  } finally {    console.log(chalk.cyan(`   👑 Decoded Role: ${decoded.role}`));  );

    rl.close();

    await database.disconnect();    

    process.exit(0);

  }    return true;  if (response.success && response.status === 200) {

}

        console.log(chalk.green("✅ Successfully revoked admin privileges"));

// Handle process termination

process.on('SIGINT', async () => {  } catch (error) {    console.log(chalk.cyan(`   Admin ID: ${createdAdminId}`));

  console.log(chalk.yellow("\n⚠️  Process interrupted"));

  rl.close();    console.log(chalk.red("❌ Error testing JWT generation:"), error.message);    console.log(chalk.cyan(`   Active: ${response.data.admin.isActive}`));

  await database.disconnect();

  process.exit(0);    return false;    return true;

});

  }  } else {

process.on('SIGTERM', async () => {

  console.log(chalk.yellow("\n⚠️  Process terminated"));}    console.log(chalk.red("❌ Failed to revoke admin privileges"));

  rl.close();

  await database.disconnect();    console.log(chalk.red(`   Status: ${response.status}`));

  process.exit(0);

});/**    console.log(chalk.red(`   Error: ${JSON.stringify(response.data)}`));



// Start the application * Test authentication flow    return false;

if (require.main === module) {

  main(); */  }

}

async function testAuthenticationFlow() {}

module.exports = {

  testDatabaseConnection,  try {

  testSuperAdminExists,

  testPasswordVerification,    console.log(chalk.blue("\n🔄 Testing complete authentication flow..."));/**

  testJWTGeneration,

  testAuthenticationFlow,     * Test restoring admin privileges

  runAllTests

};    // Get credentials */

    const email = await question(chalk.cyan("Enter super admin email: "));async function testRestoreAdmin() {

    const password = await hideInput(chalk.cyan("Enter super admin password: "));  if (!createdAdminId) {

        console.log(chalk.yellow("⚠️  Skipping restore test - no admin created"));

    if (!email || !password) {    return true;

      console.log(chalk.yellow("⚠️  Email or password not provided"));  }

      return false;

    }  console.log(chalk.blue("✅ Testing restore admin privileges..."));

    

    // Step 1: Find admin  const headers = { Authorization: `Bearer ${superAdminToken}` };

    console.log(chalk.blue("1️⃣ Finding admin by email..."));  const response = await makeRequest(

    const admin = await Admin.findOne({ email, role: 'superadmin' }).select('+password');    "PUT",

        `/api/superadmin/admins/${createdAdminId}/restore`,

    if (!admin) {    null,

      console.log(chalk.red("❌ Super admin not found with provided email"));    headers

      return false;  );

    }

      if (response.success && response.status === 200) {

    console.log(chalk.green("✅ Super admin found"));    console.log(chalk.green("✅ Successfully restored admin privileges"));

        console.log(chalk.cyan(`   Admin ID: ${createdAdminId}`));

    // Step 2: Verify password    console.log(chalk.cyan(`   Active: ${response.data.admin.isActive}`));

    console.log(chalk.blue("2️⃣ Verifying password..."));    return true;

    const isValidPassword = await bcrypt.compare(password, admin.password);  } else {

        console.log(chalk.red("❌ Failed to restore admin privileges"));

    if (!isValidPassword) {    console.log(chalk.red(`   Status: ${response.status}`));

      console.log(chalk.red("❌ Invalid password"));    console.log(chalk.red(`   Error: ${JSON.stringify(response.data)}`));

      return false;    return false;

    }  }

    }

    console.log(chalk.green("✅ Password verified"));

    /**

    // Step 3: Generate JWT * Test getting statistics

    console.log(chalk.blue("3️⃣ Generating JWT token...")); */

    const token = jwt.sign(async function testGetStatistics() {

      { id: admin._id, email: admin.email, role: admin.role },  console.log(chalk.blue("📊 Testing get super admin statistics..."));

      process.env.JWT_SECRET,

      { expiresIn: '24h' }  const headers = { Authorization: `Bearer ${superAdminToken}` };

    );  const response = await makeRequest(

        "GET",

    console.log(chalk.green("✅ JWT token generated"));    "/api/superadmin/statistics",

        null,

    // Step 4: Verify JWT    headers

    console.log(chalk.blue("4️⃣ Verifying JWT token..."));  );

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (response.success && response.status === 200) {

    console.log(chalk.green("✅ Complete authentication flow successful"));    const stats = response.data.statistics;

    console.log(chalk.cyan(`   👤 Authenticated as: ${decoded.email}`));    console.log(chalk.green("✅ Successfully retrieved statistics"));

    console.log(chalk.cyan(`   👑 Role: ${decoded.role}`));    console.log(chalk.cyan(`   Total admins: ${stats.admins?.total || 0}`));

    console.log(chalk.cyan(`   🕒 Token expires in: 24 hours`));    console.log(chalk.cyan(`   Active admins: ${stats.admins?.active || 0}`));

        console.log(

    return true;      chalk.cyan(`   Total tokens: ${stats.libraryTokens?.total || 0}`)

        );

  } catch (error) {    return true;

    console.log(chalk.red("❌ Error in authentication flow:"), error.message);  } else {

    return false;    console.log(chalk.red("❌ Failed to get statistics"));

  }    console.log(chalk.red(`   Status: ${response.status}`));

}    console.log(chalk.red(`   Error: ${JSON.stringify(response.data)}`));

    return false;

/**  }

 * Display test menu}

 */

function displayTestMenu() {/**

  console.log(chalk.magenta.bold("\n👑 SUPER ADMIN TESTING CONSOLE")); * Test deleting admin (cleanup)

  console.log(chalk.white("═".repeat(80))); */

  console.log(chalk.cyan("1. 🔗 Test Database Connection"));async function testDeleteAdmin() {

  console.log(chalk.cyan("2. 👤 Check Super Admin Existence"));  if (!createdAdminId) {

  console.log(chalk.cyan("3. 🔒 Test Password Verification"));    console.log(chalk.yellow("⚠️  Skipping delete test - no admin created"));

  console.log(chalk.cyan("4. 🎫 Test JWT Token Generation"));    return true;

  console.log(chalk.cyan("5. 🔄 Test Complete Authentication Flow"));  }

  console.log(chalk.cyan("6. 🧪 Run All Tests"));

  console.log(chalk.cyan("7. 🚪 Exit"));  console.log(chalk.blue("🗑️  Testing delete admin (cleanup)..."));

  console.log(chalk.white("═".repeat(80)));

}  const headers = { Authorization: `Bearer ${superAdminToken}` };

  const response = await makeRequest(

/**    "DELETE",

 * Run all tests    `/api/superadmin/admins/${createdAdminId}`,

 */    null,

async function runAllTests() {    headers

  console.log(chalk.magenta.bold("\n🧪 RUNNING ALL TESTS"));  );

  console.log(chalk.white("═".repeat(50)));

    if (response.success && response.status === 200) {

  let passedTests = 0;    console.log(chalk.green("✅ Successfully deleted admin"));

  let totalTests = 0;    console.log(chalk.cyan(`   Deleted ID: ${response.data.deletedAdmin.id}`));

      return true;

  // Test 1: Database Connection  } else {

  totalTests++;    console.log(chalk.red("❌ Failed to delete admin"));

  if (await testDatabaseConnection()) passedTests++;    console.log(chalk.red(`   Status: ${response.status}`));

      console.log(chalk.red(`   Error: ${JSON.stringify(response.data)}`));

  // Test 2: Super Admin Existence    return false;

  totalTests++;  }

  const superAdmin = await testSuperAdminExists();}

  if (superAdmin) passedTests++;

  /**

  if (superAdmin) { * Test authentication failures

    // Test 3: Password Verification */

    totalTests++;async function testAuthenticationFailures() {

    if (await testPasswordVerification(superAdmin)) passedTests++;  console.log(chalk.blue("🔒 Testing authentication failures..."));

    

    // Test 4: JWT Generation  // Test without token

    totalTests++;  let response = await makeRequest("GET", "/api/superadmin/admins");

    if (await testJWTGeneration(superAdmin)) passedTests++;  if (response.status === 401) {

  } else {    console.log(chalk.green("✅ Correctly rejected request without token"));

    console.log(chalk.yellow("\n⚠️  Skipping password and JWT tests (no super admin found)"));  } else {

  }    console.log(chalk.red("❌ Should have rejected request without token"));

      return false;

  // Test 5: Complete Flow  }

  totalTests++;

  if (await testAuthenticationFlow()) passedTests++;  // Test with invalid token

    const invalidHeaders = { Authorization: "Bearer invalid-token" };

  // Results  response = await makeRequest(

  console.log(chalk.white("\n" + "═".repeat(50)));    "GET",

  console.log(chalk.bold(`📊 TEST RESULTS: ${passedTests}/${totalTests} PASSED`));    "/api/superadmin/admins",

      null,

  if (passedTests === totalTests) {    invalidHeaders

    console.log(chalk.green.bold("✅ ALL TESTS PASSED!"));  );

  } else {  if (response.status === 401) {

    console.log(chalk.red.bold("❌ SOME TESTS FAILED"));    console.log(

  }      chalk.green("✅ Correctly rejected request with invalid token")

}    );

  } else {

/**    console.log(

 * Main function      chalk.red("❌ Should have rejected request with invalid token")

 */    );

async function main() {    return false;

  try {  }

    console.log(chalk.magenta.bold("👑 Super Admin Testing System"));

    console.log(chalk.white("═".repeat(50)));  return true;

    console.log(chalk.yellow("🔧 This tool helps verify super admin system functionality"));}

    

    // Load environment variables/**

    require('dotenv').config(); * Run all tests

     */

    while (true) {async function runAllTests() {

      displayTestMenu();  displayBanner();

      const choice = await question(chalk.yellow("❓ Select a test option (1-7): "));

        const tests = [

      let superAdmin = null;    { name: "Server Health", fn: testServerHealth },

          { name: "Super Admin Login", fn: testSuperAdminLogin },

      switch (choice.trim()) {    { name: "Authentication Failures", fn: testAuthenticationFailures },

        case '1':    { name: "Get All Admins", fn: testGetAllAdmins },

          await testDatabaseConnection();    { name: "Create Admin", fn: testCreateAdmin },

          break;    { name: "Revoke Admin", fn: testRevokeAdmin },

              { name: "Restore Admin", fn: testRestoreAdmin },

        case '2':    { name: "Get Statistics", fn: testGetStatistics },

          superAdmin = await testSuperAdminExists();    { name: "Delete Admin", fn: testDeleteAdmin },

          break;  ];

          

        case '3':  let passed = 0;

          // First ensure we have database connection and super admin  let failed = 0;

          if (!await testDatabaseConnection()) break;

          superAdmin = await testSuperAdminExists();  for (const test of tests) {

          if (superAdmin) await testPasswordVerification(superAdmin);    try {

          break;      const result = await test.fn();

                if (result) {

        case '4':        passed++;

          // First ensure we have database connection and super admin      } else {

          if (!await testDatabaseConnection()) break;        failed++;

          superAdmin = await testSuperAdminExists();      }

          if (superAdmin) await testJWTGeneration(superAdmin);    } catch (error) {

          break;      console.log(

                  chalk.red(`❌ Test "${test.name}" threw an error: ${error.message}`)

        case '5':      );

          if (!await testDatabaseConnection()) break;      failed++;

          await testAuthenticationFlow();    }

          break;    console.log(); // Add spacing between tests

            }

        case '6':

          await runAllTests();  // Display results

          break;  console.log(chalk.blue("=".repeat(60)));

            console.log(chalk.bold("📊 TEST RESULTS"));

        case '7':  console.log(chalk.blue("=".repeat(60)));

          console.log(chalk.green("👋 Testing completed. Goodbye!"));  console.log(chalk.green(`✅ Passed: ${passed}`));

          process.exit(0);  console.log(chalk.red(`❌ Failed: ${failed}`));

          break;  console.log(chalk.blue(`📋 Total: ${tests.length}`));

          

        default:  if (failed === 0) {

          console.log(chalk.red("❌ Invalid option. Please select 1-7."));    console.log(chalk.green.bold("\n🎉 ALL TESTS PASSED!"));

          break;    console.log(chalk.green("✨ Super admin system is working correctly"));

      }  } else {

          console.log(chalk.red.bold("\n💥 SOME TESTS FAILED!"));

      // Ask if user wants to continue    console.log(chalk.yellow("⚠️  Please check the error messages above"));

      const continueChoice = await question(  }

        chalk.cyan("\n❓ Run another test? (yes/no): ")

      );  console.log(chalk.blue("=".repeat(60) + "\n"));

      

      if (continueChoice.toLowerCase() !== 'yes' && continueChoice.toLowerCase() !== 'y') {  return failed === 0;

        console.log(chalk.green("👋 Testing session ended. Goodbye!"));}

        break;

      }// Handle process signals

    }process.on("SIGINT", () => {

      console.log(chalk.yellow("\n⚠️  Tests interrupted by user"));

  } catch (error) {  process.exit(1);

    console.log(chalk.red("❌ Unexpected error:"), error.message);});

  } finally {

    rl.close();process.on("SIGTERM", () => {

    await database.disconnect();  console.log(chalk.yellow("\n⚠️  Tests terminated"));

    process.exit(0);  process.exit(1);

  }});

}

// Run tests

// Handle process terminationif (require.main === module) {

process.on('SIGINT', async () => {  runAllTests()

  console.log(chalk.yellow("\n⚠️  Process interrupted"));    .then((success) => {

  rl.close();      process.exit(success ? 0 : 1);

  await database.disconnect();    })

  process.exit(0);    .catch((error) => {

});      console.error(chalk.red("❌ Test suite error:"), error.message);

      process.exit(1);

process.on('SIGTERM', async () => {    });

  console.log(chalk.yellow("\n⚠️  Process terminated"));}

  rl.close();

  await database.disconnect();module.exports = {

  process.exit(0);  runAllTests,

});  testServerHealth,

  testSuperAdminLogin,

// Start the application  testGetAllAdmins,

if (require.main === module) {  testCreateAdmin,

  main();  testRevokeAdmin,

}  testRestoreAdmin,

  testDeleteAdmin,

module.exports = {  testGetStatistics,

  testDatabaseConnection,  testAuthenticationFailures,

  testSuperAdminExists,};

  testPasswordVerification,
  testJWTGeneration,
  testAuthenticationFlow,
  runAllTests
};