import 'package:flutter/material.dart';
import '../models/user.dart';
import '../models/ticket.dart';
import '../services/api_service.dart';
import '../widgets/status_chip.dart';
import '../widgets/priority_chip.dart';
import '../widgets/sla_badge.dart';
import 'ticket_detail_screen.dart';

class StudentDashboardScreen extends StatefulWidget {
  final UserModel user;
  final Function(int) onNavigateTab;

  const StudentDashboardScreen({
    Key? key,
    required this.user,
    required this.onNavigateTab,
  }) : super(key: key);

  @override
  State<StudentDashboardScreen> createState() => _StudentDashboardScreenState();
}

class _StudentDashboardScreenState extends State<StudentDashboardScreen> {
  Map<String, dynamic>? _stats;
  List<TicketModel> _tickets = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadDashboardData();
  }

  Future<void> _loadDashboardData() async {
    setState(() => _loading = true);
    try {
      final statsData = await ApiService.getDashboardStats();
      final ticketsData = await ApiService.getMyTickets();
      if (mounted) {
        setState(() {
          _stats = statsData;
          _tickets = ticketsData;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: const Color(0xFF2563EB),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.school, color: Colors.white, size: 18),
            ),
            const SizedBox(width: 8),
            const Text(
              'EduHelp',
              style: TextStyle(
                color: Color(0xFF0F172A),
                fontWeight: FontWeight.bold,
                fontSize: 18,
              ),
            ),
          ],
        ),
      ),
      body: RefreshIndicator(
        onRefresh: _loadDashboardData,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Greeting
              Text(
                'Good day, ${widget.user.name.split(' ')[0]}',
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF0F172A),
                ),
              ),
              const SizedBox(height: 2),
              const Text(
                'Track your institutional support requests below.',
                style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
              ),
              const SizedBox(height: 16),

              // KPI Stats Grid
              if (_loading)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.all(24.0),
                    child: CircularProgressIndicator(),
                  ),
                )
              else
                Row(
                  children: [
                    _buildStatCard(
                      label: 'Open',
                      count: _stats?['openRequests'] ?? 0,
                      color: const Color(0xFF2563EB),
                      icon: Icons.schedule,
                    ),
                    const SizedBox(width: 8),
                    _buildStatCard(
                      label: 'Awaiting',
                      count: _stats?['awaitingResponse'] ?? 0,
                      color: const Color(0xFFD97706),
                      icon: Icons.help_outline,
                    ),
                    const SizedBox(width: 8),
                    _buildStatCard(
                      label: 'Resolved',
                      count: _stats?['resolved'] ?? 0,
                      color: const Color(0xFF059669),
                      icon: Icons.check_circle_outline,
                    ),
                  ],
                ),

              const SizedBox(height: 16),

              // Quick Action Card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF1E3A8A), Color(0xFF2563EB)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(14),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF2563EB).withOpacity(0.2),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: const [
                          Text(
                            'Need Help?',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 15,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          SizedBox(height: 3),
                          Text(
                            'Raise a request for fees, attendance, ID cards, certificates & more.',
                            style: TextStyle(color: Color(0xFFE2E8F0), fontSize: 11),
                          ),
                        ],
                      ),
                    ),
                    ElevatedButton(
                      onPressed: () => widget.onNavigateTab(2), // Switch to Create Tab
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: const Color(0xFF1E3A8A),
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      ),
                      child: const Text('Create', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Recent Requests Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Recent Requests',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF0F172A),
                    ),
                  ),
                  TextButton(
                    onPressed: () => widget.onNavigateTab(1), // Switch to Requests Tab
                    child: const Text('View All', style: TextStyle(fontSize: 12, color: Color(0xFF2563EB))),
                  ),
                ],
              ),

              // Tickets List
              if (_tickets.isEmpty && !_loading)
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Center(
                    child: Column(
                      children: const [
                        Icon(Icons.inbox, size: 36, color: Color(0xFF94A3B8)),
                        SizedBox(height: 8),
                        Text(
                          'No requests yet',
                          style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF334155)),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'Tap Create above to submit an inquiry.',
                          style: TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                        ),
                      ],
                    ),
                  ),
                )
              else
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _tickets.take(5).length,
                  itemBuilder: (context, index) {
                    final t = _tickets[index];
                    return Card(
                      elevation: 0,
                      margin: const EdgeInsets.only(bottom: 10),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                        side: const BorderSide(color: Color(0xFFE2E8F0)),
                      ),
                      child: InkWell(
                        borderRadius: BorderRadius.circular(12),
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => TicketDetailScreen(ticketId: t.id),
                            ),
                          ).then((_) => _loadDashboardData());
                        },
                        child: Padding(
                          padding: const EdgeInsets.all(12),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    t.ticketNumber,
                                    style: const TextStyle(
                                      fontFamily: 'monospace',
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFF2563EB),
                                    ),
                                  ),
                                  StatusChip(status: t.status, isSmall: true),
                                ],
                              ),
                              const SizedBox(height: 6),
                              Text(
                                t.subject,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: Color(0xFF0F172A),
                                ),
                              ),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  PriorityChip(priority: t.priority, isSmall: true),
                                  const Spacer(),
                                  SlaBadge(
                                    status: t.slaStatus,
                                    remainingFormatted: t.slaRemainingFormatted,
                                    isAtRisk: t.slaIsAtRisk,
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatCard({
    required String label,
    required int count,
    required Color color,
    required IconData icon,
  }) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFE2E8F0)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  label,
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF64748B),
                    letterSpacing: 0.3,
                  ),
                ),
                Icon(icon, size: 14, color: color),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              '$count',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
