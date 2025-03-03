# RedDrop - Blood Donation Management System

RedDrop is a modern web application that connects blood donors with recipients, making the blood donation process more efficient and accessible.

## Features

- User authentication and profile management
- Donor registration and onboarding
- Blood donation tracking
- Blood drive scheduling and management
- Blood request management
- Matching donors with recipients
- Notifications for upcoming drives and urgent requests

## Tech Stack

- **Frontend**: React, TypeScript, Chakra UI
- **Backend**: Supabase (Authentication, Database, Storage)
- **Hosting**: Vercel/Netlify (recommended)

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Supabase account

## Setup

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/reddrop.git
cd reddrop
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Set up Supabase**

- Create a new project in [Supabase](https://supabase.com)
- Run the SQL scripts in the `database/schema.sql` file in the Supabase SQL editor
- Copy your Supabase URL and anon key

4. **Environment Variables**

- Copy the `.env.example` file to `.env.local`
- Update the Supabase URL and anon key in the `.env.local` file

```bash
cp .env.example .env.local
```

5. **Start the development server**

```bash
npm run dev
# or
yarn dev
```

6. **Open the application**

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Database Schema

The application uses the following main tables:

- `profiles`: User profiles (extends Supabase auth.users)
- `blood_drives`: Blood donation events
- `donations`: Record of blood donations
- `blood_requests`: Requests for blood
- `donation_appointments`: Scheduled donation appointments
- `matches`: Connections between donations and requests
- `notifications`: User notifications

## Deployment

### Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Set the environment variables
4. Deploy

### Netlify

1. Push your code to GitHub
2. Import the project in Netlify
3. Set the environment variables
4. Deploy

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

[Contact information]
