class CategoryModel {
  final int id;
  final String name;
  final String code;
  final String? description;
  final int defaultSlaHours;

  CategoryModel({
    required this.id,
    required this.name,
    required this.code,
    this.description,
    required this.defaultSlaHours,
  });

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    return CategoryModel(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      name: json['name'] ?? '',
      code: json['code'] ?? '',
      description: json['description'],
      defaultSlaHours: json['default_sla_hours'] ?? 48,
    );
  }
}
