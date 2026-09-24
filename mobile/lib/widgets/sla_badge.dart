import 'package:flutter/material.dart';

class SlaBadge extends StatelessWidget {
  final String status;
  final String remainingFormatted;
  final bool isAtRisk;

  const SlaBadge({
    Key? key,
    required this.status,
    required this.remainingFormatted,
    this.isAtRisk = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (status == 'COMPLETED') {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.check_circle, size: 12, color: Color(0xFF10B981)),
          const SizedBox(width: 4),
          Text(
            remainingFormatted,
            style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
          ),
        ],
      );
    }

    if (status == 'BREACHED') {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
        decoration: BoxDecoration(
          color: const Color(0xFFFEE2E2),
          borderRadius: BorderRadius.circular(4),
          border: Border.all(color: const Color(0xFFFCA5A5)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, size: 12, color: Color(0xFFDC2626)),
            const SizedBox(width: 4),
            Text(
              remainingFormatted,
              style: const TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.bold,
                color: Color(0xFFDC2626),
              ),
            ),
          ],
        ),
      );
    }

    if (status == 'AT_RISK' || isAtRisk) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
        decoration: BoxDecoration(
          color: const Color(0xFFFEF3C7),
          borderRadius: BorderRadius.circular(4),
          border: Border.all(color: const Color(0xFFFCD34D)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.warning_amber_rounded, size: 12, color: Color(0xFFD97706)),
            const SizedBox(width: 4),
            Text(
              remainingFormatted,
              style: const TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w600,
                color: Color(0xFFB45309),
              ),
            ),
          ],
        ),
      );
    }

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        const Icon(Icons.schedule, size: 12, color: Color(0xFF10B981)),
        const SizedBox(width: 4),
        Text(
          remainingFormatted,
          style: const TextStyle(
            fontSize: 11,
            color: Color(0xFF475569),
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}
