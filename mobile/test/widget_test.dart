// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:eduhelp_mobile/widgets/status_chip.dart';
import 'package:eduhelp_mobile/widgets/priority_chip.dart';
import 'package:eduhelp_mobile/widgets/sla_badge.dart';

void main() {
  testWidgets('StatusChip renders correct badge label and styling', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: StatusChip(status: 'IN_PROGRESS'),
        ),
      ),
    );

    expect(find.text('In Progress'), findsOneWidget);
  });

  testWidgets('PriorityChip renders correct priority badge', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: PriorityChip(priority: 'URGENT'),
        ),
      ),
    );

    expect(find.text('URGENT'), findsOneWidget);
  });

  testWidgets('SlaBadge renders BREACHED state correctly', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: SlaBadge(
            status: 'BREACHED',
            remainingFormatted: 'Breached by 2h 15m',
          ),
        ),
      ),
    );

    expect(find.text('Breached by 2h 15m'), findsOneWidget);
    expect(find.byIcon(Icons.error_outline), findsOneWidget);
  });

  testWidgets('SlaBadge renders AT_RISK state correctly', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: SlaBadge(
            status: 'AT_RISK',
            remainingFormatted: '3h 10m remaining',
            isAtRisk: true,
          ),
        ),
      ),
    );

    expect(find.text('3h 10m remaining'), findsOneWidget);
    expect(find.byIcon(Icons.warning_amber_rounded), findsOneWidget);
  });
}

