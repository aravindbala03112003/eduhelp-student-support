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
}
