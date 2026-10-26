const path = require('path');
const { chromium } = require('playwright');
const { WORKSPACE_DIR } = require('../personality');

const whatsappToolSchema = {
  type: 'function',
  function: {
    name: 'send_whatsapp_message',
    description: 'Automate WhatsApp Web via Playwright to send a message to a contact or phone number. Requires Human-in-the-loop approval.',
    parameters: {
      type: 'object',
      properties: {
        recipient: {
          type: 'string',
          description: 'Contact name or international phone number (digits only, e.g., "919876543210").'
        },
        message: {
          type: 'string',
          description: 'Exact text message to send.'
        }
      },
      required: ['recipient', 'message']
    }
  }
};

async function executeWhatsappTool({ recipient, message }) {
  const sessionDir = path.join(WORKSPACE_DIR, 'whatsapp-session');
  let context;
  try {
    context = await chromium.launchPersistentContext(sessionDir, {
      headless: false,
      viewport: { width: 1000, height: 720 }
    });

    const page = context.pages()[0] || (await context.newPage());
    const isPhoneNumber = /^\+?\d{8,15}$/.test(recipient.replace(/\s+/g, ''));

    if (isPhoneNumber) {
      const cleanPhone = recipient.replace(/\D/g, '');
      await page.goto(
        `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`
      );
      await page.waitForSelector('div[contenteditable="true"]', { timeout: 45000 });
      await page.keyboard.press('Enter');
      await page.waitForTimeout(2500);
    } else {
      await page.goto('https://web.whatsapp.com');
      const searchBox = await page.waitForSelector('div[contenteditable="true"]', { timeout: 45000 });
      await searchBox.click();
      await page.keyboard.type(recipient, { delay: 60 });
      await page.waitForTimeout(1500);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
      await page.keyboard.type(message, { delay: 40 });
      await page.keyboard.press('Enter');
      await page.waitForTimeout(2500);
    }

    await context.close();
    return {
      status: 'success',
      recipient,
      message,
      note: 'WhatsApp message dispatched via persistent browser session.'
    };
  } catch (error) {
    if (context) {
      try { await context.close(); } catch (_) {}
    }
    return {
      status: 'error',
      message: `WhatsApp automation failed: ${error.message}. Ensure WhatsApp Web QR code is linked.`
    };
  }
}

module.exports = {
  whatsappToolSchema,
  executeWhatsappTool
};
