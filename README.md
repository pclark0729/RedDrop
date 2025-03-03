# RedDrop - Blood Donation Management System

RedDrop is a comprehensive platform designed to connect blood donors with recipients, facilitate the discovery of nearby donation camps, and enable urgent blood requests during emergencies.

## Features

- User registration and profile management for donors and recipients
- Real-time donor matching based on blood type, location, and availability
- Location-based search for nearby donation camps
- Emergency notifications for urgent blood requests
- Donation camp management and discovery
- Administrative dashboard for system management

## Tech Stack

- **Frontend**: React.js, TypeScript, Tailwind CSS
- **Backend**: Supabase (Authentication, Database, Storage)
- **Deployment**: [To be determined]

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/reddrop.git
   cd reddrop
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   - Create a `.env.local` file in the root directory
   - Add your Supabase credentials:
     ```
     VITE_SUPABASE_URL=your-supabase-url
     VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
     ```

4. Start the development server:
   ```
   npm run dev
   ```

## Project Structure

The project follows a feature-based architecture:

- `src/app`: App configuration
- `src/components`: Reusable UI components
- `src/features`: Feature-specific modules
- `src/pages`: Page components
- `src/routes`: Routing configuration
- `src/services`: API services
- `src/hooks`: Custom React hooks
- `src/utils`: Utility functions

## Contributing

[Guidelines for contributing to the project]

## License

[License information]

## Contact

[Contact information]
