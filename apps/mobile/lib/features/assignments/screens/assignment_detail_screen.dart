import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/colors.dart';
import '../../../core/providers.dart';
import '../../../database/local_database.dart';

class AssignmentDetailScreen extends ConsumerStatefulWidget {
  final String assignmentId;

  const AssignmentDetailScreen({super.key, required this.assignmentId});

  @override
  ConsumerState<AssignmentDetailScreen> createState() => _AssignmentDetailScreenState();
}

class _AssignmentDetailScreenState extends ConsumerState<AssignmentDetailScreen> {
  bool _isSubmitting = false;

  Future<void> _submitStatusUpdate(LocalAssignment asgn, String newStatus, String notes) async {
    setState(() => _isSubmitting = true);
    final scaffoldMessenger = ScaffoldMessenger.of(context);

    try {
      final outbox = ref.read(outboxManagerProvider);
      final syncEngine = ref.read(syncEngineProvider);
      final session = ref.read(sessionProvider);
      final deviceCode = session?.deviceCode ?? 'DEV-OFFICER-PERUR';

      // 1. Enqueue acknowledgement into durable outbox
      await outbox.enqueueAssignmentAcknowledgement(
        assignmentId: asgn.id,
        deviceCode: deviceCode,
        status: newStatus,
        notes: notes,
      );

      // 2. Trigger transmission immediately
      final success = await syncEngine.triggerFullSync();

      if (success) {
        scaffoldMessenger.showSnackBar(
          SnackBar(
            content: Text('Server Confirmed: Assignment $newStatus received by Command.'),
            backgroundColor: AppColors.safe,
          ),
        );
      } else {
        scaffoldMessenger.showSnackBar(
          SnackBar(
            content: Text('Offline: Acknowledgement queued in outbox. Will transmit once connected.'),
            backgroundColor: AppColors.high,
          ),
        );
      }
    } catch (e) {
      scaffoldMessenger.showSnackBar(
        SnackBar(content: Text('Error: $e'), backgroundColor: AppColors.critical),
      );
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final assignments = ref.watch(localAssignmentsStreamProvider).valueOrNull ?? [];
    final asgn = assignments.where((a) => a.id == widget.assignmentId).firstOrNull;

    if (asgn == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Assignment Details')),
        body: const Center(child: Text('Assignment not found')),
      );
    }

    final isConfirmedByServer = asgn.serverConfirmed;
    final routeNodes = asgn.routeNodesJson.split(',').where((s) => s.isNotEmpty).toList();

    return Scaffold(
      appBar: AppBar(
        title: Text(asgn.id),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Status and Confirmation Banner
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isConfirmedByServer ? AppColors.safeLight : AppColors.highLight,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: isConfirmedByServer ? AppColors.safe : AppColors.high),
              ),
              child: Row(
                children: [
                  Icon(
                    isConfirmedByServer ? Icons.verified_user : Icons.pending_actions,
                    color: isConfirmedByServer ? AppColors.safe : AppColors.high,
                    size: 32,
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'ASSIGNMENT STATUS: ${asgn.status}',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w800,
                            color: isConfirmedByServer ? AppColors.safe : AppColors.high,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          isConfirmedByServer
                              ? 'Authoritative server confirmation established.'
                              : 'Pending field acknowledgement transmission.',
                          style: const TextStyle(fontSize: 12, color: AppColors.textPrimary),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Key Mission Specs Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'TACTICAL RELIEF DISPATCH SPECIFICATIONS',
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.textMuted),
                    ),
                    const SizedBox(height: 14),
                    _buildDetailRow('Assigned Resources:', '${asgn.quantity}x ${asgn.resourceType}'),
                    _buildDetailRow('Operational Plan ID:', '${asgn.planId} (v${asgn.versionNumber})'),
                    _buildDetailRow('Origin Depot:', asgn.depotId),
                    _buildDetailRow('Target Sector:', '${asgn.zoneName} (${asgn.zoneId})'),
                    _buildDetailRow('Destination Facility:', asgn.destination),
                    _buildDetailRow('Estimated Transit Time:', '${asgn.travelTimeMin.toStringAsFixed(1)} min'),
                    _buildDetailRow('Priority Level:', asgn.priority),
                    _buildDetailRow('Coordinates:', '${asgn.latitude.toStringAsFixed(4)}, ${asgn.longitude.toStringAsFixed(4)}'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Navigation Route Nodes Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.alt_route, size: 18, color: AppColors.primaryBlue),
                        SizedBox(width: 8),
                        Text(
                          'COORDINATED DISPATCH ROUTE WAYPOINTS',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    if (routeNodes.isEmpty) ...[
                      const Text('Direct corridor transit', style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                    ] else ...[
                      ...routeNodes.asMap().entries.map((entry) {
                        final idx = entry.key;
                        final node = entry.value;
                        final isLast = idx == routeNodes.length - 1;
                        return Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Column(
                              children: [
                                Container(
                                  width: 16,
                                  height: 16,
                                  decoration: BoxDecoration(
                                    color: isLast ? AppColors.safe : AppColors.primaryBlue,
                                    shape: BoxShape.circle,
                                  ),
                                  child: Center(
                                    child: Text(
                                      '${idx + 1}',
                                      style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                                    ),
                                  ),
                                ),
                                if (!isLast)
                                  Container(
                                    width: 2,
                                    height: 24,
                                    color: AppColors.border,
                                  ),
                              ],
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                node.replaceAll('ZONE_', '').replaceAll('DEPOT_', ''),
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: isLast ? FontWeight.w700 : FontWeight.w500,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                            ),
                          ],
                        );
                      }),
                    ],
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Action Buttons for Field Responder
            const Text(
              'Field Responder Actions',
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
            ),
            const SizedBox(height: 10),

            if (asgn.status == 'SCHEDULED' || asgn.status == 'DISPATCHED') ...[
              ElevatedButton.icon(
                onPressed: _isSubmitting
                    ? null
                    : () => _submitStatusUpdate(asgn, 'ACCEPTED', 'Responder received order and accepted mission.'),
                icon: const Icon(Icons.check_circle_outline),
                label: const Text('Acknowledge & Accept Assignment'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.safe,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
              ),
              const SizedBox(height: 8),
            ],

            if (asgn.status != 'EN_ROUTE' && asgn.status != 'COMPLETED') ...[
              OutlinedButton.icon(
                onPressed: _isSubmitting
                    ? null
                    : () => _submitStatusUpdate(asgn, 'EN_ROUTE', 'Unit en route along cleared corridor.'),
                icon: const Icon(Icons.navigation),
                label: const Text('Mark En Route to Disaster Sector'),
                style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 14)),
              ),
              const SizedBox(height: 8),
            ],

            if (asgn.status != 'COMPLETED') ...[
              ElevatedButton.icon(
                onPressed: _isSubmitting
                    ? null
                    : () => _submitStatusUpdate(asgn, 'DELIVERED', 'Relief resources successfully delivered at sector.'),
                icon: const Icon(Icons.task_alt),
                label: const Text('Confirm Delivery & Completion'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryBlue,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
          Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
        ],
      ),
    );
  }
}

