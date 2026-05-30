#!/usr/bin/env python3
"""Quick test of hemorrhage detection on real dataset"""

from services.ai_inference import analyze_brain_scan
import os

patients = [
    ('768870', 'AME_TEMPLATE_HEAD_001'),
    ('768870', 'AME_TEMPLATE_HEAD_002'),
    ('769562', 'AME_TEMPLATE_HEAD_001'),
    ('769562', 'AME_TEMPLATE_HEAD_002'),
]

print("="*70)
print("Testing Hemorrhage Detection on Real Dataset")
print("="*70)

for patient_id, template in patients:
    img_path = f'../Real time Data set BH/{patient_id}/{template}.bmp'
    heatmap_path = f'/tmp/heatmap_{patient_id}_{template}.bmp'
    
    if os.path.exists(img_path):
        try:
            print(f"\nPatient: {patient_id} - {template}")
            result = analyze_brain_scan(img_path, heatmap_path)
            print(f"  Prediction: {result['prediction']}")
            print(f"  Confidence: {result['confidence']}%")
            print(f"  Hemorrhage: {result['hemorrhage_percentage']}%")
            print(f"  Risk Level: {result['risk_level']}")
        except Exception as e:
            print(f"  ERROR: {str(e)}")
    else:
        print(f"\nPatient: {patient_id} - {template}")
        print(f"  File not found: {img_path}")

print("\n" + "="*70)
