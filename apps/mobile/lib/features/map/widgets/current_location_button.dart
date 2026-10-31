import 'package:flutter/material.dart';
import '../../../core/constants/colors.dart';

class CurrentLocationButton extends StatelessWidget {
  final VoidCallback onCenterLocation;

  const CurrentLocationButton({
    super.key,
    required this.onCenterLocation,
  });

  @override
  Widget build(BuildContext context) {
    return FloatingActionButton.small(
      heroTag: 'map_current_loc_btn',
      backgroundColor: Colors.white,
      foregroundColor: AppColors.primaryBlue,
      elevation: 3,
      onPressed: onCenterLocation,
      tooltip: 'Center on Corridor',
      child: const Icon(Icons.my_location),
    );
  }
}

