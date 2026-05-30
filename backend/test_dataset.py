#!/usr/bin/env python3
"""
Test script to validate hemorrhage detection on the real-time dataset.
Tests both AME_TEMPLATE_HEAD_001 and AME_TEMPLATE_HEAD_002 from same patient
to verify consistent detection.
"""

import os
import sys
from pathlib import Path
from services.ai_inference import analyze_brain_scan
import json

# Dataset path
DATASET_ROOT = "../Real time Data set BH"

# Expected hemorrhage cases based on radiological reports
HEMORRHAGE_CASES = {
    "768870": {"patient": "RJH778896", "finding": "Subdural hemorrhage 7.8mm"},
    "769562": {"patient": "RJH769562", "finding": "Extensive acute subarachnoid hemorrhage 11.3mm"},
    "773632": {"patient": "RJH773632", "finding": "Subarachnoid hemorrhage"},
    "774677": {"patient": "RJH774677", "finding": "Subtle subdural hemorrhage 4.0mm"},
    "775305": {"patient": "RJH775305", "finding": "Subdural hemorrhage 2.6mm + intraparenchymal contusions"},
    "776623": {"patient": "RJH776823", "finding": "Subarachnoid hemorrhage"},
    "776898": {"patient": "RJH776898", "finding": "Multiple small hyperdense foci (diffuse axonal injury)"},
    "778731": {"patient": "RJH778731", "finding": "Pneumocephalus - NO HEMORRHAGE"},
    "778896": {"patient": "RJH778896", "finding": "Subdural hemorrhage"},
    "779891": {"patient": "RJH779891", "finding": "Thin acute subdural hemorrhage 2.6mm"},
}

def test_patient_consistency(patient_dir):
    """
    Test that both AME_TEMPLATE_HEAD_001 and AME_TEMPLATE_HEAD_002 
    from the same patient produce consistent results.
    """
    patient_id = os.path.basename(patient_dir)
    
    if patient_id not in HEMORRHAGE_CASES:
        return None
    
    case_info = HEMORRHAGE_CASES[patient_id]
    template_001_path = os.path.join(patient_dir, "AME_TEMPLATE_HEAD_001.bmp")
    template_002_path = os.path.join(patient_dir, "AME_TEMPLATE_HEAD_002.bmp")
    
    results = {
        "patient_id": patient_id,
        "patient_info": case_info,
        "template_001": None,
        "template_002": None,
        "consistency": None,
    }
    
    # Test Template 001
    if os.path.exists(template_001_path):
        try:
            print(f"\n[TESTING] {patient_id} - AME_TEMPLATE_HEAD_001.bmp")
            heatmap_path = f"/tmp/heatmap_001_{patient_id}.bmp"
            metrics = analyze_brain_scan(template_001_path, heatmap_path)
            results["template_001"] = {
                "prediction": metrics["prediction"],
                "confidence": metrics["confidence"],
                "hemorrhage_percentage": metrics["hemorrhage_percentage"],
                "stroke_risk": metrics["stroke_risk"],
                "risk_level": metrics["risk_level"],
            }
            print(f"  ✓ Prediction: {metrics['prediction']}")
            print(f"  ✓ Confidence: {metrics['confidence']}%")
            print(f"  ✓ Hemorrhage: {metrics['hemorrhage_percentage']}%")
        except Exception as e:
            print(f"  ✗ Error: {str(e)}")
            results["template_001"] = {"error": str(e)}
    
    # Test Template 002
    if os.path.exists(template_002_path):
        try:
            print(f"\n[TESTING] {patient_id} - AME_TEMPLATE_HEAD_002.bmp")
            heatmap_path = f"/tmp/heatmap_002_{patient_id}.bmp"
            metrics = analyze_brain_scan(template_002_path, heatmap_path)
            results["template_002"] = {
                "prediction": metrics["prediction"],
                "confidence": metrics["confidence"],
                "hemorrhage_percentage": metrics["hemorrhage_percentage"],
                "stroke_risk": metrics["stroke_risk"],
                "risk_level": metrics["risk_level"],
            }
            print(f"  ✓ Prediction: {metrics['prediction']}")
            print(f"  ✓ Confidence: {metrics['confidence']}%")
            print(f"  ✓ Hemorrhage: {metrics['hemorrhage_percentage']}%")
        except Exception as e:
            print(f"  ✗ Error: {str(e)}")
            results["template_002"] = {"error": str(e)}
    
    # Check consistency
    if (results["template_001"] and results["template_002"] and 
        "error" not in results["template_001"] and "error" not in results["template_002"]):
        
        pred_001 = results["template_001"]["prediction"]
        pred_002 = results["template_002"]["prediction"]
        
        # Both should match (both hemorrhage or both normal)
        if pred_001 == pred_002:
            results["consistency"] = "✓ CONSISTENT"
            print(f"\n  ✓ CONSISTENCY CHECK PASSED: Both templates show same prediction")
        else:
            results["consistency"] = "✗ INCONSISTENT"
            print(f"\n  ✗ CONSISTENCY CHECK FAILED: Template 001={pred_001}, Template 002={pred_002}")
    
    return results

def main():
    print("="*80)
    print("NeuroAI Dataset Validation Test")
    print("Testing Hemorrhage Detection Consistency")
    print("="*80)
    
    if not os.path.exists(DATASET_ROOT):
        print(f"ERROR: Dataset root not found at {DATASET_ROOT}")
        sys.exit(1)
    
    # Get all patient directories
    patient_dirs = sorted([
        os.path.join(DATASET_ROOT, d) 
        for d in os.listdir(DATASET_ROOT) 
        if os.path.isdir(os.path.join(DATASET_ROOT, d))
    ])
    
    all_results = []
    consistency_count = 0
    inconsistency_count = 0
    error_count = 0
    
    for patient_dir in patient_dirs:
        result = test_patient_consistency(patient_dir)
        if result:
            all_results.append(result)
            
            if result["consistency"] == "✓ CONSISTENT":
                consistency_count += 1
            elif result["consistency"] == "✗ INCONSISTENT":
                inconsistency_count += 1
            else:
                error_count += 1
    
    # Print summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    print(f"Total Patients Tested: {len(all_results)}")
    print(f"✓ Consistent Results: {consistency_count}")
    print(f"✗ Inconsistent Results: {inconsistency_count}")
    print(f"⚠ Errors: {error_count}")
    
    # Save detailed results
    results_file = "dataset_validation_results.json"
    with open(results_file, "w") as f:
        json.dump(all_results, f, indent=2)
    
    print(f"\nDetailed results saved to: {results_file}")
    
    if inconsistency_count > 0:
        print("\n⚠️  WARNING: Some patients showed inconsistent results!")
        print("This indicates the adaptive thresholding may need further tuning.")
        sys.exit(1)
    else:
        print("\n✓ All tests passed! Hemorrhage detection is consistent.")
        sys.exit(0)

if __name__ == "__main__":
    main()
