import 'package:flutter/material.dart';

class PriorityChip extends StatelessWidget {
  final String priority;
  final bool isSmall;

  const PriorityChip({Key? key, required this.priority, this.isSmall = false}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    Color color;
    IconData icon;

    switch (priority) {
      case 'URGENT':
        color = const Color(0xFFEF4444);
        icon = Icons.local_fire_department;
        break;
      case 'HIGH':
        color = const Color(0xFFF59E0B);
        icon = Icons.arrow_upward;
        break;
      case 'MEDIUM':
        color = const Color(0xFF3B82F6);
        icon = Icons.remove;
        break;
      case 'LOW':
      default:
        color = const Color(0xFF64748B);
        icon = Icons.arrow_downward;
        break;
    }

    return Container(
      padding: EdgeInsets.symmetric(horizontal: isSmall ? 6 : 8, vertical: isSmall ? 2 : 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.08),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: isSmall ? 10 : 12, color: color),
          const SizedBox(width: 3),
          Text(
            priority,
            style: TextStyle(
              fontSize: isSmall ? 9 : 10,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}
