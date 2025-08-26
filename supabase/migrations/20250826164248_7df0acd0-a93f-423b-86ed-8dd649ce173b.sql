-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create family_members table
CREATE TABLE public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  date_of_birth DATE,
  phone TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create prescriptions table
CREATE TABLE public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  family_member_id UUID REFERENCES public.family_members(id) ON DELETE CASCADE,
  doctor_name TEXT,
  prescription_date DATE,
  notes TEXT,
  image_url TEXT,
  extracted_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create medicines table
CREATE TABLE public.medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID REFERENCES public.prescriptions(id) ON DELETE CASCADE NOT NULL,
  medication_name TEXT NOT NULL,
  dosage_morning INTEGER DEFAULT 0,
  dosage_noon INTEGER DEFAULT 0,
  dosage_afternoon INTEGER DEFAULT 0,
  dosage_night INTEGER DEFAULT 0,
  instructions TEXT,
  frequency TEXT,
  duration TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create medical_reports table
CREATE TABLE public.medical_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  family_member_id UUID REFERENCES public.family_members(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL,
  patient_name TEXT,
  doctor_name TEXT,
  hospital_name TEXT,
  report_date DATE,
  image_url TEXT,
  extracted_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create symptoms table
CREATE TABLE public.symptoms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  family_member_id UUID REFERENCES public.family_members(id) ON DELETE CASCADE,
  symptoms TEXT[] NOT NULL,
  severity INTEGER CHECK (severity >= 1 AND severity <= 10),
  description TEXT,
  analysis_result JSONB,
  analyzed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptoms ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for family_members
CREATE POLICY "Users can view their own family members" ON public.family_members
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own family members" ON public.family_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own family members" ON public.family_members
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own family members" ON public.family_members
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for prescriptions
CREATE POLICY "Users can view their own prescriptions" ON public.prescriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own prescriptions" ON public.prescriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prescriptions" ON public.prescriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prescriptions" ON public.prescriptions
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for medicines
CREATE POLICY "Users can view medicines for their prescriptions" ON public.medicines
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.prescriptions 
      WHERE prescriptions.id = medicines.prescription_id 
      AND prescriptions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert medicines for their prescriptions" ON public.medicines
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.prescriptions 
      WHERE prescriptions.id = medicines.prescription_id 
      AND prescriptions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update medicines for their prescriptions" ON public.medicines
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.prescriptions 
      WHERE prescriptions.id = medicines.prescription_id 
      AND prescriptions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete medicines for their prescriptions" ON public.medicines
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.prescriptions 
      WHERE prescriptions.id = medicines.prescription_id 
      AND prescriptions.user_id = auth.uid()
    )
  );

-- Create RLS policies for medical_reports
CREATE POLICY "Users can view their own medical reports" ON public.medical_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own medical reports" ON public.medical_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medical reports" ON public.medical_reports
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medical reports" ON public.medical_reports
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for symptoms
CREATE POLICY "Users can view their own symptoms" ON public.symptoms
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own symptoms" ON public.symptoms
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own symptoms" ON public.symptoms
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own symptoms" ON public.symptoms
  FOR DELETE USING (auth.uid() = user_id);

-- Create storage buckets for images
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('prescription-images', 'prescription-images', false),
  ('medical-reports', 'medical-reports', false),
  ('avatars', 'avatars', true);

-- Create storage policies for prescription images
CREATE POLICY "Users can upload their own prescription images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'prescription-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own prescription images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'prescription-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own prescription images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'prescription-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own prescription images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'prescription-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create storage policies for medical reports
CREATE POLICY "Users can upload their own medical report images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'medical-reports' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own medical report images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'medical-reports' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own medical report images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'medical-reports' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own medical report images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'medical-reports' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create storage policies for avatars (public)
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_family_members_updated_at
  BEFORE UPDATE ON public.family_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at
  BEFORE UPDATE ON public.prescriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medical_reports_updated_at
  BEFORE UPDATE ON public.medical_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();