import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../config/env.dart';
import '../../../core/constants/colors.dart';
import '../../../core/providers.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final session = ref.watch(sessionProvider);
    final syncState = ref.watch(syncStateProvider).valueOrNull;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Device & Field Operator Profile'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // User Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 28,
                      backgroundColor: AppColors.primaryBlueSubtle,
                      child: Icon(
                        session?.isFieldOfficer == true ? Icons.military_tech : Icons.person,
                        size: 32,
                        color: AppColors.primaryBlue,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            session?.ownerName ?? 'Field Responder',
                            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Device: ${session?.deviceCode ?? "DEV-OFFICER-PERUR"} (#${session?.numericId ?? 101})',
                            style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                          ),
                          const SizedBox(height: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.primaryBlueSubtle,
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              'AUTHORITY TIER: ${session?.tier ?? "T1"}',
                              style: const TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w800,
                                color: AppColors.primaryBlue,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Hardware & Cryptographic Profile
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'HARDWARE & CRYPTOGRAPHY SPECIFICATION',
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.textMuted),
                    ),
                    const SizedBox(height: 12),
                    _buildInfoRow('HMAC Algorithm:', 'HMAC-SHA256 (Truncated 8-byte tag)'),
                    _buildInfoRow('Binary Frame Size:', '31 Bytes compact frame'),
                    _buildInfoRow('Replay Anti-Tamper Window:', '64-bit sliding window bitmap'),
                    _buildInfoRow('Message Counter State:', '#${session?.messageCounter ?? 1}'),
                    _buildInfoRow('Active Transport:', syncState?.isOnline == true ? 'HTTPS / Wi-Fi API' : 'Durable SQLite Outbox'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Network Configuration
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'COORDINATION SERVER SETTINGS',
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.textMuted),
                    ),
                    const SizedBox(height: 12),
                    _buildInfoRow('API Endpoint:', Environment.defaultBaseUrl),
                    _buildInfoRow('WebSocket Stream:', Environment.defaultWsUrl),
                    _buildInfoRow('Geospatial Corridor:', 'Coimbatore Noyyal Catchment'),
                    _buildInfoRow('Target Region:', 'Tamil Nadu, India'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Actions
            ElevatedButton.icon(
              onPressed: () async {
                final sm = ScaffoldMessenger.of(context);
                final success = await ref.read(syncEngineProvider).triggerFullSync();
                sm.showSnackBar(
                  SnackBar(
                    content: Text(success ? 'Synchronization completed.' : 'Sync failed / offline.'),
                    backgroundColor: success ? AppColors.safe : AppColors.high,
                  ),
                );
              },
              icon: const Icon(Icons.sync),
              label: const Text('Force Authoritative Synchronization'),
              style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 14)),
            ),
            const SizedBox(height: 10),

            OutlinedButton.icon(
              onPressed: () async {
                await ref.read(sessionProvider.notifier).logout();
                if (context.mounted) {
                  context.go('/login');
                }
              },
              icon: const Icon(Icons.logout, color: AppColors.critical),
              label: const Text('Switch Device / Logout', style: TextStyle(color: AppColors.critical)),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: AppColors.critical),
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
          Text(value, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
        ],
      ),
    );
  }
}

