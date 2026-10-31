import 'package:flutter/material.dart';
import '../../../core/constants/colors.dart';

class MapLayerControlsModal extends StatelessWidget {
  final Map<String, bool> layerVisibility;
  final Function(String) onToggleLayer;

  const MapLayerControlsModal({
    super.key,
    required this.layerVisibility,
    required this.onToggleLayer,
  });

  static void show(
    BuildContext context, {
    required Map<String, bool> layerVisibility,
    required Function(String) onToggleLayer,
  }) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (ctx) => MapLayerControlsModal(
        layerVisibility: layerVisibility,
        onToggleLayer: onToggleLayer,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final layers = [
      {'key': 'zones', 'label': 'Flood Risk Zones', 'icon': Icons.layers},
      {'key': 'river', 'label': 'Noyyal River Corridor', 'icon': Icons.water},
      {'key': 'roads', 'label': 'Arterial Road Network', 'icon': Icons.alt_route},
      {'key': 'bridges', 'label': 'Candidate Bridges & Cuts', 'icon': Icons.commute},
      {'key': 'incidents', 'label': 'Field Incident Telemetry', 'icon': Icons.warning_amber},
      {'key': 'depots', 'label': 'Logistics Base Depots', 'icon': Icons.warehouse},
      {'key': 'shelters', 'label': 'Evacuation Shelters', 'icon': Icons.night_shelter},
      {'key': 'hospitals', 'label': 'Critical Medical Facilities', 'icon': Icons.local_hospital},
      {'key': 'routes', 'label': 'Active Evacuation Routes', 'icon': Icons.navigation},
    ];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Tactical GIS Layers',
                style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16, color: AppColors.textPrimary),
              ),
              IconButton(
                icon: const Icon(Icons.close),
                onPressed: () => Navigator.of(context).pop(),
              ),
            ],
          ),
          const Divider(),
          Flexible(
            child: ListView(
              shrinkWrap: true,
              children: layers.map((layer) {
                final key = layer['key'] as String;
                final isEnabled = layerVisibility[key] ?? true;
                return SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  secondary: Icon(layer['icon'] as IconData, color: AppColors.primaryBlue),
                  title: Text(layer['label'] as String, style: const TextStyle(fontSize: 14)),
                  value: isEnabled,
                  activeThumbColor: AppColors.primaryBlue,
                  onChanged: (val) {
                    onToggleLayer(key);
                  },
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 8),
        ],
      ),
    );
  }
}
