import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/colors.dart';
import '../../../core/providers.dart';

class AssignmentsScreen extends ConsumerWidget {
  const AssignmentsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final assignmentsAsync = ref.watch(localAssignmentsStreamProvider);
    final assignments = assignmentsAsync.valueOrNull ?? [];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Rescue & Relief Assignments'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: AppColors.primaryBlue),
            tooltip: 'Sync Latest Dispatches',
            onPressed: () => ref.read(syncEngineProvider).triggerFullSync(),
          ),
        ],
      ),
      body: assignments.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.assignment_turned_in_outlined, size: 56, color: AppColors.textMuted),
                  const SizedBox(height: 16),
                  const Text(
                    'No rescue assignments in local database.',
                    style: TextStyle(color: AppColors.textSecondary, fontSize: 14),
                  ),
                  const SizedBox(height: 12),
                  ElevatedButton(
                    onPressed: () => ref.read(syncEngineProvider).triggerFullSync(),
                    child: const Text('Fetch Missions from Command Server'),
                  ),
                ],
              ),
            )
          : ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: assignments.length,
              separatorBuilder: (_, _) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final asgn = assignments[index];
                final isAcked = asgn.status == 'ACKNOWLEDGED' || asgn.status == 'EN_ROUTE' || asgn.status == 'COMPLETED';

                return Card(
                  child: InkWell(
                    borderRadius: BorderRadius.circular(12),
                    onTap: () => context.push('/assignments/${asgn.id}'),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                asgn.id,
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w800,
                                  color: AppColors.primaryBlue,
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: isAcked ? AppColors.safeLight : AppColors.highLight,
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(color: isAcked ? AppColors.safe : AppColors.high),
                                ),
                                child: Text(
                                  asgn.status,
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                    color: isAcked ? AppColors.safe : AppColors.high,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 10),
                          Text(
                            '${asgn.quantity}x ${asgn.resourceType} Dispatch',
                            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Destination: ${asgn.destination}',
                            style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: asgn.priority == 'HIGH' ? AppColors.criticalLight : AppColors.surfaceVariant,
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  'PRIORITY: ${asgn.priority}',
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w800,
                                    color: asgn.priority == 'HIGH' ? AppColors.critical : AppColors.textSecondary,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              const Icon(Icons.timer_outlined, size: 14, color: AppColors.textMuted),
                              const SizedBox(width: 4),
                              Text(
                                'ETA: ${asgn.travelTimeMin.toStringAsFixed(1)} min',
                                style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                              ),
                              const Spacer(),
                              const Icon(Icons.chevron_right, color: AppColors.textMuted),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
    );
  }
}
