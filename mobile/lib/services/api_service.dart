import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';
import '../models/ticket.dart';
import '../models/category.dart';

class ApiService {
  static const String _defaultAndroidUrl = 'http://10.0.2.2:5000/api';
  static const String _defaultWebOrDesktopUrl = 'http://localhost:5000/api';

  static String get baseUrl {
    if (kIsWeb) return _defaultWebOrDesktopUrl;
    if (Platform.isAndroid) return _defaultAndroidUrl;
    return _defaultWebOrDesktopUrl;
  }

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }

  static Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
  }

  static Future<void> clearAuth() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('user_profile');
  }

  static Future<Map<String, String>> _getHeaders() async {
    final token = await getToken();
    final headers = {'Content-Type': 'application/json'};
    if (token != null) {
      headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  // 1. Authentication
  static Future<UserModel> login(String email, String password) async {
    final uri = Uri.parse('$baseUrl/auth/login');
    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 200 && data['success'] == true) {
      final token = data['data']['token'] as String;
      final user = UserModel.fromJson(data['data']['user']);

      await saveToken(token);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user_profile', jsonEncode(user.toJson()));

      return user;
    } else {
      throw Exception(data['message'] ?? 'Authentication failed');
    }
  }

  static Future<UserModel?> getCurrentUser() async {
    try {
      final headers = await _getHeaders();
      final uri = Uri.parse('$baseUrl/auth/me');
      final response = await http.get(uri, headers: headers);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return UserModel.fromJson(data['data']);
      }
    } catch (_) {}
    return null;
  }

  // 2. Categories
  static Future<List<CategoryModel>> getCategories() async {
    final headers = await _getHeaders();
    final uri = Uri.parse('$baseUrl/categories');
    final response = await http.get(uri, headers: headers);

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final list = data['data'] as List<dynamic>;
      return list.map((c) => CategoryModel.fromJson(c)).toList();
    }
    throw Exception('Failed to load categories');
  }

  // 3. Tickets
  static Future<List<TicketModel>> getMyTickets({String? search, String? status}) async {
    final headers = await _getHeaders();
    final queryParams = <String, String>{};
    if (search != null && search.isNotEmpty) queryParams['search'] = search;
    if (status != null && status.isNotEmpty && status != 'ALL') queryParams['status'] = status;

    final uri = Uri.parse('$baseUrl/tickets/my').replace(queryParameters: queryParams);
    final response = await http.get(uri, headers: headers);

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final list = data['data'] as List<dynamic>;
      return list.map((t) => TicketModel.fromJson(t)).toList();
    }
    throw Exception('Failed to load tickets');
  }

  static Future<TicketModel> getTicketDetails(String id) async {
    final headers = await _getHeaders();
    final uri = Uri.parse('$baseUrl/tickets/$id');
    final response = await http.get(uri, headers: headers);

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return TicketModel.fromJson(data['data']);
    }
    throw Exception('Failed to load ticket details');
  }

  static Future<TicketModel> createTicket({
    required int categoryId,
    required String subject,
    required String description,
    required String priority,
  }) async {
    final headers = await _getHeaders();
    final uri = Uri.parse('$baseUrl/tickets');
    final response = await http.post(
      uri,
      headers: headers,
      body: jsonEncode({
        'category_id': categoryId,
        'subject': subject,
        'description': description,
        'priority': priority,
      }),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 201 && data['success'] == true) {
      return TicketModel.fromJson(data['data']);
    }
    throw Exception(data['message'] ?? 'Failed to create ticket');
  }

  static Future<void> addComment(String ticketId, String comment) async {
    final headers = await _getHeaders();
    final uri = Uri.parse('$baseUrl/tickets/$ticketId/comments');
    final response = await http.post(
      uri,
      headers: headers,
      body: jsonEncode({'comment': comment}),
    );

    if (response.statusCode != 201) {
      final data = jsonDecode(response.body);
      throw Exception(data['message'] ?? 'Failed to post comment');
    }
  }

  static Future<void> reopenTicket(String ticketId, String reason) async {
    final headers = await _getHeaders();
    final uri = Uri.parse('$baseUrl/tickets/$ticketId/reopen');
    final response = await http.post(
      uri,
      headers: headers,
      body: jsonEncode({'reason': reason}),
    );

    if (response.statusCode != 200) {
      final data = jsonDecode(response.body);
      throw Exception(data['message'] ?? 'Failed to reopen ticket');
    }
  }

  // 4. Dashboard Stats
  static Future<Map<String, dynamic>> getDashboardStats() async {
    final headers = await _getHeaders();
    final uri = Uri.parse('$baseUrl/dashboard/stats');
    final response = await http.get(uri, headers: headers);

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['data'] as Map<String, dynamic>;
    }
    throw Exception('Failed to fetch dashboard stats');
  }

  // 5. Notifications
  static Future<List<dynamic>> getNotifications() async {
    final headers = await _getHeaders();
    final uri = Uri.parse('$baseUrl/notifications');
    final response = await http.get(uri, headers: headers);

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['data'] as List<dynamic>;
    }
    return [];
  }
}
