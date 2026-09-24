import 'package:flutter/material.dart';

class StatusChip extends StatelessWidget {
  final String status;
  final bool isSmall;

  const StatusChip({Key? key, required this.status, this.isSmall = false}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color text;
    String label;
    IconData icon;

    switch (status) {
      case 'NEW':
        bg = const Color(0xFFEFF6FF);
        text = const Color(0xFF1D4ED8);
        label = 'New';
        icon = Icons.auto_awesome;
        break;
      case 'ASSIGNED':
        bg = const Color(0xFFF3E8FF);
        text = const Color(0xFF7E22CE);
        label = 'Assigned';
        icon = Icons.person_outline;
        break;
      case 'IN_PROGRESS':
        bg = const Color(0xFFFEF3C7);
        text = const Color(0xFFB45309);
        label = 'In Progress';
        icon = Icons.schedule;
        break;
      case 'WAITING_FOR_STUDENT':
        bg = const Color(0xFFE0F2FE);
        text = const Color(0xFF0369A1);
        label = 'Waiting Input';
        icon = Icons.help_outline;
        break;
      case 'RESOLVED':
        bg = const Color(0xFFD1FAE5);
        text = const Color(0xFF047857);
        label = 'Resolved';
        icon = Icons.check_circle_outline;
        break;
      case 'CLOSED':
        bg = const Color(0xFFF1F5F9);
        text = const Color(0xFF475569);
        label = 'Closed';
        icon = Icons.archive_outlined;
        break;
      case 'REOPENED':
        bg = const Color(0xFFFFE4E6);
        text = const Color(0xFFBE123C);
        label = 'Reopened';
        icon = Icons.replay;
        break;
      case 'ESCALATED':
        bg = const Color(0xFFFEE2E2);
        text = const Color(0xFFB91C1C);
        label = 'Escalated';
        icon = Icons.warning_amber_rounded;
        break;
      default:
        bg = const Color(0xFFF1F5F9);
        text = const Color(0xFF475569);
        label = status;
        icon = Icons.info_outline;
    }

    return Container(
      padding: EdgeInsets.symmetric(horizontal: isSmall ? 6 : 8, vertical: isSmall ? 2 : 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: text.withOpacity(0.2)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: isSmall ? 11 : 13, color: text),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: isSmall ? 10 : 11,
              fontWeight: FontWeight.w600,
              color: text,
            ),
          ),
        ],
      ),
    );
  }
}
