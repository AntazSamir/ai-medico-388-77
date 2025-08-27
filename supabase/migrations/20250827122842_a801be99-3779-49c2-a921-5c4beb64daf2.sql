-- Clean up existing invalid sample data first
DELETE FROM public.symptoms;
DELETE FROM public.medicines; 
DELETE FROM public.medical_reports;
DELETE FROM public.prescriptions;
DELETE FROM public.family_members;
DELETE FROM public.profiles;

-- Create a proper test user for development
-- Note: In production, users should sign up through the app
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'authenticated',
  'authenticated',
  '$2a$10$V3WgYSULDRQaQ.e0TGY1u.QU1r.8TkJhV.y6.J.IKGX.7cXYW5.IW', -- password: 'password123'
  NOW(),
  NOW(),
  '',
  NOW(),
  '',
  NULL,
  '',
  '',
  NULL,
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"email": "test@example.com", "full_name": "Test User"}',
  FALSE,
  NOW(),
  NOW(),
  NULL,
  NULL,
  '',
  '',
  NULL,
  '',
  0,
  NULL,
  '',
  NULL,
  FALSE,
  NULL
);

-- Insert corresponding auth.identities record
INSERT INTO auth.identities (
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  '{"email": "test@example.com", "email_verified": true, "sub": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"}',
  'email',
  NOW(),
  NOW(),
  NOW()
);

-- Create user profile
INSERT INTO public.profiles (user_id, full_name, email, phone, date_of_birth) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Test User', 'test@example.com', '+1234567890', '1990-01-01');

-- Insert sample data with proper user ID
INSERT INTO public.family_members (id, user_id, name, relationship, date_of_birth, phone, email) VALUES
  ('11111111-1111-1111-1111-111111111111', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Sarah Johnson', 'Wife', '1985-03-15', '+1234567890', 'sarah@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Michael Johnson', 'Son', '2015-07-22', '', ''),
  ('33333333-3333-3333-3333-333333333333', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Emma Johnson', 'Daughter', '2018-12-10', '', '');

INSERT INTO public.prescriptions (id, user_id, family_member_id, doctor_name, prescription_date, notes) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '11111111-1111-1111-1111-111111111111', 'Dr. Smith', '2024-01-15', 'Regular medication for blood pressure'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '22222222-2222-2222-2222-222222222222', 'Dr. Brown', '2024-02-10', 'Antibiotic for ear infection');

INSERT INTO public.medicines (prescription_id, medication_name, dosage_morning, dosage_noon, dosage_afternoon, dosage_night, instructions, frequency, duration) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Lisinopril', 1, 0, 0, 0, 'Take with water in the morning', 'Once daily', '30 days'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Amoxicillin', 1, 0, 1, 0, 'Take every 12 hours', 'Twice daily', '10 days');

INSERT INTO public.medical_reports (id, user_id, report_type, patient_name, doctor_name, hospital_name, report_date) VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Blood Test', 'Test User', 'Dr. Johnson', 'City Hospital', '2024-03-01'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'X-Ray', 'Test User', 'Dr. Wilson', 'General Medical Center', '2024-03-15');

INSERT INTO public.symptoms (id, user_id, symptoms, severity, description) VALUES
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', ARRAY['headache', 'fatigue'], 6, 'Persistent headache for 3 days'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', ARRAY['fever', 'cough'], 7, 'Running fever for 2 days');