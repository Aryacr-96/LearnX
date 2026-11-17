from django.core.mail import EmailMultiAlternatives
from django.conf import settings

def send_credentials_email(email, username, password, role_label):
    subject = f"Your {role_label} account has been created"
    
    # 1. Plain text fallback (for email clients that don't support HTML)
    text_content = (
        f"Hello,\n\n"
        f"An account has been created for you as a {role_label}.\n\n"
        f"Username: {username}\n"
        f"Password: {password}\n\n"
        f"Please log in and change your password.\n\n"
        f"Regards,\nAdmin"
    )

    # 2. The HTML Design
    # Note: Gmail strips out <style> tags and modern CSS, so we must use INLINE CSS here.
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f5f7; font-family: Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f5f7; padding: 40px 0;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                        
                        <!-- Header -->
                        <tr>
                            <td align="center" style="background-color: #4545A5; padding: 30px;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">LearnX</h1>
                            </td>
                        </tr>

                        <!-- Body -->
                        <tr>
                            <td style="padding: 40px 30px;">
                                <h2 style="color: #333333; margin-top: 0;">Welcome to the Team!</h2>
                                <p style="color: #555555; font-size: 16px; line-height: 1.6;">
                                    Hello,<br><br>
                                    An account has been created for you as a <strong>{role_label}</strong>.
                                </p>
                                
                                <!-- Credentials Box -->
                                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; margin: 25px 0; border: 1px solid #e9ecef;">
                                    <tr>
                                        <td style="padding: 20px;">
                                            <p style="margin: 0 0 10px 0; color: #555;"><strong>Username:</strong> {username}</p>
                                            <p style="margin: 0; color: #555;"><strong>Password:</strong> {password}</p>
                                        </td>
                                    </tr>
                                </table>

                                # <p style="color: #d9534f; font-size: 14px; text-align: center; margin-bottom: 30px;">
                                #     ⚠️ Please log in and change your password immediately for security reasons.
                                # </p>

                                # <!-- Button -->
                                # <table width="100%" cellpadding="0" cellspacing="0">
                                #     <tr>
                                #         <td align="center">
                                #             <a href="https://your-admin-panel-url.com/login" style="background-color: #4545A5; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                                #                 Log In Now
                                #             </a>
                                #         </td>
                                #     </tr>
                                # </table>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td align="center" style="background-color: #f8f9fa; padding: 20px; border-top: 1px solid #e9ecef;">
                                <p style="color: #999999; font-size: 12px; margin: 0;">
                                    Regards,<br>Admin Team
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """

    # 3. Send the email
    msg = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@example.com"),
        to=[email],
    )
    msg.attach_alternative(html_content, "text/html")
    msg.send(fail_silently=False)