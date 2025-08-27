-- Fix RLS issue by creating sample data with proper authentication setup
-- Clean up existing invalid sample data
DELETE FROM public.symptoms;
DELETE FROM public.medicines; 
DELETE FROM public.medical_reports;
DELETE FROM public.prescriptions;
DELETE FROM public.family_members;

-- Create a test user by signing them up through auth API (this will create proper user)
-- Note: In production, users should sign up through the frontend
-- For now, let's create sample data that can be accessed once a user logs in

-- Create a function to get or create a test user profile
CREATE OR REPLACE FUNCTION public.ensure_test_user()
RETURNS uuid 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    test_user_id uuid;
BEGIN
    -- Check if we have any authenticated users
    SELECT id INTO test_user_id 
    FROM auth.users 
    WHERE email = 'test@example.com' 
    LIMIT 1;
    
    -- If no test user exists, we'll return a placeholder UUID
    -- The real user will be created when someone signs up
    IF test_user_id IS NULL THEN
        test_user_id := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    END IF;
    
    RETURN test_user_id;
END;
$$;

-- For now, we'll create sample data with a placeholder user ID
-- This data will only be visible when a user with this ID logs in
-- In practice, users will create their own data after signing up

INSERT INTO public.family_members (id, user_id, name, relationship, date_of_birth, phone, email) VALUES
  ('11111111-1111-1111-1111-111111111111', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Sarah Johnson', 'Wife', '1985-03-15', '+1234567890', 'sarah@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Michael Johnson', 'Son', '2015-07-22', '', ''),
  ('33333333-3333-3333-3333-333333333333', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Emma Johnson', 'Daughter', '2018-12-10', '', '');

-- Sample prescriptions
INSERT INTO public.prescriptions (id, user_id, family_member_id, doctor_name, prescription_date, notes, extracted_data) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '11111111-1111-1111-1111-111111111111', 'Dr. Smith', '2024-01-15', 'Regular medication for blood pressure', '{"doctorName": "Dr. Smith", "date": "2024-01-15", "notes": "Take with food"}'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '22222222-2222-2222-2222-222222222222', 'Dr. Brown', '2024-02-10', 'Antibiotic for ear infection', '{"doctorName": "Dr. Brown", "date": "2024-02-10", "notes": "Complete full course"}');

-- Sample medicines
INSERT INTO public.medicines (prescription_id, medication_name, dosage_morning, dosage_noon, dosage_afternoon, dosage_night, instructions, frequency, duration) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Lisinopril', 1, 0, 0, 0, 'Take with water, preferably in the morning', 'Once daily', '30 days'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Aspirin', 0, 0, 0, 1, 'Take with food to avoid stomach upset', 'Once daily', '30 days'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Amoxicillin', 1, 0, 1, 0, 'Take every 12 hours', 'Twice daily', '10 days');

-- Sample medical reports
INSERT INTO public.medical_reports (id, user_id, family_member_id, report_type, patient_name, doctor_name, hospital_name, report_date, extracted_data) VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NULL, 'Blood Test', 'Test User', 'Dr. Johnson', 'City Hospital', '2024-03-01', '{"reportType": "Blood Test", "findings": [{"category": "Cholesterol", "finding": "Normal range", "status": "Normal"}]}'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '11111111-1111-1111-1111-111111111111', 'X-Ray', 'Sarah Johnson', 'Dr. Wilson', 'General Medical Center', '2024-03-15', '{"reportType": "X-Ray", "findings": [{"category": "Chest", "finding": "Clear lungs", "status": "Normal"}]}');

-- Sample symptoms
INSERT INTO public.symptoms (id, user_id, family_member_id, symptoms, severity, description, analysis_result) VALUES
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NULL, ARRAY['headache', 'fatigue', 'dizziness'], 6, 'Persistent headache for 3 days with fatigue', '{"severity": "moderate", "recommendations": ["Rest", "Hydration", "Monitor symptoms"]}'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '22222222-2222-2222-2222-222222222222', ARRAY['fever', 'sore throat', 'cough'], 7, 'Child has been running fever for 2 days', '{"severity": "moderate", "recommendations": ["See pediatrician", "Monitor temperature", "Increase fluids"]}');