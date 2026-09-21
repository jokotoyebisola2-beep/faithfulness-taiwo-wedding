import { Resend } from 'resend';

// Cache to prevent duplicate email notifications for the same RSVP
const processedRsvps = new Map<string, number>();
const DEDUP_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

// Helper to safely parse JSON body across different server environments
async function parseRequestBody(req: any): Promise<any> {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body);
      } catch {
        return {};
      }
    }
    return req.body;
  }

  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk: any) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

function sendResponse(res: any, statusCode: number, payload: Record<string, any>) {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(statusCode).json(payload);
  }
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

export default async function handler(req: any, res: any) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return sendResponse(res, 405, { error: 'Method not allowed. Use POST.' });
  }

  try {
    const data = await parseRequestBody(req);
    const { id, name, attendance, guestCount, phone, message, submittedAt } = data || {};

    if (!name) {
      return sendResponse(res, 400, { error: 'Guest name is required.' });
    }

    // 1. Deduplication check
    const rsvpKey = id || `${name.trim().toLowerCase()}_${attendance}_${guestCount}`;
    const now = Date.now();
    const lastSent = processedRsvps.get(rsvpKey);
    if (lastSent && now - lastSent < DEDUP_WINDOW_MS) {
      return sendResponse(res, 200, {
        success: true,
        message: 'Duplicate RSVP notification skipped.',
        deduplicated: true,
      });
    }

    // 2. Read server-side environment variables
    const apiKey = process.env.RESEND_API_KEY;
    // Final destination for RSVP notifications: strictly gotaiwo12@gmail.com
    const recipientEmail =
      (process.env.WEDDING_NOTIFICATION_EMAIL &&
      process.env.WEDDING_NOTIFICATION_EMAIL.trim() !== ''
        ? process.env.WEDDING_NOTIFICATION_EMAIL.trim().toLowerCase()
        : 'gotaiwo12@gmail.com') || 'gotaiwo12@gmail.com';
    const deliveredTo = recipientEmail;
    const fromEmail =
      process.env.RESEND_FROM_EMAIL ||
      'Faithfulness & Taiwo Wedding <onboarding@resend.dev>';

    // If Resend API key is not configured, log gracefully and return informative response
    if (!apiKey || apiKey.trim() === '') {
      console.warn(
        '[RSVP Email Notice] RESEND_API_KEY environment variable is not configured yet. The RSVP is preserved in Firestore/storage, but email notification was skipped.'
      );
      return sendResponse(res, 200, {
        success: false,
        warning: 'RESEND_API_KEY is not set in environment variables.',
        recipient: recipientEmail,
        deliveredTo: deliveredTo,
        savedToDatabase: true,
      });
    }

    // Format human-readable attendance and date
    const attendanceDisplay =
      attendance === 'yes' ? 'Joyfully Attending' : 'Regretfully Declining';
    const submissionDate = submittedAt ? new Date(submittedAt) : new Date();
    const formattedDate = submissionDate.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });

    const safeName = String(name || '').trim();
    const safeGuestCount = attendance === 'yes' ? Number(guestCount || 1) : 0;
    const safePhone = phone ? String(phone).trim() : 'Not provided';
    const safeMessage = message ? String(message).trim() : 'No personal message attached';

    // 3. Email Subject
    const emailSubject = `New Wedding RSVP — ${safeName}`;

    // 4. Clean plain-text fallback
    const textContent = `New Wedding RSVP — Faithfulness & Taiwo
Destination: ${recipientEmail}

Guest Name: ${safeName}
Attendance: ${attendanceDisplay} (${attendance})
Number of Guests: ${safeGuestCount}
Phone: ${safePhone}
Message: ${safeMessage}

Submitted: ${formattedDate}
RSVP ID: ${id || 'N/A'}
`;

    // 5. Clean, elegant Natural Tones HTML design
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Wedding RSVP</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FDFCF8; margin: 0; padding: 24px; color: #1B3022; }
    .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #E6E2DC; overflow: hidden; box-shadow: 0 4px 16px rgba(27, 48, 34, 0.05); }
    .header { background: #1B3022; padding: 32px 24px; text-align: center; color: #FDFCF8; }
    .monogram { display: inline-block; width: 44px; height: 44px; line-height: 44px; border-radius: 50%; border: 1px solid #C5A059; color: #C5A059; font-weight: bold; font-size: 16px; letter-spacing: 2px; margin-bottom: 12px; }
    .header h1 { margin: 0 0 6px; font-size: 22px; font-weight: 500; letter-spacing: 0.5px; }
    .header p { margin: 0; color: #C5A059; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; }
    .content { padding: 32px 28px; }
    .badge { display: inline-block; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
    .badge-yes { background-color: #EBF3ED; color: #1B3022; border: 1px solid #C0DEC8; }
    .badge-no { background-color: #F8F5F1; color: #73685C; border: 1px solid #E3DDD4; }
    .table-details { width: 100%; border-collapse: collapse; margin-top: 20px; }
    .table-details td { padding: 12px 0; border-bottom: 1px solid #F0ECE6; font-size: 14px; vertical-align: top; }
    .table-details td.label { width: 36%; color: #6E7B73; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
    .table-details td.value { color: #1B3022; font-weight: 500; }
    .message-box { margin-top: 24px; padding: 16px; border-radius: 10px; background-color: #FDFCF8; border-left: 3px solid #C5A059; font-style: italic; color: #354B3E; font-size: 14px; line-height: 1.6; }
    .footer { text-align: center; padding: 20px; font-size: 11px; color: #8A968F; border-top: 1px solid #F0ECE6; background-color: #FAF8F5; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="monogram">F&amp;T</div>
      <h1>New Wedding RSVP</h1>
      <p>Faithfulness &amp; Taiwo &bull; 24 October 2026</p>
    </div>
    <div class="content">
      <div style="text-align: center; margin-bottom: 24px;">
        <span class="badge ${attendance === 'yes' ? 'badge-yes' : 'badge-no'}">
          ${attendanceDisplay}
        </span>
      </div>

      <table class="table-details">
        <tr>
          <td class="label">Guest Name</td>
          <td class="value"><strong>${safeName}</strong></td>
        </tr>
        <tr>
          <td class="label">Attendance</td>
          <td class="value">${attendanceDisplay}</td>
        </tr>
        <tr>
          <td class="label">Number of Guests</td>
          <td class="value">${safeGuestCount} ${safeGuestCount === 1 ? 'Guest' : 'Guests'}</td>
        </tr>
        <tr>
          <td class="label">Contact Phone</td>
          <td class="value">${safePhone}</td>
        </tr>
        <tr>
          <td class="label">Recipient Email</td>
          <td class="value">${recipientEmail}</td>
        </tr>
        <tr>
          <td class="label">Submitted</td>
          <td class="value">${formattedDate}</td>
        </tr>
      </table>

      ${
        message
          ? `
      <div style="margin-top: 24px;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6E7B73; font-weight: 600; margin-bottom: 6px;">
          Personal Message
        </div>
        <div class="message-box">
          &ldquo;${safeMessage.replace(/</g, '&lt;').replace(/>/g, '&gt;')}&rdquo;
        </div>
      </div>
      `
          : ''
      }
    </div>
    <div class="footer">
      Faithfulness &amp; Taiwo Wedding RSVP Notification System &bull; Ibadan, Nigeria
    </div>
  </div>
</body>
</html>
`;

    // 6. Send email via Resend API directly to gotaiwo12@gmail.com
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': rsvpKey,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [recipientEmail],
        subject: emailSubject,
        text: textContent,
        html: htmlContent,
      }),
    });

    const resendData = (await resendResponse.json().catch(() => ({}))) as any;

    // Record in dedup cache
    processedRsvps.set(rsvpKey, now);

    if (!resendResponse.ok) {
      console.warn('[Resend API Warning]:', resendData?.message || resendResponse.statusText);
      return sendResponse(res, 200, {
        success: false,
        warning: resendData?.message || 'Email delivery restricted by email service provider.',
        recipient: recipientEmail,
        deliveredTo: deliveredTo,
        savedToDatabase: true,
      });
    }

    return sendResponse(res, 200, {
      success: true,
      messageId: resendData?.id,
      recipient: recipientEmail,
      deliveredTo: deliveredTo,
    });
  } catch (error: any) {
    console.error('[RSVP Email Notification Error]:', error);
    // Return status 200 with error info so client never fails the user RSVP
    return sendResponse(res, 200, {
      success: false,
      error: error?.message || 'Failed to send email notification.',
      savedToDatabase: true,
    });
  }
}
