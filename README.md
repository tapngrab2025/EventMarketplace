# Event Marketplace

A full-stack web application for managing and participating in events, with dedicated features for vendors, customers, and administrators.

## Features

- **Event Management**
  - Create and manage events
  - Add stalls to events
  - List products in stalls
  - Search functionality for events, stalls, and products

- **User Roles**
  - Vendors: Create events, manage stalls, and list products
  - Customers: Browse events, purchase products
  - Administrators: Manage users and system settings

- **Shopping Features**
  - Shopping cart functionality
  - Order management
  - QR code generation for orders

## Database Commands

## Dispatch email configuration

Dispatch emails are sent through AWS SES when a stall order changes to `delivered`. Verify your sender domain or email address in SES, then add an IAM access key whose policy permits `ses:SendEmail`:

```env
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_iam_access_key_id
AWS_SECRET_ACCESS_KEY=your_iam_secret_access_key
EMAIL_FROM="Tap & Grab <orders@your-verified-domain.com>"
```

Only a transition to `delivered` sends an email; saving the same status again does not.

### Push Schema Changes
Update the database schema with your latest changes:
```bash
npm run db:push
```

### Flush Database
The `db:flush` command allows you to clear database tables with options to preserve specific user types:

```bash
# Delete all data including users
npm run db:flush

# Delete all data except admin users
npm run db:flush admin

# Delete all data except users
npm run db:flush all_users
```
