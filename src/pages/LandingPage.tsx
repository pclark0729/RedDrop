import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth';

const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-red-600">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1615461066841-6116e61058f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
            alt="Blood donation"
          />
          <div className="absolute inset-0 bg-red-700 mix-blend-multiply" aria-hidden="true"></div>
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">RedDrop</h1>
          <p className="mt-6 text-xl text-red-100 max-w-3xl">
            Connecting blood donors with those in need. Save lives with just a few clicks.
          </p>
          <div className="mt-10 flex space-x-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/auth/signin"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth/signup"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-800 bg-opacity-60 hover:bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="py-16 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-red-600 tracking-wide uppercase">Features</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              How RedDrop Works
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
              Our platform connects blood donors with recipients, facilitates donation camp discovery, and enables urgent blood requests.
            </p>
          </div>
          
          <div className="mt-16">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-red-500 text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg font-medium text-gray-900">Donor Registration</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Register as a blood donor and help save lives. Provide your blood type, location, and availability to be matched with those in need.
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-red-500 text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg font-medium text-gray-900">Blood Requests</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Create blood requests during emergencies. Our system will match you with compatible donors in your area.
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-red-500 text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg font-medium text-gray-900">Donation Camps</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Find blood donation camps near you. Register for upcoming camps and contribute to the community.
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-red-500 text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg font-medium text-gray-900">Real-time Notifications</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Receive instant notifications about urgent blood requests, donation matches, and nearby camps.
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-red-500 text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg font-medium text-gray-900">Donation History</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Track your donation history and impact. See how many lives you've helped save.
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-red-500 text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg font-medium text-gray-900">Privacy & Security</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Your data is secure with us. We prioritize privacy and only share necessary information for donation purposes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="bg-white pt-12 sm:pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Making a difference together
            </h2>
            <p className="mt-3 text-xl text-gray-500 sm:mt-4">
              Join thousands of donors who are saving lives every day through our platform.
            </p>
          </div>
        </div>
        <div className="mt-10 pb-12 bg-white sm:pb-16">
          <div className="relative">
            <div className="absolute inset-0 h-1/2 bg-gray-50"></div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto">
                <dl className="rounded-lg bg-white shadow-lg sm:grid sm:grid-cols-3">
                  <div className="flex flex-col border-b border-gray-100 p-6 text-center sm:border-0 sm:border-r">
                    <dt className="order-2 mt-2 text-lg leading-6 font-medium text-gray-500">Donors</dt>
                    <dd className="order-1 text-5xl font-extrabold text-red-600">5,000+</dd>
                  </div>
                  <div className="flex flex-col border-t border-b border-gray-100 p-6 text-center sm:border-0 sm:border-l sm:border-r">
                    <dt className="order-2 mt-2 text-lg leading-6 font-medium text-gray-500">Donations</dt>
                    <dd className="order-1 text-5xl font-extrabold text-red-600">10,000+</dd>
                  </div>
                  <div className="flex flex-col border-t border-gray-100 p-6 text-center sm:border-0 sm:border-l">
                    <dt className="order-2 mt-2 text-lg leading-6 font-medium text-gray-500">Lives Saved</dt>
                    <dd className="order-1 text-5xl font-extrabold text-red-600">30,000+</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-red-700">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to save lives?</span>
            <span className="block">Join RedDrop today.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-red-200">
            Every donation counts. Register as a donor or create a blood request in minutes.
          </p>
          <div className="mt-8 flex justify-center">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                to="/auth/signup"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
              >
                Sign Up Now
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 