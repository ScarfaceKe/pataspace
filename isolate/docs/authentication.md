# PataSpace Authentication and User Registration Foundation

This module extends the accepted Master Prompt 1 and Master Prompt 2 foundations. It does not replace the Kenya-only scope, the four property categories, official brand standards, four entry points, guided interview rules, or trust principles.

## Authentication philosophy

Authentication is fast, secure, simple, mobile-first, and professional. Account creation is intentionally split into a few clear steps so it does not feel complicated.

## Public account types

Every public user creates one account and chooses one role during registration:

1. 👤 Customer
2. 👑 Property Owner
3. 🏢 Property Manager
4. 🤝 Leasing Agent

The Platform Admin account is not publicly available and is managed separately.

## Required registration information

New users must provide:

- Full Name
- Phone Number in Kenyan format
- Email Address
- Password
- Confirm Password

All required fields are validated before account creation.

## Phone and email

The phone number is required because future workflows such as viewing requests and property management depend on trusted contact information.

The email address is required for login, notifications where applicable, account recovery, and platform communication.

## Password and account security

Passwords must meet minimum security rules and are hashed with `scrypt` before storage. Passwords are never displayed in plain text. Registration, login, and reset screens include a Show/Hide Password option.

## Login and dashboard routing

Users log in using email address and password. After successful authentication they are automatically routed by role:

- Customer → `/customer/home`
- Property Owner → `/owner/dashboard`
- Property Manager → `/manager/dashboard`
- Leasing Agent → `/agent/dashboard`
- Platform Admin → `/admin/dashboard`

## Forgot password

The password recovery workflow lets users request reset instructions and set a new password without creating another account. Reset tokens are stored as hashes, expire, and are marked as used after a successful reset.

## Sessions

Sessions use signed, HTTP-only cookies and expire according to secure platform policy. By default, creating a new active web session revokes previous active sessions for the same account to prevent duplicate active sessions where appropriate.

## Profile foundation

Every authenticated account has a profile foundation that stores basic personal information, account role, contact information, and account status. Future prompts may extend profiles without replacing this foundation.

## Error handling

Failed login attempts are handled gracefully with friendly, specific, helpful messages. Technical system details are never exposed to users.
