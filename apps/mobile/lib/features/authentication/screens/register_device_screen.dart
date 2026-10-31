import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/colors.dart';
import '../../../core/providers.dart';

class RegisterDeviceScreen extends ConsumerStatefulWidget {
  const RegisterDeviceScreen({super.key});

  @override
  ConsumerState<RegisterDeviceScreen> createState() => _RegisterDeviceScreenState();
}

class _RegisterDeviceScreenState extends ConsumerState<RegisterDeviceScreen> {
  final _formKey = GlobalKey<FormState>();
  final _numericIdController = TextEditingController(text: '404');
  final _deviceCodeController = TextEditingController(text: 'DEV-FIELD-RESCUE-04');
  final _ownerNameController = TextEditingController(text: 'Sub-Inspector R. Ramesh (Relief Squad)');
  String _selectedRole = 'T1';
  bool _isLoading = false;
  String? _statusMessage;
  bool _isSuccess = false;

  @override
  void dispose() {
    _numericIdController.dispose();
    _deviceCodeController.dispose();
    _ownerNameController.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _statusMessage = null;
    });

    try {
      final authService = ref.read(authServiceProvider);
      // Generate a deterministic 32-byte secret key hex for device
      final seed = utf8.encode('poseidon-device-${_deviceCodeController.text.trim()}');
      final secretHex = sha256.convert(seed).toString();

      final success = await authService.registerDevice(
        numericId: int.parse(_numericIdController.text.trim()),
        deviceCode: _deviceCodeController.text.trim(),
        role: _selectedRole,
        secretKeyHex: secretHex,
        ownerName: _ownerNameController.text.trim(),
      );

      if (success) {
        setState(() {
          _isSuccess = true;
          _statusMessage = 'Device ${_deviceCodeController.text} successfully registered on POSEIDON backend.';
        });
      } else {
        setState(() {
          _isSuccess = false;
          _statusMessage = 'Registration rejected by backend.';
        });
      }
    } catch (e) {
      setState(() {
        _isSuccess = false;
        _statusMessage = 'Error: $e';
      });
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Register Field Device'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.primaryBlueSubtle,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.security, color: AppColors.primaryBlue),
                    SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Device registration assigns a hardware numeric ID, role authority tier, and cryptographically derives an HMAC pre-shared key.',
                        style: TextStyle(fontSize: 13, color: AppColors.textPrimary, height: 1.3),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              if (_statusMessage != null) ...[
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: _isSuccess ? AppColors.safeLight : AppColors.criticalLight,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: _isSuccess ? AppColors.safe : AppColors.critical),
                  ),
                  child: Text(
                    _statusMessage!,
                    style: TextStyle(
                      color: _isSuccess ? AppColors.safe : AppColors.critical,
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
                const SizedBox(height: 16),
              ],
              TextFormField(
                controller: _numericIdController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'Numeric ID (1-65535)'),
                validator: (v) {
                  final n = int.tryParse(v ?? '');
                  if (n == null || n < 1 || n > 65535) return 'Valid uint16 ID required';
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _deviceCodeController,
                decoration: const InputDecoration(labelText: 'Device Code Identifier'),
                validator: (v) => v == null || v.isEmpty ? 'Device code required' : null,
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                initialValue: _selectedRole,
                decoration: const InputDecoration(labelText: 'Authority Role'),
                items: const [
                  DropdownMenuItem(value: 'T1', child: Text('T1 — Field Officer / Command Unit')),
                  DropdownMenuItem(value: 'T3', child: Text('T3 — Citizen Volunteer / Field Responder')),
                ],
                onChanged: (v) => setState(() => _selectedRole = v ?? 'T1'),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _ownerNameController,
                decoration: const InputDecoration(labelText: 'Operator / Squad Name'),
                validator: (v) => v == null || v.isEmpty ? 'Operator name required' : null,
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _isLoading ? null : _handleRegister,
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : const Text('Register Device on Server'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
