class UserModel {
  final String id;
  final String name;
  final String email;
  final String role;
  final String? department;
  final String? phone;
  final String? avatarUrl;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.department,
    this.phone,
    this.avatarUrl,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      role: json['role'] ?? 'STUDENT',
      department: json['department'],
      phone: json['phone'],
      avatarUrl: json['avatarUrl'] ?? json['avatar_url'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'role': role,
      'department': department,
      'phone': phone,
      'avatarUrl': avatarUrl,
    };
  }
}
