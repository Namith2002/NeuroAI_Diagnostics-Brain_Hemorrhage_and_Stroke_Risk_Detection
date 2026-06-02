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
            print(f"  Multi-label Probabilities:")
            print(f"    - Hemorrhage: {result['prob_hemorrhage']}% (Prob: {result['prob_hemorrhage']/100:.6f})")
            print(f"    - Subarachnoid (SAH): {result['prob_sah']}% (Prob: {result['prob_sah']/100:.6f})")
            print(f"    - Epidural (EDH): {result['prob_edh']}% (Prob: {result['prob_edh']/100:.6f})")
            print(f"    - Intraventricular (IVH): {result['prob_ivh']}% (Prob: {result['prob_ivh']/100:.6f})")
            print(f"    - Intraparenchymal (IPH): {result['prob_iph']}% (Prob: {result['prob_iph']/100:.6f})")
            print(f"    - Subdural (SDH): {result['prob_sdh']}% (Prob: {result['prob_sdh']/100:.6f})")
        except Exception as e:
            print(f"  ERROR: {str(e)}")
    else:
        print(f"\nPatient: {patient_id} - {template}")
        print(f"  File not found: {img_path}")

print("\n" + "="*70)
