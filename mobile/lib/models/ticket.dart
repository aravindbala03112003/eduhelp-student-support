class CommentModel {
  final String id;
  final String userId;
  final String comment;
  final bool isInternal;
  final String createdAt;
  final String authorName;
  final String authorRole;

  CommentModel({
    required this.id,
    required this.userId,
    required this.comment,
    required this.isInternal,
    required this.createdAt,
    required this.authorName,
    required this.authorRole,
  });

  factory CommentModel.fromJson(Map<String, dynamic> json) {
    return CommentModel(
      id: json['id'] ?? '',
      userId: json['user_id'] ?? '',
      comment: json['comment'] ?? '',
      isInternal: json['is_internal'] ?? false,
      createdAt: json['created_at'] ?? '',
      authorName: json['author_name'] ?? 'User',
      authorRole: json['author_role'] ?? 'STUDENT',
    );
  }
}

class HistoryModel {
  final String id;
  final String action;
  final String? oldValue;
  final String? newValue;
  final String createdAt;
  final String actorName;
  final String actorRole;

  HistoryModel({
    required this.id,
    required this.action,
    this.oldValue,
    this.newValue,
    required this.createdAt,
    required this.actorName,
    required this.actorRole,
  });

  factory HistoryModel.fromJson(Map<String, dynamic> json) {
    return HistoryModel(
      id: json['id'] ?? '',
      action: json['action'] ?? '',
      oldValue: json['old_value'],
      newValue: json['new_value'],
      createdAt: json['created_at'] ?? '',
      actorName: json['actor_name'] ?? 'System',
      actorRole: json['actor_role'] ?? '',
    );
  }
}

class TicketModel {
  final String id;
  final String ticketNumber;
  final String studentId;
  final int categoryId;
  final String subject;
  final String description;
  final String priority;
  final String status;
  final String? assignedTo;
  final String? assignedToName;
  final String? categoryName;
  final String slaDueAt;
  final bool slaBreached;
  final String slaStatus;
  final String slaRemainingFormatted;
  final int slaPercentRemaining;
  final bool slaIsAtRisk;
  final String ageFormatted;
  final String createdAt;
  final String? resolutionNotes;
  final List<CommentModel> comments;
  final List<HistoryModel> history;

  TicketModel({
    required this.id,
    required this.ticketNumber,
    required this.studentId,
    required this.categoryId,
    required this.subject,
    required this.description,
    required this.priority,
    required this.status,
    this.assignedTo,
    this.assignedToName,
    this.categoryName,
    required this.slaDueAt,
    required this.slaBreached,
    required this.slaStatus,
    required this.slaRemainingFormatted,
    required this.slaPercentRemaining,
    required this.slaIsAtRisk,
    required this.ageFormatted,
    required this.createdAt,
    this.resolutionNotes,
    this.comments = const [],
    this.history = const [],
  });

  factory TicketModel.fromJson(Map<String, dynamic> json) {
    final commentsList = (json['comments'] as List<dynamic>?)
            ?.map((c) => CommentModel.fromJson(c as Map<String, dynamic>))
            .toList() ??
        [];

    final historyList = (json['history'] as List<dynamic>?)
            ?.map((h) => HistoryModel.fromJson(h as Map<String, dynamic>))
            .toList() ??
        [];

    return TicketModel(
      id: json['id'] ?? '',
      ticketNumber: json['ticket_number'] ?? '',
      studentId: json['student_id'] ?? '',
      categoryId: json['category_id'] is int ? json['category_id'] : int.parse(json['category_id'].toString()),
      subject: json['subject'] ?? '',
      description: json['description'] ?? '',
      priority: json['priority'] ?? 'MEDIUM',
      status: json['status'] ?? 'NEW',
      assignedTo: json['assigned_to'],
      assignedToName: json['assigned_to_name'],
      categoryName: json['category_name'],
      slaDueAt: json['sla_due_at'] ?? '',
      slaBreached: json['sla_breached'] ?? false,
      slaStatus: json['slaStatus'] ?? 'ON_TRACK',
      slaRemainingFormatted: json['slaRemainingFormatted'] ?? '',
      slaPercentRemaining: json['slaPercentRemaining'] ?? 100,
      slaIsAtRisk: json['slaIsAtRisk'] ?? false,
      ageFormatted: json['ageFormatted'] ?? '',
      createdAt: json['created_at'] ?? '',
      resolutionNotes: json['resolution_notes'],
      comments: commentsList,
      history: historyList,
    );
  }
}
