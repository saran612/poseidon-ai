import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/constants/colors.dart';
import '../../../core/providers.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final session = ref.watch(sessionProvider);
    final syncState = ref.watch(syncStateProvider).valueOrNull;
    final assignments = ref.watch(localAssignmentsStreamProvider).valueOrNull ?? [];
    final reports = ref.watch(localReportsStreamProvider).valueOrNull ?? [];
    final bridges = ref.watch(localBridgesStreamProvider).valueOrNull ?? [];

    final activeAssignments = assignments.where((a) => a.status != 'COMPLETED').toList();
    final closedBridges = bridges.where((b) => b.status == 'CLOSED').toList();
    final pendingOutbox = syncState?.pendingOutboxCount ?? 0;
    final isOnline = syncState?.isOnline ?? false;
    final lastSyncStr = syncState?.lastSyncedAt != null
        ? DateFormat('HH:mm:ss').format(syncState!.lastSyncedAt!.toLocal())
        : 'Not yet synchronized';

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('POSEIDON AI', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 17)),
            Text(
              session != null
                  ? '${session.ownerName} (${session.role})'
                  : 'Field Responder Client',
              style: const TextStyle(fontSize: 11, color: AppColors.textSecondary, fontWeight: FontWeight.w500),
            ),
          ],
        ),
        actions: [
          // Connectivity Status Pill
          Container(
            margin: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: isOnline ? AppColors.safeLight : AppColors.highLight,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: isOnline ? AppColors.safe : AppColors.high),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  isOnline ? Icons.wifi : Icons.wifi_off,
                  size: 14,
                  color: isOnline ? AppColors.safe : AppColors.high,
                ),
                const SizedBox(width: 4),
                Text(
                  isOnline ? 'ONLINE' : 'OFFLINE',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: isOnline ? AppColors.safe : AppColors.high,
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.sync, color: AppColors.primaryBlue),
            tooltip: 'Trigger Full Synchronization',
            onPressed: () async {
              final scaffoldMessenger = ScaffoldMessenger.of(context);
              final success = await ref.read(syncEngineProvider).triggerFullSync();
              scaffoldMessenger.showSnackBar(
                SnackBar(
                  content: Text(success ? 'Synchronization completed' : 'Sync offline or unreachable'),
                  duration: const Duration(seconds: 2),
                ),
              );
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.read(syncEngineProvider).triggerFullSync(),
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Critical Hazard Alert Banner if bridges closed
              if (closedBridges.isNotEmpty) ...[
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppColors.criticalLight,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.critical, width: 1.5),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.warning_amber_rounded, color: AppColors.critical, size: 28),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'CRITICAL INFRASTRUCTURE ALERT',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w800,
                                color: AppColors.critical,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '${closedBridges.length} bridge crossings currently CLOSED due to flood inundation. Dynamic rerouting active.',
                              style: const TextStyle(fontSize: 12, color: AppColors.textPrimary),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
              ],

              // Operational Status Bar Card
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: _buildStatItem('ACTIVE MISSIONS', '${activeAssignments.length}', AppColors.primaryBlue),
                          ),
                          _buildDivider(),
                          Expanded(
                            child: _buildStatItem('OUTBOX QUEUE', '$pendingOutbox pending', pendingOutbox > 0 ? AppColors.high : AppColors.safe),
                          ),
                          _buildDivider(),
                          Expanded(
                            child: _buildStatItem('REPORTS SAVED', '${reports.length}', AppColors.textPrimary),
                          ),
                        ],
                      ),
                      const Divider(height: 24),
                      Row(
                        children: [
                          const Icon(Icons.access_time, size: 14, color: AppColors.textMuted),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              'Sync: $lastSyncStr',
                              style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            isOnline ? 'HTTPS / Online' : 'Offline Outbox',
                            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.primaryBlue),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Quick Action Buttons
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () => context.push('/create-report'),
                      icon: const Icon(Icons.add_alert, size: 18),
                      label: const Text('Report Incident', style: TextStyle(fontSize: 13)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.critical,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () => context.push('/evidence-capture'),
                      icon: const Icon(Icons.camera_alt, size: 18),
                      label: const Text('Capture Evidence', style: TextStyle(fontSize: 13)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryBlue,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Active Rescue Assignments Section
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Active Rescue Assignments',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                  ),
                  TextButton(
                    onPressed: () => context.go('/assignments'),
                    child: const Text('View All', style: TextStyle(fontSize: 13, color: AppColors.primaryBlue)),
                  ),
                ],
              ),
              const SizedBox(height: 8),

              if (activeAssignments.isEmpty) ...[
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: const Center(
                    child: Text(
                      'No active rescue dispatches assigned. Ready for field standby.',
                      style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                    ),
                  ),
                ),
              ] else ...[
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: activeAssignments.take(3).length,
                  separatorBuilder: (_, _) => const SizedBox(height: 8),
                  itemBuilder: (context, index) {
                    final asgn = activeAssignments[index];
                    return Card(
                      child: ListTile(
                        onTap: () => context.push('/assignments/${asgn.id}'),
                        leading: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: asgn.status == 'ACKNOWLEDGED'
                                ? AppColors.safeLight
                                : AppColors.primaryBlueSubtle,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Icon(
                            asgn.resourceType == 'BOAT' ? Icons.directions_boat : Icons.medical_services,
                            color: asgn.status == 'ACKNOWLEDGED' ? AppColors.safe : AppColors.primaryBlue,
                          ),
                        ),
                        title: Text(
                          '${asgn.id}: ${asgn.quantity}x ${asgn.resourceType}',
                          style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
                        ),
                        subtitle: Text(
                          'Dest: ${asgn.destination} • ETA: ${asgn.travelTimeMin.toStringAsFixed(1)} min',
                          style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                        ),
                        trailing: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: asgn.status == 'ACKNOWLEDGED' ? AppColors.safeLight : AppColors.highLight,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            asgn.status,
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: asgn.status == 'ACKNOWLEDGED' ? AppColors.safe : AppColors.high,
                            ),
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ],
              const SizedBox(height: 24),

              // Recent Field Incident Reports Section
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Recent Field Reports',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                  ),
                  TextButton(
                    onPressed: () => context.go('/reports'),
                    child: const Text('View All', style: TextStyle(fontSize: 13, color: AppColors.primaryBlue)),
                  ),
                ],
              ),
              const SizedBox(height: 8),

              if (reports.isEmpty) ...[
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: const Center(
                    child: Text(
                      'No incident reports submitted yet. Tap "Report Incident" to file an observation.',
                      style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                    ),
                  ),
                ),
              ] else ...[
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: reports.take(3).length,
                  separatorBuilder: (_, _) => const SizedBox(height: 8),
                  itemBuilder: (context, index) {
                    final rep = reports[index];
                    final isSynced = rep.syncStatus == 'SYNCHRONIZED';
                    return Card(
                      child: ListTile(
                        onTap: () => context.push('/reports'),
                        leading: Icon(
                          rep.category.contains('FLOOD') ? Icons.water_damage : Icons.warning,
                          color: rep.casualties > 0 ? AppColors.critical : AppColors.primaryBlue,
                        ),
                        title: Text(rep.title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                        subtitle: Text(
                          '${rep.category} • ${rep.peopleAffected} affected',
                          style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                        ),
                        trailing: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: isSynced ? AppColors.safeLight : AppColors.highLight,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                isSynced ? Icons.check_circle : Icons.schedule,
                                size: 12,
                                color: isSynced ? AppColors.safe : AppColors.high,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                rep.syncStatus,
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  color: isSynced ? AppColors.safe : AppColors.high,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatItem(String title, String value, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.textMuted), overflow: TextOverflow.ellipsis),
        const SizedBox(height: 4),
        Text(value, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: color), overflow: TextOverflow.ellipsis),
      ],
    );
  }

  Widget _buildDivider() {
    return Container(height: 28, width: 1, color: AppColors.border);
  }
}
