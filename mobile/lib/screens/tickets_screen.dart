import 'package:flutter/material.dart';
import '../models/ticket.dart';
import '../services/api_service.dart';
import '../widgets/status_chip.dart';
import '../widgets/priority_chip.dart';
import '../widgets/sla_badge.dart';
import 'ticket_detail_screen.dart';

class TicketsScreen extends StatefulWidget {
  const TicketsScreen({Key? key}) : super(key: key);

  @override
  State<TicketsScreen> createState() => _TicketsScreenState();
}

class _TicketsScreenState extends State<TicketsScreen> {
  List<TicketModel> _tickets = [];
  bool _loading = true;
  String _filter = 'ALL';
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchTickets();
  }

  Future<void> _fetchTickets() async {
    setState(() => _loading = true);
    try {
      final data = await ApiService.getMyTickets(
        search: _searchController.text.trim(),
        status: _filter == 'ALL' ? null : _filter,
      );
      if (mounted) {
        setState(() {
          _tickets = data;
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
        title: const Text(
          'My Requests',
          style: TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold, fontSize: 18),
        ),
        backgroundColor: Colors.white,
        elevation: 0.5,
      ),
      body: Column(
        children: [
          // Search & Filter Header
          Container(
            color: Colors.white,
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
            child: Column(
              children: [
                TextField(
                  controller: _searchController,
                  onSubmitted: (_) => _fetchTickets(),
                  style: const TextStyle(fontSize: 13),
                  decoration: InputDecoration(
                    hintText: 'Search tickets by keyword...',
                    hintStyle: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                    prefixIcon: const Icon(Icons.search, size: 18, color: Color(0xFF64748B)),
                    suffixIcon: _searchController.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear, size: 16),
                            onPressed: () {
                              _searchController.clear();
                              _fetchTickets();
                            },
                          )
                        : null,
                    filled: true,
                    fillColor: const Color(0xFFF1F5F9),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: BorderSide.none,
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildFilterChip('ALL', 'All'),
                      const SizedBox(width: 6),
                      _buildFilterChip('IN_PROGRESS', 'In Progress'),
                      const SizedBox(width: 6),
                      _buildFilterChip('WAITING_FOR_STUDENT', 'Waiting Input'),
                      const SizedBox(width: 6),
                      _buildFilterChip('RESOLVED', 'Resolved'),
                      const SizedBox(width: 6),
                      _buildFilterChip('CLOSED', 'Closed'),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Tickets List View
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : RefreshIndicator(
                    onRefresh: _fetchTickets,
                    child: _tickets.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: const [
                                Icon(Icons.inbox, size: 40, color: Color(0xFF94A3B8)),
                                SizedBox(height: 8),
                                Text(
                                  'No matching tickets',
                                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF334155)),
                                ),
                                SizedBox(height: 2),
                                Text(
                                  'Try adjusting your search or filters.',
                                  style: TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                                ),
                              ],
                            ),
                          )
                        : ListView.builder(
                            padding: const EdgeInsets.all(16),
                            itemCount: _tickets.length,
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
                                    ).then((_) => _fetchTickets());
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
                                          maxLines: 2,
                                          overflow: TextOverflow.ellipsis,
                                          style: const TextStyle(
                                            fontSize: 13,
                                            fontWeight: FontWeight.w600,
                                            color: Color(0xFF0F172A),
                                          ),
                                        ),
                                        if (t.categoryName != null) ...[
                                          const SizedBox(height: 2),
                                          Text(
                                            t.categoryName!,
                                            style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                                          ),
                                        ],
                                        const SizedBox(height: 10),
                                        Row(
                                          children: [
                                            PriorityChip(priority: t.priority, isSmall: true),
                                            const SizedBox(width: 8),
                                            Text(
                                              t.ageFormatted,
                                              style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8)),
                                            ),
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
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String value, String label) {
    final isSelected = _filter == value;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (_) {
        setState(() => _filter = value);
        _fetchTickets();
      },
      selectedColor: const Color(0xFF2563EB).withOpacity(0.12),
      labelStyle: TextStyle(
        fontSize: 11,
        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
        color: isSelected ? const Color(0xFF2563EB) : const Color(0xFF475569),
      ),
      backgroundColor: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: isSelected ? const Color(0xFF2563EB) : const Color(0xFFCBD5E1)),
      ),
      visualDensity: VisualDensity.compact,
    );
  }
}
