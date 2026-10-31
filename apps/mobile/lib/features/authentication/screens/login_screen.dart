import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../config/env.dart';
import '../../../core/constants/colors.dart';
import '../../../core/providers.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _deviceCodeController = TextEditingController(text: 'DEV-OFFICER-PERUR');
  final _secretKeyController = TextEditingController(text: 'poseidon-field-officer-key-32b!');
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void dispose() {
    _deviceCodeController.dispose();
    _secretKeyController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      await ref.read(sessionProvider.notifier).login(
            _deviceCodeController.text.trim(),
            _secretKeyController.text.trim(),
          );
      if (mounted) {
        context.go('/dashboard');
      }
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
      });
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _selectPresetDevice(String code) {
    final dev = Environment.defaultTestDevices[code];
    if (dev != null) {
      _deviceCodeController.text = code;
      _secretKeyController.text = dev['secret_key']!;
      setState(() => _errorMessage = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
            child: Form(
              key: _formKey,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // App Badge & Brand
                  Center(
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.primaryBlueSubtle,
                        shape: BoxShape.circle,
                        border: Border.all(color: AppColors.primaryBlue.withValues(alpha: 0.2), width: 2),
                      ),
                      child: const Icon(Icons.shield, size: 48, color: AppColors.primaryBlue),
                    ),
                  ),
                  const SizedBox(height: 20),
                  const Text(
                    'POSEIDON AI',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary,
                      letterSpacing: -0.5,
                    ),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Autonomous Relief & Field Ingestion Platform\nOffline-First Field Responder Client',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 13,
                      color: AppColors.textSecondary,
                      height: 1.4,
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Quick preset toggle for evaluation
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'SELECT ACTIVE PRE-REGISTERED CREDENTIALS:',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textMuted,
                            letterSpacing: 0.5,
                          ),
                        ),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            Expanded(
                              child: OutlinedButton(
                                onPressed: () => _selectPresetDevice('DEV-OFFICER-PERUR'),
                                style: OutlinedButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(vertical: 10),
                                  backgroundColor: _deviceCodeController.text == 'DEV-OFFICER-PERUR'
                                      ? AppColors.primaryBlueSubtle
                                      : Colors.transparent,
                                  side: BorderSide(
                                    color: _deviceCodeController.text == 'DEV-OFFICER-PERUR'
                                        ? AppColors.primaryBlue
                                        : AppColors.border,
                                  ),
                                ),
                                child: const Text('T1 Officer (Perur)', style: TextStyle(fontSize: 12)),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: OutlinedButton(
                                onPressed: () => _selectPresetDevice('DEV-CITIZEN-UKKADAM'),
                                style: OutlinedButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(vertical: 10),
                                  backgroundColor: _deviceCodeController.text == 'DEV-CITIZEN-UKKADAM'
                                      ? AppColors.primaryBlueSubtle
                                      : Colors.transparent,
                                  side: BorderSide(
                                    color: _deviceCodeController.text == 'DEV-CITIZEN-UKKADAM'
                                        ? AppColors.primaryBlue
                                        : AppColors.border,
                                  ),
                                ),
                                child: const Text('T3 Responder', style: TextStyle(fontSize: 12)),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Error notification
                  if (_errorMessage != null) ...[
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.criticalLight,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: AppColors.critical.withValues(alpha: 0.3)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.error_outline, color: AppColors.critical, size: 20),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              _errorMessage!,
                              style: const TextStyle(color: AppColors.critical, fontSize: 13),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],

                  // Form Fields
                  TextFormField(
                    controller: _deviceCodeController,
                    decoration: const InputDecoration(
                      labelText: 'Device Code Identifier',
                      prefixIcon: Icon(Icons.devices, color: AppColors.primaryBlue),
                      hintText: 'e.g. DEV-OFFICER-PERUR',
                    ),
                    validator: (v) => v == null || v.isEmpty ? 'Device code required' : null,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _secretKeyController,
                    obscureText: true,
                    decoration: const InputDecoration(
                      labelText: 'Pre-Shared Secret Key',
                      prefixIcon: Icon(Icons.key, color: AppColors.primaryBlue),
                      hintText: 'Cryptographic pre-shared key',
                    ),
                    validator: (v) => v == null || v.isEmpty ? 'Secret key required' : null,
                  ),
                  const SizedBox(height: 24),

                  // Login Button
                  ElevatedButton(
                    onPressed: _isLoading ? null : _handleLogin,
                    child: _isLoading
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : const Text('Authenticate Device & Enter'),
                  ),
                  const SizedBox(height: 14),

                  // Register Device Action
                  TextButton(
                    onPressed: () => context.push('/register-device'),
                    child: const Text(
                      'Register New Field Device Unit',
                      style: TextStyle(color: AppColors.primaryBlue, fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
