import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../core/constants/colors.dart';
import '../features/assignments/screens/assignment_detail_screen.dart';
import '../features/assignments/screens/assignments_screen.dart';
import '../features/authentication/screens/login_screen.dart';
import '../features/authentication/screens/register_device_screen.dart';
import '../features/dashboard/screens/dashboard_screen.dart';
import '../features/evidence/screens/evidence_capture_screen.dart';
import '../features/map/screens/map_screen.dart';
import '../features/profile/screens/profile_screen.dart';
import '../features/reporting/screens/create_report_screen.dart';
import '../features/reporting/screens/reporting_screen.dart';

final GlobalKey<NavigatorState> _rootNavigatorKey = GlobalKey<NavigatorState>();
final GlobalKey<NavigatorState> _shellNavigatorKey = GlobalKey<NavigatorState>();

class MainNavigationShell extends StatelessWidget {
  final Widget child;

  const MainNavigationShell({super.key, required this.child});

  int _calculateSelectedIndex(BuildContext context) {
    final location = GoRouterState.of(context).uri.toString();
    if (location.startsWith('/dashboard')) return 0;
    if (location.startsWith('/map')) return 1;
    if (location.startsWith('/reports')) return 2;
    if (location.startsWith('/assignments')) return 3;
    if (location.startsWith('/profile')) return 4;
    return 0;
  }

  void _onItemTapped(int index, BuildContext context) {
    switch (index) {
      case 0:
        context.go('/dashboard');
        break;
      case 1:
        context.go('/map');
        break;
      case 2:
        context.go('/reports');
        break;
      case 3:
        context.go('/assignments');
        break;
      case 4:
        context.go('/profile');
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    final selectedIndex = _calculateSelectedIndex(context);

    return Scaffold(
      body: child,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: selectedIndex,
        onTap: (index) => _onItemTapped(index, context),
        selectedItemColor: AppColors.primaryBlue,
        unselectedItemColor: AppColors.textMuted,
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.dashboard_outlined),
            activeIcon: Icon(Icons.dashboard),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.map_outlined),
            activeIcon: Icon(Icons.map),
            label: 'Map',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.description_outlined),
            activeIcon: Icon(Icons.description),
            label: 'Reports',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.assignment_outlined),
            activeIcon: Icon(Icons.assignment),
            label: 'Assignments',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person_outline),
            activeIcon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}

final appRouter = GoRouter(
  navigatorKey: _rootNavigatorKey,
  initialLocation: '/dashboard',
  routes: [
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/register-device',
      builder: (context, state) => const RegisterDeviceScreen(),
    ),
    GoRoute(
      path: '/create-report',
      parentNavigatorKey: _rootNavigatorKey,
      builder: (context, state) => const CreateReportScreen(),
    ),
    GoRoute(
      path: '/evidence-capture',
      parentNavigatorKey: _rootNavigatorKey,
      builder: (context, state) => const EvidenceCaptureScreen(),
    ),
    GoRoute(
      path: '/assignments/:id',
      parentNavigatorKey: _rootNavigatorKey,
      builder: (context, state) {
        final id = state.pathParameters['id']!;
        return AssignmentDetailScreen(assignmentId: id);
      },
    ),
    ShellRoute(
      navigatorKey: _shellNavigatorKey,
      builder: (context, state, child) => MainNavigationShell(child: child),
      routes: [
        GoRoute(
          path: '/dashboard',
          builder: (context, state) => const DashboardScreen(),
        ),
        GoRoute(
          path: '/map',
          builder: (context, state) => const MapScreen(),
        ),
        GoRoute(
          path: '/reports',
          builder: (context, state) => const ReportingScreen(),
        ),
        GoRoute(
          path: '/assignments',
          builder: (context, state) => const AssignmentsScreen(),
        ),
        GoRoute(
          path: '/profile',
          builder: (context, state) => const ProfileScreen(),
        ),
      ],
    ),
  ],
);

