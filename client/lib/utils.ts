import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate a beautiful OTP email template
 */
export function generateOTPEmailTemplate(userName: string, otpCode: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Blinky Verification Code</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 480px; width: 100%; border-collapse: collapse;">
          
          <!-- Logo & Header -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <div style="display: inline-flex; align-items: center; gap: 8px;">
                <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 25C25 25 5 50 5 50C5 50 25 75 50 75C75 75 95 50 95 50C95 50 75 25 50 25Z" stroke="#18181b" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="#ffffff"/>
                  <path d="M55 35L45 50H55L45 65L65 45H55L65 35H55Z" fill="#e7cc01" stroke="#e7cc01" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span style="font-size: 28px; font-weight: 700; color: #18181b;">Blinky</span>
              </div>
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td>
              <table role="presentation" style="width: 100%; border-collapse: collapse; background: #ffffff; border-radius: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);">
                
                <!-- Yellow Accent Bar -->
                <tr>
                  <td style="height: 6px; background: linear-gradient(90deg, #e7cc01 0%, #fbbf24 100%); border-radius: 24px 24px 0 0;"></td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px 32px;">
                    
                    <!-- Shield Icon -->
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td align="center" style="padding-bottom: 24px;">
                          <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                              <path d="m9 12 2 2 4-4"/>
                            </svg>
                          </div>
                        </td>
                      </tr>
                    </table>

                    <!-- Greeting -->
                    <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700; color: #18181b; text-align: center;">
                      Verification Code
                    </h1>
                    <p style="margin: 0 0 32px 0; font-size: 15px; color: #64748b; text-align: center; line-height: 1.6;">
                      Hi ${userName || 'there'}! Use the code below to complete your sign-in to Blinky.
                    </p>

                    <!-- OTP Code Box -->
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td align="center">
                          <div style="display: inline-block; padding: 20px 48px; background: linear-gradient(135deg, #18181b 0%, #27272a 100%); border-radius: 16px;">
                            <span style="font-size: 36px; font-weight: 700; letter-spacing: 12px; color: #e7cc01; font-family: 'Courier New', Courier, monospace;">
                              ${otpCode}
                            </span>
                          </div>
                        </td>
                      </tr>
                    </table>

                    <!-- Expiry Notice -->
                    <p style="margin: 24px 0 0 0; font-size: 13px; color: #94a3b8; text-align: center;">
                      ⏱️ This code expires in <strong style="color: #64748b;">10 minutes</strong>
                    </p>

                  </td>
                </tr>

                <!-- Divider -->
                <tr>
                  <td style="padding: 0 32px;">
                    <div style="height: 1px; background: #e2e8f0;"></div>
                  </td>
                </tr>

                <!-- Security Notice -->
                <tr>
                  <td style="padding: 24px 32px 32px 32px;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse; background: #f8fafc; border-radius: 12px; padding: 16px;">
                      <tr>
                        <td style="padding: 16px;">
                          <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 600; color: #475569;">
                            🔒 Security Tip
                          </p>
                          <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.5;">
                            Never share this code with anyone. Blinky will never ask for your verification code via phone or email.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 32px;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #94a3b8;">
                Didn't request this code? You can safely ignore this email.
              </p>
              <p style="margin: 0; font-size: 12px; color: #cbd5e1;">
                © ${new Date().getFullYear()} Blinky. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}