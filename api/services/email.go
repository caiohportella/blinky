package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"
)

type EmailService struct {
	APIKey string
	From   string
}

type ResendEmailRequest struct {
	From    string   `json:"from"`
	To      []string `json:"to"`
	Subject string   `json:"subject"`
	Html    string   `json:"html"`
}

func NewEmailService() *EmailService {
	apiKey := os.Getenv("RESEND_API_KEY")
	from := os.Getenv("RESEND_FROM")

	if from == "" {
		from = "Blinky <onboarding@resend.dev>"
	}

	return &EmailService{
		APIKey: apiKey,
		From:   from,
	}
}

func (e *EmailService) SendOTP(to, userName, code string) error {
	if e.APIKey == "" {
		return fmt.Errorf("RESEND_API_KEY is not configured")
	}

	html := generateOTPEmailTemplate(userName, code)

	emailReq := ResendEmailRequest{
		From:    e.From,
		To:      []string{to},
		Subject: fmt.Sprintf("🔐 Your Blinky Verification Code: %s", code),
		Html:    html,
	}

	jsonData, err := json.Marshal(emailReq)
	if err != nil {
		return fmt.Errorf("failed to marshal email request: %w", err)
	}

	req, err := http.NewRequest("POST", "https://api.resend.com/emails", bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", e.APIKey))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return fmt.Errorf("resend API error: status %d", resp.StatusCode)
	}

	return nil
}

func generateOTPEmailTemplate(userName, otpCode string) string {
	currentYear := time.Now().Year()

	if userName == "" {
		userName = "there"
	}

	return fmt.Sprintf(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Blinky Verification Code</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
  <table role="presentation" style="width: 100%%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 480px; width: 100%%; border-collapse: collapse;">
          
          <!-- Logo & Header -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <table role="presentation" style="border-collapse: collapse;">
                <tr>
                  <td style="padding-right: 8px;">
                    <img src="https://raw.githubusercontent.com/caiohportella/blinky/main/client/app/icon.svg" alt="Blinky" width="40" height="40" style="display: block;">
                  </td>
                  <td>
                    <span style="font-size: 28px; font-weight: 700; color: #18181b;">Blinky</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td>
              <table role="presentation" style="width: 100%%; border-collapse: collapse; background: #ffffff; border-radius: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1); overflow: hidden;">
                
                <!-- Yellow Accent Bar -->
                <tr>
                  <td style="height: 6px; background: linear-gradient(90deg, #e7cc01 0%%, #fbbf24 100%%);"></td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px 32px;">
                    
                    <!-- Shield Icon -->
                    <table role="presentation" style="width: 100%%; border-collapse: collapse;">
                      <tr>
                        <td align="center" style="padding-bottom: 24px;">
                          <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #fef3c7 0%%, #fde68a 100%%); border-radius: 50%%; line-height: 64px; text-align: center; font-size: 28px;">
                            🛡️
                          </div>
                        </td>
                      </tr>
                    </table>

                    <!-- Greeting -->
                    <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700; color: #18181b; text-align: center;">
                      Verification Code
                    </h1>
                    <p style="margin: 0 0 32px 0; font-size: 15px; color: #64748b; text-align: center; line-height: 1.6;">
                      Hi %s! Use the code below to complete your sign-in to Blinky.
                    </p>

                    <!-- OTP Code Box -->
                    <table role="presentation" style="width: 100%%; border-collapse: collapse;">
                      <tr>
                        <td align="center">
                          <table role="presentation" style="border-collapse: collapse; background: linear-gradient(135deg, #18181b 0%%, #27272a 100%%); border-radius: 16px;">
                            <tr>
                              <td style="padding: 20px 48px;">
                                <span style="font-size: 36px; font-weight: 700; letter-spacing: 12px; color: #e7cc01; font-family: 'Courier New', Courier, monospace;">
                                  %s
                                </span>
                              </td>
                            </tr>
                          </table>
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
                    <table role="presentation" style="width: 100%%; border-collapse: collapse; background: #f8fafc; border-radius: 12px;">
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
                © %d Blinky. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`, userName, otpCode, currentYear)
}
