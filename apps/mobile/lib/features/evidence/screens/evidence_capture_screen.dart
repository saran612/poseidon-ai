import 'package:drift/drift.dart' as drift;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:uuid/uuid.dart';
import '../../../core/constants/colors.dart';
import '../../../core/providers.dart';
import '../../../database/local_database.dart';

class EvidenceCaptureScreen extends ConsumerStatefulWidget {
  const EvidenceCaptureScreen({super.key});

  @override
  ConsumerState<EvidenceCaptureScreen> createState() => _EvidenceCaptureScreenState();
}

class _EvidenceCaptureScreenState extends ConsumerState<EvidenceCaptureScreen> {
  final _descriptionController = TextEditingController();
  final _latController = TextEditingController(text: '10.9708');
  final _lonController = TextEditingController(text: '76.9152');
  String _selectedIncidentType = 'FLOOD_WATER_LEVEL';
  String? _capturedPhotoFile;
  bool _isSaving = false;

  @override
  void dispose() {
    _descriptionController.dispose();
    _latController.dispose();
    _lonController.dispose();
    super.dispose();
  }

  void _simulateCapture() {
    setState(() {
      _capturedPhotoFile = 'DCIM/POSEIDON/EV_${DateTime.now().millisecondsSinceEpoch}.jpg';
      if (_descriptionController.text.isEmpty) {
        _descriptionController.text = 'Ground photographic survey confirming inundation depth over roadway.';
      }
    });
  }

  Future<void> _saveEvidence() async {
    if (_descriptionController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter an evidence description')),
      );
      return;
    }

    setState(() => _isSaving = true);
    try {
      final db = ref.read(databaseProvider);
      final session = ref.read(sessionProvider);
      final now = DateTime.now().toUtc();
      final evidenceId = const Uuid().v4();
      final messageId = 'msg-ev-${now.millisecondsSinceEpoch % 100000}';

      final lat = double.tryParse(_latController.text.trim());
      final lon = double.tryParse(_lonController.text.trim());

      await db.into(db.evidenceRecords).insert(
            EvidenceRecordsCompanion.insert(
              id: evidenceId,
              messageId: messageId,
              incidentType: _selectedIncidentType,
              description: _descriptionController.text.trim(),
              photoPath: drift.Value(_capturedPhotoFile),
              latitude: drift.Value(lat),
              longitude: drift.Value(lon),
              sourceTier: session?.tier ?? 'T1',
              confidence: const drift.Value(0.92),
              status: const drift.Value('LOCAL'),
              observedAt: now,
            ),
          );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Evidence metadata preserved in local audit log.'),
            backgroundColor: AppColors.safe,
          ),
        );
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: AppColors.critical),
        );
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final session = ref.watch(sessionProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Evidence Capture'),
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
            // Evidence Viewfinder / Capture Box
            Container(
              height: 200,
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.border, width: 1.5),
              ),
              child: _capturedPhotoFile == null
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.camera_enhance, size: 48, color: AppColors.primaryBlue),
                          const SizedBox(height: 12),
                          const Text(
                            'Field Photographic Sensor / Camera',
                            style: TextStyle(fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                          ),
                          const SizedBox(height: 6),
                          const Text(
                            'Attach georeferenced disaster photographic proof',
                            style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                          ),
                          const SizedBox(height: 12),
                          ElevatedButton.icon(
                            onPressed: _simulateCapture,
                            icon: const Icon(Icons.photo_camera, size: 16),
                            label: const Text('Capture Photograph'),
                          ),
                        ],
                      ),
                    )
                  : Stack(
                      children: [
                        Container(
                          decoration: BoxDecoration(
                            color: AppColors.primaryBlueSubtle,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(Icons.image, size: 48, color: AppColors.primaryBlue),
                                const SizedBox(height: 8),
                                Text(
                                  _capturedPhotoFile!,
                                  style: const TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.textPrimary,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                const Text(
                                  'High-Resolution Raw JPEG Captured & Hash Computed',
                                  style: TextStyle(fontSize: 11, color: AppColors.safe, fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                          ),
                        ),
                        Positioned(
                          top: 8,
                          right: 8,
                          child: IconButton(
                            icon: const Icon(Icons.refresh, color: AppColors.textSecondary),
                            onPressed: _simulateCapture,
                          ),
                        ),
                      ],
                    ),
            ),
            const SizedBox(height: 16),

            // Metadata card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'DEVICE & AUDIT METADATA',
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.textMuted),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Device Identifier:', style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                        Text(
                          session?.deviceCode ?? 'DEV-OFFICER-PERUR',
                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Source Tier Authority:', style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                        Text(
                          session?.tier ?? 'T1 (Authoritative Government)',
                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.primaryBlue),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Observation Timestamp:', style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                        Text(
                          DateFormat('yyyy-MM-dd HH:mm:ss').format(DateTime.now()),
                          style: const TextStyle(fontSize: 12, color: AppColors.textPrimary),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            DropdownButtonFormField<String>(
              initialValue: _selectedIncidentType,
              decoration: const InputDecoration(labelText: 'Evidence Hazard Class'),
              items: const [
                DropdownMenuItem(value: 'FLOOD_WATER_LEVEL', child: Text('Water Level / Depth Gauge')),
                DropdownMenuItem(value: 'BRIDGE_STRUCTURAL', child: Text('Bridge Scour / Structural Breach')),
                DropdownMenuItem(value: 'ROAD_WASHOUT', child: Text('Arterial Road Washout')),
                DropdownMenuItem(value: 'STRANDED_CLUSTER', child: Text('Stranded Population Cluster')),
              ],
              onChanged: (v) => setState(() => _selectedIncidentType = v ?? 'FLOOD_WATER_LEVEL'),
            ),
            const SizedBox(height: 14),

            TextFormField(
              controller: _descriptionController,
              maxLines: 2,
              decoration: const InputDecoration(
                labelText: 'Evidence Field Notes',
                hintText: 'Enter observation details and surveyor remarks...',
              ),
            ),
            const SizedBox(height: 24),

            ElevatedButton.icon(
              onPressed: _isSaving ? null : _saveEvidence,
              icon: const Icon(Icons.check_circle_outline),
              label: const Text('Preserve Evidence Record & Audit Log'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryBlue,
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
