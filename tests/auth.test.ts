import { describe, it, expect } from 'vitest';
import { validatePasswordStrength, hashPassword, verifyPassword } from '../src/lib/auth';
import { signUpSchema, signInSchema } from '../src/lib/validators/auth.schema';

describe('Authentication & Password Rules', () => {
  describe('Password Strength Validation', () => {
    it('accepts compliant passwords (>=9 chars, 1 upper, 1 lower, 1 special)', () => {
      expect(validatePasswordStrength('Admin@123!').valid).toBe(true);
      expect(validatePasswordStrength('Brightloop#2026').valid).toBe(true);
      expect(validatePasswordStrength('Valid$Pass9').valid).toBe(true);
    });

    it('rejects passwords shorter than 9 characters', () => {
      const result = validatePasswordStrength('Pass@1');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('at least 9 characters');
    });

    it('rejects passwords without an uppercase letter', () => {
      const result = validatePasswordStrength('password@123');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('uppercase');
    });

    it('rejects passwords without a lowercase letter', () => {
      const result = validatePasswordStrength('PASSWORD@123');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('lowercase');
    });

    it('rejects passwords without a special character', () => {
      const result = validatePasswordStrength('Password1234');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('special character');
    });
  });

  describe('Bcrypt Hashing', () => {
    it('hashes passwords and verifies matching strings', async () => {
      const password = 'SecretPassword@123';
      const hash = await hashPassword(password);

      expect(hash).not.toBe(password);
      expect(await verifyPassword(password, hash)).toBe(true);
      expect(await verifyPassword('WrongPassword@123', hash)).toBe(false);
    });
  });

  describe('Zod Auth Schemas', () => {
    it('validates signup schema strictly', () => {
      const valid = signUpSchema.safeParse({
        email: 'user@example.com',
        password: 'SecurePassword@123',
        firstName: 'Alex',
        lastName: 'Vance',
      });
      expect(valid.success).toBe(true);

      const invalidEmail = signUpSchema.safeParse({
        email: 'not-an-email',
        password: 'SecurePassword@123',
        firstName: 'Alex',
        lastName: 'Vance',
      });
      expect(invalidEmail.success).toBe(false);
    });

    it('validates signin schema', () => {
      expect(signInSchema.safeParse({ email: 'user@test.com', password: 'abc' }).success).toBe(true);
      expect(signInSchema.safeParse({ email: 'invalid', password: '' }).success).toBe(false);
    });
  });
});
