import 'package:flutter/material.dart';
import '../models/category.dart';
import '../services/api_service.dart';

class CreateTicketScreen extends StatefulWidget {
  final VoidCallback onCreated;

  const CreateTicketScreen({Key? key, required this.onCreated}) : super(key: key);

  @override
  State<CreateTicketScreen> createState() => _CreateTicketScreenState();
}

class _CreateTicketScreenState extends State<CreateTicketScreen> {
  List<CategoryModel> _categories = [];
  bool _loadingCats = true;

  int? _selectedCategoryId;
  String _selectedPriority = 'MEDIUM';
  final _subjectController = TextEditingController();
  final _descController = TextEditingController();

  bool _submitting = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchCategories();
  }

  Future<void> _fetchCategories() async {
    try {
      final cats = await ApiService.getCategories();
      if (mounted) {
        setState(() {
          _categories = cats;
          if (cats.isNotEmpty) _selectedCategoryId = cats[0].id;
          _loadingCats = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _loadingCats = false);
    }
  }

  Future<void> _handleSubmit() async {
    final subject = _subjectController.text.trim();
    final desc = _descController.text.trim();

    if (_selectedCategoryId == null) {
      setState(() => _error = 'Please select a category.');
      return;
    }
    if (subject.length < 5) {
      setState(() => _error = 'Subject must be at least 5 characters.');
      return;
    }
    if (desc.length < 10) {
      setState(() => _error = 'Description must be at least 10 characters.');
      return;
    }

    setState(() {
      _submitting = true;
      _error = null;
    });

    try {
      await ApiService.createTicket(
        categoryId: _selectedCategoryId!,
        subject: subject,
        description: desc,
        priority: _selectedPriority,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Your support request has been submitted!'),
            backgroundColor: Color(0xFF059669),
          ),
        );
        _subjectController.clear();
        _descController.clear();
        widget.onCreated();
      }
    } catch (e) {
      setState(() => _error = e.toString().replaceAll('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  int _getSlaHours(String p) {
    switch (p) {
      case 'URGENT':
        return 8;
      case 'HIGH':
        return 24;
      case 'MEDIUM':
        return 48;
      case 'LOW':
      default:
        return 72;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text(
          'New Support Request',
          style: TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold, fontSize: 18),
        ),
        backgroundColor: Colors.white,
        elevation: 0.5,
      ),
      body: _loadingCats
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  if (_error != null) ...[
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFEF2F2),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: const Color(0xFFFCA5A5)),
                      ),
                      child: Text(
                        _error!,
                        style: const TextStyle(fontSize: 12, color: Color(0xFFDC2626)),
                      ),
                    ),
                    const SizedBox(height: 14),
                  ],

                  // Category Selector
                  const Text('Category', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF334155))),
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFFCBD5E1)),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<int>(
                        value: _selectedCategoryId,
                        isExpanded: true,
                        items: _categories.map((c) {
                          return DropdownMenuItem<int>(
                            value: c.id,
                            child: Text(c.name, style: const TextStyle(fontSize: 13, color: Color(0xFF0F172A))),
                          );
                        }).toList(),
                        onChanged: (val) => setState(() => _selectedCategoryId = val),
                      ),
                    ),
                  ),

                  const SizedBox(height: 14),

                  // Priority Selector
                  const Text('Priority Level', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF334155))),
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFFCBD5E1)),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: _selectedPriority,
                        isExpanded: true,
                        items: const [
                          DropdownMenuItem(value: 'LOW', child: Text('Low (72 Hours SLA)', style: TextStyle(fontSize: 13))),
                          DropdownMenuItem(value: 'MEDIUM', child: Text('Medium (48 Hours SLA)', style: TextStyle(fontSize: 13))),
                          DropdownMenuItem(value: 'HIGH', child: Text('High (24 Hours SLA)', style: TextStyle(fontSize: 13))),
                          DropdownMenuItem(value: 'URGENT', child: Text('Urgent (8 Hours SLA)', style: TextStyle(fontSize: 13))),
                        ],
                        onChanged: (val) => setState(() => _selectedPriority = val ?? 'MEDIUM'),
                      ),
                    ),
                  ),

                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(Icons.schedule, size: 13, color: Color(0xFF2563EB)),
                      const SizedBox(width: 4),
                      Text(
                        'Target SLA window: ${_getSlaHours(_selectedPriority)} hours',
                        style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                      ),
                    ],
                  ),

                  const SizedBox(height: 14),

                  // Subject Input
                  const Text('Subject / Title', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF334155))),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _subjectController,
                    style: const TextStyle(fontSize: 13),
                    decoration: InputDecoration(
                      hintText: 'Brief summary of your inquiry...',
                      hintStyle: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                      filled: true,
                      fillColor: Colors.white,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                      ),
                    ),
                  ),

                  const SizedBox(height: 14),

                  // Description Input
                  const Text('Detailed Description', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF334155))),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _descController,
                    maxLines: 5,
                    style: const TextStyle(fontSize: 13),
                    decoration: InputDecoration(
                      hintText: 'Include relevant details such as receipt numbers, student roll number, or dates...',
                      hintStyle: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                      filled: true,
                      fillColor: Colors.white,
                      contentPadding: const EdgeInsets.all(14),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                      ),
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Submit Button
                  ElevatedButton(
                    onPressed: _submitting ? null : _handleSubmit,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF2563EB),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    child: _submitting
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                          )
                        : const Text(
                            'Submit Request',
                            style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                          ),
                  ),
                ],
              ),
            ),
    );
  }
}
