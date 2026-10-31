import 'package:drift/drift.dart' as drift;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:uuid/uuid.dart';
import '../../../core/constants/colors.dart';
import '../../../core/providers.dart';
import '../../../database/local_database.dart';

class CreateReportScreen extends ConsumerStatefulWidget {
  const CreateReportScreen({super.key});

  @override
  ConsumerState<CreateReportScreen> createState() => _CreateReportScreenState();
}

class _CreateReportScreenState extends ConsumerState<CreateReportScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _peopleAffectedController = TextEditingController(text: '10');
  final _casualtiesController = TextEditingController(text: '0');
  final _latController = TextEditingController(text: '10.9708');
  final _lonController = TextEditingController(text: '76.9152');

  String _selectedCategory = 'FLOOD_WATER_LEVEL';
  DateTime _observedAt = DateTime.now();
  String? _photoPath;
  bool _isSaving = false;

  final Map<String, List<double>> _quickLocations = {
    'Perur Noyyal Basin': [10.9708, 76.9152],
    'Selvapuram Lake Reach': [10.9880, 76.9400],
    'Ukkadam Periyakulam': [10.9915, 76.9610],
    'Singanallur Lake': [10.9980, 77.0220],
    'Ondipudur Lowland': [10.9940, 77.0550],
  };

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _peopleAffectedController.dispose();
    _casualtiesController.dispose();
    _latController.dispose();
    _lonController.dispose();
    super.dispose();
  }

  void _applyQuickLocation(String name) {
    final coords = _quickLocations[name];
    if (coords != null) {
      _latController.text = coords[0].toStringAsFixed(4);
      _lonController.text = coords[1].toStringAsFixed(4);
    }
  }

  Future<void> _handleSaveReport() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSaving = true);

    try {
      final db = ref.read(databaseProvider);
      final outbox = ref.read(outboxManagerProvider);
      final session = ref.read(sessionProvider);

      final reportId = const Uuid().v4();
      final reportCode = 'REP-${DateTime.now().millisecondsSinceEpoch % 100000}';
      final people = int.tryParse(_peopleAffectedController.text.trim()) ?? 0;
      final casualties = int.tryParse(_casualtiesController.text.trim()) ?? 0;
      final lat = double.tryParse(_latController.text.trim());
      final lon = double.tryParse(_lonController.text.trim());
      final now = DateTime.now().toUtc();

      // 1. Save locally in Drift database FIRST (guaranteed offline durability)
      await db.into(db.incidentReports).insert(
            IncidentReportsCompanion.insert(
              id: reportId,
              reportCode: reportCode,
              category: _selectedCategory,
              title: _titleController.text.trim(),
              description: _descriptionController.text.trim(),
              peopleAffected: drift.Value(people),
              casualties: drift.Value(casualties),
              latitude: drift.Value(lat),
              longitude: drift.Value(lon),
              photoPath: drift.Value(_photoPath),
              photoPendingUpload: drift.Value(_photoPath != null),
              syncStatus: const drift.Value('PENDING'),
              observedAt: _observedAt.toUtc(),
              createdAt: now,
            ),
          );

      // 2. Enqueue into durable offline outbox with binary frame encoding + HMAC
      final deviceNumericId = session?.numericId ?? 101;
      final deviceCode = session?.deviceCode ?? 'DEV-OFFICER-PERUR';
      final secretKey = session?.secretKey ?? 'poseidon-field-officer-key-32b!';
      final counter = session?.getNextCounter() ?? 1;

      await outbox.enqueueIncidentReport(
        reportId: reportId,
        reportCode: reportCode,
        category: _selectedCategory,
        title: _titleController.text.trim(),
        description: _descriptionController.text.trim(),
        latitude: lat,
        longitude: lon,
        peopleAffected: people,
        casualties: casualties,
        photoPath: _photoPath,
        observedAt: _observedAt.toUtc(),
        deviceNumericId: deviceNumericId,
        deviceCode: deviceCode,
        secretKey: secretKey,
        counter: counter,
      );

      // 3. Trigger immediate background sync attempt if online
      ref.read(syncEngineProvider).triggerFullSync();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Report saved locally in offline outbox. Queued for transmission.'),
            backgroundColor: AppColors.safe,
          ),
        );
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error saving report: $e'), backgroundColor: AppColors.critical),
        );
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('File Incident Report'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Offline-First Assurance Banner
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.primaryBlueSubtle,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.primaryBlue.withValues(alpha: 0.3)),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.offline_pin, color: AppColors.primaryBlue, size: 22),
                    SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Offline Guaranteed: All reports are written to encrypted local SQLite before transmission attempts.',
                        style: TextStyle(fontSize: 12, color: AppColors.textPrimary, height: 1.3),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Category Selector
              DropdownButtonFormField<String>(
                initialValue: _selectedCategory,
                decoration: const InputDecoration(labelText: 'Incident Category'),
                items: const [
                  DropdownMenuItem(value: 'FLOOD_WATER_LEVEL', child: Text('🌊 Flood Water Inundation')),
                  DropdownMenuItem(value: 'PEOPLE_TRAPPED', child: Text('🚨 Trapped Persons / SOS')),
                  DropdownMenuItem(value: 'ROAD_BLOCKED', child: Text('⛔ Road Impassable / Bridge Inundated')),
                  DropdownMenuItem(value: 'INFRASTRUCTURE_DAMAGE', child: Text('🏚️ Infrastructure Damage')),
                  DropdownMenuItem(value: 'MEDICAL_EMERGENCY', child: Text('🏥 Medical Urgency')),
                ],
                onChanged: (v) => setState(() => _selectedCategory = v ?? 'FLOOD_WATER_LEVEL'),
              ),
              const SizedBox(height: 14),

              // Title Field
              TextFormField(
                controller: _titleController,
                decoration: const InputDecoration(
                  labelText: 'Report Title',
                  hintText: 'e.g. Overtopping roadway by 1.2m at Perur reach',
                ),
                validator: (v) => v == null || v.isEmpty ? 'Title required' : null,
              ),
              const SizedBox(height: 14),

              // Description Field
              TextFormField(
                controller: _descriptionController,
                maxLines: 3,
                decoration: const InputDecoration(
                  labelText: 'Field Observation Description',
                  hintText: 'Describe physical situation, hazards, and observed access constraints...',
                ),
                validator: (v) => v == null || v.isEmpty ? 'Description required' : null,
              ),
              const SizedBox(height: 14),

              // People Affected & Casualties
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _peopleAffectedController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'Estimated Affected'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextFormField(
                      controller: _casualtiesController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'Casualties / Urgent'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Location Coordinates & Quick Presets
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _latController,
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      decoration: const InputDecoration(labelText: 'Latitude (N)'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextFormField(
                      controller: _lonController,
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      decoration: const InputDecoration(labelText: 'Longitude (E)'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),

              // Quick Location Presets
              Wrap(
                spacing: 6,
                runSpacing: 6,
                children: _quickLocations.keys.map((name) {
                  return ActionChip(
                    label: Text(name, style: const TextStyle(fontSize: 11)),
                    backgroundColor: AppColors.surfaceVariant,
                    onPressed: () => _applyQuickLocation(name),
                  );
                }).toList(),
              ),
              const SizedBox(height: 16),

              // Observation Time Picker
              ListTile(
                contentPadding: const EdgeInsets.symmetric(horizontal: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                  side: const BorderSide(color: AppColors.border),
                ),
                leading: const Icon(Icons.schedule, color: AppColors.primaryBlue),
                title: const Text('Observation Timestamp', style: TextStyle(fontSize: 13)),
                subtitle: Text(DateFormat('yyyy-MM-dd HH:mm').format(_observedAt)),
                trailing: TextButton(
                  child: const Text('Update'),
                  onPressed: () async {
                    final pickedDate = await showDatePicker(
                      context: context,
                      initialDate: _observedAt,
                      firstDate: DateTime(2026),
                      lastDate: DateTime(2030),
                    );
                    if (pickedDate == null) return;
                    if (!mounted || !context.mounted) return;

                    final pickedTime = await showTimePicker(
                      context: context,
                      initialTime: TimeOfDay.fromDateTime(_observedAt),
                    );
                    if (pickedTime == null) return;
                    if (!mounted || !context.mounted) return;

                    setState(() {
                      _observedAt = DateTime(
                        pickedDate.year,
                        pickedDate.month,
                        pickedDate.day,
                        pickedTime.hour,
                        pickedTime.minute,
                      );
                    });
                  },
                ),
              ),
              const SizedBox(height: 16),

              // Photo Attachment Simulator
              ListTile(
                contentPadding: const EdgeInsets.symmetric(horizontal: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                  side: const BorderSide(color: AppColors.border),
                ),
                leading: const Icon(Icons.camera_alt, color: AppColors.primaryBlue),
                title: const Text('Evidence Photograph', style: TextStyle(fontSize: 13)),
                subtitle: Text(_photoPath ?? 'No photograph attached (Tap to simulate capture)'),
                trailing: IconButton(
                  icon: const Icon(Icons.add_a_photo, color: AppColors.primaryBlue),
                  onPressed: () {
                    setState(() {
                      _photoPath = 'evidence_photos/ev_${DateTime.now().millisecondsSinceEpoch}.jpg';
                    });
                  },
                ),
              ),
              const SizedBox(height: 24),

              // Save Offline Action
              ElevatedButton.icon(
                onPressed: _isSaving ? null : _handleSaveReport,
                icon: _isSaving
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : const Icon(Icons.save),
                label: const Text('Save Locally & Queue for Synchronization'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryBlue,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
