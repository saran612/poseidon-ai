import 'package:flutter/material.dart';
import '../../../core/constants/colors.dart';

class MapLegendWidget extends StatelessWidget {
  const MapLegendWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.94),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.border),
        boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 4)],
      ),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.circle, size: 8, color: AppColors.critical),
              SizedBox(width: 4),
              Text('Critical Zone', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600)),
              SizedBox(width: 8),
              Icon(Icons.circle, size: 8, color: AppColors.high),
              SizedBox(width: 4),
              Text('High Risk', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600)),
            ],
          ),
          SizedBox(height: 4),
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.water, size: 10, color: Color(0xFF0284C7)),
              SizedBox(width: 4),
              Text('Noyyal Corridor', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600)),
              SizedBox(width: 8),
              Icon(Icons.circle, size: 8, color: AppColors.safe),
              SizedBox(width: 4),
              Text('Open Bridge', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600)),
              SizedBox(width: 8),
              Icon(Icons.block, size: 10, color: AppColors.critical),
              SizedBox(width: 4),
              Text('Cut', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600)),
            ],
          ),
          SizedBox(height: 4),
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.warehouse, size: 10, color: AppColors.primaryBlue),
              SizedBox(width: 4),
              Text('Depot', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600)),
              SizedBox(width: 8),
              Icon(Icons.night_shelter, size: 10, color: AppColors.safe),
              SizedBox(width: 4),
              Text('Shelter', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600)),
              SizedBox(width: 8),
              Icon(Icons.local_hospital, size: 10, color: AppColors.critical),
              SizedBox(width: 4),
              Text('Hospital', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600)),
            ],
          ),
        ],
      ),
    );
  }
}

