# RedDrop - Blood Donation Management System

RedDrop is a modern web application designed to connect blood donors with those in need, streamline the blood donation process, and help save lives.

## Features

- **User Authentication**: Secure sign-up and sign-in functionality with Supabase Auth
- **User Profiles**: Complete user profiles with personal and medical information
- **Blood Drives**: Browse and register for upcoming blood drives
- **Blood Requests**: Create and manage blood donation requests
- **Donation History**: Track your donation history and impact
- **Appointment Scheduling**: Schedule appointments for blood donations
- **Notifications**: Receive notifications about donation opportunities and updates

## Tech Stack

- **Frontend**: React with Vite, TypeScript, Chakra UI
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **State Management**: React Context API
- **Styling**: Chakra UI with custom components

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/reddrop.git
   cd reddrop
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the root directory with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Database Setup

### Schema Setup

1. Navigate to your Supabase project
2. Go to the SQL Editor
3. Run the SQL scripts in the following order:
   - `database/schema.sql` - Creates tables, functions, and policies
   - `database/seed.sql` - Populates the database with sample data

### Database Schema

The database consists of the following main tables:

- **profiles**: Extends Supabase auth.users with additional user information
- **blood_drives**: Information about blood donation events
- **donations**: Records of completed blood donations
- **blood_requests**: Requests for blood donations
- **donation_appointments**: Scheduled appointments for donations
- **matches**: Connections between donations and requests
- **notifications**: System notifications for users

## Project Structure

```
reddrop/
├── database/               # Database scripts
│   ├── schema.sql          # Database schema
│   └── seed.sql            # Sample data
├── public/                 # Static assets
├── src/
│   ├── app/                # App configuration
│   │   └── supabase.ts     # Supabase client
│   ├── components/         # Reusable components
│   │   ├── common/         # Common UI components
│   │   └── layout/         # Layout components
│   ├── features/           # Feature-specific components
│   │   ├── auth/           # Authentication components
│   │   ├── bloodDrives/    # Blood drives components
│   │   ├── donations/      # Donations components
│   │   └── requests/       # Blood requests components
│   ├── lib/                # Utility functions
│   ├── routes/             # Application routes
│   ├── types/              # TypeScript type definitions
│   ├── main.tsx            # Application entry point
│   └── App.tsx             # Main App component
├── .env                    # Environment variables
├── index.html              # HTML entry point
├── package.json            # Project dependencies
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

## Authentication Flow

1. **Sign Up**:
   - User registers with email and password
   - A profile is automatically created via database trigger
   - User is directed to complete onboarding

2. **Onboarding**:
   - User completes their profile with personal information
   - Medical information is collected for donor eligibility
   - Onboarding status is updated in the database

3. **Sign In**:
   - User signs in with email and password
   - If onboarding is incomplete, user is directed to complete it
   - Otherwise, user is directed to the dashboard

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Supabase](https://supabase.io/) for the backend infrastructure
- [Chakra UI](https://chakra-ui.com/) for the component library
- [React](https://reactjs.org/) for the frontend framework
