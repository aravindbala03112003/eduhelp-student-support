import 'package:flutter/material.dart';
import '../models/ticket.dart';
import '../services/api_service.dart';
import '../widgets/status_chip.dart';
import '../widgets/priority_chip.dart';
import '../widgets/sla_badge.dart';

class TicketDetailScreen extends StatefulWidget {
  final String ticketId;

  const TicketDetailScreen({Key? key, required this.ticketId}) : super(key: key);

  @override
  State<TicketDetailScreen> createState() => _TicketDetailScreenState();
}

class _TicketDetailScreenState extends State<TicketDetailScreen> {
  TicketModel? _ticket;
  bool _loading = true;
  String? _error;

  final _commentController = TextEditingController();
  bool _submittingComment = false;

  @override
  void initState() {
    super.initState();
    _loadTicket();
  }

  Future<void> _loadTicket() async {
    setState(() => _loading = true);
    try {
      final t = await ApiService.getTicketDetails(widget.ticketId);
      if (mounted) {
        setState(() {
          _ticket = t;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString().replaceAll('Exception: ', '');
          _loading = false;
        });
      }
    }
  }

  Future<void> _handlePostComment() async {
    final text = _commentController.text.trim();
    if (text.isEmpty) return;

    setState(() => _submittingComment = true);
    try {
      await ApiService.addComment(widget.ticketId, text);
      _commentController.clear();
      await _loadTicket();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString().replaceAll('Exception: ', ''))),
      );
    } finally {
      if (mounted) setState(() => _submittingComment = false);
    }
  }

  void _showReopenDialog() {
    final reasonController = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Reopen Request', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Please explain why the issue persists or what further assistance is needed:',
              style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: reasonController,
              maxLines: 3,
              style: const TextStyle(fontSize: 13),
              decoration: const InputDecoration(
                hintText: 'Enter reason...',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              final reason = reasonController.text.trim();
              if (reason.isEmpty) return;
              Navigator.pop(ctx);
              try {
                await ApiService.reopenTicket(widget.ticketId, reason);
                _loadTicket();
              } catch (e) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text(e.toString().replaceAll('Exception: ', ''))),
                );
              }
            },
            child: const Text('Reopen'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(
        backgroundColor: Color(0xFFF8FAFC),
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (_error != null || _ticket == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Error')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Text(_error ?? 'Failed to load ticket'),
          ),
        ),
      );
    }

    final t = _ticket!;
    final canReopen = t.status == 'RESOLVED';
    final isTerminal = ['RESOLVED', 'CLOSED'].contains(t.status);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text(
          t.ticketNumber,
          style: const TextStyle(
            fontFamily: 'monospace',
            fontWeight: FontWeight.bold,
            fontSize: 15,
            color: Color(0xFF0F172A),
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0.5,
        actions: [
          if (canReopen)
            TextButton.icon(
              onPressed: _showReopenDialog,
              icon: const Icon(Icons.replay, size: 16, color: Color(0xFFE11D48)),
              label: const Text('Reopen', style: TextStyle(color: Color(0xFFE11D48), fontSize: 12, fontWeight: FontWeight.bold)),
            ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: RefreshIndicator(
              onRefresh: _loadTicket,
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Subject Card
                    Container(
                      padding: const EdgeInsets.all(14),
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
                              StatusChip(status: t.status),
                              PriorityChip(priority: t.priority),
                            ],
                          ),
                          const SizedBox(height: 10),
                          Text(
                            t.subject,
                            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                          ),
                          const SizedBox(height: 6),
                          Row(
                            children: [
                              const Icon(Icons.folder_outlined, size: 12, color: Color(0xFF64748B)),
                              const SizedBox(width: 4),
                              Text(t.categoryName ?? 'Category', style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
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

                    const SizedBox(height: 12),

                    // Description
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'DESCRIPTION',
                            style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8), letterSpacing: 0.5),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            t.description,
                            style: const TextStyle(fontSize: 13, color: Color(0xFF334155), height: 1.4),
                          ),
                          if (t.resolutionNotes != null) ...[
                            const SizedBox(height: 12),
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: const Color(0xFFECFDF5),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: const Color(0xFFA7F3D0)),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('Official Resolution Remarks:', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF065F46))),
                                  const SizedBox(height: 2),
                                  Text(t.resolutionNotes!, style: const TextStyle(fontSize: 12, color: Color(0xFF047857))),
                                ],
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),

                    const SizedBox(height: 16),

                    // Conversation Thread Section
                    const Text(
                      'Conversation',
                      style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                    ),
                    const SizedBox(height: 8),

                    if (t.comments.isEmpty)
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: const Center(
                          child: Text('No comments yet.', style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                        ),
                      )
                    else
                      ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: t.comments.length,
                        itemBuilder: (context, index) {
                          final c = t.comments[index];
                          final isOwn = c.authorRole == 'STUDENT';
                          return Container(
                            margin: const EdgeInsets.only(bottom: 8),
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: isOwn ? const Color(0xFFEFF6FF) : Colors.white,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(
                                color: isOwn ? const Color(0xFFBFDBFE) : const Color(0xFFE2E8F0),
                              ),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      c.authorName,
                                      style: TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold,
                                        color: isOwn ? const Color(0xFF1D4ED8) : const Color(0xFF334155),
                                      ),
                                    ),
                                    Text(
                                      c.authorRole,
                                      style: const TextStyle(fontSize: 9, color: Color(0xFF94A3B8)),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  c.comment,
                                  style: const TextStyle(fontSize: 12, color: Color(0xFF0F172A), height: 1.3),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                  ],
                ),
              ),
            ),
          ),

          // Bottom Reply Input
          if (!isTerminal || canReopen)
            Container(
              padding: const EdgeInsets.all(12),
              decoration: const BoxDecoration(
                color: Colors.white,
                border: Border(top: BorderSide(color: Color(0xFFE2E8F0))),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _commentController,
                      style: const TextStyle(fontSize: 13),
                      decoration: InputDecoration(
                        hintText: t.status == 'WAITING_FOR_STUDENT'
                            ? 'Reply here (will set to IN PROGRESS)...'
                            : 'Type reply to support staff...',
                        hintStyle: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                        filled: true,
                        fillColor: const Color(0xFFF1F5F9),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(20),
                          borderSide: BorderSide.none,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    onPressed: _submittingComment ? null : _handlePostComment,
                    icon: _submittingComment
                        ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                        : const Icon(Icons.send_rounded, color: Color(0xFF2563EB)),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
