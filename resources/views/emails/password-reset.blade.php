@php
  $hasMessage = isset($message) && is_object($message) && method_exists($message, 'embed');
  $eKabataanLogo = ($hasMessage && file_exists(public_path('images/e-kabataan.png')))
      ? $message->embed(public_path('images/e-kabataan.png'))
      : asset('images/e-kabataan.png');
  $domingagLogo = ($hasMessage && file_exists(public_path('images/domingag-logo-340x.png')))
      ? $message->embed(public_path('images/domingag-logo-340x.png'))
      : asset('images/domingag-logo-340x.png');
@endphp
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Reset Your Password - eKabataan MYDO</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      -webkit-font-smoothing: antialiased;
    }
    table {
      border-collapse: collapse;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }
    .btn-reset {
      background-color: #059669;
      color: #ffffff !important;
      padding: 14px 32px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 15px;
      display: inline-block;
      letter-spacing: 0.3px;
      box-shadow: 0 4px 6px -1px rgba(5, 150, 105, 0.3);
    }
    .btn-reset:hover {
      background-color: #047857;
    }
    .link-break {
      word-break: break-all;
      color: #059669;
      font-size: 13px;
      text-decoration: underline;
    }
    @media only screen and (max-width: 600px) {
      .email-wrapper {
        padding: 16px 8px !important;
      }
      .content-padding {
        padding: 24px 20px !important;
      }
      .header-padding {
        padding: 28px 20px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">

  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9;">
    <tr>
      <td align="center" class="email-wrapper" style="padding: 40px 16px;">
        
        <!-- Email Container -->
        <table role="presentation" border="0" cellspacing="0" cellpadding="0" class="email-container" style="max-width: 600px; width: 100%; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
          
          <!-- Header Banner with Official Logos -->
          <tr>
            <td class="header-padding" style="background: linear-gradient(135deg, #065f46 0%, #059669 100%); padding: 36px 32px; text-align: center;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%">
                <tr>
                  <td align="center">
                    
                    <!-- Logos Table (CID embedded for 100% email client compatibility) -->
                    <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto 16px auto;">
                      <tr>
                        <td align="center" valign="middle" style="padding: 0 8px;">
                          <div style="background-color: #ffffff; padding: 4px; border-radius: 50%; width: 56px; height: 56px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15); display: inline-block;">
                            <img src="{{ $domingagLogo }}" alt="Municipality of Dumingag Seal" width="56" height="56" style="display: block; width: 56px; height: 56px; border-radius: 50%; object-fit: contain; margin: 0 auto;" />
                          </div>
                        </td>
                        <td align="center" valign="middle" style="padding: 0 8px;">
                          <div style="background-color: #ffffff; padding: 4px; border-radius: 12px; width: 56px; height: 56px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15); display: inline-block;">
                            <img src="{{ $eKabataanLogo }}" alt="eKabataan Logo" width="56" height="56" style="display: block; width: 56px; height: 56px; object-fit: contain; margin: 0 auto;" />
                          </div>
                        </td>
                      </tr>
                    </table>

                    <h1 style="margin: 0 0 4px 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">eKabataan • MYDO</h1>
                    <p style="margin: 0; color: #a7f3d0; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">Youth Information Management System</p>
                    <p style="margin: 4px 0 0 0; color: #d1fae5; font-size: 12px;">Municipality of Dumingag, Zamboanga del Sur</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td class="content-padding" style="padding: 36px 36px 28px 36px;">
              
              <!-- Greeting -->
              <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #0f172a;">
                Hello, {{ $user->fname ?? $user->name ?? $user->username ?? 'there' }}!
              </h2>

              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #334155;">
                We received a request to reset the password for your account associated with <strong>{{ $user->email ?? $user->getEmailForPasswordReset() }}</strong>.
              </p>

              <p style="margin: 0 0 28px 0; font-size: 15px; line-height: 1.6; color: #334155;">
                To choose a new password and regain access to your account, click the button below:
              </p>

              <!-- CTA Button -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%" style="margin-bottom: 28px;">
                <tr>
                  <td align="center">
                    <a href="{{ $url }}" target="_blank" class="btn-reset" style="background-color: #059669; color: #ffffff !important; padding: 14px 34px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Notice Box -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%" style="background-color: #f8fafc; border-left: 4px solid #059669; border-radius: 4px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 14px 16px;">
                    <p style="margin: 0 0 6px 0; font-size: 13px; color: #1e293b; font-weight: 600;">
                      Security Information
                    </p>
                    <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #64748b; line-height: 1.5;">
                      <li>This password reset link will expire in <strong>{{ $count ?? 60 }} minutes</strong>.</li>
                      <li>If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- Fallback Link Section -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%" style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 20px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748b; line-height: 1.5;">
                      If you're having trouble clicking the "Reset Password" button, copy and paste the URL below into your web browser:
                    </p>
                    <p style="margin: 0; font-size: 12px; line-height: 1.4; word-break: break-all;">
                      <a href="{{ $url }}" class="link-break" style="color: #059669; text-decoration: underline;">{{ $url }}</a>
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer Section -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 36px; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #475569;">
                Municipal Youth Development Office (MYDO)
              </p>
              <p style="margin: 0 0 8px 0; font-size: 11px; color: #94a3b8;">
                Municipality of Dumingag, Zamboanga del Sur
              </p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                This is an automated security notification. Please do not reply directly to this email.
              </p>
            </td>
          </tr>

        </table>
        <!-- /Email Container -->

      </td>
    </tr>
  </table>

</body>
</html>

          <!-- Main Content Body -->
          <tr>
            <td class="content-padding" style="padding: 36px 36px 28px 36px;">
              
              <!-- Greeting -->
              <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #0f172a;">
                Hello, {{ $user->fname ?? $user->name ?? $user->username ?? 'there' }}!
              </h2>

              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #334155;">
                We received a request to reset the password for your account associated with <strong>{{ $user->email ?? $user->getEmailForPasswordReset() }}</strong>.
              </p>

              <p style="margin: 0 0 28px 0; font-size: 15px; line-height: 1.6; color: #334155;">
                To choose a new password and regain access to your account, click the button below:
              </p>

              <!-- CTA Button -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%" style="margin-bottom: 28px;">
                <tr>
                  <td align="center">
                    <a href="{{ $url }}" target="_blank" class="btn-reset" style="background-color: #059669; color: #ffffff !important; padding: 14px 34px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Notice Box -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%" style="background-color: #f8fafc; border-left: 4px solid #059669; border-radius: 4px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 14px 16px;">
                    <p style="margin: 0 0 6px 0; font-size: 13px; color: #1e293b; font-weight: 600;">
                      Security Information
                    </p>
                    <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #64748b; line-height: 1.5;">
                      <li>This password reset link will expire in <strong>{{ $count ?? 60 }} minutes</strong>.</li>
                      <li>If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- Fallback Link Section -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%" style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 20px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748b; line-height: 1.5;">
                      If you're having trouble clicking the "Reset Password" button, copy and paste the URL below into your web browser:
                    </p>
                    <p style="margin: 0; font-size: 12px; line-height: 1.4; word-break: break-all;">
                      <a href="{{ $url }}" class="link-break" style="color: #059669; text-decoration: underline;">{{ $url }}</a>
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer Section -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 36px; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #475569;">
                Municipal Youth Development Office (MYDO)
              </p>
              <p style="margin: 0 0 8px 0; font-size: 11px; color: #94a3b8;">
                Municipality of Dumingag, Zamboanga del Sur
              </p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                This is an automated security notification. Please do not reply directly to this email.
              </p>
            </td>
          </tr>

        </table>
        <!-- /Email Container -->

      </td>
    </tr>
  </table>

</body>
</html>
