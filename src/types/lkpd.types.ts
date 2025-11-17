// src/types/lkpd.types.ts
export interface LKPDProject {
  id: string;
  user_id: string;
  title: string;
  project_type: 'cylinder' | 'hemisphere' | 'cone' | 'composite';
  current_stage: 1 | 2 | 3 | 4 | 5 | 6;
  is_completed: boolean;
  started_at: string;
  completed_at?: string;
  last_auto_save: string;
}

export interface Stage1Data {
  project_goal: string;
  shape_importance: string;
  completed_at?: string;
}

export interface Stage2Data {
  sketch_images: string[];
  design_description: string;
  checklist: {
    sketch_clear: boolean;
    size_determined: boolean;
    easy_to_make: boolean;
    matches_goal: boolean;
  };
  completed_at?: string;
}

export interface Stage3Data {
  tinkercad_url?: string;
  diameter: number;
  radius: number;
  height: number;
  completed_at?: string;
}

export interface Stage4Data {
  stl_file?: {
    name: string;
    size: number;
    url: string;
    uploaded_at: string;
  } | undefined;
  challenges: string;
  completed_at?: string;
}

export interface Stage5Data {
  calculated_volume: number;
  surface_area: number;
  capacity: number;
  strengths: string;
  weaknesses: string;
  result_photos: string[];
  completed_at?: string;
}

export interface Stage6Data {
  learning_reflection: string;
  challenges: string;
  application: string;
  completedAt?: string;
}

export interface LKPDData {
  project: LKPDProject;
  stage1?: Stage1Data;
  stage2?: Stage2Data;
  stage3?: Stage3Data;
  stage4?: Stage4Data;
  stage5?: Stage5Data;
  stage6?: Stage6Data;
}

// Database Types
export interface LKPDSubmission {
  id: string;
  student_id: string;
  title: string;
  project_type: 'cylinder' | 'hemisphere' | 'cone' | 'composite';
  project_data: LKPDData;
  current_stage: 1 | 2 | 3 | 4 | 5 | 6;
  completed_stages: number[];
  is_completed: boolean;
  started_at: string;
  completed_at: string | null;
  submitted_at: string | null;
  last_auto_save: string;
  created_at: string;
  updated_at: string;
}

// File Upload Types
export interface FileUploadResult {
  url: string;
  path: string;
  name: string;
  size: number;
}