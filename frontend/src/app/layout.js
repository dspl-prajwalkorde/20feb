import './globals.css';
import MuiProvider from './providers/MuiProvider';
import { AuthProvider } from './context/AuthContext';

export const metadata = {
  title: 'Leave Management System',
  description: 'Employee Leave Portal',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <MuiProvider>
            {children}
          </MuiProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
