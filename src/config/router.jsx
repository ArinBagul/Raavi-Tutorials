import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import Home from '../pages/Home';
import About from '../pages/About';
import Contact from '../pages/Contact';
import StudentLogin from '../pages/StudentLogin';
import TeacherLogin from '../pages/TeacherLogin';
import AdminLogin from '../pages/AdminLogin';
import StudentRegistration from '../pages/StudentRegistration';
import TeacherRegistration from '../pages/TeacherRegistration';
import AdminPanel from '../pages/AdminPanel';
import { USER_TYPES } from './supabase';
// import StudentDashboard from '../pages/StudentDashboard';
// import TeacherDashboard from '../pages/TeacherDashboard';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/about',
        element: <About />,
      },
      {
        path: '/contact',
        element: <Contact />,
      },
      {
        path: '/student-login',
        element: <StudentLogin />,
      },
      {
        path: '/teacher-login',
        element: <TeacherLogin />,
      },
      {
        path: '/admin-login',
        element: <AdminLogin />,
      },
      {
        path: '/student-registration',
        element: <StudentRegistration />,
      },
      {
        path: '/teacher-registration',
        element: <TeacherRegistration />,
      },
      // {
      //   path: '/student-dashboard',
      //   element: (
      //     <ProtectedRoute allowedRoles={[USER_TYPES.STUDENT]}>
      //       <StudentDashboard />
      //     </ProtectedRoute>
      //   ),
      // },
    //   {
    //     path: '/teacher-dashboard',
    //     element: (
    //       <ProtectedRoute allowedRoles={[USER_TYPES.TEACHER]}>
    //         <TeacherDashboard />
    //       </ProtectedRoute>
    //     ),
    //   },
      {
        path: '/admin-panel',
        element: (
          <ProtectedRoute allowedRoles={[USER_TYPES.ADMIN]}>
            <AdminPanel />
          </ProtectedRoute>
        ),
      },
      {
        path: '/unauthorized',
        element: (
          <div>
            <h1>Unauthorized</h1>
            <p>You do not have permission to access this page.</p>
          </div>
        ),
      },
      {
        path: '*',
        element: (
          <div>
            <h1>404 - Not Found</h1>
            <p>The page you are looking for does not exist.</p>
          </div>
        ),
      },
    ],
  },
]);