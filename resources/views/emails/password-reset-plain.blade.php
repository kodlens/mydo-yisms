Hello {{ $user->fname ?? $user->name ?? $user->username ?? 'there' }},

We received a request to reset the password for your eKabataan (MYDO) account.

You can reset your password by visiting the following link:
{{ $url }}

This password reset link will expire in {{ $count ?? 60 }} minutes.

If you did not request a password reset, no further action is required. Your password will remain unchanged.

Regards,
Municipal Youth Development Office (MYDO)
Municipality of Dumingag, Zamboanga del Sur
