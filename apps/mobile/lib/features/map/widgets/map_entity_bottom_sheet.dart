import 'package:flutter/material.dart';
import '../../../core/constants/colors.dart';
import '../models/map_models.dart';

class MapEntityBottomSheet extends StatelessWidget {
  final MapFeatureEntity entity;
  final VoidCallback onClose;
  final Function(String originId, String destId)? onPlanRoute;

  const MapEntityBottomSheet({
    super.key,
    required this.entity,
    required this.onClose,
    this.onPlanRoute,
  });

  @override
  Widget build(BuildContext context) {
    Color badgeColor = AppColors.primaryBlue;
    Color badgeBg = AppColors.primaryBlueSubtle;

    if (entity.status == 'CLOSED' || entity.status == 'CRITICAL') {
      badgeColor = AppColors.critical;
      badgeBg = AppColors.criticalSubtle;
    } else if (entity.status == 'ACTIVE' || entity.status == 'OPEN') {
      badgeColor = AppColors.safe;
      badgeBg = AppColors.safeSubtle;
    }

    return Card(
      elevation: 6,
      margin: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                  decoration: BoxDecoration(
                    color: badgeBg,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    entity.type,
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      color: badgeColor,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    entity.title,
                    style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close, size: 18),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                  onPressed: onClose,
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              entity.details,
              style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
            ),
            if (entity.position != null) ...[
              const SizedBox(height: 4),
              Text(
                'Coordinates: ${entity.position!.latitude.toStringAsFixed(4)}, ${entity.position!.longitude.toStringAsFixed(4)}',
                style: const TextStyle(fontSize: 10, color: AppColors.textMuted, fontFamily: 'monospace'),
              ),
            ],
            if (entity.type == 'SHELTER' || entity.type == 'ZONE') ...[
              const SizedBox(height: 10),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  icon: const Icon(Icons.directions, size: 16),
                  label: const Text('Calculate Accessible Route from Base Depot', style: TextStyle(fontSize: 12)),
                  onPressed: () {
                    onPlanRoute?.call('DEPOT_RS_PURAM', entity.id);
                  },
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

