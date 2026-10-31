import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/constants/colors.dart';
import '../../../core/providers.dart';

class ReportingScreen extends ConsumerStatefulWidget {
  const ReportingScreen({super.key});

  @override
  ConsumerState<ReportingScreen> createState() => _ReportingScreenState();
}

class _ReportingScreenState extends ConsumerState<ReportingScreen> {
  String _selectedFilter = 'ALL'; // ALL, PENDING, SYNCHRONIZED

  @override
  Widget build(BuildContext context) {
    final reportsAsync = ref.watch(localReportsStreamProvider);
    final reports = reportsAsync.valueOrNull ?? [];

    final filteredReports = reports.where((r) {
      if (_selectedFilter == 'PENDING') return r.syncStatus == 'PENDING';
      if (_selectedFilter == 'SYNCHRONIZED') return r.syncStatus == 'SYNCHRONIZED';
      return true;
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Field Incident Reports'),
        actions: [
          IconButton(
            icon: const Icon(Icons.sync, color: AppColors.primaryBlue),
            tooltip: 'Sync Reports Now',
            onPressed: () => ref.read(syncEngineProvider).triggerFullSync(),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/create-report'),
        icon: const Icon(Icons.add),
        label: const Text('New Report'),
        backgroundColor: AppColors.primaryBlue,
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          // Filter Tabs
          Container(
            color: AppColors.surface,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                _buildFilterChip('ALL', 'All (${reports.length})'),
                const SizedBox(width: 8),
                _buildFilterChip(
                  'PENDING',
                  'Pending (${reports.where((r) => r.syncStatus == 'PENDING').length})',
                  color: AppColors.high,
                ),
                const SizedBox(width: 8),
                _buildFilterChip(
                  'SYNCHRONIZED',
                  'Synced (${reports.where((r) => r.syncStatus == 'SYNCHRONIZED').length})',
                  color: AppColors.safe,
                ),
              ],
            ),
          ),
          const Divider(),

          // Reports List
          Expanded(
            child: filteredReports.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.assignment_outlined, size: 56, color: AppColors.textMuted.withValues(alpha: 0.5)),
                        const SizedBox(height: 12),
                        const Text(
                          'No incident reports match criteria.',
                          style: TextStyle(color: AppColors.textSecondary, fontSize: 14),
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton.icon(
                          onPressed: () => context.push('/create-report'),
                          icon: const Icon(Icons.add, size: 18),
                          label: const Text('Create Offline Incident Report'),
                        ),
                      ],
                    ),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: filteredReports.length,
                    separatorBuilder: (_, _) => const SizedBox(height: 10),
                    itemBuilder: (context, index) {
                      final rep = filteredReports[index];
                      final isSynced = rep.syncStatus == 'SYNCHRONIZED';
                      final observedStr = DateFormat('MMM d, HH:mm').format(rep.observedAt.toLocal());

                      return Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: AppColors.primaryBlueSubtle,
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      rep.category.replaceAll('_', ' '),
                                      style: const TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.primaryBlue,
                                      ),
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: isSynced ? AppColors.safeLight : AppColors.highLight,
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(color: isSynced ? AppColors.safe : AppColors.high),
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Icon(
                                          isSynced ? Icons.cloud_done : Icons.cloud_off,
                                          size: 12,
                                          color: isSynced ? AppColors.safe : AppColors.high,
                                        ),
                                        const SizedBox(width: 4),
                                        Text(
                                          rep.syncStatus,
                                          style: TextStyle(
                                            fontSize: 10,
                                            fontWeight: FontWeight.w800,
                                            color: isSynced ? AppColors.safe : AppColors.high,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 10),
                              Text(
                                rep.title,
                                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                rep.description,
                                style: const TextStyle(fontSize: 13, color: AppColors.textSecondary, height: 1.3),
                              ),
                              const SizedBox(height: 12),
                              Row(
                                children: [
                                  if (rep.latitude != null && rep.longitude != null) ...[
                                    const Icon(Icons.location_on, size: 14, color: AppColors.textMuted),
                                    const SizedBox(width: 4),
                                    Text(
                                      '${rep.latitude!.toStringAsFixed(4)}, ${rep.longitude!.toStringAsFixed(4)}',
                                      style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                                    ),
                                    const SizedBox(width: 12),
                                  ],
                                  const Icon(Icons.people_alt, size: 14, color: AppColors.textMuted),
                                  const SizedBox(width: 4),
                                  Text(
                                    '${rep.peopleAffected} affected',
                                    style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                                  ),
                                  if (rep.casualties > 0) ...[
                                    const SizedBox(width: 12),
                                    Text(
                                      '${rep.casualties} casualties',
                                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.critical),
                                    ),
                                  ],
                                  const Spacer(),
                                  Text(
                                    observedStr,
                                    style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String filterKey, String label, {Color color = AppColors.primaryBlue}) {
    final isSelected = _selectedFilter == filterKey;
    return InkWell(
      onTap: () => setState(() => _selectedFilter = filterKey),
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? color.withValues(alpha: 0.12) : AppColors.surfaceVariant,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: isSelected ? color : AppColors.border),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
            color: isSelected ? color : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }
}
